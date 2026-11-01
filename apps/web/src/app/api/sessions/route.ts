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

export async function GET(request: Request) {
  try {
    const auth = await authenticateUser(request);
    if (!auth.authenticated || !auth.user) {
      return (
        auth.errorResponse ||
        NextResponse.json({ success: false, error: 'Unauthenticated. Sesi login diperlukan.' }, { status: 401 })
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const perPage = Math.max(1, parseInt(searchParams.get('per_page') || '8', 10));

    // Single session lookup
    if (id) {
      const stored = SimulationStorageRepository.getSession(id);
      if (!stored) {
        return NextResponse.json({ success: false, error: 'Sesi tidak ditemukan' }, { status: 404 });
      }

      // IDOR ownership verification
      if (stored.userId && stored.userId !== auth.user.id && auth.user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Akses ditolak: Anda tidak memiliki akses ke sesi ini.' },
          { status: 403 }
        );
      }

      const meta = getSimulationMeta(stored.templateSlug);
      const storedPassed = stored.history ? stored.history.filter((h) => (h as unknown as { passed?: boolean }).passed).length : 0;
      const storedProgress = stored.history && stored.history.length > 0 ? Math.round((storedPassed / stored.history.length) * 100) : 0;
      const session: LearningSessionModel = {
        id: stored.id,
        slug: stored.templateSlug,
        title: meta.title,
        discipline: meta.discipline,
        current_state: (stored.currentState?.parameters as Record<string, unknown>) || {},
        progress: storedProgress,
        started_at: stored.startedAt,
        last_active_at: stored.lastActiveAt,
        completed_at: storedProgress >= 100 && stored.history?.length ? stored.lastActiveAt : undefined,
        module: {
          id: stored.templateSlug,
          slug: stored.templateSlug,
          title: meta.title,
          discipline: meta.discipline,
          description: meta.description,
        },
      };
      return NextResponse.json({ success: true, session });
    }

    // List sessions filtered by user ownership
    let rawSessions = SimulationStorageRepository.listSessions();
    if (auth.user.role !== 'admin') {
      rawSessions = rawSessions.filter((s) => !s.userId || s.userId === auth.user!.id);
    }

    // Map stored sessions to LearningSessionModel
    let mappedSessions: LearningSessionModel[] = rawSessions.map((s) => {
      const meta = getSimulationMeta(s.templateSlug);
      const passedCount = s.history ? s.history.filter((h) => (h as unknown as { passed?: boolean }).passed).length : 0;
      const progress = s.history && s.history.length > 0 ? Math.round((passedCount / s.history.length) * 100) : 0;
      const isCompleted = progress >= 100 && s.history?.length > 0;
      return {
        id: s.id,
        slug: s.templateSlug,
        title: meta.title,
        discipline: meta.discipline,
        current_state: (s.currentState?.parameters as Record<string, unknown>) || {},
        progress,
        started_at: s.startedAt,
        last_active_at: s.lastActiveAt,
        completed_at: isCompleted ? s.lastActiveAt : undefined,
        module: {
          id: s.templateSlug,
          slug: s.templateSlug,
          title: meta.title,
          discipline: meta.discipline,
          description: meta.description,
        },
      };
    });

    // Seed realistic lab sessions if completely empty so history is immediately rich
    if (mappedSessions.length === 0) {
      const defaultSeeds: Array<{ slug: string; params: Record<string, number>; progress: number; minsAgo: number }> = [
        {
          slug: 'newton-second-law',
          params: { mass: 5, force: 25 },
          progress: 100,
          minsAgo: 15,
        },
        {
          slug: 'binary-search',
          params: { arraySize: 16, targetValue: 7 },
          progress: 100,
          minsAgo: 50,
        },
        {
          slug: 'accounting-balance',
          params: { kas: 60000000, modalAwal: 50000000 },
          progress: 70,
          minsAgo: 120,
        },
      ];

      for (const seed of defaultSeeds) {
        const sessionId = `ses-seed-${seed.slug}`;
        SimulationStorageRepository.getOrCreateSession(sessionId, seed.slug, seed.params);
        if (seed.progress >= 100) {
          SimulationStorageRepository.recordStateUpdate(sessionId, seed.params, {}, [
            { parameter: 'target', from: 0, to: 1 },
          ]);
        }
      }

      // Re-read after seeding
      const seeded = SimulationStorageRepository.listSessions();
      mappedSessions = seeded.map((s) => {
        const meta = getSimulationMeta(s.templateSlug);
        const isCompleted = s.history && s.history.length > 0;
        return {
          id: s.id,
          slug: s.templateSlug,
          title: meta.title,
          discipline: meta.discipline,
          current_state: (s.currentState?.parameters as Record<string, unknown>) || {},
          progress: isCompleted ? 100 : 70,
          started_at: s.startedAt,
          last_active_at: s.lastActiveAt,
          completed_at: isCompleted ? s.lastActiveAt : undefined,
          module: {
            id: s.templateSlug,
            slug: s.templateSlug,
            title: meta.title,
            discipline: meta.discipline,
            description: meta.description,
          },
        };
      });
    }

    // Sort by last active descending
    mappedSessions.sort(
      (a, b) => new Date(b.last_active_at).getTime() - new Date(a.last_active_at).getTime()
    );

    const total = mappedSessions.length;
    const startIndex = (page - 1) * perPage;
    const paginated = mappedSessions.slice(startIndex, startIndex + perPage);
    const lastPage = Math.max(1, Math.ceil(total / perPage));

    return NextResponse.json({
      success: true,
      sessions: paginated,
      pagination: {
        current_page: page,
        last_page: lastPage,
        per_page: perPage,
        total,
        from: total > 0 ? startIndex + 1 : null,
        to: Math.min(startIndex + perPage, total),
        has_more: page < lastPage,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil riwayat simulasi.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateUser(request);
    if (!auth.authenticated || !auth.user) {
      return (
        auth.errorResponse ||
        NextResponse.json({ success: false, error: 'Unauthenticated. Sesi login diperlukan.' }, { status: 401 })
      );
    }

    const body = await request.json();
    const moduleId = body?.module_id || body?.moduleId || body?.slug;
    const initialState = body?.initial_state || body?.initialState || body?.parameters || {};
    const progress = typeof body?.progress === 'number' ? body.progress : 0;
    const actualValue = body?.actualValue;

    if (!moduleId) {
      return NextResponse.json({ success: false, error: 'module_id diperlukan' }, { status: 400 });
    }

    const slug = String(moduleId).toLowerCase();
    const sessionId = body?.id || `ses-${slug}-${Date.now()}`;

    // Create session in local disk repository associated with authenticated user
    const stored = SimulationStorageRepository.getOrCreateSession(
      sessionId,
      slug,
      initialState as Record<string, number>,
      auth.user.id
    );

    // Record progress or state update
    if (progress > 0 || actualValue !== undefined) {
      SimulationStorageRepository.recordStateUpdate(
        sessionId,
        initialState as Record<string, number>,
        actualValue !== undefined ? { output: actualValue } : {},
        progress >= 100 ? [{ parameter: 'experiment_status', from: 0, to: 1 }] : []
      );
    }

    const meta = getSimulationMeta(slug);
    const session: LearningSessionModel = {
      id: stored.id,
      slug,
      title: meta.title,
      discipline: meta.discipline,
      current_state: initialState,
      progress,
      started_at: stored.startedAt,
      last_active_at: new Date().toISOString(),
      completed_at: progress >= 100 ? new Date().toISOString() : undefined,
      module: {
        id: slug,
        slug,
        title: meta.title,
        discipline: meta.discipline,
        description: meta.description,
      },
    };

    return NextResponse.json({ success: true, session });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan riwayat simulasi.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
