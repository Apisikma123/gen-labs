import { NextResponse } from 'next/server';
import { SimulationStorageRepository } from '@/lib/storage/session-store';
import { ACTIVE_SIMULATION_CATALOG, GENLAB_SIMULATIONS, newtonsSecondLaw } from '@genlab/simulation-core';
import type { UnifiedSimulatorSpec } from '@/lib/simulation/simulator-schema';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cleanSlug = slug.trim().toLowerCase();

    // 1. Check database storage first (organic AI / admin saved templates)
    const stored = SimulationStorageRepository.getTemplate(cleanSlug);
    if (stored?.unifiedSpec) {
      return NextResponse.json({
        success: true,
        source: 'database',
        spec: stored.unifiedSpec,
      });
    }

    // 2. Check stored template definition
    if (stored?.definition) {
      const def = stored.definition;
      const pDefs: Record<string, any> = {};
      for (const [k, p] of Object.entries(def.parameters || {})) {
        pDefs[k] = {
          key: k,
          label: (p as any).label || k,
          min: (p as any).min ?? 0,
          max: (p as any).max ?? 100,
          step: (p as any).step ?? 1,
          defaultVal: (p as any).value ?? (p as any).min,
          unit: (p as any).unit || '',
          description: '',
        };
      }

      const unified: UnifiedSimulatorSpec = {
        id: stored.id,
        slug: stored.slug,
        info: {
          title: stored.title,
          description: stored.prompt || '',
          discipline: stored.domain,
          topic: def.concepts?.[0] || 'Konsep Dasar',
          difficulty: 'basic',
          estimatedTime: '10–15 menit',
          status: stored.status === 'active' ? 'published' : (stored.status as 'published' | 'draft' | 'archived'),
          version: stored.version,
        },
        parameters: pDefs,
        calculations: {},
        visual: {
          viewBox: { width: 640, height: 360 },
          archetype: (stored.engine as any) || 'universal',
          groundPlane: true,
          elements: [],
        },
        results: [],
        insight: {
          summary: '',
          causeAndEffect: '',
        },
        experiments: [],
      };

      return NextResponse.json({
        success: true,
        source: 'database_definition',
        spec: unified,
      });
    }

    // 3. Check catalog / Gen Labs simulations
    const simDef = (GENLAB_SIMULATIONS as any)[cleanSlug];
    const cat = ACTIVE_SIMULATION_CATALOG.find((c) => c.slug === cleanSlug);

    if (simDef || cat) {
      const legacyDef = simDef?.spec || cat;
      const rawParams = simDef?.spec?.parameters || (cat as any)?.parameters || {};
      const pDefs: Record<string, any> = {};
      for (const [k, p] of Object.entries(rawParams as Record<string, any>)) {
        pDefs[k] = {
          key: k,
          label: p.label || k,
          min: p.min ?? 0,
          max: p.max ?? 100,
          step: p.step ?? 1,
          defaultVal: p.value ?? p.default ?? p.min,
          unit: p.unit || '',
          description: p.description || '',
        };
      }

      const unified: UnifiedSimulatorSpec = {
        id: `sim-${cleanSlug}`,
        slug: cleanSlug,
        info: {
          title: legacyDef.title || cleanSlug,
          description: legacyDef.description || '',
          discipline: legacyDef.domain || legacyDef.discipline || 'Umum',
          topic: legacyDef.topic || legacyDef.category || 'Konsep Dasar',
          difficulty: 'basic',
          estimatedTime: '10–15 menit',
          status: 'published',
          version: 1,
        },
        parameters: pDefs,
        calculations: {},
        visual: {
          viewBox: { width: 640, height: 360 },
          archetype: (legacyDef.engine as any) || 'universal',
          groundPlane: true,
          elements: [],
        },
        results: [],
        insight: {
          summary: '',
          causeAndEffect: '',
        },
        experiments: (simDef?.experiments || []).map((e: any, idx: number) => ({
          id: e.id || `exp-${idx}`,
          title: e.title || 'Tantangan Eksperimen',
          objective: e.objective || e.description || '',
          targetMetric: e.target?.parameter || e.target?.metric || 'output',
          targetValue: e.target?.targetValue ?? e.target?.value ?? 0,
          tolerance: e.target?.tolerance ?? 0.1,
          unit: e.target?.unit || '',
          successMessage: e.successMessage || 'Eksperimen berhasil dicapai!',
        })),
      };

      return NextResponse.json({
        success: true,
        source: 'catalog',
        spec: unified,
      });
    }

    return NextResponse.json(
      { error: `Simulasi "${slug}" tidak ditemukan di database atau katalog.` },
      { status: 404 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat definisi simulasi.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
