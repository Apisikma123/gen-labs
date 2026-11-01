import type { SimulationSpecification, ExperimentChallenge } from '@genlab/simulation-types';
import type { SimulationDefinition } from '../engine';

const spec: SimulationSpecification = {
  engine: 'economics',
  simulation: 'compound_interest',
  version: 1,
  title: 'Bunga Majemuk Eksponensial (Compound Interest)',
  description: 'Visualisasi pertumbuhan nilai uang masa depan. Amati efek eksponensial suku bunga, durasi investasi, dan frekuensi majemuk (Rule of 72).',
  domain: 'Ekonomi',
  concepts: ['bunga majemuk', 'compound interest', 'investasi', 'eksponensial', 'nilai masa depan', 'rule of 72'],
  parameters: {
    principal: { value: 10, min: 1, max: 100, step: 1, unit: 'jt Rp', label: 'Modal Awal (P)' },
    ratePercent: { value: 8, min: 1, max: 20, step: 0.5, unit: '%/th', label: 'Suku Bunga Tahunan (r)' },
    years: { value: 10, min: 1, max: 30, step: 1, unit: 'th', label: 'Jangka Waktu (t)' },
    compoundsPerYear: { value: 12, min: 1, max: 12, step: 1, unit: 'x/th', label: 'Frekuensi Majemuk (n)' },
  },
  controls: ['principal', 'ratePercent', 'years', 'compoundsPerYear'],
};

function compute(params: Record<string, number>): Record<string, number | string> {
  const { principal = 10, ratePercent = 8, years = 10, compoundsPerYear = 12 } = params;
  const r = ratePercent / 100;
  const n = Math.max(1, compoundsPerYear);
  const t = years;

  // A = P * (1 + r/n)^(n*t)
  const finalAmount = principal * Math.pow(1 + r / n, n * t);
  const totalInterest = finalAmount - principal;
  const multiplier = principal > 0 ? finalAmount / principal : 1;
  const rule72Years = ratePercent > 0 ? 72 / ratePercent : 0;

  return {
    finalAmount: Math.round(finalAmount * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    multiplier: Math.round(multiplier * 100) / 100,
    rule72Years: Math.round(rule72Years * 10) / 10,
    finalAmount_display: `Rp\u00A0${(finalAmount).toFixed(2)}\u00A0jt`,
    totalInterest_display: `Rp\u00A0${(totalInterest).toFixed(2)}\u00A0jt`,
    multiplier_display: `${multiplier.toFixed(2)}x lipat`,
    rule72_display: `Lipat dua setiap ~${rule72Years.toFixed(1)} tahun`,
    equation: `A = ${principal} · (1 + ${r.toFixed(2)}/${n})^(${n}·${t}) = Rp\u00A0${finalAmount.toFixed(2)}\u00A0jt`,
  };
}

const experiments: ExperimentChallenge[] = [
  {
    id: 'double-money-target',
    title: 'Pelipatgandaan Modal (2.0x)',
    objective: 'Capai nilai pelipatgandaan modal akhir ≥ 2.0x dari modal awal.',
    description: 'Atur suku bunga tahunan atau durasi tahun sehingga uang bertumbuh minimal dua kali lipat dari modal pokok.',
    allowedParameters: ['ratePercent', 'years'],
    targetCondition: {
      output: 'multiplier',
      operator: '>=',
      value: 2.0,
      tolerance: 0.05,
    },
    hint: 'Berdasarkan Kaidah 72, jika r = 8%, modal berlipat dua dalam 72/8 = 9 tahun.',
  },
];

export const compoundInterest: SimulationDefinition = {
  spec,
  compute,
  experiments,
};
