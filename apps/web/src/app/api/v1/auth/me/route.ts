import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth/server-guard';

export async function GET(request?: Request) {
  try {
    // If request is not passed directly (e.g. server component without args), construct or handle
    if (!request) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    const auth = await authenticateUser(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: auth.user,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memeriksa sesi pengguna.';
    return NextResponse.json({ authenticated: false, user: null, error: message }, { status: 500 });
  }
}
