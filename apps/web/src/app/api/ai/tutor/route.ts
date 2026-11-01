import { NextResponse } from 'next/server';
import {
  getAiProvider,
  checkUserBurstRateLimit,
  checkUserDailyQuota,
  recordUserDailyUsage,
} from '@/lib/ai';
import { authenticateUser } from '@/lib/auth/server-guard';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const backendBase =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:8000/api';
  const targetUrl = `${backendBase.replace(/\/+$/, '')}/ai/tutor`;

  let rawBodyText = '';
  try {
    rawBodyText = await request.text();
    const forwardHeaders = new Headers();
    forwardHeaders.set('Content-Type', 'application/json');
    forwardHeaders.set('Accept', 'application/json');

    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      forwardHeaders.set('authorization', authHeader);
    }

    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      forwardHeaders.set('cookie', cookieHeader);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const backendRes = await fetch(targetUrl, {
      method: 'POST',
      headers: forwardHeaders,
      body: rawBodyText,
      signal: controller.signal,
    });
    if (backendRes.status === 401 || backendRes.status === 403) {
      const data = await backendRes.json().catch(() => ({ success: false, error: 'Unauthenticated' }));
      return NextResponse.json(data, { status: backendRes.status });
    }

    if (backendRes.ok) {
      const data = await backendRes.json().catch(() => ({}));
      return NextResponse.json(data, { status: backendRes.status });
    }
  } catch {
    // Backend offline / connection refused / timeout -> fallback to internal Gemini provider
  }

  // Graceful Standalone Fallback using Next.js AI Provider
  try {
    const auth = await authenticateUser(request);
    if (!auth.authenticated || !auth.user) {
      return (
        auth.errorResponse ||
        NextResponse.json(
          {
            success: false,
            code: 'UNAUTHENTICATED',
            error: 'Silakan login terlebih dahulu untuk menggunakan AI Tutor.',
          },
          { status: 401 }
        )
      );
    }
    const userId = auth.user.id;
    const isAdmin = auth.user.role === 'admin';

    // Check rate limit
    const burst = checkUserBurstRateLimit(userId);
    if (!burst.allowed) {
      return NextResponse.json(
        {
          success: false,
          code: 'AI_RATE_LIMITED',
          error: 'Terlalu banyak permintaan berturut-turut. Tunggu beberapa saat.',
          retry_after_seconds: burst.retryAfterSec,
        },
        { status: 429 }
      );
    }

    const quota = checkUserDailyQuota(userId, isAdmin);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          success: false,
          code: 'DAILY_AI_QUOTA_EXCEEDED',
          error: 'Batas 5 konsultasi AI per hari telah habis. Kuota akan direset pukul 00:00 WIB.',
          quota: {
            daily_limit: quota.dailyLimit,
            used: quota.used,
            remaining: 0,
            reset_at: quota.resetAt,
          },
        },
        { status: 429 }
      );
    }

    const body = rawBodyText ? JSON.parse(rawBodyText) : {};
    const question = typeof body.question === 'string' ? body.question : '';
    if (!question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Pertanyaan tidak boleh kosong.' },
        { status: 400 }
      );
    }

    const ai = getAiProvider();
    const tutorResult = await ai.tutor({
      simulatorTitle: body.context?.discipline || 'Laboratorium Sains & Komputasi',
      question,
      parameters: {},
      currentState: (body.state as Record<string, number>) || {},
      derivedResults: {},
    });

    recordUserDailyUsage(userId);
    const updatedQuota = checkUserDailyQuota(userId, isAdmin);

    return NextResponse.json({
      success: true,
      answer: tutorResult.answer,
      explanation: tutorResult.answer,
      action: tutorResult.suggestedAction,
      quota: {
        daily_limit: updatedQuota.dailyLimit,
        used: updatedQuota.used,
        remaining: updatedQuota.remaining,
        reset_at: updatedQuota.resetAt,
      },
    });
  } catch (fallbackErr: any) {
    return NextResponse.json(
      {
        success: false,
        error: fallbackErr?.message || 'Gagal memproses pertanyaan ke AI.',
      },
      { status: 500 }
    );
  }
}
