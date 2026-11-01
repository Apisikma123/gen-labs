<?php

namespace App\Http\Controllers;

use App\Models\LearningSession;
use App\Models\Module;
use App\Models\Simulation;
use App\Models\User;
use Illuminate\Http\Request;

class LearningSessionController extends Controller
{
    /**
     * Create or retrieve an active learning session for a module (PRD Section 13 & 26)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'module_id' => 'nullable',
            'simulation_id' => 'nullable',
            'initial_state' => 'nullable|array',
            'progress' => 'nullable|integer',
        ]);

        $module = null;
        if (!empty($validated['module_id'])) {
            $module = is_numeric($validated['module_id'])
                ? Module::find($validated['module_id'])
                : Module::where('slug', $validated['module_id'])->first();
        }

        // If module_id not provided but simulation_id is, resolve module through simulation
        if (!$module && !empty($validated['simulation_id'])) {
            $sim = is_numeric($validated['simulation_id'])
                ? Simulation::find($validated['simulation_id'])
                : Simulation::where('slug', $validated['simulation_id'])->first();

            if ($sim) {
                $module = $sim->modules()->first() ?? Module::first();
            }
        }

        if (!$module) {
            $module = Module::first();
        }

        if (!$module) {
            return response()->json([
                'success' => false,
                'message' => 'Belum ada modul yang terdaftar dalam sistem.',
            ], 404);
        }

        // Determine user (strict authentication required)
        $user = $request->user('sanctum') ?? $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Silakan login untuk memulai sesi belajar.',
            ], 401);
        }
        $userId = $user->id;

        // Check if an existing open session exists for this user and module
        $session = LearningSession::where('user_id', $userId)
            ->where('module_id', $module->id)
            ->latest('last_active_at')
            ->first();

        if (!$session) {
            $session = LearningSession::create([
                'user_id' => $userId,
                'module_id' => $module->id,
                'current_state' => $validated['initial_state'] ?? [],
                'progress' => $validated['progress'] ?? 0,
                'started_at' => now(),
                'last_active_at' => now(),
            ]);
        } else {
            $updates = ['last_active_at' => now()];
            if (!empty($validated['initial_state'])) {
                $updates['current_state'] = array_merge($session->current_state ?? [], $validated['initial_state']);
            }
            if (isset($validated['progress'])) {
                $updates['progress'] = max((int) $session->progress, (int) $validated['progress']);
            }
            $session->update($updates);
        }

        return response()->json([
            'success' => true,
            'session' => $session->load(['module.simulations', 'module.experiments']),
        ], 201);
    }

    /**
     * List sessions (PRD Section 17 & 27 History / Riwayat Belajar)
     */
    public function index(Request $request)
    {
        $user = $request->user('sanctum') ?? $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($request->has('id') && !empty($request->input('id'))) {
            return $this->show($request, $request->input('id'));
        }

        $query = LearningSession::with(['module.simulations'])->latest('last_active_at');

        // Normal students can only see their own sessions; admin can view all
        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        $perPage = max(1, min(50, (int) $request->input('per_page', $request->input('limit', 10))));
        $page = max(1, (int) $request->input('page', 1));

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'success' => true,
            'sessions' => $paginator->items(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ]);
    }

    /**
     * Get specific session details (Protected against IDOR)
     */
    public function show(Request $request, $id)
    {
        $user = $request->user('sanctum') ?? $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $session = LearningSession::with(['module.simulations', 'module.experiments.attempts', 'insights'])
            ->find($id);

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi belajar tidak ditemukan.',
            ], 404);
        }

        // Object-level authorization check
        if ($session->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak: Anda tidak memiliki akses ke sesi belajar ini.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'session' => $session,
        ]);
    }

    /**
     * Update session state on direct parameter manipulation or progress update (Protected against IDOR)
     */
    public function update(Request $request, $id)
    {
        $user = $request->user('sanctum') ?? $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $session = LearningSession::find($id);

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi belajar tidak ditemukan.',
            ], 404);
        }

        // Object-level authorization check
        if ($session->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak: Anda tidak memiliki hak untuk mengubah sesi belajar ini.',
            ], 403);
        }

        $data = [];
        if ($request->has('state')) {
            $data['current_state'] = $request->state;
        } elseif ($request->has('current_state')) {
            $data['current_state'] = $request->current_state;
        }

        if ($request->has('progress')) {
            $newProgress = (int) $request->progress;
            $data['progress'] = $newProgress;
            if ($newProgress >= 100 && !$session->completed_at) {
                $data['completed_at'] = now();
            }
        }
        $data['last_active_at'] = now();

        $session->update($data);

        return response()->json([
            'success' => true,
            'session' => $session->load(['module.simulations']),
        ]);
    }

    /**
     * Get insights for a session (Protected against IDOR)
     */
    public function insights(Request $request, $id)
    {
        $user = $request->user('sanctum') ?? $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $session = LearningSession::find($id);
        if (!$session) {
            return response()->json(['success' => false, 'message' => 'Sesi tidak ditemukan.'], 404);
        }

        // Object-level authorization check
        if ($session->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak: Anda tidak memiliki akses ke insights sesi ini.',
            ], 403);
        }

        $insights = $session->insights()->latest()->get();

        return response()->json([
            'success' => true,
            'insights' => $insights,
        ]);
    }
}
