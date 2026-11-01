import { NextResponse } from 'next/server';
import {
  getAiProvider,
  acquireInflightLock,
  releaseInflightLock,
  checkUserDailyQuota,
  recordUserDailyUsage,
  checkUserBurstRateLimit,
  checkPromptInjection,
  validateInputLength,
} from '@/lib/ai';
import { SimulationStorageRepository } from '@/lib/storage/session-store';
import { authenticateUser } from '@/lib/auth/server-guard';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 1. Authoritative Authentication Check
    const auth = await authenticateUser(request);
    if (!auth.authenticated || !auth.user) {
      return auth.errorResponse || NextResponse.json(
        { error: 'Unauthenticated. Sesi login diperlukan untuk membuat simulasi.' },
        { status: 401 }
      );
    }

    const user = auth.user;
    const isAdmin = user.role === 'admin';

    // 2. Input validation & size limit
    const body = await request.json().catch(() => ({}));
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';

    const lengthValidation = validateInputLength(prompt, 1000, 'Prompt simulasi');
    if (!lengthValidation.valid) {
      return NextResponse.json(
        { error: lengthValidation.error },
        { status: 400 }
      );
    }

    // 3. Prompt Injection Defense
    const injectionCheck = checkPromptInjection(prompt);
    if (injectionCheck.isInjection) {
      return NextResponse.json(
        { error: 'Prompt ditolak karena terdeteksi instruksi yang tidak diizinkan.' },
        { status: 400 }
      );
    }

    // 4. Rate Limiting & Quota
    const burstStatus = checkUserBurstRateLimit(user.id, isAdmin);
    if (!burstStatus.allowed) {
      return NextResponse.json(
        { error: 'Batas frekuensi pembuatan simulasi tercapai. Harap tunggu beberapa saat.' },
        { status: 429, headers: { 'Retry-After': String(burstStatus.retryAfterSec || 60) } }
      );
    }

    const quotaStatus = checkUserDailyQuota(user.id, isAdmin);
    if (!quotaStatus.allowed) {
      return NextResponse.json(
        { error: `Batas kuota harian AI Anda telah tercapai (${quotaStatus.dailyLimit} permintaan/hari).` },
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

    try {
      const ai = getAiProvider();
      const spec = await ai.generateSimulation(prompt);

      recordUserDailyUsage(user.id);

      // Save generated template for organic library growth and reuse (Section 17 & 18)
      const savedTemplate = SimulationStorageRepository.saveGeneratedTemplate(spec, prompt);

      return NextResponse.json({
        specification: spec,
        savedTemplate: {
          id: savedTemplate.id,
          slug: savedTemplate.slug,
          version: savedTemplate.version,
          createdAt: savedTemplate.createdAt,
        },
        generated: true,
      });
    } finally {
      releaseInflightLock(user.id);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown generation failure.';
    const isUnsupported = message.includes("doesn't have a simulation engine") || message.includes("belum memiliki engine");

    return NextResponse.json(
      {
        error: message,
        unsupported: isUnsupported,
      },
      { status: isUnsupported ? 422 : 500 }
    );
  }
}
