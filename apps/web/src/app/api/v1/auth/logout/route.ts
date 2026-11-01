import { NextResponse } from 'next/server';
import { extractTokenFromRequest, invalidateServerSession } from '@/lib/auth/server-guard';

export async function POST(request?: Request) {
  if (request) {
    const token = extractTokenFromRequest(request);
    if (token) {
      invalidateServerSession(token);
    }
  }

  const response = NextResponse.json({
    success: true,
    message: 'Berhasil keluar sesi.',
  });

  response.cookies.delete('genlabs_auth_token');
  response.cookies.delete('simula_auth_token');
  response.cookies.delete('genlabs_role');
  response.cookies.delete('simula_role');
  response.cookies.delete('genlabs_user_id');
  response.cookies.delete('simula_user_id');

  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}
