import type { SimulationSpecification, ExperimentChallenge } from '@genlab/simulation-types';
import type { SimulationDefinition } from '../engine';

const spec: SimulationSpecification = {
  engine: 'chemistry',
  simulation: 'ph_scale',
  version: 1,
  title: 'Skala pH & Konsentrasi Ion Larutan',
  description: 'Eksplorasi hubungan logaritmik konsentrasi ion hidrogen [H+] dan hidroksida [OH-]. Amati skala pH 0-14, tetapan air Kw, dan perubahan warna indikator.',
  domain: 'Kimia',
  concepts: ['ph', 'asam basa', 'konsentrasi ion h+', 'skala logaritmik', 'tetapan air kw', 'indikator universal'],
  parameters: {
    logHConc: { value: -7.0, min: -14.0, max: 0.0, step: 0.1, unit: 'log M', label: 'Eksponen [H⁺] (log M)' },
    solutionVolume: { value: 1.0, min: 0.2, max: 5.0, step: 0.1, unit: 'L', label: 'Volume Larutan' },
  },
  controls: ['logHConc', 'solutionVolume'],
};

function compute(params: Record<string, number>): Record<string, number | string> {
  const { logHConc = -7.0, solutionVolume = 1.0 } = params;

  // pH = -log10[H+]
  const pH = -logHConc;
  const pOH = 14.0 - pH;
  const hMolarity = Math.pow(10, logHConc);
  const ohMolarity = Math.pow(10, -pOH);

  let nature = 'Netral';
  let indicatorColor = '#4b8f8c'; // green/teal neutral

  if (pH < 3.0) {
    nature = 'Asam Kuat';
    indicatorColor = '#ff5c5c'; // strong red
  } else if (pH < 6.5) {
    nature = 'Asam Lemah';
    indicatorColor = '#ba8230'; // warm ochre/orange
  } else if (pH <= 7.5) {
    nature = 'Netral (Air Murni)';
    indicatorColor = '#4b8f8c'; // phosphor cyan/green
  } else if (pH <= 11.0) {
    nature = 'Basa Lemah';
    indicatorColor = '#8ed3cf'; // cyan/light blue
  } else {
    nature = 'Basa Kuat';
    indicatorColor = '#6c7ae0'; // deep blue/violet
  }

  return {
    pH: Math.round(pH * 100) / 100,
    pOH: Math.round(pOH * 100) / 100,
    solutionVolume,
    nature,
    indicatorColor,
    pH_display: `pH ${pH.toFixed(2)}`,
    pOH_display: `pOH ${pOH.toFixed(2)}`,
    nature_display: nature,
    equation: `pH = -log₁₀[H⁺] = ${pH.toFixed(2)} (pH + pOH = 14.0)`,
  };
}

const experiments: ExperimentChallenge[] = [
  {
    id: 'reach-neutral-water',
    title: 'Kondisi Netral Air Murni',
    objective: 'Bentuk larutan netral dengan pH tepat 7.00.',
    description: 'Atur konsentrasi ion [H+] ke 10^-7 M untuk mencapai kondisi netral di mana [H+] = [OH-].',
    allowedParameters: ['logHConc'],
    targetCondition: {
      output: 'pH',
      operator: '==',
      value: 7.00,
      tolerance: 0.1,
    },
    hint: 'Pada air murni suhu 25°C, [H+] = 1.0 × 10^-7 M, sehingga log [H+] = -7.0.',
  },
];

export const phScale: SimulationDefinition = {
  spec,
  compute,
  experiments,
};
