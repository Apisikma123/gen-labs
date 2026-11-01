import type { SimulationSpecification, ExperimentChallenge } from '@genlab/simulation-types';
import type { SimulationDefinition } from '../engine';

const spec: SimulationSpecification = {
  engine: 'computer-science',
  simulation: 'binary_search',
  version: 1,
  title: 'Visualizer Pencarian Biner (Binary Search)',
  description: 'Eksplorasi strategi Divide and Conquer dalam pencarian data terurut. Amati pergerakan pointer low, mid, high dan batas logaritmik langkah.',
  domain: 'Informatika',
  concepts: ['binary search', 'divide and conquer', 'pencarian biner', 'logaritmik', 'algoritma pencarian'],
  parameters: {
    target: { value: 23, min: 1, max: 64, step: 1, unit: 'val', label: 'Target Nilai' },
    arraySize: { value: 16, min: 8, max: 32, step: 1, unit: 'n', label: 'Ukuran Larik (n)' },
  },
  controls: ['target', 'arraySize'],
};

export interface BinarySearchStep {
  low: number;
  mid: number;
  high: number;
  midVal: number;
  action: 'match' | 'higher' | 'lower';
}

export function generateBinarySearchData(size: number, target: number) {
  // Generate deterministic sorted array of unique integers
  const array: number[] = [];
  let currentVal = 2;
  for (let i = 0; i < size; i++) {
    currentVal += (i % 3 === 0 ? 3 : 2);
    array.push(currentVal);
  }

  // Run binary search trace
  const steps: BinarySearchStep[] = [];
  let low = 0;
  let high = size - 1;
  let foundIndex = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midVal = array[mid];

    if (midVal === target) {
      steps.push({ low, mid, high, midVal, action: 'match' });
      foundIndex = mid;
      break;
    } else if (midVal < target) {
      steps.push({ low, mid, high, midVal, action: 'higher' });
      low = mid + 1;
    } else {
      steps.push({ low, mid, high, midVal, action: 'lower' });
      high = mid - 1;
    }
  }

  return { array, steps, foundIndex };
}

function compute(params: Record<string, number>): Record<string, number | string> {
  const { target = 23, arraySize = 16 } = params;
  const { array, steps, foundIndex } = generateBinarySearchData(arraySize, target);

  const maxTheoreticalSteps = Math.floor(Math.log2(Math.max(1, arraySize))) + 1;
  const stepsCount = steps.length;
  const lastStep = steps[steps.length - 1];

  return {
    target,
    arraySize,
    stepsCount,
    maxTheoreticalSteps,
    foundIndex,
    isFound: foundIndex !== -1 ? 1 : 0,
    currentLow: lastStep ? lastStep.low : 0,
    currentMid: lastStep ? lastStep.mid : 0,
    currentHigh: lastStep ? lastStep.high : 0,
    statusText: foundIndex !== -1 ? `Ditemukan di indeks ${foundIndex}` : 'Nilai tidak ada dalam larik',
    stepsCount_display: `${stepsCount} iterasi`,
    maxTheoretical_display: `Maks ⌊log₂(${arraySize})⌋ + 1 = ${maxTheoreticalSteps} langkah`,
    equation: `Iterasi: ${stepsCount} ≤ ⌊log₂(${arraySize})⌋ + 1 (${maxTheoreticalSteps})`,
  };
}

const experiments: ExperimentChallenge[] = [
  {
    id: 'find-within-log-steps',
    title: 'Pencarian Efisien Logaritmik',
    objective: 'Temukan elemen dalam maksimal 5 iterasi pada larik berukuran 16.',
    description: 'Pilih target nilai yang ada dalam larik agar algoritma berhenti dengan status Ditemukan dalam ≤ 5 perbandingan.',
    allowedParameters: ['target'],
    targetCondition: {
      output: 'isFound',
      operator: '==',
      value: 1,
      tolerance: 0,
    },
    hint: 'Nilai elemen larik berurutan genap-ganjil antara 5 sampai 45. Coba pilih target di tengah.',
  },
];

export const binarySearch: SimulationDefinition = {
  spec,
  compute,
  experiments,
};
