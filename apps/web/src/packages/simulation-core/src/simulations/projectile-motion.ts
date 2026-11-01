import type { SimulationSpecification, ExperimentChallenge } from '@genlab/simulation-types';
import type { SimulationDefinition } from '../engine';

const spec: SimulationSpecification = {
  engine: 'physics',
  simulation: 'projectile_motion',
  version: 1,
  title: 'Gerak Parabola & Kinematika Peluru',
  description: 'Eksplorasi sudut tembak elevasi, kecepatan awal peluru, dan pengaruh gravitasi terhadap jarak maksimum serta waktu melayang.',
  domain: 'Fisika',
  concepts: ['kinematika 2d', 'gerak parabola', 'sudut elevasi', 'kecepatan awal', 'gravitasi', 'jarak jangkauan'],
  parameters: {
    velocity: { value: 25, min: 5, max: 50, step: 1, unit: 'm/s', label: 'Kecepatan Awal (v₀)' },
    angle: { value: 30, min: 10, max: 85, step: 1, unit: '°', label: 'Sudut Elevasi (θ)' },
    gravity: { value: 9.81, min: 1.6, max: 24.8, step: 0.1, unit: 'm/s²', label: 'Gravitasi (g)' },
    y0: { value: 0, min: 0, max: 25, step: 0.5, unit: 'm', label: 'Tinggi Peluncuran (y₀)' },
  },
  controls: ['velocity', 'angle', 'gravity', 'y0'],
};

function compute(params: Record<string, number>): Record<string, number | string> {
  const { velocity = 25, angle = 30, gravity = 9.81, y0 = 0 } = params;
  const g = Math.max(0.1, gravity);
  const initialH = Math.max(0, y0);
  const rad = (angle * Math.PI) / 180;
  const vx = velocity * Math.cos(rad);
  const vy = velocity * Math.sin(rad);

  // General flight time accounting for initial elevation y0:
  // y(t) = y0 + vy*t - 0.5*g*t^2 = 0
  const flightTime = (vy + Math.sqrt(Math.max(0, vy * vy + 2 * g * initialH))) / g;
  const range = vx * flightTime;
  const maxHeight = initialH + (vy * vy) / (2 * g);

  return {
    flightTime: Math.round(flightTime * 100) / 100,
    range: Math.round(range * 100) / 100,
    maxHeight: Math.round(maxHeight * 100) / 100,
    vx: Math.round(vx * 100) / 100,
    vy: Math.round(vy * 100) / 100,
    y0: initialH,
    range_display: `${(Math.round(range * 10) / 10).toFixed(1)} m`,
    maxHeight_display: `${(Math.round(maxHeight * 10) / 10).toFixed(1)} m`,
    flightTime_display: `${flightTime.toFixed(2)} s`,
    equation: `R = v_x \\cdot t_{\\text{flight}} = ${(Math.round(range * 10) / 10).toFixed(1)} m`,
  };
}

const experiments: ExperimentChallenge[] = [
  {
    id: 'optimal-angle-45',
    title: 'Uji Sudut Optimal 45°',
    objective: 'Capai jarak jangkauan horizontal R ≥ 63.5 meter pada v₀ = 25 m/s.',
    description: 'Atur sudut elevasi ke nilai optimal 45° pada bumi (g = 9.8 m/s²) untuk memaksimalkan jarak tembak.',
    allowedParameters: ['angle'],
    targetCondition: {
      output: 'range',
      operator: '>=',
      value: 63.5,
      tolerance: 0.5,
    },
    hint: 'Jarak terjauh dicapai saat sin(2θ) bernilai maksimum 1, yaitu saat 2θ = 90° atau θ = 45°.',
    hints: ['R = (v₀² sin 2θ) / g', 'Pada v₀ = 25 dan g = 9.8, nilai R maksimum adalah 625 / 9.8 ≈ 63.78 m.'],
  },
  {
    id: 'target-height-20',
    title: 'Ketinggian Puncak Maksimum',
    objective: 'Capai tinggi puncak H_max tepat 20.0 meter.',
    description: 'Sesuaikan sudut elevasi dan kecepatan awal agar peluru menyentuh ketinggian puncak 20.0 meter.',
    allowedParameters: ['velocity', 'angle'],
    targetCondition: {
      output: 'maxHeight',
      operator: '==',
      value: 20.0,
      tolerance: 0.5,
    },
    hint: 'Gunakan persamaan H_max = (v₀² sin² θ) / (2g).',
  },
];

export const projectileMotion: SimulationDefinition = {
  spec,
  compute,
  experiments,
};
