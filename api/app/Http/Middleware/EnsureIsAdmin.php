<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsAdmin
{
    /**
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth('sanctum')->user() ?? $request->user('sanctum') ?? $request->user();

        // If bearer token is present in request header
        if (!$user && ($token = $request->bearerToken())) {
            $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if ($tokenModel && $tokenModel->tokenable) {
                $user = $tokenModel->tokenable;
                auth()->setUser($user);
            }
        }

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Token otentikasi diperlukan.',
            ], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Endpoint ini hanya dapat diakses oleh Administrator.',
            ], 403);
        }

        return $next($request);
    }
}
