import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Fitur AI Studio telah dinonaktifkan.' },
    { status: 410 }
  );
}
