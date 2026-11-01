<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;

class AdminActivityController extends Controller
{
    /**
     * List recent activities with search and server-side pagination (PRD Section AD)
     */
    public function index(Request $request)
    {
        $query = Activity::query();

        if ($request->has('search') && !empty($request->search)) {
            $s = strtolower($request->search);
            $query->where(function ($q) use ($s) {
                $q->whereRaw('LOWER(action) LIKE ?', ["%{$s}%"])
                  ->orWhereRaw('LOWER(target) LIKE ?', ["%{$s}%"])
                  ->orWhereRaw('LOWER(user_name) LIKE ?', ["%{$s}%"]);
            });
        }

        $perPage = min((int) ($request->get('per_page', 15)), 50);
        $activities = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $activities->items(),
            'meta' => [
                'current_page' => $activities->currentPage(),
                'last_page' => $activities->lastPage(),
                'per_page' => $activities->perPage(),
                'total' => $activities->total(),
            ],
        ]);
    }
}
