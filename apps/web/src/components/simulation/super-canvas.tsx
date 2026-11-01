'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  IconZoomIn,
  IconZoomOut,
  IconRotateCcw,
  IconSliders,
  IconCheckCircle,
  IconAlertCircle,
  IconPlay,
  IconPause,
  IconArrowRight,
  IconTarget,
  IconInfo,
  IconScale,
  IconMaximize,
  IconLayers,
  IconPlus,
  IconMessageSquare,
  IconSend,
  IconZap,
  IconBookOpen,
  IconHelpCircle,
  IconActivity,
  IconCheck,
  IconGraduationCap,
  IconSparkles,
} from '@/components/icons';
import { aiApi, AiUsageModel } from '@/lib/api/ai';
import { AiThinkingState } from '@/components/ui/ai-thinking-state';
import { FormattedMessage } from '@/components/ui/formatted-message';
import { getSimulationExplanation } from '@/lib/simulation/simulation-explanations';
import { AiUsageBadge } from '@/components/ui/ai-usage-badge';
import type { AIContextPayload } from '@genlab/simulation-types';
import {
  evaluateExperiment,
  UniversalExperimentChallenge,
} from '@/lib/simulation/experiment-engine';
import {
  UnifiedSimulatorSpec,
  evaluateSimulator,
  safeEvaluateFormula,
  SimulatorParameter,
  createEmptySimulatorSpec,
} from '@/lib/simulation/simulator-schema';
import {
  SimulationRuntimeState,
  createSimulationRuntimeState,
  stepSimulationRuntime,
  setSimulationParameter,
  resetSimulationRuntime,
} from '@/lib/simulation/simulation-runtime';
import { formatNumber, formatCurrency } from '@/lib/utils/formatters';
import { MathView } from '@/components/ui/math-view';
import {
  placeLabel,
  LayoutObstacle,
  measureTextSize,
  formatCleanNumber,
} from '@/lib/simulation/canvas-layout-engine';
import { getUniversalPresentation, UniversalPresentation } from '@/lib/simulation/universal-presenter';
import {
  getGenlabSimulation,
  GENLAB_SIMULATIONS,
  newtonsSecondLaw,
  projectileMotion,
  momentumCollision,
  functionExplorer,
  vectorMath,
  probabilityCoin,
  sortingVisualizer,
  generateSortingSteps,
  binarySearch,
  generateBinarySearchData,
  graphTraversal,
  CANONICAL_GRAPH,
  linearRegression,
  normalDistribution,
  supplyDemand,
  compoundInterest,
  phScale,
  getTerRatePct,
} from '@genlab/simulation-core';

export interface SuperCanvasProps {
  // Can accept either a declarative UnifiedSimulatorSpec OR an existing simulation slug
  spec?: UnifiedSimulatorSpec;
  slug?: string;
  initialParams?: Record<string, number>;
  mode?: 'student' | 'admin';
  selectedElementId?: string;
  onSelectElement?: (elementId: string) => void;
  onVerifyExperiment?: (success: boolean, val?: number, prediction?: string) => void;
  onAddElementClick?: () => void;
  onParameterChange?: (key: string, value: number, allParams: Record<string, number>) => void;
  className?: string;
  embedded?: boolean;
}

const LEGACY_SIMS: Record<string, any> = {
  'newtons-second-law': newtonsSecondLaw,
  'projectile-motion': projectileMotion,
  'momentum-collision': momentumCollision,
  'function-explorer': functionExplorer,
  'vector-math': vectorMath,
  'probability-coin': probabilityCoin,
  'sorting-algorithms': sortingVisualizer,
  'sorting-visualizer': sortingVisualizer,
  'binary-search': binarySearch,
  'graph-traversal': graphTraversal,
  'linear-regression': linearRegression,
  'normal-distribution': normalDistribution,
  'supply-demand': supplyDemand,
  'compound-interest': compoundInterest,
  'ph-scale': phScale,
};

export function normalizeSimulationSlug(s: string): string {
  if (!s) return 'newtons-second-law';
  let clean = s.toLowerCase().trim();
  if (clean.startsWith('wbi-')) clean = clean.slice(4);

  const SLUG_ALIASES: Record<string, string> = {
    'hukum-ii-newton': 'newtons-second-law',
    'hukum-newton-2': 'newtons-second-law',
    'newton': 'newtons-second-law',
    'kinematika-gerak-peluru': 'projectile-motion',
    'gerak-peluru': 'projectile-motion',
    'momentum-dan-tumbukan': 'momentum-collision',
    'tumbukan-dan-momentum': 'momentum-collision',
    'aljabar-vektor-2d': 'vector-math',
    'vektor-2d': 'vector-math',
    'teori-peluang-koin': 'probability-coin',
    'peluang-koin': 'probability-coin',
    'penelusuran-graf-bfs-dfs': 'graph-traversal',
    'graf-bfs-dfs': 'graph-traversal',
    'regresi-linear-sederhana': 'linear-regression',
    'distribusi-normal-gauss': 'normal-distribution',
    'fungsi-kuadrat-polinomial': 'function-explorer',
    'hukum-permintaan-penawaran': 'supply-demand',
    'permintaan-penawaran': 'supply-demand',
    'bunga-majemuk-investasi': 'compound-interest',
    'skala-ph-asam-basa': 'ph-scale',
    'algoritma-pengurutan-bubble-sort': 'sorting-algorithms',
    'bubble-sort': 'sorting-algorithms',
    'pencarian-biner': 'binary-search',
    'analisis-titik-impas-bep': 'break-even-point',
    'titik-impas-bep': 'break-even-point',
    'rekayasa-irigasi-presisi': 'irrigation-simulator',
    'irigasi-presisi': 'irrigation-simulator',
    'simulasi-hpp': 'hpp-calculation',
    'analisis-biaya-hortikultura': 'horticulture-production-cost',
    'event-capacity': 'event-capacity-planner',
    'hydroponic-nutrient': 'hydroponic-simulator',
    'budgeting-variance': 'budgeting-simulator',
  };

  return SLUG_ALIASES[clean] || clean;
}

const SIMULATION_QUICK_PROMPTS: Record<string, string[]> = {
  'newtons-second-law': [
    'Mengapa benda yang lebih berat (massa besar) lebih sulit dipercepat?',
    'Apa yang terjadi jika gaya dorong lebih kecil dari gaya gesek?',
    'Bagaimana cara mengatur gaya dan massa agar percepatan pas sesuai target?',
  ],
  'projectile-motion': [
    'Berapa sudut tembakan agar jarak lemparan bola mencapai titik terjauh?',
    'Mengapa gravitasi memengaruhi tinggi lemparan tetapi bukan kecepatan mendatarnya?',
    'Berapa sudut dan kecepatan awal terbaik untuk mengenai sasaran?',
  ],
  'momentum-collision': [
    'Apakah jumlah momentum selalu sama sebelum dan sesudah tumbukan?',
    'Ke mana perginya energi kinetik pada benda yang menempel setelah bertumbukan?',
    'Bagaimana cara mengatur massa dan kecepatan kedua benda?',
  ],
  'function-explorer': [
    'Bagaimana nilai a mengubah bentuk kurva parabola (melebar, menyempit, atau terbalik)?',
    'Apa arti nilai diskriminan D (positif, nol, negatif) pada titik potong sumbu X?',
    'Bagaimana cara menggeser titik puncak parabola ke posisi yang diinginkan?',
  ],
  'vector-math': [
    'Bagaimana cara mencari panjang dan arah resultan gabungan dua vektor?',
    'Apa arti perkalian titik (dot product) jika nilainya nol atau negatif?',
    'Bagaimana arah gaya berubah saat kedua vektor ditarik bersamaan?',
  ],
  'probability-coin': [
    'Mengapa hasil lemparan koin makin mendekati 50% saat jumlah lemparan diperbanyak?',
    'Apa maksud Hukum Bilangan Besar pada percobaan lempar koin ini?',
    'Bagaimana cara membandingkan peluang teori dengan hasil lemparan nyata?',
  ],
  'sorting-algorithms': [
    'Mengapa Bubble Sort membutuhkan langkah perbandingan lebih banyak pada data acak?',
    'Algoritma mana yang paling cepat mengurutkan deretan angka ini?',
    'Bagaimana cara kerja langkah perbandingan dan penukaran posisi angka?',
  ],
  'binary-search': [
    'Mengapa Binary Search mewajibkan deretan angka sudah terurut rapi terlebih dahulu?',
    'Mengapa pencarian bagi dua ini jauh lebih cepat dibanding mencari satu per satu?',
    'Berapa langkah maksimal yang dibutuhkan untuk menemukan angka yang dicari?',
  ],
  'graph-traversal': [
    'Apa bedanya menelusuri cabang secara melebar (BFS) versus mendalam (DFS)?',
    'Kapan sebaiknya kita mencari rute menggunakan BFS dibanding DFS?',
    'Bagaimana urutan langkah penelusuran dari titik awal ke titik tujuan?',
  ],
  'linear-regression': [
    'Apa arti nilai R² terhadap kecocokan garis dengan titik-titik data?',
    'Bagaimana garis regresi menemukan posisi paling pas di antara semua titik data?',
    'Apa pengaruh titik acak (noise) terhadap kemiringan garis tren?',
  ],
  'normal-distribution': [
    'Apa arti rentang 68%, 95%, dan 99.7% pada kurva lonceng distribusi normal?',
    'Bagaimana nilai Z mengukur seberapa jauh suatu data menyimpang dari rata-rata?',
    'Mengapa kurva simetris di sekitar nilai rata-rata (mean)?',
  ],
  'supply-demand': [
    'Bagaimana harga dan jumlah barang di pasar mencapai titik keseimbangan?',
    'Apa yang terjadi pada harga jika barang yang dijual melebihi pembeli (surplus)?',
    'Apa perbedaan keuntungan pembeli (surplus konsumen) dan keuntungan penjual?',
  ],
  'compound-interest': [
    'Mengapa tabungan dengan bunga majemuk bertambah jauh lebih cepat seiring waktu?',
    'Bagaimana cara cepat memperkirakan waktu penggandaan uang dengan Aturan 72?',
    'Apa perbedaan bunga yang dihitung tiap bulan dibanding tiap tahun?',
  ],
  'ph-scale': [
    'Mengapa perbedaan 1 angka pH berarti perbedaan keasaman hingga 10 kali lipat?',
    'Berapa jumlah ion asam (H⁺) dan basa (OH⁻) pada larutan netral (pH 7)?',
    'Apa perbedaan larutan asam kuat dan asam lemah saat dilarutkan dalam air?',
  ],
};

function extractSuggestedParameters(
  text: string,
  paramDefs: Record<string, SimulatorParameter>,
  actionParams?: Record<string, number>
): Record<string, number> | null {
  if (actionParams && Object.keys(actionParams).length > 0) {
    const valid: Record<string, number> = {};
    for (const [k, v] of Object.entries(actionParams)) {
      if (paramDefs[k] && typeof v === 'number') {
        valid[k] = Math.max(paramDefs[k].min, Math.min(paramDefs[k].max, v));
      }
    }
    if (Object.keys(valid).length > 0) return valid;
  }

  const extracted: Record<string, number> = {};
  for (const [key, p] of Object.entries(paramDefs)) {
    const regex = new RegExp(`(?:\\b${key}\\b|${p.label})\\s*[:=]\\s*([-+]?\\d*\\.?\\d+)`, 'i');
    const m = text.match(regex);
    if (m && m[1]) {
      const val = Number(m[1]);
      if (!isNaN(val)) {
        extracted[key] = Math.max(p.min, Math.min(p.max, val));
      }
    }
  }

  return Object.keys(extracted).length > 0 ? extracted : null;
}

/**
 * SuperCanvas
 * The SINGLE parent simulation engine for GEN LABS.
 * All simulations (Newton, Accounting, Sorting, Marketing, Farming, etc.)
 * execute inside this universal canvas.
 */
