<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\Simulation;
use App\Models\Experiment;
use App\Models\Insight;
use App\Models\Activity;
use App\Services\AI\ModuleGenerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminModuleController extends Controller
{
    protected ModuleGenerationService $generationService;

    public function __construct(ModuleGenerationService $generationService)
    {
        $this->generationService = $generationService;
    }

    /**
     * Admin AI Authoring: Generate structured DRAFT module (PRD Section 4, 15)
     * POST /api/admin/ai/generate-module
     * Response is STRICTLY a DRAFT. Never auto-published.
     */
    public function generateDraft(Request $request)
    {
        $validated = $request->validate([
            'topic' => 'required|string|max:255',
            'difficulty' => 'nullable|string|in:basic,intermediate,advanced,dasar,menengah,mahir',
            'target' => 'nullable|string|max:255',
            'instructions' => 'nullable|string|max:1000',
        ]);

        $draft = $this->generationService->generateDraft($validated);

        return response()->json([
            'success' => true,
            'status' => 'draft',
            'draft' => $draft,
            'message' => 'Draft modul berhasil dirumuskan oleh AI. Silakan tinjau dan edit sebelum menerbitkan.',
        ]);
    }

    /**
     * Admin AI Simulation Canvas Generator (Section 4, 6, 7)
     * POST /api/admin/simulations/generate
     * Returns: structured simulation configuration and draft. Never auto-publishes.
     */
    public function generateSimulationDraft(Request $request)
    {
        $validated = $request->validate([
            'prompt' => 'nullable|string|max:1000',
            'topic' => 'nullable|string|max:255',
            'difficulty' => 'nullable|string',
        ]);

        $prompt = $validated['prompt'] ?? $validated['topic'] ?? 'Hukum II Newton';
        $draft = $this->generationService->generateDraft([
            'topic' => $prompt,
            'difficulty' => $validated['difficulty'] ?? 'basic',
            'instructions' => $prompt,
        ]);

        return response()->json([
            'success' => true,
            'status' => 'draft',
            'simulation' => $draft['simulation'],
            'draft' => $draft,
            'message' => 'Konfigurasi kanvas simulasi berhasil dirumuskan AI. Silakan tinjau dan publish.',
        ]);
    }

    /**
     * List all modules for Admin review (draft, published, archived) (PRD Section 18)
     * GET /api/admin/modules
     */
    public function index(Request $request)
    {
        $query = Module::with(['simulations', 'creator', 'experiments'])
            ->orderBy('updated_at', 'desc');

        if ($request->has('status') && $request->status !== 'all' && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        if ($request->has('discipline') && $request->discipline !== 'all' && !empty($request->discipline)) {
            $d = trim($request->discipline);
            $query->where(function ($q) use ($d) {
                $q->where('discipline', 'like', "%{$d}%")
                  ->orWhere('topic', 'like', "%{$d}%");
            });
        }

        if ($request->has('search') && !empty($request->search)) {
            $s = strtolower(trim($request->search));
            $query->where(function ($b) use ($s) {
                $b->whereRaw('LOWER(title) LIKE ?', ["%{$s}%"])
                  ->orWhereRaw('LOWER(description) LIKE ?', ["%{$s}%"])
                  ->orWhereRaw('LOWER(discipline) LIKE ?', ["%{$s}%"])
                  ->orWhereRaw('LOWER(COALESCE(topic, "")) LIKE ?', ["%{$s}%"]);
            });
        }

        $perPage = max(1, min(100, (int) $request->input('per_page', $request->input('limit', 10))));
        $page = max(1, (int) $request->input('page', 1));

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'success' => true,
            'modules' => $paginator->items(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'has_more' => $paginator->hasMorePages(),
            ],
            'stats' => [
                'total' => Module::count(),
                'published' => Module::where('status', 'published')->count(),
                'draft' => Module::where('status', 'draft')->count(),
                'archived' => Module::where('status', 'archived')->count(),
            ],
        ]);
    }

    /**
     * Store new module (manual or from approved draft) (PRD Section 4 & 5)
     * POST /api/admin/modules
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:150',
            'description' => 'nullable|string',
            'cover_image' => 'nullable|string|max:500',
            'thumbnail_image' => 'nullable|string|max:500',
            'ai_thumbnail' => 'nullable|boolean',
            'content' => 'nullable|string',
            'learning_objectives' => 'nullable|array',
            'discipline' => 'nullable|string|max:100',
            'topic' => 'nullable|string|max:150',
            'difficulty' => 'nullable|string|max:50',
            'estimated_time' => 'nullable|string|max:50',
            'target_audience' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:draft,published,archived',
            'simulation_id' => 'nullable|integer',
            'simulation_slug' => 'nullable|string',
            'experiment' => 'nullable|array',
        ]);

        $slug = !empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['title']);

        // Prevent slug collision
        $originalSlug = $slug;
        $counter = 1;
        while (Module::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $status = $validated['status'] ?? 'draft';
        $publishedAt = ($status === 'published') ? now() : null;

        $module = Module::create([
            'slug' => $slug,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'cover_image' => $validated['cover_image'] ?? null,
            'thumbnail_image' => $validated['thumbnail_image'] ?? null,
            'ai_thumbnail' => (bool) ($validated['ai_thumbnail'] ?? false),
            'content' => $validated['content'] ?? '',
            'learning_objectives' => $validated['learning_objectives'] ?? [],
            'discipline' => $validated['discipline'] ?? 'Fisika',
            'topic' => $validated['topic'] ?? null,
            'difficulty' => $validated['difficulty'] ?? 'basic',
            'estimated_time' => $validated['estimated_time'] ?? '10–15 menit',
            'target_audience' => $validated['target_audience'] ?? 'Mahasiswa Semester 1',
            'status' => $status,
            'created_by' => $request->user()?->id,
            'published_at' => $publishedAt,
        ]);

        // Link simulation if provided
        if (!empty($validated['simulation_id'])) {
            $module->simulations()->syncWithoutDetaching([
                $validated['simulation_id'] => ['order' => 1],
            ]);
        } elseif (!empty($validated['simulation_slug'])) {
            $sim = Simulation::where('slug', $validated['simulation_slug'])->first();
            if ($sim) {
                $module->simulations()->syncWithoutDetaching([
                    $sim->id => ['order' => 1],
                ]);
            }
        }

        // Attach experiment challenge if provided
        if (!empty($validated['experiment'])) {
            $expData = $validated['experiment'];
            $firstSim = $module->simulations()->first();

            Experiment::create([
                'module_id' => $module->id,
                'simulation_id' => $firstSim?->id,
                'title' => $expData['title'] ?? 'Eksperimen Pemahaman',
                'objective' => $expData['objective'] ?? 'Buktikan pemahamanmu dengan mencapai parameter target.',
                'target' => $expData['target'] ?? [
                    'parameter' => 'acceleration',
                    'targetValue' => 8.0,
                    'tolerance' => 0.05,
                    'unit' => '',
                ],
                'rules' => $expData['rules'] ?? [],
                'status' => 'in_progress',
            ]);
        }

        Module::bumpCatalogCache();
        Activity::record($status === 'published' ? 'Menerbitkan modul' : 'Membuat modul baru', "{$module->title} [{$status}]");

        return response()->json([
            'success' => true,
            'module' => $module->load(['simulations', 'experiments']),
            'message' => $status === 'published' ? 'Modul berhasil diterbitkan dan siap dieksplorasi.' : 'Draft modul berhasil disimpan.',
        ], 201);
    }

    /**
     * Update module (Edit content, preview, publish, archive) (PRD Section 5 & 18)
     * PATCH /api/admin/modules/{id}
     */
    public function update(Request $request, $id)
    {
        $module = is_numeric($id) ? Module::find($id) : Module::where('slug', $id)->first();
        if (!$module) {
            return response()->json(['success' => false, 'message' => 'Modul tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'cover_image' => 'nullable|string|max:500',
            'thumbnail_image' => 'nullable|string|max:500',
            'ai_thumbnail' => 'nullable|boolean',
            'content' => 'nullable|string',
            'learning_objectives' => 'nullable|array',
            'discipline' => 'nullable|string|max:100',
            'topic' => 'nullable|string|max:150',
            'difficulty' => 'nullable|string|max:50',
            'estimated_time' => 'nullable|string|max:50',
            'target_audience' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:draft,published,archived',
            'version' => 'nullable|integer',
            'simulation_id' => 'nullable|integer',
        ]);

        if (isset($validated['status'])) {
            if ($validated['status'] === 'published' && $module->status !== 'published') {
                $validated['published_at'] = now();
                $validated['version'] = ($module->version ?? 1) + 1;
            }
        }

        $module->update(array_filter($validated, fn($val) => $val !== null));

        if (!empty($validated['simulation_id'])) {
            $module->simulations()->sync([
                $validated['simulation_id'] => ['order' => 1],
            ]);
        }

        Module::bumpCatalogCache();
        Activity::record('Memperbarui modul', "{$module->title} [{$module->status}]");

        return response()->json([
            'success' => true,
            'module' => $module->fresh(['simulations', 'experiments']),
            'message' => 'Modul berhasil diperbarui.',
        ]);
    }

    /**
     * Delete module (PRD Section 15)
     * DELETE /api/admin/modules/{id}
     */
    public function destroy($id)
    {
        $module = is_numeric($id) ? Module::find($id) : Module::where('slug', $id)->first();
        if (!$module) {
            return response()->json(['success' => false, 'message' => 'Modul tidak ditemukan.'], 404);
        }

        Activity::record('Menghapus modul', "{$module->title}");

        Module::bumpCatalogCache();
        $module->delete();

        return response()->json([
            'success' => true,
            'message' => 'Modul berhasil dihapus.',
        ]);
    }
}
