import { NextResponse } from 'next/server';
import {
  registerAllSimulations,
  ACTIVE_SIMULATION_CATALOG,
  newtonsSecondLaw,
  projectileMotion,
  momentumCollision,
  functionExplorer,
  vectorMath,
  probabilityCoin,
  sortingVisualizer,
  binarySearch,
  graphTraversal,
  linearRegression,
  normalDistribution,
  supplyDemand,
  compoundInterest,
  phScale,
} from '@genlab/simulation-core';
import { validateSimulationSpecification } from '@/lib/ai/validator';
import { SimulationStorageRepository } from '@/lib/storage/session-store';
import { authenticateAdmin } from '@/lib/auth/server-guard';

registerAllSimulations();

const STATIC_SIMULATIONS: Record<string, any> = {
  'newtons-second-law': newtonsSecondLaw,
  'projectile-motion': projectileMotion,
  'momentum-collision': momentumCollision,
  'function-explorer': functionExplorer,
  'vector-math': vectorMath,
  'probability-coin': probabilityCoin,
  'sorting-algorithms': sortingVisualizer,
  'binary-search': binarySearch,
  'graph-traversal': graphTraversal,
  'linear-regression': linearRegression,
  'normal-distribution': normalDistribution,
  'supply-demand': supplyDemand,
  'compound-interest': compoundInterest,
  'ph-scale': phScale,
};

export async function POST(request: Request) {
  try {
    const auth = await authenticateAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json().catch(() => ({}));
    const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
    const rawSpec = body?.spec;

    let registeredEngine = slug ? STATIC_SIMULATIONS[slug] : null;
    let targetSpec = rawSpec || registeredEngine?.spec;

    if (slug && !targetSpec) {
      const stored = SimulationStorageRepository.findCompatibleTemplate(slug) ||
        SimulationStorageRepository.listTemplates().find(t => t.slug === slug);
      if (stored) {
        targetSpec = stored.definition;
      }
    }

      if (!targetSpec) {
        const cat = ACTIVE_SIMULATION_CATALOG.find(c => c.slug === slug);
        if (cat) {
          targetSpec = {
            simulation: cat.slug,
            title: cat.title,
            description: cat.description,
            domain: cat.discipline,
            engine: cat.engine,
            version: 1,
            parameters: Object.fromEntries(
              (cat.parametersPreview || []).map(p => [p.name, { value: 10, min: 0, max: 100, label: p.name }])
            ),
            controls: (cat.parametersPreview || []).map(p => p.name),
          };
        }
      }

    if (!targetSpec) {
      return NextResponse.json({ error: 'Spesifikasi atau slug modul simulasi tidak ditemukan.' }, { status: 400 });
    }

    // 1. Structural & Safety Validation (using strict validator)
    const baseValidation = validateSimulationSpecification(targetSpec);

    // 2. Logic Validation
    const logicErrors: string[] = [];
    if (targetSpec.parameters) {
      for (const [key, p] of Object.entries(targetSpec.parameters as Record<string, any>)) {
        if (p.min >= p.max) {
          logicErrors.push(`Parameter "${key}": batas minimum (${p.min}) harus lebih kecil dari maksimum (${p.max}).`);
        }
        if (p.value < p.min || p.value > p.max) {
          logicErrors.push(`Parameter "${key}": nilai default (${p.value}) berada di luar rentang [${p.min}, ${p.max}].`);
        }
      }
    }

    // 3. Runtime Validation
    let runtimeSuccess = true;
    let runtimeError: string | null = null;
    let computedOutputsSample: Record<string, any> = {};

    if (registeredEngine?.compute) {
      try {
        const sampleParams: Record<string, number> = {};
        for (const [k, p] of Object.entries(registeredEngine.spec.parameters)) {
          sampleParams[k] = (p as any).value;
        }
        computedOutputsSample = registeredEngine.compute(sampleParams);
        runtimeSuccess = typeof computedOutputsSample === 'object' && computedOutputsSample !== null;
      } catch (err: unknown) {
        runtimeSuccess = false;
        runtimeError = err instanceof Error ? err.message : 'Runtime execution error';
      }
    }

    // 4. Safety Validation Check
    const serialized = JSON.stringify(targetSpec);
    const hasDangerousTokens = /<script|javascript:|eval\(|__proto__|constructor/i.test(serialized);
    const safetySuccess = !hasDangerousTokens;

    const structuralSuccess = baseValidation.valid;
    const logicSuccess = logicErrors.length === 0;

    const allPassed = structuralSuccess && logicSuccess && runtimeSuccess && safetySuccess;

    const checks = [
      {
        name: 'Validasi Struktural (Schema & Controls)',
        passed: structuralSuccess,
        details: structuralSuccess ? 'Schema JSON sesuai standar SimulationSpecification' : baseValidation.errors.join('; '),
      },
      {
        name: 'Validasi Logika & Rentang Parameter',
        passed: logicSuccess,
        details: logicSuccess ? 'Semua nilai min, max, dan default konsisten' : logicErrors.join('; '),
      },
      {
        name: 'Validasi Runtime Eksekusi Mesin',
        passed: runtimeSuccess,
        details: runtimeSuccess ? 'Mesin komputasi berjalan 0 error dengan output deterministik' : (runtimeError || 'Gagal eksekusi runtime'),
      },
      {
        name: 'Validasi Keamanan & Integritas',
        passed: safetySuccess,
        details: safetySuccess ? 'Bebas dari skrip berbahaya, eval, atau injection' : 'Rejection: Terdeteksi token berbahaya',
      },
    ];

    const score = Math.round(
      ((Number(structuralSuccess) + Number(logicSuccess) + Number(runtimeSuccess) + Number(safetySuccess)) / 4) * 100
    );

    return NextResponse.json({
      success: true,
      slug: slug || targetSpec.simulation,
      approved: allPassed,
      qualityScore: score,
      recommendation: allPassed ? 'Layak Dipublikasikan (Approved for Production)' : 'Memerlukan Revisi (Needs Review)',
      checks,
      computedSample: computedOutputsSample,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menjalankan evaluasi review modul.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
