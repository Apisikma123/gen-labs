<?php

namespace App\Services\AI;

use App\Models\Module;
use App\Models\Simulation;
use App\Models\Experiment;
use App\Models\LearningSession;
use App\Models\User;
use Illuminate\Support\Facades\Log;

/**
 * Internal Knowledge Retrieval & Grounding Service for GEN LABS WBI.
 * Searches internal curriculum modules, simulations, deterministic specs,
 * and user's own authorized experiment sessions.
 *
 * IDOR Protected: Authenticated users can only retrieve their own sessions.
 */
class InternalKnowledgeRetrievalService
{
    private const STOPWORDS = [
        'bagaimana', 'kenapa', 'mengapa', 'adalah', 'untuk', 'dengan', 'dalam', 'yang', 'pada',
        'atau', 'cara', 'kerja', 'disiplin', 'tanya', 'jelaskan', 'bisa', 'saat', 'saya', 'apa',
        'apakah', 'tentang', 'dong', 'tolong', 'berapa', 'seperti', 'dan', 'ini', 'itu',
    ];

    /**
     * Retrieve relevant internal knowledge, perform IDOR-safe session retrieval,
     * and calculate deterministic outputs when appropriate.
     */
    public function retrieve(
        string $question,
        ?User $user = null,
        mixed $sessionId = null,
        ?string $simSlug = null,
        array $state = []
    ): array {
        $q = trim($question);
        $cleanWords = $this->extractCleanWords($q);

        // 1. Retrieve Modules & Simulations
        $modules = $this->findMatchingModules($cleanWords, $simSlug);
        $simulations = $this->findMatchingSimulations($cleanWords, $simSlug);
        $experiments = $this->findMatchingExperiments($cleanWords, $modules);

        // 2. IDOR-Protected Session Retrieval
        $authorizedSession = null;
        $sessionAuthDenied = false;

        if (!empty($sessionId)) {
            $session = LearningSession::find($sessionId);
            if ($session) {
                if ($user && $session->user_id === $user->id) {
                    $authorizedSession = $session;
                } else {
                    $sessionAuthDenied = true;
                    Log::warning('[AI_RETRIEVAL_IDOR_PREVENTED]', [
                        'requested_session_id' => $sessionId,
                        'session_owner_id' => $session->user_id,
                        'authenticated_user_id' => $user?->id,
                    ]);
                }
            }
        }

        // 3. Deterministic Simulation Calculation Grounding
        $calculation = $this->evaluateDeterministicCalculation($q, $simSlug, $state, $simulations);

        // 4. Build Structured Citations
        $internalSources = [];

        foreach ($modules as $mod) {
            $internalSources[] = [
                'type' => 'internal',
                'id' => $mod->slug ?: (string) $mod->id,
                'title' => $mod->title,
                'publisher' => 'GEN LABS WBI Kurikulum',
                'url' => "/modules/" . ($mod->slug ?: $mod->id),
                'status' => 'verified',
                'excerpt' => mb_substr($mod->description ?? '', 0, 160),
            ];
        }

        foreach ($simulations as $sim) {
            // Avoid duplicate if module already cited
            $alreadyCited = false;
            foreach ($internalSources as $s) {
                if ($s['id'] === $sim->slug) {
                    $alreadyCited = true;
                    break;
                }
            }
            if (!$alreadyCited) {
                $internalSources[] = [
                    'type' => 'internal',
                    'id' => $sim->slug,
                    'title' => $sim->title,
                    'publisher' => 'GEN LABS WBI Laboratorium',
                    'url' => "/simulation/{$sim->slug}",
                    'status' => 'verified',
                    'excerpt' => $sim->formula ? "Rumus: {$sim->formula}" : 'Simulator Interaktif',
                ];
            }
        }

        if ($authorizedSession) {
            $internalSources[] = [
                'type' => 'internal',
                'id' => "session_{$authorizedSession->id}",
                'title' => "Catatan Eksperimen Sesi #{$authorizedSession->id}",
                'publisher' => 'Rekam Jejak Empiris Pengguna',
                'url' => "/history?tab=sessions",
                'status' => 'verified',
                'excerpt' => "Progres {$authorizedSession->progress}%, tercatat pada " . $authorizedSession->created_at?->format('d M Y H:i'),
            ];
        }

        // 5. Evaluate Sufficiency
        $isSufficient = $this->isEvidenceSufficient($q, $modules, $simulations, $calculation, $authorizedSession);

        return [
            'is_sufficient' => $isSufficient,
            'sources' => array_slice($internalSources, 0, 4),
            'matched_modules' => $modules,
            'matched_simulations' => $simulations,
            'matched_experiments' => $experiments,
            'authorized_session' => $authorizedSession,
            'session_auth_denied' => $sessionAuthDenied,
            'calculation' => $calculation,
        ];
    }

