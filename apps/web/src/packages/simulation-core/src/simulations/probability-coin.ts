import type { SimulationSpecification, ExperimentChallenge } from '@genlab/simulation-types';
import type { SimulationDefinition } from '../engine';

const spec: SimulationSpecification = {
  engine: 'mathematics',
  simulation: 'probability_coin',
  version: 1,
  title: 'Eksperimen Peluang & Hukum Bilangan Besar',
  description: 'Simulasi pelemparan koin berulang untuk mengamati konvergensi frekuensi empiris menuju probabilitas teoretis (Law of Large Numbers).',
  domain: 'Matematika',
  concepts: ['peluang', 'probabilitas', 'hukum bilangan besar', 'frekuensi relatif', 'distribusi binomial'],
  parameters: {
    trials: { value: 100, min: 10, max: 1000, step: 10, unit: 'n', label: 'Jumlah Percobaan (n)' },
    theoreticalProb: { value: 0.5, min: 0.1, max: 0.9, step: 0.05, unit: 'p', label: 'Peluang Teoretis (p)' },
    seed: { value: 42, min: 1, max: 100, step: 1, unit: '#', label: 'Benih Acak (Seed)' },
  },
  controls: ['trials', 'theoreticalProb', 'seed'],
};

function pseudoRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function compute(params: Record<string, number>): Record<string, number | string> {
  const { trials = 100, theoreticalProb = 0.5, seed = 42 } = params;

  const rand = pseudoRandom(seed * 1000 + trials);
  let headsCount = 0;
  for (let i = 0; i < trials; i++) {
    if (rand() < theoreticalProb) {
      headsCount++;
    }
  }

  const relativeFreq = trials > 0 ? headsCount / trials : 0;
  const deviation = Math.abs(relativeFreq - theoreticalProb);
  const expectedCount = Math.round(trials * theoreticalProb);

  return {
    trials,
    headsCount,
    expectedCount,
    relativeFreq: Math.round(relativeFreq * 1000) / 1000,
    deviation: Math.round(deviation * 1000) / 1000,
    headsCount_display: `${headsCount} kali`,
    relativeFreq_display: `${(relativeFreq * 100).toFixed(1)}%`,
    deviation_display: `${(deviation * 100).toFixed(2)}%`,
    equation: `f_rel = ${headsCount} / ${trials} = ${(relativeFreq * 100).toFixed(1)}% (p = ${(theoreticalProb * 100).toFixed(0)}%)`,
  };
}

const experiments: ExperimentChallenge[] = [
  {
    id: 'large-numbers-convergence',
    title: 'Konvergensi Bilangan Besar',
    objective: 'Perkecil deviasi empiris hingga |f_rel - p| ≤ 0.02.',
    description: 'Tingkatkan jumlah percobaan n menuju nilai yang lebih besar (misal n ≥ 500) agar frekuensi empiris mendekati peluang teoretis.',
    allowedParameters: ['trials'],
    targetCondition: {
      output: 'deviation',
      operator: '<=',
      value: 0.02,
      tolerance: 0.005,
    },
    hint: 'Semakin besar sampel n, variansi galat empiris akan mengecil sebanding dengan 1/√n.',
  },
];

export const probabilityCoin: SimulationDefinition = {
  spec,
  compute,
  experiments,
};
