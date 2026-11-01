import type { SimulationSpecification, ExperimentChallenge } from '@genlab/simulation-types';
import type { SimulationDefinition } from '../engine';

const spec: SimulationSpecification = {
  engine: 'physics',
  simulation: 'momentum_collision',
  version: 1,
  title: 'Momentum & Tumbukan 1D',
  description: 'Simulasi tumbukan 1D dua benda pada lintasan linear. Amati kekekalan momentum total dan variasi koefisien elastisitas e.',
  domain: 'Fisika',
  concepts: ['momentum', 'hukum kekekalan momentum', 'tumbukan elastis', 'energi kinetik', 'koefisien restitusi'],
  parameters: {
    m1: { value: 2, min: 0.5, max: 5.0, step: 0.5, unit: 'kg', label: 'Massa Kereta 1 (m₁)' },
    v1: { value: 5, min: -10, max: 10, step: 0.5, unit: 'm/s', label: 'Kecepatan Awal 1 (v₁)' },
    m2: { value: 2, min: 0.5, max: 5.0, step: 0.5, unit: 'kg', label: 'Massa Kereta 2 (m₂)' },
    v2: { value: 0, min: -10, max: 10, step: 0.5, unit: 'm/s', label: 'Kecepatan Awal 2 (v₂)' },
    elasticity: { value: 0.5, min: 0.0, max: 1.0, step: 0.1, unit: 'e', label: 'Elastisitas (e)' },
  },
  controls: ['m1', 'v1', 'm2', 'v2', 'elasticity'],
};

function compute(params: Record<string, number>): Record<string, number | string> {
  const { m1 = 2, v1 = 5, m2 = 2, v2 = 0, elasticity = 0.5 } = params;
  const mass1 = Math.max(0.01, m1);
  const mass2 = Math.max(0.01, m2);
  const totalMass = mass1 + mass2;
  const e = Math.max(0, Math.min(1, elasticity));

  // Kekekalan momentum: p_total = m1*v1 + m2*v2
  const pInitial = mass1 * v1 + mass2 * v2;
  const ekInitial = 0.5 * mass1 * v1 * v1 + 0.5 * mass2 * v2 * v2;

  // Kecepatan akhir 1D dengan koefisien restitusi e
  // v1' = (m1*v1 + m2*v2 - m2*e*(v1 - v2)) / (m1 + m2)
  // v2' = (m1*v1 + m2*v2 + m1*e*(v1 - v2)) / (m1 + m2)
  const v1Final = (mass1 * v1 + mass2 * v2 - mass2 * e * (v1 - v2)) / totalMass;
  const v2Final = (mass1 * v1 + mass2 * v2 + mass1 * e * (v1 - v2)) / totalMass;

  const pFinal = mass1 * v1Final + mass2 * v2Final;
  const ekFinal = 0.5 * mass1 * v1Final * v1Final + 0.5 * mass2 * v2Final * v2Final;
  const ekLoss = Math.max(0, ekInitial - ekFinal);

  return {
    v1Final: Math.round(v1Final * 100) / 100,
    v2Final: Math.round(v2Final * 100) / 100,
    pTotal: Math.round(pFinal * 100) / 100,
    ekInitial: Math.round(ekInitial * 100) / 100,
    ekFinal: Math.round(ekFinal * 100) / 100,
    ekLoss: Math.round(ekLoss * 100) / 100,
    v1Final_display: `${v1Final.toFixed(2)} m/s`,
    v2Final_display: `${v2Final.toFixed(2)} m/s`,
    pTotal_display: `${pFinal.toFixed(2)} kg·m/s`,
    ekLoss_display: `${ekLoss.toFixed(2)} J`,
    equation: `p = m₁v₁ + m₂v₂ = ${pInitial.toFixed(1)} kg·m/s (Kekal)`,
  };
}

const experiments: ExperimentChallenge[] = [
  {
    id: 'velocity-exchange',
    title: 'Pertukaran Kecepatan Sempurna',
    objective: 'Buat v₁\' = 0.0 m/s dan v₂\' = 5.0 m/s saat tumbukan elastis.',
    description: 'Buktikan bahwa dua benda bermassa identik (m₁ = m₂ = 2 kg) pada tumbukan lenting sempurna (e = 1.0) akan bertukar kecepatan secara total.',
    allowedParameters: ['elasticity'],
    targetCondition: {
      output: 'v2Final',
      operator: '==',
      value: 5.0,
      tolerance: 0.1,
    },
    hint: 'Bila m1 = m2 dan e = 1, seluruh momentum kereta 1 ditransfer utuh ke kereta 2.',
  },
  {
    id: 'inelastic-stick',
    title: 'Tumbukan Tak Lenting Sama Sekali',
    objective: 'Buat kedua benda bergerak bersama dengan kecepatan sama (e = 0.0).',
    description: 'Atur elastisitas e = 0.0 agar kedua kereta menempel dan bergerak bersama dengan kecepatan gabungan yang sama.',
    allowedParameters: ['elasticity'],
    targetCondition: {
      output: 'v1Final',
      operator: '==',
      value: 2.5,
      tolerance: 0.1,
    },
    hint: 'Pada e = 0, v1\' = v2\' = (m1*v1 + m2*v2) / (m1 + m2) = 10 / 4 = 2.5 m/s.',
  },
];

export const momentumCollision: SimulationDefinition = {
  spec,
  compute,
  experiments,
};
