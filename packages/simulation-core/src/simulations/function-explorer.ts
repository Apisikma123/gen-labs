import type { SimulationSpecification, SimulationState, ExperimentChallenge, SimulationInsight } from '@genlab/simulation-types';
import type { SimulationDefinition } from '../engine';

const spec: SimulationSpecification = {
  engine: 'mathematics',
  simulation: 'function_explorer',
  version: 1,
  title: 'Eksplorasi Fungsi Kuadrat',
  description: 'Pelajari bagaimana perubahan koefisien membentuk kurva parabola fungsi kuadrat dan titik pentingnya.',
  domain: 'Matematika',
  concepts: ['fungsi kuadrat', 'parabola', 'titik puncak', 'akar persamaan', 'koefisien'],
  parameters: {
    a: { value: 1, min: -5, max: 5, step: 0.1, unit: '', label: 'Koefisien a (Bentuk Kurva)' },
    b: { value: 0, min: -10, max: 10, step: 0.5, unit: '', label: 'Koefisien b (Pergeseran)' },
    c: { value: 0, min: -10, max: 10, step: 0.5, unit: '', label: 'Konstanta c (Titik Potong Y)' },
    xMin: { value: -10, min: -20, max: 0, step: 1, unit: 'u', label: 'Batas X Min' },
    xMax: { value: 10, min: 0, max: 20, step: 1, unit: 'u', label: 'Batas X Max' },
  },
  controls: ['a', 'b', 'c', 'xMin', 'xMax'],
};

function compute(params: Record<string, number>): Record<string, number | string> {
  const { a = 1, b = 0, c = 0, xMin = -10, xMax = 10 } = params;

  const discriminant = b * b - 4 * a * c;
  const vertexX = a !== 0 ? -b / (2 * a) : 0;
  const vertexY = a !== 0 ? a * vertexX * vertexX + b * vertexX + c : b * 0 + c;

  let rootsDisplay: string;
  if (a === 0) {
    rootsDisplay = b !== 0 ? `x = ${(-c / b).toFixed(2)}` : (c === 0 ? 'Semua nilai x' : 'Tidak ada');
  } else if (discriminant > 0) {
    const r1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const r2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    rootsDisplay = `x = ${Math.min(r1, r2).toFixed(2)}, ${Math.max(r1, r2).toFixed(2)}`;
  } else if (discriminant === 0) {
    rootsDisplay = `x = ${vertexX.toFixed(2)} (akar kembar)`;
  } else {
    rootsDisplay = 'Tidak ada akar real';
  }

  const direction = a > 0 ? 'Opens upward' : a < 0 ? 'Opens downward' : 'Linear';
  const directionDisplay = a > 0 ? 'Terbuka ke atas' : a < 0 ? 'Terbuka ke bawah' : 'Garis lurus (Linear)';

  const domainRange = Math.max(1, xMax - xMin);
  const yAtXMin = a * xMin * xMin + b * xMin + c;
  const yAtXMax = a * xMax * xMax + b * xMax + c;

  return {
    discriminant: Math.round(discriminant * 100) / 100,
    vertexX: Math.round(vertexX * 100) / 100,
    vertexY: Math.round(vertexY * 100) / 100,
    roots: rootsDisplay,
    direction,
    direction_display: directionDisplay,
    equation: a !== 0
      ? `f(x) = ${a !== 1 ? (a === -1 ? '-' : a) : ''}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}`
      : `f(x) = ${b}x ${c >= 0 ? '+' : ''} ${c}`,
    yIntercept: c,
    xMin,
    xMax,
    domainRange,
    yAtXMin: Math.round(yAtXMin * 100) / 100,
    yAtXMax: Math.round(yAtXMax * 100) / 100,
  };
}

