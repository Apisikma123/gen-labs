import { NextResponse } from 'next/server';
import { checkUserDailyQuota } from '@/lib/ai/protection';
import { authenticateUser } from '@/lib/auth/server-guard';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const backendBase =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:8000/api';
  const targetUrl = `${backendBase.replace(/\/+$/, '')}/ai/usage`;

  try {
    const forwardHeaders = new Headers();
    forwardHeaders.set('Accept', 'application/json');

    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      forwardHeaders.set('authorization', authHeader);
    }
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      forwardHeaders.set('cookie', cookieHeader);
    }

    const backendRes = await fetch(targetUrl, {
      method: 'GET',
      headers: forwardHeaders,
    });

    if (backendRes.status === 401 || backendRes.status === 403) {
      const data = await backendRes.json().catch(() => ({ success: false, error: 'Unauthenticated' }));
      return NextResponse.json(data, { status: backendRes.status });
    }

    if (backendRes.ok) {
      const data = await backendRes.json().catch(() => null);
      if (data) {
        return NextResponse.json(data, { status: backendRes.status });
      }
    }
  } catch {}

  // Fallback to local quota calculation
  const auth = await authenticateUser(request);
  if (!auth.authenticated || !auth.user) {
    return (
      auth.errorResponse ||
      NextResponse.json(
        {
          success: false,
          error: 'Unauthenticated. Sesi otentikasi diperlukan.',
        },
        { status: 401 }
      )
    );
  }
  const userId = auth.user.id;
  const isAdmin = auth.user.role === 'admin';
  const quota = checkUserDailyQuota(userId, isAdmin);

  return NextResponse.json({
    daily_limit: quota.dailyLimit,
    used: quota.used,
    remaining: quota.remaining,
    reset_at: quota.resetAt,
    rate_limit: {
      limit: 5,
      window_minutes: 10,
    },
  });
}
