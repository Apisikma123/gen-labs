'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SuperCanvasEditor } from '@/components/admin/super-canvas-editor';
import {
  UnifiedSimulatorSpec,
  SimulatorParameter,
  createEmptySimulatorSpec,
} from '@/lib/simulation/simulator-schema';
import { modulesApi, ModuleModel } from '@/lib/api/modules';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { useFeedback } from '@/components/feedback';
import {
  getGenlabSimulation,
  GENLAB_SIMULATIONS,
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

const LEGACY_SIMS: Record<string, any> = {
  'newtons-second-law': newtonsSecondLaw,
  'projectile-motion': projectileMotion,
  'momentum-collision': momentumCollision,
  'function-explorer': functionExplorer,
  'vector-math': vectorMath,
  'probability-coin': probabilityCoin,
  'sorting-visualizer': sortingVisualizer,
  'sorting-algorithms': sortingVisualizer,
  'binary-search': binarySearch,
  'graph-traversal': graphTraversal,
  'linear-regression': linearRegression,
  'normal-distribution': normalDistribution,
  'supply-demand': supplyDemand,
  'compound-interest': compoundInterest,
  'ph-scale': phScale,
};

export default function AdminModuleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = use(params);
  const router = useRouter();
  const feedback = useFeedback();

  const [initialSpec, setInitialSpec] = useState<UnifiedSimulatorSpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [moduleId, setModuleId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const resolveSpec = async () => {
      const idOrSlug = resolved.id;

      // 1. Try local-first draft storage
      const localDraft = localStorage.getItem(`genlabs_draft_${idOrSlug}`) || localStorage.getItem(`simula_draft_${idOrSlug}`);
      if (localDraft) {
        try {
          const parsed = JSON.parse(localDraft);
          if (parsed && parsed.info) {
            if (isMounted) {
              setInitialSpec(parsed);
              setLoading(false);
              return;
            }
          }
        } catch {
          // continue
        }
      }

      // 2. Try fetching from Backend API
      let mod: ModuleModel | null = null;
      try {
        const res = await modulesApi.getById(idOrSlug);
        if (res && res.success && res.module) {
          mod = res.module;
          setModuleId(mod.id);
        }
      } catch {
        // Fallback to catalog
      }

      // 3. Resolve slug (handles numeric IDs like 1000, 1001, etc. or direct slugs)
      let targetSlug: string = mod?.simulations?.[0]?.slug || mod?.slug || '';
      if (!targetSlug) {
        const numId = Number(idOrSlug);
        if (!isNaN(numId) && numId >= 1000) {
          const idx = numId - 1000;
          if (idx >= 0 && idx < ACTIVE_SIMULATION_CATALOG.length) {
            targetSlug = ACTIVE_SIMULATION_CATALOG[idx].slug;
          }
        }
        if (!targetSlug) {
          const matched = ACTIVE_SIMULATION_CATALOG.find(
            (c: any) => c.slug === idOrSlug || c.id === idOrSlug
          );
          targetSlug = matched ? matched.slug : idOrSlug;
        }
      }

      // 4. Try loading from LEGACY_SIMS, Gen Labs simulations catalog, or ACTIVE_SIMULATION_CATALOG
      const legacyDef =
        (targetSlug ? LEGACY_SIMS[targetSlug] : null) ||
        (targetSlug ? getGenlabSimulation(targetSlug) : null) ||
        (targetSlug ? (GENLAB_SIMULATIONS as any)[targetSlug] : null);
      const catItem = ACTIVE_SIMULATION_CATALOG.find((c: any) => c.slug === targetSlug);

      if (legacyDef || catItem || mod) {
        const title = mod?.title || legacyDef?.spec?.title || catItem?.title || targetSlug;
        const description = mod?.description || legacyDef?.spec?.description || catItem?.description || '';
        const discipline = mod?.discipline || legacyDef?.discipline || catItem?.discipline || 'Teknologi Rekayasa Perangkat Lunak';
        const topic = mod?.topic || legacyDef?.category || catItem?.category || 'Konsep Dasar';
        const difficulty = mod?.difficulty || (legacyDef?.spec?.difficulty as any) || 'basic';
        const status = mod?.status || 'published';

        // Convert parameters to UnifiedSimulatorSpec format
        const rawParams = legacyDef?.spec?.parameters || (catItem as any)?.parameters || {};
        const pDefs: Record<string, SimulatorParameter> = {};
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

        // If no parameters found in raw spec, create default baseline parameters
        if (Object.keys(pDefs).length === 0) {
          pDefs['param1'] = {
            key: 'param1',
            label: 'Variabel Eksperimen',
            min: 0,
            max: 100,
            step: 1,
            defaultVal: 25,
            unit: '',
            description: 'Parameter awal simulasi',
          };
        }

        // Convert calculations
        const calcDefs: UnifiedSimulatorSpec['calculations'] = {};
        if (legacyDef?.spec?.outputs) {
          for (const [k, o] of Object.entries(legacyDef.spec.outputs as Record<string, any>)) {
            calcDefs[k] = {
              key: k,
              label: o.label || k,
              formula: k,
              unit: o.unit || '',
            };
          }
        }

        // Convert experiments
        const experiments = (legacyDef?.experiments || []).map((e: any, idx: number) => ({
          id: e.id || `exp-${idx + 1}`,
          title: e.title || 'Tantangan Eksperimen',
          objective: e.objective || e.description || '',
          targetMetric: e.targetCondition?.output || e.target?.parameter || 'metric',
          targetValue: e.targetCondition?.value ?? e.target?.targetValue ?? 100,
          tolerance: e.targetCondition?.tolerance ?? e.target?.tolerance ?? 1,
          unit: e.target?.unit || '',
          rules: e.description || '',
          successMessage: 'Target eksperimen berhasil dicapai!',
        }));

        const spec: UnifiedSimulatorSpec = {
          id: mod ? `sim-${mod.id}` : `sim-${targetSlug || idOrSlug}`,
          slug: targetSlug || idOrSlug || 'simulator',
          info: {
            title,
            description,
            discipline,
            topic,
            difficulty,
            estimatedTime: mod?.estimated_time || '10–15 menit',
            status: status === 'archived' ? 'draft' : status,
            version: 1,
            thumbnailUrl: mod?.thumbnail_image || undefined,
            coverUrl: mod?.cover_image || undefined,
          },
          parameters: pDefs,
          calculations: calcDefs,
          visual: {
            viewBox: { width: 720, height: 360 },
            archetype: (legacyDef?.spec?.engine as any) || 'universal',
            groundPlane: true,
            gridLines: true,
            elements: [],
          },
          results: [],
          insight: {
            summary: description,
            causeAndEffect: '',
            whatIf: '',
          },
          experiments,
        };

        if (isMounted) {
          setInitialSpec(spec);
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setError('Simulator tidak ditemukan.');
        setLoading(false);
      }
    };

    resolveSpec();

    return () => {
      isMounted = false;
    };
  }, [resolved.id]);

  const handleSave = async (spec: UnifiedSimulatorSpec, status: 'draft' | 'published') => {
    setIsSaving(true);

    try {
      // 1. If backend module ID exists, update module on server
      if (moduleId) {
        await modulesApi.adminUpdate(moduleId, {
          title: spec.info.title.trim(),
          description: spec.info.description.trim(),
          discipline: spec.info.discipline,
          topic: spec.info.topic,
          difficulty: spec.info.difficulty,
          estimated_time: spec.info.estimatedTime,
          status,
          thumbnail_image: spec.info.thumbnailUrl,
          cover_image: spec.info.coverUrl,
        });
      }

      // 2. Persist full simulator definition locally and into local-first store
      localStorage.setItem(`genlabs_draft_${spec.slug}`, JSON.stringify(spec));
      localStorage.setItem(`genlabs_draft_${resolved.id}`, JSON.stringify(spec));
      localStorage.setItem(`simula_draft_${spec.slug}`, JSON.stringify(spec));
      localStorage.setItem(`simula_draft_${resolved.id}`, JSON.stringify(spec));

      feedback.toast.success(`Simulator "${spec.info.title}" berhasil diperbarui.`);
      setTimeout(() => {
        router.push('/admin/modules');
      }, 1000);
    } catch {
      // Still save locally so work is never lost
      localStorage.setItem(`genlabs_draft_${spec.slug}`, JSON.stringify(spec));
      localStorage.setItem(`simula_draft_${spec.slug}`, JSON.stringify(spec));
      feedback.toast.success(`Simulator "${spec.info.title}" disimpan secara lokal.`);
      setTimeout(() => {
        router.push('/admin/modules');
      }, 1000);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--color-bg)]">
        <LoadingState message="Mempersiapkan Super Canvas editor..." rows={3} />
      </div>
    );
  }

  if (error || !initialSpec) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--color-bg)]">
        <ErrorState
          title="Simulator tidak ditemukan"
          message={error || 'Data simulator tidak dapat dimuat.'}
          onRetry={() => router.push('/admin/modules')}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <SuperCanvasEditor
        initialSpec={initialSpec}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}
