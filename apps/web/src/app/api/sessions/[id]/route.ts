import { NextResponse } from 'next/server';
import { SimulationStorageRepository } from '@/lib/storage/session-store';
import { ACTIVE_SIMULATION_CATALOG } from '@genlab/simulation-core';
import type { LearningSessionModel } from '@/lib/api/sessions';
import { authenticateUser } from '@/lib/auth/server-guard';

function getSimulationMeta(slugOrId: string | number) {
  const str = String(slugOrId).toLowerCase();
  return (
    ACTIVE_SIMULATION_CATALOG.find(
      (c) => c.slug.toLowerCase() === str || String(c.id).toLowerCase() === str || c.title.toLowerCase() === str
    ) || {
      id: str,
      slug: str,
      title: str.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      discipline: 'Sains Komputasi',
      description: 'Eksperimen simulasi interaktif laboratorium.',
    }
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateUser(request);
    if (!auth.authenticated || !auth.user) {
      return (
        auth.errorResponse ||
        NextResponse.json({ success: false, error: 'Unauthenticated. Sesi login diperlukan.' }, { status: 401 })
      );
    }

    const { id } = await params;
    const stored = SimulationStorageRepository.getSession(id);
    if (!stored) {
      return NextResponse.json({ success: false, error: 'Sesi tidak ditemukan' }, { status: 404 });
    }

    // IDOR ownership protection: students can only access their own sessions
    if (stored.userId && stored.userId !== auth.user.id && auth.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Anda tidak memiliki hak untuk melihat sesi ini.' },
        { status: 403 }
      );
    }

    const meta = getSimulationMeta(stored.templateSlug);
    const passedCount = stored.history ? stored.history.filter((h) => (h as unknown as { passed?: boolean }).passed).length : 0;
    const progress = stored.history && stored.history.length > 0 ? Math.round((passedCount / stored.history.length) * 100) : 0;
    const session: LearningSessionModel = {
      id: stored.id,
      slug: stored.templateSlug,
      title: meta.title,
      discipline: meta.discipline,
      current_state: (stored.currentState?.parameters as Record<string, unknown>) || {},
      progress,
      started_at: stored.startedAt,
      last_active_at: stored.lastActiveAt,
      completed_at: progress >= 100 && stored.history?.length ? stored.lastActiveAt : undefined,
      module: {
        id: stored.templateSlug,
        slug: stored.templateSlug,
        title: meta.title,
        discipline: meta.discipline,
        description: meta.description,
      },
    };

    return NextResponse.json({ success: true, session });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil sesi.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateUser(request);
    if (!auth.authenticated || !auth.user) {
      return (
        auth.errorResponse ||
        NextResponse.json({ success: false, error: 'Unauthenticated. Sesi login diperlukan.' }, { status: 401 })
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const state = body?.state || body?.parameters || {};
    const progress = typeof body?.progress === 'number' ? body.progress : undefined;

    let stored = SimulationStorageRepository.getSession(id);
    if (!stored) {
      stored = SimulationStorageRepository.getOrCreateSession(id, id, state as Record<string, number>, auth.user.id);
    } else if (stored.userId && stored.userId !== auth.user.id && auth.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Anda tidak memiliki hak untuk mengubah sesi ini.' },
        { status: 403 }
      );
    }

    SimulationStorageRepository.recordStateUpdate(
      id,
      state as Record<string, number>,
      {},
      progress && progress >= 100 ? [{ parameter: 'completed', from: 0, to: 1 }] : []
    );

    const meta = getSimulationMeta(stored.templateSlug);
    const session: LearningSessionModel = {
      id: stored.id,
      slug: stored.templateSlug,
      title: meta.title,
      discipline: meta.discipline,
      current_state: state,
      progress: progress ?? (stored.history && stored.history.length > 0 ? 100 : 70),
      started_at: stored.startedAt,
      last_active_at: new Date().toISOString(),
      completed_at: progress && progress >= 100 ? new Date().toISOString() : undefined,
      module: {
        id: stored.templateSlug,
        slug: stored.templateSlug,
        title: meta.title,
        discipline: meta.discipline,
        description: meta.description,
      },
    };

    return NextResponse.json({ success: true, session });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memperbarui sesi.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
