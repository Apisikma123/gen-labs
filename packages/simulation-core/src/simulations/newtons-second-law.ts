import type { SimulationSpecification, SimulationState, ExperimentChallenge, SimulationInsight } from '@genlab/simulation-types';
import type { SimulationDefinition } from '../engine';

const spec: SimulationSpecification = {
  engine: 'physics',
  simulation: 'newtons_second_law',
  version: 1,
  title: 'Hukum II Newton',
  description: 'Eksplorasi hubungan mendasar antara gaya dorong, massa benda, dan percepatan (F = m · a).',
  domain: 'Fisika',
  concepts: ['gaya dorong', 'massa benda', 'percepatan', 'hukum newton', 'F=ma'],
  parameters: {
    mass: { value: 5, min: 0.5, max: 20, step: 0.5, unit: 'kg', label: 'Massa Benda' },
    force: { value: 20, min: 0, max: 100, step: 1, unit: 'N', label: 'Gaya Dorong' },
    friction: { value: 0, min: 0, max: 0.5, step: 0.01, unit: 'μ', label: 'Koefisien Gesek' },
  },
  controls: ['mass', 'force', 'friction'],
};

function compute(params: Record<string, number>): Record<string, number | string> {
  const { mass = 5, force = 20, friction = 0 } = params;
  const m = Math.max(0.01, mass);
  const g = 9.81;
  const normalForce = m * g;
  const maxFriction = Math.max(0, friction) * normalForce;

  let netForce = 0;
  if (Math.abs(force) > maxFriction) {
    netForce = force - Math.sign(force) * maxFriction;
  } else {
    netForce = 0; // Static equilibrium: friction cancels applied force completely
  }

  const acceleration = netForce / m;

  return {
    acceleration: Math.round(acceleration * 1000) / 1000,
    netForce: Math.round(netForce * 100) / 100,
    frictionForce: Math.round(maxFriction * 100) / 100,
    normalForce: Math.round(normalForce * 100) / 100,
    'acceleration_display': `${(Math.round(acceleration * 100) / 100).toFixed(2)} m/s²`,
    'netForce_display': `${(Math.round(netForce * 100) / 100).toFixed(2)} N`,
    'equation': `a = F_net / m = ${netForce.toFixed(2)} / ${m.toFixed(1)} = ${acceleration.toFixed(2)} m/s²`,
  };
}

const experiments: ExperimentChallenge[] = [
  {
    id: 'reach-5-accel',
    title: 'Target Percepatan',
    objective: 'Atur gaya dorong agar percepatan benda tepat mencapai 5,00 m/s².',
    description: 'Atur gaya dorong agar percepatan benda tepat mencapai 5,00 m/s² tanpa mengubah massa benda.',
    allowedParameters: ['force'],
    targetCondition: {
      output: 'acceleration',
      operator: '==',
      value: 5,
      tolerance: 0.05,
    },
    hint: 'Gunakan hubungan F = m · a. Jika massa m = 5 kg dan target a = 5 m/s², berapa besar gaya dorong yang dibutuhkan?',
    hints: ['F = m · a', 'Jika massa m = 5 kg dan target a = 5 m/s², maka gaya dorong F = 5 · 5 = 25 N.'],
  },
  {
    id: 'double-mass',
    title: 'Pengaruh Penambahan Massa',
    objective: 'Gandakan massa menjadi 10 kg dengan gaya dorong 20 N lalu amati percepatannya.',
    description: 'Tingkatkan massa menjadi 10 kg dengan gaya dorong tetap 20 N. Perhatikan bagaimana percepatan berkurang menjadi 2,00 m/s².',
    allowedParameters: ['mass'],
    targetCondition: {
      output: 'acceleration',
      operator: '==',
      value: 2,
      tolerance: 0.05,
    },
    hint: 'Amati hubungan berbanding terbalik antara massa dan percepatan (a = F / m).',
    hints: ['a = 20 / 10 = 2,00 m/s²'],
  },
  {
    id: 'overcome-friction',
    title: 'Mengatasi Gaya Gesek',
    objective: 'Berikan gaya dorong yang cukup untuk mengatasi gaya gesek (μ = 0,3) hingga percepatan melebihi 1,0 m/s².',
    description: 'Atur koefisien gesek ke 0,3. Cari besar gaya dorong yang diperlukan agar benda dapat bergerak dengan percepatan minimal 1,0 m/s².',
    allowedParameters: ['force', 'friction'],
    targetCondition: {
      output: 'acceleration',
      operator: '>=',
      value: 1.0,
      tolerance: 0.05,
    },
    hint: 'Gaya dorong harus melampaui gaya gesek maksimum (f_gesek = μ · m · g ≈ 14,7 N) agar menghasilkan percepatan positif.',
  },
];

