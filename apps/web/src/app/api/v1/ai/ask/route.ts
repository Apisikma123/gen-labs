import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import {
  getAiProvider,
  isAiConfigured,
  isQuestionInSimulatorScope,
  STANDARD_REFUSAL_RESPONSE,
  acquireInflightLock,
  releaseInflightLock,
  checkUserDailyQuota,
  recordUserDailyUsage,
  checkUserBurstRateLimit,
  checkPromptInjection,
  validateInputLength,
  getUserScopedCache,
  setUserScopedCache,
  sanitizeAiErrorMessage,
} from '@/lib/ai';
import type { AIContextPayload } from '@genlab/simulation-types';
import { SimulationStorageRepository } from '@/lib/storage/session-store';
import { authenticateUser } from '@/lib/auth/server-guard';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // 1. Enforce Authentication
  const auth = await authenticateUser(request);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse || NextResponse.json(
      { success: false, error: 'Unauthenticated. Sesi login diperlukan untuk berinteraksi dengan AI Tutor.' },
      { status: 401 }
    );
  }

  const user = auth.user;
  const isAdmin = user.role === 'admin';
  let hasAcquiredLock = false;

  try {
    if (!isAiConfigured()) {
      return NextResponse.json(
        { error: 'Layanan AI GEN LABS belum dikonfigurasi.', configured: false },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    const context = body?.context as AIContextPayload;
    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId : undefined;

    // 2. Input Size Validation (Max 500 characters)
    const lengthValidation = validateInputLength(question, 500, 'Pertanyaan');
    if (!lengthValidation.valid) {
      return NextResponse.json(
        { error: lengthValidation.error },
        { status: 400 }
      );
    }

    if (!context || !context.simulation || !context.state) {
      return NextResponse.json(
        { error: 'Context payload with simulation and state is required.' },
        { status: 400 }
      );
    }

    // 3. Prompt Injection Defense
    const injectionCheck = checkPromptInjection(question);
    if (injectionCheck.isInjection) {
      return NextResponse.json({
        answer: injectionCheck.refusal,
        confidence: 1.0,
        inScope: false,
        category: 'OUT_OF_SCOPE',
      });
    }

    // 4. Rate Limit & Daily Quota Check
    const burstStatus = checkUserBurstRateLimit(user.id, isAdmin);
    if (!burstStatus.allowed) {
      return NextResponse.json(
        { error: 'Batas frekuensi pertanyaan tercapai. Harap tunggu beberapa saat.' },
        { status: 429, headers: { 'Retry-After': String(burstStatus.retryAfterSec || 60) } }
      );
    }

    const quotaStatus = checkUserDailyQuota(user.id, isAdmin);
    if (!quotaStatus.allowed) {
      return NextResponse.json(
        {
          error: 'DAILY_AI_QUOTA_EXCEEDED',
          code: 'DAILY_AI_QUOTA_EXCEEDED',
          message: 'Kuota AI Tutor hari ini sudah habis. Kamu bisa bertanya lagi setelah pukul 00.00 WIB.',
          used: quotaStatus.used,
          limit: quotaStatus.dailyLimit,
          remaining: 0,
          reset_at: quotaStatus.resetAt,
        },
        { status: 429 }
      );
    }

    // 5. In-flight Concurrency Lock
    if (!acquireInflightLock(user.id)) {
      return NextResponse.json(
        { error: 'Permintaan AI Anda sebelumnya masih diproses. Harap tunggu sebentar.' },
        { status: 429 }
      );
    }
    hasAcquiredLock = true;

    // 6. User-Scoped Cache Check
    const contextKey = crypto
      .createHash('md5')
      .update(`${context.simulation.id || ''}:${question}`)
      .digest('hex');

    const cachedResponse = getUserScopedCache(user.id, contextKey);
    if (cachedResponse) {
      return NextResponse.json(cachedResponse);
    }

    // 7. Session IDOR Check
    if (sessionId) {
      const existingSession = SimulationStorageRepository.getSession(sessionId);
      if (existingSession && existingSession.userId && existingSession.userId !== user.id && !isAdmin) {
        return NextResponse.json(
          { error: 'Akses ditolak: Anda tidak memiliki akses ke sesi belajar ini.' },
          { status: 403 }
        );
      }
    }

    // 8. Scope Guard Check
    const scope = isQuestionInSimulatorScope({
      simulatorTitle: context.simulation.title || context.simulation.slug || context.simulation.id,
      concept: context.simulation.description,
      formula: (context.simulation as any).formula,
      parameters: (context.state.parameters || {}) as Record<string, any>,
      currentState: (context.state.parameters || {}) as Record<string, any>,
      derivedResults: (context.state.computed || {}) as Record<string, any>,
      question,
    });

    if (!scope.relevant) {
      const refusalAnswer = scope.refusalResponse || STANDARD_REFUSAL_RESPONSE;
      return NextResponse.json({
        answer: refusalAnswer,
        confidence: 1.0,
        inScope: false,
        category: scope.category,
      });
    }

    // 9. Execute AI Tutor Call
    const ai = getAiProvider();
    const response = await ai.answerQuestion(question, context);

    recordUserDailyUsage(user.id);
    setUserScopedCache(user.id, contextKey, response);

    if (sessionId) {
      const slug = context.simulation.slug || context.simulation.id;
      const session = SimulationStorageRepository.getOrCreateSession(sessionId, slug, (context.state.parameters || {}) as Record<string, number>);
      if (!session.userId) {
        session.userId = user.id;
      }
      SimulationStorageRepository.recordChatMessage(sessionId, 'user', question, context as unknown as Record<string, unknown>);
      SimulationStorageRepository.recordChatMessage(sessionId, 'assistant', response.answer, undefined, response.action);
    }

    const updatedQuota = checkUserDailyQuota(user.id, isAdmin);
    return NextResponse.json({
      ...response,
      quota: {
        used: updatedQuota.used,
        limit: updatedQuota.dailyLimit,
        remaining: updatedQuota.remaining,
        reset_at: updatedQuota.resetAt,
      },
    });
  } catch (error: unknown) {
    const sanitized = sanitizeAiErrorMessage(error);
    return NextResponse.json(
      { error: sanitized.message },
      { status: sanitized.status }
    );
  } finally {
    if (hasAcquiredLock) {
      releaseInflightLock(user.id);
    }
  }
}
