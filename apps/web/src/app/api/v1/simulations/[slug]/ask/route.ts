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
import { SimulationStorageRepository } from '@/lib/storage/session-store';
import { authenticateUser } from '@/lib/auth/server-guard';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // 1. Authoritative Authentication Check
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
    const { slug } = await params;

    if (!isAiConfigured()) {
      return NextResponse.json(
        {
          error: 'Layanan AI Tutor GEN LABS belum dikonfigurasi.',
          configured: false,
        },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const question = typeof body?.question === 'string' ? body.question.trim() : '';

    // 2. Input Length Validation
    const lengthValidation = validateInputLength(question, 500, 'Pertanyaan');
    if (!lengthValidation.valid) {
      return NextResponse.json(
        { error: lengthValidation.error },
        { status: 400 }
      );
    }

    // 3. Prompt Injection Defense
    const injectionCheck = checkPromptInjection(question);
    if (injectionCheck.isInjection) {
      return NextResponse.json({
        success: true,
        answer: injectionCheck.refusal,
        inScope: false,
        category: 'OUT_OF_SCOPE',
      });
    }

    // 4. Rate Limiting & Daily Quota Check
    const burstStatus = checkUserBurstRateLimit(user.id, isAdmin);
    if (!burstStatus.allowed) {
      return NextResponse.json(
        {
          error: 'Batas pertanyaan ke AI Tutor tercapai. Harap tunggu beberapa saat.',
          retryAfterSec: burstStatus.retryAfterSec,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(burstStatus.retryAfterSec || 60) },
        }
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
      .update(`${slug}:${question}`)
      .digest('hex');

    const cachedAnswer = getUserScopedCache<string>(user.id, contextKey);
    if (cachedAnswer) {
      return NextResponse.json({
        success: true,
        answer: cachedAnswer,
        inScope: true,
        isCached: true,
        quota: {
          used: quotaStatus.used,
          limit: quotaStatus.dailyLimit,
          remaining: quotaStatus.remaining,
          reset_at: quotaStatus.resetAt,
        },
      });
    }

    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId : undefined;

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

    const tutorContext = {
      simulatorTitle: body?.simulatorTitle || slug,
      concept: body?.concept,
      formula: body?.formula,
      parameters: body?.parameters || {},
      currentState: body?.currentState || body?.parameters || {},
      derivedResults: body?.derivedResults || body?.computed || {},
      currentInsight: body?.currentInsight,
      activeExperiment: body?.activeExperiment,
      question,
    };

    // 8. Scope Guard Check
    const scope = isQuestionInSimulatorScope(tutorContext);
    if (!scope.relevant) {
      const refusalAnswer = scope.refusalResponse || STANDARD_REFUSAL_RESPONSE;

      if (sessionId) {
        const session = SimulationStorageRepository.getOrCreateSession(sessionId, slug, body?.currentState || {});
        if (!session.userId) session.userId = user.id;
        SimulationStorageRepository.recordChatMessage(sessionId, 'user', question, {
          currentState: body?.currentState,
          derivedResults: body?.derivedResults,
        });
        SimulationStorageRepository.recordChatMessage(sessionId, 'assistant', refusalAnswer);
      }

      return NextResponse.json({
        success: true,
        answer: refusalAnswer,
        inScope: false,
        category: scope.category,
      });
    }

    // 9. Execute Gemini Tutor Call
    const provider = getAiProvider();
    const result = await provider.tutor(tutorContext);

    recordUserDailyUsage(user.id);
    setUserScopedCache(user.id, contextKey, result.answer);

    if (sessionId) {
      const session = SimulationStorageRepository.getOrCreateSession(sessionId, slug, body?.currentState || {});
      if (!session.userId) session.userId = user.id;
      SimulationStorageRepository.recordChatMessage(sessionId, 'user', question, {
        currentState: body?.currentState,
        derivedResults: body?.derivedResults,
      });
      SimulationStorageRepository.recordChatMessage(sessionId, 'assistant', result.answer);
    }

    const updatedQuota = checkUserDailyQuota(user.id, isAdmin);
    return NextResponse.json({
      success: true,
      answer: result.answer,
      inScope: true,
      category: scope.category,
      usage: result.usage,
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