function generateInsight(
  before: Record<string, number>,
  after: Record<string, number>,
  _spec: SimulationSpecification
): SimulationInsight {
  const beforeComputed = compute(before);
  const afterComputed = compute(after);

  const changes: SimulationInsight['changes'] = [];
  const held: SimulationInsight['held'] = [];

  for (const key of ['mass', 'force', 'friction']) {
    if (before[key] !== after[key]) {
      changes.push({
        parameter: key,
        from: before[key],
        to: after[key],
        unit: spec.parameters[key]?.unit,
      });
    } else {
      held.push({
        parameter: key,
        value: after[key],
        unit: spec.parameters[key]?.unit,
      });
    }
  }

  const accBefore = beforeComputed.acceleration as number;
  const accAfter = afterComputed.acceleration as number;

  let keyInsight = '';
  if (changes.length === 1 && changes[0].parameter === 'mass') {
    const massRatio = changes[0].to / changes[0].from;
    const accRatio = accBefore / accAfter;
    keyInsight = `Saat gaya dorong konstan, ${massRatio > 1 ? 'menaikkan' : 'menurunkan'} massa benda sebesar ${massRatio.toFixed(1)}x akan ${accAfter < accBefore ? 'menurunkan' : 'menaikkan'} percepatan sebesar ~${accRatio.toFixed(1)}x. Massa benda dan percepatan berbanding terbalik.`;
  } else if (changes.length === 1 && changes[0].parameter === 'force') {
    keyInsight = `Dengan massa konstan, ${changes[0].to > changes[0].from ? 'menaikkan' : 'menurunkan'} gaya dorong (force) secara langsung ${accAfter > accBefore ? 'meningkatkan' : 'menurunkan'} percepatan benda. Gaya dorong dan percepatan berbanding lurus.`;
  } else {
    keyInsight = `Percepatan berubah dari ${accBefore.toFixed(2)} menjadi ${accAfter.toFixed(2)} m/s² berdasarkan rumus Hukum II Newton (a = F_net / m).`;
  }

  return {
    title: 'Temuan Eksperimen Kamu',
    changes,
    held,
    result: {
      label: 'Percepatan',
      from: `${accBefore.toFixed(2)} m/s²`,
      to: `${accAfter.toFixed(2)} m/s²`,
    },
    keyInsight,
    nextPrompt: accAfter === 0 ? 'Coba naikkan gaya dorong agar melampaui batas gaya gesek statis.' : 'Coba ubah variabel lain untuk mengamati pengaruhnya terhadap sistem gerak.',
  };
}

function createInitialState(params: Record<string, number>): SimulationState {
  return {
    parameters: { ...params },
    computed: compute(params),
    time: 0,
    running: false,
  };
}

function update(state: SimulationState, dt: number): SimulationState {
  const acceleration = state.computed.acceleration as number;
  const velocity = ((state.computed.velocity as number) || 0) + acceleration * dt;
  const position = ((state.computed.position as number) || 0) + velocity * dt;

  return {
    ...state,
    time: state.time + dt,
    computed: {
      ...state.computed,
      velocity: Math.round(velocity * 100) / 100,
      position: Math.round(position * 100) / 100,
    },
  };
}

export const newtonsSecondLaw: SimulationDefinition = {
  spec,
  createInitialState,
  update,
  compute,
  experiments,
  generateInsight,
};
