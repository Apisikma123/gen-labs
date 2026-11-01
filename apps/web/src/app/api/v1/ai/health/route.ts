import { NextResponse } from 'next/server';
import { getPublicAiStatus } from '@/lib/ai/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = getPublicAiStatus();
  return NextResponse.json(status, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
