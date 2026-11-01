import type { SimulationSpecification, ExperimentChallenge } from '@genlab/simulation-types';
import type { SimulationDefinition } from '../engine';

const spec: SimulationSpecification = {
  engine: 'mathematics',
  simulation: 'vector_math',
  version: 1,
  title: 'Operasi Vektor 2D',
  description: 'Visualisasi penjumlahan vektor, peruraian komponen kartesius X-Y, perhitungan magnitudo, sudut resultan, dan perkalian skalar titik (dot product).',
  domain: 'Matematika',
  concepts: ['vektor 2d', 'resultan', 'komponen kartesius', 'magnitudo', 'dot product', 'sudut arah'],
  parameters: {
    ax: { value: 4, min: -10, max: 10, step: 1, unit: 'u', label: 'Komponen Ax' },
    ay: { value: 3, min: -10, max: 10, step: 1, unit: 'u', label: 'Komponen Ay' },
    bx: { value: 2, min: -10, max: 10, step: 1, unit: 'u', label: 'Komponen Bx' },
    by: { value: 5, min: -10, max: 10, step: 1, unit: 'u', label: 'Komponen By' },
  },
  controls: ['ax', 'ay', 'bx', 'by'],
};

function compute(params: Record<string, number>): Record<string, number | string> {
  const { ax = 4, ay = 3, bx = 2, by = 5 } = params;

  const rx = ax + bx;
  const ry = ay + by;

  const magA = Math.sqrt(ax * ax + ay * ay);
  const magB = Math.sqrt(bx * bx + by * by);
  const magR = Math.sqrt(rx * rx + ry * ry);

  const dotProduct = ax * bx + ay * by;
  const radR = Math.atan2(ry, rx);
  const angleDegR = Math.round(((radR * 180) / Math.PI + 360) % 360);

  return {
    rx,
    ry,
    magA: Math.round(magA * 100) / 100,
    magB: Math.round(magB * 100) / 100,
    magR: Math.round(magR * 100) / 100,
    dotProduct: Math.round(dotProduct * 100) / 100,
    angleDegR,
    magR_display: `${magR.toFixed(2)} unit`,
    dotProduct_display: `${dotProduct.toFixed(0)}`,
    resultant_vector: `R = (${rx}i + ${ry}j)`,
    equation: `|R| = √(${rx}² + ${ry}²) = ${magR.toFixed(2)}`,
  };
}

const experiments: ExperimentChallenge[] = [
  {
    id: 'reach-resultant-10',
    title: 'Target Magnitudo Resultan 10',
    objective: 'Bentuk vektor resultan dengan panjang magnitudo tepat 10.0 unit.',
    description: 'Atur komponen vektor B agar panjang vektor resultan R = A + B bernilai tepat 10.0 unit.',
    allowedParameters: ['bx', 'by'],
    targetCondition: {
      output: 'magR',
      operator: '==',
      value: 10.0,
      tolerance: 0.1,
    },
    hint: 'Jika Ax = 4 dan Ay = 3, coba buat Rx = 6 dan Ry = 8 (sehingga |R| = √(36+64) = 10).',
  },
  {
    id: 'orthogonal-dot-zero',
    title: 'Vektor Saling Tegak Lurus (Dot Product = 0)',
    objective: 'Buat perkalian titik A · B = 0.',
    description: 'Dua vektor dikatakan ortogonal (tegak lurus) jika dan hanya jika A · B = 0.',
    allowedParameters: ['bx', 'by'],
    targetCondition: {
      output: 'dotProduct',
      operator: '==',
      value: 0,
      tolerance: 0.1,
    },
    hint: 'Ax · Bx + Ay · By = 0. Jika Ax=4, Ay=3, pilih Bx=-3 dan By=4.',
  },
];

export const vectorMath: SimulationDefinition = {
  spec,
  compute,
  experiments,
};
