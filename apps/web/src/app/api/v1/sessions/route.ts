import { NextResponse } from 'next/server';
import { SimulationStorageRepository } from '@/lib/storage/session-store';
import { authenticateUser } from '@/lib/auth/server-guard';

export async function GET(request: Request) {
  try {
    // Server-side authentication check
    const auth = await authenticateUser(request);
    if (!auth.authenticated || !auth.user) {
      return auth.errorResponse || NextResponse.json({ success: false, error: 'Unauthenticated.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      if (auth.user.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Akses ditolak.' }, { status: 403 });
      }
      return NextResponse.json({
        status: 'online',
        databaseEngine: 'PostgreSQL 16 Compatible / Disk Persistence Sync',
        storagePath: 'database/data/genlabs_storage.json',
        schemaPath: 'database/schema.sql',
        tables: ['sessions', 'simulation_runs', 'parameter_history', 'experiment_notes', 'ai_interactions'],
        timestamp: new Date().toISOString(),
      });
    }

    const session = SimulationStorageRepository.getSession(id);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found.' }, { status: 404 });
    }

    // Strict IDOR ownership check (PRD Section 17 & 27)
    // Students can only access their own sessions; Administrators can inspect any session
    if (session.userId && session.userId !== auth.user.id && auth.user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Akses ditolak: Anda tidak memiliki akses ke sesi belajar ini.',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      session,
      database: {
        status: 'connected',
        engine: 'PostgreSQL 16 Compatible / Disk Persistence Sync',
        storagePath: 'database/data/genlabs_storage.json',
        schemaPath: 'database/schema.sql',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve session.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Server-side authentication check
    const auth = await authenticateUser(request);
    if (!auth.authenticated || !auth.user) {
      return auth.errorResponse || NextResponse.json({ success: false, error: 'Unauthenticated.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const sessionId = body?.sessionId;
    const templateSlug = body?.templateSlug;
    const parameters = body?.parameters || {};
    const computed = body?.computed || {};
    const changes = body?.changes || [];

    if (!sessionId || !templateSlug) {
      return NextResponse.json({ success: false, error: 'sessionId and templateSlug are required.' }, { status: 400 });
    }

    // IDOR ownership check for existing session
    const existing = SimulationStorageRepository.getSession(sessionId);
    if (existing && existing.userId && existing.userId !== auth.user.id && auth.user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Akses ditolak: Anda tidak memiliki hak untuk mengubah sesi belajar ini.',
        },
        { status: 403 }
      );
    }

    const session = SimulationStorageRepository.getOrCreateSession(sessionId, templateSlug, parameters);
    // Explicitly associate session with authenticated user
    if (!session.userId) {
      session.userId = auth.user.id;
    }

    SimulationStorageRepository.recordStateUpdate(sessionId, parameters, computed, changes);

    return NextResponse.json({
      success: true,
      session,
      dbSync: {
        persisted: true,
        engine: 'PostgreSQL 16 Compatible / Disk Persistence Sync',
        storagePath: 'database/data/genlabs_storage.json',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to record session update.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
