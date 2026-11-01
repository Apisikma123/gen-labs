import {
  INJECTION_PATTERNS,
  STANDARD_REFUSAL_RESPONSE,
  PROMPT_INJECTION_REFUSAL_RESPONSE,
} from './scope-guard';

export interface QuotaStatus {
  allowed: boolean;
  used: number;
  remaining: number;
  dailyLimit: number;
  resetAt: string;
}

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  retryAfterSec?: number;
}

// In-flight concurrency lock per user (Max 1 active AI call per user)
const inflightLocks = new Map<string, number>();

// In-memory per-user daily quota store: Map<`${userId}:${dateStr}`, count>
const dailyUsageStore = new Map<string, number>();

// In-memory short-term user rate limit: Map<`${userId}`, { count: number; resetAt: number }>
const shortTermRateLimitStore = new Map<string, { count: number; resetAt: number }>();

// User-scoped AI response cache: Map<`${userId}:${cacheKey}`, { data: any; expiresAt: number }>
const userCacheStore = new Map<string, { data: any; expiresAt: number }>();

const DEFAULT_DAILY_STUDENT_LIMIT = 5;
const SHORT_TERM_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const SHORT_TERM_MAX_REQUESTS = 5; // 5 requests per 10 minutes

export function getTodayString(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

export function getResetTimestamp(): string {
  const todayStr = getTodayString();
  const [year, month, day] = todayStr.split('-').map(Number);
  const tomorrowMidnightUtc = new Date(Date.UTC(year, month - 1, day + 1, -7, 0, 0, 0));
  return tomorrowMidnightUtc.toISOString();
}

/**
 * 1. IN-FLIGHT CONCURRENCY LOCK
 * Prevents concurrent spam or race conditions from a single user account.
 */
export function acquireInflightLock(userId: string, ttlMs = 30000): boolean {
  const now = Date.now();
  const existing = inflightLocks.get(userId);
  if (existing && now < existing) {
    return false; // Already processing an active request
  }
  inflightLocks.set(userId, now + ttlMs);
  return true;
}

export function releaseInflightLock(userId: string): void {
  inflightLocks.delete(userId);
}

/**
 * 2. DAILY QUOTA CHECK & MANAGEMENT
 * Enforces per-user daily quotas (default 20 requests/day for students).
 */
export function checkUserDailyQuota(userId: string, isAdmin = false): QuotaStatus {
  const dailyLimit = isAdmin ? 500 : DEFAULT_DAILY_STUDENT_LIMIT;
  const today = getTodayString();
  const key = `${userId}:${today}`;
  const used = dailyUsageStore.get(key) || 0;

  if (used >= dailyLimit && !isAdmin) {
    return {
      allowed: false,
      used,
      remaining: 0,
      dailyLimit,
      resetAt: getResetTimestamp(),
    };
  }

  return {
    allowed: true,
    used,
    remaining: Math.max(0, dailyLimit - used),
    dailyLimit,
    resetAt: getResetTimestamp(),
  };
}

export function recordUserDailyUsage(userId: string): void {
  const today = getTodayString();
  const key = `${userId}:${today}`;
  const used = dailyUsageStore.get(key) || 0;
  dailyUsageStore.set(key, used + 1);
}

/**
 * Reset daily usage for tests
 */
export function resetUserUsageForTesting(userId?: string): void {
  if (userId) {
    const today = getTodayString();
    dailyUsageStore.delete(`${userId}:${today}`);
    shortTermRateLimitStore.delete(userId);
    inflightLocks.delete(userId);
  } else {
    dailyUsageStore.clear();
    shortTermRateLimitStore.clear();
    inflightLocks.clear();
    userCacheStore.clear();
  }
}

/**
 * 3. SHORT-TERM BURST RATE LIMITING
 * Max 5 requests per 10 minutes per student user.
 */
export function checkUserBurstRateLimit(userId: string, isAdmin = false): RateLimitStatus {
  if (isAdmin) {
    return { allowed: true, remaining: 999 };
  }

  const now = Date.now();
  const record = shortTermRateLimitStore.get(userId);

  if (!record || now > record.resetAt) {
    shortTermRateLimitStore.set(userId, { count: 1, resetAt: now + SHORT_TERM_WINDOW_MS });
    return { allowed: true, remaining: SHORT_TERM_MAX_REQUESTS - 1 };
  }

  if (record.count >= SHORT_TERM_MAX_REQUESTS) {
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  record.count += 1;
  return { allowed: true, remaining: SHORT_TERM_MAX_REQUESTS - record.count };
}

/**
 * 4. PROMPT INJECTION SANITY FILTER
 * Evaluates whether untrusted user input contains prompt injection patterns.
 */
export function checkPromptInjection(text: string): { isInjection: boolean; refusal?: string } {
  if (!text || typeof text !== 'string') {
    return { isInjection: false };
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isInjection: true,
        refusal: PROMPT_INJECTION_REFUSAL_RESPONSE,
      };
    }
  }

  return { isInjection: false };
}

/**
 * 5. INPUT SIZE VALIDATION
 */
export function validateInputLength(
  text: string,
  maxLength: number,
  fieldLabel = 'Input'
): { valid: boolean; error?: string } {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: `${fieldLabel} tidak boleh kosong.` };
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: `${fieldLabel} tidak boleh kosong.` };
  }

  if (trimmed.length > maxLength) {
    return {
      valid: false,
      error: `${fieldLabel} melebihi batas panjang maksimum (${maxLength} karakter).`,
    };
  }

  return { valid: true };
}

/**
 * 6. USER-SCOPED CACHE ISOLATION
 * Cache keys are strictly namespaced by userId to eliminate cross-user leakage.
 */
export function getUserScopedCache<T = any>(userId: string, contextKey: string): T | null {
  const key = `${userId}:${contextKey}`;
  const cached = userCacheStore.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expiresAt) {
    userCacheStore.delete(key);
    return null;
  }

  return cached.data as T;
}

export function setUserScopedCache<T = any>(
  userId: string,
  contextKey: string,
  data: T,
  ttlMs = 15000 // 15-second idempotency window
): void {
  const key = `${userId}:${contextKey}`;
  userCacheStore.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * 7. SANITIZE PROVIDER ERRORS
 * Masks internal stack traces, API keys, endpoints, and credentials.
 */
export function sanitizeAiErrorMessage(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  const status = (err as any)?.status || 500;

  if (status === 429 || raw.includes('RESOURCE_EXHAUSTED') || raw.includes('quota')) {
    return {
      status: 429,
      message: 'Layanan AI sedang mengalami lonjakan beban. Harap tunggu beberapa saat.',
    };
  }

  if (status === 401 || raw.includes('API key') || raw.includes('credential')) {
    return {
      status: 503,
      message: 'Layanan AI tidak dapat diakses saat ini. Silakan hubungi Administrator.',
    };
  }

  if (status === 503 || raw.includes('high demand') || raw.includes('unavailable')) {
    return {
      status: 503,
      message: 'Model AI sedang sibuk. Silakan coba kembali beberapa saat lagi.',
    };
  }

  return {
    status: 500,
    message: 'Gagal memproses permintaan AI. Silakan coba beberapa saat lagi.',
  };
}
