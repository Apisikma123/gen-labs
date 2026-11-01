<?php

namespace App\Services\AI;

use App\Models\Module;
use App\Models\Simulation;
use App\Models\Experiment;
use App\Models\User;
use App\Exceptions\AiUsageProtectionException;
use Illuminate\Support\Facades\Log;

/**
 * Context-Aware Student AI Lab Assistant with Grounded Knowledge,
 * Real External Scientific Citations, Deterministic Calculations,
 * and 4 Explicit Answer States.
 */
class AITutorService
{
    private TutorScopeGuard $scopeGuard;
    private GeminiClient $gemini;
    private AiUsageProtectionService $protection;
    private InternalKnowledgeRetrievalService $internalRetrieval;
    private ScientificSearchService $scientificSearch;

    public const STATE_A = 'STATE_A'; // Verified by Internal Sources
    public const STATE_B = 'STATE_B'; // Supported by External Scientific Research
    public const STATE_C = 'STATE_C'; // General Scientific Explanation (Internal Missing)
    public const STATE_D = 'STATE_D'; // Out of Scope

    public const REFUSAL_STATE_D = 'Saya adalah asisten pembelajaran laboratorium GENLABS WBI. Saya berfokus pada modul praktikum, eksperimen, simulasi, konsep sains yang relevan, dan penggunaan platform. Ada eksperimen atau topik laboratorium yang ingin kamu pelajari?';
    public const DISCLAIMER_STATE_B = 'Penjelasan berikut didasarkan pada referensi ilmiah eksternal. Saya belum menemukan penjelasan spesifik tersebut dalam dokumentasi GENLABS WBI yang tersedia.';
    public const DISCLAIMER_STATE_C = 'Saya belum menemukan informasi spesifik ini dalam data GENLABS WBI yang tersedia. Secara umum, berdasarkan prinsip sains yang relevan, ';

    public function __construct(
        ?AiUsageProtectionService $protection = null,
        ?InternalKnowledgeRetrievalService $internalRetrieval = null,
        ?ScientificSearchService $scientificSearch = null
    ) {
        $this->scopeGuard = new TutorScopeGuard();
        $this->gemini = new GeminiClient();
        $this->protection = $protection ?? new AiUsageProtectionService();
        $this->internalRetrieval = $internalRetrieval ?? new InternalKnowledgeRetrievalService();
        $this->scientificSearch = $scientificSearch ?? new ScientificSearchService();
    }

    public function getProtection(): AiUsageProtectionService
    {
        return $this->protection;
    }

    public function getInternalRetrieval(): InternalKnowledgeRetrievalService
    {
        return $this->internalRetrieval;
    }

    public function getScientificSearch(): ScientificSearchService
    {
        return $this->scientificSearch;
    }