    private function extractCleanWords(string $text): array
    {
        $words = preg_split('/[^\p{L}\p{N}]+/u', mb_strtolower($text), -1, PREG_SPLIT_NO_EMPTY) ?: [];
        return array_values(array_filter(
            $words,
            fn($w) => mb_strlen($w) >= 3 && !in_array($w, self::STOPWORDS, true)
        ));
    }

    private function findMatchingModules(array $words, ?string $simSlug): array
    {
        $query = Module::where('status', 'published')->with('simulations', 'experiments');

        if ($simSlug) {
            $bySlug = (clone $query)->where('slug', $simSlug)->first();
            if ($bySlug) {
                return [$bySlug];
            }
        }

        if (empty($words)) {
            return [];
        }

        $query->where(function ($q) use ($words) {
            foreach ($words as $word) {
                $q->orWhere('title', 'like', "%{$word}%")
                  ->orWhere('slug', 'like', "%{$word}%")
                  ->orWhere('discipline', 'like', "%{$word}%")
                  ->orWhere('topic', 'like', "%{$word}%")
                  ->orWhere('description', 'like', "%{$word}%");
            }
        });

        return $query->take(3)->get()->all();
    }

    private function findMatchingSimulations(array $words, ?string $simSlug): array
    {
        if ($simSlug) {
            $sim = Simulation::where('slug', $simSlug)->first();
            if ($sim) {
                return [$sim];
            }
        }

        if (empty($words)) {
            return [];
        }

        $query = Simulation::query();
        $query->where(function ($q) use ($words) {
            foreach ($words as $word) {
                $q->orWhere('title', 'like', "%{$word}%")
                  ->orWhere('slug', 'like', "%{$word}%")
                  ->orWhere('formula', 'like', "%{$word}%");
            }
        });

        return $query->take(3)->get()->all();
    }

    private function findMatchingExperiments(array $words, array $modules): array
    {
        $experiments = [];
        foreach ($modules as $m) {
            if ($m->experiments) {
                foreach ($m->experiments as $exp) {
                    $experiments[] = $exp;
                }
            }
        }
        return array_slice($experiments, 0, 3);
    }

    /**
     * Deterministic simulation engine calculation grounding.
     * Never describe an AI-generated numerical estimate as an actual calculation.
     */
    private function evaluateDeterministicCalculation(string $q, ?string $simSlug, array $state, array $simulations): ?array
    {
        $lower = mb_strtolower($q);

        // Check for Newton's 2nd Law (acceleration, mass, force)
        $isNewton = $simSlug === 'newtons-second-law'
            || str_contains($lower, 'newton')
            || (str_contains($lower, 'percepatan') && (str_contains($lower, 'gaya') || str_contains($lower, 'massa')));

        if ($isNewton) {
            $force = isset($state['force']) ? (float)$state['force'] : (isset($state['F']) ? (float)$state['F'] : 20.0);
            $mass = isset($state['mass']) ? (float)$state['mass'] : (isset($state['m']) ? (float)$state['m'] : 5.0);
            $friction = (float)($state['friction'] ?? 0.0);

            // Extract numbers if present in student query e.g. "gaya 50 N massa 10 kg"
            if (preg_match('/gaya\s*(\d+(\.\d+)?)/i', $q, $mF)) {
                $force = (float) $mF[1];
            }
            if (preg_match('/massa\s*(\d+(\.\d+)?)/i', $q, $mM)) {
                $mass = (float) $mM[1];
            }

            $frictionForce = round($friction * $mass * 9.81, 2);
            $netForce = max(0.0, $force - $frictionForce);
            $acceleration = $mass > 0 ? round($netForce / $mass, 2) : 0.0;

            return [
                'type' => 'newtons_second_law',
                'formula' => 'a = F_net / m',
                'inputs' => ['force' => $force, 'mass' => $mass, 'friction' => $friction],
                'outputs' => [
                    'friction_force' => $frictionForce,
                    'net_force' => $netForce,
                    'acceleration' => $acceleration,
                ],
                'text' => "Berdasarkan mesin kalkulasi deterministik Hukum II Newton ($$ a = \\frac{F_{net}}{m} $$):\n* Gaya dorong (\$F): **{$force} N**\n* Gaya gesek (\$f_k): **{$frictionForce} N**\n* Gaya bersih (\$F_{net}): **{$netForce} N**\n* Massa benda (\$m): **{$mass} kg**\n* Hasil percepatan (\$a): **{$acceleration} m/s²**.",
            ];
        }

        // Check for Vector Mathematics (resultant, angle)
        $isVector = $simSlug === 'vector-math' || str_contains($lower, 'vektor') || str_contains($lower, 'resultan');
        if ($isVector) {
            $ax = (float)($state['ax'] ?? 4.0);
            $ay = (float)($state['ay'] ?? 3.0);
            $bx = (float)($state['bx'] ?? 2.0);
            $by = (float)($state['by'] ?? 5.0);

            $rx = $ax + $bx;
            $ry = $ay + $by;
            $magR = round(sqrt($rx * $rx + $ry * $ry), 2);
            $angleDeg = round(fmod(rad2deg(atan2($ry, $rx)) + 360, 360), 2);

            return [
                'type' => 'vector_resultant',
                'formula' => '|R| = sqrt(Rx^2 + Ry^2)',
                'inputs' => ['ax' => $ax, 'ay' => $ay, 'bx' => $bx, 'by' => $by],
                'outputs' => ['rx' => $rx, 'ry' => $ry, 'magnitude' => $magR, 'angle' => $angleDeg],
                'text' => "Berdasarkan kalkulasi vektor deterministik:\n* Komponen mendatar: \$R_x = A_x + B_x = {$ax} + {$bx} = {$rx} N\n* Komponen tegak: \$R_y = A_y + B_y = {$ay} + {$by} = {$ry} N\n* Besar resultan: |R| = \\sqrt{{$rx}^2 + {$ry}^2} = \\mathbf{{$magR}\\text{ N}}\n* Arah sudut terhadap sumbu X positif: **{$angleDeg}°**.",
            ];
        }

        return null;
    }

