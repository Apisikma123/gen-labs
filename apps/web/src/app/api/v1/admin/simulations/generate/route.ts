import { NextResponse } from 'next/server';
import {
  getAiProvider,
  isAiConfigured,
  checkAiRateLimit,
  checkPromptInjection,
  validateInputLength,
  sanitizeAiErrorMessage,
  acquireInflightLock,
  releaseInflightLock,
} from '@/lib/ai';
import { authenticateAdmin } from '@/lib/auth/server-guard';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const auth = await authenticateAdmin(request);
  if (auth.errorResponse || !auth.user) return auth.errorResponse!;

  let hasAcquiredLock = false;

  try {
    if (!isAiConfigured()) {
      return NextResponse.json(
        {
          error: 'Layanan AI GEN LABS belum dikonfigurasi. Pastikan GEMINI_API_KEY disetel di server.',
          configured: false,
        },
        { status: 503 }
      );
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const rateLimit = checkAiRateLimit(`ai:generate:${ip}`, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Batas pembuatan simulator tercapai. Harap tunggu beberapa saat.',
          retryAfterSec: rateLimit.retryAfterSec,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSec || 60) },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';

    const lengthValidation = validateInputLength(prompt, 2000, 'Prompt konsep simulator');
    if (!lengthValidation.valid) {
      return NextResponse.json(
        { error: lengthValidation.error },
        { status: 400 }
      );
    }

    const injectionCheck = checkPromptInjection(prompt);
    if (injectionCheck.isInjection) {
      return NextResponse.json(
        { error: 'Prompt ditolak karena terdeteksi instruksi yang tidak diizinkan.' },
        { status: 400 }
      );
    }

    if (!acquireInflightLock(auth.user.id)) {
      return NextResponse.json(
        { error: 'Permintaan AI Anda sebelumnya masih diproses. Harap tunggu sebentar.' },
        { status: 429 }
      );
    }
    hasAcquiredLock = true;

    const provider = getAiProvider();
    const spec = await provider.generateSimulator(prompt, {
      concept: body?.topic || prompt,
      learningObjective: body?.learningObjective,
      difficulty: body?.difficulty,
      discipline: body?.discipline,
    });

    return NextResponse.json({
      success: true,
      spec,
    });
  } catch (error: any) {
    const sanitized = sanitizeAiErrorMessage(error);
    return NextResponse.json({ error: sanitized.message }, { status: sanitized.status });
  } finally {
    if (hasAcquiredLock) {
      releaseInflightLock(auth.user.id);
    }
  }
}
