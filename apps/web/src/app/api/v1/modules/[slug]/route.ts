import { NextResponse } from 'next/server';
import { SimulationStorageRepository } from '@/lib/storage/session-store';
import { ACTIVE_SIMULATION_CATALOG } from '@genlab/simulation-core';
import type { ModuleModel } from '@/lib/api/modules';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const clean = slug.trim().toLowerCase();

    // 1. Check database storage
    const stored = SimulationStorageRepository.getTemplate(clean);
    if (stored) {
      const spec = stored.unifiedSpec;
      const mod: ModuleModel = {
        id: 5001,
        slug: stored.slug,
        title: stored.title,
        description: stored.prompt || stored.definition?.description || '',
        discipline: stored.domain,
        difficulty: (spec?.info?.difficulty as any) || 'basic',
        topic: spec?.info?.topic || stored.definition?.concepts?.[0] || 'Konsep Dasar',
        estimated_time: spec?.info?.estimatedTime || '10–15 menit',
        content: stored.prompt || stored.definition?.description || '',
        learning_objectives: stored.definition?.concepts || ['Memahami konsep inti sistem'],
        target_audience: 'Umum / Pelajar',
        thumbnail_image: spec?.info?.thumbnailUrl || null,
        cover_image: spec?.info?.coverUrl || null,
        status: stored.status as any,
        created_at: stored.createdAt,
        updated_at: stored.createdAt,
        simulations: [
          {
            id: 5001,
            slug: stored.slug,
            title: stored.title,
            type: stored.engine || 'universal',
          },
        ],
      };
      return NextResponse.json({ success: true, module: mod });
    }

    // 2. Check catalog
    const cat = ACTIVE_SIMULATION_CATALOG.find((c) => c.slug === clean);
    if (cat) {
      const mod: ModuleModel = {
        id: 1001,
        slug: cat.slug,
        title: cat.title,
        description: cat.description,
        discipline: cat.discipline,
        difficulty: 'basic',
        topic: cat.category || cat.discipline,
        estimated_time: '15–20 menit',
        content: cat.description,
        learning_objectives: cat.learningObjectives || ['Memahami hubungan kausal parameter'],
        target_audience: 'Umum / Pelajar',
        thumbnail_image: null,
        cover_image: null,
        status: 'published',
        simulations: [
          {
            id: 1001,
            slug: cat.slug,
            title: cat.title,
            type: cat.engine || 'universal',
            formula: cat.formula,
          },
        ],
      };
      return NextResponse.json({ success: true, module: mod });
    }

    return NextResponse.json({ error: 'Modul tidak ditemukan.' }, { status: 404 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat modul.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const clean = slug.trim().toLowerCase();
    const body = await request.json().catch(() => ({}));

    // Update status if present
    if (body.status) {
      SimulationStorageRepository.updateTemplateStatus(clean, body.status);
    }

    const tpl = SimulationStorageRepository.getTemplate(clean);
    if (tpl && tpl.unifiedSpec) {
      if (body.title) tpl.unifiedSpec.info.title = body.title;
      if (body.description) tpl.unifiedSpec.info.description = body.description;
      if (body.discipline) tpl.unifiedSpec.info.discipline = body.discipline;
      if (body.topic) tpl.unifiedSpec.info.topic = body.topic;
      if (body.difficulty) tpl.unifiedSpec.info.difficulty = body.difficulty;
      if (body.cover_image) tpl.unifiedSpec.info.coverUrl = body.cover_image;
      if (body.thumbnail_image) tpl.unifiedSpec.info.thumbnailUrl = body.thumbnail_image;
      if (body.status) tpl.unifiedSpec.info.status = body.status;
      SimulationStorageRepository.saveUnifiedTemplate(tpl.unifiedSpec);
    }

    return NextResponse.json({
      success: true,
      message: 'Modul berhasil diperbarui.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memperbarui modul.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