    private function isEvidenceSufficient(
        string $q,
        array $modules,
        array $simulations,
        ?array $calculation,
        ?LearningSession $session
    ): bool {
        if ($calculation !== null) {
            return true;
        }

        if ($session !== null) {
            return true;
        }

        $lower = mb_strtolower($q);

        // Check for unverifiable or missing-variable requests
        $unverifiableMarkers = ['tanpa variabel', 'tanpa data', 'eksperimen x', 'tidak diketahui', 'tanpa parameter', 'tanpa nilai'];
        foreach ($unverifiableMarkers as $uvm) {
            if (str_contains($lower, $uvm)) {
                return false;
            }
        }

        // Check for nonexistent feature queries (e.g. teleportasi, roket antariksa, dsb)
        $nonexistentMarkers = ['teleportasi', 'intergalaktik', 'time travel', 'mesin waktu', 'perjalanan waktu'];
        foreach ($nonexistentMarkers as $nem) {
            if (str_contains($lower, $nem)) {
                return false;
            }
        }

        // Generic broad science questions outside specific module catalog
        $externalTopics = ['relativistik', 'kecepatan cahaya', 'termodinamika', 'entropi', 'spektrofotometer', 'foton', 'kuantum'];
        foreach ($externalTopics as $ext) {
            if (str_contains($lower, $ext)) {
                return false;
            }
        }

        // Pure platform navigation or GEN LABS usage
        if ((str_contains($lower, 'cara menggunakan') || str_contains($lower, 'navigasi') || str_contains($lower, 'panduan'))
            && (str_contains($lower, 'genlabs') || str_contains($lower, 'gen labs') || str_contains($lower, 'platform') || str_contains($lower, 'wbi'))) {
            return true;
        }

        // Module matches: require specific distinctive words (ignore generic words)
        $genericWords = [
            'hukum', 'gerak', 'sains', 'teori', 'prinsip', 'model', 'sistem', 'konsep',
            'dasar', 'praktikum', 'modul', 'simulasi', 'nilai', 'eksplorasi', 'kurva',
            'rumus', 'fungsi', 'ekstrim', 'cara', 'hasil', 'data', 'uji', 'metode',
            'contoh', 'tabel', 'grafik', 'variabel', 'eksperimen', 'percobaan'
        ];

        foreach ($modules as $m) {
            $titleLower = mb_strtolower($m->title);
            if (str_contains($lower, $titleLower)) {
                return true;
            }
            $words = $this->extractCleanWords($m->title);
            $distinctiveWords = array_values(array_filter($words, fn($w) => !in_array($w, $genericWords, true)));

            $matchCount = 0;
            foreach ($distinctiveWords as $dw) {
                if (str_contains($lower, $dw)) {
                    $matchCount++;
                }
            }
            $threshold = count($distinctiveWords) >= 2 ? 2 : 1;
            if ($matchCount >= $threshold && count($distinctiveWords) > 0) {
                return true;
            }
        }

        foreach ($simulations as $s) {
            $sLower = mb_strtolower($s->title);
            if (str_contains($lower, $sLower)) {
                return true;
            }
        }

        return false;
    }
}
