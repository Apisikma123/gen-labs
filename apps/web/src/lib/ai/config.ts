/**
 * Centralized AI Configuration & Utilities for GEN LABS.
 * 
 * Strict Security Rules:
 * - Server-side ONLY. Never export API keys to client code.
 * - Single source of truth for AI model routing, token limits, rate limiting.
 */

export interface AiConfig {
  provider: 'gemini';
  apiKey: string;
  model: string;
  lightModel: string;
  timeoutMs: number;
  maxRetries: number;
  tokenLimits: {
    maxTutorOutputTokens: number;
    maxAuthoringOutputTokens: number;
    maxPatchOutputTokens: number;
  };
}

export const AI_CONFIG: AiConfig = {
  provider: 'gemini',
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
  model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  lightModel: process.env.GEMINI_LIGHT_MODEL || 'gemini-3.5-flash-lite',
  timeoutMs: 30000,
  maxRetries: 1, // Only transient 5xx or network errors are retried once
  tokenLimits: {
    maxTutorOutputTokens: Number(process.env.MAX_TUTOR_OUTPUT_TOKENS) || 800,
    maxAuthoringOutputTokens: Number(process.env.MAX_AUTHORING_OUTPUT_TOKENS) || 4000,
    maxPatchOutputTokens: Number(process.env.MAX_PATCH_OUTPUT_TOKENS) || 1500,
  },
};

export function isAiConfigured(): boolean {
  if (process.env.AI_PROVIDER === 'mock') return true;
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || AI_CONFIG.apiKey;
  return typeof key === 'string' && key.trim().length > 0;
}

export function getPublicAiStatus() {
  const configured = isAiConfigured();
  return {
    provider: AI_CONFIG.provider,
    configured,
    ...(configured ? { model: AI_CONFIG.model } : {}),
  };
}

// ============================================================================
// SERVER-SIDE RATE LIMITER (In-Memory per client IP/user)
// ============================================================================

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Enforces server-side rate limits on AI endpoints.
 * @param key unique identifier (e.g. `ip:endpoint` or `user_id:endpoint`)
 * @param maxRequests maximum allowed calls within the window
 * @param windowMs time window in milliseconds (default: 60,000ms = 1 minute)
 */
export function checkAiRateLimit(
  key: string,
  maxRequests = 15,
  windowMs = 60000
): { allowed: boolean; remaining: number; retryAfterSec?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count };
}

// Cleanup stale rate limit records every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 300000).unref?.();
}

// ============================================================================
// AUDIT & LOGGING UTILITY (Requirement #21)
// ============================================================================

export interface AiLogPayload {
  requestId: string;
  operation: 'generate' | 'patch' | 'tutor' | 'health';
  simulatorId?: string;
  userId?: string;
  provider: string;
  model: string;
  latencyMs: number;
  status: 'success' | 'error';
  inputTokens?: number;
  outputTokens?: number;
  errorCategory?: string;
}

export function logAiOperation(payload: AiLogPayload) {
  // Never log API key or secret data
  console.info(`[GEN_LABS_AI]`, JSON.stringify(payload));
}