    /**
     * Main entry point for student questions.
     * Evaluates scope, retrieves internal evidence, queries external research if needed,
     * and produces structured answers with source provenance across the 4 explicit states.
     */
    public function answer(
        ?Module $module,
        string $question,
        array $simulationState = [],
        ?Simulation $simulation = null,
        ?Experiment $experiment = null,
        ?User $user = null,
        mixed $sessionId = null,
        array $history = []
    ): array {
        $moduleKey = $module?->slug ?? ($simulation?->slug ?? 'global_assistant');

        // ── STEP 0: Pre-flight Quota & Rate Limit Protection ──
        if ($user) {
            $preflight = $this->protection->preflightCheck($user, $question, $moduleKey);
            if ($preflight !== null) {
                if (!empty($preflight['is_duplicate'])) {
                    return [
                        'success' => true,
                        'state' => self::STATE_A,
                        'answer' => $preflight['cached_data']['answer'],
                        'sources' => $preflight['cached_data']['sources'] ?? [],
                        'in_scope' => true,
                        'suggestedFollowUp' => $this->suggestFollowUps([]),
                        'is_cached' => true,
                        'quota' => $this->protection->getUserUsage($user->id),
                    ];
                }

                throw new AiUsageProtectionException($preflight['status'], $preflight['json']);
            }
        }

        try {
            $context = $this->buildContext($module, $simulationState, $simulation, $experiment);

            // ── STEP 1: Scope Guard Check ──
            $scope = $this->scopeGuard->isQuestionInSimulatorScope($question, $context);

            if ($scope['verdict'] === 'out') {
                if ($user) {
                    $this->protection->recordScopeGuardRefusal($user->id);
                }
                return [
                    'success' => true,
                    'state' => self::STATE_D,
                    'answer' => self::REFUSAL_STATE_D,
                    'explanation' => 'Permintaan berada di luar cakupan pembelajaran laboratorium GENLABS WBI.',
                    'sources' => [],
                    'in_scope' => false,
                    'suggestedFollowUp' => [
                        'Eksperimen apa saja yang tersedia di GEN LABS?',
                        'Bagaimana cara memulai simulasi Hukum II Newton?',
                    ],
                    'quota' => $user ? $this->protection->getUserUsage($user->id) : null,
                ];
            }

            // ── STEP 2: Internal Knowledge Retrieval & Grounding ──
            $simSlug = $simulation?->slug ?? $module?->slug;
            $retrieval = $this->internalRetrieval->retrieve(
                $question,
                $user,
                $sessionId,
                $simSlug,
                $simulationState
            );

            // ── STEP 3: Handle Deterministic Calculations ──
            if (!empty($retrieval['calculation'])) {
                $calc = $retrieval['calculation'];
                $answerText = $calc['text'];
                $quotaState = null;
                if ($user) {
                    $quotaState = $this->protection->recordSuccess($user->id, $question, $answerText, 10, $moduleKey);
                }

                return [
                    'success' => true,
                    'state' => self::STATE_A,
                    'answer' => $answerText,
                    'explanation' => "Kalkulasi dihitung langsung menggunakan mesin simulasi deterministik GEN LABS model {$calc['formula']}.",
                    'sources' => $retrieval['sources'],
                    'in_scope' => true,
                    'suggestedFollowUp' => [
                        'Bagaimana jika nilai parameternya saya ubah?',
                        'Jelaskan penurunan rumus fisisnya',
                    ],
                    'quota' => $quotaState,
                ];
            }

            // ── STEP 4: Handle State A (Sufficient Internal Knowledge) ──
            if ($retrieval['is_sufficient']) {
                $answerText = $this->synthesizeInternalAnswer($question, $context, $retrieval, $history);
                $quotaState = null;
                if ($user) {
                    $quotaState = $this->protection->recordSuccess($user->id, $question, $answerText, 25, $moduleKey);
                }

                return [
                    'success' => true,
                    'state' => self::STATE_A,
                    'answer' => $answerText,
                    'explanation' => 'Informasi terverifikasi langsung dari dokumentasi kurikulum dan spesifikasi modul laboratorium GEN LABS WBI.',
                    'sources' => $retrieval['sources'],
                    'in_scope' => true,
                    'suggestedFollowUp' => $this->suggestFollowUps($context),
                    'quota' => $quotaState,
                ];
            }

            // ── STEP 5: State B / C (Internal Evidence Insufficient for Scientific Question) ──
            // Perform genuine external scientific search
            $externalCitations = [];
            try {
                $externalCitations = $this->scientificSearch->search($question, 3);
            } catch (\Throwable $e) {
                Log::warning('[AI_TUTOR_SEARCH_TIMEOUT_OR_ERROR]', ['error' => $e->getMessage()]);
                $externalCitations = [];
            }

            if (!empty($externalCitations)) {
                // ── STATE B: Answer Supported by External Scientific Research ──
                $answerText = $this->synthesizeExternalAnswer($question, $externalCitations, $history);
                $quotaState = null;
                if ($user) {
                    $quotaState = $this->protection->recordSuccess($user->id, $question, $answerText, 60, $moduleKey);
                }

                return [
                    'success' => true,
                    'state' => self::STATE_B,
                    'answer' => $answerText,
                    'explanation' => self::DISCLAIMER_STATE_B,
                    'sources' => $externalCitations,
                    'in_scope' => true,
                    'suggestedFollowUp' => [
                        'Bagaimana prinsip ini diterapkan dalam eksperimen praktikum?',
                        'Apa modul laboratorium di GEN LABS yang paling mendekati topik ini?',
                    ],
                    'quota' => $quotaState,
                ];
            }

            // ── STATE C: Internal Missing & General Scientific Explanation ──
            $answerText = $this->synthesizeGeneralScienceAnswer($question, $context, $history);
            $quotaState = null;
            if ($user) {
                $quotaState = $this->protection->recordSuccess($user->id, $question, $answerText, 20, $moduleKey);
            }

            return [
                'success' => true,
                'state' => self::STATE_C,
                'answer' => $answerText,
                'explanation' => 'Penjelasan ini merupakan teori umum dan belum memverifikasi perilaku spesifik simulasi GENLABS.',
                'sources' => [
                    [
                        'type' => 'general_science',
                        'id' => 'general_science_theory',
                        'title' => 'Prinsip Teori Sains Umum',
                        'publisher' => 'Fundamental Scientific Principles',
                        'url' => '#general-science',
                        'status' => 'unverified',
                        'excerpt' => 'Konsep sains teoritis umum di luar basis data modul aktif GEN LABS.',
                    ],
                ],
                'in_scope' => true,
                'suggestedFollowUp' => [
                    'Kamu sedang membahas modul atau eksperimen yang mana?',
                    'Bisa jelaskan variabel atau parameter yang ingin diamati?',
                ],
                'quota' => $quotaState,
            ];
        } catch (\Throwable $e) {
            if ($user) {
                $this->protection->releaseInflightLock($user->id);
            }
            throw $e;
        }
    }

