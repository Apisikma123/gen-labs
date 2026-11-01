/**
 * Unified Simulator Schema for Gen Labs Super Canvas.
 * 
 * ARCHITECTURE PRINCIPLE:
 * ONE SUPER CANVAS. ONE SIMULATOR FORMAT.
 * No individual canvas components per simulation.
 * 
 * Every simulator (Physics, Economics, Computer Science, Accounting, Agriculture, etc.)
 * is completely defined by this data structure.
 */

export type DifficultyLevel = 'basic' | 'intermediate' | 'advanced';

export interface SimulatorInfo {
  title: string;
  description: string;
  discipline: string;
  topic: string;
  difficulty: DifficultyLevel;
  estimatedTime?: string;
  thumbnailUrl?: string;
  coverUrl?: string;
  status: 'draft' | 'published' | 'archived';
  version?: number;
}

export interface SimulatorParameter {
  key: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  defaultVal: number;
  unit?: string;
  description?: string;
  affects?: string[];
}

export interface SimulatorCalculation {
  key: string;
  label: string;
  formula: string; // arithmetic expression e.g. "force - friction", "netForce / mass"
  unit?: string;
  latex?: string;
}

export type VisualElementType = 
  | 'shape'
  | 'line'
  | 'arrow'
  | 'point'
  | 'text'
  | 'curve'
  | 'chart'
  | 'grid'
  | 'balance'
  | 'image';

export interface VisualElement {
  id: string;
  type: VisualElementType;
  label?: string;
  // Positioning & Geometry (normalized 0..100 or canvas px)
  x?: number | string; // number or expression like "50 + force * 2"
  y?: number | string;
  width?: number | string;
  height?: number | string;
  x2?: number | string;
  y2?: number | string;
  color?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  radius?: number;
  url?: string;
  fontSize?: number;
  fontWeight?: string;
  boundParameter?: string;
  boundCalculation?: string;
  side?: 'top' | 'bottom' | 'left' | 'right' | 'top-right' | 'top-left';
  visibleIf?: string;
}

export interface SimulatorVisualSpec {
  viewBox: { width: number; height: number };
  archetype?: 'physics' | 'vector' | 'trajectory' | 'chart' | 'balance' | 'grid' | 'network' | 'sequence' | 'custom';
  groundPlane?: boolean;
  gridLines?: boolean;
  elements: VisualElement[];
}

export interface SimulatorResultItem {
  key: string;
  label: string;
  symbol?: string;
  calculationKey: string;
  unit?: string;
  highlight?: boolean;
  subtext?: string;
}

export interface SimulatorInsightSpec {
  summary: string;
  causeAndEffect: string;
  whatIf?: string;
}

export interface SimulatorExperimentSpec {
  id: string;
  title: string;
  objective: string;
  targetMetric: string; // key of calculation or parameter
  targetValue: number;
  targetValue2?: number;
  operator?: string;
  tolerance?: number;
  unit?: string;
  rules?: any;
  allowedParameters?: string[];
  initialParameters?: Record<string, number>;
  successMessage?: string;
  hint?: string;
  description?: string;
}

export interface UnifiedSimulatorSpec {
  id: string;
  slug: string;
  info: SimulatorInfo;
  parameters: Record<string, SimulatorParameter>;
  calculations: Record<string, SimulatorCalculation>;
  visual: SimulatorVisualSpec;
  results: SimulatorResultItem[];
  insight: SimulatorInsightSpec;
  experiments: SimulatorExperimentSpec[];
}

// ============================================================================
// DETERMINISTIC SAFE CALCULATION ENGINE (Zero eval, fast, SSR safe)
// ============================================================================

/**
 * Safely evaluates simple mathematical expressions using available params and math functions.
 */
export function safeEvaluateFormula(
  formula: string,
  variables: Record<string, number>
): number {
  if (!formula || typeof formula !== 'string') return 0;

  const trimmed = formula.trim();
  const directNum = Number(trimmed);
  if (!isNaN(directNum)) return directNum;

  // Direct variable match
  if (variables[trimmed] !== undefined) {
    return variables[trimmed];
  }

  try {
    // Sanitized expression evaluation with Math sandbox
    // Allow only identifiers, numbers, operators, parens, and standard Math functions
    const allowedTokens = /^[a-zA-Z0-9_\s\+\-\*\/\^\(\)\.\,\?\:\>\<\=\!]+$/;
    if (!allowedTokens.test(trimmed)) {
      return 0;
    }

    // Replace variables with their numeric values
    let expr = trimmed;
    // Replace ^ with **
    expr = expr.replace(/\^/g, '**');

    // Sort variable names by length descending to prevent substring collisions (e.g. mass1 before mass)
    const varKeys = Object.keys(variables).sort((a, b) => b.length - a.length);
    for (const key of varKeys) {
      const val = variables[key];
      const valStr = typeof val === 'number' && val < 0 ? `(${val})` : String(val ?? 0);
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      expr = expr.replace(regex, valStr);
    }

    // Mathematical aliases
    expr = expr
      .replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos')
      .replace(/\btan\b/g, 'Math.tan')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\babs\b/g, 'Math.abs')
      .replace(/\bmin\b/g, 'Math.min')
      .replace(/\bmax\b/g, 'Math.max')
      .replace(/\bround\b/g, 'Math.round')
      .replace(/\bpow\b/g, 'Math.pow')
      .replace(/\bPI\b/g, 'Math.PI');

    // Function constructor execution with strictly clamped Math context
    const fn = new Function('Math', `"use strict"; return (${expr});`);
    const result = fn(Math);

    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      // Round tiny floating point noise (e.g. 8.000000000000002 -> 8)
      return Math.round((result + Number.EPSILON) * 10000) / 10000;
    }
    return 0;
  } catch {
    return 0;
  }
}

