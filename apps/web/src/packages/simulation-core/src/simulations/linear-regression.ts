import type { SimulationSpecification, ExperimentChallenge } from '@genlab/simulation-types';
import type { SimulationDefinition } from '../engine';

const spec: SimulationSpecification = {
  engine: 'statistics',
  simulation: 'linear_regression',
  version: 1,
  title: 'Regresi Linear & Garis Kecocokan Terbaik',
  description: 'Eksplorasi estimasi Ordinary Least Squares (OLS) untuk memodelkan hubungan dua variabel data, koefisien korelasi Pearson r, dan nilai R².',
  domain: 'Statistika',
  concepts: ['regresi linear', 'least squares', 'korelasi pearson', 'r-squared', 'garis tren', 'galat kuadrat terkecil'],
  parameters: {
    trueSlope: { value: 1.5, min: -3.0, max: 3.0, step: 0.1, unit: 'm', label: 'Kemiringan Tren (m)' },
    trueIntercept: { value: 2.0, min: -5.0, max: 5.0, step: 0.5, unit: 'c', label: 'Titik Potong (c)' },
    noise: { value: 1.5, min: 0.0, max: 5.0, step: 0.25, unit: 'σ', label: 'Tingkat Noise Galat' },
    sampleSize: { value: 15, min: 8, max: 30, step: 1, unit: 'n', label: 'Jumlah Titik Sampel' },
  },
  controls: ['trueSlope', 'trueIntercept', 'noise', 'sampleSize'],
};

export function generateRegressionPoints(n: number, slope: number, intercept: number, noise: number) {
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < n; i++) {
    const x = i + 1;
    // Deterministic pseudo-noise
    const pseudoErr = Math.sin(i * 12.9898 + 78.233) * noise;
    const y = slope * x + intercept + pseudoErr;
    points.push({ x, y: Math.round(y * 100) / 100 });
  }
  return points;
}

function compute(params: Record<string, number>): Record<string, number | string> {
  const { trueSlope = 1.5, trueIntercept = 2.0, noise = 1.5, sampleSize = 15 } = params;
  const n = Math.floor(sampleSize);
  const points = generateRegressionPoints(n, trueSlope, trueIntercept, noise);

  // OLS Formula
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
    sumY2 += p.y * p.y;
  }

  const meanX = sumX / n;
  const meanY = sumY / n;

  const denomM = (n * sumX2 - sumX * sumX);
  const calcSlope = denomM !== 0 ? (n * sumXY - sumX * sumY) / denomM : 0;
  const calcIntercept = meanY - calcSlope * meanX;

  // Correlation r and R²
  const numR = (n * sumXY - sumX * sumY);
  const denomR = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  const r = denomR !== 0 ? numR / denomR : 0;
  const rSquared = Math.max(0, Math.min(1, r * r));

  return {
    calcSlope: Math.round(calcSlope * 100) / 100,
    calcIntercept: Math.round(calcIntercept * 100) / 100,
    correlationR: Math.round(r * 100) / 100,
    rSquared: Math.round(rSquared * 100) / 100,
    modelEquation: `y = ${calcSlope.toFixed(2)}x + ${calcIntercept.toFixed(2)}`,
    rSquared_display: `${(rSquared * 100).toFixed(1)}%`,
    correlation_display: `r = ${r.toFixed(2)}`,
    equation: `Model OLS: y = ${calcSlope.toFixed(2)}x + ${calcIntercept.toFixed(2)} (R² = ${(rSquared * 100).toFixed(1)}%)`,
  };
}

const experiments: ExperimentChallenge[] = [
  {
    id: 'high-r-squared-95',
    title: 'Model Presisi Tinggi (R² ≥ 0.90)',
    objective: 'Capai koefisien determinasi R² ≥ 0.90 dengan menekan noise.',
    description: 'Turunkan tingkat noise variabel galat (misal noise ≤ 0.5) untuk membuktikan bahwa data yang mendekati garis linear lurus menghasilkan R² mendekati 1.0.',
    allowedParameters: ['noise'],
    targetCondition: {
      output: 'rSquared',
      operator: '>=',
      value: 0.90,
      tolerance: 0.02,
    },
    hint: 'Semakin kecil noise, titik-titik data semakin rapat pada garis regresi.',
  },
];

export const linearRegression: SimulationDefinition = {
  spec,
  compute,
  experiments,
};
