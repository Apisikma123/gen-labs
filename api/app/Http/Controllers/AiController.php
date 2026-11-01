<?php

namespace App\Http\Controllers;

use App\Models\Simulation;
use App\Models\Question;
use App\Models\LearningSession;
use App\Services\AI\SimulationGeneratorService;
use App\Services\AI\TutorService;
use App\Services\Simulation\SimulationService;
use Illuminate\Http\Request;

class AiController extends Controller
{
    protected $simulationService;
    protected $generatorService;
    protected $tutorService;

    public function __construct(
        SimulationService $simulationService,
        SimulationGeneratorService $generatorService,
        TutorService $tutorService
    ) {
        $this->simulationService = $simulationService;
        $this->generatorService = $generatorService;
        $this->tutorService = $tutorService;
    }

    /**
     * AI Simulation Request with REUSE prioritized before GENERATE (PRD Section 9 & 10)
     */
    public function simulationRequest(Request $request)
    {
        $validated = $request->validate([
            'prompt' => 'required|string|max:500',
        ]);

        $prompt = $validated['prompt'];

        // 1. Prioritize REUSE
        $existing = $this->simulationService->findReuseCandidate($prompt);

        if ($existing) {
            return response()->json([
                'success' => true,
                'status' => 'existing',
                'simulation' => $existing,
                'explanation' => "Menemukan modul kurikulum yang relevan: '{$existing->title}'.",
                'source' => 'catalog_reuse',
            ]);
        }

        // 2. If not found, GENERATE new simulation definition schema
        $generated = $this->generatorService->generate($prompt);

        return response()->json([
            'success' => true,
            'status' => 'generated',
            'simulation' => $generated,
            'explanation' => "AI merumuskan model matematika baru untuk konsep '{$prompt}'.",
            'source' => 'ai_generation',
        ], 201);
    }

    /**
     * Context-Aware AI Tutor (PRD Section 21 & 22)
     */
    public function tutor(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string',
            'simulation_id' => 'nullable',
            'session_id' => 'nullable',
            'state' => 'nullable|array',
            'context' => 'nullable|array',
        ]);

        $simulation = null;
        if (!empty($validated['simulation_id'])) {
            $simulation = is_numeric($validated['simulation_id'])
                ? Simulation::find($validated['simulation_id'])
                : Simulation::where('slug', $validated['simulation_id'])->first();
        }

        $state = $validated['state'] ?? [];
        $tutorReply = $this->tutorService->answer($validated['question'], $simulation, $state);

        // Optionally record in questions table
        if (!empty($validated['session_id'])) {
            $session = LearningSession::find($validated['session_id']);
            if ($session) {
                Question::create([
                    'learning_session_id' => $session->id,
                    'user_id' => $request->user()?->id,
                    'question' => $validated['question'],
                    'state_context' => $state,
                    'answer' => $tutorReply['answer'],
                    'action' => $tutorReply['action'] ?? null,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'answer' => $tutorReply['answer'],
            'explanation' => $tutorReply['explanation'] ?? null,
            'action' => $tutorReply['action'] ?? null,
            'suggestedFollowUp' => $tutorReply['suggestedFollowUp'] ?? [],
        ]);
    }
}
