import type { SimulationSpecification, ExperimentChallenge } from '@genlab/simulation-types';
import type { SimulationDefinition } from '../engine';

const spec: SimulationSpecification = {
  engine: 'statistics',
  simulation: 'normal_distribution',
  version: 1,
  title: 'Distribusi Normal Gauss & Kaidah Empiris',
  description: 'Eksplorasi kurva lonceng normal Gauss. Ubah rata-rata (μ) dan simpangan baku (σ) untuk mengamati pergeseran kurva, z-score, dan luas probabilitas kumulatif.',
  domain: 'Statistika',
  concepts: ['distribusi normal', 'kurva gauss', 'rata-rata', 'standar deviasi', 'z-score', 'aturan empiris'],
  parameters: {
    mean: { value: 0.0, min: -5.0, max: 5.0, step: 0.5, unit: 'μ', label: 'Rata-rata (μ)' },
    stdDev: { value: 1.0, min: 0.5, max: 3.0, step: 0.1, unit: 'σ', label: 'Simpangan Baku (σ)' },
    testPoint: { value: 1.0, min: -8.0, max: 8.0, step: 0.2, unit: 'x', label: 'Titik Uji (x)' },
  },
  controls: ['mean', 'stdDev', 'testPoint'],
};

// Numerical approximation for error function erf(x)
function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

function compute(params: Record<string, number>): Record<string, number | string> {
  const { mean = 0.0, stdDev = 1.0, testPoint = 1.0 } = params;
  const sigma = Math.max(0.1, stdDev);

  // Z-Score: z = (x - μ) / σ
  const zScore = (testPoint - mean) / sigma;

  // PDF: f(x) = (1 / (σ√(2π))) * exp(-0.5 * z²)
  const pdf = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * zScore * zScore);

  // CDF: P(X ≤ x) = 0.5 * (1 + erf(z / √2))
  const cdf = 0.5 * (1 + erf(zScore / Math.SQRT2));

  return {
    zScore: Math.round(zScore * 100) / 100,
    pdf: Math.round(pdf * 1000) / 1000,
    cdf: Math.round(cdf * 1000) / 1000,
    cdfPercent: Math.round(cdf * 1000) / 10,
    zScore_display: `z = ${zScore.toFixed(2)}`,
    cdf_display: `P(X ≤ ${testPoint.toFixed(1)}) = ${(cdf * 100).toFixed(1)}%`,
    pdf_display: `f(${testPoint.toFixed(1)}) = ${pdf.toFixed(3)}`,
    equation: `z = (${testPoint.toFixed(1)} - ${mean.toFixed(1)}) / ${sigma.toFixed(1)} = ${zScore.toFixed(2)}`,
  };
}

const experiments: ExperimentChallenge[] = [
  {
    id: 'reach-two-sigma',
    title: 'Titik 2-Sigma (97.7% Persentil)',
    objective: 'Bentuk z-score tepat 2.00 pada titik uji x.',
    description: 'Atur titik uji x berada tepat dua simpangan baku di atas rata-rata (x = μ + 2σ) sehingga mencakup ~97.7% populasi.',
    allowedParameters: ['testPoint'],
    targetCondition: {
      output: 'zScore',
      operator: '==',
      value: 2.00,
      tolerance: 0.05,
    },
    hint: 'Gunakan persamaan x = μ + 2σ. Jika μ = 0 dan σ = 1, pilih x = 2.0.',
  },
];

export const normalDistribution: SimulationDefinition = {
  spec,
  compute,
  experiments,
};
