<?php

namespace App\Http\Controllers;

use App\Models\Experiment;
use App\Models\ExperimentAttempt;
use App\Models\LearningSession;
use App\Models\Insight;
use Illuminate\Http\Request;

class ExperimentController extends Controller
{
    /**
     * Create an experiment challenge for a learning session (PRD Section 23 & 47)
     */
    public function store(Request $request, $sessionId)
    {
        $session = LearningSession::find($sessionId);
        if (!$session) {
            return response()->json(['success' => false, 'message' => 'Sesi tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string',
            'objective' => 'required|string',
            'target_condition' => 'required|array',
            'rules' => 'nullable|array',
        ]);

        $experiment = Experiment::create([
            'learning_session_id' => $session->id,
            'title' => $validated['title'],
            'objective' => $validated['objective'],
            'target_condition' => $validated['target_condition'],
            'rules' => $validated['rules'] ?? [],
            'status' => 'in_progress',
        ]);

        return response()->json([
            'success' => true,
            'experiment' => $experiment,
        ], 201);
    }

    /**
     * Submit an experiment attempt with realtime evaluation (PRD Section 11 & 24)
     */
    public function submitAttempt(Request $request, $experimentId)
    {
        $experiment = Experiment::with('learningSession.simulation')->find($experimentId);
        if (!$experiment) {
            return response()->json(['success' => false, 'message' => 'Eksperimen tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'parameters' => 'required|array',
            'computed' => 'required|array',
        ]);

        $parameters = $validated['parameters'];
        $computed = $validated['computed'];
        $targetCond = $experiment->target_condition ?? [];

        $targetOutputKey = $targetCond['output'] ?? $targetCond['parameter'] ?? 'acceleration';
        $targetValue = floatval($targetCond['value'] ?? $targetCond['targetValue'] ?? 0);
        $targetValue2 = isset($targetCond['value2']) ? floatval($targetCond['value2']) : (isset($targetCond['targetValue2']) ? floatval($targetCond['targetValue2']) : null);
        $operator = $targetCond['operator'] ?? '==';
        $tolerance = floatval($targetCond['tolerance'] ?? 0.05);

        // Guard against missing, uncomputed, or non-numeric output signals
        $rawValue = $computed[$targetOutputKey] ?? ($parameters[$targetOutputKey] ?? null);
        if ($rawValue === null || (!is_numeric($rawValue) && !is_float($rawValue) && !is_int($rawValue))) {
            return response()->json([
                'success' => false,
                'passed' => false,
                'message' => "Sinyal output '{$targetOutputKey}' belum dihitung atau tidak valid dalam simulasi.",
                'feedback' => "Parameter '{$targetOutputKey}' belum tersedia dalam keluaran simulasi. Jalankan simulasi terlebih dahulu.",
            ], 422);
        }

        $actualValue = floatval($rawValue);
        if (is_nan($actualValue) || is_infinite($actualValue)) {
            return response()->json([
                'success' => false,
                'passed' => false,
                'message' => "Nilai keluaran '{$targetOutputKey}' tidak valid (NaN/Infinite).",
            ], 422);
        }

        // Verify parameter constraints (allowedParameters)
        $rulesViolated = false;
        $violationMessage = '';
        $allowedParams = $experiment->allowedParameters ?? ($experiment->rules['allowedParameters'] ?? null);
        $initialState = $experiment->learningSession->current_state ?? [];

        if (!empty($allowedParams) && is_array($allowedParams) && !empty($initialState)) {
            $disallowedChanges = [];
            foreach ($parameters as $key => $val) {
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

        // Verify holding variables constant rule (heldConstant)
        if (!$rulesViolated && !empty($experiment->rules['heldConstant'])) {
            $expectedValues = $experiment->rules['expectedValue'] ?? [];
            foreach ($experiment->rules['heldConstant'] as $heldKey) {
                $expected = $expectedValues[$heldKey] ?? ($initialState[$heldKey] ?? null);
                if ($expected !== null && isset($parameters[$heldKey])) {
                    if (abs(floatval($parameters[$heldKey]) - floatval($expected)) > 0.001) {
                        $rulesViolated = true;
                        $violationMessage = "Variabel '{$heldKey}' harus dipertahankan di {$expected} sesuai aturan percobaan.";
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
            $feedback = "Target berhasil dicapai! Parameter {$targetOutputKey} bernilai {$actualValue} {$unit} (target: {$targetValue} {$unit}).";
        } elseif ($rulesViolated) {
            $feedback = $violationMessage;
        } else {
            if ($operator === '>=') {
                $feedback = "Belum tepat. Nilai saat ini ({$actualValue} {$unit}) masih di bawah ambang minimal (>= {$targetValue} {$unit}). Coba sesuaikan variabel kontrol.";
            } elseif ($operator === '<=') {
                $feedback = "Belum tepat. Nilai saat ini ({$actualValue} {$unit}) melebihi batas maksimal (<= {$targetValue} {$unit}). Coba turunkan variabel kontrol.";
            } else {
                $dir = $actualValue < $targetValue ? 'menaikkan' : 'menurunkan';
                $feedback = "Belum tepat. Coba ubah variabel kontrol (perlu {$dir} nilai) dan amati perubahannya. Target: {$targetValue} {$unit} (selisih: " . round($delta, 3) . ").";
            }
        }

        $attempt = ExperimentAttempt::create([
            'experiment_id' => $experiment->id,
            'parameters' => $parameters,
            'computed' => $computed,
            'passed' => $passed,
            'delta' => $delta,
            'feedback' => $feedback,
        ]);

        $newInsight = null;
        if ($passed) {
            $experiment->update(['status' => 'completed']);
            $experiment->learningSession->update(['progress' => 100]);

            // Generate structured Insight (PRD Section 11 & 25)
            $simTitle = $experiment->learningSession->simulation->title ?? 'Simulasi';
            $newInsight = Insight::create([
                'learning_session_id' => $experiment->learningSession->id,
                'title' => "Eksperimen Berhasil: {$experiment->title}",
                'discovery' => "Melalui kombinasi parameter terkontrol, target {$targetOutputKey} = {$targetValue} berhasil dibuktikan.",
                'mathematical_delta' => "Nilai akhir: {$actualValue} (Δ = " . round($delta, 4) . ")",
                'next_challenge' => "Coba variasikan parameter lain untuk melihat apakah hubungan yang sama tetap berlaku.",
            ]);
        }

        return response()->json([
            'success' => true,
            'attempt' => [
                'id' => $attempt->id,
                'passed' => $passed,
                'actualValue' => $actualValue,
                'targetValue' => $targetValue,
                'delta' => $delta,
                'withinTolerance' => $withinTolerance,
                'message' => $feedback,
            ],
            'insight' => $newInsight,
        ]);
    }
}
