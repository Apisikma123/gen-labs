import type { SimulationSpecification, SimulationState, ExperimentChallenge, SimulationInsight } from '@genlab/simulation-types';

export interface SimulationDefinition {
  spec: SimulationSpecification;
  createInitialState?: (params: Record<string, number>) => SimulationState;
  update?: (state: SimulationState, dt: number) => SimulationState;
  compute: (params: Record<string, number>) => Record<string, number | string>;
  experiments: ExperimentChallenge[];
  generateInsight?: (
    before: Record<string, number>,
    after: Record<string, number>,
    spec: SimulationSpecification
  ) => SimulationInsight;
}

export function defaultInitialState(
  def: { compute: (params: Record<string, number>) => Record<string, number | string> },
  params: Record<string, number>
): SimulationState {
  return {
    parameters: { ...params },
    computed: def.compute(params),
    time: 0,
    running: false,
  };
}

export function defaultUpdate(state: SimulationState, dt: number): SimulationState {
  return {
    ...state,
    time: state.time + dt,
  };
}

export function defaultGenerateInsight(
  before: Record<string, number>,
  after: Record<string, number>,
  spec: SimulationSpecification
): SimulationInsight {
  const changes: Array<{ parameter: string; from: number; to: number; unit?: string }> = [];
  const held: Array<{ parameter: string; value: number; unit?: string }> = [];

  for (const [key, p] of Object.entries(spec.parameters)) {
    const bVal = before[key] ?? p.value;
    const aVal = after[key] ?? p.value;
    if (bVal !== aVal) {
      changes.push({ parameter: p.label || key, from: bVal, to: aVal, unit: p.unit });
    } else {
      held.push({ parameter: p.label || key, value: aVal, unit: p.unit });
    }
  }

  return {
    title: `Hasil Eksplorasi: ${spec.title}`,
    changes,
    held,
    result: {
      label: 'Perubahan Nilai',
      from: 'Nilai Awal',
      to: 'Nilai Terkini',
    },
    keyInsight: `Hasil perhitungan langsung berubah dan menyesuaikan saat kamu mengubah nilai pada ${spec.title}.`,
    tryNext: 'Coba ubah nilai variabel lain atau selesaikan tantangan eksperimen untuk menguji pemahamanmu.',
  };
}

export type SimulationRenderer = 'canvas-2d' | 'svg' | 'd3-chart' | 'dom';

const registry = new Map<string, SimulationDefinition>();

export function registerSimulation(key: string, def: SimulationDefinition) {
  registry.set(key, def);
}

export function getSimulation(key: string): SimulationDefinition | undefined {
  return registry.get(key);
}

export function listSimulations(): string[] {
  return Array.from(registry.keys());
}
