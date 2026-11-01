<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AI\AiUsageProtectionService;

class AiUsageController extends Controller
{
    private AiUsageProtectionService $protection;

    public function __construct(AiUsageProtectionService $protection)
    {
        $this->protection = $protection;
    }

    /**
     * GET /api/ai/usage
     * Return current authenticated user's real backend quota state.
     */
    public function usage(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'error' => 'UNAUTHENTICATED',
                'message' => 'Silakan login terlebih dahulu untuk mengakses kuota AI.',
            ], 401);
        }

        $usage = $this->protection->getUserUsage($user->id);
        return response()->json($usage);
    }
}