const experiments: ExperimentChallenge[] = [
  {
    id: 'flip-parabola',
    title: 'Balik Orientasi Kurva',
    objective: 'Buat parabola terbuka ke bawah (a < 0).',
    description: 'Ubah koefisien a menjadi bernilai negatif agar arah parabola berbalik menghadap ke bawah.',
    allowedParameters: ['a'],
    targetCondition: {
      output: 'vertexY',
      operator: '!=',
      value: 0,
      tolerance: 0.1,
    },
    hint: 'Tanda positif atau negatif pada nilai "a" menentukan arah kelengkungan kurva.',
    hints: ['Atur nilai a < 0 untuk membalik orientasi kurva.'],
  },
  {
    id: 'find-roots',
    title: 'Diskriminan Positif',
    objective: 'Atur koefisien sehingga nilai diskriminan Δ minimal mencapai 16.',
    description: 'Sesuaikan koefisien sehingga diskriminan (D = b² - 4ac) bernilai 16 atau lebih besar.',
    allowedParameters: ['a', 'b', 'c'],
    targetCondition: {
      output: 'discriminant',
      operator: '>=',
      value: 16,
      tolerance: 0.5,
    },
    hint: 'Tingkatkan nilai b atau perkecil nilai c (saat a > 0) untuk memperbesar nilai diskriminan.',
  },
  {
    id: 'move-vertex',
    title: 'Target Titik Puncak',
    objective: 'Posisikan koordinat sumbu X titik puncak tepat di x = 2,00.',
    description: 'Posisikan koordinat sumbu X titik puncak tepat di 2,00 menggunakan rumus sumbu simetri x_p = -b / (2a).',
    allowedParameters: ['a', 'b'],
    targetCondition: {
      output: 'vertexX',
      operator: '==',
      value: 2.0,
      tolerance: 0.05,
    },
    hint: 'Jika a = 1, maka -b / (2 · 1) = 2 → b = -4.',
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

  for (const key of ['a', 'b', 'c']) {
    if (before[key] !== after[key]) {
      changes.push({ parameter: key, from: before[key], to: after[key] });
    } else {
      held.push({ parameter: key, value: after[key] });
    }
  }

  let keyInsight = '';
  if (changes.length === 1 && changes[0].parameter === 'a') {
    const dirIndo = String(afterComputed.direction_display || (afterComputed.direction === 'Opens upward' ? 'terbuka ke atas' : 'terbuka ke bawah')).toLowerCase();
    keyInsight = `Mengubah nilai "a" memengaruhi kelebaran dan arah kelengkungan kurva (${dirIndo}). Semakin besar |a|, kurva semakin sempit dan curam.`;
  } else if (changes.length === 1 && changes[0].parameter === 'c') {
    keyInsight = `Mengubah konstanta "c" menggeser kurva secara vertikal. Titik potong sumbu Y berpindah dari ${beforeComputed.yIntercept} ke ${afterComputed.yIntercept}.`;
  } else if (changes.length === 1 && changes[0].parameter === 'b') {
    keyInsight = `Mengubah nilai "b" menggeser posisi titik puncak secara horizontal dan memengaruhi kemiringan kurva di sekitar sumbu Y.`;
  } else {
    keyInsight = `Bentuk fungsi kuadrat berubah. Titik puncak sekarang berada di (${afterComputed.vertexX}, ${afterComputed.vertexY}) dengan status akar: ${afterComputed.roots}.`;
  }

  return {
    title: 'Temuan Eksperimen Kamu',
    changes,
    held,
    result: {
      label: 'Akar Persamaan',
      from: beforeComputed.roots as string,
      to: afterComputed.roots as string,
    },
    keyInsight,
    nextPrompt: 'Coba atur nilai diskriminan tepat sama dengan nol untuk mengamati kondisi akar kembar.',
  };
}

function createInitialState(params: Record<string, number>): SimulationState {
  return { parameters: { ...params }, computed: compute(params), time: 0, running: false };
}

function update(state: SimulationState, _dt: number): SimulationState {
  return state;
}

export const functionExplorer: SimulationDefinition = {
  spec,
  createInitialState,
  update,
  compute,
  experiments,
  generateInsight,
};
