<?php

namespace App\Services\AI;

use App\Models\User;
use App\Models\AiUsageDaily;
use App\Models\AiSystemUsageDaily;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;

class AiUsageProtectionService
{
    public const TIMEZONE = 'Asia/Jakarta';

    public function getCurrentDate(): string
    {
        return Carbon::now(self::TIMEZONE)->toDateString();
    }

    public function getResetTimestamp(): string
    {
        return Carbon::now(self::TIMEZONE)->tomorrow()->startOfDay()->toIso8601String();
    }

    /**
     * Get real backend usage state for an authenticated user.
     */
    public function getUserUsage(int $userId): array
    {
        $today = $this->getCurrentDate();
        $dailyLimit = (int) config('ai.daily_user_limit', 5);

        $record = AiUsageDaily::where('user_id', $userId)
            ->whereDate('usage_date', $today)
            ->first();

        $used = $record ? (int) $record->tutor_requests : 0;
        $remaining = max(0, $dailyLimit - $used);

        return [
            'daily_limit' => $dailyLimit,
            'used' => $used,
            'remaining' => $remaining,
            'reset_at' => $this->getResetTimestamp(),
            'rate_limit' => [
                'limit' => (int) config('ai.rate_limit_count', 5),
                'window_minutes' => (int) config('ai.rate_limit_window_minutes', 10),
            ],
        ];
    }

    /**
     * Pre-flight protection check before invoking AI.
     * Evaluates in-flight lock, idempotency, rate limit, global budget, and daily user quota.
     * Returns null if allowed, or an array with status code and JSON payload if rejected.
     */
    public function preflightCheck(User $user, string $question, string $contextKey = ''): ?array
    {
        $userId = $user->id;
        $today = $this->getCurrentDate();

        // 1. IN-FLIGHT CONCURRENCY CHECK: Max 1 active request per user at a time
        $lockKey = "ai_inflight:{$userId}";
        $acquired = Cache::add($lockKey, 1, 30); // 30s emergency TTL
        if (!$acquired) {
            $this->incrementSystemStat('rejected_rate');
            return [
                'status' => 429,
                'json' => [
                    'error' => 'AI_RATE_LIMITED',
                    'code' => 'AI_RATE_LIMITED',
                    'message' => 'Sedang memproses pertanyaan sebelumnya. Silakan tunggu beberapa detik.',
                    'retry_after' => 5,
                ],
            ];
        }

        // 2. IDEMPOTENCY / ACCIDENTAL DOUBLE-SUBMIT CHECK (15 seconds window)
        $idempotencyKey = "ai_idem:{$userId}:" . md5($question . ':' . $contextKey);
        $cachedReply = Cache::get($idempotencyKey);
        if ($cachedReply) {
            $this->releaseInflightLock($userId);
            return [
                'status' => 200,
                'is_duplicate' => true,
                'cached_data' => $cachedReply,
            ];
        }

        // 3. PER-USER DAILY QUOTA CHECK: Strict 5 accepted requests per user per calendar day (Asia/Jakarta)
        $userLimit = (int) config('ai.daily_user_limit', 5);
        $userUsageRecord = AiUsageDaily::where('user_id', $userId)
            ->whereDate('usage_date', $today)
            ->first();

        $currentUsed = $userUsageRecord ? (int) $userUsageRecord->tutor_requests : 0;
        if ($currentUsed >= $userLimit) {
            $this->releaseInflightLock($userId);
            $this->incrementSystemStat('rejected_quota');
            return [
                'status' => 429,
                'json' => [
                    'error' => 'DAILY_AI_QUOTA_EXCEEDED',
                    'code' => 'DAILY_AI_QUOTA_EXCEEDED',
                    'message' => 'Kuota AI Tutor hari ini sudah habis. Kamu bisa bertanya lagi setelah pukul 00.00 WIB.',
                    'used' => $currentUsed,
                    'limit' => $userLimit,
                    'remaining' => 0,
                    'reset_at' => $this->getResetTimestamp(),
                ],
            ];
        }

        // 4. SHORT-TERM BURST RATE LIMIT: Max 5 requests per 10 minutes per user
        $rateLimitCount = (int) config('ai.rate_limit_count', 5);
        $rateLimitWindow = (int) config('ai.rate_limit_window_minutes', 10);
        $rateKey = "ai_rate_user:{$userId}";

        if (RateLimiter::tooManyAttempts($rateKey, $rateLimitCount)) {
            $this->releaseInflightLock($userId);
            $this->incrementSystemStat('rejected_rate');
            $retryAfter = RateLimiter::availableIn($rateKey) ?: 60;
            return [
                'status' => 429,
                'json' => [
                    'error' => 'AI_RATE_LIMITED',
                    'code' => 'AI_RATE_LIMITED',
                    'message' => 'Terlalu banyak permintaan berturut-turut. Silakan tunggu ' . $retryAfter . ' detik.',
                    'retry_after' => $retryAfter,
                ],
            ];
        }

        // 5. GLOBAL BUDGET CHECK: GLOBAL_DAILY_AI_LIMIT (Default 500)
        $globalLimit = (int) config('ai.global_daily_limit', 500);
        $systemToday = $this->getOrCreateSystemUsage($today);

        if ($systemToday->successful_requests >= ($globalLimit * 0.8)) {
            Log::warning('[AI_GLOBAL_BUDGET_WARNING]', [
                'date' => $today,
                'successful_requests' => $systemToday->successful_requests,
                'global_limit' => $globalLimit,
                'usage_pct' => round(($systemToday->successful_requests / max(1, $globalLimit)) * 100, 1),
            ]);
        }

        $isAdmin = ($user->role === 'admin');
        $adminBypass = config('ai.admin_bypass_global_limit', true);

        if ($systemToday->successful_requests >= $globalLimit && !($isAdmin && $adminBypass)) {
            $this->releaseInflightLock($userId);
            return [
                'status' => 503,
                'json' => [
                    'error' => 'AI_SERVICE_DAILY_LIMIT',
                    'message' => 'Layanan AI sedang mencapai batas penggunaan harian. Silakan coba lagi nanti.',
                ],
            ];
        }

        // Preflight passed! Register hit to rate limiter window & total system request
        RateLimiter::hit($rateKey, $rateLimitWindow * 60);
        $this->incrementSystemStat('total_requests');

        return null;
    }

