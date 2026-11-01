<?php

namespace App\Http\Controllers;

use App\Models\Simulation;
use App\Services\Simulation\SimulationService;
use Illuminate\Http\Request;

class SimulationController extends Controller
{
    protected $simulationService;

    public function __construct(SimulationService $simulationService)
    {
        $this->simulationService = $simulationService;
    }

    /**
     * List all published simulations
     */
    public function index(Request $request)
    {
        $catalogColumns = [
            'id', 'concept_id', 'slug', 'title', 'description', 'type',
            'difficulty', 'formula', 'usage_count', 'created_at', 'updated_at'
        ];
        $query = Simulation::select($catalogColumns)->with(['concept' => function ($cq) {
            $cq->select('id', 'name', 'category', 'description');
        }]);

        if ($request->has('discipline') && $request->discipline !== 'all') {
            $discipline = $request->discipline;
            $query->where(function ($q) use ($discipline) {
                $q->where('type', $discipline)
                  ->orWhereHas('concept', function ($cq) use ($discipline) {
                      $cq->where('category', 'like', "%{$discipline}%")
                         ->orWhere('name', 'like', "%{$discipline}%");
                  });
            });
        }

        $query->orderBy('usage_count', 'desc');

        // Optional pagination support while preserving direct list contract
        if ($request->has('page') || $request->has('per_page') || $request->has('limit')) {
            $perPage = max(1, min(100, (int) $request->input('per_page', $request->input('limit', 20))));
            $page = max(1, (int) $request->input('page', 1));
            $paginator = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'total' => $paginator->total(),
                'simulations' => $paginator->items(),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'has_more' => $paginator->hasMorePages(),
                ],
            ]);
        }

        $simulations = $query->get();

        return response()->json([
            'success' => true,
            'total' => $simulations->count(),
            'simulations' => $simulations,
        ]);
    }

    /**
     * Get single simulation by ID or slug
     */
    public function show($idOrSlug)
    {
        $sim = is_numeric($idOrSlug)
            ? Simulation::find($idOrSlug)
            : Simulation::where('slug', $idOrSlug)->first();

        if (!$sim) {
            return response()->json([
                'success' => false,
                'message' => 'Modul simulasi tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'simulation' => $sim,
        ]);
    }

    /**
     * Search simulations by query string
     */
    public function search(Request $request)
    {
        $query = $request->query('q', '');
        $results = $this->simulationService->search($query);

        return response()->json([
            'success' => true,
            'query' => $query,
            'total' => $results->count(),
            'simulations' => $results,
        ]);
    }
}
