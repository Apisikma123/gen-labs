<?php

// Centralized AI config. API key never leaves the server.
return [
    'provider' => 'gemini',
    'api_key' => env('GEMINI_API_KEY'),
    'model' => env('GEMINI_MODEL', 'gemini-3.5-flash-lite'),
    'light_model' => env('GEMINI_LIGHT_MODEL', 'gemini-3.5-flash-lite'),
    'timeout' => (int) env('AI_TIMEOUT_SECONDS', 30),
    'max_tutor_output_tokens' => (int) env('AI_MAX_OUTPUT_TOKENS', 700),
    'max_classifier_output_tokens' => 10,

    // Production AI Usage Protection & Budgets (PRD Section 1-6)
    'daily_user_limit' => (int) env('AI_DAILY_USER_LIMIT', 5),
    'rate_limit_count' => (int) env('AI_RATE_LIMIT_COUNT', 5),
    'rate_limit_window_minutes' => (int) env('AI_RATE_LIMIT_WINDOW_MINUTES', 10),
    'global_daily_limit' => (int) env('AI_GLOBAL_DAILY_LIMIT', 500),
    'admin_bypass_global_limit' => (bool) env('AI_ADMIN_BYPASS_GLOBAL_LIMIT', true),
];