    /**
     * Release in-flight lock for user.
     */
    public function releaseInflightLock(int $userId): void
    {
        Cache::forget("ai_inflight:{$userId}");
    }

    /**
     * Record scope-guard refusal. Quota is preserved (NOT consumed).
     */
    public function recordScopeGuardRefusal(int $userId): void
    {
        $this->releaseInflightLock($userId);
        $this->incrementSystemStat('rejected_scope');
    }

    /**
     * Record Gemini failure. Quota is preserved (NOT consumed).
     */
    public function recordGeminiFailure(int $userId, ?\Throwable $e = null): void
    {
        $this->releaseInflightLock($userId);
        $this->incrementSystemStat('gemini_failures');
        if ($e) {
            Log::error('[AI_PROTECTION_GEMINI_FAILURE]', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Record successful AI Tutor call.
     * Atomically increments user daily quota in MySQL and records latency & system usage.
     */
    public function recordSuccess(int $userId, string $question, string $answer, int $latencyMs, string $contextKey = ''): array
    {
        $this->releaseInflightLock($userId);
        $today = $this->getCurrentDate();

        // 1. Atomic portable increment for per-user quota
        $parsedToday = Carbon::parse($today)->format('Y-m-d');
        $userDaily = AiUsageDaily::where('user_id', $userId)
            ->whereDate('usage_date', $parsedToday)
            ->first();

        if (!$userDaily) {
            try {
                $userDaily = AiUsageDaily::create([
                    'user_id' => $userId,
                    'usage_date' => $parsedToday,
                    'tutor_requests' => 0,
                ]);
            } catch (\Throwable $e) {
                $userDaily = AiUsageDaily::where('user_id', $userId)
                    ->whereDate('usage_date', $parsedToday)
                    ->first();
            }
        }

        if ($userDaily && $userDaily->exists) {
            $userDaily->increment('tutor_requests');
        }

        // 2. Increment system successful requests and latency
        $this->incrementSystemSuccess($latencyMs);

        // 3. Cache answer for idempotency protection (15 seconds)
        $idempotencyKey = "ai_idem:{$userId}:" . md5($question . ':' . $contextKey);
        Cache::put($idempotencyKey, [
            'answer' => $answer,
            'timestamp' => now()->timestamp,
        ], 15);

        return $this->getUserUsage($userId);
    }

    /**
     * Admin monitoring overview using live MySQL data.
     */
    public function getAdminMonitoring(): array
    {
        $today = $this->getCurrentDate();
        $globalLimit = (int) config('ai.global_daily_limit', 500);

        $systemToday = $this->getOrCreateSystemUsage($today);

        $activeUsersToday = DB::table('ai_usage_daily')
            ->whereDate('usage_date', $today)
            ->where('tutor_requests', '>', 0)
            ->count();

        $successful = (int) $systemToday->successful_requests;
        $usagePct = round(($successful / max(1, $globalLimit)) * 100, 1);
        $avgLatency = $successful > 0
            ? (int) round($systemToday->total_latency_ms / $successful)
            : 0;

        return [
            'usage_date' => $today,
            'requests_today' => (int) $systemToday->total_requests,
            'successful_requests' => $successful,
            'global_daily_limit' => $globalLimit,
            'usage_percentage' => $usagePct,
            'active_users_today' => $activeUsersToday,
            'gemini_failures' => (int) $systemToday->gemini_failures,
            'rate_limited_requests' => (int) $systemToday->rejected_rate,
            'quota_exceeded_requests' => (int) $systemToday->rejected_quota,
            'scope_guard_rejected' => (int) $systemToday->rejected_scope,
            'avg_latency_ms' => $avgLatency,
        ];
    }

    private function getOrCreateSystemUsage(string $date): AiSystemUsageDaily
    {
        $parsed = Carbon::parse($date)->format('Y-m-d');
        $existing = AiSystemUsageDaily::whereDate('usage_date', $parsed)->first();
        if ($existing) {
            return $existing;
        }

        try {
            return AiSystemUsageDaily::create([
                'usage_date' => $parsed,
                'total_requests' => 0,
                'successful_requests' => 0,
                'rejected_scope' => 0,
                'rejected_quota' => 0,
                'rejected_rate' => 0,
                'gemini_failures' => 0,
                'total_latency_ms' => 0,
            ]);
        } catch (\Throwable $e) {
            return AiSystemUsageDaily::whereDate('usage_date', $parsed)->first() ?? new AiSystemUsageDaily();
        }
    }

    private function incrementSystemStat(string $column): void
    {
        $today = $this->getCurrentDate();
        $record = $this->getOrCreateSystemUsage($today);
        if ($record && $record->exists) {
            $record->increment($column);
        }
    }

    private function incrementSystemSuccess(int $latencyMs): void
    {
        $today = $this->getCurrentDate();
        $record = $this->getOrCreateSystemUsage($today);
        if ($record && $record->exists) {
            $record->increment('successful_requests');
            $record->increment('total_latency_ms', $latencyMs);
        }
    }
}
