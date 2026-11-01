<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\Simulation;
use App\Models\Experiment;
use App\Models\ExperimentAttempt;
use App\Models\Question;
use App\Models\Insight;
use App\Services\AI\AITutorService;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    protected AITutorService $tutorService;

    public function __construct(AITutorService $tutorService)
    {
        $this->tutorService = $tutorService;
    }

    /**
     * List published modules for students (PRD Section 9, 14, 15)
     */
    public function index(Request $request)
    {
        $query = Module::where('status', 'published')
            ->orderBy('published_at', 'desc')
            ->orderBy('id', 'desc');

        if ($request->has('discipline') && $request->discipline !== 'all' && !empty($request->discipline)) {
            $d = trim($request->discipline);
            $query->where(function ($q) use ($d) {
                $q->where('discipline', 'like', "%{$d}%")
                  ->orWhere('topic', 'like', "%{$d}%");
            });
        }

        if ($request->has('difficulty') && $request->difficulty !== 'all' && !empty($request->difficulty)) {
            $query->where('difficulty', $request->difficulty);
        }

        if ($request->has('topic') && $request->topic !== 'all' && !empty($request->topic)) {
            $query->where('topic', $request->topic);
        }

        if ($request->has('education_level') && $request->education_level !== 'all' && !empty($request->education_level)) {
            $level = trim($request->education_level);
            $query->where(function ($q) use ($level) {
                $q->where('education_level', $level)
                  ->orWhereHas('curriculumAlignments', function ($ca) use ($level) {
                      $ca->where('education_level', $level);
                  });
            });
        }

        if ($request->has('curriculum_phase') && $request->curriculum_phase !== 'all' && !empty($request->curriculum_phase)) {
            $phase = trim($request->curriculum_phase);
            $query->where(function ($q) use ($phase) {
                $q->where('curriculum_phase', $phase)
                  ->orWhereHas('curriculumAlignments', function ($ca) use ($phase) {
                      $ca->where('curriculum_phase', $phase);
                  });
            });
        }

        if ($request->has('grade_level') && $request->grade_level !== 'all' && !empty($request->grade_level)) {
            $rawGrade = trim($request->grade_level);
            $romanMap = [
                'VII' => '7', 'VIII' => '8', 'IX' => '9',
                'X' => '10', 'XI' => '11', 'XII' => '12',
                '7' => 'VII', '8' => 'VIII', '9' => 'IX',
                '10' => 'X', '11' => 'XI', '12' => 'XII',
            ];
            $mapped = $romanMap[strtoupper($rawGrade)] ?? $rawGrade;
            $candidates = array_unique([$rawGrade, $mapped, strtoupper($rawGrade), strtolower($rawGrade)]);

            $query->where(function ($q) use ($candidates) {
                $q->whereIn('grade_level', $candidates)
                  ->orWhereHas('curriculumAlignments', function ($ca) use ($candidates) {
                      $ca->whereIn('grade_level', $candidates);
                  });
            });
        }

        if ($request->has('study_program') && $request->study_program !== 'all' && !empty($request->study_program)) {
            $sp = trim($request->study_program);
            $query->whereHas('curriculumAlignments', function ($ca) use ($sp) {
                $ca->where(function ($sub) use ($sp) {
                    $sub->where('official_source_code', 'like', "%{$sp}%")
                        ->orWhere('curriculum_version', 'like', "%{$sp}%")
                        ->orWhere('subject_or_course', 'like', "%{$sp}%")
                        ->orWhere('chapter_or_unit', 'like', "%{$sp}%")
                        ->orWhere('study_program', 'like', "%{$sp}%");
                });
            });
        }

        if ($request->has('semester') && $request->semester !== 'all' && !empty($request->semester)) {
            $sem = (int) $request->semester;
            $semStr = "semester_{$sem}";
            $query->whereHas('curriculumAlignments', function ($ca) use ($sem, $semStr) {
                $ca->where('semester', $sem)
                   ->orWhere('grade_level', $semStr);
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

        $query->with([
            'simulations' => function ($sq) {
                $sq->select('simulations.id', 'simulations.title', 'simulations.slug', 'simulations.type', 'simulations.difficulty');
            }
        ]);

        $perPage = max(1, min(100, (int) $request->input('per_page', $request->input('limit', 12))));
        $page = max(1, (int) $request->input('page', 1));

        $catalogColumns = [
            'id', 'slug', 'title', 'description', 'cover_image', 'thumbnail_image',
            'ai_thumbnail', 'discipline', 'topic', 'difficulty', 'estimated_time',
            'target_audience', 'education_level', 'grade_level', 'status',
            'published_at', 'created_at', 'updated_at',
        ];

        $catalogVer = \Illuminate\Support\Facades\Cache::get('modules_catalog_ver', 1);
        $cacheKey = "catalog_modules_v{$catalogVer}_" . md5(json_encode($request->all()));

        $responsePayload = \Illuminate\Support\Facades\Cache::remember($cacheKey, 60, function () use ($query, $perPage, $catalogColumns, $page, $request) {
            $paginator = $query->paginate($perPage, $catalogColumns, 'page', $page);

            // Fuzzy search fallback when exact LIKE returns zero results for a query
            if ($request->has('search') && !empty($request->search) && $paginator->total() === 0) {
            $s = strtolower(trim($request->search));
            $fuzzyQuery = Module::where('status', 'published')->with(['simulations', 'curriculumAlignments']);
            if ($request->has('discipline') && $request->discipline !== 'all' && !empty($request->discipline)) {
                $d = trim($request->discipline);
                $fuzzyQuery->where(function ($q) use ($d) {
                    $q->where('discipline', 'like', "%{$d}%")
                      ->orWhere('topic', 'like', "%{$d}%");
                });
            }
            if ($request->has('difficulty') && $request->difficulty !== 'all' && !empty($request->difficulty)) {
                $fuzzyQuery->where('difficulty', $request->difficulty);
            }
            if ($request->has('education_level') && $request->education_level !== 'all' && !empty($request->education_level)) {
                $lvl = $request->education_level;
                $fuzzyQuery->where(function ($q) use ($lvl) {
                    $q->where('education_level', $lvl)
                      ->orWhereHas('curriculumAlignments', function ($ca) use ($lvl) {
                          $ca->where('education_level', $lvl);
                      });
                });
            }

            $candidates = $fuzzyQuery->get();
            $scored = [];
            $tokens = preg_split('/[\s,\-_]+/', $s, -1, PREG_SPLIT_NO_EMPTY);

            foreach ($candidates as $mod) {
                $textFields = [
                    'title' => strtolower($mod->title ?? ''),
                    'slug' => strtolower(str_replace(['-', '_'], ' ', $mod->slug ?? '')),
                    'discipline' => strtolower($mod->discipline ?? ''),
                    'topic' => strtolower($mod->topic ?? ''),
                    'description' => strtolower($mod->description ?? ''),
                ];

                $modScore = 0;
                $matchedTokens = 0;

                foreach ($tokens as $token) {
                    $tLen = strlen($token);
                    $bestScore = 0;

                    foreach ($textFields as $field => $content) {
                        $weight = match($field) {
                            'title' => 4.0,
                            'slug' => 3.0,
                            'topic', 'discipline' => 2.0,
                            default => 1.0,
                        };

                        if (str_contains($content, $token)) {
                            $bestScore = max($bestScore, $weight * 1.0);
                            continue;
                        }

                        $words = preg_split('/[\s,\-_.:;]+/', $content, -1, PREG_SPLIT_NO_EMPTY);
                        foreach ($words as $word) {
                            $wLen = strlen($word);
                            if (abs($wLen - $tLen) > 3) continue;
                            $dist = levenshtein($token, $word);
                            $maxAllowed = $tLen <= 4 ? 1 : ($tLen <= 7 ? 2 : 3);
                            if ($dist <= $maxAllowed) {
                                $sim = max(0, 1 - ($dist / max($wLen, $tLen)));
                                $bestScore = max($bestScore, $weight * $sim);
                            }
                        }
                    }

                    if ($bestScore >= 0.6) {
                        $matchedTokens++;
                        $modScore += $bestScore;
                    }
                }

                if ($matchedTokens > 0 && ($matchedTokens / count($tokens)) >= 0.5) {
                    $scored[] = [
                        'mod' => $mod,
                        'score' => $modScore * ($matchedTokens / count($tokens)),
                    ];
                }
            }

            if (!empty($scored)) {
                usort($scored, fn($a, $b) => $b['score'] <=> $a['score']);
                $fuzzyItems = array_map(fn($item) => $item['mod'], $scored);
                $totalCount = count($fuzzyItems);
                $slice = array_slice($fuzzyItems, ($page - 1) * $perPage, $perPage);
                $lastPage = (int) ceil($totalCount / $perPage);

                    return [
                        'success' => true,
                        'count' => $totalCount,
                        'modules' => array_values(array_map(fn($m) => is_array($m) ? $m : $m->toArray(), $slice)),
                        'fuzzy' => true,
                        'pagination' => [
                            'current_page' => $page,
                            'last_page' => $lastPage,
                            'per_page' => $perPage,
                            'total' => $totalCount,
                            'from' => ($page - 1) * $perPage + 1,
                            'to' => min($page * $perPage, $totalCount),
                            'has_more' => $page < $lastPage,
                        ],
                    ];
                }
            }

            return [
                'success' => true,
                'count' => $paginator->total(),
                'modules' => $paginator->getCollection()->toArray(),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                    'has_more' => $paginator->hasMorePages(),
                ],
            ];
        });

        return response()->json($responsePayload);
    }

    /**
     * Get dynamic curriculum filter options backed by actual database alignments
     */
    public function curriculumOptions()
    {
        $payload = \Illuminate\Support\Facades\Cache::remember('genlabs_curriculum_options_cache', 3600, function () {
            $publishedModuleIds = Module::where('status', 'published')->pluck('id');
            $alignments = \App\Models\CurriculumAlignment::whereIn('module_id', $publishedModuleIds)->get();

            $calcGradeCounts = function ($level, $grades) use ($alignments) {
                $romanMap = [
                    '7' => 'VII', '8' => 'VIII', '9' => 'IX',
                    '10' => 'X', '11' => 'XI', '12' => 'XII',
                ];
                $result = [];
                foreach ($grades as $g) {
                    $candidates = [(string) $g, $romanMap[(string) $g] ?? (string) $g];
                    $count = $alignments->where('education_level', $level)->whereIn('grade_level', $candidates)->pluck('module_id')->unique()->count();
                    $result[] = [
                        'grade' => (string) $g,
                        'roman' => $romanMap[(string) $g] ?? (string) $g,
                        'label' => 'Kelas ' . ($romanMap[(string) $g] ?? (string) $g),
                        'count' => $count,
                    ];
                }
                return $result;
            };

            $calcProgramCounts = function ($programs) use ($alignments) {
                $result = [];
                foreach ($programs as $p) {
                    $code = $p['code'];
                    $count = $alignments->filter(function ($a) use ($code) {
                        return str_contains($a->official_source_code, $code)
                            || str_contains($a->curriculum_version, $code)
                            || str_contains($a->subject_or_course, $code)
                            || str_contains($a->study_program ?? '', $code)
                            || str_contains($a->chapter_or_unit ?? '', $code);
                    })->pluck('module_id')->unique()->count();

                    $result[] = [
                        'code' => $code,
                        'name' => $p['name'],
                        'count' => $count,
                    ];
                }
                return $result;
            };

            $calcSemesterCounts = function ($semesters) use ($alignments) {
                $result = [];
                foreach ($semesters as $s) {
                    $count = $alignments->where('education_level', 'higher_education')->where('semester', (int) $s)->pluck('module_id')->unique()->count();
                    $result[] = [
                        'semester' => (int) $s,
                        'count' => $count,
                    ];
                }
                return $result;
            };

            $levels = [
                'smp' => [
                    'name' => 'SMP / MTs',
                    'phase' => 'D',
                    'total_modules' => $alignments->where('education_level', 'smp')->pluck('module_id')->unique()->count(),
                    'grades' => $calcGradeCounts('smp', ['7', '8', '9']),
                ],
                'sma' => [
                    'name' => 'SMA / MA',
                    'phases' => ['E', 'F'],
                    'total_modules' => $alignments->where('education_level', 'sma')->pluck('module_id')->unique()->count(),
                    'grades' => $calcGradeCounts('sma', ['10', '11', '12']),
                ],
                'smk' => [
                    'name' => 'SMK (Kejuruan)',
                    'phases' => ['E', 'F'],
                    'total_modules' => $alignments->where('education_level', 'smk')->pluck('module_id')->unique()->count(),
                    'grades' => $calcGradeCounts('smk', ['10', '11', '12']),
                    'programs' => $calcProgramCounts([
                        ['code' => 'PPLG', 'name' => 'Pengembangan Perangkat Lunak & Gim'],
                        ['code' => 'RPL', 'name' => 'Rekayasa Perangkat Lunak'],
                        ['code' => 'TKJ', 'name' => 'Teknik Komputer & Jaringan'],
                        ['code' => 'AKL', 'name' => 'Akuntansi & Keuangan Lembaga'],
                    ]),
                ],
                'higher_education' => [
                    'name' => 'Perguruan Tinggi',
                    'phase' => 'PT',
                    'total_modules' => $alignments->where('education_level', 'higher_education')->pluck('module_id')->unique()->count(),
                    'semesters' => $calcSemesterCounts([1, 2, 3, 4]),
                    'programs' => $calcProgramCounts([
                        ['code' => 'TRPL', 'name' => 'Teknologi Rekayasa Perangkat Lunak'],
                        ['code' => 'AKT', 'name' => 'Akuntansi Perpajakan'],
                        ['code' => 'MPI', 'name' => 'Manajemen Pemasaran Internasional'],
                        ['code' => 'HORTI', 'name' => 'Agribisnis Hortikultura'],
                        ['code' => 'MICE', 'name' => 'Pengelolaan Konvensi & Acara'],
                    ]),
                ],
            ];

            return [
                'success' => true,
                'total_published_modules' => $publishedModuleIds->count(),
                'levels' => $levels,
            ];
        });

        return response()->json($payload);
    }

    /**
     * Get module detail by ID or Slug for student learning workspace
     */
    public function show($id)
    {
        $query = is_numeric($id)
            ? Module::where('id', $id)
            : Module::where('slug', $id);

        $module = $query->with([
            'simulations.concept',
            'curriculumAlignments',
            'experiments.attempts' => function ($q) {
                $q->latest()->limit(5);
            },
            'insights',
            'questions' => function ($q) {
                $q->latest()->limit(10);
            },
            'creator',
        ])->first();

        if (!$module) {
            return response()->json([
                'success' => false,
                'message' => 'Modul pembelajaran tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'module' => $module,
        ]);
    }

    /**
     * Context-Aware Student AI Tutor (Section 10, 11, 12, 15)
     * POST /api/modules/{module}/ask
     */
    public function ask(Request $request, $moduleId)
    {
        $module = is_numeric($moduleId)
            ? Module::with('simulations', 'experiments')->find($moduleId)
            : Module::with('simulations', 'experiments')->where('slug', $moduleId)->first();

        if (!$module) {
            return response()->json(['success' => false, 'message' => 'Modul tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'question' => 'required|string|max:1000',
            'simulation_state' => 'nullable|array',
            'experiment_id' => 'nullable|integer',
        ]);

        $state = $validated['simulation_state'] ?? [];
        $activeSimulation = $module->simulations->first();

        $activeExperiment = null;
        if (!empty($validated['experiment_id'])) {
            $activeExperiment = $module->experiments->firstWhere('id', $validated['experiment_id']);
        } else {
            $activeExperiment = $module->experiments->first();
        }

        $user = $request->user();
        if (!$user) {
            return response()->json([
                'error' => 'UNAUTHENTICATED',
                'message' => 'Silakan login terlebih dahulu untuk menggunakan AI Tutor.',
            ], 401);
        }

        try {
            $tutorReply = $this->tutorService->answer(
                $module,
                $validated['question'],
                $state,
                $activeSimulation,
                $activeExperiment,
                $user,
                $validated['session_id'] ?? null
            );
        } catch (\App\Exceptions\AiUsageProtectionException $e) {
            return response()->json($e->getPayload(), $e->getStatusCode());
        }

        // Store question into database for student learning history
        $savedQuestion = Question::create([
            'user_id' => $user->id,
            'module_id' => $module->id,
            'question' => $validated['question'],
            'answer' => $tutorReply['answer'],
            'simulation_state' => $state,
            'follow_ups' => $tutorReply['suggestedFollowUp'] ?? ($tutorReply['follow_ups'] ?? []),
        ]);

        return response()->json([
            'success' => true,
            'state' => $tutorReply['state'] ?? 'STATE_A',
            'answer' => $tutorReply['answer'],
            'explanation' => $tutorReply['explanation'] ?? null,
            'sources' => $tutorReply['sources'] ?? [],
            'suggestedFollowUp' => $tutorReply['suggestedFollowUp'] ?? ($tutorReply['follow_ups'] ?? []),
            'in_scope' => $tutorReply['in_scope'] ?? true,
            'question_id' => $savedQuestion->id,
            'quota' => $tutorReply['quota'] ?? ($user ? $this->tutorService->getProtection()->getUserUsage($user->id) : null),
        ]);
    }

    /**
     * Direct Student AI Tutor Endpoint
     * POST /api/ai/tutor
     */
    public function askTutorDirect(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'error' => 'UNAUTHENTICATED',
                'message' => 'Silakan login terlebih dahulu untuk menggunakan AI Tutor.',
            ], 401);
        }

        $validated = $request->validate([
            'question' => 'required|string|max:1000',
            'simulation_id' => 'nullable',
            'session_id' => 'nullable',
            'state' => 'nullable|array',
            'context' => 'nullable|array',
            'history' => 'nullable|array',
        ]);

        $simId = $validated['simulation_id'] ?? null;
        $sim = null;
        $module = null;

        if ($simId) {
            $sim = Simulation::where('slug', $simId)->first();
            $module = Module::where('slug', $simId)->with('simulations', 'experiments')->first();
        }

        // Only resolve specific module/simulation when simulation_id or explicit module slug is provided
        if ($sim && !$module) {
            $module = $sim->module ?? Module::where('slug', $sim->slug)->with('simulations', 'experiments')->first();
        }

        if (!$module) {
            $module = new Module([
                'title' => $sim->title ?? 'Simulasi Interaktif',
                'description' => $sim->discipline ?? 'Laboratorium Gen Labs',
            ]);
        }

        $state = $validated['state'] ?? [];
        $history = $validated['history'] ?? [];

        try {
            $tutorReply = $this->tutorService->answer(
                $module,
                $validated['question'],
                $state,
                $sim,
                $module->experiments?->first(),
                $user,
                $validated['session_id'] ?? null,
                $history
            );
        } catch (\App\Exceptions\AiUsageProtectionException $e) {
            return response()->json($e->getPayload(), $e->getStatusCode());
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('[AI_TUTOR_CONTROLLER_ERROR]', [
                'user_id' => $user?->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'code' => 'AI_PROVIDER_UNAVAILABLE',
                'error' => 'AI_PROVIDER_UNAVAILABLE',
                'message' => 'Layanan AI sedang mengalami gangguan sementara. Kredit Anda tidak terpotong. Silakan coba beberapa saat lagi.',
                'quota' => $user ? $this->tutorService->getProtection()->getUserUsage($user->id) : null,
                'retryable' => true,
            ], 503);
        }

        return response()->json([
            'success' => true,
            'state' => $tutorReply['state'] ?? 'STATE_A',
            'answer' => $tutorReply['answer'],
            'explanation' => $tutorReply['explanation'] ?? null,
            'sources' => $tutorReply['sources'] ?? [],
            'in_scope' => $tutorReply['in_scope'] ?? true,
            'suggestedFollowUp' => $tutorReply['suggestedFollowUp'] ?? [],
            'quota' => $tutorReply['quota'] ?? ($user ? $this->tutorService->getProtection()->getUserUsage($user->id) : null),
        ]);
    }

    /**
     * Submit an experiment attempt with real-time parameter checking (Section 13, 15)
     * POST /api/modules/{module}/experiments/{experiment}/attempts
     */
    public function submitExperimentAttempt(Request $request, $moduleId, $experimentId)
    {
        $module = is_numeric($moduleId) ? Module::find($moduleId) : Module::where('slug', $moduleId)->first();
        if (!$module) {
            return response()->json(['success' => false, 'message' => 'Modul tidak ditemukan.'], 404);
        }

        $experiment = Experiment::where('module_id', $module->id)->where('id', $experimentId)->first();
        if (!$experiment) {
            return response()->json(['success' => false, 'message' => 'Eksperimen tidak ditemukan pada modul ini.'], 404);
        }

        $validated = $request->validate([
            'state' => 'required|array', // current simulation variables
            'computed' => 'nullable|array', // computed outputs (e.g. acceleration, price, steps)
            'actual_value' => 'nullable|numeric',
        ]);

        $state = $validated['state'];
        $computed = $validated['computed'] ?? $state;

        $targetCond = $experiment->target_condition ?? ($experiment->target ?? []);
        $targetParam = $targetCond['output'] ?? ($targetCond['parameter'] ?? 'acceleration');
        $targetValue = floatval($targetCond['value'] ?? ($targetCond['targetValue'] ?? 0));
        $targetValue2 = isset($targetCond['value2']) ? floatval($targetCond['value2']) : (isset($targetCond['targetValue2']) ? floatval($targetCond['targetValue2']) : null);
        $operator = $targetCond['operator'] ?? '==';
        $tolerance = floatval($targetCond['tolerance'] ?? 0.05);

        // Determine actual value from actual_value, computed, or state
        $rawActual = null;
        if (isset($validated['actual_value'])) {
            $rawActual = $validated['actual_value'];
        } elseif (isset($computed[$targetParam])) {
            $rawActual = $computed[$targetParam];
        } elseif (isset($state[$targetParam])) {
            $rawActual = $state[$targetParam];
        }

        // Guard against missing, uncomputed, or non-numeric output signals
        if ($rawActual === null || (!is_numeric($rawActual) && !is_float($rawActual) && !is_int($rawActual))) {
            return response()->json([
                'success' => false,
                'passed' => false,
                'message' => "Sinyal target '{$targetParam}' belum dihitung atau tidak valid dalam simulasi.",
                'feedback' => "Parameter '{$targetParam}' belum tersedia dalam keluaran simulasi. Jalankan simulasi terlebih dahulu.",
            ], 422);
        }

        $actualValue = floatval($rawActual);
        if (is_nan($actualValue) || is_infinite($actualValue)) {
            return response()->json([
                'success' => false,
                'passed' => false,
                'message' => "Nilai keluaran '{$targetParam}' tidak valid (NaN/Infinite).",
            ], 422);
        }

        // Verify parameter constraints (allowedParameters)
        $rulesViolated = false;
        $violationMessage = '';
        $allowedParams = $experiment->allowedParameters ?? ($experiment->rules['allowedParameters'] ?? null);
        $initialState = $experiment->initial_parameters ?? ($experiment->rules['initialParameters'] ?? []);

        if (!empty($allowedParams) && is_array($allowedParams) && !empty($initialState)) {
            $disallowedChanges = [];
            foreach ($state as $key => $val) {
                if (isset($initialState[$key]) && abs(floatval($val) - floatval($initialState[$key])) > 0.001) {
                    if (!in_array($key, $allowedParams)) {
                        $disallowedChanges[] = $key;
                    }
                }
            }
            if (!empty($disallowedChanges)) {
                $rulesViolated = true;
                $violationMessage = "Syarat eksperimen dilanggar: Variabel [" . implode(', ', $disallowedChanges) . "] harus dipertahankan tetap untuk percobaan ini.";
            }
        }

        // Verify holding rules if specified (e.g. mass must be held at 5)
        if (!$rulesViolated && !empty($experiment->rules['heldConstant'])) {
            $expectedValues = $experiment->rules['expectedValue'] ?? [];
            foreach ($experiment->rules['heldConstant'] as $heldKey) {
                $expected = $expectedValues[$heldKey] ?? ($initialState[$heldKey] ?? null);
                if ($expected !== null && isset($state[$heldKey])) {
                    if (abs(floatval($state[$heldKey]) - floatval($expected)) > 0.001) {
                        $rulesViolated = true;
                        $violationMessage = "Variabel '{$heldKey}' harus dipertahankan di {$expected} sesuai instruksi eksperimen.";
                        break;
                    }
                }
            }
        }

        // Operator evaluation
        $conditionMet = false;
        $delta = abs($actualValue - $targetValue);

        switch ($operator) {
            case '==':
                $delta = abs($actualValue - $targetValue);
                $conditionMet = $delta <= $tolerance;
                break;
            case '>=':
                $conditionMet = $actualValue >= ($targetValue - $tolerance);
                $delta = $actualValue < $targetValue ? ($targetValue - $actualValue) : 0.0;
                break;
            case '<=':
                $conditionMet = $actualValue <= ($targetValue + $tolerance);
                $delta = $actualValue > $targetValue ? ($actualValue - $targetValue) : 0.0;
                break;
            case '>':
                $conditionMet = $actualValue > ($targetValue + 0.0001);
                $delta = $actualValue <= $targetValue ? ($targetValue - $actualValue + 0.0001) : 0.0;
                break;
            case '<':
                $conditionMet = $actualValue < ($targetValue - 0.0001);
                $delta = $actualValue >= $targetValue ? ($actualValue - $targetValue + 0.0001) : 0.0;
                break;
            case '!=':
                $delta = abs($actualValue - $targetValue);
                $conditionMet = $delta > $tolerance;
                break;
            case 'between':
                $lower = min($targetValue, $targetValue2 ?? $targetValue);
                $upper = max($targetValue, $targetValue2 ?? $targetValue);
                $conditionMet = ($actualValue >= $lower - $tolerance) && ($actualValue <= $upper + $tolerance);
                if ($actualValue < $lower) {
                    $delta = $lower - $actualValue;
                } elseif ($actualValue > $upper) {
                    $delta = $actualValue - $upper;
                } else {
                    $delta = 0.0;
                }
                break;
            default:
                $conditionMet = false;
                break;
        }

        $passed = $conditionMet && !$rulesViolated;
        $unit = $targetCond['unit'] ?? '';

        if ($passed) {
            $message = "Target berhasil dicapai! Parameter {$targetParam} bernilai {$actualValue} {$unit} (target: {$targetValue} {$unit}).";
        } elseif ($rulesViolated) {
            $message = $violationMessage;
        } else {
            if ($operator === '>=') {
                $message = "Belum tepat. Nilai saat ini ({$actualValue} {$unit}) masih di bawah ambang minimal (>= {$targetValue} {$unit}). Coba sesuaikan variabel kontrol.";
            } elseif ($operator === '<=') {
                $message = "Belum tepat. Nilai saat ini ({$actualValue} {$unit}) melebihi batas maksimal (<= {$targetValue} {$unit}). Coba turunkan variabel kontrol.";
            } else {
                $dir = $actualValue < $targetValue ? 'menaikkan' : 'menurunkan';
                $message = "Belum tepat. Coba ubah variabel kontrol (perlu {$dir} nilai) dan amati perubahannya. Target: {$targetValue} {$unit} (selisih: " . round($delta, 3) . ").";
            }
        }

        $user = $request->user('sanctum') ?? $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Silakan login untuk menyimpan progres eksperimen.',
            ], 401);
        }

        $attempt = ExperimentAttempt::create([
            'experiment_id' => $experiment->id,
            'user_id' => $user->id,
            'state' => $state,
            'prediction' => $request->input('prediction'),
            'result' => [
                'actualValue' => $actualValue,
                'targetValue' => $targetValue,
                'delta' => $delta,
                'message' => $message,
            ],
            'delta' => $delta,
            'passed' => $passed,
            'simulation_version' => $module->version ?? '1.0',
        ]);

        $newInsight = null;
        if ($passed) {
            $experiment->update(['status' => 'completed']);

            // Save insight
            $newInsight = Insight::create([
                'module_id' => $module->id,
                'title' => "Eksperimen Berhasil: {$experiment->title}",
                'content' => "Berdasarkan percobaan terukur, parameter {$targetParam} bernilai {$actualValue} {$unit} pada kondisi {$module->title}. Eksperimen membuktikan validitas model teoretis secara empiris.",
            ]);
        }

        return response()->json([
            'success' => true,
            'passed' => $passed,
            'attempt' => [
                'id' => $attempt->id,
                'actualValue' => $actualValue,
                'targetValue' => $targetValue,
                'delta' => $delta,
                'unit' => $unit,
                'passed' => $passed,
                'prediction' => $attempt->prediction,
                'simulation_version' => $attempt->simulation_version,
                'message' => $message,
            ],
            'insight' => $newInsight,
        ]);
    }

    /**
     * Get user experiment history (Section 9: Riwayat Eksperimen)
     */
    public function experimentHistory(Request $request)
    {
        $user = $request->user('sanctum') ?? $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }
        $userId = $user->id;

        $query = ExperimentAttempt::with(['experiment.module', 'experiment.simulation'])
            ->where('user_id', $userId)
            ->latest();

        $page = max((int)$request->input('page', 1), 1);
        $perPage = min(max((int)$request->input('per_page', 10), 1), 50);

        $attempts = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'success' => true,
            'attempts' => $attempts->items(),
            'pagination' => [
                'current_page' => $attempts->currentPage(),
                'last_page' => $attempts->lastPage(),
                'per_page' => $attempts->perPage(),
                'total' => $attempts->total(),
            ],
        ]);
    }
}