export function SuperCanvas({
  spec: initialSpec,
  slug = 'newtons-second-law',
  initialParams,
  mode = 'student',
  selectedElementId,
  onSelectElement,
  onVerifyExperiment,
  onAddElementClick,
  onParameterChange,
  className = '',
  embedded = false,
}: SuperCanvasProps) {
  // Dynamic spec loading from server if not explicitly passed
  const [remoteSpec, setRemoteSpec] = useState<UnifiedSimulatorSpec | null>(null);

  const canonicalSlug = useMemo(() => {
    return normalizeSimulationSlug(slug || initialSpec?.slug || '');
  }, [slug, initialSpec?.slug]);

  useEffect(() => {
    if (!initialSpec && slug) {
      fetch(`/api/v1/simulations/${slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.spec) {
            setRemoteSpec(data.spec);
          }
        })
        .catch(() => {});
    }
  }, [initialSpec, slug]);

  // 1. Resolve unified spec (either directly provided, fetched from API, or converted from legacy catalog)
  const spec: UnifiedSimulatorSpec = useMemo(() => {
    if (initialSpec) return initialSpec;
    if (remoteSpec) return remoteSpec;

    // Convert legacy definition into UnifiedSimulatorSpec
    const legacy =
      LEGACY_SIMS[slug] ||
      LEGACY_SIMS[canonicalSlug] ||
      getGenlabSimulation(slug) ||
      getGenlabSimulation(canonicalSlug) ||
      (GENLAB_SIMULATIONS as any)[slug] ||
      (GENLAB_SIMULATIONS as any)[canonicalSlug] ||
      LEGACY_SIMS['newtons-second-law'];

    if (!legacy) {
      return createEmptySimulatorSpec();
    }
    const pDefs: Record<string, SimulatorParameter> = {};
    for (const [k, p] of Object.entries((legacy.spec?.parameters || {}) as Record<string, any>)) {
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

    const calcDefs: UnifiedSimulatorSpec['calculations'] = {};
    if (legacy.spec?.outputs) {
      for (const [k, o] of Object.entries((legacy.spec.outputs || {}) as Record<string, any>)) {
        calcDefs[k] = {
          key: k,
          label: o.label || k,
          formula: k,
          unit: o.unit || '',
        };
      }
    } else if (typeof legacy.compute === 'function') {
      try {
        const defaultP: Record<string, number> = {};
        for (const [pk, pv] of Object.entries((legacy.spec?.parameters || {}) as Record<string, any>)) {
          defaultP[pk] = pv.value ?? pv.default ?? pv.min ?? 0;
        }
        const sampleOut = legacy.compute(defaultP);
        if (sampleOut && typeof sampleOut === 'object') {
          for (const [k, v] of Object.entries(sampleOut)) {
            if (typeof v === 'number' && !k.endsWith('_display')) {
              calcDefs[k] = {
                key: k,
                label: k.replace(/([A-Z])/g, ' $1').trim(),
                formula: k,
                unit: '',
              };
            }
          }
        }
      } catch {}
    }

    return {
      id: `sim-${slug}`,
      slug,
      info: {
        title: legacy.spec?.title || slug,
        description: legacy.spec?.description || '',
        discipline: legacy.spec?.domain || 'Umum',
        topic: legacy.spec?.topic || 'Konsep Dasar',
        difficulty: (legacy.spec?.difficulty as any) || 'basic',
        estimatedTime: '10–15 menit',
        status: 'published',
        version: 1,
      },
      parameters: pDefs,
      calculations: calcDefs,
      visual: {
        viewBox: { width: 640, height: 360 },
        groundPlane: true,
        elements: [],
      },
      results: [],
      insight: {
        summary: '',
        causeAndEffect: '',
      },
      experiments: (legacy.experiments && legacy.experiments.length > 0)
        ? (legacy.experiments || []).map((e: any, idx: number) => ({
            id: e.id || `exp-${idx}`,
            title: e.title || 'Tantangan Eksperimen',
            objective: e.objective || e.description || '',
            targetMetric: e.targetCondition?.output || e.targetCondition?.parameter || e.target?.parameter || e.target?.metric || (Object.keys(calcDefs)[0] || 'output'),
            targetValue: e.targetCondition?.value ?? e.targetCondition?.targetValue ?? e.target?.targetValue ?? e.target?.value ?? 0,
            targetValue2: e.targetCondition?.value2 ?? e.targetCondition?.targetValue2 ?? e.target?.targetValue2,
            operator: e.targetCondition?.operator || e.target?.operator || '==',
            tolerance: e.targetCondition?.tolerance ?? e.target?.tolerance ?? 0.05,
            unit: e.targetCondition?.unit || e.target?.unit || '',
            allowedParameters: e.allowedParameters,
            rules: e.rules,
            initialParameters: e.initialParameters,
            successMessage: e.successMessage || 'Eksperimen berhasil dicapai!',
            hint: e.hint || (Array.isArray(e.hints) ? e.hints[0] : undefined),
            description: e.description,
          }))
        : Object.keys(calcDefs).length > 0
        ? [{
            id: 'exp-default',
            title: `Eksperimen Pembuktian ${legacy.spec?.title || slug}`,
            objective: 'Ubah variabel kontrol untuk mencapai nilai target keluaran yang stabil.',
            targetMetric: Object.keys(calcDefs)[0],
            targetValue: 10,
            tolerance: 0.5,
            unit: calcDefs[Object.keys(calcDefs)[0]]?.unit || '',
            successMessage: 'Target keluaran berhasil dicapai!',
          }]
        : [],
    };
  }, [initialSpec, slug]);

  // 2. CANONICAL SIMULATION RUNTIME STATE (Single Source of Truth)
  const [runtimeState, setRuntimeState] = useState<SimulationRuntimeState>(() => {
    return createSimulationRuntimeState(spec, initialParams);
  });

  const lastSpecKeyRef = useRef<string>(spec.id || spec.slug);
  const lastSyncedParamsRef = useRef<Record<string, number>>(initialParams || {});

  // Re-sync when spec or initialParams change externally
  useEffect(() => {
    const currentKey = spec.id || spec.slug;
    if (lastSpecKeyRef.current !== currentKey) {
      // Different simulation opened: clean initial state
      lastSpecKeyRef.current = currentKey;
      lastSyncedParamsRef.current = initialParams || {};
      setRuntimeState(createSimulationRuntimeState(spec, initialParams));
      return;
    }

    // Same simulation: update parameters only if initialParams differs from last synced
    if (initialParams) {
      let changed = false;
      for (const [k, v] of Object.entries(initialParams)) {
        if (typeof v === 'number' && lastSyncedParamsRef.current[k] !== v) {
          lastSyncedParamsRef.current[k] = v;
          changed = true;
        }
      }

      if (changed) {
        setRuntimeState((prev) => {
          let nextState = prev;
          for (const [k, v] of Object.entries(initialParams)) {
            if (typeof v === 'number' && prev.parameters[k] !== v) {
              nextState = setSimulationParameter(nextState, k, v, spec);
            }
          }
          return nextState;
        });
      }
    }
  }, [spec, initialParams]);

  // High-performance requestAnimationFrame animation loop with visibility pause
  const lastFrameTimeRef = useRef<number | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!runtimeState.isRunning) {
      lastFrameTimeRef.current = null;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      return;
    }

    let isDocumentVisible = typeof document !== 'undefined' ? !document.hidden : true;
    const handleVisibility = () => {
      isDocumentVisible = !document.hidden;
      if (!isDocumentVisible) {
        lastFrameTimeRef.current = null;
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const onFrame = (now: number) => {
      if (!isDocumentVisible) {
        lastFrameTimeRef.current = null;
        animFrameIdRef.current = requestAnimationFrame(onFrame);
        return;
      }

      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = now;
      }
      const rawDt = (now - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = now;
      // Clamp dt to avoid huge teleports on tab switch (1ms to 50ms)
      const dt = Math.min(0.05, Math.max(0.001, rawDt));

      setRuntimeState((prev) => stepSimulationRuntime(prev, dt, spec));
      animFrameIdRef.current = requestAnimationFrame(onFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(onFrame);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [runtimeState.isRunning, spec]);

  // Derived references for backward compatibility with UI components
  const params = runtimeState.parameters;
  const computed = runtimeState.computed;

  // Debounced external onParameterChange callback via rAF to eliminate slider drag stutter
  const paramChangeRafRef = useRef<number | null>(null);
  const pendingParamSyncRef = useRef<{ key: string; value: number; all: Record<string, number> } | null>(null);

  useEffect(() => {
    return () => {
      if (paramChangeRafRef.current) cancelAnimationFrame(paramChangeRafRef.current);
    };
  }, []);

  const handleUpdateParam = (key: string, value: number) => {
    lastSyncedParamsRef.current[key] = value;
    const nextParams = { ...runtimeState.parameters, [key]: value };
    setRuntimeState((prev) => setSimulationParameter(prev, key, value, spec));

    // Instant local state update, debounced parent store sync to avoid slider stutter
    if (onParameterChange) {
      pendingParamSyncRef.current = { key, value, all: nextParams };
      if (!paramChangeRafRef.current) {
        paramChangeRafRef.current = requestAnimationFrame(() => {
          if (pendingParamSyncRef.current) {
            onParameterChange(
              pendingParamSyncRef.current.key,
              pendingParamSyncRef.current.value,
              pendingParamSyncRef.current.all
            );
            pendingParamSyncRef.current = null;
          }
          paramChangeRafRef.current = null;
        });
      }
    }
  };

  const handleTogglePlay = () => {
    setRuntimeState((prev) => ({
      ...prev,
      isRunning: !prev.isRunning,
    }));
  };

  const handleReset = () => {
    const nextState = resetSimulationRuntime(spec, runtimeState.parameters);
    lastSyncedParamsRef.current = { ...nextState.parameters };
    setRuntimeState(nextState);
    if (onParameterChange) {
      for (const [k, v] of Object.entries(nextState.parameters)) {
        onParameterChange(k, v, nextState.parameters);
      }
    }
  };

  // 4. Human-readable presentation & KaTeX derivations
  // Throttle presentation updates during running simulation to ~10 Hz to prevent KaTeX re-parsing at 60 FPS
  const lastPresentationTimeRef = useRef(0);
  const cachedPresentationRef = useRef<UniversalPresentation | null>(null);

  const presentation = useMemo(() => {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    // When paused, resetting, or changing parameters, update immediately
    if (!runtimeState.isRunning || !cachedPresentationRef.current || now - lastPresentationTimeRef.current > 100) {
      lastPresentationTimeRef.current = now;
      const res = getUniversalPresentation(spec.slug, params, computed);
      cachedPresentationRef.current = res;
      return res;
    }
    // Return cached presentation during high-speed physics frames to maintain smooth 60 FPS
    return cachedPresentationRef.current;
  }, [spec.slug, params, computed, runtimeState.isRunning]);

  // Domain awareness for technical instrumentation readouts
  const simulationDomain = useMemo(() => {
    const s = (spec.slug || canonicalSlug || '').toLowerCase();
    const disc = (spec.info?.discipline || '').toLowerCase();
    const isPhysics =
      disc === 'fisika' ||
      disc === 'physics' ||
      s.includes('newton') ||
      s.includes('projectile') ||
      s.includes('gerak') ||
      s.includes('momentum') ||
      s.includes('collision') ||
      s.includes('tumbukan') ||
      s.includes('force') ||
      s.includes('kinematika') ||
      s.includes('magnus') ||
      s.includes('pegas') ||
      s.includes('fluid') ||
      s.includes('termo');
    const isAlgorithm =
      disc === 'informatika' ||
      disc === 'computer science' ||
      s.includes('sort') ||
      s.includes('search') ||
      s.includes('binary') ||
      s.includes('graph') ||
      s.includes('graf') ||
      s.includes('bfs') ||
      s.includes('dfs');
    const isFunctionExplorer =
      s.includes('function-explorer') ||
      s.includes('fungsi-kuadrat') ||
      s.includes('quadratic');
    const isMathOrEconomics =
      disc === 'matematika' ||
      disc === 'mathematics' ||
      disc === 'ekonomi' ||
      disc === 'economics' ||
      isFunctionExplorer ||
      s.includes('supply') ||
      s.includes('demand') ||
      s.includes('compound') ||
      s.includes('bunga') ||
      s.includes('vector') ||
      s.includes('vektor') ||
      s.includes('linear-regression') ||
      s.includes('regresi');
    return { isPhysics, isAlgorithm, isFunctionExplorer, isMathOrEconomics };
  }, [spec.slug, canonicalSlug, spec.info?.discipline]);

  // 5. Canvas Zoom & Scale controls
  const [zoomScale, setZoomScale] = useState(1.0);
  const [physicsViewMode, setPhysicsViewMode] = useState<'split' | 'apparatus' | 'graphs'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'apparatus';
    }
    return 'split';
  });
  const [activeExperimentIdx, setActiveExperimentIdx] = useState(0);
  const activeExp = spec.experiments[activeExperimentIdx] || spec.experiments[0];

  // Track baseline parameters for allowedParameters constraint checking
  const challengeBaselineParams = useRef<Record<string, number>>(initialParams || {});
  useEffect(() => {
    if (activeExp?.initialParameters) {
      challengeBaselineParams.current = { ...activeExp.initialParameters };
    } else {
      challengeBaselineParams.current = { ...params };
    }
  }, [activeExp?.id, spec.slug]);

  // Compare Mode State (PRD Section 13 & 14)
  const [compareMode, setCompareMode] = useState(false);
  const [stateA, setStateA] = useState<{
    params: Record<string, number>;
    computed: Record<string, any>;
    results: Array<{ label: string; value: string | number; symbol?: string }>;
  } | null>(null);

  // Prediction Mode & Feedback State (PRD Section 5, 6, 7)
  const [prediction, setPrediction] = useState('');
  const [lastAttempt, setLastAttempt] = useState<{
    tested: boolean;
    passed: boolean;
    currentVal: number;
    targetVal: number;
    delta: number;
    unit: string;
    message: string;
    explanation: string;
    prediction?: string;
    timestamp: string;
  } | null>(null);

  // 6. Real-time Experiment evaluation (Zero network, local deterministic state)
  const lastEvalTimeRef = useRef(0);
  const cachedEvalRef = useRef<any>(null);

  const experimentEvaluation = useMemo(() => {
    if (!activeExp) return null;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (!runtimeState.isRunning || !cachedEvalRef.current || now - lastEvalTimeRef.current > 100) {
      lastEvalTimeRef.current = now;
      const challengeObj: UniversalExperimentChallenge = {
        id: activeExp.id,
        title: activeExp.title,
        objective: activeExp.objective,
        targetCondition: {
          output: activeExp.targetMetric,
          operator: (activeExp.operator as any) || '==',
          value: activeExp.targetValue,
          value2: activeExp.targetValue2,
          tolerance: activeExp.tolerance ?? 0.05,
          unit: activeExp.unit || '',
        },
        allowedParameters: activeExp.allowedParameters,
        rules: activeExp.rules,
        initialParameters: activeExp.initialParameters || challengeBaselineParams.current,
        successMessage: activeExp.successMessage,
        hint: activeExp.hint,
      };

      const res = evaluateExperiment(challengeObj, params, computed, challengeBaselineParams.current);
      if (!res) {
        cachedEvalRef.current = null;
        return null;
      }

      const evalData = {
        currentVal: res.actualValue,
        target: res.targetValue,
        delta: res.delta,
        tol: res.tolerance,
        isSuccess: res.isAchieved,
        message: res.message,
        ruleViolated: res.ruleViolated,
        ruleViolationMessage: res.ruleViolationMessage,
      };
      cachedEvalRef.current = evalData;
      return evalData;
    }
    return cachedEvalRef.current;
  }, [activeExp, computed, params, runtimeState.isRunning]);

  // Explicit experiment verification button handler (Section 5 & 25)
  const handleRunExperiment = () => {
    if (!activeExp) return;
    const challengeObj: UniversalExperimentChallenge = {
      id: activeExp.id,
      title: activeExp.title,
      objective: activeExp.objective,
      targetCondition: {
        output: activeExp.targetMetric,
        operator: (activeExp.operator as any) || '==',
        value: activeExp.targetValue,
        value2: activeExp.targetValue2,
        tolerance: activeExp.tolerance ?? 0.05,
        unit: activeExp.unit || '',
      },
      allowedParameters: activeExp.allowedParameters,
      rules: activeExp.rules,
      initialParameters: activeExp.initialParameters || challengeBaselineParams.current,
      successMessage: activeExp.successMessage,
      hint: activeExp.hint,
    };

    const res = evaluateExperiment(challengeObj, params, computed, challengeBaselineParams.current);
    if (!res) return;

    const passed = res.isAchieved;
    const explanation = res.message;

    const attempt = {
      tested: true,
      passed,
      currentVal: res.actualValue,
      targetVal: res.targetValue,
      delta: res.delta,
      unit: activeExp.unit || '',
      message: passed ? 'Berhasil.' : (res.ruleViolated ? 'Syarat percobaan belum terpenuhi.' : 'Belum tercapai.'),
      explanation,
      prediction: prediction.trim() || undefined,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setLastAttempt(attempt);

    if (onVerifyExperiment) {
      onVerifyExperiment(passed, res.actualValue, prediction.trim() || undefined);
    }
  };



  // 7. Interactive Deck & AI GEN LABS Tutor states
  const [activeDeckTab, setActiveDeckTab] = useState<'challenge' | 'insight' | 'steps' | 'tutor'>('challenge');
  const [mobileNavTab, setMobileNavTab] = useState<'variables' | 'telemetry' | 'explanation' | 'challenge' | 'tutor' | 'insight' | 'steps'>('variables');

  const [tutorMessages, setTutorMessages] = useState<
    Array<{
      id: string;
      role: 'user' | 'assistant';
      content: string;
      suggestedParams?: Record<string, number>;
    }>
  >(() => [
    {
      id: 'init-msg',
      role: 'assistant',
      content: `Halo! Saya AI GEN LABS untuk laboratorium ${spec.info.title}. Silakan ajukan pertanyaan konseptual, atau minta rekomendasi parameter kontrol untuk melihat perubahan sistem secara nyata.`,
    },
  ]);
  const [aiQuestion, setAiQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [quotaRefreshKey, setQuotaRefreshKey] = useState(0);
  const [aiUsage, setAiUsage] = useState<AiUsageModel | null>(null);
  const [appliedParamFeedback, setAppliedParamFeedback] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const mobileChatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    mobileChatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tutorMessages, isAsking]);

  const quickQuestions = useMemo(() => {
    return (
      SIMULATION_QUICK_PROMPTS[spec.slug] ||
      SIMULATION_QUICK_PROMPTS[canonicalSlug] || [
        'Jelaskan konsep dan hukum di balik simulasi ini',
        'Bagaimana jika nilai variabel kontrol digandakan?',
        'Beri aku panduan untuk menyelesaikan tantangan praktikum',
      ]
    );
  }, [spec.slug, canonicalSlug]);

  const handleApplySuggestedParams = (paramsToApply: Record<string, number>) => {
    for (const [k, v] of Object.entries(paramsToApply)) {
      handleUpdateParam(k, v);
    }
    const summary = Object.entries(paramsToApply)
      .map(([k, v]) => `${spec.parameters[k]?.label || k} = ${v}`)
      .join(', ');
    setAppliedParamFeedback(`✓ Berhasil menerapkan parameter ke simulasi: ${summary}`);
    setTimeout(() => setAppliedParamFeedback(null), 4500);
  };

  const handleAskTutor = async (customQ?: string) => {
    const q = (customQ || aiQuestion).trim();
    if (!q || isAsking) return;

    if (aiUsage && aiUsage.remaining <= 0) {
      setTutorMessages((prev) => [
        ...prev,
        {
          id: `quota-${Date.now()}`,
          role: 'assistant',
          content: 'Kuota AI Tutor hari ini sudah habis. Kamu bisa bertanya lagi setelah pukul 00.00 WIB.',
        },
      ]);
      return;
    }

    setIsAsking(true);
    const userMsgId = `u-${Date.now()}`;
    setTutorMessages((prev) => [...prev, { id: userMsgId, role: 'user', content: q }]);
    setAiQuestion('');

    const contextPayload: AIContextPayload = {
      simulation: {
        id: spec.id || spec.slug,
        slug: spec.slug,
        title: spec.info.title,
        domain: spec.info.discipline || 'Sains',
        engine: spec.slug,
        description: spec.info.description,
      },
      state: {
        parameters: params,
        computed: computed,
      },
    };

    try {
      const historyPayload = tutorMessages.slice(-6).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

      const data = await aiApi.askTutor({
        question: q,
        simulation_id: spec.slug,
        state: {
          ...params,
          ...computed,
          human_results: presentation.results
            .map((r: { label: string; value: string | number }) => `${r.label}: ${r.value}`)
            .slice(0, 4)
            .join(', '),
        },
        context: contextPayload as unknown as Record<string, unknown>,
        history: historyPayload,
      });

      let answerText = data?.answer || '';
      if (
        !answerText ||
        (answerText.includes('{') &&
          answerText.includes('}') &&
          (answerText.includes('rx') || answerText.includes('magR') || answerText.includes('force')))
      ) {
        answerText = `${presentation.insight.summary} ${presentation.insight.causeAndEffect}\n\n${presentation.insight.whatIf || ''}`;
      }

      const suggested = extractSuggestedParameters(
        answerText,
        spec.parameters,
        data?.action ? ((data.action as any).parameters || (data.action as any).params) : undefined
      );

      if ((data as any)?.quota) {
        setAiUsage((data as any).quota);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('genlabs_ai_quota_updated', { detail: (data as any).quota })
          );
        }
      }

      setTutorMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: answerText,
          suggestedParams: suggested || undefined,
        },
      ]);
    } catch (err: any) {
      const errPayload = err?.response?.data || err?.data || err?.details;
      const errCode = errPayload?.code || errPayload?.error || err?.code;
      const errMsg = errPayload?.message || err?.message || err?.error;
      const isQuotaError =
        errCode === 'DAILY_AI_QUOTA_EXCEEDED' ||
        (err?.status === 429 && typeof errMsg === 'string' && errMsg.includes('00:00'));

      if (isQuotaError) {
        setAiUsage((prev) =>
          prev
            ? { ...prev, remaining: 0 }
            : {
                daily_limit: 5,
                used: 5,
                remaining: 0,
                reset_at: '',
                rate_limit: { limit: 5, window_minutes: 10 },
              }
        );
      }

      const fallbackAnswer =
        `Berdasarkan kondisi ${spec.info.title} saat ini:\n\n` +
        `• ${presentation.results.map((r) => `${r.label}: ${r.value}`).slice(0, 4).join('\n• ')}\n\n` +
        `${presentation.insight.summary} ${presentation.insight.causeAndEffect}\n\n` +
        `${presentation.insight.whatIf || ''}`;

      const tutorText = isQuotaError
        ? 'Kuota AI Tutor hari ini sudah habis. Kamu bisa bertanya lagi setelah pukul 00.00 WIB.'
        : errMsg && (errMsg.includes('AI') || errMsg.includes('Batas'))
        ? errMsg
        : fallbackAnswer;

      setTutorMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: tutorText,
        },
      ]);
    } finally {
      setIsAsking(false);
      setQuotaRefreshKey((k) => k + 1);
    }
  };
  const evalGeometry = (
    val: number | string | undefined,
    scope: Record<string, number>,
    defaultVal: number
  ): number => {
    if (val === undefined || val === null) return defaultVal;
    if (typeof val === 'number') return val;
    const num = Number(val);
    if (!isNaN(num)) return num;
    return safeEvaluateFormula(String(val), scope);
  };

  // 7. UNIVERSAL 2D VECTOR & SHAPE VIEWPORT RENDERER
  // Renders all physical, economic, algorithmic, and abstract components with global anti-collision
  const renderUniversalViewport = (isMobile = false) => {
    const width = 720;
    const height = 360;
    const groundY = 260;

    // ── PRIORITY 1: DECLARATIVE UNIVERSAL ELEMENTS ENGINE ──
    if (spec.visual?.elements && spec.visual.elements.length > 0) {
      const scope: Record<string, number> = {
        ...params,
        time: runtimeState.time,
        position: runtimeState.dynamics.position,
        x: runtimeState.dynamics.position,
        v: runtimeState.dynamics.velocity,
        velocity: runtimeState.dynamics.velocity,
        speed: runtimeState.dynamics.velocity,
        a: runtimeState.dynamics.acceleration,
        accel: runtimeState.dynamics.acceleration,
        acceleration: runtimeState.dynamics.acceleration,
        distance: runtimeState.dynamics.distance,
      };
      for (const [k, v] of Object.entries(computed)) {
        if (typeof v === 'number') scope[k] = v;
      }

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none">
          <defs>
            <marker id="arrow-head-universal" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--color-primary)" />
            </marker>
          </defs>

          {spec.visual.gridLines && (
            <g opacity={0.6}>
              {Array.from({ length: 13 }, (_, i) => (
                <line key={`gx-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={height} stroke="var(--color-canvas-grid)" strokeWidth={1} />
              ))}
              {Array.from({ length: 8 }, (_, i) => (
                <line key={`gy-${i}`} x1={0} y1={i * 50} x2={width} y2={i * 50} stroke="var(--color-canvas-grid)" strokeWidth={1} />
              ))}
            </g>
          )}

          {spec.visual.groundPlane && (
            <g>
              <rect x={0} y={groundY} width={width} height={height - groundY} fill="var(--color-canvas-ground)" />
              <line x1={0} y1={groundY} x2={width} y2={groundY} stroke="var(--color-canvas-seam)" strokeWidth={2} />
            </g>
          )}

          {(() => {
            // 1. Initial obstacles boundary register
            const obstacles: LayoutObstacle[] = [];
            if (spec.visual.groundPlane) {
              obstacles.push({ id: 'ground', x: 0, y: groundY, width, height: height - groundY, padding: 6 });
            }

            // 2. Pre-evaluate geometry for all elements
            const evaluatedElements = spec.visual.elements.map((elem, idx) => {
              const isBall = elem.radius !== undefined || /bola|ball|peluru/i.test(elem.label || '') || /bola|ball|peluru/i.test(elem.id || '');
              const isGoal = /gawang|goal|target/i.test(elem.label || '') || /gawang|goal/i.test(elem.id || '');
              const elX = evalGeometry(elem.x, scope, 50);
              const elY = evalGeometry(elem.y, scope, 50);
              const elW = evalGeometry(elem.width, scope, isBall ? 44 : 80);
              const elH = evalGeometry(elem.height, scope, isBall ? 44 : 50);
              const elX2 = evalGeometry(elem.x2, scope, elX + elW);
              const elY2 = evalGeometry(elem.y2, scope, elY);
              const radius = isBall ? evalGeometry(elem.radius, scope, Math.min(elW, elH) / 2 || 22) : undefined;
              return {
                elem,
                idx,
                elX,
                elY,
                elW,
                elH,
                elX2,
                elY2,
                isBall,
                isGoal,
                radius,
              };
            });

            // 3. Register all shapes as initial obstacles
            for (const item of evaluatedElements) {
              if (item.elem.type === 'shape') {
                if (item.radius) {
                  obstacles.push({
                    id: item.elem.id || `shape-${item.idx}`,
                    x: item.elX - item.radius,
                    y: item.elY - item.radius,
                    width: item.radius * 2,
                    height: item.radius * 2,
                    padding: 8,
                  });
                } else {
                  obstacles.push({
                    id: item.elem.id || `shape-${item.idx}`,
                    x: item.elX,
                    y: item.elY,
                    width: item.elW,
                    height: item.elH,
                    padding: 8,
                  });
                }
              }
            }

            // 4. Check ballistic flight trajectory animation target
            const ballItem = evaluatedElements.find((e) => e.isBall);
            const goalItem = evaluatedElements.find((e) => e.isGoal);
            const trajectoryItem = evaluatedElements.find(
              (e) => e.elem.type === 'arrow' || /lintasan|kurva|magnus|parabola/i.test(e.elem.label || '')
            );

            const targetX = goalItem ? goalItem.elX : trajectoryItem ? trajectoryItem.elX2 : width - 110;
            const targetY = goalItem ? goalItem.elY + goalItem.elH * 0.4 : trajectoryItem ? trajectoryItem.elY2 : groundY - 70;

            let dynamicBallCx = ballItem?.elX ?? 80;
            let dynamicBallCy = ballItem?.elY ?? 240;
            if (ballItem && runtimeState.isRunning && runtimeState.time > 0) {
              const kickSpeed = runtimeState.dynamics.velocity || Number(params.kecepatan ?? params.velocity ?? params.speed ?? 35);
              const duration = Math.max(1.2, 75 / Math.max(8, kickSpeed));
              const cycle = runtimeState.time % (duration + 1.2);
              const progress = Math.min(1, cycle / duration);
              
              dynamicBallCx = ballItem.elX + (targetX - ballItem.elX) * progress;
              const spinVal = Number(params.spin ?? params.putaran ?? params.omega ?? 30);
              const apexDeflection = 50 + Math.min(70, Math.abs(spinVal) * 1.5) * (Math.sign(spinVal) || 1);
              dynamicBallCy = ballItem.elY + (targetY - ballItem.elY) * progress - 4 * apexDeflection * progress * (1 - progress);
            }

            return evaluatedElements.map((item) => {
              const { elem, idx, elX, elY, elW, elH, elX2, elY2, isBall, isGoal, radius } = item;
              const isSelected = mode === 'admin' && selectedElementId === elem.id;

              let elemNode: React.ReactNode = null;

              if (elem.type === 'shape') {
                if (isBall) {
                  const r = radius || 22;
                  const cx = dynamicBallCx;
                  const cy = dynamicBallCy;

                  let ballLabelNode: React.ReactNode = null;
                  if (elem.label) {
                    const lbl = placeLabel({
                      anchor: { x: cx - r, y: cy - r, width: r * 2, height: r * 2 },
                      text: elem.label,
                      preferredPosition: 'bottom',
                      obstacles,
                      viewport: { width, height },
                      gap: 8,
                    });
                    if (lbl) {
                      obstacles.push({ id: `lbl-${elem.id || idx}`, x: lbl.x, y: lbl.y, width: lbl.width, height: lbl.height, padding: 4 });
                      ballLabelNode = (
                        <g transform={`translate(${lbl.x}, ${lbl.y})`}>
                          <rect x={-4} y={-2} width={lbl.width + 8} height={lbl.height + 4} fill="var(--color-surface)" rx={4} stroke="var(--color-border)" strokeWidth={1} />
                          <text x={lbl.width / 2} y={lbl.height / 2 + 3} textAnchor="middle" fill="var(--color-text)" fontSize={10.5} fontFamily="Space Mono" fontWeight="bold">
                            {elem.label}
                          </text>
                        </g>
                      );
                    }
                  }

                  elemNode = (
                    <g>
                      {/* Ground Contact Shadow */}
                      <ellipse cx={cx} cy={groundY - 2} rx={r * 0.9} ry={4} fill="rgba(0,0,0,0.22)" />
                      {/* Soccer Ball Specimen Body */}
                      <circle cx={cx} cy={cy} r={r} fill="#f8fafc" stroke="#1e293b" strokeWidth={2.5} />
                      {/* Realistic Pentagon Center Pattern */}
                      <polygon
                        points={`${cx},${cy - r * 0.45} ${cx + r * 0.42},${cy - r * 0.14} ${cx + r * 0.26},${cy + r * 0.38} ${cx - r * 0.26},${cy + r * 0.38} ${cx - r * 0.42},${cy - r * 0.14}`}
                        fill="#0f172a"
                      />
                      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#334155" strokeWidth={1.5} />
                      {ballLabelNode}
                    </g>
                  );
                } else if (isGoal) {
                  let goalLabelNode: React.ReactNode = null;
                  if (elem.label) {
                    const lbl = placeLabel({
                      anchor: { x: elX, y: elY, width: elW, height: elH },
                      text: elem.label,
                      preferredPosition: 'top',
                      obstacles,
                      viewport: { width, height },
                      gap: 8,
                    });
                    if (lbl) {
                      obstacles.push({ id: `lbl-${elem.id || idx}`, x: lbl.x, y: lbl.y, width: lbl.width, height: lbl.height, padding: 4 });
                      goalLabelNode = (
                        <g transform={`translate(${lbl.x}, ${lbl.y})`}>
                          <rect x={-4} y={-2} width={lbl.width + 8} height={lbl.height + 4} fill="var(--color-surface)" rx={4} stroke="var(--color-border)" strokeWidth={1} />
                          <text x={lbl.width / 2} y={lbl.height / 2 + 3} textAnchor="middle" fill="var(--color-text)" fontSize={10.5} fontFamily="Space Mono" fontWeight="bold">
                            {elem.label}
                          </text>
                        </g>
                      );
                    }
                  }

                  elemNode = (
                    <g>
                      {/* 3D Depth Netting behind goalpost */}
                      <rect x={elX + elW} y={elY} width={36} height={elH} fill="none" stroke="var(--color-border)" strokeWidth={1} strokeDasharray="4 4" opacity={0.65} />
                      <line x1={elX + elW} y1={elY} x2={elX + elW + 36} y2={elY} stroke="#94a3b8" strokeWidth={2} />
                      <line x1={elX + elW} y1={elY + elH} x2={elX + elW + 36} y2={elY + elH} stroke="#94a3b8" strokeWidth={2} />
                      {/* Upright Post */}
                      <rect x={elX} y={elY} width={elW} height={elH} rx={4} fill="#f8fafc" stroke="#64748b" strokeWidth={2.5} />
                      {goalLabelNode}
                    </g>
                  );
                } else if (radius) {
                  let circleLabelNode: React.ReactNode = null;
                  if (elem.label) {
                    const textMetrics = measureTextSize(elem.label, 11, 'Space Mono', 'bold');
                    const fitsInside = radius * 2 >= textMetrics.width + 16;
                    if (fitsInside) {
                      circleLabelNode = (
                        <text x={elX} y={elY + 4} textAnchor="middle" fill="var(--color-text)" fontSize={11} fontFamily="Space Mono" fontWeight="bold" pointerEvents="none">
                          {elem.label}
                        </text>
                      );
                    } else {
                      const lbl = placeLabel({
                        anchor: { x: elX - radius, y: elY - radius, width: radius * 2, height: radius * 2 },
                        text: elem.label,
                        preferredPosition: 'bottom',
                        obstacles,
                        viewport: { width, height },
                        gap: 8,
                      });
                      if (lbl) {
                        obstacles.push({ id: `lbl-${elem.id || idx}`, x: lbl.x, y: lbl.y, width: lbl.width, height: lbl.height, padding: 4 });
                        circleLabelNode = (
                          <g transform={`translate(${lbl.x}, ${lbl.y})`}>
                            <rect x={-4} y={-2} width={lbl.width + 8} height={lbl.height + 4} fill="var(--color-surface)" rx={4} stroke="var(--color-border)" strokeWidth={1} />
                            <text x={lbl.width / 2} y={lbl.height / 2 + 3} textAnchor="middle" fill="var(--color-text)" fontSize={10.5} fontFamily="Space Mono" fontWeight="bold">
                              {elem.label}
                            </text>
                          </g>
                        );
                      }
                    }
                  }

                  elemNode = (
                    <g>
                      <circle cx={elX} cy={elY} r={radius} fill={elem.fill || 'var(--color-canvas-object)'} stroke={elem.stroke || 'var(--color-secondary)'} strokeWidth={elem.strokeWidth || 2} />
                      {circleLabelNode}
                    </g>
                  );
                } else {
                  let rectLabelNode: React.ReactNode = null;
                  if (elem.label) {
                    const textMetrics = measureTextSize(elem.label, 11, 'Space Mono', 'bold');
                    const fitsInside = elW >= textMetrics.width + 16 && elH >= 26;
                    if (fitsInside) {
                      rectLabelNode = (
                        <text x={elX + elW / 2} y={elY + elH / 2 + 4} textAnchor="middle" fill="var(--color-text)" fontSize={11} fontFamily="Space Mono" fontWeight="bold" pointerEvents="none">
                          {elem.label}
                        </text>
                      );
                    } else {
                      const lbl = placeLabel({
                        anchor: { x: elX, y: elY, width: elW, height: elH },
                        text: elem.label,
                        preferredPosition: 'top',
                        obstacles,
                        viewport: { width, height },
                        gap: 8,
                      });
                      if (lbl) {
                        obstacles.push({ id: `lbl-${elem.id || idx}`, x: lbl.x, y: lbl.y, width: lbl.width, height: lbl.height, padding: 4 });
                        rectLabelNode = (
                          <g transform={`translate(${lbl.x}, ${lbl.y})`}>
                            <rect x={-4} y={-2} width={lbl.width + 8} height={lbl.height + 4} fill="var(--color-surface)" rx={4} stroke="var(--color-border)" strokeWidth={1} />
                            <text x={lbl.width / 2} y={lbl.height / 2 + 3} textAnchor="middle" fill="var(--color-text)" fontSize={10.5} fontFamily="Space Mono" fontWeight="bold">
                              {elem.label}
                            </text>
                          </g>
                        );
                      }
                    }
                  }

                  elemNode = (
                    <g>
                      <rect x={elX} y={elY} width={elW} height={elH} rx={4} fill={elem.fill || 'var(--color-canvas-object)'} stroke={elem.stroke || 'var(--color-secondary)'} strokeWidth={elem.strokeWidth || 2} />
                      {rectLabelNode}
                    </g>
                  );
                }
              } else if (elem.type === 'arrow' || elem.type === 'line' || elem.type === 'curve') {
                const isCurved = elem.type === 'curve' || (elem as any).curved || /kurva|lintasan|magnus|parabola|trajectory|busur/i.test(elem.label || '');

                if (isCurved) {
                  const midX = (elX + elX2) / 2;
                  const spinVal = Number(params.spin ?? params.putaran ?? params.omega ?? 30);
                  const curveDeflection = Math.min(75, Math.max(30, Math.abs(spinVal) * 1.5));
                  const controlY = Math.min(elY, elY2) - curveDeflection;
                  const pathD = `M ${elX} ${elY} Q ${midX} ${controlY} ${elX2} ${elY2}`;

                  const lbl = elem.label ? placeLabel({
                    anchor: { x: midX, y: controlY },
                    text: elem.label,
                    preferredPosition: 'top',
                    obstacles,
                    viewport: { width, height },
                    gap: 8,
                  }) : null;

                  if (lbl) {
                    obstacles.push({ id: `lbl-${elem.id || idx}`, x: lbl.x, y: lbl.y, width: lbl.width, height: lbl.height, padding: 4 });
                  }

                  elemNode = (
                    <g>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={elem.stroke || 'var(--color-primary)'}
                        strokeWidth={elem.strokeWidth || 2.5}
                        strokeDasharray={elem.label?.includes('Lintasan') ? '6 4' : undefined}
                        markerEnd="url(#arrow-head-universal)"
                      />
                      {lbl && (
                        <g transform={`translate(${lbl.x}, ${lbl.y})`}>
                          <rect x={-4} y={-2} width={lbl.width + 8} height={lbl.height + 4} fill="var(--color-surface)" rx={4} stroke="var(--color-border)" strokeWidth={1} />
                          <text x={lbl.width / 2} y={lbl.height / 2 + 3} textAnchor="middle" fill="var(--color-text)" fontSize={10} fontFamily="Space Mono" fontWeight="bold">
                            {elem.label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                } else {
                  const lbl = elem.label ? placeLabel({
                    anchor: { x: (elX + elX2) / 2, y: (elY + elY2) / 2 },
                    text: elem.label,
                    preferredPosition: elem.side || (elY2 < elY ? 'bottom' : 'top'),
                    obstacles,
                    viewport: { width, height },
                    gap: 8,
                  }) : null;

                  if (lbl) {
                    obstacles.push({ id: `lbl-${elem.id || idx}`, x: lbl.x, y: lbl.y, width: lbl.width, height: lbl.height, padding: 4 });
                  }

                  elemNode = (
                    <g>
                      <line
                        x1={elX}
                        y1={elY}
                        x2={elX2}
                        y2={elY2}
                        stroke={elem.stroke || 'var(--color-primary)'}
                        strokeWidth={elem.strokeWidth || 2.5}
                        markerEnd={elem.type === 'arrow' ? 'url(#arrow-head-universal)' : undefined}
                      />
                      {lbl && (
                        <g transform={`translate(${lbl.x}, ${lbl.y})`}>
                          <rect x={-4} y={-2} width={lbl.width + 8} height={lbl.height + 4} fill="var(--color-surface)" rx={4} stroke="var(--color-border)" strokeWidth={1} />
                          <text x={lbl.width / 2} y={lbl.height / 2 + 3} textAnchor="middle" fill="var(--color-text)" fontSize={10} fontFamily="Space Mono" fontWeight="bold">
                            {elem.label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                }
              } else if (elem.type === 'point') {
                const lbl = elem.label ? placeLabel({
                  anchor: { x: elX, y: elY },
                  text: elem.label,
                  preferredPosition: 'top-right',
                  obstacles,
                  viewport: { width, height },
                  gap: 6,
                }) : null;

                if (lbl) {
                  obstacles.push({ id: `lbl-${elem.id || idx}`, x: lbl.x, y: lbl.y, width: lbl.width, height: lbl.height, padding: 4 });
                }

                elemNode = (
                  <g>
                    <circle cx={elX} cy={elY} r={5} fill={elem.color || 'var(--color-accent)'} />
                    {lbl && (
                      <g transform={`translate(${lbl.x}, ${lbl.y})`}>
                        <text x={0} y={10} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
                          {elem.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              } else if (elem.type === 'text') {
                elemNode = (
                  <text
                    x={elX}
                    y={elY}
                    dominantBaseline="hanging"
                    fill={elem.color || 'var(--color-text)'}
                    fontSize={elem.fontSize || 13}
                    fontFamily="Space Mono"
                    fontWeight={elem.fontWeight || 'bold'}
                  >
                    {elem.label || 'Teks Visual'}
                  </text>
                );
              } else if (elem.type === 'image') {
                elemNode = (
                  <image
                    href={elem.url || '/placeholder.png'}
                    x={elX}
                    y={elY}
                    width={elW}
                    height={elH}
                    preserveAspectRatio="xMidYMid meet"
                  />
                );
              } else if (elem.type === 'chart') {
                elemNode = (
                  <g>
                    <rect x={elX} y={elY} width={elW} height={elH} fill="var(--color-surface-subtle)" stroke="var(--color-border)" rx={4} />
                    <path d={`M ${elX + 8} ${elY + elH - 8} Q ${elX + elW * 0.4} ${elY + 12}, ${elX + elW - 8} ${elY + elH * 0.3}`} fill="none" stroke="var(--color-primary)" strokeWidth={2} />
                    {elem.label && (
                      <text x={elX + 8} y={elY + 14} fill="var(--color-text-secondary)" fontSize={10} fontFamily="Space Mono" fontWeight="bold">
                        {elem.label}
                      </text>
                    )}
                  </g>
                );
              }

              return (
                <g
                  key={elem.id || idx}
                  onClick={(e) => {
                    if (mode === 'admin') {
                      e.stopPropagation();
                      onSelectElement && onSelectElement(elem.id);
                    }
                  }}
                  className={mode === 'admin' ? 'cursor-pointer' : undefined}
                >
                  {elemNode}
                  {/* Selection Bounding Ring & Corner Handles */}
                  {isSelected && (
                    <g pointerEvents="none">
                      <rect
                        x={elX - 4}
                        y={elY - 4}
                        width={elW + 8}
                        height={elH + 8}
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                        rx={2}
                      />
                      <rect x={elX - 7} y={elY - 7} width={6} height={6} fill="#ffffff" stroke="var(--color-primary)" strokeWidth={1.5} rx={1} />
                      <rect x={elX + elW + 1} y={elY - 7} width={6} height={6} fill="#ffffff" stroke="var(--color-primary)" strokeWidth={1.5} rx={1} />
                      <rect x={elX - 7} y={elY + elH + 1} width={6} height={6} fill="#ffffff" stroke="var(--color-primary)" strokeWidth={1.5} rx={1} />
                      <rect x={elX + elW + 1} y={elY + elH + 1} width={6} height={6} fill="#ffffff" stroke="var(--color-primary)" strokeWidth={1.5} rx={1} />
                    </g>
                  )}
                </g>
              );
            });
          })()}

          {/* Universal Dynamic Telemetry Overlay (top-right HUD) */}
          {Object.keys(computed).length > 0 && (
            <g transform={`translate(${width - 195}, 14)`}>
              <rect
                width={180}
                height={Math.min(96, 26 + Object.keys(computed).length * 18)}
                rx={2}
                fill="var(--color-canvas-ground)"
                stroke="var(--color-canvas-seam)"
                strokeWidth={1}
              />
              <text x={10} y={16} fill="var(--color-secondary)" fontSize={9} fontFamily="Space Mono" fontWeight="bold">
                HASIL SIMULASI
              </text>
              {Object.entries(computed).slice(0, 3).map(([k, v], idx) => (
                <text key={k} x={10} y={34 + idx * 18} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
                  {k}: <tspan fill="var(--color-secondary)" fontWeight="bold">{typeof v === 'number' ? formatCleanNumber(v) : String(v)}</tspan>
                </text>
              ))}
            </g>
          )}
        </svg>
      );
    }

    const isLegacySimulation = Boolean(
      (spec.slug && LEGACY_SIMS[spec.slug]) ||
      (canonicalSlug && LEGACY_SIMS[canonicalSlug]) ||
      (spec.slug && getGenlabSimulation(spec.slug)) ||
      (canonicalSlug && getGenlabSimulation(canonicalSlug)) ||
      (spec.slug && (GENLAB_SIMULATIONS as any)[spec.slug]) ||
      (canonicalSlug && (GENLAB_SIMULATIONS as any)[canonicalSlug]) ||
      (spec.slug === 'newtons-second-law') ||
      (canonicalSlug === 'newtons-second-law')
    );

    // Build obstacles for anti-collision
    const obstacles: LayoutObstacle[] = [
      { id: 'ground', x: 0, y: groundY, width, height: height - groundY, padding: 8 },
    ];

    // Detect high-level archetypes for rendering
    const s = spec.slug.toLowerCase();
    const arch = spec.visual?.archetype;
    const isMagnusAerodynamics =
      s.includes('magnus') ||
      s.includes('tendangan') ||
      s.includes('sepak') ||
      s.includes('bola-belok') ||
      s.includes('pisang') ||
      Boolean(
        spec.info?.title &&
          /magnus|bola.*belok|tendangan|pisang/i.test(spec.info.title)
      );
    const isFunctionExplorer =
      s.includes('function-explorer') ||
      s.includes('fungsi-kuadrat') ||
      s.includes('quadratic') ||
      (s.includes('parabola') && (s.includes('fungsi') || s.includes('kuadrat') || s.includes('math') || s.includes('aljabar')));
    const isProjectile =
      (s.includes('projectile') ||
        s.includes('gerak-peluru') ||
        s.includes('peluru') ||
        s.includes('kinematika-gerak-peluru') ||
        s.includes('parabola')) &&
      !isMagnusAerodynamics &&
      !isFunctionExplorer;
    const isMomentum =
      s.includes('momentum') || s.includes('collision') || s.includes('tumbukan');
    const isVectorMath =
      s.includes('vector') || s.includes('vektor');
    const isPhScale =
      s.includes('ph-scale') || s.includes('ph_scale') || s.includes('ph-') || s.includes('asam-basa') || s.includes('skala-ph');
    const isProbabilityCoin =
      s.includes('probability') || s.includes('peluang') || s.includes('koin') || s.includes('coin');
    const isLinearRegression =
      s.includes('linear-regression') || s.includes('linear_regression') || s.includes('regresi');
    const isNormalDistribution =
      s.includes('normal-distribution') || s.includes('normal_distribution') || s.includes('distribusi-normal') || s.includes('gauss');
    const isCompoundInterest =
      s.includes('compound') || s.includes('bunga-majemuk') || (s.includes('interest') && !s.includes('rate'));
    const isSupplyDemand =
      s.includes('supply-demand') || s.includes('supply_demand') || s.includes('permintaan-penawaran');
    const isGraphTraversal =
      s.includes('graph') || s.includes('graf') || s.includes('bfs') || s.includes('dfs');
    const isBinarySearch =
      s.includes('binary-search') || s.includes('binary_search') || s.includes('pencarian-biner');
    const isFluid = s.includes('archimedes') || s.includes('fluida') || s.includes('apung') || s.includes('buoyancy') || s.includes('hidrostatik') || s.includes('bejana') || s.includes('hukum-archimedes') || s.includes('pascal');
    const isThermodynamics = s.includes('carnot') || s.includes('termo') || s.includes('kalor') || s.includes('mesin-kalor') || s.includes('siklus') || s.includes('panas') || s.includes('efisiensi');
    const isPhysics = arch === 'physics' || isMagnusAerodynamics || isProjectile || isMomentum || isFluid || isThermodynamics || s.includes('newton') || s.includes('second-law') || s.includes('force') || s.includes('hooke') || s.includes('pegas') || s.includes('kinematika') || s.includes('gerak');
    const isEconomics = arch === 'chart' || isSupplyDemand || isCompoundInterest || s.includes('break-even') || s.includes('bep') || s.includes('curve') || s.includes('grafik') || (s.includes('fungsi') && !isFunctionExplorer) || isLinearRegression;
    const isTax = (arch as string) === 'tax' || s.includes('tax') || s.includes('pajak') || s.includes('pph');
    const isBalance = !isTax && (arch === 'balance' || s.includes('accounting') || s.includes('persamaan') || s.includes('jurnal') || s.includes('neraca') || s.includes('saldo'));
    const isFunnel = (arch as string) === 'funnel' || s.includes('funnel');
    const isGreenhouse = s.includes('greenhouse') || s.includes('vpd');
    const isHydroponics = s.includes('hydroponic');
    const isGrid = arch === 'grid' || s.includes('farm') || s.includes('soil') || s.includes('venue') || s.includes('grid') || s.includes('irrig');
    const isAlgorithm = (arch as string) === 'sequence' || isBinarySearch || isGraphTraversal || s.includes('sort') || s.includes('search') || s.includes('algorithm') || s.includes('linear-search') || s.includes('queue') || s.includes('stack') || s.includes('logic') || s.includes('gerbang');

    // ── ARCHETYPE A0: AERODYNAMICS & MAGNUS EFFECT ──
    if (isMagnusAerodynamics) {
      const speed = Number(params.kecepatan ?? params.velocity ?? params.v ?? params.speed ?? 35);
      const spin = Number(params.spin ?? params.putaran ?? params.omega ?? params.rpm ?? 30);
      const mass = Number(params.mass ?? params.massa ?? params.m ?? 0.45);
      const angleDeg = Number(params.sudut ?? params.elevasi ?? params.angle ?? 18);

      // Calculations: Magnus Lift force F_M = S * omega * v
      const magnusForce = 0.0028 * spin * speed;
      const weight = mass * 9.81;

      // Pitch geometry
      const ballOriginX = 90;
      const ballOriginY = groundY - 22;
      const goalX = width - 85;
      const goalY = groundY - 110;
      const goalW = 16;
      const goalH = 110;

      // Trajectory curve apex
      const midX = (ballOriginX + goalX) / 2;
      const curveApexY = Math.max(45, ballOriginY - 55 - magnusForce * 3.2);
      const trajectoryPathD = `M ${ballOriginX} ${ballOriginY} Q ${midX} ${curveApexY} ${goalX} ${goalY + 25}`;

      // Animation: live flight of ball when running
      let ballX = ballOriginX;
      let ballY = ballOriginY;
      let rotDeg = 0;
      if (runtimeState.isRunning && runtimeState.time > 0) {
        const flightTime = Math.max(1.0, 65 / Math.max(10, speed));
        const cycle = runtimeState.time % (flightTime + 1.2);
        const p = Math.min(1, cycle / flightTime);
        ballX = ballOriginX + (goalX - ballOriginX) * p;
        ballY = ballOriginY + (goalY + 25 - ballOriginY) * p - 4 * (ballOriginY - curveApexY) * p * (1 - p);
        rotDeg = (runtimeState.time * spin * 25) % 360;
      }

      // Vector arrows
      const vArrowLen = Math.min(95, Math.max(30, speed * 1.8));
      const vAngleRad = (angleDeg * Math.PI) / 180;
      const vx = ballX + Math.cos(vAngleRad) * vArrowLen;
      const vy = ballY - Math.sin(vAngleRad) * vArrowLen;

      const fmArrowLen = Math.min(75, Math.max(20, Math.abs(magnusForce) * 4.5));
      const fmy = ballY - (magnusForce >= 0 ? fmArrowLen : -fmArrowLen);

      // Label placements with anti-collision
      const aeroObstacles: LayoutObstacle[] = [
        { id: 'ground', x: 0, y: groundY, width, height: height - groundY, padding: 6 },
        { id: 'goal', x: goalX - 10, y: goalY - 10, width: goalW + 40, height: goalH + 10, padding: 6 },
        { id: 'ball', x: ballX - 22, y: ballY - 22, width: 44, height: 44, padding: 6 },
      ];

      const ballLbl = placeLabel({
        anchor: { x: ballX - 22, y: ballY - 22, width: 44, height: 44 },
        text: 'Bola Sepak',
        preferredPosition: 'bottom',
        obstacles: aeroObstacles,
        viewport: { width, height },
        gap: 8,
      });
      if (ballLbl) aeroObstacles.push({ id: 'lbl-ball', x: ballLbl.x, y: ballLbl.y, width: ballLbl.width, height: ballLbl.height });

      const goalLbl = placeLabel({
        anchor: { x: goalX, y: goalY, width: goalW, height: goalH },
        text: 'Gawang',
        preferredPosition: 'top',
        obstacles: aeroObstacles,
        viewport: { width, height },
        gap: 8,
      });
      if (goalLbl) aeroObstacles.push({ id: 'lbl-goal', x: goalLbl.x, y: goalLbl.y, width: goalLbl.width, height: goalLbl.height });

      const vLbl = placeLabel({
        anchor: { x: (ballX + vx) / 2, y: (ballY + vy) / 2 },
        text: `Vektor Kecepatan (${speed} m/s)`,
        preferredPosition: 'top-left',
        obstacles: aeroObstacles,
        viewport: { width, height },
        gap: 8,
      });
      if (vLbl) aeroObstacles.push({ id: 'lbl-v', x: vLbl.x, y: vLbl.y, width: vLbl.width, height: vLbl.height });

      const fmLbl = placeLabel({
        anchor: { x: ballX, y: (ballY + fmy) / 2 },
        text: `Gaya Magnus FM (${magnusForce.toFixed(1)} N)`,
        preferredPosition: magnusForce >= 0 ? 'top-right' : 'bottom-right',
        obstacles: aeroObstacles,
        viewport: { width, height },
        gap: 8,
      });
      if (fmLbl) aeroObstacles.push({ id: 'lbl-fm', x: fmLbl.x, y: fmLbl.y, width: fmLbl.width, height: fmLbl.height });

      const trajLbl = placeLabel({
        anchor: { x: midX, y: curveApexY },
        text: 'Lintasan Kurva Efek Magnus',
        preferredPosition: 'top',
        obstacles: aeroObstacles,
        viewport: { width, height },
        gap: 8,
      });

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none">
          <defs>
            <marker id="arrow-v-aero" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
            </marker>
            <marker id="arrow-fm-aero" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>
            <linearGradient id="grass-pitch-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#14532d" />
            </linearGradient>
          </defs>

          {/* Graticule Grid */}
          <g opacity={0.35}>
            {Array.from({ length: 15 }, (_, i) => (
              <line key={`gx-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={height} stroke="var(--color-canvas-grid)" strokeWidth={1} />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <line key={`gy-${i}`} x1={0} y1={i * 50} x2={width} y2={i * 50} stroke="var(--color-canvas-grid)" strokeWidth={1} />
            ))}
          </g>

          {/* Soccer Pitch Grass Surface */}
          <rect x={0} y={groundY} width={width} height={height - groundY} fill="url(#grass-pitch-grad)" />
          <line x1={0} y1={groundY} x2={width} y2={groundY} stroke="#ffffff" strokeWidth={2.5} opacity={0.8} />

          {/* Pitch Yard Lines & Penalty Box Markings */}
          <line x1={500} y1={groundY} x2={500} y2={height} stroke="#ffffff" strokeWidth={1.5} opacity={0.5} />
          <line x1={ballOriginX} y1={groundY - 2} x2={ballOriginX} y2={groundY + 8} stroke="#ffffff" strokeWidth={2} />

          {/* Curved Magnus Flight Trajectory Path */}
          <path d={trajectoryPathD} fill="none" stroke="#38bdf8" strokeWidth={2.5} strokeDasharray="6 4" opacity={0.9} />
          {trajLbl && (
            <g transform={`translate(${trajLbl.x}, ${trajLbl.y})`}>
              <rect x={-4} y={-2} width={trajLbl.width + 8} height={trajLbl.height + 4} fill="var(--color-surface)" rx={4} stroke="#38bdf8" strokeWidth={1} />
              <text x={trajLbl.width / 2} y={trajLbl.height / 2 + 3} textAnchor="middle" fill="var(--color-text)" fontSize={10} fontFamily="Space Mono" fontWeight="bold">
                Lintasan Kurva Efek Magnus
              </text>
            </g>
          )}

          {/* Goalpost Structure on Right */}
          <g>
            {/* 3D Depth Netting */}
            <rect x={goalX + goalW} y={goalY} width={38} height={goalH} fill="none" stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 4" opacity={0.7} />
            <line x1={goalX + goalW} y1={goalY} x2={goalX + goalW + 38} y2={goalY} stroke="#94a3b8" strokeWidth={2} />
            <line x1={goalX + goalW} y1={goalY + goalH} x2={goalX + goalW + 38} y2={goalY + goalH} stroke="#94a3b8" strokeWidth={2} />
            {/* Goalpost Upright */}
            <rect x={goalX} y={goalY} width={goalW} height={goalH} rx={4} fill="#f8fafc" stroke="#475569" strokeWidth={2.5} />
            {goalLbl && (
              <g transform={`translate(${goalLbl.x}, ${goalLbl.y})`}>
                <rect x={-4} y={-2} width={goalLbl.width + 8} height={goalLbl.height + 4} fill="var(--color-surface)" rx={4} stroke="var(--color-border)" strokeWidth={1} />
                <text x={goalLbl.width / 2} y={goalLbl.height / 2 + 3} textAnchor="middle" fill="var(--color-text)" fontSize={10.5} fontFamily="Space Mono" fontWeight="bold">
                  Gawang
                </text>
              </g>
            )}
          </g>

          {/* Velocity Vector Arrow (v) */}
          <line x1={ballX} y1={ballY} x2={vx} y2={vy} stroke="#0284c7" strokeWidth={3} markerEnd="url(#arrow-v-aero)" />
          {vLbl && (
            <g transform={`translate(${vLbl.x}, ${vLbl.y})`}>
              <rect x={-4} y={-2} width={vLbl.width + 8} height={vLbl.height + 4} fill="var(--color-surface)" rx={4} stroke="#0284c7" strokeWidth={1} />
              <text x={vLbl.width / 2} y={vLbl.height / 2 + 3} textAnchor="middle" fill="#0284c7" fontSize={9.5} fontFamily="Space Mono" fontWeight="bold">
                Vektor Kecepatan ({speed} m/s)
              </text>
            </g>
          )}

          {/* Magnus Force Vector Arrow (F_M) */}
          <line x1={ballX} y1={ballY} x2={ballX} y2={fmy} stroke="#10b981" strokeWidth={3} markerEnd="url(#arrow-fm-aero)" />
          {fmLbl && (
            <g transform={`translate(${fmLbl.x}, ${fmLbl.y})`}>
              <rect x={-4} y={-2} width={fmLbl.width + 8} height={fmLbl.height + 4} fill="var(--color-surface)" rx={4} stroke="#10b981" strokeWidth={1} />
              <text x={fmLbl.width / 2} y={fmLbl.height / 2 + 3} textAnchor="middle" fill="#10b981" fontSize={9.5} fontFamily="Space Mono" fontWeight="bold">
                Gaya Magnus FM ({magnusForce.toFixed(1)} N)
              </text>
            </g>
          )}

          {/* Soccer Ball Specimen */}
          <g transform={`rotate(${rotDeg}, ${ballX}, ${ballY})`}>
            <ellipse cx={ballX} cy={groundY - 2} rx={20} ry={4} fill="rgba(0,0,0,0.25)" />
            <circle cx={ballX} cy={ballY} r={22} fill="#f8fafc" stroke="#1e293b" strokeWidth={2.5} />
            {/* Hexagon / Pentagon Stitching */}
            <polygon
              points={`${ballX},${ballY - 10} ${ballX + 9},${ballY - 3} ${ballX + 6},${ballY + 8} ${ballX - 6},${ballY + 8} ${ballX - 9},${ballY - 3}`}
              fill="#0f172a"
            />
            <circle cx={ballX} cy={ballY} r={22} fill="none" stroke="#334155" strokeWidth={1.5} />
          </g>
          {ballLbl && (
            <g transform={`translate(${ballLbl.x}, ${ballLbl.y})`}>
              <rect x={-4} y={-2} width={ballLbl.width + 8} height={ballLbl.height + 4} fill="var(--color-surface)" rx={4} stroke="var(--color-border)" strokeWidth={1} />
              <text x={ballLbl.width / 2} y={ballLbl.height / 2 + 3} textAnchor="middle" fill="var(--color-text)" fontSize={10.5} fontFamily="Space Mono" fontWeight="bold">
                Bola Sepak
              </text>
            </g>
          )}


          {/* Telemetry HUD Top Right */}
          <g transform={`translate(${width - 205}, 18)`}>
            <rect width={185} height={76} rx={6} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1} />
            <text x={10} y={16} fill="var(--color-primary-text)" fontSize={9} fontFamily="Space Mono" fontWeight="bold">
              PENGUKURAN AERODINAMIKA
            </text>
            <text x={10} y={32} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Kecepatan: <tspan fill="#38bdf8">{speed} m/s</tspan>
            </text>
            <text x={10} y={48} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Spin (ω): <tspan fill="#f59e0b">{spin} rad/s</tspan>
            </text>
            <text x={10} y={64} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Gaya Magnus: <tspan fill="#10b981">{magnusForce.toFixed(1)} N</tspan>
            </text>
          </g>
        </svg>
      );
    }

    // ── ARCHETYPE A0.1: BALLISTIC PROJECTILE MOTION ──
    if (isProjectile) {
      const v0 = Math.max(0, Number(params.velocity ?? params.kecepatan ?? params.v0 ?? params.v ?? 25));
      const theta = Math.min(90, Math.max(0, Number(params.angle ?? params.sudut ?? params.elevasi ?? 45)));
      const g = Math.max(0.1, Number(params.gravity ?? params.gravitasi ?? params.g ?? 9.81));
      const y0 = Math.max(0, Number(params.y0 ?? params.initialHeight ?? params.h0 ?? 0));
      const rad = (theta * Math.PI) / 180;
      const vx = v0 * Math.cos(rad);
      const vy = v0 * Math.sin(rad);
      const flightTime = Math.max(0.01, (vy + Math.sqrt(Math.max(0, vy * vy + 2 * g * y0))) / g);
      const range = Math.max(0, vx * flightTime);
      const apexT = vy > 0 ? vy / g : 0;
      const maxHeight = Math.max(y0, y0 + (vy > 0 ? (vy * vy) / (2 * g) : 0));

      const originX = 85;
      const originY = groundY;
      const availWidth = width - originX - 45;
      const availHeight = groundY - 45;
      const aspect = availWidth / Math.max(1, availHeight);

      // Isotropic Physical Coordinate System: 1 meter horizontal = 1 meter vertical
      // Discrete stable metric brackets eliminate camera jitter and ensure height/gravity react physically
      const reqDist = Math.max(15, range * 1.12);
      const reqHeight = Math.max(8, maxHeight * 1.2);
      const effectiveReqWorldX = Math.max(reqDist, reqHeight * aspect);

      const METRIC_BRACKETS = [
        { maxDist: 25, step: 5 },
        { maxDist: 50, step: 5 },
        { maxDist: 100, step: 10 },
        { maxDist: 200, step: 20 },
        { maxDist: 400, step: 40 },
        { maxDist: 800, step: 100 },
        { maxDist: 1600, step: 200 },
      ];
      const bracket = METRIC_BRACKETS.find((b) => b.maxDist >= effectiveReqWorldX) ?? {
        maxDist: Math.ceil(effectiveReqWorldX / 200) * 200,
        step: 200,
      };
      const worldMaxX = bracket.maxDist;
      const gridStep = bracket.step;
      const scale = availWidth / worldMaxX; // ISOTROPIC: scaleX === scaleY
      const maxVisibleY = availHeight / scale;

      const cannonX = originX;
      const cannonY = originY - y0 * scale;

      const steps = 48;
      const trajPoints: { x: number; y: number }[] = [];
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * flightTime;
        const px = cannonX + (vx * t) * scale;
        const py = cannonY - (vy * t - 0.5 * g * t * t) * scale;
        trajPoints.push({ x: px, y: py });
      }
      const trajPathD = trajPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');

      const apexX = cannonX + (vx * apexT) * scale;
      const apexY = originY - maxHeight * scale;
      const landX = cannonX + range * scale;

      const curT = runtimeState.time > 0 ? Math.min(flightTime, runtimeState.time) : 0;
      const curX = vx * curT;
      const curY = Math.max(0, y0 + vy * curT - 0.5 * g * curT * curT);
      const ballX = cannonX + curX * scale;
      const ballY = originY - curY * scale;
      const curVy = vy - g * curT;
      const curSpeed = Math.sqrt(vx * vx + curVy * curVy);
      const isLanded = runtimeState.time >= flightTime && flightTime > 0;

      const yTickCount = Math.floor(maxVisibleY / gridStep);
      const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) => i * gridStep);

      const xTickCount = Math.floor(worldMaxX / gridStep);
      const xTicks = Array.from({ length: xTickCount + 1 }, (_, i) => i * gridStep);

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none">
          <defs>
            <marker id="arrow-v0-proj" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-vlive-proj" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
            </marker>
            <linearGradient id="proj-traj-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Orthogonal Metric Graticule Grid */}
          <g opacity={0.35}>
            {xTicks.map((d) => {
              const tx = originX + d * scale;
              return (
                <line key={`gx-${d}`} x1={tx} y1={originY - maxVisibleY * scale} x2={tx} y2={originY} stroke="var(--color-canvas-grid)" strokeWidth={1} strokeDasharray="3 3" />
              );
            })}
            {yTicks.map((h) => {
              const ty = originY - h * scale;
              return (
                <line key={`gy-${h}`} x1={54} y1={ty} x2={width - 20} y2={ty} stroke="var(--color-canvas-grid)" strokeWidth={1} strokeDasharray="3 3" />
              );
            })}
          </g>

          {/* Ground Plane */}
          <rect x={0} y={groundY} width={width} height={height - groundY} fill="var(--color-canvas-ground)" />
          <line x1={0} y1={groundY} x2={width} y2={groundY} stroke="var(--color-secondary)" strokeWidth={2} />

          {/* Vertical Altitude Ruler (Y-Axis) */}
          <line x1={54} y1={originY} x2={54} y2={originY - maxVisibleY * scale} stroke="var(--color-text-secondary)" strokeWidth={1.5} />
          {yTicks.map((h) => {
            const ty = originY - h * scale;
            return (
              <g key={`yt-${h}`}>
                <line x1={48} y1={ty} x2={54} y2={ty} stroke="var(--color-text-secondary)" strokeWidth={1.2} />
                <text x={44} y={ty + 3} textAnchor="end" fill="var(--color-text-secondary)" fontSize={9} fontFamily="Space Mono">
                  {h}m
                </text>
              </g>
            );
          })}

          {/* Horizontal Distance Ruler (X-Axis) */}
          {xTicks.map((d) => {
            const tx = originX + d * scale;
            return (
              <g key={`xt-${d}`}>
                <line x1={tx} y1={groundY} x2={tx} y2={groundY + 8} stroke="var(--color-text-secondary)" strokeWidth={1.5} />
                <text x={tx} y={groundY + 20} textAnchor="middle" fill="var(--color-text-secondary)" fontSize={9} fontFamily="Space Mono">
                  {d}m
                </text>
              </g>
            );
          })}

          {/* Launch Tower / Platform when initial height y0 > 0 */}
          {y0 > 0 && (
            <g>
              <rect x={cannonX - 16} y={cannonY} width={32} height={y0 * scale} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1.5} rx={3} />
              <line x1={cannonX - 22} y1={cannonY} x2={cannonX + 22} y2={cannonY} stroke="var(--color-border)" strokeWidth={2.5} />
              <text x={cannonX} y={cannonY + (y0 * scale) / 2 + 3} textAnchor="middle" fill="var(--color-text-secondary)" fontSize={8.5} fontFamily="Space Mono">
                y₀:{y0}m
              </text>
            </g>
          )}

          {/* Trajectory Parabolic Curve */}
          <path d={trajPathD} fill="none" stroke="url(#proj-traj-grad)" strokeWidth={3} strokeDasharray="6 3" />

          {/* Apex Height Marker with Dual-Axis Projections */}
          <line x1={apexX} y1={apexY} x2={apexX} y2={groundY} stroke="#818cf8" strokeWidth={1.5} strokeDasharray="3 3" />
          <line x1={54} y1={apexY} x2={apexX} y2={apexY} stroke="#818cf8" strokeWidth={1.2} strokeDasharray="2 3" opacity={0.65} />
          <circle cx={apexX} cy={apexY} r={5} fill="#818cf8" stroke="#ffffff" strokeWidth={1.5} />
          <g transform={`translate(${apexX}, ${Math.max(26, apexY - 16)})`}>
            <rect x={-46} y={-9} width={92} height={18} rx={4} fill="var(--color-surface)" stroke="#818cf8" strokeWidth={1} />
            <text x={0} y={4} textAnchor="middle" fill="#818cf8" fontSize={9.5} fontFamily="Space Mono" fontWeight="bold">
              Hmax: {maxHeight.toFixed(1)}m
            </text>
          </g>

          {/* Landing Target Flag */}
          <line x1={landX} y1={groundY} x2={landX} y2={groundY - 32} stroke="#f43f5e" strokeWidth={2} />
          <polygon points={`${landX},${groundY - 32} ${landX + 18},${groundY - 24} ${landX},${groundY - 16}`} fill="#f43f5e" />
          <g transform={`translate(${landX}, ${groundY + 28})`}>
            <rect x={-45} y={-9} width={90} height={18} rx={3} fill="var(--color-surface)" stroke="#f43f5e" strokeWidth={1} />
            <text x={0} y={4} textAnchor="middle" fill="#f43f5e" fontSize={9.5} fontFamily="Space Mono" fontWeight="bold">
              R: {range.toFixed(1)}m
            </text>
          </g>

          {/* Cannon Launcher Stand & Barrel: strictly 1:1 aligned with departure tangent */}
          <circle cx={cannonX} cy={cannonY} r={14} fill="var(--color-surface-subtle)" stroke="var(--color-border)" strokeWidth={2} />
          <g transform={`translate(${cannonX}, ${cannonY}) rotate(${-theta})`}>
            <rect x={-6} y={-8} width={38} height={16} rx={3} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1.5} />
            <line x1={32} y1={0} x2={60} y2={0} stroke="#38bdf8" strokeWidth={2.5} markerEnd="url(#arrow-v0-proj)" />
          </g>

          {/* Elevation Angle Arc */}
          <path
            d={`M ${cannonX + 26} ${cannonY} A 26 26 0 0 0 ${cannonX + 26 * Math.cos(rad)} ${cannonY - 26 * Math.sin(rad)}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2}
          />
          <text x={cannonX + 32} y={cannonY - 8} fill="#f59e0b" fontSize={10} fontFamily="Space Mono" fontWeight="bold">
            {theta}°
          </text>

          {/* Instantaneous Velocity Arrow on Ball during flight */}
          {curT > 0 && !isLanded && (
            <line
              x1={ballX}
              y1={ballY}
              x2={ballX + (vx / (curSpeed || 1)) * 28}
              y2={ballY - (curVy / (curSpeed || 1)) * 28}
              stroke="#f43f5e"
              strokeWidth={2}
              markerEnd="url(#arrow-vlive-proj)"
            />
          )}

          {/* Animated Projectile Ball */}
          <circle cx={ballX} cy={ballY} r={6.5} fill={isLanded ? "#10b981" : "#f43f5e"} stroke="#ffffff" strokeWidth={2} />

          {/* Telemetry HUD Top Right */}
          <g transform={`translate(${width - 215}, 16)`}>
            <rect width={195} height={82} rx={6} fill="var(--color-surface)" fillOpacity={0.92} stroke="var(--color-border)" strokeWidth={1} />
            <text x={10} y={16} fill="var(--color-primary-text)" fontSize={9} fontFamily="Space Mono" fontWeight="bold">
              PENGUKURAN KINEMATIKA
            </text>
            <text x={10} y={32} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Posisi (x, y): <tspan fill="#38bdf8">({curX.toFixed(1)}m, {curY.toFixed(1)}m)</tspan>
            </text>
            <text x={10} y={48} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Kecepatan (v): <tspan fill="#f43f5e">{curSpeed.toFixed(1)} m/s</tspan>
            </text>
            <text x={10} y={64} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Waktu: <tspan fill="#10b981">{curT.toFixed(2)}s / {flightTime.toFixed(2)}s</tspan>
            </text>
          </g>
        </svg>
      );
    }

    // ── ARCHETYPE A0.2: 1D MOMENTUM & COLLISION ──
    if (isMomentum) {
      const m1 = Number(params.m1 ?? params.mass1 ?? 2);
      const v1 = Number(params.v1 ?? params.velocity1 ?? 5);
      const m2 = Number(params.m2 ?? params.mass2 ?? 2);
      const v2 = Number(params.v2 ?? params.velocity2 ?? 0);
      const e = Math.max(0, Math.min(1, Number(params.elasticity ?? params.e ?? 1.0)));

      const totalM = m1 + m2;
      const pInitial = m1 * v1 + m2 * v2;
      const v1Final = (m1 * v1 + m2 * v2 - m2 * e * (v1 - v2)) / totalM;
      const v2Final = (m1 * v1 + m2 * v2 + m1 * e * (v1 - v2)) / totalM;
      const ekInit = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
      const ekFin = 0.5 * m1 * v1Final * v1Final + 0.5 * m2 * v2Final * v2Final;
      const ekLoss = Math.max(0, ekInit - ekFin);

      const cart1W = Math.min(100, Math.max(55, 45 + m1 * 10));
      const cart2W = Math.min(100, Math.max(55, 45 + m2 * 10));
      const cartH = 38;
      const trackY = groundY - 5;

      const initX1 = 90;
      const initX2 = 340;
      const scaleS = 22; // px per m/s * s
      const relSpeed = v1 - v2;
      const initDist = initX2 - (initX1 + cart1W);
      const timeToCol = relSpeed > 0.05 && initDist > 0 ? initDist / (relSpeed * scaleS) : Infinity;

      const t = runtimeState.time;
      let c1X = initX1;
      let c2X = initX2;
      let curV1 = v1;
      let curV2 = v2;

      if (t < timeToCol) {
        c1X = initX1 + v1 * scaleS * t;
        c2X = initX2 + v2 * scaleS * t;
        curV1 = v1;
        curV2 = v2;
      } else {
        const postT = t - timeToCol;
        const colX1 = initX1 + v1 * scaleS * timeToCol;
        const colX2 = colX1 + cart1W;
        c1X = colX1 + v1Final * scaleS * postT;
        c2X = colX2 + v2Final * scaleS * postT;
        curV1 = v1Final;
        curV2 = v2Final;
      }

      // Constrain within air track
      c1X = Math.max(55, Math.min(width - 55 - cart1W, c1X));
      c2X = Math.max(55, Math.min(width - 55 - cart2W, c2X));

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none">
          <defs>
            <marker id="arrow-v1-mom" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-v2-mom" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
            </marker>
          </defs>

          {/* Graticule Grid */}
          <g opacity={0.35}>
            {Array.from({ length: 15 }, (_, i) => (
              <line key={`gx-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={height} stroke="var(--color-canvas-grid)" strokeWidth={1} />
            ))}
          </g>

          {/* Air Track Bed */}
          <rect x={40} y={trackY} width={width - 80} height={20} rx={4} fill="var(--color-surface-subtle)" stroke="var(--color-border)" strokeWidth={2} />
          <line x1={40} y1={trackY} x2={width - 40} y2={trackY} stroke="#475569" strokeWidth={2} />
          {Array.from({ length: 17 }, (_, i) => {
            const tx = 60 + i * ((width - 120) / 16);
            return (
              <g key={`tr-${i}`}>
                <line x1={tx} y1={trackY} x2={tx} y2={trackY + 6} stroke="#64748b" strokeWidth={1} />
                <text x={tx} y={trackY + 16} textAnchor="middle" fill="#64748b" fontSize={8} fontFamily="Space Mono">
                  {i * 10}cm
                </text>
              </g>
            );
          })}

          {/* Cart 1 (Cyan) */}
          <g transform={`translate(${c1X - cart1W / 2}, ${trackY - cartH})`}>
            <rect width={cart1W} height={cartH} rx={4} fill="#0284c7" stroke="#38bdf8" strokeWidth={2} />
            <circle cx={14} cy={cartH} r={5} fill="var(--color-canvas-ground)" stroke="var(--color-border)" strokeWidth={1.5} />
            <circle cx={cart1W - 14} cy={cartH} r={5} fill="var(--color-canvas-ground)" stroke="var(--color-border)" strokeWidth={1.5} />
            {/* Front Bumper Spring */}
            <path d={`M ${cart1W} 12 L ${cart1W + 6} 16 L ${cart1W} 20 L ${cart1W + 6} 24 L ${cart1W} 28`} fill="none" stroke="#38bdf8" strokeWidth={2} />
            <text x={cart1W / 2} y={18} textAnchor="middle" fill="#ffffff" fontSize={11} fontFamily="Space Mono" fontWeight="bold">
              m₁={m1}kg
            </text>
            <text x={cart1W / 2} y={30} textAnchor="middle" fill="#e0f2fe" fontSize={9} fontFamily="Space Mono">
              v₁={curV1.toFixed(1)}m/s
            </text>
          </g>

          {/* Cart 2 (Amber) */}
          <g transform={`translate(${c2X - cart2W / 2}, ${trackY - cartH})`}>
            <rect width={cart2W} height={cartH} rx={4} fill="#d97706" stroke="#f59e0b" strokeWidth={2} />
            <circle cx={14} cy={cartH} r={5} fill="var(--color-canvas-ground)" stroke="var(--color-border)" strokeWidth={1.5} />
            <circle cx={cart2W - 14} cy={cartH} r={5} fill="var(--color-canvas-ground)" stroke="var(--color-border)" strokeWidth={1.5} />
            {/* Front Bumper Spring */}
            <path d={`M 0 12 L -6 16 L 0 20 L -6 24 L 0 28`} fill="none" stroke="#f59e0b" strokeWidth={2} />
            <text x={cart2W / 2} y={18} textAnchor="middle" fill="#ffffff" fontSize={11} fontFamily="Space Mono" fontWeight="bold">
              m₂={m2}kg
            </text>
            <text x={cart2W / 2} y={30} textAnchor="middle" fill="#fef3c7" fontSize={9} fontFamily="Space Mono">
              v₂={curV2.toFixed(1)}m/s
            </text>
          </g>


          {/* Telemetry HUD Top Right */}
          <g transform={`translate(${width - 230}, 18)`}>
            <rect width={210} height={82} rx={6} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1} />
            <text x={10} y={16} fill="var(--color-primary-text)" fontSize={9} fontFamily="Space Mono" fontWeight="bold">
              KEKEKALAN MOMENTUM 1D
            </text>
            <text x={10} y={32} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              P Total: <tspan fill="#10b981" fontWeight="bold">{pInitial.toFixed(1)} kg·m/s (Kekal)</tspan>
            </text>
            <text x={10} y={48} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              v₁ Akhir: <tspan fill="#38bdf8">{v1Final.toFixed(2)} m/s</tspan>
            </text>
            <text x={10} y={64} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              v₂ Akhir: <tspan fill="#f59e0b">{v2Final.toFixed(2)} m/s</tspan>
            </text>
            <text x={10} y={78} fill="var(--color-text-secondary)" fontSize={9} fontFamily="Space Mono">
              Ek Hilang (Disipasi): {ekLoss.toFixed(1)} J
            </text>
          </g>
        </svg>
      );
    }

    // ── ARCHETYPE A0.3: 2D CARTESIAN VECTOR MATH ──
    if (isVectorMath) {
      const ax = Number(params.ax ?? 4);
      const ay = Number(params.ay ?? 3);
      const bx = Number(params.bx ?? 2);
      const by = Number(params.by ?? 5);

      const rx = ax + bx;
      const ry = ay + by;
      const magA = Math.sqrt(ax * ax + ay * ay);
      const magB = Math.sqrt(bx * bx + by * by);
      const magR = Math.sqrt(rx * rx + ry * ry);
      const dotProd = ax * bx + ay * by;
      const radR = Math.atan2(ry, rx);
      const angleR = Math.round(((radR * 180) / Math.PI + 360) % 360);

      const cx = width / 2 - 45;
      const cy = height / 2 + 15;
      const sc = 20;

      const pAx = cx + ax * sc;
      const pAy = cy - ay * sc;
      const pBx = cx + bx * sc;
      const pBy = cy - by * sc;
      const pRx = cx + rx * sc;
      const pRy = cy - ry * sc;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none">
          <defs>
            <marker id="arrow-vec-a" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-vec-b" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
            </marker>
            <marker id="arrow-vec-r" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>
          </defs>

          {/* Cartesian Grid */}
          <g opacity={0.35}>
            {Array.from({ length: 25 }, (_, i) => {
              const gx = cx - 12 * sc + i * sc;
              return <line key={`vgx-${i}`} x1={gx} y1={20} x2={gx} y2={height - 20} stroke="var(--color-canvas-grid)" strokeWidth={1} />;
            })}
            {Array.from({ length: 15 }, (_, i) => {
              const gy = cy - 7 * sc + i * sc;
              return <line key={`vgy-${i}`} x1={40} y1={gy} x2={width - 40} y2={gy} stroke="var(--color-canvas-grid)" strokeWidth={1} />;
            })}
          </g>

          {/* Primary Axes */}
          <line x1={40} y1={cy} x2={width - 40} y2={cy} stroke="#64748b" strokeWidth={1.5} />
          <line x1={cx} y1={20} x2={cx} y2={height - 20} stroke="#64748b" strokeWidth={1.5} />
          <text x={width - 35} y={cy + 4} fill="#64748b" fontSize={10} fontFamily="Space Mono">X</text>
          <text x={cx} y={15} textAnchor="middle" fill="#64748b" fontSize={10} fontFamily="Space Mono">Y</text>

          {/* Parallelogram Construction */}
          <line x1={pAx} y1={pAy} x2={pRx} y2={pRy} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7} />
          <line x1={pBx} y1={pBy} x2={pRx} y2={pRy} stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7} />

          {/* Vector A */}
          <line x1={cx} y1={cy} x2={pAx} y2={pAy} stroke="#38bdf8" strokeWidth={3} markerEnd="url(#arrow-vec-a)" />
          <g transform={`translate(${pAx + 8}, ${pAy - 6})`}>
            <rect x={-3} y={-8} width={65} height={16} rx={3} fill="var(--color-surface)" stroke="#38bdf8" strokeWidth={1} />
            <text x={3} y={4} fill="#38bdf8" fontSize={9} fontFamily="Space Mono" fontWeight="bold">
              A({ax},{ay})
            </text>
          </g>

          {/* Vector B */}
          <line x1={cx} y1={cy} x2={pBx} y2={pBy} stroke="#f59e0b" strokeWidth={3} markerEnd="url(#arrow-vec-b)" />
          <g transform={`translate(${pBx + 8}, ${pBy - 6})`}>
            <rect x={-3} y={-8} width={65} height={16} rx={3} fill="var(--color-surface)" stroke="#f59e0b" strokeWidth={1} />
            <text x={3} y={4} fill="#f59e0b" fontSize={9} fontFamily="Space Mono" fontWeight="bold">
              B({bx},{by})
            </text>
          </g>

          {/* Resultant Vector R = A + B */}
          <line x1={cx} y1={cy} x2={pRx} y2={pRy} stroke="#10b981" strokeWidth={4} markerEnd="url(#arrow-vec-r)" />
          <circle cx={pRx} cy={pRy} r={5} fill="#10b981" stroke="var(--color-surface)" strokeWidth={1.5} />
          <g transform={`translate(${pRx + 10}, ${pRy + 4})`}>
            <rect x={-3} y={-8} width={80} height={16} rx={3} fill="var(--color-surface)" stroke="#10b981" strokeWidth={1} />
            <text x={3} y={4} fill="#10b981" fontSize={9} fontFamily="Space Mono" fontWeight="bold">
              R({rx},{ry})
            </text>
          </g>

          {/* Telemetry HUD Top Right */}
          <g transform={`translate(${width - 200}, 18)`}>
            <rect width={180} height={78} rx={6} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1} />
            <text x={10} y={16} fill="var(--color-primary-text)" fontSize={9} fontFamily="Space Mono" fontWeight="bold">
              ALJABAR VEKTOR 2D
            </text>
            <text x={10} y={32} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              |R|: <tspan fill="#10b981" fontWeight="bold">{magR.toFixed(2)} unit</tspan>
            </text>
            <text x={10} y={48} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              A · B: <tspan fill="#38bdf8">{dotProd.toFixed(0)}</tspan>
            </text>
            <text x={10} y={64} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Arah Resultan: <tspan fill="#f59e0b">{angleR}°</tspan>
            </text>
          </g>
        </svg>
      );
    }

    // ── ARCHETYPE A0.35: MATHEMATICS QUADRATIC FUNCTION EXPLORER ──
    if (isFunctionExplorer) {
      const a = Number(params.a ?? 1);
      const b = Number(params.b ?? 0);
      const c = Number(params.c ?? 0);

      const discriminant = b * b - 4 * a * c;
      const vertexX = a !== 0 ? -b / (2 * a) : 0;
      const vertexY = a !== 0 ? a * vertexX * vertexX + b * vertexX + c : c;

      // Coordinate axes center and dynamic scaling
      const cx = width / 2;
      const cy = height / 2 + 15;
      const maxAbsY = Math.max(10, Math.abs(vertexY) * 1.35, Math.abs(c) * 1.35);
      const scaleX = 24; // 1 unit X = 24px, range -14 to 14
      const scaleY = Math.max(4.5, Math.min(20, 130 / maxAbsY)); // Dynamic Y scaling to keep vertex in view

      // Generate curve points
      const points: Array<{ x: number; y: number }> = [];
      const xStart = Number(params.xMin ?? -14);
      const xEnd = Number(params.xMax ?? 14);
      const span = Math.max(2, xEnd - xStart);
      const stepX = span / 80;

      for (let x = xStart; x <= xEnd; x += stepX) {
        const yVal = a * x * x + b * x + c;
        const px = cx + x * scaleX;
        const py = cy - yVal * scaleY;
        points.push({ x: px, y: py });
      }

      // Build smooth path with clamped off-canvas bounds
      let pathD = '';
      if (points.length > 0) {
        const clampedPoints = points.map((pt) => ({
          x: pt.x,
          y: Math.max(-80, Math.min(height + 80, pt.y)),
        }));
        pathD = clampedPoints.reduce((acc, pt, idx) => {
          return idx === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
        }, '');
      }

      const pvx = cx + vertexX * scaleX;
      const pvy = cy - vertexY * scaleY;
      const isVertexVisible = pvx >= 40 && pvx <= width - 40 && pvy >= 20 && pvy <= height - 20;

      // Real roots calculation
      let root1: number | null = null;
      let root2: number | null = null;
      if (a !== 0 && discriminant >= 0) {
        const sqrtD = Math.sqrt(discriminant);
        root1 = (-b - sqrtD) / (2 * a);
        root2 = (-b + sqrtD) / (2 * a);
      }

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none">
          <defs>
            <marker id="arrow-axis-x" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
            </marker>
            <marker id="arrow-axis-y" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
            </marker>
          </defs>

          {/* Graticule Grid */}
          <g opacity={0.3}>
            {Array.from({ length: Math.min(60, Math.ceil(xEnd) - Math.floor(xStart) + 1) }, (_, i) => {
              const u = Math.floor(xStart) + i;
              const gx = cx + u * scaleX;
              return (
                <line
                  key={`mgx-${i}`}
                  x1={gx}
                  y1={20}
                  x2={gx}
                  y2={height - 20}
                  stroke={u === 0 ? '#475569' : 'var(--color-canvas-grid)'}
                  strokeWidth={u === 0 ? 1.5 : 1}
                  strokeDasharray={u % 2 === 0 ? undefined : '2 3'}
                />
              );
            })}
            {Array.from({ length: 21 }, (_, i) => {
              const u = -10 + i;
              const gy = cy - u * (scaleY * 2);
              if (gy < 20 || gy > height - 20) return null;
              return (
                <line
                  key={`mgy-${i}`}
                  x1={30}
                  y1={gy}
                  x2={width - 30}
                  y2={gy}
                  stroke={u === 0 ? '#475569' : 'var(--color-canvas-grid)'}
                  strokeWidth={u === 0 ? 1.5 : 1}
                  strokeDasharray={u % 2 === 0 ? undefined : '2 3'}
                />
              );
            })}
          </g>

          {/* Primary Cartesian Axes */}
          <line x1={30} y1={cy} x2={width - 25} y2={cy} stroke="#64748b" strokeWidth={1.5} markerEnd="url(#arrow-axis-x)" />
          <line x1={cx} y1={height - 20} x2={cx} y2={15} stroke="#64748b" strokeWidth={1.5} markerEnd="url(#arrow-axis-y)" />
          <text x={width - 20} y={cy + 4} fill="#94a3b8" fontSize={11} fontFamily="Space Mono" fontWeight="bold">X</text>
          <text x={cx + 12} y={20} fill="#94a3b8" fontSize={11} fontFamily="Space Mono" fontWeight="bold">Y</text>
          <text x={cx - 16} y={cy + 15} fill="#64748b" fontSize={9.5} fontFamily="Space Mono" fontWeight="bold">O</text>

          {/* Axis Numerical Ticks */}
          {[-10, -5, 5, 10].map((tx) => {
            const px = cx + tx * scaleX;
            return (
              <g key={`tx-${tx}`}>
                <line x1={px} y1={cy - 3} x2={px} y2={cy + 3} stroke="#94a3b8" strokeWidth={1} />
                <text x={px} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize={9} fontFamily="Space Mono">
                  {tx}
                </text>
              </g>
            );
          })}

          {/* Parabola Curve Path */}
          <path d={pathD} fill="none" stroke="#4B8F8C" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

          {/* Axis of Symmetry */}
          {a !== 0 && (
            <line
              x1={pvx}
              y1={20}
              x2={pvx}
              y2={height - 20}
              stroke="#BA8230"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              opacity={0.7}
            />
          )}

          {/* Vertex Marker (Puncak) */}
          {isVertexVisible && (
            <g>
              <circle cx={pvx} cy={pvy} r={6} fill="#BA8230" stroke="#E6ECE8" strokeWidth={2} />
              <g transform={`translate(${pvx + 8}, ${pvy < cy ? pvy - 18 : pvy + 6})`}>
                <rect x={-3} y={-4} width={115} height={20} rx={3} fill="var(--color-surface)" stroke="#BA8230" strokeWidth={1} />
                <text x={4} y={10} fill="#BA8230" fontSize={9} fontFamily="Space Mono" fontWeight="bold">
                  Puncak ({vertexX.toFixed(1)}, {vertexY.toFixed(1)})
                </text>
              </g>
            </g>
          )}

          {/* Y-Intercept Marker (0, c) */}
          {Math.abs(cy - c * scaleY) <= height - 20 && (
            <g>
              <circle cx={cx} cy={cy - c * scaleY} r={4.5} fill="#f59e0b" stroke="#ffffff" strokeWidth={1.5} />
              <text x={cx + 8} y={cy - c * scaleY + 4} fill="#f59e0b" fontSize={8} fontFamily="Space Mono">
                (0, {c})
              </text>
            </g>
          )}

          {/* Real Roots Markers (x1, x2) on X Axis */}
          {root1 !== null && root2 !== null && (
            <g>
              {[root1, root2].map((rVal, rIdx) => {
                const rx = cx + rVal * scaleX;
                if (rx < 35 || rx > width - 35) return null;
                return (
                  <g key={`r-${rIdx}`}>
                    <circle cx={rx} cy={cy} r={5} fill="#10b981" stroke="#ffffff" strokeWidth={1.5} />
                    <text x={rx} y={cy - 8} textAnchor="middle" fill="#10b981" fontSize={8.5} fontFamily="Space Mono" fontWeight="bold">
                      x{rIdx + 1}={rVal.toFixed(1)}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Telemetry HUD Top Right */}
          <g transform={`translate(${width - 245}, 16)`}>
            <rect width={230} height={92} rx={4} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1} />
            <line x1={0} y1={0} x2={0} y2={92} stroke="var(--color-secondary)" strokeWidth={3} />
            <text x={12} y={17} fill="var(--color-primary-text)" fontSize={9.5} fontFamily="Space Mono" fontWeight="bold">
              EKSPLORASI FUNGSI KUADRAT
            </text>
            <text x={12} y={34} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              f(x) = <tspan fill="#4B8F8C" fontWeight="bold">{a}x² {b >= 0 ? `+ ${b}x` : `- ${Math.abs(b)}x`} {c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`}</tspan>
            </text>
            <text x={12} y={51} fill="var(--color-text-secondary)" fontSize={9.5} fontFamily="Space Mono">
              Diskriminan D: <tspan fill={discriminant > 0 ? '#10b981' : discriminant === 0 ? '#BA8230' : '#f43f5e'} fontWeight="bold">
                {discriminant.toFixed(1)} ({discriminant > 0 ? 'D > 0' : discriminant === 0 ? 'D = 0' : 'D < 0'})
              </tspan>
            </text>
            <text x={12} y={67} fill="var(--color-text-secondary)" fontSize={9.5} fontFamily="Space Mono">
              Puncak (xv, yv): <tspan fill="#BA8230" fontWeight="bold">({vertexX.toFixed(2)}, {vertexY.toFixed(2)})</tspan>
            </text>
            <text x={12} y={83} fill="var(--color-text-secondary)" fontSize={9.5} fontFamily="Space Mono">
              Bukaan: <tspan fill="var(--color-text)">{a > 0 ? '▲ Terbuka ke Atas' : a < 0 ? '▼ Terbuka ke Bawah' : '─ Garis Linier'}</tspan>
            </text>
          </g>
        </svg>
      );
    }

    // ── ARCHETYPE A0.4: CHEMISTRY PH SCALE & ION CONCENTRATION ──
    if (isPhScale) {
      const rawLogH = params.logHConc !== undefined
        ? Number(params.logHConc)
        : (params.ph !== undefined ? -Number(params.ph) : (params.pH !== undefined ? -Number(params.pH) : -7.0));
      const logHConc = Number(rawLogH);
      const vol = Number(params.solutionVolume ?? params.volume ?? 1.0);
      const pH = Math.max(0, Math.min(14, -logHConc));
      const pOH = 14.0 - pH;

      let liquidColor = '#10b981';
      let liquidGrad = '#059669';
      let statusText = 'NETRAL';
      if (pH < 3) {
        liquidColor = '#ef4444'; liquidGrad = '#dc2626'; statusText = 'ASAM KUAT';
      } else if (pH < 6.5) {
        liquidColor = '#f59e0b'; liquidGrad = '#d97706'; statusText = 'ASAM LEMAH';
      } else if (pH <= 7.5) {
        liquidColor = '#10b981'; liquidGrad = '#059669'; statusText = 'NETRAL';
      } else if (pH <= 11) {
        liquidColor = '#38bdf8'; liquidGrad = '#0284c7'; statusText = 'BASA LEMAH';
      } else {
        liquidColor = '#2563eb'; liquidGrad = '#1d4ed8'; statusText = 'BASA KUAT';
      }

      const beakerW = 280;
      const beakerH = 210;
      const beakerX = 140;
      const beakerY = 85;
      const fluidH = Math.min(beakerH - 25, 60 + vol * 28);
      const fluidY = beakerY + beakerH - fluidH;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none">
          <defs>
            <linearGradient id="ph-fluid-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={liquidColor} stopOpacity="0.75" />
              <stop offset="100%" stopColor={liquidGrad} stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Graticule Grid */}
          <g opacity={0.35}>
            {Array.from({ length: 15 }, (_, i) => (
              <line key={`gx-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={height} stroke="var(--color-canvas-grid)" strokeWidth={1} />
            ))}
          </g>

          {/* Laboratory Bench */}
          <rect x={0} y={groundY + 25} width={width} height={height - (groundY + 25)} fill="var(--color-canvas-ground)" />
          <line x1={0} y1={groundY + 25} x2={width} y2={groundY + 25} stroke="var(--color-secondary)" strokeWidth={2} />

          {/* Beaker Glass Container */}
          <rect x={beakerX} y={beakerY} width={beakerW} height={beakerH} rx={6} fill="none" stroke="#64748b" strokeWidth={3} />
          {/* Solution Fluid */}
          <rect x={beakerX + 4} y={fluidY} width={beakerW - 8} height={fluidH - 4} rx={4} fill="url(#ph-fluid-grad)" />
          <line x1={beakerX + 4} y1={fluidY} x2={beakerX + beakerW - 4} y2={fluidY} stroke={liquidColor} strokeWidth={2.5} />

          {/* Beaker Volume Ticks */}
          {Array.from({ length: 5 }, (_, i) => {
            const ty = beakerY + beakerH - (i + 1) * 36;
            return (
              <g key={`bk-${i}`}>
                <line x1={beakerX + 4} y1={ty} x2={beakerX + 16} y2={ty} stroke="#cbd5e1" strokeWidth={1.5} />
                <text x={beakerX + 22} y={ty + 3} fill="#cbd5e1" fontSize={8} fontFamily="Space Mono">
                  {(i + 1) * 0.5}L
                </text>
              </g>
            );
          })}

          {/* Submerged Digital pH Probe */}
          <g transform={`translate(${beakerX + beakerW / 2 - 15}, 40)`}>
            {/* Cable */}
            <path d="M 15 0 Q 30 -20 60 -10" fill="none" stroke="var(--color-border)" strokeWidth={3} />
            {/* Probe Body */}
            <rect width={30} height={140} rx={4} fill="var(--color-surface-subtle)" stroke="var(--color-border)" strokeWidth={2} />
            {/* Glass Sensor Tip */}
            <circle cx={15} cy={140} r={9} fill="#38bdf8" opacity={0.8} />
            {/* LED Display on Probe */}
            <rect x={4} y={20} width={22} height={28} rx={2} fill="var(--color-surface)" stroke="var(--color-border-subtle)" strokeWidth={1} />
            <text x={15} y={38} textAnchor="middle" fill={liquidColor} fontSize={10} fontFamily="Space Mono" fontWeight="bold">
              {pH.toFixed(1)}
            </text>
          </g>

          {/* Universal Indicator Color Scale on Right */}
          <g transform={`translate(${width - 230}, 45)`}>
            <rect width={210} height={230} rx={6} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1} />
            <text x={10} y={18} fill="var(--color-primary-text)" fontSize={9.5} fontFamily="Space Mono" fontWeight="bold">
              SKALA INDIKATOR pH (0–14)
            </text>
            {Array.from({ length: 15 }, (_, i) => {
              const swatchY = 32 + i * 12;
              let col = '#10b981';
              if (i < 3) col = '#ef4444';
              else if (i < 6) col = '#f59e0b';
              else if (i <= 7) col = '#10b981';
              else if (i <= 11) col = '#38bdf8';
              else col = '#2563eb';
              const isCur = Math.round(pH) === i;

              return (
                <g key={`sw-${i}`}>
                  <rect x={10} y={swatchY} width={18} height={9} rx={1.5} fill={col} />
                  <text x={35} y={swatchY + 8} fill={isCur ? 'var(--color-text)' : 'var(--color-text-secondary)'} fontSize={8.5} fontFamily="Space Mono" fontWeight={isCur ? 'bold' : 'normal'}>
                    pH {i} {i === 0 ? '(Asam)' : i === 7 ? '(Netral)' : i === 14 ? '(Basa)' : ''}
                  </text>
                  {isCur && (
                    <polygon points={`175,${swatchY + 4.5} 185,${swatchY} 185,${swatchY + 9}`} fill={liquidColor} />
                  )}
                </g>
              );
            })}
          </g>

        </svg>
      );
    }

    // ── ARCHETYPE A0.5: PROBABILITY & LAW OF LARGE NUMBERS ──
    if (isProbabilityCoin) {
      const trials = Math.min(1000, Math.max(10, Number(params.trials ?? 100)));
      const pTheor = Math.max(0.1, Math.min(0.9, Number(params.theoreticalProb ?? 0.5)));
      const seed = Number(params.seed ?? 42);

      let s = seed * 1000 + trials;
      const nextRand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
      let heads = 0;
      const chartPoints: { n: number; freq: number }[] = [];
      const stride = Math.max(1, Math.floor(trials / 32));

      for (let i = 1; i <= trials; i++) {
        if (nextRand() < pTheor) heads++;
        if (i % stride === 0 || i === trials) {
          chartPoints.push({ n: i, freq: heads / i });
        }
      }
      const tails = trials - heads;
      const relFreq = heads / trials;
      const deviation = Math.abs(relFreq - pTheor);

      const chartX = 250;
      const chartY = 70;
      const chartW = width - chartX - 40;
      const chartH = 190;

      const toPlotX = (nVal: number) => chartX + (nVal / trials) * chartW;
      const toPlotY = (fVal: number) => chartY + chartH - fVal * chartH;

      const pathD = chartPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toPlotX(pt.n).toFixed(1)} ${toPlotY(pt.freq).toFixed(1)}`).join(' ');

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none">
          {/* Graticule Grid */}
          <g opacity={0.35}>
            {Array.from({ length: 15 }, (_, i) => (
              <line key={`gx-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={height} stroke="var(--color-canvas-grid)" strokeWidth={1} />
            ))}
          </g>

          {/* Coin Podium (Left) */}
          <g transform="translate(60, 90)">
            {/* Podium Base */}
            <rect x={0} y={110} width={150} height={30} rx={4} fill="var(--color-surface-subtle)" stroke="var(--color-border)" strokeWidth={2} />
            {/* Gold Coin */}
            <circle cx={75} cy={55} r={42} fill="#f59e0b" stroke="#fbbf24" strokeWidth={4} />
            <circle cx={75} cy={55} r={34} fill="#d97706" />
            <text x={75} y={64} textAnchor="middle" fill="#ffffff" fontSize={26} fontFamily="Space Mono" fontWeight="bold">
              {relFreq >= 0.5 ? 'G' : 'A'}
            </text>
            <text x={75} y={130} textAnchor="middle" fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              {trials} Percobaan
            </text>
          </g>

          {/* Convergence Chart Box (Right) */}
          <rect x={chartX} y={chartY} width={chartW} height={chartH} rx={6} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1.5} />
          {/* Theoretical Guide Line */}
          <line x1={chartX} y1={toPlotY(pTheor)} x2={chartX + chartW} y2={toPlotY(pTheor)} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 3" />
          <text x={chartX + chartW - 6} y={toPlotY(pTheor) - 6} textAnchor="end" fill="#f59e0b" fontSize={9.5} fontFamily="Space Mono">
            p = {(pTheor * 100).toFixed(0)}%
          </text>

          {/* Empirical Frequency Path */}
          <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth={2.5} />

          {/* Axis Labels */}
          <text x={chartX + 8} y={chartY + 16} fill="var(--color-primary-text)" fontSize={9.5} fontFamily="Space Mono" fontWeight="bold">
            KONVERGENSI FREKUENSI EMPIRIS
          </text>

        </svg>
      );
    }

    // ── ARCHETYPE A0.6: STATISTICAL LINEAR REGRESSION (OLS) ──
    if (isLinearRegression) {
      const slope = Number(params.trueSlope ?? 1.5);
      const intercept = Number(params.trueIntercept ?? 2.0);
      const noise = Number(params.noise ?? 1.5);
      const n = Math.min(30, Math.max(8, Math.floor(Number(params.sampleSize ?? 15))));

      const pts: { x: number; y: number }[] = [];
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      for (let i = 0; i < n; i++) {
        const x = i + 1;
        const err = Math.sin(i * 12.9898 + 78.233) * noise;
        const y = slope * x + intercept + err;
        pts.push({ x, y });
        sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x;
      }
      const meanX = sumX / n;
      const meanY = sumY / n;
      const denom = (n * sumX2 - sumX * sumX);
      const mFit = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : slope;
      const cFit = meanY - mFit * meanX;

      const plotX = 75;
      const plotY = 65;
      const plotW = width - 290;
      const plotH = 210;

      const maxX = n + 1;
      const maxY = Math.max(10, Math.max(...pts.map((p) => p.y)) * 1.15);

      const toPlotX = (vx: number) => plotX + (vx / maxX) * plotW;
      const toPlotY = (vy: number) => plotY + plotH - (vy / maxY) * plotH;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none">
          {/* Graticule Grid */}
          <g opacity={0.35}>
            {Array.from({ length: 15 }, (_, i) => (
              <line key={`gx-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={height} stroke="var(--color-canvas-grid)" strokeWidth={1} />
            ))}
          </g>

          {/* Coordinate Axes */}
          <line x1={plotX} y1={plotY + plotH} x2={plotX + plotW} y2={plotY + plotH} stroke="var(--color-border)" strokeWidth={1.5} />
          <line x1={plotX} y1={plotY} x2={plotX} y2={plotY + plotH} stroke="var(--color-border)" strokeWidth={1.5} />

          {/* Residual Error Lines */}
          {pts.map((p, idx) => {
            const yPred = mFit * p.x + cFit;
            return (
              <line
                key={`res-${idx}`}
                x1={toPlotX(p.x)}
                y1={toPlotY(p.y)}
                x2={toPlotX(p.x)}
                y2={toPlotY(yPred)}
                stroke="#f43f5e"
                strokeWidth={1}
                strokeDasharray="2 2"
                opacity={0.7}
              />
            );
          })}

          {/* OLS Regression Fit Line */}
          <line
            x1={toPlotX(1)}
            y1={toPlotY(mFit * 1 + cFit)}
            x2={toPlotX(n)}
            y2={toPlotY(mFit * n + cFit)}
            stroke="#38bdf8"
            strokeWidth={3}
          />

          {/* Scatter Data Points */}
          {pts.map((p, idx) => (
            <circle
              key={`pt-${idx}`}
              cx={toPlotX(p.x)}
              cy={toPlotY(p.y)}
              r={4.5}
              fill="#f59e0b"
              stroke="#ffffff"
              strokeWidth={1.5}
            />
          ))}

          {/* Telemetry HUD (Right) */}
          <g transform={`translate(${width - 200}, 18)`}>
            <rect width={180} height={82} rx={6} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1} />
            <text x={10} y={16} fill="var(--color-primary-text)" fontSize={9} fontFamily="Space Mono" fontWeight="bold">
              ESTIMASI OLS REGRESI
            </text>
            <text x={10} y={32} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Kemiringan (m): <tspan fill="#38bdf8">{mFit.toFixed(2)}</tspan>
            </text>
            <text x={10} y={48} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Titik Potong (c): <tspan fill="#f59e0b">{cFit.toFixed(2)}</tspan>
            </text>
            <text x={10} y={64} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Titik Sampel (n): <tspan fill="#10b981">{n}</tspan>
            </text>
          </g>
        </svg>
      );
    }

    // ── ARCHETYPE A0.7: GAUSSIAN NORMAL DISTRIBUTION ──
    if (isNormalDistribution) {
      const mu = Number(params.mean ?? 0.0);
      const sigma = Math.max(0.2, Number(params.stdDev ?? 1.0));
      const testX = Number(params.testPoint ?? 1.0);
      const zScore = (testX - mu) / sigma;

      const plotX = 75;
      const plotY = 65;
      const plotW = width - 280;
      const plotH = 210;

      const xMin = mu - 3.8 * sigma;
      const xMax = mu + 3.8 * sigma;
      const maxPdf = 1 / (sigma * Math.sqrt(2 * Math.PI));

      const toPlotX = (vx: number) => plotX + ((vx - xMin) / (xMax - xMin)) * plotW;
      const toPlotY = (vy: number) => plotY + plotH - (vy / (maxPdf * 1.15)) * plotH;

      const curvePts: { x: number; y: number }[] = [];
      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        const vx = xMin + (i / steps) * (xMax - xMin);
        const z = (vx - mu) / sigma;
        const pdf = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
        curvePts.push({ x: toPlotX(vx), y: toPlotY(pdf) });
      }
      const curveD = curvePts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none">
          {/* Graticule Grid */}
          <g opacity={0.35}>
            {Array.from({ length: 15 }, (_, i) => (
              <line key={`gx-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={height} stroke="var(--color-canvas-grid)" strokeWidth={1} />
            ))}
          </g>

          {/* Base Axis */}
          <line x1={plotX} y1={plotY + plotH} x2={plotX + plotW} y2={plotY + plotH} stroke="var(--color-border)" strokeWidth={1.5} />

          {/* Shaded Empirical Zones (+-1 sigma) */}
          <rect
            x={toPlotX(mu - sigma)}
            y={plotY + 20}
            width={toPlotX(mu + sigma) - toPlotX(mu - sigma)}
            height={plotH - 20}
            fill="#38bdf8"
            opacity={0.15}
          />

          {/* Mean Center Line */}
          <line x1={toPlotX(mu)} y1={plotY} x2={toPlotX(mu)} y2={plotY + plotH} stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="3 3" />
          <text x={toPlotX(mu)} y={plotY + plotH + 16} textAnchor="middle" fill="#38bdf8" fontSize={10} fontFamily="Space Mono">
            μ={mu}
          </text>

          {/* Gaussian Bell Curve */}
          <path d={curveD} fill="none" stroke="#38bdf8" strokeWidth={3} />

          {/* Test Point Marker */}
          <line x1={toPlotX(testX)} y1={plotY + 10} x2={toPlotX(testX)} y2={plotY + plotH} stroke="#f43f5e" strokeWidth={2} />
          <circle cx={toPlotX(testX)} cy={plotY + plotH} r={5} fill="#f43f5e" />
          <text x={toPlotX(testX)} y={plotY + plotH + 28} textAnchor="middle" fill="#f43f5e" fontSize={10} fontFamily="Space Mono" fontWeight="bold">
            x={testX}
          </text>

          {/* Telemetry HUD */}
          <g transform={`translate(${width - 200}, 18)`}>
            <rect width={180} height={78} rx={6} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1} />
            <text x={10} y={16} fill="var(--color-primary-text)" fontSize={9} fontFamily="Space Mono" fontWeight="bold">
              DISTRIBUSI NORMAL GAUSS
            </text>
            <text x={10} y={32} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Z-Score: <tspan fill="#f43f5e" fontWeight="bold">{zScore.toFixed(2)}</tspan>
            </text>
            <text x={10} y={48} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Simpangan (σ): <tspan fill="#38bdf8">{sigma.toFixed(1)}</tspan>
            </text>
            <text x={10} y={64} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Zona ±1σ: <tspan fill="#10b981">68.2%</tspan>
            </text>
          </g>
        </svg>
      );
    }

    // ── ARCHETYPE A0.8: COMPOUND INTEREST EXPONENTIAL GROWTH ──
    if (isCompoundInterest) {
      const p = Math.max(1, Number(params.principal ?? 10));
      const r = Math.max(0.5, Number(params.ratePercent ?? 8)) / 100;
      const t = Math.max(1, Number(params.years ?? 10));
      const n = Math.max(1, Number(params.compoundsPerYear ?? 12));
      const finalAmount = p * Math.pow(1 + r / n, n * t);
      const interest = finalAmount - p;
      const multiplier = finalAmount / p;
      const rule72 = (r * 100) > 0 ? 72 / (r * 100) : 0;

      const plotX = 75;
      const plotY = 65;
      const plotW = width - 290;
      const plotH = 210;

      const curvePts: { x: number; y: number }[] = [];
      for (let yr = 0; yr <= t; yr++) {
        const val = p * Math.pow(1 + r / n, n * yr);
        const cx = plotX + (yr / t) * plotW;
        const cy = plotY + plotH - (val / finalAmount) * plotH;
        curvePts.push({ x: cx, y: cy });
      }
      const curveD = curvePts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none">
          {/* Graticule Grid */}
          <g opacity={0.35}>
            {Array.from({ length: 15 }, (_, i) => (
              <line key={`gx-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={height} stroke="var(--color-canvas-grid)" strokeWidth={1} />
            ))}
          </g>

          {/* Axes */}
          <line x1={plotX} y1={plotY + plotH} x2={plotX + plotW} y2={plotY + plotH} stroke="var(--color-border)" strokeWidth={1.5} />
          <line x1={plotX} y1={plotY} x2={plotX} y2={plotY + plotH} stroke="var(--color-border)" strokeWidth={1.5} />

          {/* Principal Baseline */}
          <line x1={plotX} y1={plotY + plotH - (p / finalAmount) * plotH} x2={plotX + plotW} y2={plotY + plotH - (p / finalAmount) * plotH} stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" />

          {/* Exponential Growth Curve */}
          <path d={curveD} fill="none" stroke="#10b981" strokeWidth={3} />
          <circle cx={plotX + plotW} cy={plotY} r={6} fill="#10b981" stroke="#ffffff" strokeWidth={2} />

          {/* Telemetry HUD */}
          <g transform={`translate(${width - 200}, 18)`}>
            <rect width={180} height={82} rx={6} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1} />
            <text x={10} y={16} fill="var(--color-primary-text)" fontSize={9} fontFamily="Space Mono" fontWeight="bold">
              BUNGA MAJEMUK
            </text>
            <text x={10} y={32} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Modal Awal: <tspan fill="var(--color-text-secondary)">Rp {p}jt</tspan>
            </text>
            <text x={10} y={48} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Total Akhir: <tspan fill="#10b981" fontWeight="bold">Rp {finalAmount.toFixed(1)}jt</tspan>
            </text>
            <text x={10} y={64} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Pertumbuhan: <tspan fill="#38bdf8">{multiplier.toFixed(2)}x lipat</tspan>
            </text>
            <text x={10} y={78} fill="var(--color-text-secondary)" fontSize={8.5} fontFamily="Space Mono">
              Kaidah 72: ganda dlm ~{rule72.toFixed(1)} th
            </text>
          </g>
        </svg>
      );
    }

    // ── ARCHETYPE A0.9: SUPPLY & DEMAND MARKET EQUILIBRIUM ──
    if (isSupplyDemand) {
      const dInt = Number(params.demandIntercept ?? 100);
      const dSlope = Number(params.demandSlope ?? -2);
      const sInt = Number(params.supplyIntercept ?? 10);
      const sSlope = Number(params.supplySlope ?? 1.5);
      const slopeDiff = dSlope - sSlope;
      const eqQ = slopeDiff !== 0 ? Math.max(0, (sInt - dInt) / slopeDiff) : 0;
      const eqP = dInt + dSlope * eqQ;

      const plotX = 75;
      const plotY = 65;
      const plotW = width - 280;
      const plotH = 210;

      const maxQ = Math.max(eqQ * 1.6, 50);
      const maxP = Math.max(dInt * 1.15, eqP * 1.5);

      const toPlotX = (q: number) => plotX + (q / maxQ) * plotW;
      const toPlotY = (pVal: number) => plotY + plotH - (pVal / maxP) * plotH;

      const ptEqX = toPlotX(eqQ);
      const ptEqY = toPlotY(eqP);

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none">
          {/* Graticule Grid */}
          <g opacity={0.35}>
            {Array.from({ length: 15 }, (_, i) => (
              <line key={`gx-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={height} stroke="var(--color-canvas-grid)" strokeWidth={1} />
            ))}
          </g>

          {/* Axes */}
          <line x1={plotX} y1={plotY + plotH} x2={plotX + plotW} y2={plotY + plotH} stroke="var(--color-border)" strokeWidth={1.5} />
          <line x1={plotX} y1={plotY} x2={plotX} y2={plotY + plotH} stroke="var(--color-border)" strokeWidth={1.5} />
          <text x={plotX + plotW} y={plotY + plotH + 16} fill="#64748b" fontSize={10} fontFamily="Space Mono">Q (Kuantitas)</text>
          <text x={plotX - 10} y={plotY - 6} fill="#64748b" fontSize={10} fontFamily="Space Mono">P (Harga)</text>

          {/* Demand Curve (Blue Downward) */}
          <line x1={toPlotX(0)} y1={toPlotY(dInt)} x2={toPlotX(maxQ)} y2={toPlotY(dInt + dSlope * maxQ)} stroke="#38bdf8" strokeWidth={3} />
          <text x={toPlotX(maxQ) - 10} y={toPlotY(dInt + dSlope * maxQ) - 8} fill="#38bdf8" fontSize={10} fontFamily="Space Mono" fontWeight="bold">Demand (D)</text>

          {/* Supply Curve (Emerald Upward) */}
          <line x1={toPlotX(0)} y1={toPlotY(sInt)} x2={toPlotX(maxQ)} y2={toPlotY(sInt + sSlope * maxQ)} stroke="#10b981" strokeWidth={3} />
          <text x={toPlotX(maxQ) - 10} y={toPlotY(sInt + sSlope * maxQ) - 8} fill="#10b981" fontSize={10} fontFamily="Space Mono" fontWeight="bold">Supply (S)</text>

          {/* Equilibrium Projections */}
          <line x1={plotX} y1={ptEqY} x2={ptEqX} y2={ptEqY} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" />
          <line x1={ptEqX} y1={plotY + plotH} x2={ptEqX} y2={ptEqY} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" />
          <circle cx={ptEqX} cy={ptEqY} r={6} fill="#f59e0b" stroke="#ffffff" strokeWidth={2} />

          {/* Telemetry HUD */}
          <g transform={`translate(${width - 200}, 18)`}>
            <rect width={180} height={78} rx={6} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1} />
            <text x={10} y={16} fill="var(--color-primary-text)" fontSize={9} fontFamily="Space Mono" fontWeight="bold">
              EKUILIBRIUM PASAR
            </text>
            <text x={10} y={32} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Harga (P*): <tspan fill="#f59e0b" fontWeight="bold">${eqP.toFixed(2)}</tspan>
            </text>
            <text x={10} y={48} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Kuantitas (Q*): <tspan fill="#38bdf8">{eqQ.toFixed(1)} unit</tspan>
            </text>
          </g>
        </svg>
      );
    }

    // ── ARCHETYPE A0.10: 6-NODE UNIVERSITY GRAPH TRAVERSAL ──
    if (isGraphTraversal) {
      const isDFS = Number(params.algorithm ?? 0) === 1;
      const startIdx = Math.min(5, Math.max(0, Math.floor(Number(params.startNode ?? 0))));

      const graphNodes = [
        { id: 0, label: 'A', x: 120, y: 110 },
        { id: 1, label: 'B', x: 260, y: 110 },
        { id: 2, label: 'C', x: 120, y: 230 },
        { id: 3, label: 'D', x: 400, y: 110 },
        { id: 4, label: 'E', x: 260, y: 230 },
        { id: 5, label: 'F', x: 400, y: 230 },
      ];

      const edges: Array<[number, number]> = [
        [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [3, 5], [4, 5],
      ];

      // Build step-by-step traversal states
      const traversalSteps: Array<{
        visited: number[];
        current: number;
        frontier: number[];
        traversedEdges: Array<string>;
      }> = [];

      {
        const vList: number[] = [];
        const vSet = new Set<number>();
        const tEdges: Array<string> = [];

        if (!isDFS) {
          // BFS traversal
          const queue = [startIdx];
          vSet.add(startIdx);
          vList.push(startIdx);
          traversalSteps.push({ visited: [...vList], current: startIdx, frontier: [...queue], traversedEdges: [] });

          while (queue.length > 0) {
            const u = queue.shift()!;
            for (const v of CANONICAL_GRAPH.adj[u]) {
              if (!vSet.has(v)) {
                vSet.add(v);
                vList.push(v);
                queue.push(v);
                tEdges.push(`${Math.min(u, v)}-${Math.max(u, v)}`);
                traversalSteps.push({
                  visited: [...vList],
                  current: v,
                  frontier: [...queue],
                  traversedEdges: [...tEdges],
                });
              }
            }
          }
        } else {
          // DFS traversal
          const stack = [startIdx];
          const visitedInDfs: number[] = [];
          traversalSteps.push({ visited: [], current: startIdx, frontier: [...stack], traversedEdges: [] });

          while (stack.length > 0) {
            const u = stack.pop()!;
            if (!vSet.has(u)) {
              vSet.add(u);
              visitedInDfs.push(u);
              const neighbors = [...CANONICAL_GRAPH.adj[u]].reverse();
              for (const v of neighbors) {
                if (!vSet.has(v)) {
                  stack.push(v);
                  tEdges.push(`${Math.min(u, v)}-${Math.max(u, v)}`);
                }
              }
              traversalSteps.push({
                visited: [...visitedInDfs],
                current: u,
                frontier: [...stack],
                traversedEdges: [...tEdges],
              });
            }
          }
        }
      }

      const totalTSteps = traversalSteps.length;
      const stepIdx = totalTSteps > 0
        ? (runtimeState.time > 0 ? Math.min(totalTSteps - 1, Math.floor(runtimeState.time * 1.2)) : 0)
        : 0;
      const curTStep = traversalSteps[stepIdx] || traversalSteps[0] || { visited: [startIdx], current: startIdx, frontier: [], traversedEdges: [] };
      const visitedSet = new Set(curTStep.visited);
      const frontierSet = new Set(curTStep.frontier);
      const traversedEdgeSet = new Set(curTStep.traversedEdges);

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none">
          {/* Graticule Grid */}
          <g opacity={0.35}>
            {Array.from({ length: 15 }, (_, i) => (
              <line key={`gx-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={height} stroke="var(--color-canvas-grid)" strokeWidth={1} />
            ))}
          </g>

          {/* Edges */}
          {edges.map(([u, v], idx) => {
            const n1 = graphNodes[u];
            const n2 = graphNodes[v];
            const isTraversed = traversedEdgeSet.has(`${Math.min(u, v)}-${Math.max(u, v)}`);
            return (
              <line
                key={`ed-${idx}`}
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
                stroke={isTraversed ? "#38bdf8" : "#475569"}
                strokeWidth={isTraversed ? 3.5 : 2}
              />
            );
          })}

          {/* Nodes */}
          {graphNodes.map((node) => {
            const isStart = node.id === startIdx;
            const isCurrent = node.id === curTStep.current;
            const isVisited = visitedSet.has(node.id);
            const isFrontier = frontierSet.has(node.id);
            const visitOrder = curTStep.visited.indexOf(node.id) + 1;

            return (
              <g key={`gn-${node.id}`} transform={`translate(${node.x}, ${node.y})`}>
                <circle
                  r={22}
                  fill={isCurrent ? '#0284c7' : isVisited ? '#065f46' : isFrontier ? '#854d0e' : 'var(--color-surface-subtle)'}
                  stroke={isCurrent ? '#38bdf8' : isVisited ? '#10b981' : isFrontier ? '#f59e0b' : '#64748b'}
                  strokeWidth={isCurrent ? 3.5 : isVisited ? 2.5 : 2}
                />
                <text y={5} textAnchor="middle" fill="#ffffff" fontSize={13} fontFamily="Space Mono" fontWeight="bold">
                  {node.label}
                </text>
                {isVisited && visitOrder > 0 && (
                  <circle cx={16} cy={-16} r={9} fill="#10b981" />
                )}
                {isVisited && visitOrder > 0 && (
                  <text x={16} y={-13} textAnchor="middle" fill="#ffffff" fontSize={9} fontFamily="Space Mono" fontWeight="bold">
                    {visitOrder}
                  </text>
                )}
              </g>
            );
          })}

          {/* Telemetry Status */}
          <g transform={`translate(${width - 230}, 18)`}>
            <rect width={210} height={92} rx={6} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1} />
            <text x={10} y={16} fill="var(--color-primary-text)" fontSize={9} fontFamily="Space Mono" fontWeight="bold">
              PELACAKAN GRAF ({isDFS ? 'DFS · STACK' : 'BFS · QUEUE'})
            </text>
            <text x={10} y={32} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Awal: <tspan fill="#10b981">Simpul {graphNodes[startIdx]?.label}</tspan> · Langkah: <tspan fill="#38bdf8">{stepIdx + 1}/{totalTSteps}</tspan>
            </text>
            <text x={10} y={48} fill="var(--color-text)" fontSize={9.5} fontFamily="Space Mono">
              {isDFS ? 'Stack (Tumpukan)' : 'Queue (Antrean)'}: <tspan fill="#f59e0b">[{curTStep.frontier.map((i) => graphNodes[i]?.label).join(', ')}]</tspan>
            </text>
            <text x={10} y={66} fill="var(--color-text)" fontSize={9.5} fontFamily="Space Mono">
              Urutan: <tspan fill="#10b981">{curTStep.visited.map((i) => graphNodes[i]?.label).join(' → ') || '-'}</tspan>
            </text>
            <text x={10} y={82} fill="var(--color-text-secondary)" fontSize={8.5} fontFamily="Space Mono">
              {stepIdx >= totalTSteps - 1 ? '✔ Semua simpul terjelajahi' : runtimeState.isRunning ? '▶ Menjelajah cabang...' : '⏸ Jeda'}
            </text>
          </g>
        </svg>
      );
    }

    // ── ARCHETYPE A0.11: BINARY SEARCH VISUALIZER ──
    if (isBinarySearch) {
      const target = Number(params.target ?? 23);
      const arraySize = Math.min(24, Math.max(8, Number(params.arraySize ?? 16)));
      const { array, steps, foundIndex } = generateBinarySearchData(arraySize, target);

      const totalSteps = steps.length;
      const stepIdx = totalSteps > 0
        ? (runtimeState.time > 0 ? Math.min(totalSteps - 1, Math.floor(runtimeState.time * 1.2)) : 0)
        : 0;
      const curStep = steps[stepIdx] || steps[0] || { low: 0, high: array.length - 1, mid: 0, midVal: array[0], action: 'higher' as const };
      const low = curStep.low;
      const high = curStep.high;
      const mid = curStep.mid;
      const isMatch = curStep.action === 'match';

      return (
        <div className="w-full flex flex-col items-center justify-center p-4 space-y-4">
          <div className="flex items-center justify-center gap-1.5 w-full max-w-[650px] p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] overflow-x-auto">
            {array.map((val, idx) => {
              const isMid = idx === mid;
              const isTarget = val === target;
              const isEliminated = idx < low || idx > high;

              return (
                <div key={idx} className={`flex flex-col items-center gap-1 min-w-[32px] transition-opacity ${isEliminated ? 'opacity-30' : 'opacity-100'}`}>
                  <span className="text-[9px] font-mono font-bold text-[var(--color-text-secondary)]">
                    {idx === low && idx === high ? 'L=H' : idx === low ? 'L' : idx === high ? 'H' : idx === mid ? 'M' : ''}
                  </span>
                  <div
                    className={`w-8 h-10 rounded-sm flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      isTarget && isMatch
                        ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400'
                        : isMid
                        ? 'bg-[var(--color-accent)] text-white ring-2 ring-[var(--color-accent)]/50'
                        : isEliminated
                        ? 'bg-[var(--color-surface-subtle)] border border-dashed border-[var(--color-border)] text-[var(--color-text-tertiary)] line-through'
                        : 'bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text)]'
                    }`}
                  >
                    {val}
                  </div>
                  <span className="text-[9px] font-mono text-[var(--color-text-tertiary)]">
                    [{idx}]
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
            <span className="text-[var(--color-primary-text)] font-semibold">Target: {target}</span>
            <span>/</span>
            <span>Langkah: {stepIdx + 1}/{totalSteps}</span>
            <span>/</span>
            <span>Mid [{mid}]: {array[mid]}</span>
            <span>/</span>
            <span className={isMatch ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              {curStep.action === 'match'
                ? `✔ DITEMUKAN pada indeks [${mid}]!`
                : curStep.action === 'higher'
                ? `Target (${target}) > ${curStep.midVal} → Cari di kanan (Low=${mid + 1})`
                : `Target (${target}) < ${curStep.midVal} → Cari di kiri (High=${mid - 1})`}
            </span>
          </div>
        </div>
      );
    }

    // ── ARCHETYPE A: FLUID BEAKER & ARCHIMEDES BUOYANCY ──
    if (isFluid) {
      const fluidDensity = Number(params.rhoFluida ?? params.massaJenisFluida ?? params.fluidDensity ?? params.density ?? 1000);
      const objectVolume = Number(params.volumeBenda ?? params.volume ?? params.v ?? 0.05);
      const objectDensity = Number(params.rhoBenda ?? params.massaJenisBenda ?? params.objectDensity ?? 600);
      const g = Number(params.gravitasi ?? params.g ?? 9.8);

      const weight = objectVolume * objectDensity * g;
      const maxBuoyancy = fluidDensity * objectVolume * g;
      const submergedRatio = Math.min(1, Math.max(0, objectDensity / (fluidDensity || 1)));
      const buoyantForce = Math.min(weight, maxBuoyancy);
      const isSinking = objectDensity > fluidDensity;
      const isFloating = objectDensity < fluidDensity;

      const tankW = 320;
      const tankH = 220;
      const tankX = (width - tankW) / 2;
      const tankY = 70;
      const waterSurfaceY = tankY + 50;
      const waterH = tankY + tankH - waterSurfaceY;

      const blockW = 80;
      const blockH = 80;
      const blockX = (width - blockW) / 2;
      const blockY = isSinking
        ? tankY + tankH - blockH
        : waterSurfaceY - (1 - submergedRatio) * blockH;

      const fArrowLen = Math.min(90, Math.max(25, (buoyantForce / (maxBuoyancy || 1)) * 80));
      const wArrowLen = Math.min(90, Math.max(25, (weight / (maxBuoyancy || 1)) * 80));

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none">
          <defs>
            <marker id="arrow-fa-arch" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>
            <marker id="arrow-w-arch" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
            </marker>
            <linearGradient id="fluid-grad-arch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.75" />
            </linearGradient>
          </defs>

          {/* Graticule Grid */}
          <g opacity={0.45}>
            {Array.from({ length: 15 }, (_, i) => (
              <line key={`gx-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={height} stroke="var(--color-canvas-grid)" strokeWidth={1} />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <line key={`gy-${i}`} x1={0} y1={i * 50} x2={width} y2={i * 50} stroke="var(--color-canvas-grid)" strokeWidth={1} />
            ))}
          </g>

          {/* Ground Bench */}
          <rect x={0} y={groundY + 30} width={width} height={height - (groundY + 30)} fill="var(--color-canvas-ground)" />
          <line x1={0} y1={groundY + 30} x2={width} y2={groundY + 30} stroke="var(--color-secondary)" strokeWidth={2} />

          {/* Beaker Container */}
          <rect x={tankX} y={tankY} width={tankW} height={tankH} rx={4} fill="none" stroke="var(--color-border)" strokeWidth={4} />

          {/* Fluid Body */}
          <rect x={tankX + 4} y={waterSurfaceY} width={tankW - 8} height={waterH - 4} rx={2} fill="url(#fluid-grad-arch)" />
          <line x1={tankX + 4} y1={waterSurfaceY} x2={tankX + tankW - 4} y2={waterSurfaceY} stroke="#38bdf8" strokeWidth={2.5} strokeDasharray="6 3" />

          {/* Volume Ticks */}
          {Array.from({ length: 5 }, (_, i) => {
            const ty = waterSurfaceY + i * 32;
            return (
              <g key={i}>
                <line x1={tankX + 4} y1={ty} x2={tankX + 16} y2={ty} stroke="var(--color-text-secondary)" strokeWidth={1.5} />
                <text x={tankX + 22} y={ty + 3} fill="var(--color-text-secondary)" fontSize={9} fontFamily="Space Mono">
                  {(5 - i) * 200}mL
                </text>
              </g>
            );
          })}

          {/* Specimen Cube */}
          <rect x={blockX} y={blockY} width={blockW} height={blockH} rx={3} fill="var(--color-surface-subtle)" stroke="var(--color-border)" strokeWidth={2} />
          <text x={blockX + blockW / 2} y={blockY + blockH / 2 - 4} textAnchor="middle" fill="var(--color-text)" fontSize={11} fontFamily="Space Mono" fontWeight="bold">
            SPESIMEN
          </text>
          <text x={blockX + blockW / 2} y={blockY + blockH / 2 + 12} textAnchor="middle" fill="var(--color-text-secondary)" fontSize={9} fontFamily="Space Mono">
            {objectDensity} kg/m³
          </text>

          {/* Buoyant Force Fa (Upward) */}
          <line
            x1={blockX + blockW / 2}
            y1={blockY}
            x2={blockX + blockW / 2}
            y2={blockY - fArrowLen}
            stroke="#10b981"
            strokeWidth={3}
            markerEnd="url(#arrow-fa-arch)"
          />
          <g transform={`translate(${blockX + blockW / 2 + 8}, ${blockY - fArrowLen / 2})`}>
            <rect x={-3} y={-9} width={80} height={18} rx={3} fill="var(--color-surface)" stroke="#10b981" strokeWidth={1} />
            <text x={4} y={3} fill="#10b981" fontSize={9} fontFamily="Space Mono" fontWeight="bold">
              Fa: {Math.round(buoyantForce)} N
            </text>
          </g>

          {/* Gravity Force W (Downward) */}
          <line
            x1={blockX + blockW / 2}
            y1={blockY + blockH}
            x2={blockX + blockW / 2}
            y2={blockY + blockH + wArrowLen}
            stroke="#f43f5e"
            strokeWidth={3}
            markerEnd="url(#arrow-w-arch)"
          />
          <g transform={`translate(${blockX + blockW / 2 + 8}, ${blockY + blockH + wArrowLen / 2})`}>
            <rect x={-3} y={-9} width={80} height={18} rx={3} fill="var(--color-surface)" stroke="#f43f5e" strokeWidth={1} />
            <text x={4} y={3} fill="#f43f5e" fontSize={9} fontFamily="Space Mono" fontWeight="bold">
              W: {Math.round(weight)} N
            </text>
          </g>


          {/* Telemetry HUD Top Right */}
          <g transform={`translate(${width - 200}, 18)`}>
            <rect width={176} height={60} rx={6} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1} />
            <text x={10} y={16} fill="var(--color-primary-text)" fontSize={9} fontFamily="Space Mono" fontWeight="bold">
              KONDISI KESETIMBANGAN
            </text>
            <text x={10} y={34} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Vol. Celup: <tspan fill="#38bdf8">{(submergedRatio * 100).toFixed(0)}%</tspan>
            </text>
            <text x={10} y={50} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              ΣF Net: <tspan fill={isSinking ? '#f43f5e' : '#10b981'}>{Math.round(buoyantForce - weight)} N</tspan>
            </text>
          </g>
        </svg>
      );
    }

    // ── ARCHETYPE B: THERMODYNAMICS & CARNOT ENGINE ──
    if (isThermodynamics) {
      const tH = Number(params.Th ?? params.tHot ?? params.suhuTinggi ?? params.th ?? 600);
      const tC = Number(params.Tc ?? params.tCold ?? params.suhuRendah ?? params.tc ?? 300);
      const qIn = Number(params.Qin ?? params.kalorMasuk ?? params.qin ?? 1000);
      const efficiency = Math.max(0, Math.min(1, 1 - (tC / (tH || 1))));
      const work = qIn * efficiency;
      const qOut = qIn - work;

      const cylW = 220;
      const cylH = 130;
      const cylX = (width - cylW) / 2;
      const cylY = 105;
      const pistonX = cylX + 35 + efficiency * 110;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none">
          <defs>
            <marker id="arrow-work-carnot" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
            </marker>
          </defs>

          {/* Graticule Grid */}
          <g opacity={0.45}>
            {Array.from({ length: 15 }, (_, i) => (
              <line key={`gx-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={height} stroke="var(--color-canvas-grid)" strokeWidth={1} />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <line key={`gy-${i}`} x1={0} y1={i * 50} x2={width} y2={i * 50} stroke="var(--color-canvas-grid)" strokeWidth={1} />
            ))}
          </g>

          {/* Hot Reservoir (Left) */}
          <g transform={`translate(${cylX - 110}, ${cylY + 5})`}>
            <rect width={90} height={120} rx={6} fill="#fef2f2" stroke="#ef4444" strokeWidth={2} />
            <text x={45} y={28} textAnchor="middle" fill="#ef4444" fontSize={10} fontFamily="Space Mono" fontWeight="bold">
              RESERVOIR TH
            </text>
            <text x={45} y={65} textAnchor="middle" fill="#b91c1c" fontSize={18} fontFamily="Space Mono" fontWeight="bold">
              {tH} K
            </text>
            <text x={45} y={95} textAnchor="middle" fill="#dc2626" fontSize={10} fontFamily="Space Mono">
              Qin: {Math.round(qIn)} J
            </text>
          </g>

          {/* Cylinder Chamber */}
          <rect x={cylX} y={cylY} width={cylW} height={cylH} rx={4} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={3} />
          <rect x={cylX + 2} y={cylY + 2} width={pistonX - cylX} height={cylH - 4} fill="#e0f2fe" opacity={0.6} />

          {/* Sliding Piston */}
          <rect x={pistonX} y={cylY + 4} width={18} height={cylH - 8} rx={2} fill="#64748b" stroke="#334155" strokeWidth={2} />
          <line x1={pistonX + 18} y1={cylY + cylH / 2} x2={cylX + cylW + 35} y2={cylY + cylH / 2} stroke="#475569" strokeWidth={8} strokeLinecap="round" />

          {/* Work Output Arrow (Right) */}
          <line
            x1={cylX + cylW + 40}
            y1={cylY + cylH / 2}
            x2={cylX + cylW + 105}
            y2={cylY + cylH / 2}
            stroke="#f59e0b"
            strokeWidth={4}
            markerEnd="url(#arrow-work-carnot)"
          />
          <text x={cylX + cylW + 75} y={cylY + cylH / 2 - 12} textAnchor="middle" fill="#f59e0b" fontSize={11} fontFamily="Space Mono" fontWeight="bold">
            W: {Math.round(work)} J
          </text>

          {/* Cold Reservoir (Bottom) */}
          <g transform={`translate(${cylX + 40}, ${cylY + cylH + 18})`}>
            <rect width={140} height={45} rx={6} fill="#f0f9ff" stroke="#0284c7" strokeWidth={1.5} />
            <text x={70} y={20} textAnchor="middle" fill="#0284c7" fontSize={10} fontFamily="Space Mono" fontWeight="bold">
              RESERVOIR TC: {tC} K
            </text>
            <text x={70} y={35} textAnchor="middle" fill="#0369a1" fontSize={9} fontFamily="Space Mono">
              Qout terbuang: {Math.round(qOut)} J
            </text>
          </g>

          {/* Efficiency Gauge HUD Top Center */}
          <g transform={`translate(${width / 2 - 110}, 16)`}>
            <rect width={220} height={58} rx={8} fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth={1.5} />
            <text x={110} y={22} textAnchor="middle" fill="var(--color-primary-text)" fontSize={10} fontFamily="Space Mono" fontWeight="bold">
              EFISIENSI TERMODINAMIKA (η)
            </text>
            <text x={110} y={48} textAnchor="middle" fill="#10b981" fontSize={22} fontFamily="Space Mono" fontWeight="bold">
              {(efficiency * 100).toFixed(1)}%
            </text>
          </g>
        </svg>
      );
    }

    // ── ARCHETYPE C: BALANCE SHEET (AKTIVA / PASSIVA PANS) ──
    if (isBalance) {
      const assets = Number(computed.totalAssets ?? (params.kas ?? 50000000) + (params.piutang ?? 20000000) + (params.peralatan ?? 30000000));
      const liabilities = Number(computed.totalLiabilities ?? (params.utangUsaha ?? 25000000) + (params.utangBank ?? 15000000));
      const equity = Number(computed.totalEquity ?? (params.modalAwal ?? 50000000) + (params.labaDitahan ?? 10000000));
      const rightSide = liabilities + equity;
      const isBalanced = Math.abs(assets - rightSide) < 1;

      return (
        <div className="w-full max-w-[700px] mx-auto p-4 flex flex-col items-center gap-4">
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left Pan (Aktiva) */}
            <div className={`p-4 sm:p-5 rounded-md border bg-[var(--color-surface)] flex flex-col justify-between transition-colors ${
              isBalanced ? 'border-[var(--color-primary)]/40' : 'border-[var(--color-border)]'
            }`}>
              <div>
                <span className="text-[11px] font-mono font-semibold text-[var(--color-primary-text)] uppercase tracking-wider block">
                  Sisi Kiri (Aktiva)
                </span>
                <h4 className="text-base sm:text-lg font-bold text-[var(--color-text)] mt-0.5 whitespace-nowrap">Total Aset</h4>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle)] flex flex-col gap-1">
                <span className="text-[11px] font-mono text-[var(--color-text-secondary)] uppercase tracking-wider whitespace-nowrap">
                  Nilai Bersih:
                </span>
                <span className="text-xl sm:text-2xl font-mono font-bold text-[var(--color-secondary)] whitespace-nowrap tabular-nums tracking-tight">
                  {formatCurrency(assets)}
                </span>
              </div>
            </div>

            {/* Right Pan (Passiva) */}
            <div className={`p-4 sm:p-5 rounded-md border bg-[var(--color-surface)] flex flex-col justify-between transition-colors ${
              isBalanced ? 'border-[var(--color-primary)]/40' : 'border-[var(--color-border)]'
            }`}>
              <div>
                <span className="text-[11px] font-mono font-semibold text-[var(--color-primary-text)] uppercase tracking-wider block">
                  Sisi Kanan (Passiva)
                </span>
                <h4 className="text-base sm:text-lg font-bold text-[var(--color-text)] mt-0.5 whitespace-nowrap">Liabilitas + Ekuitas</h4>
              </div>
              <div className="text-xs space-y-1.5 my-3 text-[var(--color-text-secondary)]">
                <div className="flex justify-between items-center gap-2">
                  <span className="font-mono text-[11px] whitespace-nowrap">Liabilitas:</span>
                  <strong className="font-mono text-[var(--color-text)] whitespace-nowrap tabular-nums">{formatCurrency(liabilities)}</strong>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="font-mono text-[11px] whitespace-nowrap">Ekuitas:</span>
                  <strong className="font-mono text-[var(--color-text)] whitespace-nowrap tabular-nums">{formatCurrency(equity)}</strong>
                </div>
              </div>
              <div className="pt-3 border-t border-[var(--color-border-subtle)] flex flex-col gap-1">
                <span className="text-[11px] font-mono text-[var(--color-text-secondary)] uppercase tracking-wider whitespace-nowrap">
                  Total Passiva:
                </span>
                <span className="text-xl sm:text-2xl font-mono font-bold text-[var(--color-secondary)] whitespace-nowrap tabular-nums tracking-tight">
                  {formatCurrency(rightSide)}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── ARCHETYPE C.2: TAX PROGRESSIVE BRACKETS (PPH 21 UU HPP & PP 58/2023 TER) ──
    if (isTax) {
      const gajiBulan = Number(params.gajiBulananJuta ?? 15) * 1_000_000;
      const ptkpCode = Number(params.statusPtkpIndex ?? 2);
      const ptkpMap: Record<number, { label: string; amount: number; terCategory: 'A' | 'B' | 'C' }> = {
        1: { label: 'TK/0 (54 Jt)', amount: 54_000_000, terCategory: 'A' },
        2: { label: 'K/0 (58.5 Jt)', amount: 58_500_000, terCategory: 'A' },
        3: { label: 'K/1 (63 Jt)', amount: 63_000_000, terCategory: 'B' },
        4: { label: 'K/2 (67.5 Jt)', amount: 67_500_000, terCategory: 'B' },
        5: { label: 'K/3 (72 Jt)', amount: 72_000_000, terCategory: 'C' },
      };
      const ptkpInfo = ptkpMap[ptkpCode] || ptkpMap[2];
      const brutoSetahun = gajiBulan * 12;
      const biayaJabatan = Math.min(6_000_000, brutoSetahun * 0.05);
      const nettoSetahun = brutoSetahun - biayaJabatan;
      const pkp = Math.max(0, Math.floor((nettoSetahun - ptkpInfo.amount) / 1000) * 1000);

      let sisaPkp = pkp;
      const b1 = Math.min(sisaPkp, 60_000_000); sisaPkp -= b1;
      const b2 = Math.min(sisaPkp, 190_000_000); sisaPkp -= b2;
      const b3 = Math.min(sisaPkp, 250_000_000); sisaPkp -= b3;
      const b4 = Math.min(sisaPkp, 4_500_000_000); sisaPkp -= b4;
      const b5 = sisaPkp;

      const tax1 = b1 * 0.05;
      const tax2 = b2 * 0.15;
      const tax3 = b3 * 0.25;
      const tax4 = b4 * 0.30;
      const tax5 = b5 * 0.35;
      const totalTax = tax1 + tax2 + tax3 + tax4 + tax5;
      const monthlyTax = Math.round(totalTax / 12);
      const thp = gajiBulan - monthlyTax;
      const effectiveRate = brutoSetahun > 0 ? (totalTax / brutoSetahun) * 100 : 0;

      // PP 58/2023 & PMK 168/2023 TER monthly withholding & Dec reconciliation
      const terRate = getTerRatePct(ptkpInfo.terCategory, gajiBulan);
      const monthlyTerWithholding = Math.round(gajiBulan * (terRate / 100));
      const decTrueUp = Math.max(0, totalTax - (11 * monthlyTerWithholding));
      const thpTer = gajiBulan - monthlyTerWithholding;

      const brackets = [
        { label: 'Lapisan 1 (0–60 Jt)', rate: '5%', fill: b1 / 60_000_000, cap: 60_000_000, tax: tax1, color: '#38bdf8' },
        { label: 'Lapisan 2 (60–250 Jt)', rate: '15%', fill: b2 / 190_000_000, cap: 190_000_000, tax: tax2, color: '#818cf8' },
        { label: 'Lapisan 3 (250–500 Jt)', rate: '25%', fill: b3 / 250_000_000, cap: 250_000_000, tax: tax3, color: '#f59e0b' },
        { label: 'Lapisan 4 (500 Jt–5 M)', rate: '30%', fill: b4 / 4_500_000_000, cap: 4_500_000_000, tax: tax4, color: '#ec4899' },
        { label: 'Lapisan 5 (>5 Miliar)', rate: '35%', fill: b5 > 0 ? Math.min(1, b5 / 1_000_000_000) : 0, cap: 0, tax: tax5, color: '#ef4444' },
      ];

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none" data-testid="tax-super-canvas">
          <rect width={width} height={height} fill="transparent" />
          <g transform="translate(30, 20)">
            <text x={0} y={15} fill="var(--color-primary-text)" fontSize={11} fontFamily="Space Mono" fontWeight="bold">
              LAPISAN PPH 21 PASAL 17 UU HPP & WITHHOLDING PP 58/2023 (TER)
            </text>
            <text x={0} y={32} fill="var(--color-text-secondary)" fontSize={9.5} fontFamily="Space Mono">
              Bruto: Rp {(gajiBulan/1e6).toFixed(1)}Jt/bln (Rp {(brutoSetahun/1e6).toFixed(0)}Jt/thn) · Biaya Jabatan: Rp {(biayaJabatan/1e6).toFixed(1)}Jt · PTKP: {ptkpInfo.label}
            </text>
          </g>

          <g transform="translate(30, 68)">
            {brackets.map((brk, idx) => {
              const y = idx * 36;
              const barWidth = 330;
              const fillW = Math.max(0, Math.min(barWidth, brk.fill * barWidth));

              return (
                <g key={idx} transform={`translate(0, ${y})`}>
                  <text x={0} y={12} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
                    {brk.label} · <tspan fill={brk.color} fontWeight="bold">{brk.rate}</tspan>
                  </text>
                  <text x={barWidth} y={12} textAnchor="end" fill={brk.tax > 0 ? brk.color : 'var(--color-text-secondary)'} fontSize={9.5} fontFamily="Space Mono">
                    Pajak: Rp {Math.round(brk.tax).toLocaleString('id-ID')}
                  </text>
                  <rect x={0} y={17} width={barWidth} height={10} rx={2} fill="var(--color-surface-subtle)" stroke="var(--color-border)" strokeWidth={0.5} />
                  {fillW > 0 && (
                    <rect x={0} y={17} width={fillW} height={10} rx={2} fill={brk.color} opacity={0.85} />
                  )}
                </g>
              );
            })}
          </g>

          <g transform={`translate(${width - 270}, 50)`}>
            <rect width={245} height={220} rx={6} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1.5} />
            <text x={14} y={22} fill="var(--color-primary-text)" fontSize={10} fontFamily="Space Mono" fontWeight="bold">
              KOMPARASI REZIM PPH 21
            </text>

            <text x={14} y={42} fill="var(--color-text-secondary)" fontSize={8.5} fontFamily="Space Mono">
              1. Pasal 17 UU HPP (Tahunan Progresif):
            </text>
            <text x={14} y={58} fill="var(--color-text)" fontSize={11} fontFamily="Space Mono" fontWeight="bold">
              PKP: Rp {pkp.toLocaleString('id-ID')} · PPh: Rp {totalTax.toLocaleString('id-ID')}
            </text>
            <text x={14} y={72} fill="var(--color-text-secondary)" fontSize={8.5} fontFamily="Space Mono">
              Rata-rata: <tspan fill="#f59e0b" fontWeight="bold">Rp {monthlyTax.toLocaleString('id-ID')}/bln</tspan>
            </text>

            <line x1={14} y1={84} x2={230} y2={84} stroke="var(--color-border)" strokeWidth={1} strokeDasharray="2 2" />

            <text x={14} y={100} fill="var(--color-text-secondary)" fontSize={8.5} fontFamily="Space Mono">
              2. PP 58/2023 & PMK 168 (Masa TER):
            </text>
            <text x={14} y={116} fill="#38bdf8" fontSize={11} fontFamily="Space Mono" fontWeight="bold">
              TER {ptkpInfo.terCategory}: {terRate}% (Jan–Nov)
            </text>
            <text x={14} y={132} fill="#f59e0b" fontSize={11} fontFamily="Space Mono" fontWeight="bold">
              Potongan Jan–Nov: Rp {monthlyTerWithholding.toLocaleString('id-ID')}/bln
            </text>
            <text x={14} y={148} fill="#ec4899" fontSize={10} fontFamily="Space Mono" fontWeight="bold">
              Bulan 12 (True-Up Des): Rp {decTrueUp.toLocaleString('id-ID')}
            </text>

            <line x1={14} y1={158} x2={230} y2={158} stroke="var(--color-border)" strokeWidth={1} />

            <text x={14} y={174} fill="var(--color-text-secondary)" fontSize={8.5} fontFamily="Space Mono">
              THP Jan–Nov: <tspan fill="#10b981" fontWeight="bold">Rp {thpTer.toLocaleString('id-ID')}</tspan>
            </text>
            <text x={14} y={192} fill="var(--color-text-secondary)" fontSize={8.5} fontFamily="Space Mono">
              Tarif Efektif Riil Tahunan: <tspan fill="#38bdf8" fontWeight="bold">{effectiveRate.toFixed(2)}%</tspan>
            </text>
            <text x={14} y={206} fill="var(--color-text-secondary)" fontSize={7.5} fontFamily="Space Mono">
              11×Masa + Des = Rp {((11 * monthlyTerWithholding) + decTrueUp).toLocaleString('id-ID')} (Tepat)
            </text>
          </g>
        </svg>
      );
    }

    // ── ARCHETYPE D.1: SMART GREENHOUSE MICROCLIMATE (VPD) ──
    if (isGreenhouse) {
      let tAmb = Number(params.tempAmbientC ?? params.temp ?? params.temperature ?? 34);
      if (tAmb > 100) tAmb -= 273.15;
      let rhAmb = Number(params.rhAmbientPct ?? params.rh ?? params.humidity ?? 55);
      // Explicit fraction conversion: ONLY if fractional unit flag is passed
      if (params.rhFractional === 1 || params.isFractional === 1) {
        rhAmb *= 100;
      }
      // Strict percent handling: do NOT infer rhAmb <= 1.0 as fraction. RH=1% is 1% (arid/desert).
      const vent = Number(params.ventilationSpeedPct ?? 60) / 100;
      const shade = Number(params.shadingNetPct ?? 40) / 100;

      let tGh = params.tempInsideC !== undefined
        ? Number(params.tempInsideC)
        : Number((tAmb - (shade * 4.5) - (vent * 3.0)).toFixed(1));
      if (tGh > 100) tGh -= 273.15;

      let rhGh = params.rhInsidePct !== undefined
        ? Number(params.rhInsidePct)
        : Math.min(100, Math.max(1, Math.round(rhAmb + (shade * 8) - (vent * 5))));
      if (params.rhFractional === 1 || params.isFractional === 1) {
        if (params.rhInsidePct !== undefined && rhGh <= 1.0) rhGh *= 100;
      }

      const es = 0.61078 * Math.exp((17.27 * tGh) / (tGh + 237.3));
      const ea = es * (rhGh / 100);
      const vpd = Number((es - ea).toFixed(2));
      const vpdZone = vpd < 0.4 ? 'TERLALU LEMBAB' : vpd <= 0.8 ? 'ZONA PERAKARAN' : vpd <= 1.2 ? 'FOTOSINTESIS OPTIMUM' : vpd <= 1.6 ? 'VEGETATIF CEPAT' : 'STRES KERING';

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none" data-testid="greenhouse-super-canvas">
          <g opacity={0.35}>
            {Array.from({ length: 15 }, (_, i) => (
              <line key={`gx-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={height} stroke="var(--color-canvas-grid)" strokeWidth={1} />
            ))}
          </g>

          <g transform="translate(60, 50)">
            <polygon points="0,70 110,10 220,70 220,200 0,200" fill="var(--color-surface-subtle)" stroke="var(--color-secondary)" strokeWidth={2} />
            <line x1={0} y1={70} x2={220} y2={70} stroke="var(--color-secondary)" strokeWidth={1.5} strokeDasharray="3 3" />
            <text x={110} y={110} textAnchor="middle" fill="var(--color-text)" fontSize={16} fontFamily="Space Mono" fontWeight="bold">
              {tGh}°C
            </text>
            <text x={110} y={130} textAnchor="middle" fill="var(--color-secondary)" fontSize={12} fontFamily="Space Mono">
              RH {rhGh}%
            </text>
            <text x={110} y={160} textAnchor="middle" fill="var(--color-text-secondary)" fontSize={9.5} fontFamily="Space Mono">
              Luar: {tAmb}°C · RH {rhAmb}%
            </text>
          </g>

          <g transform="translate(320, 50)">
            <rect width={280} height={200} rx={6} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1.5} />
            <text x={15} y={26} fill="var(--color-primary-text)" fontSize={10} fontFamily="Space Mono" fontWeight="bold">
              DEFISIT TEKANAN UAP (VPD GAUGE)
            </text>

            <text x={15} y={70} fill="var(--color-text)" fontSize={26} fontFamily="Space Mono" fontWeight="bold">
              {vpd} <tspan fontSize={14} fill="var(--color-text-secondary)">kPa</tspan>
            </text>
            <text x={15} y={92} fill={vpd >= 0.8 && vpd <= 1.2 ? '#10b981' : '#f59e0b'} fontSize={11} fontFamily="Space Mono" fontWeight="bold">
              ● {vpdZone}
            </text>

            <rect x={15} y={115} width={250} height={16} rx={3} fill="var(--color-surface-subtle)" stroke="var(--color-border)" strokeWidth={0.5} />
            <rect x={15 + (0.8 / 2.5) * 250} y={115} width={(0.4 / 2.5) * 250} height={16} fill="#10b981" opacity={0.6} />
            <line
              x1={15 + Math.min(250, Math.max(0, (vpd / 2.5) * 250))}
              y1={110}
              x2={15 + Math.min(250, Math.max(0, (vpd / 2.5) * 250))}
              y2={136}
              stroke="var(--color-text)"
              strokeWidth={3}
            />

            <text x={15} y={150} fill="var(--color-text-secondary)" fontSize={8.5} fontFamily="Space Mono">
              0 kPa
            </text>
            <text x={15 + (1.0 / 2.5) * 250} y={150} textAnchor="middle" fill="#10b981" fontSize={8.5} fontFamily="Space Mono" fontWeight="bold">
              Optimum (0.8–1.2)
            </text>
            <text x={265} y={150} textAnchor="end" fill="var(--color-text-secondary)" fontSize={8.5} fontFamily="Space Mono">
              2.5 kPa
            </text>
          </g>
        </svg>
      );
    }

    // ── ARCHETYPE D.2: HYDROPONIC NUTRIENT RESERVOIR ──
    if (isHydroponics) {
      const ppm = Number(params.nutrientPpm ?? 1200);
      const ec = Number((ppm / 500).toFixed(2));
      const ph = Number(params.solutionPh ?? 6.0);
      const temp = Number(params.waterTempC ?? 24);

      const isPhOpt = ph >= 5.5 && ph <= 6.5;
      const isEcOpt = ec >= 1.4 && ec <= 2.4;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none">
          <g transform="translate(60, 60)">
            <rect width={240} height={180} rx={6} fill="var(--color-surface)" stroke="#38bdf8" strokeWidth={2} />
            <rect x={4} y={50} width={232} height={126} rx={4} fill="#0284c7" opacity={0.15} />
            <line x1={4} y1={50} x2={236} y2={50} stroke="#38bdf8" strokeWidth={2} strokeDasharray="4 2" />
            <text x={120} y={110} textAnchor="middle" fill="var(--color-text)" fontSize={14} fontFamily="Space Mono" fontWeight="bold">
              NUTRISI: {ppm} PPM
            </text>
            <text x={120} y={130} textAnchor="middle" fill="var(--color-text-secondary)" fontSize={10} fontFamily="Space Mono">
              EC: {ec} mS/cm · Suhu {temp}°C
            </text>
          </g>

          <g transform="translate(340, 60)">
            <rect width={260} height={180} rx={6} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1.5} />
            <text x={15} y={26} fill="var(--color-primary-text)" fontSize={10} fontFamily="Space Mono" fontWeight="bold">
              KESEIMBANGAN HARA HIDROPONIK
            </text>
            <text x={15} y={60} fill="var(--color-text)" fontSize={12} fontFamily="Space Mono">
              pH Larutan: <tspan fill={isPhOpt ? '#10b981' : '#f59e0b'} fontWeight="bold">{ph.toFixed(1)}</tspan> {isPhOpt ? '(Optimum)' : '(Perlu Koreksi)'}
            </text>
            <text x={15} y={85} fill="var(--color-text)" fontSize={12} fontFamily="Space Mono">
              Konduktivitas (EC): <tspan fill={isEcOpt ? '#10b981' : '#f59e0b'} fontWeight="bold">{ec} mS/cm</tspan>
            </text>
            <text x={15} y={110} fill="var(--color-text)" fontSize={12} fontFamily="Space Mono">
              Suhu Air: <tspan fill={temp <= 25 ? '#10b981' : '#f59e0b'} fontWeight="bold">{temp}°C</tspan>
            </text>
            <text x={15} y={145} fill={isPhOpt && isEcOpt ? '#10b981' : '#38bdf8'} fontSize={10} fontFamily="Space Mono" fontWeight="bold">
              Status Akar: {isPhOpt && isEcOpt ? 'PENYERAPAN HARA PRIMA' : 'PENYERAPAN TERHAMBAT'}
            </text>
          </g>
        </svg>
      );
    }

    // ── ARCHETYPE D.3: MARKETING CONVERSION FUNNEL ──
    if (isFunnel) {
      const impressions = Number(params.impressionsRibu ?? 100) * 1000;
      const ctr = Number(params.ctrPct ?? 3.5) / 100;
      const leadRate = Number(params.leadConvPct ?? 12) / 100;
      const saleRate = Number(params.saleConvPct ?? 15) / 100;
      const adSpend = Number(params.adSpendJuta ?? 15) * 1_000_000;

      const clicks = Math.round(impressions * ctr);
      const leads = Math.round(clicks * leadRate);
      const customers = Math.round(leads * saleRate);
      const cac = customers > 0 ? Math.round(adSpend / customers) : 0;

      const stages = [
        { label: '1. Tayangan (Impressions)', val: impressions, pct: '100%', w: 560, col: '#38bdf8' },
        { label: '2. Kunjungan / Klik (CTR)', val: clicks, pct: `${(ctr * 100).toFixed(1)}%`, w: 420, col: '#818cf8' },
        { label: '3. Prospek / Leads', val: leads, pct: `${(leadRate * 100).toFixed(1)}%`, w: 280, col: '#f59e0b' },
        { label: '4. Pelanggan (Deals)', val: customers, pct: `${(saleRate * 100).toFixed(1)}%`, w: 160, col: '#10b981' },
      ];

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none">
          <g transform="translate(40, 40)">
            {stages.map((st, i) => {
              const y = i * 65;
              const nextW = i < stages.length - 1 ? stages[i + 1].w : st.w - 60;
              const left1 = (560 - st.w) / 2;
              const right1 = left1 + st.w;
              const left2 = (560 - nextW) / 2;
              const right2 = left2 + nextW;
              const y2 = y + 55;

              return (
                <g key={i}>
                  <polygon
                    points={`${left1},${y} ${right1},${y} ${right2},${y2} ${left2},${y2}`}
                    fill={st.col}
                    opacity={0.75 - i * 0.1}
                    stroke={st.col}
                    strokeWidth={1.5}
                  />
                  <text x={280} y={y + 32} textAnchor="middle" fill="#ffffff" fontSize={11} fontFamily="Space Mono" fontWeight="bold">
                    {st.label}: {st.val.toLocaleString('id-ID')} ({st.pct})
                  </text>
                </g>
              );
            })}
          </g>
          <g transform={`translate(${width - 210}, 20)`}>
            <rect width={190} height={50} rx={4} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1} />
            <text x={10} y={18} fill="var(--color-primary-text)" fontSize={9} fontFamily="Space Mono" fontWeight="bold">
              BIAYA AKUISISI (CAC)
            </text>
            <text x={10} y={38} fill="#10b981" fontSize={13} fontFamily="Space Mono" fontWeight="bold">
              Rp {cac.toLocaleString('id-ID')} / pembeli
            </text>
          </g>
        </svg>
      );
    }

    // ── ARCHETYPE D: GRID / FARMING / SEATING ──
    if (isGrid) {
      const isPrecisionFarming = s.includes('precision') || params.soilNitrogenPpm !== undefined;

      if (isPrecisionFarming) {
        const soilN = Number(params.soilNitrogenPpm ?? 25);
        const targetYield = Number(params.targetYieldTonPerHa ?? 35);
        const luas = Number(params.luasLahanHa ?? 2.0);
        const ureaDose = Number(computed.ureaDoseKgHa ?? Math.round(Math.max(0, targetYield * 2.8 - soilN * 2) / (0.46 * 0.65)));

        const cells = Array.from({ length: 25 }, (_, i) => {
          const v = Math.round(soilN + Math.sin(i * 1.7) * 4);
          return {
            id: i,
            v,
            color: v < 20 ? 'bg-amber-400/80' : v > 50 ? 'bg-cyan-500/80' : 'bg-emerald-500/80',
          };
        });

        return (
          <div className="w-full flex flex-col items-center justify-center p-3 sm:p-4 space-y-3">
            <span className="text-xs font-mono font-bold text-[var(--color-primary-text)] uppercase tracking-wider">
              Peta Status Hara Nitrogen Petak Kebun ({luas} Ha)
            </span>
            <div className="grid grid-cols-5 gap-2 p-3 bg-[var(--color-surface)] rounded-md border border-[var(--color-border)] shadow-2xs">
              {cells.map((c) => (
                <div
                  key={c.id}
                  className={`w-11 h-11 rounded-sm flex items-center justify-center text-[10px] font-mono font-bold text-[var(--color-text)] ${c.color}`}
                >
                  {c.v}N
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-[var(--color-text-secondary)]">
              <span>Defisit (&lt;20 ppm)</span>
              <span>/</span>
              <span className="text-emerald-400">Optimal (20–50 ppm)</span>
              <span>/</span>
              <span className="font-bold text-[var(--color-secondary)]">Dosis Urea: {ureaDose} kg/ha</span>
            </div>
          </div>
        );
      }

      const moisture = Number(params.soilMoisturePct ?? params.soilMoisturePercent ?? 45);
      const cells = Array.from({ length: 25 }, (_, i) => {
        const v = Math.round(moisture + Math.sin(i * 1.5) * 5);
        return {
          id: i,
          v,
          color: v < 22 ? 'bg-amber-400/80' : v > 40 ? 'bg-cyan-500/80' : 'bg-emerald-500/80',
        };
      });

      return (
        <div className="w-full flex flex-col items-center justify-center p-4">
          <div className="grid grid-cols-5 gap-2 p-3 bg-[var(--color-surface)] rounded-md border border-[var(--color-border)] shadow-2xs">
            {cells.map((c) => (
              <div
                key={c.id}
                className={`w-11 h-11 rounded-sm flex items-center justify-center text-[10px] font-mono font-bold text-[var(--color-text)] ${c.color}`}
              >
                {c.v}%
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-[var(--color-text-secondary)] font-mono">
            <span>Kering (&lt;22%)</span>
            <span>/</span>
            <span className="text-emerald-400">Kapasitas Lapang (22–40%)</span>
            <span>/</span>
            <span>Jenuh (&gt;40%)</span>
          </div>
        </div>
      );
    }

    // ── ARCHETYPE E: INTERACTIVE CHARTS & DYNAMIC CURVES ──
    if (isEconomics) {
      // Specialized Break-Even Curve
      if (s.includes('break-even') || s.includes('bep')) {
        const fixedCost = params.fixedCost !== undefined
          ? Number(params.fixedCost)
          : params.fixedCostJuta !== undefined
          ? Number(params.fixedCostJuta) * 1_000_000
          : 15_000_000;

        const variableCost = params.variableCost !== undefined
          ? Number(params.variableCost)
          : params.variableCostRibu !== undefined
          ? Number(params.variableCostRibu) * 1_000
          : 50_000;

        const sellingPrice = params.sellingPrice !== undefined
          ? Number(params.sellingPrice)
          : params.sellingPriceRibu !== undefined
          ? Number(params.sellingPriceRibu) * 1_000
          : 120_000;

        const bepUnits = Number(
          computed.bepUnits !== undefined
            ? computed.bepUnits
            : Math.ceil(fixedCost / Math.max(1, sellingPrice - variableCost))
        );

        const bepRev = Number(
          computed.bepRevenue !== undefined
            ? computed.bepRevenue
            : computed.bepRupiahJuta !== undefined
            ? Number(computed.bepRupiahJuta) * 1_000_000
            : bepUnits * sellingPrice
        );

        const currentSales = params.currentSalesVolume !== undefined
          ? Number(params.currentSalesVolume)
          : Math.round(bepUnits * 1.25);

        const maxU = Math.max(currentSales * 1.4, bepUnits * 1.4, 400);
        const maxR = maxU * sellingPrice;

        const toX = (u: number) => 60 + (u / maxU) * 520;
        const toY = (r: number) => 300 - (r / (maxR || 1)) * 240;

        const bepPt = { x: toX(bepUnits), y: toY(bepRev) };
        const curPt = { x: toX(currentSales), y: toY(currentSales * sellingPrice) };

        const bepLbl = placeLabel({
          anchor: bepPt,
          text: `BEP: ${formatNumber(bepUnits, 'unit')}`,
          preferredPosition: 'top-right',
          viewport: { width, height },
        });

        const curLbl = placeLabel({
          anchor: curPt,
          text: `Saat Ini: ${formatNumber(currentSales, 'unit')}`,
          preferredPosition: 'bottom-right',
          obstacles: [{ x: bepLbl.x, y: bepLbl.y, width: bepLbl.width, height: bepLbl.height }],
          viewport: { width, height },
        });

        return (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none" data-testid="bep-super-canvas">
            <line x1={60} y1={300} x2={600} y2={300} stroke="var(--color-border)" strokeWidth="1.5" />
            <line x1={60} y1={50} x2={60} y2={300} stroke="var(--color-border)" strokeWidth="1.5" />

            <line x1={60} y1={toY(fixedCost)} x2={600} y2={toY(fixedCost)} stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x={605} y={toY(fixedCost) + 4} fill="var(--color-text-secondary)" fontSize="10" fontFamily="Space Mono">FC</text>

            <line x1={60} y1={toY(fixedCost)} x2={600} y2={toY(fixedCost + maxU * variableCost)} stroke="var(--color-accent)" strokeWidth={2.5} />
            <line x1={60} y1={300} x2={600} y2={toY(maxR)} stroke="var(--color-primary)" strokeWidth={2.5} />

            <circle cx={Math.round(bepPt.x)} cy={Math.round(bepPt.y)} r={6} fill="var(--color-accent)" stroke="var(--color-canvas)" strokeWidth={2} />
            <g transform={`translate(${Math.round(bepLbl.x)}, ${Math.round(bepLbl.y)})`}>
              <rect x={-4} y={-2} width={Math.round(bepLbl.width + 8)} height={Math.round(bepLbl.height + 4)} fill="var(--color-surface)" rx={3} stroke="var(--color-accent)" strokeWidth={1} />
              <text x={Math.round(bepLbl.width / 2)} y={Math.round(bepLbl.height / 2 + 3)} textAnchor="middle" fill="var(--color-text)" fontSize={10} fontFamily="Space Mono" fontWeight="bold">
                BEP: {formatNumber(bepUnits, 'unit')}
              </text>
            </g>

            <circle cx={Math.round(curPt.x)} cy={Math.round(curPt.y)} r={5} fill="var(--color-primary)" />
            <g transform={`translate(${Math.round(curLbl.x)}, ${Math.round(curLbl.y)})`}>
              <rect x={-4} y={-2} width={Math.round(curLbl.width + 8)} height={Math.round(curLbl.height + 4)} fill="var(--color-surface)" rx={3} stroke="var(--color-primary)" strokeWidth={1} />
              <text x={Math.round(curLbl.width / 2)} y={Math.round(curLbl.height / 2 + 3)} textAnchor="middle" fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
                Saat Ini: {formatNumber(currentSales, 'unit')}
              </text>
            </g>
          </svg>
        );
      }

      // Universal Function / Parameter Response Curve
      const pKeys = Object.keys(params);
      const cKeys = Object.keys(computed);
      const activeParamKey = pKeys[0] || 'x';
      const activeParam = spec.parameters[activeParamKey] || { label: 'Variabel X', min: 0, max: 100, unit: '' };
      const activeCalcKey = cKeys[0] || 'y';
      const activeCalc = spec.calculations[activeCalcKey] || { label: 'Keluaran Y', formula: activeParamKey, unit: '' };

      const minX = activeParam.min ?? 0;
      const maxX = activeParam.max ?? 100;
      const curX = Number(params[activeParamKey] ?? (minX + maxX) / 2);
      const curY = Number(computed[activeCalcKey] ?? 0);

      const samples: { x: number; y: number }[] = [];
      const stepX = (maxX - minX) / 24 || 1;
      let minY = curY;
      let maxY = curY;

      for (let i = 0; i <= 24; i++) {
        const sx = minX + i * stepX;
        const localScope: Record<string, number> = { ...params, [activeParamKey]: sx };
        const sy = safeEvaluateFormula(activeCalc.formula, localScope);
        samples.push({ x: sx, y: sy });
        if (sy < minY) minY = sy;
        if (sy > maxY) maxY = sy;
      }

      const spanY = Math.max(1, maxY - minY);
      const plotX0 = 70;
      const plotX1 = width - 60;
      const plotY0 = 60;
      const plotY1 = 300;

      const toCanvasX = (vx: number) => plotX0 + ((vx - minX) / (maxX - minX || 1)) * (plotX1 - plotX0);
      const toCanvasY = (vy: number) => plotY1 - ((vy - minY) / spanY) * (plotY1 - plotY0);

      const pathD = samples.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toCanvasX(pt.x).toFixed(1)} ${toCanvasY(pt.y).toFixed(1)}`).join(' ');
      const activePtX = toCanvasX(curX);
      const activePtY = toCanvasY(curY);

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none">
          <g opacity={0.45}>
            {Array.from({ length: 13 }, (_, i) => {
              const gx = plotX0 + i * ((plotX1 - plotX0) / 12);
              return <line key={`gx-${i}`} x1={gx} y1={plotY0} x2={gx} y2={plotY1} stroke="var(--color-canvas-grid)" strokeWidth={1} strokeDasharray="3 3" />;
            })}
            {Array.from({ length: 7 }, (_, i) => {
              const gy = plotY0 + i * ((plotY1 - plotY0) / 6);
              return <line key={`gy-${i}`} x1={plotX0} y1={gy} x2={plotX1} y2={gy} stroke="var(--color-canvas-grid)" strokeWidth={1} strokeDasharray="3 3" />;
            })}
          </g>

          <line x1={plotX0} y1={plotY1} x2={plotX1 + 20} y2={plotY1} stroke="var(--color-border)" strokeWidth={2} />
          <line x1={plotX0} y1={plotY1} x2={plotX0} y2={plotY0 - 20} stroke="var(--color-border)" strokeWidth={2} />

          <text x={plotX1 + 25} y={plotY1 + 4} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono" fontWeight="bold">
            {activeParam.label} ({activeParam.unit || 'unit'})
          </text>
          <text x={plotX0} y={plotY0 - 26} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono" fontWeight="bold">
            {activeCalc.label} ({activeCalc.unit || ''})
          </text>

          <line x1={plotX0} y1={activePtY} x2={activePtX} y2={activePtY} stroke="var(--color-primary)" strokeWidth={1.5} strokeDasharray="3 3" />
          <line x1={activePtX} y1={plotY1} x2={activePtX} y2={activePtY} stroke="var(--color-primary)" strokeWidth={1.5} strokeDasharray="3 3" />

          <path d={pathD} fill="none" stroke="var(--color-primary)" strokeWidth={3} strokeLinecap="round" />

          <circle cx={activePtX} cy={activePtY} r={8} fill="var(--color-primary)" opacity={0.3} className="animate-ping" />
          <circle cx={activePtX} cy={activePtY} r={6} fill="var(--color-primary)" stroke="#ffffff" strokeWidth={2} />

          <g transform={`translate(${Math.min(width - 160, activePtX + 12)}, ${Math.max(40, activePtY - 24)})`}>
            <rect width={140} height={26} rx={4} fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth={1} />
            <text x={70} y={16} textAnchor="middle" fill="var(--color-text)" fontSize={10} fontFamily="Space Mono" fontWeight="bold">
              ({formatCleanNumber(curX)}, {formatCleanNumber(curY)})
            </text>
          </g>

          <g transform={`translate(${width - 190}, 16)`}>
            <rect width={175} height={50} rx={6} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1} />
            <text x={10} y={16} fill="var(--color-primary-text)" fontSize={9} fontFamily="Space Mono" fontWeight="bold">
              RESPONS FUNGSI SISTEM
            </text>
            <text x={10} y={34} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
              Keluaran: <tspan fill="#38bdf8" fontWeight="bold">{formatCleanNumber(curY)} {activeCalc.unit || ''}</tspan>
            </text>
          </g>
        </svg>
      );
    }

    // ── ARCHETYPE F: ALGORITHM & SEQUENCE BARS (Sorting, Search, Queue, Stack) ──
    if (isAlgorithm) {
      const isSorting = s.includes('sort');
      const targetVal = Number(params.target ?? params.find ?? 42);
      const rawArraySize = Number(params.arraySize ?? params.size ?? params.elementsCount ?? 12);
      const arraySize = Math.min(24, Math.max(5, Math.floor(rawArraySize)));
      const algIdx = Math.min(2, Math.max(0, Math.floor(Number(params.algorithm ?? 0))));
      const algNames = ['Bubble Sort', 'Selection Sort', 'Insertion Sort'];
      const algName = algNames[algIdx] || 'Bubble Sort';

      if (isSorting) {
        // Generate deterministic initial array based on arraySize
        const initialArr: number[] = [];
        for (let i = 0; i < arraySize; i++) {
          const val = 15 + ((i * 37 + 19) % 80);
          initialArr.push(val);
        }

        const sortingSteps = generateSortingSteps(initialArr, algIdx);
        const totalSteps = sortingSteps.length;
        const speedVal = Number(params.speed ?? 50);
        const stepsPerSec = Math.max(1, (speedVal / 100) * 12);
        const stepIdx = totalSteps > 0
          ? (runtimeState.time > 0 ? Math.min(totalSteps - 1, Math.floor(runtimeState.time * stepsPerSec)) : 0)
          : 0;
        const curStep = sortingSteps[stepIdx] || sortingSteps[0] || {
          array: initialArr,
          comparing: [-1, -1] as [number, number],
          swapped: false,
          sorted: [] as number[],
          stepNumber: 1,
        };

        const sortedSet = new Set(curStep.sorted);
        const isComparing = (idx: number) => curStep.comparing[0] === idx || curStep.comparing[1] === idx;

        return (
          <div className="w-full flex flex-col items-center justify-center p-3 sm:p-4 space-y-3.5">
            <div className="flex items-end justify-center gap-1 sm:gap-1.5 h-[190px] w-full max-w-[650px] p-3 sm:p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] overflow-x-auto">
              {curStep.array.map((val, idx) => {
                const comp = isComparing(idx);
                const isSorted = sortedSet.has(idx);
                const barHeight = Math.max(22, (val / 100) * 135);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end min-w-[13px] sm:min-w-[18px] max-w-[36px]">
                    <span className="text-[8px] sm:text-[9px] font-mono font-bold text-[var(--color-text-secondary)]">
                      {val}
                    </span>
                    <div
                      style={{ height: `${barHeight}px` }}
                      className={`w-full rounded-t-sm transition-[height,background-color] duration-150 ${
                        isSorted
                          ? 'bg-emerald-500 shadow-xs ring-1 ring-emerald-400'
                          : comp
                          ? curStep.swapped
                            ? 'bg-rose-500 shadow-xs ring-2 ring-rose-400'
                            : 'bg-amber-400 shadow-xs ring-2 ring-amber-300'
                          : 'bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/30'
                      }`}
                    />
                    <span className="text-[7.5px] sm:text-[8px] font-mono text-[var(--color-text-tertiary)]">
                      [{idx}]
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
              <span className="px-2 py-0.5 rounded-sm bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-bold">
                {algName}
              </span>
              <span>/</span>
              <span>Langkah: {stepIdx + 1}/{totalSteps}</span>
              <span>/</span>
              <span className={curStep.swapped ? 'text-rose-400 font-bold' : isComparing(curStep.comparing[0]) ? 'text-amber-400' : 'text-[var(--color-text-secondary)]'}>
                {stepIdx >= totalSteps - 1
                  ? '✔ SELESAI TERURUT'
                  : curStep.swapped
                  ? `Menukar indeks [${curStep.comparing[0]}] ⇄ [${curStep.comparing[1]}]`
                  : `Membandingkan [${curStep.comparing[0]}] & [${curStep.comparing[1]}]`}
              </span>
            </div>
          </div>
        );
      }

      const isStackQueue = s.includes('stack') || s.includes('queue');
      if (isStackQueue) {
        const capacity = Math.max(4, Math.min(10, Number(params.capacity ?? 6)));
        const count = Math.max(0, Math.min(capacity, Number(params.itemCount ?? 4)));
        const isQueue = Number(params.operationMode ?? 1) === 2;
        const fillPct = Math.round((count / capacity) * 100);
        const topPointer = count > 0 ? count - 1 : -1;
        const isFull = count >= capacity;
        const isEmpty = count === 0;

        return (
          <div className="w-full flex flex-col items-center justify-center p-3 sm:p-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-[650px] p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
              {/* Buffer Container */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-[var(--color-primary-text)] uppercase tracking-wider">
                  {isQueue ? 'Buffer Antrean FIFO (Queue)' : 'Buffer Tumpukan LIFO (Stack)'}
                </span>

                {isQueue ? (
                  <div className="flex items-center gap-1.5 p-2 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-md min-h-[64px]">
                    <div className="text-[10px] font-mono font-bold text-emerald-400 px-1 border-r border-[var(--color-border)]">
                      FRONT →
                    </div>
                    {Array.from({ length: capacity }, (_, i) => {
                      const isFilled = i < count;
                      return (
                        <div
                          key={i}
                          className={`w-9 h-11 rounded-md border flex flex-col items-center justify-center font-mono transition-all ${
                            isFilled
                              ? 'bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-text)] font-bold'
                              : 'bg-transparent border-dashed border-[var(--color-border)] text-[var(--color-text-tertiary)]'
                          }`}
                        >
                          <span className="text-[10px]">{isFilled ? `D${i + 1}` : '—'}</span>
                          <span className="text-[7.5px] text-[var(--color-text-secondary)]">[{i}]</span>
                        </div>
                      );
                    })}
                    <div className="text-[10px] font-mono font-bold text-amber-400 px-1 border-l border-[var(--color-border)]">
                      ← REAR
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col-reverse gap-1 p-2 bg-[var(--color-surface-subtle)] border-x border-b border-t border-[var(--color-border)] rounded-b-md w-48">
                    {Array.from({ length: capacity }, (_, i) => {
                      const isFilled = i < count;
                      const isTop = i === topPointer;
                      return (
                        <div
                          key={i}
                          className={`w-full h-7 rounded-md border flex items-center justify-between px-2.5 font-mono text-xs transition-all ${
                            isTop
                              ? 'bg-[var(--color-accent)]/30 border-[var(--color-accent)] text-[var(--color-text)] font-bold ring-1 ring-[var(--color-accent)]'
                              : isFilled
                              ? 'bg-[var(--color-primary-soft)] border-[var(--color-primary)]/50 text-[var(--color-text)]'
                              : 'bg-transparent border-dashed border-[var(--color-border-subtle)] text-[var(--color-text-tertiary)]'
                          }`}
                        >
                          <span className="text-[10px]">{isFilled ? `Item ${i + 1}` : 'Slot Kosong'}</span>
                          <span className="text-[9px] text-[var(--color-text-secondary)]">
                            {isTop ? 'TOP → [' + i + ']' : `[${i}]`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status Telemetry */}
              <div className="flex flex-col gap-2 min-w-[200px] text-xs font-mono">
                <div className="flex justify-between p-2 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                  <span className="text-[var(--color-text-secondary)]">Status:</span>
                  <span className={`font-bold ${isFull ? 'text-rose-400' : isEmpty ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isFull ? 'PENUH (Overflow)' : isEmpty ? 'KOSONG (Underflow)' : 'TERISI OPTIMAL'}
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                  <span className="text-[var(--color-text-secondary)]">Terisi:</span>
                  <span className="font-bold text-[var(--color-text)]">{count} / {capacity} slot ({fillPct}%)</span>
                </div>
                <div className="flex justify-between p-2 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                  <span className="text-[var(--color-text-secondary)]">Pointer:</span>
                  <span className="font-bold text-[var(--color-secondary)]">
                    {isQueue ? `FRONT=[0], REAR=[${count > 0 ? count - 1 : 0}]` : `TOP=[${topPointer}]`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      }

      const isLogicGate = s.includes('logic') || s.includes('gate') || s.includes('gerbang');
      if (isLogicGate) {
        const inA = (params.inputA ?? 1) >= 1 ? 1 : 0;
        const inB = (params.inputB ?? 0) >= 1 ? 1 : 0;
        const gateCode = Math.max(1, Math.min(5, Math.floor(Number(params.gateType ?? 3))));
        const gateNames = ['AND', 'OR', 'XOR', 'NAND', 'NOR'];
        const activeGate = gateNames[gateCode - 1] || 'XOR';

        let outBit = 0;
        switch (gateCode) {
          case 1: outBit = inA & inB; break;
          case 2: outBit = inA | inB; break;
          case 3: outBit = inA ^ inB; break;
          case 4: outBit = (inA & inB) === 1 ? 0 : 1; break;
          case 5: outBit = (inA | inB) === 1 ? 0 : 1; break;
        }

        const truthTable = [
          { a: 0, b: 0 },
          { a: 0, b: 1 },
          { a: 1, b: 0 },
          { a: 1, b: 1 },
        ].map((row) => {
          let expected = 0;
          switch (gateCode) {
            case 1: expected = row.a & row.b; break;
            case 2: expected = row.a | row.b; break;
            case 3: expected = row.a ^ row.b; break;
            case 4: expected = (row.a & row.b) === 1 ? 0 : 1; break;
            case 5: expected = (row.a | row.b) === 1 ? 0 : 1; break;
          }
          return { ...row, out: expected, isCurrent: row.a === inA && row.b === inB };
        });

        return (
          <div className="w-full flex flex-col items-center justify-center p-3 sm:p-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-[650px] p-4 bg-[var(--color-surface)] rounded-md border border-[var(--color-border)]">
              {/* Circuit Schematic */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-[var(--color-primary-text)] uppercase tracking-wider">
                  Sirkuit Gerbang Logika {activeGate}
                </span>
                <svg viewBox="0 0 280 140" className="w-[280px] h-[140px] select-none" data-testid="logic-super-canvas">
                  {/* Input Wire A */}
                  <line x1={30} y1={40} x2={100} y2={40} stroke={inA ? '#10b981' : 'var(--color-border)'} strokeWidth={3} />
                  <circle cx={30} cy={40} r={6} fill={inA ? '#10b981' : 'var(--color-surface-subtle)'} stroke="var(--color-border)" strokeWidth={1.5} />
                  <text x={15} y={44} fill="var(--color-text)" fontSize={11} fontFamily="Space Mono" fontWeight="bold">A={inA}</text>

                  {/* Input Wire B */}
                  <line x1={30} y1={100} x2={100} y2={100} stroke={inB ? '#10b981' : 'var(--color-border)'} strokeWidth={3} />
                  <circle cx={30} cy={100} r={6} fill={inB ? '#10b981' : 'var(--color-surface-subtle)'} stroke="var(--color-border)" strokeWidth={1.5} />
                  <text x={15} y={104} fill="var(--color-text)" fontSize={11} fontFamily="Space Mono" fontWeight="bold">B={inB}</text>

                  {/* Gate Body Symbol */}
                  <rect x={100} y={25} width={75} height={90} rx={8} fill="var(--color-surface-subtle)" stroke="var(--color-primary)" strokeWidth={2} />
                  <text x={137} y={75} textAnchor="middle" fill="var(--color-text)" fontSize={16} fontFamily="Space Mono" fontWeight="bold">
                    {activeGate}
                  </text>

                  {/* Inversion Bubble for NAND / NOR */}
                  {(gateCode === 4 || gateCode === 5) && (
                    <circle cx={180} cy={70} r={5} fill="var(--color-surface-subtle)" stroke="var(--color-primary)" strokeWidth={2} />
                  )}

                  {/* Output Wire */}
                  <line x1={gateCode === 4 || gateCode === 5 ? 185 : 175} y1={70} x2={240} y2={70} stroke={outBit ? '#10b981' : 'var(--color-border)'} strokeWidth={3.5} />
                  <circle cx={240} cy={70} r={9} fill={outBit ? '#10b981' : 'var(--color-surface-subtle)'} stroke={outBit ? '#34d399' : 'var(--color-border)'} strokeWidth={2} />
                  <text x={256} y={74} fill={outBit ? '#34d399' : 'var(--color-text-secondary)'} fontSize={12} fontFamily="Space Mono" fontWeight="bold">
                    Y={outBit}
                  </text>
                </svg>
              </div>

              {/* Truth Table */}
              <div className="flex flex-col gap-1.5 text-xs font-mono min-w-[190px]">
                <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">
                  Tabel Kebenaran (Truth Table)
                </span>
                <div className="border border-[var(--color-border)] rounded-md overflow-hidden">
                  <div className="grid grid-cols-3 bg-[var(--color-surface-subtle)] p-1 text-[10px] font-bold text-center border-b border-[var(--color-border)]">
                    <span>A</span><span>B</span><span>Y ({activeGate})</span>
                  </div>
                  {truthTable.map((row, idx) => (
                    <div
                      key={idx}
                      className={`grid grid-cols-3 p-1 text-center transition-colors ${
                        row.isCurrent
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold border-l-2 border-emerald-400'
                          : 'text-[var(--color-text-secondary)]'
                      }`}
                    >
                      <span>{row.a}</span>
                      <span>{row.b}</span>
                      <span className={row.out === 1 ? 'text-emerald-400 font-bold' : ''}>{row.out}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Default Sequence / Array Search Visualizer
      const items = [12, 24, 35, 42, 58, 67, 75, 89, 94, 105].slice(0, arraySize);
      const activeIdx = Math.min(items.length - 1, Math.max(0, Number(computed.currentIndex ?? computed.stepsCount ?? 3)));

      return (
        <div className="w-full flex flex-col items-center justify-center p-4 space-y-4">
          <div className="flex items-end justify-center gap-2.5 h-[180px] w-full max-w-[550px] p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
            {items.map((val, idx) => {
              const isMatch = val === targetVal;
              const isCurrent = idx === activeIdx;
              const barHeight = Math.max(25, (val / 110) * 130);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-mono font-bold text-[var(--color-text-secondary)]">
                    {val}
                  </span>
                  <div
                    style={{ height: `${barHeight}px` }}
                    className={`w-full rounded-t-sm transition-[height,background-color] duration-200 ${
                      isMatch
                        ? 'bg-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/40 shadow-xs'
                        : isCurrent
                        ? 'bg-[var(--color-accent)]'
                        : 'bg-[var(--color-surface-subtle)] border border-[var(--color-border)]'
                    }`}
                  />
                  <span className="text-[9px] font-mono text-[var(--color-text-tertiary)]">
                    [{idx}]
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-2 py-0.5 rounded-sm bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 text-[var(--color-text)] font-semibold">
              Pointer Aktif [{activeIdx}]
            </span>
            <span className="px-2 py-0.5 rounded-sm bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/30 text-[var(--color-primary-text)] font-semibold">
              Target ({targetVal})
            </span>
          </div>
        </div>
      );
    }

    // ── ARCHETYPE G: UNIVERSAL SCIENTIFIC INSTRUMENT CONSOLE CANVAS (For custom or non-physics) ──
    if (!isPhysics) {
      const primaryParamKey = Object.keys(params)[0] || 'input';
      const primaryParam = spec.parameters[primaryParamKey] || { label: 'Variabel', min: 0, max: 100, defaultVal: 50, unit: '' };
      const curParamVal = Number(params[primaryParamKey] ?? 50);

      const paramRange = (primaryParam.max - primaryParam.min) || 1;
      const ratio = Math.max(0, Math.min(1, (curParamVal - primaryParam.min) / paramRange));
      const needleAngle = -135 + ratio * 270;
      const needleRad = (needleAngle * Math.PI) / 180;
      const dialCx = 180;
      const dialCy = 180;
      const dialR = 85;
      const needleTipX = dialCx + Math.cos(needleRad) * (dialR - 18);
      const needleTipY = dialCy + Math.sin(needleRad) * (dialR - 18);

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[580px] lg:max-h-[620px] select-none">
          <g opacity={0.4}>
            {Array.from({ length: 15 }, (_, i) => (
              <line key={`gx-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={height} stroke="var(--color-canvas-grid)" strokeWidth={1} />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <line key={`gy-${i}`} x1={0} y1={i * 50} x2={width} y2={i * 50} stroke="var(--color-canvas-grid)" strokeWidth={1} />
            ))}
          </g>

          <line x1={0} y1={groundY + 30} x2={width} y2={groundY + 30} stroke="var(--color-border)" strokeWidth={1.5} />

          {/* Circular Telemetry Gauge */}
          <circle cx={dialCx} cy={dialCy} r={dialR} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={3} />
          <circle cx={dialCx} cy={dialCy} r={dialR - 8} fill="none" stroke="var(--color-surface-subtle)" strokeWidth={6} strokeDasharray="4 2" />
          <circle cx={dialCx} cy={dialCy} r={dialR - 18} fill="none" stroke="var(--color-primary)" strokeWidth={3} strokeDasharray="260 360" strokeDashoffset="50" opacity={0.8} />

          <line x1={dialCx} y1={dialCy} x2={needleTipX} y2={needleTipY} stroke="var(--color-secondary)" strokeWidth={3.5} strokeLinecap="round" />
          <circle cx={dialCx} cy={dialCy} r={7} fill="var(--color-secondary)" />

          <text x={dialCx} y={dialCy + 42} textAnchor="middle" fill="var(--color-text)" fontSize={15} fontFamily="Space Mono" fontWeight="bold">
            {formatCleanNumber(curParamVal)} {primaryParam.unit}
          </text>
          <text x={dialCx} y={dialCy + 56} textAnchor="middle" fill="var(--color-text-secondary)" fontSize={9} fontFamily="Space Mono">
            {primaryParam.label}
          </text>

          {/* Multi-Channel Response Monitor */}
          <g transform="translate(325, 70)">
            <rect width={355} height={200} rx={8} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={2} />
            <rect width={355} height={30} rx={8} fill="var(--color-surface-subtle)" />
            <text x={14} y={20} fill="var(--color-primary-text)" fontSize={10} fontFamily="Space Mono" fontWeight="bold">
              PEMANTAUAN SINYAL & HASIL PERHITUNGAN
            </text>

            <g transform="translate(16, 45)">
              {Object.entries(params).slice(0, 3).map(([k, val], idx) => {
                const p = spec.parameters[k] || { min: 0, max: 100, label: k, unit: '' };
                const pct = Math.max(5, Math.min(100, ((val - p.min) / ((p.max - p.min) || 1)) * 100));
                return (
                  <g key={k} transform={`translate(0, ${idx * 46})`}>
                    <text x={0} y={10} fill="var(--color-text)" fontSize={10} fontFamily="Space Mono">
                      CH{idx + 1}: {p.label}
                    </text>
                    <text x={320} y={10} textAnchor="end" fill="var(--color-primary-text)" fontSize={10} fontFamily="Space Mono" fontWeight="bold">
                      {formatCleanNumber(val)} {p.unit}
                    </text>
                    <rect x={0} y={16} width={320} height={8} rx={3} fill="var(--color-surface-subtle)" stroke="var(--color-border-subtle)" strokeWidth={1} />
                    <rect x={0} y={16} width={(pct / 100) * 320} height={8} rx={3} fill="var(--color-primary)" />
                  </g>
                );
              })}
            </g>
          </g>

        </svg>
      );
    }

    // Fallback blank workspace ONLY when explicitly in admin mode and having 0 parameters & 0 visual elements
    const hasAnyParams = Object.keys(spec.parameters || {}).length > 0;
    const hasAnyElements = Boolean(spec.visual?.elements && spec.visual.elements.length > 0);
    if (mode === 'admin' && !isLegacySimulation && !hasAnyParams && !hasAnyElements) {
      return (
        <div className="w-full min-h-[300px] sm:min-h-[340px] flex flex-col items-center justify-center p-6 text-center select-none relative">
          <svg className="absolute inset-0 w-full h-full opacity-35 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="empty-canvas-grid-fallback" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeWidth="0.8" strokeDasharray="3 3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#empty-canvas-grid-fallback)" />
          </svg>

          <div className="relative z-10 max-w-sm flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary-text)] shadow-2xs">
              <IconLayers size={22} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading text-sm sm:text-base font-bold text-[var(--color-text)] tracking-tight">
                Mulai membangun simulasi
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Tarik elemen dari panel kiri ke area ini, atau klik tombol elemen untuk menambahkannya langsung ke kanvas.
              </p>
            </div>
            {onAddElementClick && (
              <button
                type="button"
                onClick={onAddElementClick}
                className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-xs font-semibold text-[var(--color-text)] transition-colors shadow-2xs cursor-pointer"
              >
                <IconPlus size={14} />
                <span>Tambahkan elemen</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    const mass = Math.max(0.1, Number(params.mass ?? params.m1 ?? 5));
    const force = Number(params.force ?? 25);
    const rawFriction = Math.max(0, Number(params.friction ?? 0));
    const g = Math.max(0.1, Number(params.gravity ?? params.g ?? 9.81));
    const normalForce = mass * g;
    const weight = mass * g;
    const maxFriction = rawFriction * normalForce;
    const accel = runtimeState.dynamics.acceleration;
    const velocity = runtimeState.dynamics.velocity;
    const isMoving = Math.abs(velocity) > 0.0001;
    const activeFriction = isMoving ? maxFriction : Math.min(maxFriction, Math.abs(force));
    const netForce = Number(runtimeState.computed.netForce ?? (isMoving ? force - Math.sign(velocity || force) * maxFriction : (Math.abs(force) > maxFriction ? force - Math.sign(force) * maxFriction : 0)));

    const liveX = runtimeState.dynamics.position;
    const liveT = runtimeState.time;

    // View mode layout configuration
    const isSplit = physicsViewMode === 'split';
    const showGraphsOnly = physicsViewMode === 'graphs';
    const showApparatusOnly = physicsViewMode === 'apparatus';

    const canvasWidth = isMobile ? 480 : 720;
    const canvasHeight = isMobile ? (isSplit ? 580 : (showApparatusOnly ? 440 : 520)) : (isSplit ? 490 : 360);
    const apparatusGroundY = isMobile
      ? (isSplit ? 200 : 285)
      : (isSplit ? 172 : 255);

    // Mass block geometry (scaled according to physical mass)
    const blockW = isMobile
      ? Math.min(135, Math.max(82, 76 + mass * 3.0))
      : Math.min(130, Math.max(76, 70 + mass * 2.8));
    const blockH = isMobile
      ? Math.min(76, Math.max(48, 44 + mass * 1.8))
      : Math.min(72, Math.max(46, 42 + mass * 1.5));

    // Dynamic track camera panning: smooth window
    const displayWindowM = isMobile ? 8.0 : 10.0;
    const cameraPanMeters = liveX > (displayWindowM * 0.65) ? liveX - (displayWindowM * 0.65) : (liveX < 0 ? liveX : 0);
    const trackStartX = isMobile ? 35 : 75;
    const trackUsableW = canvasWidth - (isMobile ? 70 : 150) - blockW;
    const pxPerMeter = trackUsableW / displayWindowM;

    const blockX = trackStartX + (liveX - cameraPanMeters) * pxPerMeter;
    const blockY = apparatusGroundY - blockH - (isMobile ? 14 : 12);
    const blockCx = blockW / 2;
    const blockCy = blockH / 2;

    // Unified force scale: 1.15 px per Newton
    const forceScale = 1.15;
    const maxArrowLen = isMobile ? 115 : 135;
    const minArrowLen = 20;

    // Applied force vector
    const hasForce = Math.abs(force) > 0.01;
    const forceArrowLen = Math.min(maxArrowLen, Math.max(minArrowLen, Math.abs(force) * forceScale));

    // Friction force vector
    const frictionArrowLen = Math.min(maxArrowLen, Math.max(minArrowLen, activeFriction * forceScale));
    const frictionPointsLeft = isMoving ? velocity > 0 : force >= 0;
    const fContactY = blockH + 6; // Contact plane relative to cart group

    // Vertical forces (Normal & Weight)
    const normalArrowLen = Math.min(38, Math.max(20, normalForce * 0.45));
    const weightArrowLen = Math.min(26, Math.max(18, weight * 0.35));

    // Acceleration vector
    const accelArrowLen = Math.min(120, Math.max(20, Math.abs(accel) * 12));
    const accelX2 = accel >= 0 ? blockCx + accelArrowLen : blockCx - accelArrowLen;

    // Velocity vector
    const velArrowLen = Math.min(115, Math.max(20, Math.abs(velocity) * 10));
    const velX2 = velocity >= 0 ? blockCx + velArrowLen : blockCx - velArrowLen;

    // Wheel rotation angle derived strictly from physical distance traversed
    const wheelR = isMobile ? 7 : 6;
    const wheelAngleDeg = (runtimeState.dynamics.distance / (wheelR * 0.02)) % 360;

    // Kinematic chart calculation parameters
    const maxChartT = Math.max(6.0, Math.ceil(liveT * 1.25));
    const chartSteps = 30;

    // Chart 1: Position x(t) = 0.5 * a * t^2
    const theorMaxX = Math.max(12, Math.abs(liveX) * 1.3, Math.abs(0.5 * accel * maxChartT * maxChartT) * 1.15);
    // Chart 2: Velocity v(t) = a * t
    const theorMaxV = Math.max(6, Math.abs(velocity) * 1.3, Math.abs(accel * maxChartT) * 1.15);

    // Responsive Chart layouts: side-by-side on desktop, stacked vertically on mobile
    const chart1X = isMobile ? 24 : 30;
    const chart1W = isMobile ? (canvasWidth - 48) : 315;
    const chart1H = isMobile ? (isSplit ? 125 : 205) : (isSplit ? 200 : 250);
    const chart1Y = isMobile ? (isSplit ? 275 : 30) : (isSplit ? 256 : 65);

    const chart2X = isMobile ? 24 : 375;
    const chart2W = isMobile ? (canvasWidth - 48) : 315;
    const chart2H = isMobile ? (isSplit ? 125 : 205) : (isSplit ? 200 : 250);
    const chart2Y = isMobile ? (isSplit ? 425 : 260) : (isSplit ? 256 : 65);

    // Generate x(t) path
    const xChartPoints: { px: number; py: number }[] = [];
    for (let i = 0; i <= chartSteps; i++) {
      const t = (i / chartSteps) * maxChartT;
      const xVal = 0.5 * accel * t * t;
      const px = chart1X + (t / maxChartT) * chart1W;
      const py = chart1Y + chart1H - 24 - (Math.max(0, xVal) / theorMaxX) * (chart1H - 45);
      xChartPoints.push({ px, py });
    }
    const xPathD = xChartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.px.toFixed(1)} ${p.py.toFixed(1)}`).join(' ');

    // Current time cursor on x(t)
    const curXCursorX = chart1X + Math.min(1.0, liveT / maxChartT) * chart1W;
    const curXCursorY = chart1Y + chart1H - 24 - (Math.max(0, liveX) / theorMaxX) * (chart1H - 45);

    // Generate v(t) path
    const vChartPoints: { px: number; py: number }[] = [];
    for (let i = 0; i <= chartSteps; i++) {
      const t = (i / chartSteps) * maxChartT;
      const vVal = accel * t;
      const px = chart2X + (t / maxChartT) * chart2W;
      const py = chart2Y + chart2H - 24 - (Math.max(0, vVal) / theorMaxV) * (chart2H - 45);
      vChartPoints.push({ px, py });
    }
    const vPathD = vChartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.px.toFixed(1)} ${p.py.toFixed(1)}`).join(' ');

    // Current time cursor on v(t)
    const curVCursorX = chart2X + Math.min(1.0, liveT / maxChartT) * chart2W;
    const curVCursorY = chart2Y + chart2H - 24 - (Math.max(0, velocity) / theorMaxV) * (chart2H - 45);

    // Absolute position of friction tip to prevent left-side text clipping
    const absFrictionX2 = blockX - frictionArrowLen;

    return (
      <svg
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        className="w-full h-full max-h-full object-contain select-none"
        data-testid="physics-super-canvas"
      >
        <defs>
          <marker id="arrow-force" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#4B8F8C" />
          </marker>
          <marker id="arrow-friction" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
          </marker>
          <marker id="arrow-accel" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
          </marker>
          <marker id="arrow-velocity" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
          </marker>
          <marker id="arrow-normal" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
          </marker>
          <marker id="arrow-weight" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#BA8230" />
          </marker>
          <linearGradient id="curve-xt-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4B8F8C" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* ── BASE RECESSED LABORATORY GROUND ── */}
        <rect width={canvasWidth} height={canvasHeight} fill="var(--color-canvas)" />

        {/* ══════════════════════════════════════════════════════════════════════════
            CHAMBER 1: PHYSICAL DYNAMICS APPARATUS & FREE-BODY DIAGRAM (FBD)
        ══════════════════════════════════════════════════════════════════════════ */}
        {(showApparatusOnly || isSplit) && (
          <g id="apparatus-chamber">
            {/* Precision Hairline Graticule Grid */}
            <g opacity={0.45}>
              {Array.from({ length: 15 }, (_, i) => (
                <line key={`gx-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={apparatusGroundY + 50} stroke="var(--color-canvas-grid)" strokeWidth={1} />
              ))}
              {Array.from({ length: 6 }, (_, i) => (
                <line key={`gy-${i}`} x1={0} y1={i * 40} x2={canvasWidth} y2={i * 40} stroke="var(--color-canvas-grid)" strokeWidth={1} />
              ))}
            </g>

            {/* Track Bed & Ground Surface */}
            <rect x={0} y={apparatusGroundY} width={canvasWidth} height={isSplit ? 52 : canvasHeight - apparatusGroundY} fill="var(--color-canvas-ground)" />
            <line x1={0} y1={apparatusGroundY} x2={canvasWidth} y2={apparatusGroundY} stroke="#4B8F8C" strokeWidth={2} />

            {/* Track Surface Grip Hash Lines */}
            {Array.from({ length: 42 }, (_, i) => (
              <line key={`grip-${i}`} x1={i * 18} y1={apparatusGroundY} x2={i * 18 - 8} y2={apparatusGroundY + 8} stroke="var(--color-canvas-seam)" strokeWidth={1.5} opacity={0.6} />
            ))}

            {/* Dynamic Metric Track Ruler (Scrolls smoothly with camera pan) */}
            {Array.from({ length: 12 }, (_, i) => {
              const baseMeter = Math.floor(cameraPanMeters) + i;
              const rx = trackStartX + (baseMeter - cameraPanMeters) * pxPerMeter;
              if (rx < 15 || rx > canvasWidth - 15) return null;
              return (
                <g key={`ruler-${baseMeter}`}>
                  <line x1={rx} y1={apparatusGroundY + 22} x2={rx} y2={apparatusGroundY + 30} stroke="var(--color-canvas-seam)" strokeWidth={1.5} />
                  <text x={rx} y={apparatusGroundY + 44} textAnchor="middle" fill="var(--color-text-secondary)" fontSize={9.5} fontFamily="Space Mono">
                    {baseMeter}m
                  </text>
                </g>
              );
            })}

            {/* ══════════════════════════════════════════════════════════════════════
                UNIFIED SPECIMEN CART ASSEMBLY (SINGLE GROUP — NO CSS LAG)
            ══════════════════════════════════════════════════════════════════════ */}
            <g id="specimen-cart-assembly" transform={`translate(${blockX}, ${blockY})`}>
              {/* Roller Bearing Wheels under Specimen Cart */}
              <g id="cart-wheels">
                <g transform={`translate(20, ${blockH + 6}) rotate(${wheelAngleDeg})`}>
                  <circle r={wheelR} fill="var(--color-canvas-ground)" stroke="#4B8F8C" strokeWidth={2} />
                  <line x1={-wheelR + 1} y1={0} x2={wheelR - 1} y2={0} stroke="#4B8F8C" strokeWidth={1.5} />
                  <line x1={0} y1={-wheelR + 1} x2={0} y2={wheelR - 1} stroke="#4B8F8C" strokeWidth={1.5} />
                  <circle r={2} fill="#BA8230" />
                </g>
                <g transform={`translate(${blockW - 20}, ${blockH + 6}) rotate(${wheelAngleDeg})`}>
                  <circle r={wheelR} fill="var(--color-canvas-ground)" stroke="#4B8F8C" strokeWidth={2} />
                  <line x1={-wheelR + 1} y1={0} x2={wheelR - 1} y2={0} stroke="#4B8F8C" strokeWidth={1.5} />
                  <line x1={0} y1={-wheelR + 1} x2={0} y2={wheelR - 1} stroke="#4B8F8C" strokeWidth={1.5} />
                  <circle r={2} fill="#BA8230" />
                </g>
              </g>

              {/* Specimen Cart Body (Mass Specimen Chassis - NO transition-all to eliminate lag) */}
              <rect
                x={0}
                y={0}
                width={blockW}
                height={blockH}
                rx={3}
                fill="var(--color-canvas-object)"
                stroke={mode === 'admin' && selectedElementId === 'block' ? '#BA8230' : '#4B8F8C'}
                strokeWidth={mode === 'admin' && selectedElementId === 'block' ? 2.5 : 2}
                className="cursor-pointer"
                onClick={() => onSelectElement && onSelectElement('block')}
              />

              {/* Center of Mass Reticle */}
              <line x1={blockCx - 7} y1={blockCy} x2={blockCx + 7} y2={blockCy} stroke="#4B8F8C" strokeWidth={1} strokeDasharray="2 2" opacity={0.6} />
              <line x1={blockCx} y1={blockCy - 7} x2={blockCx} y2={blockCy + 7} stroke="#4B8F8C" strokeWidth={1} strokeDasharray="2 2" opacity={0.6} />

              {/* Block Mass Label — Firmly bound inside cart center */}
              <text
                x={blockCx}
                y={blockCy}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--color-text)"
                fontFamily="Space Mono"
                fontSize={13.5}
                fontWeight="bold"
              >
                m = {mass} kg
              </text>

              {/* ── VECTOR 1: NORMAL FORCE N (Points UPWARDS away from cart) ── */}
              <g id="vec-normal">
                <line
                  x1={blockCx}
                  y1={0}
                  x2={blockCx}
                  y2={-normalArrowLen}
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  markerEnd="url(#arrow-normal)"
                />
                <text
                  x={blockCx + 6}
                  y={-normalArrowLen + 10}
                  fill="#38bdf8"
                  fontFamily="Space Mono"
                  fontSize={9.5}
                  fontWeight="bold"
                >
                  N = {normalForce.toFixed(1)} N
                </text>
              </g>

              {/* ── VECTOR 2: WEIGHT FORCE W = mg (Points DOWNWARDS into ground) ── */}
              <g id="vec-weight">
                <line
                  x1={blockCx}
                  y1={blockH}
                  x2={blockCx}
                  y2={blockH + 24}
                  stroke="#BA8230"
                  strokeWidth={2.5}
                  markerEnd="url(#arrow-weight)"
                />
                <text
                  x={blockCx + 8}
                  y={blockH + 24}
                  fill="#BA8230"
                  fontFamily="Space Mono"
                  fontSize={9}
                  fontWeight="bold"
                >
                  W = mg = {weight.toFixed(1)} N
                </text>
              </g>

              {/* ── VECTOR 3: APPLIED FORCE F (Horizontal, Attached to Cart) ── */}
              {hasForce && (
                <g id="vec-force">
                  <line
                    x1={force >= 0 ? blockW : 0}
                    y1={blockCy}
                    x2={force >= 0 ? blockW + forceArrowLen : -forceArrowLen}
                    y2={blockCy}
                    stroke="#4B8F8C"
                    strokeWidth={3}
                    markerEnd="url(#arrow-force)"
                  />
                  <text
                    x={force >= 0 ? blockW + forceArrowLen + 8 : -forceArrowLen - 8}
                    y={blockCy - 2}
                    textAnchor={force >= 0 ? "start" : "end"}
                    fill="#8ed3cf"
                    fontFamily="Space Mono"
                    fontSize={11}
                    fontWeight="bold"
                  >
                    F = {formatCleanNumber(Math.abs(force))} N
                  </text>
                  <text
                    x={force >= 0 ? blockW + forceArrowLen + 8 : -forceArrowLen - 8}
                    y={blockCy + 11}
                    textAnchor={force >= 0 ? "start" : "end"}
                    fill="#8FA396"
                    fontFamily="Space Mono"
                    fontSize={9}
                    letterSpacing="0.5"
                  >
                    {force >= 0 ? "DORONG →" : "← TARIK"}
                  </text>
                </g>
              )}

              {/* ── VECTOR 4: FRICTION FORCE f (Contact Plane, Left Clamping) ── */}
              {activeFriction > 0 && (
                <g id="vec-friction">
                  <line
                    x1={frictionPointsLeft ? 0 : blockW}
                    y1={fContactY}
                    x2={frictionPointsLeft ? -frictionArrowLen : blockW + frictionArrowLen}
                    y2={fContactY}
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    markerEnd="url(#arrow-friction)"
                  />
                  {frictionPointsLeft ? (
                    absFrictionX2 < 85 ? (
                      /* If close to left edge, place label inwards above the arrow */
                      <g>
                        <text
                          x={-frictionArrowLen + 4}
                          y={fContactY - 8}
                          textAnchor="start"
                          fill="#ef4444"
                          fontFamily="Space Mono"
                          fontSize={10}
                          fontWeight="bold"
                        >
                          f = {activeFriction.toFixed(1)} N
                        </text>
                        <text
                          x={-frictionArrowLen + 4}
                          y={fContactY + 16}
                          textAnchor="start"
                          fill="#8FA396"
                          fontFamily="Space Mono"
                          fontSize={8}
                          letterSpacing="0.5"
                        >
                          {isMoving ? "← GESEK KINETIK" : "GESEK STATIS"}
                        </text>
                      </g>
                    ) : (
                      /* Standard placement to the left of the arrowhead */
                      <g>
                        <text
                          x={-frictionArrowLen - 8}
                          y={fContactY - 4}
                          textAnchor="end"
                          fill="#ef4444"
                          fontFamily="Space Mono"
                          fontSize={10.5}
                          fontWeight="bold"
                        >
                          f = {activeFriction.toFixed(1)} N
                        </text>
                        <text
                          x={-frictionArrowLen - 8}
                          y={fContactY + 8}
                          textAnchor="end"
                          fill="#8FA396"
                          fontFamily="Space Mono"
                          fontSize={8.5}
                          letterSpacing="0.5"
                        >
                          {isMoving ? "← GESEK KINETIK" : "GESEK STATIS"}
                        </text>
                      </g>
                    )
                  ) : (
                    /* Friction points right */
                    <g>
                      <text
                        x={blockW + frictionArrowLen + 8}
                        y={fContactY - 4}
                        textAnchor="start"
                        fill="#ef4444"
                        fontFamily="Space Mono"
                        fontSize={10.5}
                        fontWeight="bold"
                      >
                        f = {activeFriction.toFixed(1)} N
                      </text>
                      <text
                        x={blockW + frictionArrowLen + 8}
                        y={fContactY + 8}
                        textAnchor="start"
                        fill="#8FA396"
                        fontFamily="Space Mono"
                        fontSize={8.5}
                        letterSpacing="0.5"
                      >
                        {isMoving ? "GESEK KINETIK →" : "GESEK STATIS"}
                      </text>
                    </g>
                  )}
                </g>
              )}

              {/* ── VECTOR 5: VELOCITY v(t) (Dedicated Layer Above Cart) ── */}
              {Math.abs(velocity) > 0.05 && (
                <g id="vec-velocity">
                  <line
                    x1={blockCx}
                    y1={-48}
                    x2={velX2}
                    y2={-48}
                    stroke="#10b981"
                    strokeWidth={2.5}
                    markerEnd="url(#arrow-velocity)"
                  />
                  <text
                    x={velocity >= 0 ? velX2 + 6 : velX2 - 6}
                    y={-44}
                    textAnchor={velocity >= 0 ? "start" : "end"}
                    fill="#10b981"
                    fontSize={10}
                    fontFamily="Space Mono"
                    fontWeight="bold"
                  >
                    v = {velocity.toFixed(2)} m/s
                  </text>
                </g>
              )}

              {/* ── VECTOR 6: ACCELERATION a & NET FORCE F_net (Stratified Layer) ── */}
              {Math.abs(accel) > 0.01 ? (
                <g id="vec-accel">
                  <line
                    x1={blockCx}
                    y1={-70}
                    x2={accelX2}
                    y2={-70}
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    markerEnd="url(#arrow-accel)"
                  />
                  <text
                    x={accel >= 0 ? accelX2 + 6 : accelX2 - 6}
                    y={-66}
                    textAnchor={accel >= 0 ? "start" : "end"}
                    fill="#f59e0b"
                    fontFamily="Space Mono"
                    fontSize={10.5}
                    fontWeight="bold"
                  >
                    a = {accel.toFixed(2)} m/s² (F_net = {netForce.toFixed(1)} N)
                  </text>
                </g>
              ) : Math.abs(velocity) > 0.05 ? (
                <text
                  x={blockCx}
                  y={-66}
                  textAnchor="middle"
                  fill="#8ed3cf"
                  fontFamily="Space Mono"
                  fontSize={9.5}
                  fontWeight="bold"
                >
                  a = 0.00 m/s² (HUKUM I NEWTON · v KONSTAN)
                </text>
              ) : (
                <text
                  x={blockCx}
                  y={-66}
                  textAnchor="middle"
                  fill="#8FA396"
                  fontFamily="Space Mono"
                  fontSize={9.5}
                >
                  a = 0.00 m/s² (DIAM · STATIS)
                </text>
              )}
            </g>
          </g>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            CHAMBER 2: MODEL-DRIVEN KINEMATIC GRAPHS: x(t) & v(t)
        ══════════════════════════════════════════════════════════════════════════ */}
        {(showGraphsOnly || isSplit) && (
          <g id="kinematic-charts-chamber">
            {/* Split Divider Seam with Clean Vertical Buffer */}
            {isSplit && (
              <g>
                <line x1={20} y1={isMobile ? 260 : 236} x2={canvasWidth - 20} y2={isMobile ? 260 : 236} stroke="var(--color-border)" strokeWidth={1.2} strokeDasharray="4 3" opacity={0.8} />
                <rect x={canvasWidth / 2 - 90} y={isMobile ? 251 : 228} width={180} height={17} rx={3} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1} />
                <text x={canvasWidth / 2} y={isMobile ? 263 : 240} textAnchor="middle" fill="var(--color-primary-text)" fontSize={9} fontFamily="Space Mono" fontWeight="bold" letterSpacing="0.5">
                  GRAFIK KINEMATIKA REAL-TIME
                </text>
              </g>
            )}

            {/* ── CHART 1: POSISI TERHADAP WAKTU: x(t) = ½at² ── */}
            <g id="chart-position">
              <rect x={chart1X} y={chart1Y} width={chart1W} height={chart1H} rx={4} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1.5} />
              {/* Internal Grid */}
              <line x1={chart1X} y1={chart1Y + chart1H / 2} x2={chart1X + chart1W} y2={chart1Y + chart1H / 2} stroke="var(--color-canvas-grid)" strokeWidth={0.8} strokeDasharray="3 3" opacity={0.5} />
              <line x1={chart1X + chart1W / 2} y1={chart1Y} x2={chart1X + chart1W / 2} y2={chart1Y + chart1H} stroke="var(--color-canvas-grid)" strokeWidth={0.8} strokeDasharray="3 3" opacity={0.5} />

              {/* Chart Axes */}
              <line x1={chart1X} y1={chart1Y + chart1H - 24} x2={chart1X + chart1W} y2={chart1Y + chart1H - 24} stroke="var(--color-border)" strokeWidth={1.5} />
              <line x1={chart1X} y1={chart1Y} x2={chart1X} y2={chart1Y + chart1H - 24} stroke="var(--color-border)" strokeWidth={1.5} />

              {/* Theoretical / Integrated Parabolic Trajectory Path */}
              <path d={xPathD} fill="none" stroke="url(#curve-xt-grad)" strokeWidth={2.5} />

              {/* Time Cursor Vertical Hairline */}
              <line x1={curXCursorX} y1={chart1Y} x2={curXCursorX} y2={chart1Y + chart1H - 24} stroke="#BA8230" strokeWidth={1.2} strokeDasharray="2 2" opacity={0.85} />

              {/* Live Data Point on x(t) */}
              <circle cx={curXCursorX} cy={curXCursorY} r={4.5} fill="#4B8F8C" stroke="var(--color-text)" strokeWidth={1.5} />

              {/* Chart Header & Equation */}
              <text x={chart1X + 10} y={chart1Y + 16} fill="var(--color-primary-text)" fontSize={9.5} fontFamily="Space Mono" fontWeight="bold">
                x(t) = x₀ + v₀t + ½at²
              </text>
              <text x={chart1X + chart1W - 8} y={chart1Y + 16} textAnchor="end" fill="#10b981" fontSize={9.5} fontFamily="Space Mono" fontWeight="bold">
                x = {liveX.toFixed(2)} m
              </text>

              {/* Axis Ticks */}
              <text x={chart1X + 4} y={chart1Y + chart1H - 30} fill="var(--color-text-secondary)" fontSize={8.5} fontFamily="Space Mono">
                0m
              </text>
              <text x={chart1X + 4} y={chart1Y + 28} fill="var(--color-text-secondary)" fontSize={8.5} fontFamily="Space Mono">
                {theorMaxX.toFixed(0)}m
              </text>
              <text x={chart1X + chart1W - 6} y={chart1Y + chart1H - 10} textAnchor="end" fill="var(--color-text-secondary)" fontSize={8.5} fontFamily="Space Mono">
                {maxChartT.toFixed(0)}s (waktu)
              </text>
            </g>

            {/* ── CHART 2: KECEPATAN TERHADAP WAKTU: v(t) = at ── */}
            <g id="chart-velocity">
              <rect x={chart2X} y={chart2Y} width={chart2W} height={chart2H} rx={4} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1.5} />
              {/* Internal Grid */}
              <line x1={chart2X} y1={chart2Y + chart2H / 2} x2={chart2X + chart2W} y2={chart2Y + chart2H / 2} stroke="var(--color-canvas-grid)" strokeWidth={0.8} strokeDasharray="3 3" opacity={0.5} />
              <line x1={chart2X + chart2W / 2} y1={chart2Y} x2={chart2X + chart2W / 2} y2={chart2Y + chart2H} stroke="var(--color-canvas-grid)" strokeWidth={0.8} strokeDasharray="3 3" opacity={0.5} />

              {/* Chart Axes */}
              <line x1={chart2X} y1={chart2Y + chart2H - 24} x2={chart2X + chart2W} y2={chart2Y + chart2H - 24} stroke="var(--color-border)" strokeWidth={1.5} />
              <line x1={chart2X} y1={chart2Y} x2={chart2X} y2={chart2Y + chart2H - 24} stroke="var(--color-border)" strokeWidth={1.5} />

              {/* Linear Velocity Function Ray */}
              <path d={vPathD} fill="none" stroke="#38bdf8" strokeWidth={2.5} />

              {/* Time Cursor Vertical Hairline */}
              <line x1={curVCursorX} y1={chart2Y} x2={curVCursorX} y2={chart2Y + chart2H - 24} stroke="#BA8230" strokeWidth={1.2} strokeDasharray="2 2" opacity={0.85} />

              {/* Live Data Point on v(t) */}
              <circle cx={curVCursorX} cy={curVCursorY} r={4.5} fill="#38bdf8" stroke="var(--color-text)" strokeWidth={1.5} />

              {/* Chart Header & Equation */}
              <text x={chart2X + 10} y={chart2Y + 16} fill="var(--color-primary-text)" fontSize={9.5} fontFamily="Space Mono" fontWeight="bold">
                v(t) = v₀ + at (gradien = a)
              </text>
              <text x={chart2X + chart2W - 8} y={chart2Y + 16} textAnchor="end" fill="#38bdf8" fontSize={9.5} fontFamily="Space Mono" fontWeight="bold">
                v = {velocity.toFixed(2)} m/s
              </text>

              {/* Axis Ticks */}
              <text x={chart2X + 4} y={chart2Y + chart2H - 30} fill="var(--color-text-secondary)" fontSize={8.5} fontFamily="Space Mono">
                0 m/s
              </text>
              <text x={chart2X + 4} y={chart2Y + 28} fill="var(--color-text-secondary)" fontSize={8.5} fontFamily="Space Mono">
                {theorMaxV.toFixed(0)} m/s
              </text>
              <text x={chart2X + chart2W - 6} y={chart2Y + chart2H - 10} textAnchor="end" fill="var(--color-text-secondary)" fontSize={8.5} fontFamily="Space Mono">
                {maxChartT.toFixed(0)}s (waktu)
              </text>
            </g>
          </g>
        )}
      </svg>
    );
  };

  const learningExplanation = useMemo(() => {
    return getSimulationExplanation(canonicalSlug, spec.info?.title, spec.info?.description);
  }, [canonicalSlug, spec.info?.title, spec.info?.description]);

  return (
    <div className={`space-y-8 max-w-full overflow-x-hidden ${className}`}>
            {/* ── DESKTOP DOCKED INSTRUMENT CHASSIS (SCREEN >= 1024px) ── */}
      <div className="hidden lg:flex lg:flex-col gap-6 w-full">
        {/* ── 1. COMPACT INTRO CONTEXT (ABOVE CANVAS) ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-[var(--color-primary-text)] uppercase tracking-wider bg-[var(--color-primary-soft)] px-2.5 py-0.5 rounded-md border border-[var(--color-primary)]/20">
                {spec.info.discipline || 'LAB'} / {spec.slug?.toUpperCase() || 'SIM'}
              </span>
              <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                Laboratorium Komputasi Presisi 60 FPS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-3xl">
              {spec.info.description || 'Eksplorasi variabel eksperimen secara mandiri dan telaah formulasi sains secara empiris.'}
            </p>
          </div>
        </div>

        {/* ── 2. DOMINANT SUPER CANVAS VIEWPORT (FULL WIDTH, 540-620px HEIGHT) ── */}
        {/* Spatial Canvas Viewport */}
          <section
            aria-label="Kanvas Simulasi"
            className="spatial-canvas-viewport rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] overflow-hidden relative shadow-2xs min-h-[520px] lg:min-h-[580px] flex flex-col justify-between w-full"
          >
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-canvas-header)] text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-primary-text)] font-semibold shrink-0">
                  {spec.info.discipline || 'LAB'}
                </span>
                <span className="text-[var(--color-text-tertiary)] text-[10px]">/</span>
                <span className="font-heading font-bold text-xs text-[var(--color-text)] truncate max-w-[140px] sm:max-w-xs">
                  {spec.info.title}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Play / Pause Button */}
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer shadow-xs min-h-[32px] ${
                    runtimeState.isRunning
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
                  }`}
                  title={runtimeState.isRunning ? 'Jeda simulasi' : 'Jalankan simulasi'}
                >
                  {runtimeState.isRunning ? <IconPause size={12} /> : <IconPlay size={12} />}
                  <span>{runtimeState.isRunning ? 'Jeda' : 'Jalankan'}</span>
                </button>

                {/* Live Stopwatch */}
                <span
                  className="font-mono text-[10.5px] font-semibold px-2 py-1 rounded-sm bg-[var(--color-surface-subtle)] text-[var(--color-text)] border border-[var(--color-border-subtle)] tabular-nums min-h-[32px] flex items-center"
                  title="Waktu simulasi yang telah berlalu"
                >
                  ⏱ {runtimeState.time.toFixed(2)}s
                </span>

                {/* Live Domain Telemetry Badge */}
                {simulationDomain.isPhysics ? (
                  <span
                    className="font-mono text-[10.5px] font-bold px-2 py-1 rounded-sm bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] border border-[var(--color-primary)]/20 tabular-nums hidden sm:inline-flex min-h-[32px] items-center"
                    title="Posisi dan kecepatan balok real-time"
                  >
                    x: {runtimeState.dynamics.position.toFixed(2)}m · v: {runtimeState.dynamics.velocity.toFixed(1)} m/s
                  </span>
                ) : simulationDomain.isFunctionExplorer ? (
                  <span
                    className="font-mono text-[10.5px] font-bold px-2 py-1 rounded-sm bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] border border-[var(--color-primary)]/20 tabular-nums hidden sm:inline-flex min-h-[32px] items-center"
                    title="Persamaan kuadrat aktif"
                  >
                    f(x) = {params.a ?? 1}x² {Number(params.b ?? 0) >= 0 ? `+ ${params.b ?? 0}x` : `- ${Math.abs(Number(params.b ?? 0))}x`} {Number(params.c ?? 0) >= 0 ? `+ ${params.c ?? 0}` : `- ${Math.abs(Number(params.c ?? 0))}`}
                  </span>
                ) : simulationDomain.isAlgorithm ? (
                  <span
                    className="font-mono text-[10.5px] font-bold px-2 py-1 rounded-sm bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] border border-[var(--color-primary)]/20 tabular-nums hidden sm:inline-flex min-h-[32px] items-center"
                    title="Status jalannya algoritma"
                  >
                    {runtimeState.isRunning ? '▶ Sedang Berjalan' : '⏹ Siap Dijalankan'}
                  </span>
                ) : presentation.results[0] ? (
                  <span
                    className="font-mono text-[10.5px] font-bold px-2 py-1 rounded-sm bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] border border-[var(--color-primary)]/20 tabular-nums hidden sm:inline-flex min-h-[32px] items-center"
                    title={presentation.results[0].label}
                  >
                    {presentation.results[0].label}: {presentation.results[0].value}
                  </span>
                ) : null}

                {/* Newton Kinematics View Mode Selector (Split / Aparatus / Graphs) */}
                {(spec.slug?.includes('newton') || canonicalSlug?.includes('newton')) && (
                  <div className="hidden sm:inline-flex items-center rounded-md border border-[var(--color-border)] p-0.5 bg-[var(--color-surface-subtle)] mr-1" role="group" aria-label="Mode Tampilan Fisika">
                    <button
                      type="button"
                      onClick={() => setPhysicsViewMode('split')}
                      className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded-sm transition-colors ${
                        physicsViewMode === 'split'
                          ? 'bg-[var(--color-surface)] text-[var(--color-primary-text)] font-bold shadow-2xs'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                      }`}
                      title="Tampilan terbagi: Aparatus & Grafik x-t/v-t"
                    >
                      Split
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhysicsViewMode('apparatus')}
                      className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded-sm transition-colors ${
                        physicsViewMode === 'apparatus'
                          ? 'bg-[var(--color-surface)] text-[var(--color-primary-text)] font-bold shadow-2xs'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                      }`}
                      title="Fokus aparatus balok dan diagram gaya bebas (FBD)"
                    >
                      Aparatus FBD
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhysicsViewMode('graphs')}
                      className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded-sm transition-colors ${
                        physicsViewMode === 'graphs'
                          ? 'bg-[var(--color-surface)] text-[var(--color-primary-text)] font-bold shadow-2xs'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                      }`}
                      title="Fokus grafik kinematika x(t) dan v(t)"
                    >
                      Grafik x-t & v-t
                    </button>
                  </div>
                )}

                {/* Zoom Controls */}
                <div className="hidden sm:flex items-center gap-0.5 border-l border-[var(--color-border)] pl-1.5 ml-0.5">
                  <button
                    type="button"
                    onClick={() => setZoomScale((prev) => Math.max(0.75, Number((prev - 0.1).toFixed(1))))}
                    className="p-1 rounded-md hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
                    title="Perkecil zoom"
                  >
                    <IconZoomOut size={13} />
                  </button>
                  <span className="font-mono text-[10px] font-bold px-1 text-[var(--color-text)]">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomScale((prev) => Math.min(1.35, Number((prev + 0.1).toFixed(1))))}
                    className="p-1 rounded-md hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
                    title="Perbesar zoom"
                  >
                    <IconZoomIn size={13} />
                  </button>
                </div>

                {/* Compare Mode Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!compareMode) {
                      setCompareMode(true);
                      setStateA({
                        params: { ...params },
                        computed: { ...computed },
                        results: [...presentation.results],
                      });
                      setActiveDeckTab('insight');
                    } else {
                      setCompareMode(false);
                      setStateA(null);
                    }
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer font-medium min-h-[32px] border ${
                    compareMode
                      ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] border-[var(--color-primary)]/40 font-bold'
                      : 'hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] border-[var(--color-border-subtle)]'
                  }`}
                  title="Bandingkan dua kondisi simulator (State A vs State B)"
                >
                  <IconScale size={12} />
                  <span className="hidden md:inline">Bandingkan</span>
                </button>

                {/* Reset Button */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] text-xs transition-colors cursor-pointer font-medium min-h-[32px] border border-[var(--color-border-subtle)]"
                  title="Atur ulang nilai ke awal"
                >
                  <IconRotateCcw size={12} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Viewport Scale Container */}
            <div
              className="w-full flex-1 flex items-center justify-center p-3 sm:p-5 transition-transform duration-150 origin-center min-h-[440px] lg:min-h-[500px]"
              style={{ transform: `scale(${zoomScale})` }}
            >
              {renderUniversalViewport()}
            </div>
          </section>

        {/* ── 3. SUPPORTING CONTROLS & LIVE READOUTS CONSOLE (BELOW CANVAS) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ── LEFT RAIL: VARIABEL KONTROL (col-span-3) ── */}
        <aside
          aria-label="Panel Variabel Kontrol"
          className="lg:col-span-7 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4 shadow-2xs"
        >
          <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2.5">
            <div className="flex items-center gap-2">
              <IconSliders size={15} className="text-[var(--color-primary-text)]" />
              <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
                Variabel Kontrol
              </h2>
            </div>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] font-bold uppercase tracking-wider">
              Parameter Input
            </span>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {Object.entries(spec.parameters).map(([key, p]) => {
              const currentVal = params[key] ?? p.defaultVal ?? p.min;
              const step = p.step || 1;
              const stepDec = step.toString().includes('.') ? step.toString().split('.')[1].length : 0;
              const valDec = currentVal.toString().includes('.') ? currentVal.toString().split('.')[1].length : 0;
              const prec = Math.min(4, Math.max(stepDec, valDec));
              const handleDec = () => {
                handleUpdateParam(key, Math.max(p.min, Number((currentVal - step).toFixed(prec))));
              };
              const handleInc = () => {
                handleUpdateParam(key, Math.min(p.max, Number((currentVal + step).toFixed(prec))));
              };

              return (
                <div
                  key={key}
                  className="p-3 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] space-y-2.5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <span className="font-semibold text-xs text-[var(--color-text)] truncate block">
                        {p.label}
                      </span>
                      {p.description && (
                        <p className="text-[10px] text-[var(--color-text-secondary)] leading-tight truncate">
                          {p.description}
                        </p>
                      )}
                    </div>
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-sm bg-[var(--color-surface)] text-[var(--color-primary-text)] border border-[var(--color-border-subtle)] whitespace-nowrap tabular-nums shrink-0">
                      {formatNumber(currentVal, p.unit)}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleDec}
                        disabled={currentVal <= p.min}
                        className="w-7 h-7 rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center text-xs font-mono font-bold text-[var(--color-text)] disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0"
                        title={`Kurangi ${p.label}`}
                        aria-label={`Kurangi ${p.label}`}
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min={p.min}
                        max={p.max}
                        step={step}
                        value={currentVal}
                        aria-label={`Slider ${p.label || key}`}
                        onChange={(e) => handleUpdateParam(key, Number(e.target.value))}
                        className="flex-1 h-1.5 bg-[var(--color-surface)] rounded-full appearance-none cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={handleInc}
                        disabled={currentVal >= p.max}
                        className="w-7 h-7 rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center text-xs font-mono font-bold text-[var(--color-text)] disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0"
                        title={`Tambah ${p.label}`}
                        aria-label={`Tambah ${p.label}`}
                      >
                        +
                      </button>
                      <input
                        type="number"
                        step={step}
                        min={p.min}
                        max={p.max}
                        value={currentVal}
                        aria-label={`Nilai numerik ${p.label || key}`}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (!isNaN(v)) handleUpdateParam(key, Math.max(p.min, Math.min(p.max, v)));
                        }}
                        className="w-14 h-7 text-center font-mono text-[11px] font-bold bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] tabular-nums shrink-0"
                      />
                    </div>
                    <div className="flex justify-between text-[9.5px] font-mono text-[var(--color-text-secondary)]">
                      <span>{p.min} {p.unit || ''}</span>
                      <span>{p.max} {p.unit || ''}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
          {/* ── RIGHT RAIL: HASIL SIMULASI (col-span-3) ── */}
        <aside
          aria-label="Panel Hasil Simulasi"
          className="lg:col-span-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4 shadow-2xs"
        >
          <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2.5">
            <div className="flex items-center gap-2">
              <IconActivity size={15} className="text-[var(--color-secondary)]" />
              <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
                Hasil Simulasi
              </h2>
            </div>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] font-bold uppercase tracking-wider">
              Langsung
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {presentation.results.map((r, idx) => {
              const valStr = String(r.value ?? '');
              const isLong = valStr.length > 14 || valStr.includes('(') || valStr.includes(' ');
              const isTargetMetric = activeExp && r.label.toLowerCase().includes(activeExp.targetMetric.toLowerCase());

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-md border flex flex-col justify-between gap-1.5 transition-all ${
                    r.highlight
                      ? 'bg-[var(--color-primary-soft)]/20 border-[var(--color-secondary)] shadow-xs'
                      : isTargetMetric
                      ? 'bg-[var(--color-surface-subtle)] border-[var(--color-primary)]/40'
                      : 'bg-[var(--color-surface-subtle)] border-[var(--color-border-subtle)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5 min-w-0">
                    <span className="text-[11px] text-[var(--color-text-secondary)] font-medium leading-tight truncate">
                      {r.label}
                    </span>
                    {r.symbol && (
                      <span className="font-mono text-[9.5px] font-bold px-1.5 py-0.2 rounded-sm bg-[var(--color-surface)] text-[var(--color-primary-text)] border border-[var(--color-border-subtle)] shrink-0">
                        {r.symbol}
                      </span>
                    )}
                  </div>
                  <div
                    className={`font-mono font-bold text-[var(--color-text)] break-words ${
                      isLong
                        ? 'text-xs leading-snug tracking-tight'
                        : 'text-xl tabular-nums tracking-tight'
                    }`}
                  >
                    {r.value}
                  </div>
                  {isTargetMetric && (
                    <div className="text-[9.5px] font-mono text-[var(--color-primary-text)] flex items-center justify-between pt-0.5 border-t border-[var(--color-border-subtle)]">
                      <span>Target: {activeExp.targetValue}</span>
                      <span>Δ: {experimentEvaluation?.delta.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
        </div>

        
        {/* ── 4. DEDICATED LEARNING EXPLANATION (BELOW CANVAS & CONTROLS) ── */}
        <section
          aria-label="Penjelasan Konsep & Teori Pembelajaran"
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 space-y-7 shadow-2xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] border border-[var(--color-primary)]/20 flex items-center justify-center shrink-0">
                <IconBookOpen size={20} />
              </div>
              <div className="space-y-0.5">
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-primary-text)] block">
                  Penelaahan Teori &amp; Panduan Empiris
                </span>
                <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text)]">
                  Jelajah Konsep &amp; Pemahaman Laboratorium
                </h2>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-[var(--color-text-secondary)] px-3 py-1 rounded-full bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)]">
              Kurikulum Terkalibrasi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Section 1: Apa yang terjadi? */}
            <div className="space-y-2.5 p-4 rounded-xl bg-[var(--color-surface-subtle)]/60 border border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-2 text-xs font-heading font-bold text-[var(--color-primary-text)] uppercase tracking-wider">
                <span className="w-5 h-5 rounded-md bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] flex items-center justify-center font-mono text-[11px] font-bold">1</span>
                <span>Apa yang terjadi?</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--color-text)] leading-relaxed font-sans">
                {learningExplanation.whatHappens}
              </p>
            </div>

            {/* Section 2: Cara kerja */}
            <div className="space-y-2.5 p-4 rounded-xl bg-[var(--color-surface-subtle)]/60 border border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-2 text-xs font-heading font-bold text-[var(--color-primary-text)] uppercase tracking-wider">
                <span className="w-5 h-5 rounded-md bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] flex items-center justify-center font-mono text-[11px] font-bold">2</span>
                <span>Cara kerja &amp; Mekanisme Fisis</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--color-text)] leading-relaxed font-sans">
                {learningExplanation.howItWorks}
              </p>
            </div>
          </div>

          {/* Section 3: Coba dan perhatikan */}
          {learningExplanation.tryThis && learningExplanation.tryThis.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-2 text-xs font-heading font-bold text-[var(--color-secondary)] uppercase tracking-wider">
                <span className="w-5 h-5 rounded-md bg-[var(--color-secondary-soft)] text-[var(--color-secondary)] flex items-center justify-center font-mono text-[11px] font-bold">3</span>
                <span>Coba dan perhatikan saat bereksperimen</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {learningExplanation.tryThis.map((hint, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text)] leading-relaxed flex items-start gap-2.5">
                    <span className="font-mono text-[10px] font-bold text-[var(--color-secondary)] px-1.5 py-0.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border-subtle)] shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-[12px]">{hint}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Konsep penting & Persamaan */}
          {learningExplanation.keyConcepts && learningExplanation.keyConcepts.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-2 text-xs font-heading font-bold text-[var(--color-accent)] uppercase tracking-wider">
                <span className="w-5 h-5 rounded-md bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center font-mono text-[11px] font-bold">4</span>
                <span>Konsep penting &amp; Formulasi Matematis</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {learningExplanation.keyConcepts.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] space-y-2">
                    <h3 className="font-heading text-xs font-bold text-[var(--color-text)]">
                      {item.term}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                      {item.definition}
                    </p>
                    {item.formula && (
                      <div className="p-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-subtle)] overflow-x-auto text-xs">
                        <MathView math={item.formula} displayMode={true} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>


        {/* ── 5. DEK ANALISIS & TUTOR LABORATORIUM ── */}
        {/* Docked Analytical Deck Tabs */}
          <section
            aria-label="Dek Analisis & Tutor Laboratorium"
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-2xs"
          >
            {/* Tab Header Bar */}
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-subtle)] px-2 pt-1.5 overflow-x-auto no-scrollbar gap-1">
              <div className="flex items-center gap-1 min-w-0">
                <button
                  type="button"
                  onClick={() => setActiveDeckTab('challenge')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-md border-t border-l border-r transition-colors cursor-pointer shrink-0 ${
                    activeDeckTab === 'challenge'
                      ? 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] font-bold'
                      : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                  }`}
                >
                  <IconTarget size={13} className={activeDeckTab === 'challenge' ? 'text-[var(--color-primary-text)]' : ''} />
                  <span>Tantangan</span>
                  {experimentEvaluation?.isSuccess && (
                    <IconCheck size={12} className="text-[var(--color-secondary)] shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDeckTab('insight')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-md border-t border-l border-r transition-colors cursor-pointer shrink-0 ${
                    activeDeckTab === 'insight'
                      ? 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] font-bold'
                      : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                  }`}
                >
                  <IconInfo size={13} className={activeDeckTab === 'insight' ? 'text-[var(--color-primary-text)]' : ''} />
                  <span>Sebab-Akibat</span>
                  {compareMode && (
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded-sm bg-amber-500/20 text-amber-500 font-bold">
                      Bandingkan
                    </span>
                  )}
                </button>

                {presentation.calculations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveDeckTab('steps')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-md border-t border-l border-r transition-colors cursor-pointer shrink-0 ${
                      activeDeckTab === 'steps'
                        ? 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] font-bold'
                        : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    <IconBookOpen size={13} className={activeDeckTab === 'steps' ? 'text-[var(--color-primary-text)]' : ''} />
                    <span>Langkah Rumus</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveDeckTab('tutor')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-md border-t border-l border-r transition-colors cursor-pointer shrink-0 ${
                    activeDeckTab === 'tutor'
                      ? 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] font-bold'
                      : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                  }`}
                >
                  <IconSparkles size={14} className="text-[var(--color-secondary)]" />
                  <span>Tanya AI GEN LABS</span>
                  <AiUsageBadge variant="tag" refreshTrigger={quotaRefreshKey} onUsageLoaded={setAiUsage} />
                </button>
              </div>

              {activeDeckTab === 'tutor' && (
                <div className="pb-1">
                  <AiUsageBadge variant="pill" refreshTrigger={quotaRefreshKey} onUsageLoaded={setAiUsage} />
                </div>
              )}
            </div>

            {/* Tab Body */}
            <div className="p-4 sm:p-5">
              {/* TAB 1: TANTANGAN EKSPERIMEN */}
              {activeDeckTab === 'challenge' && (
                <div className="space-y-4">
                  {/* Multiple experiment selector */}
                  {spec.experiments.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                      {spec.experiments.map((exp, idx) => (
                        <button
                          key={exp.id || idx}
                          type="button"
                          onClick={() => {
                            setActiveExperimentIdx(idx);
                            setLastAttempt(null);
                          }}
                          className={`px-2.5 py-1 text-xs rounded-md font-mono font-medium transition-colors cursor-pointer border ${
                            activeExperimentIdx === idx
                              ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] border-[var(--color-primary)] font-bold'
                              : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:text-[var(--color-text)]'
                          }`}
                        >
                          Tantangan {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeExp ? (
                    <div className="space-y-4">
                      <div className="space-y-1 border-b border-[var(--color-border-subtle)] pb-2.5">
                        <h3 className="font-heading text-sm font-bold text-[var(--color-text)]">
                          {activeExp.title}
                        </h3>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                          {activeExp.objective}
                        </p>
                      </div>

                      {/* Target vs Live Telemetry Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="p-3 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)]">
                          <div
                            className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-secondary)] truncate"
                          >
                            Sasaran Target
                          </div>
                          <div className="font-mono text-sm sm:text-base font-bold text-[var(--color-text)] truncate tabular-nums pt-0.5">
                            {activeExp.targetValue} {activeExp.unit || ''}
                          </div>
                          <div
                            className="text-[9px] font-mono text-[var(--color-text-tertiary)] pt-0.5 truncate"
                            title={`Toleransi: ±${activeExp.tolerance ?? 0.05}`}
                          >
                            {activeExp.targetMetric === 'acceleration'
                              ? 'Percepatan'
                              : presentation.results.find((r) => r.key === activeExp.targetMetric || r.symbol === activeExp.targetMetric)?.label ||
                                spec.calculations[activeExp.targetMetric]?.label ||
                                spec.parameters[activeExp.targetMetric]?.label ||
                                activeExp.targetMetric}{' '}
                            (±{activeExp.tolerance ?? 0.05})
                          </div>
                        </div>

                        <div className="p-3 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)]">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-secondary)] truncate">
                            Nilai Saat Ini
                          </div>
                          <div className="font-mono text-sm sm:text-base font-bold text-[var(--color-primary-text)] truncate tabular-nums pt-0.5">
                            {formatCleanNumber(experimentEvaluation?.currentVal ?? 0)} {activeExp.unit || ''}
                          </div>
                          <div className="text-[9px] font-mono text-[var(--color-text-tertiary)] pt-0.5">
                            {simulationDomain.isAlgorithm ? 'Komputasi langsung' : simulationDomain.isMathOrEconomics ? 'Perhitungan langsung' : 'Simulasi langsung'}
                          </div>
                        </div>

                        <div className="p-3 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)]">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-secondary)] truncate">
                            Selisih (Δ)
                          </div>
                          <div className="font-mono text-sm sm:text-base font-bold text-[var(--color-text)] truncate tabular-nums pt-0.5">
                            {experimentEvaluation?.delta.toFixed(3) ?? '0.000'} {activeExp.unit || ''}
                          </div>
                          <div className="text-[9px] font-mono text-[var(--color-text-tertiary)] pt-0.5">
                            |Aktual - Target|
                          </div>
                        </div>

                        <div className="p-3 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] flex flex-col justify-between">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-secondary)] truncate">
                            Status Kondisi
                          </div>
                          <div className="pt-0.5">
                            {experimentEvaluation?.isSuccess ? (
                              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[var(--color-primary-text)]">
                                <IconCheckCircle size={13} />
                                <span>Sesuai Target</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-amber-500">
                                <IconAlertCircle size={13} />
                                <span>Belum Sesuai</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[9px] font-mono text-[var(--color-text-tertiary)] pt-0.5">
                            {experimentEvaluation?.isSuccess ? 'Target tercapai' : 'Geser parameter input'}
                          </div>
                        </div>
                      </div>

                      {/* Prediction Mode */}
                      <div className="p-3.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] space-y-2">
                        <label className="block text-xs font-semibold text-[var(--color-text)]">
                          Dugaan Awalmu (Opsional):
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'Perlu menaikkan nilai kontrol',
                            'Perlu menurunkan nilai kontrol',
                            'Kondisi saat ini sudah optimal',
                          ].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setPrediction(preset)}
                              className={`px-2.5 py-1 text-xs rounded-sm border transition-colors cursor-pointer ${
                                prediction === preset
                                  ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] border-[var(--color-primary)] font-semibold'
                                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:text-[var(--color-text)]'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          aria-label="Perkiraan atau dugaan nilai hasil eksperimen"
                          value={prediction}
                          onChange={(e) => setPrediction(e.target.value)}
                          placeholder="Tulis perkiraan atau dugaanmu sebelum menguji..."
                          className="w-full px-3 py-2 text-xs rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors"
                        />
                      </div>

                      {/* Action Button */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          Hasil dinilai langsung berdasarkan rumus dan kondisi simulasi.
                        </span>
                        <button
                          type="button"
                          onClick={handleRunExperiment}
                          className="px-4 py-2 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs shrink-0 min-h-[44px]"
                        >
                          <IconCheckCircle size={14} />
                          <span>Uji Jawaban Percobaan</span>
                        </button>
                      </div>

                      {/* Attempt Feedback Card */}
                      {lastAttempt && (
                        <div
                          className={`p-3.5 sm:p-4 rounded-md border space-y-2.5 transition-all ${
                            lastAttempt.passed
                              ? 'bg-[var(--color-primary-soft)]/25 border-[var(--color-primary)]/40'
                              : 'bg-amber-500/10 border-amber-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border-subtle)] pb-2">
                            <div className="flex items-center gap-2">
                              {lastAttempt.passed ? (
                                <span className="font-mono text-xs font-bold text-[var(--color-primary-text)] flex items-center gap-1.5">
                                  <IconCheckCircle size={15} className="text-[var(--color-secondary)]" />
                                  <span>Target Berhasil Dicapai</span>
                                </span>
                              ) : (
                                <span className="font-mono text-xs font-bold text-amber-500 flex items-center gap-1.5">
                                  <IconAlertCircle size={15} className="text-amber-500" />
                                  <span>Belum Mencapai Target</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-[var(--color-text-tertiary)]">
                              Uji: {lastAttempt.timestamp}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                            <div className="p-2 rounded-md bg-[var(--color-surface)]/60">
                              <span className="text-[9px] text-[var(--color-text-secondary)] block">Target</span>
                              <span className="font-bold text-[var(--color-text)]">
                                {lastAttempt.targetVal} {lastAttempt.unit}
                              </span>
                            </div>
                            <div className="p-2 rounded-md bg-[var(--color-surface)]/60">
                              <span className="text-[9px] text-[var(--color-text-secondary)] block">Hasil Saat Ini</span>
                              <span className="font-bold text-[var(--color-text)]">
                                {formatCleanNumber(lastAttempt.currentVal)} {lastAttempt.unit}
                              </span>
                            </div>
                            <div className="p-2 rounded-md bg-[var(--color-surface)]/60">
                              <span className="text-[9px] text-[var(--color-text-secondary)] block">Selisih (Δ)</span>
                              <span className="font-bold text-[var(--color-text)]">
                                {lastAttempt.delta.toFixed(3)} {lastAttempt.unit}
                              </span>
                            </div>
                          </div>

                          {lastAttempt.prediction && (
                            <div className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface)]/60 p-2 rounded-md">
                              <span className="font-semibold text-[var(--color-text)]">Prediksi Anda:</span> "{lastAttempt.prediction}"
                            </div>
                          )}

                          <p className="text-xs text-[var(--color-text)] leading-relaxed pt-0.5">
                            {lastAttempt.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--color-text-secondary)]">Tidak ada tantangan aktif.</p>
                  )}
                </div>
              )}

              {/* TAB 2: WAWASAN KAUSALITAS & COMPARE MODE */}
              {activeDeckTab === 'insight' && (
                <div className="space-y-4">
                  {presentation.insight && (
                    <div className="p-4 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary-text)] uppercase tracking-wider font-mono">
                        <IconInfo size={14} />
                        <span>Hubungan Sebab-Akibat (Kausalitas)</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--color-text)] leading-relaxed">
                        {presentation.insight.summary} {presentation.insight.causeAndEffect}
                      </p>
                      {presentation.insight.whatIf && (
                        <p className="text-xs text-[var(--color-text-secondary)] italic pt-2 border-t border-[var(--color-border-subtle)]">
                          <span className="font-semibold not-italic text-[var(--color-primary-text)]">Eksplorasi Lanjutan:</span> {presentation.insight.whatIf}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Compare Mode Table if active */}
                  {compareMode && (
                    <div className="rounded-md border border-[var(--color-primary)]/40 bg-[var(--color-surface)] p-3.5 space-y-3">
                      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2">
                        <div className="flex items-center gap-1.5 font-heading text-xs font-bold text-[var(--color-text)]">
                          <IconScale size={14} className="text-[var(--color-primary-text)]" />
                          <span>Perbandingan Kondisi (Kondisi A vs Kondisi B Aktif)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setStateA({
                              params: { ...params },
                              computed: { ...computed },
                              results: [...presentation.results],
                            });
                          }}
                          className="px-2 py-0.5 text-[11px] rounded-md bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] cursor-pointer"
                        >
                          Kunci Ulang Kondisi A
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] space-y-1.5">
                          <div className="font-mono text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                            Variabel Kontrol
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-[11px] font-mono">
                              <thead>
                                <tr className="border-b border-[var(--color-border-subtle)] text-[9.5px] text-[var(--color-text-secondary)]">
                                  <th className="py-1">Param</th>
                                  <th className="py-1 text-right">A</th>
                                  <th className="py-1 text-right">B (Aktif)</th>
                                  <th className="py-1 text-right">Δ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                                {Object.entries(spec.parameters).map(([k, p]) => {
                                  const valA = stateA?.params[k] ?? p.defaultVal ?? 0;
                                  const valB = params[k] ?? p.defaultVal ?? 0;
                                  const diff = Number((valB - valA).toFixed(2));
                                  return (
                                    <tr key={k}>
                                      <td className="py-1 font-sans text-[var(--color-text)]">{p.label}</td>
                                      <td className="py-1 text-right text-[var(--color-text-secondary)]">{valA}</td>
                                      <td className="py-1 text-right font-bold text-[var(--color-primary-text)]">{valB}</td>
                                      <td className={`py-1 text-right font-semibold ${diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-amber-500' : 'text-[var(--color-text-tertiary)]'}`}>
                                        {diff > 0 ? `+${diff}` : diff}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] space-y-1.5">
                          <div className="font-mono text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                            Hasil Simulasi
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-[11px] font-mono">
                              <thead>
                                <tr className="border-b border-[var(--color-border-subtle)] text-[9.5px] text-[var(--color-text-secondary)]">
                                  <th className="py-1">Output</th>
                                  <th className="py-1 text-right">A</th>
                                  <th className="py-1 text-right">B (Aktif)</th>
                                  <th className="py-1 text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                                {presentation.results.map((rB, idx) => {
                                  const rA = stateA?.results[idx];
                                  const valA = rA?.value ?? '-';
                                  const valB = rB.value;
                                  const isSame = String(valA) === String(valB);
                                  return (
                                    <tr key={idx}>
                                      <td className="py-1 font-sans text-[var(--color-text)]">{rB.label}</td>
                                      <td className="py-1 text-right text-[var(--color-text-secondary)]">{valA}</td>
                                      <td className="py-1 text-right font-bold text-[var(--color-text)]">{valB}</td>
                                      <td className="py-1 text-right text-[9.5px]">
                                        {isSame ? (
                                          <span className="text-[var(--color-text-tertiary)]">Identik</span>
                                        ) : (
                                          <span className="text-[var(--color-primary-text)] font-semibold">Berubah</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: LANGKAH PERHITUNGAN */}
              {activeDeckTab === 'steps' && presentation.calculations.length > 0 && (
                <div className="space-y-3">
                  {presentation.calculations.map((c, idx) => (
                    <div key={idx} className="p-3.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] space-y-2">
                      <h3 className="font-heading text-xs font-bold text-[var(--color-text)]">
                        {c.title}
                      </h3>
                      {c.description && (
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                          {c.description}
                        </p>
                      )}
                      <div className="p-2.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border-subtle)] overflow-x-auto">
                        <MathView math={c.latexFormula} displayMode={true} />
                      </div>
                      {c.latexSubstitution && (
                        <div className="p-2.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border-subtle)] overflow-x-auto">
                          <MathView math={c.latexSubstitution} displayMode={true} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: AI GEN LABS TUTOR */}
              {activeDeckTab === 'tutor' && (
                <div className="flex flex-col space-y-3">
                  {/* Feedback on applied parameters */}
                  {appliedParamFeedback && (
                    <div className="p-2.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center gap-2">
                      <IconCheck size={14} />
                      <span>{appliedParamFeedback}</span>
                    </div>
                  )}

                  {/* Conversation thread: Expansive height, scrollable */}
                  <div className="space-y-3 min-h-[360px] max-h-[520px] overflow-y-auto pr-1.5 p-3 rounded-lg bg-[var(--color-surface-subtle)]/40 border border-[var(--color-border-subtle)]">
                    {tutorMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg text-xs leading-relaxed space-y-2 ${
                          msg.role === 'user'
                            ? 'bg-[var(--color-primary)] text-white ml-auto max-w-[85%]'
                            : 'bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text)] mr-auto max-w-[95%] shadow-2xs'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        ) : (
                          <FormattedMessage content={msg.content} />
                        )}

                        {/* Direct manipulation: Apply Suggested Parameters */}
                        {msg.suggestedParams && (
                          <div className="mt-2 pt-2 border-t border-[var(--color-border-subtle)] flex flex-wrap items-center justify-between gap-2">
                            <div className="text-[10px] font-mono text-[var(--color-primary-text)] font-semibold flex items-center gap-1">
                              <IconZap size={12} className="text-[var(--color-secondary)]" />
                              <span>Saran Parameter:</span>
                              <span className="text-[var(--color-text)]">
                                {Object.entries(msg.suggestedParams).map(([k, v]) => `${spec.parameters[k]?.label || k}: ${v}`).join(', ')}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleApplySuggestedParams(msg.suggestedParams!)}
                              className="px-2.5 py-1 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            >
                              <IconCheck size={12} />
                              <span>Terapkan Parameter ke Simulasi</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {isAsking && (
                      <div className="flex justify-start pt-1">
                        <AiThinkingState variant="inline" />
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Quota Exceeded Alert Banner */}
                  {aiUsage && aiUsage.remaining <= 0 && (
                    <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-500">
                      <IconAlertCircle size={15} className="shrink-0" />
                      <span>Kuota AI Tutor hari ini sudah habis. Kamu bisa bertanya lagi setelah pukul 00.00 WIB.</span>
                    </div>
                  )}

                  {/* Contextual quick prompts: Positioned directly above input */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {quickQuestions.map((qText) => (
                      <button
                        key={qText}
                        type="button"
                        disabled={isAsking || (aiUsage !== null && aiUsage.remaining <= 0)}
                        onClick={() => handleAskTutor(qText)}
                        className="text-xs text-left px-2.5 py-1 rounded-sm bg-[var(--color-surface-subtle)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary-text)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {qText}
                      </button>
                    ))}
                  </div>

                  {/* Question input: Placed firmly at the bottom of the chat column */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAskTutor();
                    }}
                    className="flex gap-2 min-w-0 pt-0.5"
                  >
                    <input
                      type="text"
                      disabled={isAsking || (aiUsage !== null && aiUsage.remaining <= 0)}
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      placeholder={
                        aiUsage && aiUsage.remaining <= 0
                          ? 'Kuota AI Tutor hari ini sudah habis (reset 00.00 WIB)'
                          : 'Tanyakan rumus, sebab-akibat, atau rekomendasi parameter...'
                      }
                      className="flex-1 min-w-0 px-3 py-2 text-xs bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <button
                      type="submit"
                      disabled={!aiQuestion.trim() || isAsking || (aiUsage !== null && aiUsage.remaining <= 0)}
                      className="px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-semibold rounded-md hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5"
                    >
                      <IconSend size={12} />
                      <span>{isAsking ? 'Memproses...' : 'Tanya'}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </section>
      </div>

      {/* ── MOBILE & TABLET LAYOUT (SCREEN < 1024px) ── */}
      <div className={`block lg:hidden space-y-4 ${embedded ? 'pb-4' : 'pb-20'}`}>
        {/* Pinned Spatial Canvas Viewport */}
        <section
          aria-label="Kanvas Simulasi Mobile"
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] overflow-hidden relative shadow-none flex flex-col h-[58svh] min-h-[440px] max-h-[620px]"
        >
          <div className="flex items-center justify-between p-2.5 sm:p-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-canvas-header)] text-xs">
            <span className="font-heading font-bold text-xs sm:text-sm text-[var(--color-text)] truncate max-w-[180px] sm:max-w-[240px]">
              {spec.info.title}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold px-2 py-1 rounded bg-[var(--color-surface-subtle)] text-[var(--color-text)] border border-[var(--color-border-subtle)] tabular-nums">
                ⏱ {runtimeState.time.toFixed(1)}s
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="min-w-[40px] min-h-[40px] p-2 rounded-lg text-xs font-bold transition-all cursor-pointer bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] flex items-center justify-center"
                title="Reset Simulasi"
                aria-label="Reset Simulasi"
              >
                <IconRotateCcw size={15} />
              </button>
              <button
                type="button"
                onClick={handleTogglePlay}
                className={`min-w-[44px] min-h-[44px] p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  runtimeState.isRunning ? 'bg-amber-500 text-white' : 'bg-[var(--color-primary)] text-white'
                }`}
                title={runtimeState.isRunning ? 'Jeda' : 'Jalankan'}
                aria-label={runtimeState.isRunning ? 'Jeda Simulasi' : 'Jalankan Simulasi'}
              >
                {runtimeState.isRunning ? <IconPause size={16} /> : <IconPlay size={16} />}
              </button>
            </div>
          </div>

          {(spec.slug?.includes('newton') || canonicalSlug?.includes('newton')) && (
            <div className="flex items-center justify-center gap-1.5 p-1.5 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)] shrink-0" role="group" aria-label="Mode Tampilan Fisika">
              <button
                type="button"
                onClick={() => setPhysicsViewMode('split')}
                className={`min-h-[40px] px-3.5 py-2 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                  physicsViewMode === 'split'
                    ? 'bg-[var(--color-primary)] text-white font-bold'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                Split
              </button>
              <button
                type="button"
                onClick={() => setPhysicsViewMode('apparatus')}
                className={`min-h-[40px] px-3.5 py-2 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                  physicsViewMode === 'apparatus'
                    ? 'bg-[var(--color-primary)] text-white font-bold'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                Aparatus FBD
              </button>
              <button
                type="button"
                onClick={() => setPhysicsViewMode('graphs')}
                className={`min-h-[40px] px-3.5 py-2 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                  physicsViewMode === 'graphs'
                    ? 'bg-[var(--color-primary)] text-white font-bold'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                Grafik x-t & v-t
              </button>
            </div>
          )}

          <div className="w-full flex-1 min-h-0 flex items-center justify-center p-1 sm:p-2 bg-[var(--color-canvas)] relative overflow-hidden">
            {renderUniversalViewport(true)}
          </div>
        </section>

        {/* Mobile Segmented Navigation Tabs */}
        <div className="w-full max-w-full min-w-0 flex items-center border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)] rounded-md p-1 overflow-x-auto no-scrollbar gap-1">
          {[
            { id: 'variables', label: 'Parameter', icon: IconSliders },
            { id: 'telemetry', label: simulationDomain.isAlgorithm ? 'Komputasi' : simulationDomain.isMathOrEconomics ? 'Perhitungan' : 'Pengukuran', icon: IconActivity },
            { id: 'explanation', label: 'Penjelasan', icon: IconGraduationCap },
            { id: 'challenge', label: 'Tantangan', icon: IconTarget },
            { id: 'tutor', label: 'Tutor', icon: IconMessageSquare },
            { id: 'insight', label: 'Sebab-Akibat', icon: IconInfo },
            ...(presentation.calculations.length > 0 ? [{ id: 'steps', label: 'Rumus', icon: IconBookOpen }] : []),
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = mobileNavTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMobileNavTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-bold'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
                {tab.id === 'tutor' && (
                  <AiUsageBadge variant="tag" refreshTrigger={quotaRefreshKey} onUsageLoaded={setAiUsage} />
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Active Tab Content */}
        <div className="p-1">
          {mobileNavTab === 'explanation' && (
            <div className="space-y-4 p-2">
              <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
                <span className="font-mono text-[10px] font-bold text-[var(--color-primary-text)] uppercase tracking-wider block">1. Apa yang terjadi?</span>
                <p className="text-xs text-[var(--color-text)] leading-relaxed">{learningExplanation.whatHappens}</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
                <span className="font-mono text-[10px] font-bold text-[var(--color-primary-text)] uppercase tracking-wider block">2. Cara kerja</span>
                <p className="text-xs text-[var(--color-text)] leading-relaxed">{learningExplanation.howItWorks}</p>
              </div>
              {learningExplanation.tryThis && (
                <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
                  <span className="font-mono text-[10px] font-bold text-[var(--color-secondary)] uppercase tracking-wider block">3. Coba dan perhatikan</span>
                  <div className="space-y-2">
                    {learningExplanation.tryThis.map((hint, i) => (
                      <div key={i} className="text-xs text-[var(--color-text)] flex items-start gap-2">
                        <span className="font-mono text-[10px] font-bold text-[var(--color-secondary)] px-1.5 py-0.5 rounded bg-[var(--color-surface-subtle)] shrink-0">{i + 1}</span>
                        <span>{hint}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {learningExplanation.keyConcepts && (
                <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
                  <span className="font-mono text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-wider block">4. Konsep penting</span>
                  <div className="space-y-2">
                    {learningExplanation.keyConcepts.map((item, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-[var(--color-surface-subtle)] space-y-1">
                        <strong className="text-xs text-[var(--color-text)] block">{item.term}</strong>
                        <p className="text-[11px] text-[var(--color-text-secondary)]">{item.definition}</p>
                        {item.formula && (
                          <div className="pt-1 text-xs overflow-x-auto">
                            <MathView math={item.formula} displayMode={true} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {mobileNavTab === 'variables' && (
            <div className="space-y-3">
              {Object.entries(spec.parameters).map(([key, p]) => {
                const currentVal = params[key] ?? p.defaultVal ?? p.min;
                const step = p.step || 1;
                const stepDec = step.toString().includes('.') ? step.toString().split('.')[1].length : 0;
                const valDec = currentVal.toString().includes('.') ? currentVal.toString().split('.')[1].length : 0;
                const prec = Math.min(4, Math.max(stepDec, valDec));
                return (
                  <div key={key} className="p-3 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[var(--color-text)]">{p.label}</span>
                      <span className="font-mono font-bold text-xs text-[var(--color-primary-text)]">{formatNumber(currentVal, p.unit)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateParam(key, Math.max(p.min, Number((currentVal - step).toFixed(prec))))}
                        className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] font-mono font-bold text-sm flex items-center justify-center cursor-pointer transition-colors hover:border-[var(--color-primary)] active:bg-[var(--color-primary-soft)]"
                        aria-label={`Kurangi ${p.label}`}
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min={p.min}
                        max={p.max}
                        step={step}
                        value={currentVal}
                        aria-label={`Slider ${p.label || key}`}
                        onChange={(e) => handleUpdateParam(key, Number(e.target.value))}
                        className="flex-1 h-3 bg-[var(--color-surface-subtle)] appearance-none cursor-pointer rounded-lg accent-[var(--color-primary)]"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateParam(key, Math.min(p.max, Number((currentVal + step).toFixed(prec))))}
                        className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] font-mono font-bold text-sm flex items-center justify-center cursor-pointer transition-colors hover:border-[var(--color-primary)] active:bg-[var(--color-primary-soft)]"
                        aria-label={`Tambah ${p.label}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {mobileNavTab === 'telemetry' && (
            <div className="grid grid-cols-2 gap-2">
              {presentation.results.map((r, idx) => (
                <div key={idx} className="p-3 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
                  <span className="text-[10px] text-[var(--color-text-secondary)] block truncate">{r.label}</span>
                  <div className="font-mono font-bold text-base text-[var(--color-text)] tabular-nums">{r.value}</div>
                </div>
              ))}
            </div>
          )}

          {mobileNavTab === 'challenge' && activeExp && (
            <div className="space-y-3 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <h3 className="font-heading text-xs font-bold text-[var(--color-text)]">{activeExp.title}</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">{activeExp.objective}</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 bg-[var(--color-surface-subtle)] rounded-md">
                  <span className="text-[9px] text-[var(--color-text-secondary)] block">Target</span>
                  <span className="font-bold">{activeExp.targetValue} {activeExp.unit}</span>
                </div>
                <div className="p-2 bg-[var(--color-surface-subtle)] rounded-md">
                  <span className="text-[9px] text-[var(--color-text-secondary)] block">Aktual</span>
                  <span className="font-bold text-[var(--color-primary-text)]">{formatCleanNumber(experimentEvaluation?.currentVal ?? 0)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRunExperiment}
                className="w-full py-2.5 rounded-md bg-[var(--color-primary)] text-white font-bold text-xs text-center min-h-[44px]"
              >
                Uji &amp; Simpan Eksperimen
              </button>
              {lastAttempt && (
                <div className="p-3 rounded-md bg-[var(--color-surface-subtle)] text-xs space-y-1">
                  <div className="font-bold">{lastAttempt.passed ? '✓ Berhasil' : 'Belum Tercapai'}</div>
                  <p>{lastAttempt.explanation}</p>
                </div>
              )}
            </div>
          )}

          {mobileNavTab === 'tutor' && (
            <div className="flex flex-col space-y-3 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              {appliedParamFeedback && (
                <div className="p-2 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-mono">{appliedParamFeedback}</div>
              )}

              {/* Mobile message list on top with generous height */}
              <div className="space-y-2 min-h-[280px] max-h-[420px] overflow-y-auto p-2 rounded-md bg-[var(--color-surface-subtle)]/40 border border-[var(--color-border-subtle)]">
                {tutorMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-md text-xs space-y-1 ${
                      m.role === 'user'
                        ? 'bg-[var(--color-primary)] text-white ml-auto max-w-[88%]'
                        : 'bg-[var(--color-surface)] text-[var(--color-text)] mr-auto max-w-[95%] border border-[var(--color-border-subtle)]'
                    }`}
                  >
                    <FormattedMessage content={m.content} />
                    {m.suggestedParams && (
                      <button
                        type="button"
                        onClick={() => handleApplySuggestedParams(m.suggestedParams!)}
                        className="mt-1 px-2.5 py-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-[10px] font-mono font-bold rounded-md inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <IconZap size={11} className="shrink-0" />
                        <span>Terapkan Parameter</span>
                      </button>
                    )}
                  </div>
                ))}
                {isAsking && (
                  <div className="pt-1">
                    <AiThinkingState variant="inline" />
                  </div>
                )}
                <div ref={mobileChatBottomRef} />
              </div>

              {/* Quota Exceeded Alert Banner */}
              {aiUsage && aiUsage.remaining <= 0 && (
                <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-500">
                  <IconAlertCircle size={14} className="shrink-0" />
                  <span>Kuota AI Tutor hari ini sudah habis. Kamu bisa bertanya lagi setelah pukul 00.00 WIB.</span>
                </div>
              )}

              {/* Quick prompts */}
              <div className="flex flex-wrap gap-1 pt-1">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={isAsking || (aiUsage !== null && aiUsage.remaining <= 0)}
                    onClick={() => handleAskTutor(q)}
                    className="text-[11px] p-1.5 rounded-sm bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] text-left disabled:opacity-40"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input form at bottom */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskTutor();
                }}
                className="flex gap-2 pt-0.5"
              >
                <input
                  type="text"
                  disabled={isAsking || (aiUsage !== null && aiUsage.remaining <= 0)}
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder={
                    aiUsage && aiUsage.remaining <= 0
                      ? 'Kuota habis (reset 00.00 WIB)'
                      : 'Tanya AI Tutor...'
                  }
                  className="flex-1 px-2.5 py-1.5 text-xs bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-md disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isAsking || !aiQuestion.trim() || (aiUsage !== null && aiUsage.remaining <= 0)}
                  className="px-3 py-1.5 bg-[var(--color-primary)] text-white text-xs font-bold rounded-md disabled:opacity-40 min-h-[36px]"
                >
                  Tanya
                </button>
              </form>
            </div>
          )}

          {mobileNavTab === 'insight' && presentation.insight && (
            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2 text-xs">
              <h3 className="font-heading font-bold text-[var(--color-primary-text)]">Hubungan Kausalitas</h3>
              <p>{presentation.insight.summary} {presentation.insight.causeAndEffect}</p>
            </div>
          )}

          {mobileNavTab === 'steps' && presentation.calculations.length > 0 && (
            <div className="space-y-2">
              {presentation.calculations.map((c, i) => (
                <div key={i} className="p-3 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-xs space-y-1 overflow-x-auto">
                  <div className="font-bold">{c.title}</div>
                  <MathView math={c.latexFormula} displayMode={true} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Mobile Bottom Transport Control (Rendered in standalone simulation workspaces; omitted when embedded in preview cards to prevent collision) */}
        {!embedded && (
          <aside
            aria-label="Kontrol Simulasi Ponsel"
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] px-4 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom,0px))] flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                className={`flex items-center justify-center gap-2 min-h-[44px] min-w-[100px] px-4 py-2 rounded-xl text-xs font-heading font-bold text-white transition-all cursor-pointer active:scale-95 shadow-xs ${
                  runtimeState.isRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-[#347762] hover:bg-[#3E8E75]'
                }`}
                title={runtimeState.isRunning ? 'Jeda simulasi' : 'Jalankan simulasi'}
              >
                {runtimeState.isRunning ? <IconPause size={15} /> : <IconPlay size={15} />}
                <span>{runtimeState.isRunning ? 'Jeda' : 'Jalankan'}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[#4B8F8C]/40 transition-colors cursor-pointer active:scale-95"
                title="Reset simulasi ke kondisi awal"
                aria-label="Reset simulasi"
              >
                <IconRotateCcw size={16} />
              </button>
            </div>
            <div className="font-mono text-xs font-bold text-[var(--color-text)] shrink-0 bg-[var(--color-canvas)] px-2.5 py-1.5 rounded-lg border border-[var(--color-border-subtle)] truncate max-w-[150px] sm:max-w-none text-right">
              ⏱ {runtimeState.time.toFixed(1)}s{simulationDomain.isPhysics ? ` · ${runtimeState.dynamics.velocity.toFixed(1)} m/s` : ''}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
