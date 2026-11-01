import { UnifiedSimulatorSpec } from './simulator-schema';

export interface SimulationTemplateMeta {
  id: string;
  name: string;
  description: string;
  category: string;
  spec: UnifiedSimulatorSpec;
}

export const SIMULATION_TEMPLATES: SimulationTemplateMeta[] = [
  // 1. Parameter + Formula
  {
    id: 'parameter-formula',
    name: '1. Parameter + Formula',
    description: 'Model matematis umum dengan variabel kontrol dan kalkulasi formula turunan.',
    category: 'Matematika & Teori',
    spec: {
      id: 'tpl-parameter-formula',
      slug: 'template-parameter-formula',
      info: {
        title: 'Template: Parameter + Formula',
        description: 'Simulasi berbasis rumus dengan slider kontrol dan evaluasi nilai secara langsung.',
        discipline: 'Sains & Matematika',
        topic: 'Kalkulasi Proporsional',
        difficulty: 'basic',
        estimatedTime: '10 menit',
        status: 'draft',
        version: 1,
      },
      parameters: {
        x: { key: 'x', label: 'Variabel X', min: 1, max: 50, step: 1, defaultVal: 10, unit: 'unit' },
        rate: { key: 'rate', label: 'Laju (Rate)', min: 0.1, max: 5, step: 0.1, defaultVal: 1.5, unit: 'x' },
      },
      calculations: {
        output: { key: 'output', label: 'Hasil Evaluasi', formula: 'x * rate', unit: 'unit' },
      },
      visual: {
        viewBox: { width: 640, height: 360 },
        groundPlane: true,
        elements: [
          { id: 'grid', type: 'grid', x: 20, y: 20, width: 600, height: 320, color: 'var(--color-border-subtle)' },
          { id: 'box', type: 'shape', x: '50 + x * 5', y: 180, width: 60, height: 60, fill: 'var(--color-primary)', label: 'Objek X' },
        ],
      },
      results: [
        { key: 'res-out', label: 'Output Terhitung', calculationKey: 'output', unit: 'unit', highlight: true },
      ],
      insight: {
        summary: 'Keluaran sistem bernilai proporsional terhadap pengali laju.',
        causeAndEffect: 'Meningkatkan variabel X atau laju secara langsung meningkatkan hasil akhir.',
      },
      experiments: [
        {
          id: 'exp-1',
          title: 'Mencapai Output Target 30',
          objective: 'Sesuaikan variabel X dan laju sehingga output sistem tepat bernilai 30 unit.',
          targetMetric: 'output',
          targetValue: 30,
          tolerance: 0.5,
          unit: 'unit',
          successMessage: 'Target output 30 unit berhasil dicapai secara tepat.',
        },
      ],
    },
  },

  // 2. Parameter + Chart
  {
    id: 'parameter-chart',
    name: '2. Parameter + Chart',
    description: 'Visualisasi grafik metrik dan kurva responsif berdasarkan input variabel.',
    category: 'Visualisasi Data',
    spec: {
      id: 'tpl-parameter-chart',
      slug: 'template-parameter-chart',
      info: {
        title: 'Template: Parameter + Chart',
        description: 'Simulasi dengan visualisasi diagram garis/batang yang merespons perubahan parameter.',
        discipline: 'Analisis Data',
        topic: 'Visualisasi Grafik',
        difficulty: 'intermediate',
        estimatedTime: '15 menit',
        status: 'draft',
        version: 1,
      },
      parameters: {
        amplitude: { key: 'amplitude', label: 'Amplitudo', min: 10, max: 100, step: 5, defaultVal: 50, unit: 'px' },
        frequency: { key: 'frequency', label: 'Frekuensi', min: 1, max: 10, step: 1, defaultVal: 3, unit: 'Hz' },
      },
      calculations: {
        peak: { key: 'peak', label: 'Puncak Gelombang', formula: 'amplitude', unit: 'px' },
        period: { key: 'period', label: 'Periode (T)', formula: '1 / frequency', unit: 's' },
      },
      visual: {
        viewBox: { width: 640, height: 360 },
        groundPlane: false,
        elements: [
          { id: 'axis', type: 'line', x: 40, y: 180, x2: 600, y2: 180, stroke: 'var(--color-border)', strokeWidth: 2 },
          { id: 'chart-curve', type: 'curve', x: 40, y: 180, stroke: 'var(--color-primary)', strokeWidth: 3 },
        ],
      },
      results: [
        { key: 'res-peak', label: 'Amplitudo Maksimum', calculationKey: 'peak', unit: 'px', highlight: true },
        { key: 'res-t', label: 'Periode Siklus', calculationKey: 'period', unit: 's' },
      ],
      insight: {
        summary: 'Frekuensi yang lebih tinggi merapatkan gelombang dalam selang waktu yang sama.',
        causeAndEffect: 'Peningkatan amplitudo menaikkan rentang fluktuasi grafik.',
      },
      experiments: [
        {
          id: 'exp-chart-1',
          title: 'Target Puncak Gelombang 80 px',
          objective: 'Atur amplitudo hingga tinggi gelombang mencapai 80 px.',
          targetMetric: 'peak',
          targetValue: 80,
          tolerance: 1,
          unit: 'px',
          successMessage: 'Puncak gelombang 80 px tercapai.',
        },
      ],
    },
  },

  // 3. Object + Parameter
  {
    id: 'object-parameter',
    name: '3. Object + Parameter',
    description: 'Eksperimen gerak fisik objek (posisi, gaya, interaksi massa pada bidang).',
    category: 'Fisika & Mekanika',
    spec: {
      id: 'tpl-object-parameter',
      slug: 'template-object-parameter',
      info: {
        title: 'Template: Object + Parameter',
        description: 'Simulasi interaksi benda fisik pada bidang datar dengan parameter gaya dan massa.',
        discipline: 'Fisika',
        topic: 'Dinamika Gerak',
        difficulty: 'basic',
        estimatedTime: '15 menit',
        status: 'draft',
        version: 1,
      },
      parameters: {
        force: { key: 'force', label: 'Gaya Dorong (F)', min: 0, max: 100, step: 5, defaultVal: 40, unit: 'N' },
        mass: { key: 'mass', label: 'Massa Benda (m)', min: 1, max: 20, step: 1, defaultVal: 5, unit: 'kg' },
      },
      calculations: {
        acceleration: { key: 'acceleration', label: 'Percepatan (a)', formula: 'force / mass', unit: 'm/s²' },
      },
      visual: {
        viewBox: { width: 640, height: 360 },
        groundPlane: true,
        elements: [
          { id: 'cart', type: 'shape', x: 260, y: 200, width: 80, height: 50, fill: 'var(--color-primary)', label: 'Benda' },
          { id: 'force-arrow', type: 'arrow', x: 340, y: 225, x2: '340 + force * 1.5', y2: 225, stroke: 'var(--color-secondary)' },
        ],
      },
      results: [
        { key: 'res-a', label: 'Percepatan', calculationKey: 'acceleration', unit: 'm/s²', highlight: true },
      ],
      insight: {
        summary: 'Percepatan berbanding lurus dengan resultan gaya dan berbanding terbalik dengan massa.',
        causeAndEffect: 'Menambah massa dengan gaya tetap menyebabkan percepatan menurun.',
      },
      experiments: [
        {
          id: 'exp-newton-1',
          title: 'Target Percepatan 8 m/s²',
          objective: 'Ubah gaya dan massa agar percepatan balok tepat mencapai 8 m/s².',
          targetMetric: 'acceleration',
          targetValue: 8,
          tolerance: 0.1,
          unit: 'm/s²',
          successMessage: 'Percepatan 8 m/s² berhasil dibuktikan.',
        },
      ],
    },
  },

  // 4. Comparison (State A vs B)
  {
    id: 'comparison',
    name: '4. Comparison',
    description: 'Analisis komparatif dua skenario/kondisi sistem secara berdampingan.',
    category: 'Analisis & Komparasi',
    spec: {
      id: 'tpl-comparison',
      slug: 'template-comparison',
      info: {
        title: 'Template: Comparison',
        description: 'Simulasi untuk membandingkan efisiensi atau hasil antara dua konfigurasi berbeda.',
        discipline: 'Manajemen & Teknik',
        topic: 'Trade-off & Optimasi',
        difficulty: 'intermediate',
        estimatedTime: '20 menit',
        status: 'draft',
        version: 1,
      },
      parameters: {
        inputA: { key: 'inputA', label: 'Input Kasus A', min: 10, max: 200, step: 10, defaultVal: 100, unit: 'unit' },
        costA: { key: 'costA', label: 'Biaya Unit A', min: 5, max: 50, step: 5, defaultVal: 20, unit: 'USD' },
      },
      calculations: {
        totalCost: { key: 'totalCost', label: 'Total Biaya', formula: 'inputA * costA', unit: 'USD' },
      },
      visual: {
        viewBox: { width: 640, height: 360 },
        groundPlane: false,
        elements: [
          { id: 'balance-base', type: 'balance', x: 320, y: 220, label: 'Neraca Komparasi' },
        ],
      },
      results: [
        { key: 'res-cost', label: 'Total Biaya Sistem', calculationKey: 'totalCost', unit: 'USD', highlight: true },
      ],
      insight: {
        summary: 'Perbandingan parameter memungkinkan evaluasi sensitivitas biaya sebelum penerapan aktual.',
        causeAndEffect: 'Penurunan biaya satuan secara dramatis menurunkan anggaran total pada skala tinggi.',
      },
      experiments: [
        {
          id: 'exp-comp-1',
          title: 'Target Biaya 1500 USD',
          objective: 'Sesuaikan variabel volume dan biaya agar total biaya sistem berada di angka 1500 USD.',
          targetMetric: 'totalCost',
          targetValue: 1500,
          tolerance: 50,
          unit: 'USD',
          successMessage: 'Anggaran target 1500 USD tercapai.',
        },
      ],
    },
  },

  // 5. Process Flow
  {
    id: 'process-flow',
    name: '5. Process Flow',
    description: 'Alur tahapan sekuensial dengan tingkat konversi atau waktu transit antar fase.',
    category: 'Proses & Rekayasa',
    spec: {
      id: 'tpl-process-flow',
      slug: 'template-process-flow',
      info: {
        title: 'Template: Process Flow',
        description: 'Simulasi tahapan proses berurutan dengan laju aliran antar stasiun kerja.',
        discipline: 'Operasional & Bisnis',
        topic: 'Alur Kerja & Kapasitas',
        difficulty: 'intermediate',
        estimatedTime: '15 menit',
        status: 'draft',
        version: 1,
      },
      parameters: {
        inflow: { key: 'inflow', label: 'Debit Masuk', min: 10, max: 100, step: 5, defaultVal: 50, unit: 'L/s' },
        efficiency: { key: 'efficiency', label: 'Efisiensi Tahap (%)', min: 50, max: 100, step: 5, defaultVal: 80, unit: '%' },
      },
      calculations: {
        outflow: { key: 'outflow', label: 'Debit Keluaran', formula: 'inflow * (efficiency / 100)', unit: 'L/s' },
      },
      visual: {
        viewBox: { width: 640, height: 360 },
        elements: [
          { id: 'station1', type: 'shape', x: 80, y: 140, width: 120, height: 80, fill: 'var(--color-surface-subtle)', label: 'Tahap 1' },
          { id: 'flow-arrow', type: 'arrow', x: 210, y: 180, x2: 370, y2: 180, stroke: 'var(--color-primary)' },
          { id: 'station2', type: 'shape', x: 380, y: 140, width: 120, height: 80, fill: 'var(--color-surface-subtle)', label: 'Tahap 2' },
        ],
      },
      results: [
        { key: 'res-outflow', label: 'Aliran Akhir', calculationKey: 'outflow', unit: 'L/s', highlight: true },
      ],
      insight: {
        summary: 'Efisiensi proses membatasi kapasitas maksimal keluaran seluruh rantai produksi.',
        causeAndEffect: 'Penyumbatan pada tahap pertama langsung memangkas hasil tahap akhir.',
      },
      experiments: [
        {
          id: 'exp-flow-1',
          title: 'Target Debit Keluaran 40 L/s',
          objective: 'Atur debit masuk dan efisiensi sehingga laju keluaran tepat 40 L/s.',
          targetMetric: 'outflow',
          targetValue: 40,
          tolerance: 1,
          unit: 'L/s',
          successMessage: 'Debit keluaran 40 L/s berhasil distabilkan.',
        },
      ],
    },
  },

  // 6. Node Graph
  {
    id: 'node-graph',
    name: '6. Node Graph',
    description: 'Visualisasi graf jaringan berarah / tak berarah dengan bobot dan keterhubungan simpul.',
    category: 'Struktur Data & Jaringan',
    spec: {
      id: 'tpl-node-graph',
      slug: 'template-node-graph',
      info: {
        title: 'Template: Node Graph',
        description: 'Simulasi struktur jaringan simpul (nodes) dan sisi (edges) untuk analisis topologi.',
        discipline: 'Teknologi Informasi',
        topic: 'Teori Graf',
        difficulty: 'advanced',
        estimatedTime: '20 menit',
        status: 'draft',
        version: 1,
      },
      parameters: {
        nodes: { key: 'nodes', label: 'Jumlah Simpul', min: 3, max: 10, step: 1, defaultVal: 5, unit: 'simpul' },
        connectivity: { key: 'connectivity', label: 'Kerapatan Hubungan', min: 1, max: 5, step: 1, defaultVal: 2, unit: 'tingkat' },
      },
      calculations: {
        edges: { key: 'edges', label: 'Perkiraan Jumlah Sisi', formula: 'nodes * connectivity', unit: 'sisi' },
      },
      visual: {
        viewBox: { width: 640, height: 360 },
        elements: [
          { id: 'nodeA', type: 'shape', x: 200, y: 120, radius: 24, fill: 'var(--color-primary)', label: 'A' },
          { id: 'nodeB', type: 'shape', x: 440, y: 120, radius: 24, fill: 'var(--color-primary)', label: 'B' },
          { id: 'nodeC', type: 'shape', x: 320, y: 260, radius: 24, fill: 'var(--color-secondary)', label: 'C' },
          { id: 'edgeAB', type: 'line', x: 200, y: 120, x2: 440, y2: 120, stroke: 'var(--color-border)', strokeWidth: 2 },
          { id: 'edgeAC', type: 'line', x: 200, y: 120, x2: 320, y2: 260, stroke: 'var(--color-border)', strokeWidth: 2 },
          { id: 'edgeBC', type: 'line', x: 440, y: 120, x2: 320, y2: 260, stroke: 'var(--color-border)', strokeWidth: 2 },
        ],
      },
      results: [
        { key: 'res-edges', label: 'Kapasitas Hubungan', calculationKey: 'edges', unit: 'sisi', highlight: true },
      ],
      insight: {
        summary: 'Jumlah sisi graf bertumbuh cepat terhadap kerapatan simpul.',
        causeAndEffect: 'Semakin tinggi konektivitas, semakin pendek jarak rata-rata penelusuran.',
      },
      experiments: [
        {
          id: 'exp-graph-1',
          title: 'Target 12 Sisi Jaringan',
          objective: 'Konfigurasikan simpul dan tingkat konektivitas agar terbentuk 12 sisi.',
          targetMetric: 'edges',
          targetValue: 12,
          tolerance: 0.5,
          unit: 'sisi',
          successMessage: 'Topologi 12 sisi berhasil terkonfigurasi.',
        },
      ],
    },
  },

  // 7. Table + Calculation
  {
    id: 'table-calculation',
    name: '7. Table + Calculation',
    description: 'Tabel perhitungan neraca, akuntansi, rugi-laba, atau analisis BEP terstruktur.',
    category: 'Akuntansi & Keuangan',
    spec: {
      id: 'tpl-table-calculation',
      slug: 'template-table-calculation',
      info: {
        title: 'Template: Table + Calculation',
        description: 'Simulasi titik impas (Break Even Point) dan neraca keuangan usaha.',
        discipline: 'Akuntansi & Bisnis',
        topic: 'Analisis Biaya Volume Laba',
        difficulty: 'intermediate',
        estimatedTime: '15 menit',
        status: 'draft',
        version: 1,
      },
      parameters: {
        fixedCost: { key: 'fixedCost', label: 'Biaya Tetap (FC)', min: 1000, max: 10000, step: 500, defaultVal: 5000, unit: 'USD' },
        price: { key: 'price', label: 'Harga Jual / Unit (P)', min: 10, max: 100, step: 5, defaultVal: 30, unit: 'USD' },
        varCost: { key: 'varCost', label: 'Biaya Variabel / Unit (VC)', min: 5, max: 50, step: 2, defaultVal: 10, unit: 'USD' },
      },
      calculations: {
        bepUnits: { key: 'bepUnits', label: 'BEP (Unit)', formula: 'fixedCost / (price - varCost)', unit: 'unit' },
      },
      visual: {
        viewBox: { width: 640, height: 360 },
        elements: [
          { id: 'balance-table', type: 'balance', x: 320, y: 200, label: 'Keseimbangan BEP' },
        ],
      },
      results: [
        { key: 'res-bep', label: 'Titik Impas (BEP)', calculationKey: 'bepUnits', unit: 'unit', highlight: true },
      ],
      insight: {
        summary: 'BEP tercapai saat total penerimaan menutup seluruh biaya tetap dan variabel.',
        causeAndEffect: 'Menaikkan margin kontribusi (P - VC) memperkecil unit yang perlu terjual.',
      },
      experiments: [
        {
          id: 'exp-bep-1',
          title: 'Target Titik Impas 250 Unit',
          objective: 'Sesuaikan biaya tetap dan harga jual agar BEP tercapai pada 250 unit.',
          targetMetric: 'bepUnits',
          targetValue: 250,
          tolerance: 5,
          unit: 'unit',
          successMessage: 'Target BEP 250 unit berhasil dibuktikan.',
        },
      ],
    },
  },

  // 8. Experiment Challenge
  {
    id: 'experiment-challenge',
    name: '8. Experiment Challenge',
    description: 'Template yang difokuskan khusus pada skenario uji coba berbasis target pencapaian.',
    category: 'Eksperimen Bebas',
    spec: {
      id: 'tpl-experiment-challenge',
      slug: 'template-experiment-challenge',
      info: {
        title: 'Template: Experiment Challenge',
        description: 'Simulasi dengan multi-target tantangan untuk menguji intuisi empiris pengguna.',
        discipline: 'Sains Eksperimental',
        topic: 'Hipotesis & Validasi',
        difficulty: 'advanced',
        estimatedTime: '20 menit',
        status: 'draft',
        version: 1,
      },
      parameters: {
        controlA: { key: 'controlA', label: 'Variabel Kontrol A', min: 1, max: 50, step: 1, defaultVal: 12, unit: 'pts' },
        controlB: { key: 'controlB', label: 'Variabel Kontrol B', min: 1, max: 50, step: 1, defaultVal: 8, unit: 'pts' },
      },
      calculations: {
        systemScore: { key: 'systemScore', label: 'Skor Sistem', formula: 'controlA * 2 + controlB * 3', unit: 'skor' },
      },
      visual: {
        viewBox: { width: 640, height: 360 },
        groundPlane: true,
        elements: [
          { id: 'target-circle', type: 'shape', x: 320, y: 180, radius: 60, stroke: 'var(--color-primary)', fill: 'var(--color-surface-subtle)', label: 'Zona Target' },
        ],
      },
      results: [
        { key: 'res-score', label: 'Skor Sistem', calculationKey: 'systemScore', unit: 'skor', highlight: true },
      ],
      insight: {
        summary: 'Kombinasi kedua variabel kontrol menentukan posisi dalam zona toleransi target.',
        causeAndEffect: 'Bobot variabel B lebih dominan terhadap skor total dibanding variabel A.',
      },
      experiments: [
        {
          id: 'exp-multi-1',
          title: 'Target Skor 50',
          objective: 'Cari kombinasi nilai kontrol A dan B agar skor sistem bernilai 50.',
          targetMetric: 'systemScore',
          targetValue: 50,
          tolerance: 1,
          unit: 'skor',
          successMessage: 'Tantangan skor 50 berhasil diselesaikan!',
        },
      ],
    },
  },
];
