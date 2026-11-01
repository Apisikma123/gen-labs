<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminSettingsController extends Controller
{
    /**
     * Show system and AI settings (PRD Section AE: NEVER expose API key)
     */
    public function index()
    {
        $hasGemini = !empty(env('GEMINI_API_KEY'));
        $hasOpenAi = !empty(env('OPENAI_API_KEY'));

        return response()->json([
            'success' => true,
            'settings' => [
                'ai' => [
                    'provider' => 'Google Gemini (Native Multimodal)',
                    'status' => $hasGemini ? 'Connected & Operational' : ($hasOpenAi ? 'Connected (Fallback OpenAI)' : 'Ready (Default Sandbox Mode)'),
                    'model' => config('ai.model', 'gemini-2.5-flash'),
                    'light_model' => config('ai.light_model', 'gemini-2.5-flash-lite'),
                    'api_key_status' => ($hasGemini || $hasOpenAi) ? 'Configured (Server-Side Vault)' : 'Not Configured',
                    'rate_limit' => config('ai.tutor_rate_limit_per_minute', 20) . ' requests / minute per IP',
                    'max_tokens' => config('ai.max_tutor_output_tokens', 800),
                ],
                'system' => [
                    'app_name' => 'Gen Labs Interactive Laboratory',
                    'environment' => config('app.env', 'production'),
                    'php_version' => PHP_VERSION,
                    'laravel_version' => app()->version(),
                    'database' => 'MySQL 8.0 (simula_db)',
                    'auth_driver' => 'Laravel Sanctum (Stateful & Bearer)',
                    'timezone' => config('app.timezone', 'Asia/Jakarta'),
                ],
            ],
        ]);
    }
}
