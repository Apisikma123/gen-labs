import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { verifyUserCredentials, registerServerSession } from '@/lib/auth/server-guard';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email dan kata sandi diperlukan.',
        },
        { status: 400 }
      );
    }

    // Server-side credential verification (NEVER trusts client-provided role or email substring)
    const user = await verifyUserCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email atau kata sandi tidak valid.',
        },
        { status: 401 }
      );
    }

    // Generate cryptographically secure server token
    const token = `genlabs_token_${crypto.randomBytes(24).toString('hex')}`;
    registerServerSession(token, user);

    const response = NextResponse.json({
      success: true,
      token,
      user,
      message: `Berhasil masuk sebagai ${user.role === 'admin' ? 'Administrator' : 'Pengguna'}.`,
    });

    const isProduction = process.env.NODE_ENV === 'production';
    // Set authenticated cookie with HttpOnly, Secure (in production/HTTPS), SameSite=Lax
    response.cookies.set('genlabs_auth_token', token, {
      path: '/',
      httpOnly: true,
      secure: isProduction,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });
    response.cookies.set('simula_auth_token', token, {
      path: '/',
      httpOnly: true,
      secure: isProduction,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memproses otentikasi.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
