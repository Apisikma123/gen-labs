import type { SimulationSpecification, SimulationState, ExperimentChallenge, SimulationInsight } from '@genlab/simulation-types';
import type { SimulationDefinition } from '../engine';

const spec: SimulationSpecification = {
  engine: 'computer-science',
  simulation: 'sorting_visualizer',
  version: 1,
  title: 'Visualisasi Algoritma Pengurutan',
  description: 'Amati bagaimana algoritma pengurutan data bekerja langkah demi langkah secara visual.',
  domain: 'Informatika',
  concepts: ['pengurutan', 'bubble sort', 'selection sort', 'insertion sort', 'kompleksitas algoritma'],
  parameters: {
    arraySize: { value: 20, min: 5, max: 50, step: 1, unit: 'elemen', label: 'Jumlah Elemen' },
    speed: { value: 50, min: 1, max: 100, step: 1, unit: '%', label: 'Kecepatan Eksekusi' },
    algorithm: { value: 0, min: 0, max: 2, step: 1, unit: 'mode', label: 'Pilihan Algoritma' },
  },
  controls: ['arraySize', 'speed', 'algorithm'],
};

const ALGORITHM_NAMES = ['Bubble Sort', 'Selection Sort', 'Insertion Sort'];
const COMPLEXITIES: Record<string, { best: string; avg: string; worst: string }> = {
  'Bubble Sort': { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)' },
  'Selection Sort': { best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)' },
  'Insertion Sort': { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)' },
};

export interface SortingStep {
  array: number[];
  comparing: [number, number];
  swapped: boolean;
  sorted: number[];
  stepNumber: number;
}

export function generateSortingSteps(arr: number[], algorithmIndex: number): SortingStep[] {
  const steps: SortingStep[] = [];
  const a = [...arr];
  const sorted: number[] = [];

  if (algorithmIndex === 0) {
    for (let i = 0; i < a.length - 1; i++) {
      for (let j = 0; j < a.length - i - 1; j++) {
        const swapped = a[j] > a[j + 1];
        if (swapped) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; }
        steps.push({ array: [...a], comparing: [j, j + 1], swapped, sorted: [...sorted], stepNumber: steps.length + 1 });
      }
      sorted.push(a.length - 1 - i);
    }
  } else if (algorithmIndex === 1) {
    for (let i = 0; i < a.length - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < a.length; j++) {
        steps.push({ array: [...a], comparing: [minIdx, j], swapped: false, sorted: [...sorted], stepNumber: steps.length + 1 });
        if (a[j] < a[minIdx]) minIdx = j;
      }
      if (minIdx !== i) {
        [a[i], a[minIdx]] = [a[minIdx], a[i]];
        steps.push({ array: [...a], comparing: [i, minIdx], swapped: true, sorted: [...sorted], stepNumber: steps.length + 1 });
      }
      sorted.push(i);
    }
  } else {
    for (let i = 1; i < a.length; i++) {
      let j = i;
      while (j > 0 && a[j - 1] > a[j]) {
        [a[j - 1], a[j]] = [a[j], a[j - 1]];
        steps.push({ array: [...a], comparing: [j - 1, j], swapped: true, sorted: [...sorted], stepNumber: steps.length + 1 });
        j--;
      }
      if (j === i) {
        steps.push({ array: [...a], comparing: [j - 1 >= 0 ? j - 1 : 0, j], swapped: false, sorted: [...sorted], stepNumber: steps.length + 1 });
      }
    }
  }

  return steps;
}

function compute(params: Record<string, number>): Record<string, number | string> {
  const algName = ALGORITHM_NAMES[params.algorithm] || 'Bubble Sort';
  const complexity = COMPLEXITIES[algName];
  return {
    algorithmName: algName,
    bestCase: complexity.best,
    averageCase: complexity.avg,
    worstCase: complexity.worst,
    arraySize: params.arraySize,
  };
}

const experiments: ExperimentChallenge[] = [
  {
    id: 'compare-algorithms',
    title: 'Perbandingan Efisiensi Algoritma',
    description: 'Jalankan ketiga algoritma dengan jumlah data yang sama. Amati algoritma mana yang selesai dalam langkah paling sedikit.',
    hint: 'Coba mulai dari jumlah data kecil terlebih dahulu, lalu tingkatkan ukurannya.',
  },
  {
    id: 'best-vs-worst',
    title: 'Kasus Terbaik vs Terburuk',
    description: 'Amati performa Insertion Sort pada data yang hampir terurut dibandingkan dengan data yang terbalik total.',
    hint: 'Kasus terbaik (best case) Insertion Sort terjadi saat deret data sudah terurut sejak awal.',
  },
];

function generateInsight(
  before: Record<string, number>,
  after: Record<string, number>,
  _spec: SimulationSpecification
): SimulationInsight {
  const beforeAlg = ALGORITHM_NAMES[before.algorithm] || 'Bubble Sort';
  const afterAlg = ALGORITHM_NAMES[after.algorithm] || 'Bubble Sort';

  const changes: SimulationInsight['changes'] = [];
  const held: SimulationInsight['held'] = [];

  if (before.algorithm !== after.algorithm) {
    changes.push({ parameter: 'Algoritma', from: before.algorithm, to: after.algorithm });
  }
  if (before.arraySize !== after.arraySize) {
    changes.push({ parameter: 'Ukuran Larik', from: before.arraySize, to: after.arraySize });
  }

  return {
    title: 'Temuan Eksperimen Kamu',
    changes,
    held,
    result: { label: 'Algoritma', from: beforeAlg, to: afterAlg },
    keyInsight: before.algorithm !== after.algorithm
      ? `Setiap algoritma membutuhkan jumlah langkah yang berbeda untuk data yang sama. Algoritma ${afterAlg} memiliki kompleksitas rata-rata ${COMPLEXITIES[afterAlg].avg}.`
      : `Meningkatkan jumlah elemen dari ${before.arraySize} menjadi ${after.arraySize} meningkatkan jumlah langkah secara signifikan pada algoritma berordo O(n²).`,
    nextPrompt: 'Coba bandingkan jumlah langkah di ketiga algoritma dengan ukuran larik yang sama.',
  };
}

function createInitialState(params: Record<string, number>): SimulationState {
  return { parameters: { ...params }, computed: compute(params), time: 0, running: false };
}

function update(state: SimulationState, _dt: number): SimulationState {
  return state;
}

export const sortingVisualizer: SimulationDefinition = {
  spec,
  createInitialState,
  update,
  compute,
  experiments,
  generateInsight,
};
