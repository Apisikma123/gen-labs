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
import type { UnifiedSimulatorSpec } from '@/lib/simulation/simulator-schema';
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
          error: 'Layanan AI GEN LABS belum dikonfigurasi.',
          configured: false,
        },
        { status: 503 }
      );
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const rateLimit = checkAiRateLimit(`ai:patch:${ip}`, 20, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Batas revisi simulator tercapai. Harap tunggu beberapa saat.',
          retryAfterSec: rateLimit.retryAfterSec,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSec || 60) },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const instruction = typeof body?.instruction === 'string' ? body.instruction.trim() : '';
    const spec = body?.spec as UnifiedSimulatorSpec;

    const lengthValidation = validateInputLength(instruction, 1000, 'Instruksi revisi simulator');
    if (!lengthValidation.valid) {
      return NextResponse.json(
        { error: lengthValidation.error },
        { status: 400 }
      );
    }

    const injectionCheck = checkPromptInjection(instruction);
    if (injectionCheck.isInjection) {
      return NextResponse.json(
        { error: 'Instruksi ditolak karena terdeteksi pola yang tidak diizinkan.' },
        { status: 400 }
      );
    }

    if (!spec || !spec.info || !spec.parameters) {
      return NextResponse.json(
        { error: 'Data spesifikasi simulator saat ini diperlukan untuk operasi patch.' },
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
    const result = await provider.patchSimulator(spec, instruction, {
      selectedElement: body?.selectedElement,
    });

    return NextResponse.json({
      success: true,
      patched: result.patched,
      patches: result.patches,
      appliedCount: result.appliedCount,
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
