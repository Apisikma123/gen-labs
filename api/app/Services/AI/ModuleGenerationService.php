<?php

namespace App\Services\AI;

use App\Models\Concept;
use App\Models\Simulation;
use App\Services\Simulation\SimulationService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ModuleGenerationService
{
    protected SimulationService $simulationService;

    public function __construct(SimulationService $simulationService)
    {
        $this->simulationService = $simulationService;
    }

    /**
     * Generate an academic module draft for admin authoring (PRD Section 4 & 5).
     * AI generates a DRAFT, never auto-published.
     */
    public function generateDraft(array $data): array
    {
        $topic = trim($data['topic'] ?? 'Hukum II Newton');
        $difficulty = $data['difficulty'] ?? 'basic';
        $targetAudience = $data['target'] ?? 'Umum / Pelajar';
        $instructions = $data['instructions'] ?? '';

        // 1. Check for Simulation REUSE first (Section 8)
        $reusedSimulation = $this->simulationService->findReuseCandidate($topic);

        // 2. Detect discipline & domain
        $domainInfo = $this->detectDomain($topic);
        $discipline = $domainInfo['discipline'];
        $type = $domainInfo['type'];

        // 3. Prepare or reuse simulation config
        $simulationData = null;
        $isReused = false;

        if ($reusedSimulation) {
            $isReused = true;
            $simulationData = [
                'id' => $reusedSimulation->id,
                'slug' => $reusedSimulation->slug,
                'title' => $reusedSimulation->title,
                'type' => $reusedSimulation->type,
                'formula' => $reusedSimulation->formula,
                'configuration' => $reusedSimulation->configuration,
                'is_reused' => true,
            ];
        } else {
            // Generate structured simulation configuration schema (no arbitrary React code)
            $simulationData = $this->generateSimulationSchema($topic, $type, $domainInfo);
        }

        // 4. Try LLM Provider if configured
        $llmDraft = $this->tryCallLLM($topic, $difficulty, $targetAudience, $instructions, $simulationData, $isReused);
        if ($llmDraft) {
            return $llmDraft;
        }

        // 5. High-quality structured fallback generator
        return $this->buildFallbackDraft($topic, $difficulty, $targetAudience, $domainInfo, $simulationData, $isReused);
    }

    /**
     * Detect domain, discipline, and canonical simulation type
     */
    protected function detectDomain(string $topic): array
    {
        $lower = strtolower($topic);

        if (str_contains($lower, 'pasar') || str_contains($lower, 'uang') || str_contains($lower, 'bunga') || str_contains($lower, 'ekonomi') || str_contains($lower, 'supply') || str_contains($lower, 'demand') || str_contains($lower, 'inflasi')) {
            return [
                'discipline' => 'Ekonomi',
                'type' => 'economics',
                'formula' => 'Q_d = Q_s',
                'primaryVar' => 'demandShift',
                'primaryVarLabel' => 'Pergeseran Permintaan',
                'unit' => '%',
            ];
        }

        if (str_contains($lower, 'sort') || str_contains($lower, 'algoritma') || str_contains($lower, 'biner') || str_contains($lower, 'graf') || str_contains($lower, 'tree') || str_contains($lower, 'search') || str_contains($lower, 'komputer')) {
            return [
                'discipline' => 'Informatika',
                'type' => 'computer-science',
                'formula' => 'T(n) = O(n \log n)',
                'primaryVar' => 'arraySize',
                'primaryVarLabel' => 'Ukuran Dataset (N)',
                'unit' => 'elemen',
            ];
        }

        if (str_contains($lower, 'fungsi') || str_contains($lower, 'parabola') || str_contains($lower, 'kuadratik') || str_contains($lower, 'integral') || str_contains($lower, 'turunan') || str_contains($lower, 'kalkulus') || str_contains($lower, 'vektor') || str_contains($lower, 'matematika')) {
            return [
                'discipline' => 'Matematika',
                'type' => 'math',
                'formula' => 'f(x) = ax^2 + bx + c',
                'primaryVar' => 'a',
                'primaryVarLabel' => 'Koefisien Kuadratik (a)',
                'unit' => '',
            ];
        }

        if (str_contains($lower, 'peluru') || str_contains($lower, 'proyektil') || str_contains($lower, 'parabola')) {
            return [
                'discipline' => 'Fisika',
                'type' => 'physics',
                'formula' => 'R = \frac{v_0^2 \sin(2\theta)}{g}',
                'primaryVar' => 'velocity',
                'primaryVarLabel' => 'Kecepatan Awal (v₀)',
                'unit' => 'm/s',
            ];
        }

        // Default: Fisika Dinamika (Newton, etc.)
        return [
            'discipline' => 'Fisika',
            'type' => 'physics',
            'formula' => 'F_{net} = m \cdot a',
            'primaryVar' => 'force',
            'primaryVarLabel' => 'Gaya Dorong (F)',
            'unit' => 'N',
        ];
    }

    /**
     * Generate controlled simulation configuration schema (Section 4, 5, 7)
     */
    protected function generateSimulationSchema(string $topic, string $type, array $domainInfo): array
    {
        $slug = Str::slug($topic . '-sim');

        return [
            'id' => null,
            'slug' => $slug,
            'title' => 'Simulasi ' . ucwords($topic),
            'type' => $type,
            'formula' => $domainInfo['formula'],
            'is_reused' => false,
            'configuration' => [
                'type' => $type,
                'concept' => Str::slug($topic),
                'title' => 'Simulasi ' . ucwords($topic),
                'formula' => $domainInfo['formula'],
                'variables' => [
                    [
                        'id' => $domainInfo['primaryVar'],
                        'label' => $domainInfo['primaryVarLabel'],
                        'unit' => $domainInfo['unit'],
                        'min' => 0,
                        'max' => 100,
                        'default' => 20,
                        'step' => 1,
                    ],
                    [
                        'id' => 'mass',
                        'label' => 'Massa Benda',
                        'unit' => 'kg',
                        'min' => 1,
                        'max' => 20,
                        'default' => 5,
                        'step' => 1,
                    ],
                ],
                'objects' => [
                    ['type' => 'box', 'id' => 'object'],
                ],
                'interactions' => ['slider', 'reset', 'step'],
            ],
        ];
    }

    /**
     * Fallback structured simulation draft builder (Pure Simulation Platform - Section 1, 3, 4)
     */
    protected function buildFallbackDraft(
        string $topic,
        string $difficulty,
        string $targetAudience,
        array $domainInfo,
        array $simulationData,
        bool $isReused
    ): array {
        $slug = Str::slug($topic);
        $title = ucwords($topic);

        $content = "Eksplorasi interaktif konsep {$topic}. Ubah variabel kontrol pada kanvas untuk mengamati dinamika sistem secara real-time dan buktikan rumusan {$domainInfo['formula']}.";

        return [
            'status' => 'draft',
            'is_draft' => true,
            'slug' => $slug,
            'title' => $title,
            'description' => "Simulasi interaktif {$topic}. Bereksperimen dengan parameter kontrol dan amati respon kanvas secara langsung.",
            'discipline' => $domainInfo['discipline'],
            'difficulty' => $difficulty,
            'target_audience' => $targetAudience,
            'learning_objectives' => [
                "Menganalisis hubungan proporsional antar variabel pada sistem {$topic}.",
                "Menguji respons instrumen simulasi terhadap variasi parameter secara mandiri.",
                "Menyelesaikan target kuantitatif pada sesi eksperimen.",
            ],
            'content' => $content,
            'simulation' => $simulationData,
            'is_reused_simulation' => $isReused,
            'reused_simulation_title' => $isReused ? $simulationData['title'] : null,
            'experiment' => [
                'title' => "Eksperimen: {$topic}",
                'objective' => "Atur parameter kontrol untuk mencapai respon target yang ditentukan dengan toleransi presisi.",
                'target' => [
                    'parameter' => $domainInfo['primaryVar'],
                    'targetValue' => 40.0,
                    'tolerance' => 0.05,
                    'unit' => $domainInfo['unit'],
                ],
                'rules' => [
                    'heldConstant' => ['controlParam'],
                ],
            ],
            'insight' => [
                'title' => "Intisari: {$topic}",
                'content' => "Pengendalian parameter input secara tepat membuktikan hubungan matematis {$domainInfo['formula']} secara empiris di lingkungan simulasi.",
            ],
            'comprehension_questions' => [
                [
                    'question' => "Bagaimana dampak kenaikan parameter {$domainInfo['primaryVarLabel']} terhadap stabilitas sistem?",
                    'hint' => "Lihat kembali rumusan \${$domainInfo['formula']}\$ dan pergerakan kanvas simulasi.",
                ],
            ],
        ];
    }

    /**
     * Attempt calling OpenAI or Gemini LLM if API Key is configured in environment
     */
    protected function tryCallLLM(
        string $topic,
        string $difficulty,
        string $targetAudience,
        string $instructions,
        array $simulationData,
        bool $isReused
    ): ?array {
        $openaiKey = env('OPENAI_API_KEY');
        $geminiKey = env('GEMINI_API_KEY');

        if (!$openaiKey && !$geminiKey) {
            return null;
        }

        try {
            $systemPrompt = <<<SYS
Anda adalah GEN LABS Universal Simulator Configuration Engine.
Tugas Anda adalah merumuskan STRUKTUR DEFINISI SIMULATOR INTERAKTIF untuk platform universal GEN LABS.
Bukan LMS, bukan modul kuliah, bukan teks panjang.
Sesuaikan kompleksitas penjelasan dan parameter dengan target audiens (SMP, SMA, SMK, Universitas, Profesional, Umum).
Output HARUS valid JSON murni tanpa markdown codeblock:
{
  "title": "Nama Konsep / Simulasi Singkat",
  "description": "Deskripsi singkat 1-2 kalimat fokus simulasi",
  "discipline": "Fisika|Matematika|Informatika|Akuntansi|Agribisnis|Ekonomi|Kimia",
  "difficulty": "basic|intermediate|advanced",
  "content": "Pengantar ringkas 1-2 kalimat untuk orientasi simulasi",
  "simulation": {
    "type": "physics|math|economics|cs|chemistry|universal",
    "concept": "concept-slug",
    "formula": "F = ma",
    "variables": [
      {"id": "var1", "label": "Label 1", "unit": "N", "min": 0, "max": 100, "default": 20, "step": 1}
    ],
    "objects": [{"type": "box", "id": "object"}]
  },
  "experiment": {
    "title": "Judul Eksperimen",
    "objective": "Target kuantitatif",
    "target": {
      "parameter": "var1",
      "targetValue": 8.0,
      "tolerance": 0.05,
      "unit": "satuan"
    }
  }
}
SYS;

            $userPrompt = "Topik: {$topic}\nTarget Sasaran: {$targetAudience}\nTingkat: {$difficulty}\nInstruksi Tambahan: {$instructions}\nSimulasi Terkait: " . ($isReused ? "Gunakan simulasi katalog '{$simulationData['title']}' (formula: {$simulationData['formula']})" : "Baru ({$simulationData['type']})");

            if ($geminiKey) {
                $gemini = new GeminiClient();
                $jsonText = $gemini->generate(
                    config('ai.model', 'gemini-2.5-flash'),
                    $systemPrompt,
                    $userPrompt . "\n\nRespond ONLY with valid JSON conforming to the schema.",
                    1200,
                    0.2
                );
                // Clean potential markdown json fences
                $cleanJson = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', trim($jsonText));
                $decoded = json_decode($cleanJson, true);
                if ($decoded && isset($decoded['title'])) {
                    $decoded['status'] = 'draft';
                    $decoded['is_draft'] = true;
                    $decoded['slug'] = Str::slug($decoded['title']);
                    $decoded['simulation'] = $decoded['simulation'] ?? $simulationData;
                    $decoded['is_reused_simulation'] = $isReused;
                    $decoded['reused_simulation_title'] = $isReused ? $simulationData['title'] : null;
                    return $decoded;
                }
            }

            if ($openaiKey) {
                $response = Http::withHeaders([
                    'Authorization' => "Bearer {$openaiKey}",
                    'Content-Type' => 'application/json',
                ])->timeout(20)->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'response_format' => ['type' => 'json_object'],
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userPrompt],
                    ],
                ]);

                if ($response->successful()) {
                    $jsonText = $response->json('choices.0.message.content');
                    $decoded = json_decode($jsonText, true);
                    if ($decoded && isset($decoded['title'])) {
                        $decoded['status'] = 'draft';
                        $decoded['is_draft'] = true;
                        $decoded['slug'] = Str::slug($decoded['title']);
                        $decoded['simulation'] = $simulationData;
                        $decoded['is_reused_simulation'] = $isReused;
                        $decoded['reused_simulation_title'] = $isReused ? $simulationData['title'] : null;
                        return $decoded;
                    }
                }
            }
        } catch (\Throwable $e) {
            // Log and gracefully fall back
        }

        return null;
    }
}
