import { NextResponse } from 'next/server';
import { ACTIVE_SIMULATION_CATALOG } from '@genlab/simulation-core';
import { SimulationStorageRepository, type SimulationStatus } from '@/lib/storage/session-store';
import { authenticateAdmin } from '@/lib/auth/server-guard';

export async function GET(request: Request) {
  try {
    const auth = await authenticateAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const storedTemplates = SimulationStorageRepository.listTemplates();
    const storedBySlug = new Map(storedTemplates.map(t => [t.slug, t]));

    // Merge static catalog with stored templates
    const simulations = ACTIVE_SIMULATION_CATALOG.map((item) => {
      const stored = storedBySlug.get(item.slug);
      return {
        id: item.id,
        slug: item.slug,
        title: item.title,
        discipline: item.discipline,
        disciplineSlug: item.disciplineSlug,
        engine: item.engine,
        category: item.category,
        formula: item.formula || '-',
        difficulty: item.difficulty,
        status: (stored?.status || 'published') as SimulationStatus,
        version: stored?.version || 1,
        usageCount: stored?.usageCount || 42,
        isAiGenerated: false,
        learningObjectives: item.learningObjectives,
      };
    });

    // Add organic AI generated templates that aren't in static catalog
    for (const tpl of storedTemplates) {
      if (!simulations.some(s => s.slug === tpl.slug)) {
        simulations.push({
          id: tpl.id,
          slug: tpl.slug,
          title: tpl.title,
          discipline: tpl.domain,
          disciplineSlug: tpl.domain.toLowerCase(),
          engine: tpl.engine as any,
          category: 'AI Generated',
          formula: '-',
          difficulty: 'Menengah',
          status: tpl.status,
          version: tpl.version,
          usageCount: tpl.usageCount || 1,
          isAiGenerated: true,
          learningObjectives: tpl.definition.concepts || [],
        });
      }
    }

    return NextResponse.json({
      success: true,
      total: simulations.length,
      simulations,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mengambil daftar simulasi admin.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await authenticateAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json().catch(() => ({}));
    const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
    const status = body?.status as SimulationStatus;

    const allowedStatuses: SimulationStatus[] = ['published', 'draft', 'validating', 'archived', 'active'];

    if (!slug || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Parameter slug dan status (published, draft, validating, archived) valid diperlukan.' },
        { status: 400 }
      );
    }

    // If template exists in storage, update it
    let updated = SimulationStorageRepository.updateTemplateStatus(slug, status);

    // If template is only in catalog so far, initialize its stored record with new status
    if (!updated) {
      const catalogItem = ACTIVE_SIMULATION_CATALOG.find(c => c.slug === slug);
      if (catalogItem) {
        updated = SimulationStorageRepository.saveGeneratedTemplate(
          {
            simulation: catalogItem.slug,
            title: catalogItem.title,
            description: catalogItem.description,
            domain: catalogItem.discipline,
            engine: catalogItem.engine,
            version: 1,
            parameters: {},
            controls: [],
          },
          catalogItem.title
        );
        updated = SimulationStorageRepository.updateTemplateStatus(slug, status);
      }
    }

    return NextResponse.json({
      success: true,
      slug,
      status,
      message: `Status modul ${slug} berhasil diperbarui menjadi "${status}".`,
      updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memperbarui status simulasi.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
