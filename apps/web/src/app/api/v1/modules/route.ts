import { NextResponse } from 'next/server';
import { ACTIVE_SIMULATION_CATALOG } from '@genlab/simulation-core';
import { SimulationStorageRepository, type StoredSimulationTemplate } from '@/lib/storage/session-store';
import type { ModuleModel, PaginationMeta } from '@/lib/api/modules';

function storedTemplateToModule(tpl: StoredSimulationTemplate, idx: number): ModuleModel {
  const spec = tpl.unifiedSpec;
  return {
    id: idx + 5000,
    slug: tpl.slug,
    title: tpl.title,
    description: tpl.prompt || tpl.definition?.description || '',
    discipline: tpl.domain,
    difficulty: (spec?.info?.difficulty as any) || 'basic',
    topic: spec?.info?.topic || tpl.definition?.concepts?.[0] || 'Konsep Dasar',
    estimated_time: spec?.info?.estimatedTime || '10–15 menit',
    content: tpl.prompt || tpl.definition?.description || '',
    learning_objectives: tpl.definition?.concepts || [
      'Memahami hubungan kausal antar parameter',
      'Menguji kondisi batas dan respon sistem',
    ],
    target_audience: 'Umum / Pelajar',
    thumbnail_image: spec?.info?.thumbnailUrl || null,
    cover_image: spec?.info?.coverUrl || null,
    status: tpl.status as any,
    created_at: tpl.createdAt,
    updated_at: tpl.createdAt,
    simulations: [
      {
        id: idx + 5000,
        slug: tpl.slug,
        title: tpl.title,
        type: tpl.engine || 'universal',
      },
    ],
  };
}

function catalogToModule(cat: any, idx: number): ModuleModel {
  const diff: 'basic' | 'intermediate' | 'advanced' =
    cat.difficulty === 'Lanjutan'
      ? 'advanced'
      : cat.difficulty === 'Menengah'
      ? 'intermediate'
      : 'basic';

  return {
    id: idx + 1000,
    slug: cat.slug,
    title: cat.title,
    description: cat.description,
    discipline: cat.discipline,
    difficulty: diff,
    topic: cat.category || cat.discipline,
    estimated_time: '15–20 menit',
    content: cat.description,
    learning_objectives: cat.learningObjectives || [
      'Memahami hubungan sebab-akibat antar parameter sistem.',
      'Mengamati respons dinamis sistem secara realtime.',
      'Menganalisis hasil eksperimen secara mandiri.',
    ],
    target_audience: 'Umum / Pelajar',
    thumbnail_image: null,
    cover_image: null,
    status: 'published',
    simulations: [
      {
        id: idx + 1000,
        slug: cat.slug,
        title: cat.title,
        type: cat.engine || 'universal',
        formula: cat.formula,
      },
    ],
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';
    const discipline = searchParams.get('discipline') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const topic = searchParams.get('topic') || '';
    const status = searchParams.get('status') || '';
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const perPage = Math.max(1, parseInt(searchParams.get('per_page') || '10', 10));

    // 1. Gather all modules from database templates + catalog
    const storedTemplates = SimulationStorageRepository.listTemplates();
    const storedSlugs = new Set(storedTemplates.map((t) => t.slug));

    const allModules: ModuleModel[] = [];

    // Add stored database modules
    storedTemplates.forEach((tpl, idx) => {
      allModules.push(storedTemplateToModule(tpl, idx));
    });

    // Add catalog modules not already stored in DB
    ACTIVE_SIMULATION_CATALOG.forEach((cat, idx) => {
      if (!storedSlugs.has(cat.slug)) {
        allModules.push(catalogToModule(cat, idx));
      }
    });

    // Calculate stats before filtering
    const stats = {
      total: allModules.length,
      published: allModules.filter((m) => m.status === 'published').length,
      draft: allModules.filter((m) => m.status === 'draft').length,
      archived: allModules.filter((m) => m.status === 'archived').length,
    };

    // 2. Apply Filters
    let filtered = allModules;

    // Student view: only published
    if (!isAdmin) {
      filtered = filtered.filter((m) => m.status === 'published');
    } else if (status && status !== 'all') {
      filtered = filtered.filter((m) => m.status === status);
    }

    if (discipline && discipline !== 'all') {
      filtered = filtered.filter((m) => m.discipline.toLowerCase() === discipline.toLowerCase());
    }

    if (difficulty && difficulty !== 'all') {
      filtered = filtered.filter((m) => m.difficulty === difficulty);
    }

    if (topic && topic !== 'all') {
      filtered = filtered.filter((m) => (m.topic || '').toLowerCase().includes(topic.toLowerCase()));
    }

    if (search) {
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(search) ||
          m.description.toLowerCase().includes(search) ||
          m.discipline.toLowerCase().includes(search) ||
          m.slug.toLowerCase().includes(search)
      );
    }

    // 3. Paginate
    const total = filtered.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const validPage = Math.min(page, lastPage);
    const startIndex = (validPage - 1) * perPage;
    const paginatedModules = filtered.slice(startIndex, startIndex + perPage);

    const pagination: PaginationMeta = {
      current_page: validPage,
      last_page: lastPage,
      per_page: perPage,
      total,
      from: total > 0 ? startIndex + 1 : 0,
      to: Math.min(startIndex + perPage, total),
      has_more: validPage < lastPage,
    };

    return NextResponse.json({
      success: true,
      count: paginatedModules.length,
      modules: paginatedModules,
      stats,
      pagination,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat modul.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const slug = body.simulation_slug || body.slug || `sim-${Date.now()}`;
    const status = body.status || 'published';

    // Construct unified spec if passed or create from metadata
    let unifiedSpec = body.unifiedSpec;
    if (!unifiedSpec) {
      unifiedSpec = {
        id: `sim-${slug}`,
        slug,
        info: {
          title: body.title || 'Simulasi Baru',
          description: body.description || '',
          discipline: body.discipline || 'Fisika',
          topic: body.topic || 'Konsep Dasar',
          difficulty: body.difficulty || 'basic',
          estimatedTime: body.estimated_time || '10–15 menit',
          thumbnailUrl: body.thumbnail_image || null,
          coverUrl: body.cover_image || null,
          status,
          version: 1,
        },
        parameters: body.parameters || {
          param1: {
            key: 'param1',
            label: 'Variabel Utama',
            min: 0,
            max: 100,
            step: 1,
            defaultVal: 50,
            unit: '',
          },
        },
        calculations: body.calculations || {},
        visual: body.visual || {
          viewBox: { width: 640, height: 360 },
          archetype: 'universal',
          groundPlane: true,
          elements: [],
        },
        results: body.results || [],
        insight: body.insight || { summary: '', causeAndEffect: '' },
        experiments: body.experiment ? [body.experiment] : [],
      };
    } else {
      unifiedSpec.info.status = status;
      if (body.cover_image) unifiedSpec.info.coverUrl = body.cover_image;
      if (body.thumbnail_image) unifiedSpec.info.thumbnailUrl = body.thumbnail_image;
    }

    const saved = SimulationStorageRepository.saveUnifiedTemplate(unifiedSpec);

    return NextResponse.json({
      success: true,
      message: status === 'published' ? 'Modul berhasil diterbitkan!' : 'Draft modul berhasil disimpan.',
      module: storedTemplateToModule(saved, 1),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menyimpan modul.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
