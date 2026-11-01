import { NextResponse } from 'next/server';
import { getPublicAiStatus } from '@/lib/ai/config';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai/health
 * Public health status of the Gen Labs Gemini AI service.
 * NEVER returns the API key or secret credentials.
 */
export async function GET() {
  const status = getPublicAiStatus();
  return NextResponse.json(status, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