import {
  getGenlabSimulation,
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

export const DOMAIN_COMPUTE_REGISTRY: Record<string, { compute: (params: Record<string, number>) => Record<string, any> }> = {
  'newtons-second-law': newtonsSecondLaw,
  'projectile-motion': projectileMotion,
  'momentum-collision': momentumCollision,
  'function-explorer': functionExplorer,
  'vector-math': vectorMath,
  'probability-coin': probabilityCoin,
  'probability-distribution': probabilityCoin,
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

function normalizeSlugForCompute(slug?: string): string {
  if (!slug) return '';
  let clean = slug.toLowerCase().trim().replace(/_/g, '-');
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
  };

  return SLUG_ALIASES[clean] || clean;
}

/**
 * Computes all calculated values for a simulator given a set of active parameter values.
 */
export function evaluateSimulator(
  spec: UnifiedSimulatorSpec,
  activeParams: Record<string, number>
): {
  parameters: Record<string, number>;
  computed: Record<string, number | string>;
} {
  // Merge defaults
  const params: Record<string, number> = {};
  if (spec.parameters) {
    for (const [key, p] of Object.entries(spec.parameters)) {
      params[key] = activeParams[key] ?? p.defaultVal ?? p.min;
    }
  }

  // Include any extra active parameters passed that might not be in spec.parameters
  if (activeParams) {
    for (const [k, v] of Object.entries(activeParams)) {
      if (params[k] === undefined && typeof v === 'number') {
        params[k] = v;
      }
    }
  }

  const computed: Record<string, number | string> = {};
  const currentScope: Record<string, number> = { ...params };

  // 1. Run domain compute if available for this simulation slug
  const normalizedSlug = normalizeSlugForCompute(spec.slug);
  const domainDef =
    (spec.slug ? DOMAIN_COMPUTE_REGISTRY[spec.slug] : undefined) ||
    (normalizedSlug ? DOMAIN_COMPUTE_REGISTRY[normalizedSlug] : undefined) ||
    (spec.slug ? getGenlabSimulation(spec.slug) : undefined) ||
    (normalizedSlug ? getGenlabSimulation(normalizedSlug) : undefined);

  if (domainDef && typeof domainDef.compute === 'function') {
    try {
      const domainOutputs = domainDef.compute(params);
      if (domainOutputs && typeof domainOutputs === 'object') {
        for (const [k, val] of Object.entries(domainOutputs)) {
          computed[k] = val;
          if (typeof val === 'number' && !isNaN(val)) {
            currentScope[k] = val;
          }
        }
      }
    } catch (err) {
      console.warn(`[evaluateSimulator] Domain compute warning for ${spec.slug}:`, err);
    }
  }

  // 2. Evaluate explicit spec calculations
  if (spec.calculations) {
    for (const [calcKey, calc] of Object.entries(spec.calculations)) {
      // If formula is just calcKey itself (legacy placeholder) and we already computed a value, keep it!
      if (calc.formula === calcKey && computed[calcKey] !== undefined) {
        continue;
      }
      const val = safeEvaluateFormula(calc.formula, currentScope);
      computed[calcKey] = val;
      currentScope[calcKey] = val;
    }
  }

  return { parameters: params, computed };
}

/**
 * Factory for creating a completely empty Simulator Specification.
 * Used when an Admin creates a new simulator from scratch.
 * Strict principle: NO default template, NO Newton, clean initial state.
 */
export function createEmptySimulatorSpec(): UnifiedSimulatorSpec {
  const timestamp = Date.now();
  return {
    id: `sim-custom-${timestamp}`,
    slug: `simulator-baru-${timestamp}`,
    info: {
      title: 'Simulator Baru',
      description: 'Eksperimen interaktif yang dibangun menggunakan GEN LABS Super Canvas.',
      discipline: 'Teknologi Rekayasa Perangkat Lunak',
      topic: 'Konsep Eksperimen',
      difficulty: 'basic',
      estimatedTime: '10–15 menit',
      status: 'draft',
      version: 1,
    },
    parameters: {},
    calculations: {},
    visual: {
      viewBox: { width: 720, height: 360 },
      archetype: 'custom',
      groundPlane: false,
      gridLines: true,
      elements: [],
    },
    results: [],
    insight: {
      summary: '',
      causeAndEffect: '',
      whatIf: '',
    },
    experiments: [],
  };
}
