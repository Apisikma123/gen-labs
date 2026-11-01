import type { SimulationSpecification, SimulationState, ExperimentChallenge, SimulationInsight } from '@genlab/simulation-types';
import type { SimulationDefinition } from '../engine';

const spec: SimulationSpecification = {
  engine: 'economics',
  simulation: 'supply_demand',
  version: 1,
  title: 'Permintaan & Penawaran (Supply & Demand)',
  description: 'Pelajari bagaimana kurva permintaan dan penawaran berinteraksi menentukan titik ekuilibrium pasar.',
  domain: 'Ekonomi',
  concepts: ['permintaan', 'penawaran', 'ekuilibrium', 'harga pasar', 'kuantitas', 'pasar'],
  parameters: {
    demandIntercept: { value: 100, min: 50, max: 200, step: 5, unit: '$', label: 'Titik Potong Permintaan' },
    demandSlope: { value: -2, min: -5, max: -0.5, step: 0.1, unit: '$/unit', label: 'Kemiringan Kurva Permintaan' },
    supplyIntercept: { value: 10, min: 0, max: 50, step: 5, unit: '$', label: 'Titik Potong Penawaran' },
    supplySlope: { value: 1.5, min: 0.5, max: 5, step: 0.1, unit: '$/unit', label: 'Kemiringan Kurva Penawaran' },
  },
  controls: ['demandIntercept', 'demandSlope', 'supplyIntercept', 'supplySlope'],
};

function compute(params: Record<string, number>): Record<string, number | string> {
  const { demandIntercept = 100, demandSlope = -2, supplyIntercept = 10, supplySlope = 1.5 } = params;

  // Demand: P = demandIntercept + demandSlope * Q
  // Supply: P = supplyIntercept + supplySlope * Q
  // Equilibrium: demandIntercept + demandSlope * Q = supplyIntercept + supplySlope * Q
  const slopeDiff = demandSlope - supplySlope;
  const equilibriumQ = slopeDiff !== 0 ? (supplyIntercept - demandIntercept) / slopeDiff : 0;
  const equilibriumP = demandIntercept + demandSlope * equilibriumQ;

  const consumerSurplus = equilibriumQ > 0
    ? 0.5 * (demandIntercept - equilibriumP) * equilibriumQ
    : 0;
  const producerSurplus = equilibriumQ > 0
    ? 0.5 * (equilibriumP - supplyIntercept) * equilibriumQ
    : 0;

  return {
    equilibriumPrice: Math.round(equilibriumP * 100) / 100,
    equilibriumQuantity: Math.round(equilibriumQ * 100) / 100,
    consumerSurplus: Math.round(consumerSurplus * 100) / 100,
    producerSurplus: Math.round(producerSurplus * 100) / 100,
    totalSurplus: Math.round((consumerSurplus + producerSurplus) * 100) / 100,
    equilibriumPrice_display: `$${(Math.round(equilibriumP * 100) / 100).toFixed(2)}`,
    equilibriumQuantity_display: `${(Math.round(equilibriumQ * 100) / 100).toFixed(1)} unit`,
    demandEquation: `P = ${demandIntercept} ${demandSlope >= 0 ? '+' : ''} ${demandSlope}Q`,
    supplyEquation: `P = ${supplyIntercept} + ${supplySlope}Q`,
  };
}

const experiments: ExperimentChallenge[] = [
  {
    id: 'shift-demand',
    title: 'Lonjakan Permintaan',
    objective: 'Tingkatkan harga ekuilibrium pasar hingga minimal mencapai $60,00.',
    description: 'Tingkatkan parameter kurva permintaan agar harga ekuilibrium mencapai $60,00 atau lebih tinggi.',
    allowedParameters: ['demandIntercept'],
    targetCondition: {
      output: 'equilibriumPrice',
      operator: '>=',
      value: 60.0,
      tolerance: 0.5,
    },
    hint: 'Titik potong permintaan yang lebih tinggi menggeser kurva permintaan ke atas dan menaikkan harga pasar.',
  },
  {
    id: 'find-equilibrium',
    title: 'Target Kuantitas Pasar Bersih',
    objective: 'Atur kuantitas ekuilibrium pasar tepat di 20,0 unit.',
    description: 'Sesuaikan kurva agar jumlah kuantitas ekuilibrium tepat mencapai 20,0 unit.',
    allowedParameters: ['demandIntercept', 'supplyIntercept', 'demandSlope', 'supplySlope'],
    targetCondition: {
      output: 'equilibriumQuantity',
      operator: '==',
      value: 20.0,
      tolerance: 0.5,
    },
    hint: 'Kuantitas ekuilibrium tercapai di titik perpotongan antara kurva permintaan dan penawaran.',
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

  for (const key of ['demandIntercept', 'demandSlope', 'supplyIntercept', 'supplySlope']) {
    if (before[key] !== after[key]) {
      changes.push({ parameter: spec.parameters[key]?.label || key, from: before[key], to: after[key] });
    } else {
      held.push({ parameter: spec.parameters[key]?.label || key, value: after[key] });
    }
  }

  const priceBefore = beforeComputed.equilibriumPrice as number;
  const priceAfter = afterComputed.equilibriumPrice as number;

  let keyInsight = '';
  const demandChanged = before.demandIntercept !== after.demandIntercept || before.demandSlope !== after.demandSlope;
  const supplyChanged = before.supplyIntercept !== after.supplyIntercept || before.supplySlope !== after.supplySlope;

  if (demandChanged && !supplyChanged) {
    keyInsight = `Menggeser kurva permintaan ${priceAfter > priceBefore ? 'menaikkan' : 'menurunkan'} harga ekuilibrium pasar. Saat permintaan bertambah dengan penawaran tetap, baik harga maupun jumlah keseimbangan sama-sama naik.`;
  } else if (supplyChanged && !demandChanged) {
    keyInsight = `Mengubah kurva penawaran ${priceAfter < priceBefore ? 'menurunkan' : 'menaikkan'} harga ekuilibrium pasar. Saat penawaran bertambah dengan permintaan tetap, harga cenderung turun dan jumlah keseimbangan bertambah.`;
  } else {
    keyInsight = `Kedua kurva bergeser bersamaan. Titik ekuilibrium pasar berpindah dari $${priceBefore.toFixed(2)} menjadi $${priceAfter.toFixed(2)}.`;
  }

  return {
    title: 'Temuan Eksperimen Kamu',
    changes,
    held,
    result: {
      label: 'Harga Ekuilibrium',
      from: `$${priceBefore.toFixed(2)}`,
      to: `$${priceAfter.toFixed(2)}`,
    },
    keyInsight,
    nextPrompt: 'Coba geser kedua kurva secara bersamaan untuk melihat efek gabungannya terhadap harga dan jumlah barang.',
  };
}

function createInitialState(params: Record<string, number>): SimulationState {
  return { parameters: { ...params }, computed: compute(params), time: 0, running: false };
}

function update(state: SimulationState, _dt: number): SimulationState {
  return state;
}

export const supplyDemand: SimulationDefinition = {
  spec,
  createInitialState,
  update,
  compute,
  experiments,
  generateInsight,
};
