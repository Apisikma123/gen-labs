<?php

namespace App\Services\Simulation;

use App\Models\Simulation;
use App\Models\Concept;

class SimulationService
{
    /**
     * Search simulations by query string across title, description, discipline, formula, and concepts
     */
    public function search(string $query)
    {
        $q = strtolower(trim($query));
        if (empty($q)) {
            return Simulation::with('concept')->get();
        }

        $results = Simulation::with('concept')
            ->where(function ($builder) use ($q) {
                $builder->whereRaw('LOWER(title) LIKE ?', ["%{$q}%"])
                    ->orWhereRaw('LOWER(type) LIKE ?', ["%{$q}%"])
                    ->orWhereRaw('LOWER(formula) LIKE ?', ["%{$q}%"])
                    ->orWhereRaw('LOWER(slug) LIKE ?', ["%{$q}%"]);
            })
            ->orderBy('usage_count', 'desc')
            ->get();

        if ($results->count() === 0) {
            $allSims = Simulation::with('concept')->get();
            $fuzzy = [];
            $tokens = preg_split('/[\s,\-_]+/', $q, -1, PREG_SPLIT_NO_EMPTY);

            foreach ($allSims as $sim) {
                $haystack = strtolower($sim->title . ' ' . $sim->slug . ' ' . $sim->type);
                $words = preg_split('/[\s,\-_]+/', $haystack, -1, PREG_SPLIT_NO_EMPTY);
                $isMatch = false;

                foreach ($tokens as $token) {
                    $tLen = strlen($token);
                    foreach ($words as $w) {
                        $wLen = strlen($w);
                        if (abs($wLen - $tLen) > 3) continue;
                        $dist = levenshtein($token, $w);
                        $maxAllowed = $tLen <= 4 ? 1 : ($tLen <= 7 ? 2 : 3);
                        if ($dist <= $maxAllowed) {
                            $isMatch = true;
                            break 2;
                        }
                    }
                }

                if ($isMatch) {
                    $fuzzy[] = $sim;
                }
            }

            return collect($fuzzy);
        }

        return $results;
    }

    /**
     * Prioritize REUSE before GENERATE (PRD Section 10 & 52)
     */
    public function findReuseCandidate(string $prompt): ?Simulation
    {
        $lower = strtolower(trim($prompt));

        // 1. Direct slug or title exact match
        $exact = Simulation::where(function ($b) use ($lower) {
                $b->whereRaw('LOWER(slug) = ?', [$lower])
                  ->orWhereRaw('LOWER(title) = ?', [$lower]);
            })
            ->first();

        if ($exact) {
            $exact->increment('usage_count');
            return $exact;
        }

        // 2. Keyword mapping for common student inquiries
        $keywordMap = [
            'newton' => 'newtons-second-law',
            'gaya' => 'newtons-second-law',
            'f = ma' => 'newtons-second-law',
            'percepatan' => 'newtons-second-law',
            'peluru' => 'projectile-motion',
            'parabola' => 'projectile-motion',
            'proyektil' => 'projectile-motion',
            'momentum' => 'momentum-collision',
            'tumbukan' => 'momentum-collision',
            'fungsi' => 'function-explorer',
            'parabola matematika' => 'function-explorer',
            'kuadratik' => 'function-explorer',
            'vektor' => 'vector-math',
            'dot product' => 'vector-math',
            'peluang' => 'probability-coin',
            'koin' => 'probability-coin',
            'probabilitas' => 'probability-coin',
            'sorting' => 'sorting-algorithms',
            'bubble sort' => 'sorting-algorithms',
            'quick sort' => 'sorting-algorithms',
            'pengurutan' => 'sorting-algorithms',
            'binary search' => 'binary-search',
            'pencarian biner' => 'binary-search',
            'graf' => 'graph-traversal',
            'bfs' => 'graph-traversal',
            'dfs' => 'graph-traversal',
            'regresi' => 'linear-regression',
            'ols' => 'linear-regression',
            'distribusi normal' => 'normal-distribution',
            'gauss' => 'normal-distribution',
            'bell curve' => 'normal-distribution',
            'supply' => 'supply-demand',
            'demand' => 'supply-demand',
            'penawaran' => 'supply-demand',
            'permintaan' => 'supply-demand',
            'pasar' => 'supply-demand',
            'bunga majemuk' => 'compound-interest',
            'compound interest' => 'compound-interest',
            'rule 72' => 'compound-interest',
            'ph' => 'ph-scale',
            'asam' => 'ph-scale',
            'basa' => 'ph-scale',
        ];

        foreach ($keywordMap as $kw => $slug) {
            if (str_contains($lower, $kw)) {
                $candidate = Simulation::where('slug', $slug)->first();
                if ($candidate) {
                    $candidate->increment('usage_count');
                    return $candidate;
                }
            }
        }

        // 2b. Fuzzy keyword match with typo tolerance
        $promptTokens = preg_split('/[\s,\-_.:;]+/', $lower, -1, PREG_SPLIT_NO_EMPTY);
        foreach ($keywordMap as $kw => $slug) {
            $kwTokens = preg_split('/[\s,\-_]+/', $kw, -1, PREG_SPLIT_NO_EMPTY);
            foreach ($promptTokens as $pToken) {
                $pLen = strlen($pToken);
                if ($pLen < 3) continue;
                foreach ($kwTokens as $kT) {
                    $kLen = strlen($kT);
                    if (abs($pLen - $kLen) > 2) continue;
                    $dist = levenshtein($pToken, $kT);
                    $maxDist = $pLen <= 4 ? 1 : 2;
                    if ($dist <= $maxDist) {
                        $candidate = Simulation::where('slug', $slug)->first();
                        if ($candidate) {
                            $candidate->increment('usage_count');
                            return $candidate;
                        }
                    }
                }
            }
        }

        // 3. Fallback partial text search
        $firstMatch = Simulation::where(function ($b) use ($lower) {
                $b->whereRaw('LOWER(title) LIKE ?', ["%{$lower}%"])
                  ->orWhereRaw('LOWER(type) LIKE ?', ["%{$lower}%"]);
            })
            ->first();

        if ($firstMatch) {
            $firstMatch->increment('usage_count');
            return $firstMatch;
        }

        return null;
    }
}
