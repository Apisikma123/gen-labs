import { NextResponse } from 'next/server';
import { SimulationStorageRepository } from '@/lib/storage/session-store';
import { authenticateAdmin } from '@/lib/auth/server-guard';

export async function GET(request: Request) {
  try {
    const auth = await authenticateAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const metrics = SimulationStorageRepository.getMetrics();
    const recentSessions = SimulationStorageRepository.listSessions().slice(-10);

    return NextResponse.json({
      success: true,
      metrics,
      recentSessions,
      serverTime: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mengambil metrik sistem.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