    /**
     * Synthesize answer grounded in internal GEN LABS modules & documentation.
     */
    private function synthesizeInternalAnswer(string $question, array $context, array $retrieval, array $history = []): string
    {
        // 1. Try Gemini generation if configured and reachable
        if ($this->gemini->isConfigured()) {
            try {
                $contextJson = json_encode([
                    'activeContext' => $context,
                    'internalEvidence' => $retrieval['sources'],
                ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

                $systemPrompt = "Kamu adalah Asisten Pembelajaran Laboratorium Resmi GEN LABS WBI (Politeknik Wilmar Bisnis Indonesia). Jawab pertanyaan mahasiswa secara natural, jelas, dan pedagogis dalam bahasa Indonesia menggunakan bukti internal modul laboratorium yang disediakan. Kutip nama modul/eksperimen terkait dan jelaskan formula serta parameternya dengan tepat layaknya tutor sains interaktif.";
                $userMsg = "Internal Evidence:\n{$contextJson}\n\nPertanyaan Mahasiswa:\n{$question}";

                $geminiReply = $this->gemini->generate(
                    config('ai.model', 'gemini-3.5-flash-lite'),
                    $systemPrompt,
                    $userMsg,
                    (int) config('ai.max_tutor_output_tokens', 700),
                    0.2,
                    $history
                );

                if (!empty(trim($geminiReply))) {
                    return trim($geminiReply);
                }
            } catch (\Throwable $e) {
                Log::warning('[AI_TUTOR_GEMINI_FALLBACK]', ['error' => $e->getMessage()]);
            }
        }

        // 2. High-fidelity grounded template fallback
        $matched = $retrieval['matched_modules'][0] ?? null;
        $sim = $retrieval['matched_simulations'][0] ?? null;
        $title = $matched?->title ?? ($sim?->title ?? 'Modul Laboratorium GEN LABS');
        $desc = $matched?->description ?? ($sim?->description ?? 'Simulasi interaktif dengan telemetri deterministik.');
        $formula = $sim?->formula ?? '';

        $lines = [];
        $lines[] = "Berdasarkan materi terverifikasi pada modul **{$title}**:";
        $lines[] = "* **Deskripsi Konsep:** {$desc}";
        if ($formula) {
            $lines[] = "* **Formula Matematika:** $$ {$formula} $$";
        }
        if (!empty($matched?->learning_objectives)) {
            $objs = is_array($matched->learning_objectives) ? implode(', ', $matched->learning_objectives) : $matched->learning_objectives;
            $lines[] = "* **Tujuan Pembelajaran:** {$objs}";
        }
        if (!empty($retrieval['authorized_session'])) {
            $sess = $retrieval['authorized_session'];
            $lines[] = "* **Rekam Jejak Sesi Anda:** Tercatat progres kelengkapan sebesar **{$sess->progress}%**.";
        }
        $lines[] = "\nAnda dapat langsung menguji parameter modul ini melalui kanvas simulasi interaktif yang tersedia.";

        return implode("\n", $lines);
    }

    /**
     * Synthesize answer supported by external peer-reviewed scientific citations (State B).
     */
    private function synthesizeExternalAnswer(string $question, array $externalCitations, array $history = []): string
    {
        $topCitation = $externalCitations[0];
        $title = $topCitation['title'];
        $publisher = $topCitation['publisher'];
        $year = $topCitation['year'] ? " ({$topCitation['year']})" : '';
        $url = $topCitation['url'];

        // 1. Try Gemini generation if configured and reachable
        if ($this->gemini->isConfigured()) {
            try {
                $citationContext = json_encode($externalCitations, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                $systemPrompt = "Kamu adalah Asisten Laboratorium GEN LABS WBI. Jawab pertanyaan mahasiswa berdasarkan referensi literatur ilmiah eksternal yang tersedia. Awali jawaban dengan kalimat pengantar bahwa informasi ini didasarkan pada referensi ilmiah terverifikasi. Jelaskan konsep ilmiah secara runtut dan kontekstual.";
                $userMsg = "Scientific Citations:\n{$citationContext}\n\nPertanyaan Mahasiswa:\n{$question}";

                $geminiReply = $this->gemini->generate(
                    config('ai.model', 'gemini-3.5-flash-lite'),
                    $systemPrompt,
                    $userMsg,
                    (int) config('ai.max_tutor_output_tokens', 700),
                    0.2,
                    $history
                );

                if (!empty(trim($geminiReply))) {
                    return trim($geminiReply);
                }
            } catch (\Throwable $e) {
                Log::warning('[AI_TUTOR_GEMINI_FALLBACK_EXT]', ['error' => $e->getMessage()]);
            }
        }

        // 2. High-fidelity grounded template fallback
        $lines = [];
        $lines[] = self::DISCLAIMER_STATE_B . "\n";
        $lines[] = "Berdasarkan literatur ilmiah terkini dari *{$publisher}*{$year} mengenai topik ini:";
        $lines[] = "* **Publikasi Referensi:** \"{$title}\"";
        if (!empty($topCitation['snippet'])) {
            $lines[] = "* **Temuan Kunci:** {$topCitation['snippet']}";
        }
        $lines[] = "* **Tautan Sumber Resmi:** [Lihat Publikasi ({$publisher})]({$url})";
        $lines[] = "\nKonsep ilmiah ini menjelaskan prinsip kausalitas teoritis yang dapat membantu pemahaman eksperimen sains Anda di laboratorium.";

        return implode("\n", $lines);
    }

    /**
     * Synthesize general scientific theory explanation when internal data is missing (State C).
     */
    private function synthesizeGeneralScienceAnswer(string $question, array $context = [], array $history = []): string
    {
        // 1. Try Gemini generation if configured and reachable
        if ($this->gemini->isConfigured()) {
            try {
                $contextJson = !empty($context) ? json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : '';
                $systemPrompt = "Kamu adalah Asisten Pembelajaran Cerdas Laboratorium GEN LABS WBI (Politeknik Wilmar Bisnis Indonesia). Jawab pertanyaan pengguna secara ramah, terstruktur, ilmiah, dan mudah dipahami layaknya ChatGPT. Bantu pengguna memahami konsep sains, teknik informatika (TRPL), akuntansi perpajakan, pemasaran internasional, agribisnis hortikultura, fisika terapan, atau cara menggunakan platform simulasi laboratorium GEN LABS. Dukung percakapan multi-turn secara kontekstual.";
                $userMsg = $contextJson ? "Konteks Aktif:\n{$contextJson}\n\nPertanyaan Mahasiswa:\n{$question}" : "Pertanyaan Mahasiswa:\n{$question}";

                $geminiReply = $this->gemini->generate(
                    config('ai.model', 'gemini-3.5-flash-lite'),
                    $systemPrompt,
                    $userMsg,
                    (int) config('ai.max_tutor_output_tokens', 700),
                    0.2,
                    $history
                );

                if (!empty(trim($geminiReply))) {
                    return trim($geminiReply);
                }
            } catch (\Throwable $e) {
                Log::warning('[AI_TUTOR_GEMINI_FALLBACK_GEN]', ['error' => $e->getMessage()]);
            }
        }

        // 2. High-fidelity grounded template fallback
        return self::DISCLAIMER_STATE_C . "setiap fenomena atau konsep laboratorium dikaji melalui hubungan sebab-akibat, pengukuran variabel terikat, dan perumusan matematis yang konsisten.\n\nPenjelasan ini merupakan teori umum dan belum memverifikasi perilaku spesifik simulasi GENLABS.\n\nKamu sedang membahas modul atau eksperimen yang mana? Saya bisa membantu memeriksa konteks modul spesifik yang tersedia di katalog GEN LABS.";
    }

    private function buildContext(?Module $module, array $state, ?Simulation $sim, ?Experiment $exp): array
    {
        $objectives = $module?->learning_objectives;
        if (is_array($objectives)) {
            $objectives = implode('; ', $objectives);
        }

        $cleanState = $this->sanitizeState($state);

        return [
            'simulatorTitle' => substr($module?->title ?? ($sim?->title ?? 'Platform GEN LABS WBI'), 0, 80),
            'concept' => substr($sim?->title ?? ($module?->title ?? 'Sains Terapan'), 0, 80),
            'description' => substr($module?->description ?? '', 0, 250),
            'learningObjective' => substr((string) ($objectives ?? ''), 0, 200),
            'discipline' => substr($module?->discipline ?? '', 0, 40),
            'topic' => substr($module?->topic ?? '', 0, 60),
            'difficulty' => substr($module?->difficulty ?? 'Dasar', 0, 20),
            'targetAudience' => substr($module?->target_audience ?? 'Mahasiswa WBI', 0, 30),
            'formula' => substr($sim?->formula ?? '', 0, 80),
            'parameters' => $cleanState,
            'currentState' => $cleanState,
            'activeExperiment' => $exp ? [
                'title' => substr($exp->title ?? '', 0, 80),
                'objective' => substr($exp->objective ?? '', 0, 150),
                'target' => substr(is_array($exp->target) ? json_encode($exp->target) : (string) ($exp->target ?? ''), 0, 60),
            ] : null,
        ];
    }

    private function sanitizeState(array $rawState): array
    {
        $banned = ['password', 'token', 'secret', 'key', 'hash', 'auth', 'user', 'email', 'cookie', 'session', 'api'];
        $clean = [];
        $count = 0;

        foreach ($rawState as $k => $v) {
            if ($count >= 15) break;
            $lowerKey = strtolower((string) $k);

            foreach ($banned as $b) {
                if (str_contains($lowerKey, $b)) {
                    continue 2;
                }
            }

            if (is_scalar($v)) {
                $valStr = (string) $v;
                if (strlen($valStr) > 60) {
                    $valStr = substr($valStr, 0, 60);
                }
                $clean[substr((string) $k, 0, 40)] = is_numeric($v) ? (float) $v : $valStr;
                $count++;
            }
        }

        return $clean;
    }

    private function suggestFollowUps(array $ctx): array
    {
        $suggestions = [];
        if (!empty($ctx['formula'])) {
            $suggestions[] = 'Jelaskan rumus matematika simulasi ini';
        }
        if (!empty($ctx['activeExperiment'])) {
            $suggestions[] = 'Bagaimana cara mencapai target eksperimen?';
        }
        $suggestions[] = 'Bagaimana pengaruh perubahan parameter terhadap hasil?';
        $suggestions[] = 'Tunjukkan modul praktikum lain yang relevan';
        return array_slice($suggestions, 0, 3);
    }
}
