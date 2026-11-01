/**
 * GEN LABS — Five Supported STEM Simulation Archetypes
 * 
 * Defines 5 core verified STEM simulation archetypes genuinely supported
 * by SuperCanvas and the deterministic calculation engine.
 * 
 * 1. physics-dynamics: Kinematika & Dinamika Objek (Hooke, Newton, Gravitasi)
 * 2. math-proportional: Formulasi Matematis & Kurva Polinomial (Kuadrat, Parabola)
 * 3. data-chart: Grafik Responsif & Gelombang Harmonik (Frekuensi, Periode, Amplitudo)
 * 4. process-flow: Alur Proses & Debit Transfer (Stasiun Aliran, Kapasitas)
 * 5. network-graph: Topologi Jaringan & Struktur Simpul (Nodes, Edges, Konektivitas)
 */

import type { UnifiedSimulatorSpec } from './simulator-schema';

export interface StemArchetypeMeta {
  id: string;
  name: string;
  discipline: string;
  archetype: 'physics' | 'chart' | 'balance' | 'grid' | 'sequence' | 'network';
  description: string;
  supportedCapabilities: string[];
  samplePrompts: string[];
  createSpec: (customPrompt?: string) => UnifiedSimulatorSpec;
}

export const STEM_ARCHETYPES: Record<string, StemArchetypeMeta> = {
  'physics-dynamics': {
    id: 'physics-dynamics',
    name: 'Kinematika & Dinamika Objek',
    discipline: 'Fisika',
    archetype: 'physics',
    description: 'Simulasi interaksi benda fisik, vektor gaya, percepatan, tegangan pegas, dan gravitasi pada bidang alat laboratorium.',
    supportedCapabilities: [
      'Gaya mekanik, tegangan pegas, massa inersia, dan medan gravitasi',
      'Vektor panah terikat variabel formula matematika',
      'Komponen apparatus visual dinamis (pegas, balok, penumpu, skala ukur)',
      'Perhitungan deterministic real-time tanpa eval',
      'Tantangan target gaya, percepatan, atau defleksi regangan',
    ],
    samplePrompts: [
      'Eksperimen elastisitas pegas dan konstanta gaya Hukum Hooke',
      'Dinamika gerak benda dengan gaya dorong dan gaya gesek kinetik',
      'Pengaruh massa beban dan gravitasi terhadap osilasi vertikal',
    ],
    createSpec: (prompt?: string): UnifiedSimulatorSpec => {
      const isNewton = (prompt || '').toLowerCase().includes('gesek') || (prompt || '').toLowerCase().includes('dorong');
      if (isNewton) {
        return {
          id: 'sim-dinamika-gerak',
          slug: 'dinamika-gerak',
          info: {
            title: 'Dinamika Gerak & Gaya Gesek',
            description: 'Uji pengaruh gaya dorong, massa balok, dan koefisien gesek terhadap percepatan gerak lurus.',
            discipline: 'Fisika',
            topic: 'Dinamika Newton',
            difficulty: 'basic',
            estimatedTime: '10–15 menit',
            status: 'draft',
            version: 1,
          },
          parameters: {
            force: { key: 'force', label: 'Gaya Dorong (F)', min: 0, max: 100, step: 5, defaultVal: 50, unit: 'N', description: 'Gaya aksi horisontal' },
            mass: { key: 'mass', label: 'Massa Balok (m)', min: 1, max: 20, step: 1, defaultVal: 5, unit: 'kg', description: 'Massa inersia benda' },
            frictionCoeff: { key: 'frictionCoeff', label: 'Koefisien Gesek (μ)', min: 0, max: 0.5, step: 0.05, defaultVal: 0.2, unit: '', description: 'Kekasaran permukaan' },
          },
          calculations: {
            normalForce: { key: 'normalForce', label: 'Gaya Normal (N)', formula: 'mass * 9.8', unit: 'N' },
            frictionForce: { key: 'frictionForce', label: 'Gaya Gesek (f)', formula: 'frictionCoeff * normalForce', unit: 'N' },
            netForce: { key: 'netForce', label: 'Gaya Bersih (F_net)', formula: 'force - frictionForce', unit: 'N' },
            acceleration: { key: 'acceleration', label: 'Percepatan (a)', formula: 'netForce / mass', unit: 'm/s²' },
          },
          visual: {
            viewBox: { width: 640, height: 360 },
            archetype: 'physics',
            groundPlane: true,
            elements: [
              { id: 'track', type: 'line', x: 40, y: 240, x2: 600, y2: 240, stroke: 'var(--color-border)', strokeWidth: 3 },
              { id: 'cart', type: 'shape', x: 260, y: 190, width: 80, height: 50, fill: 'var(--color-primary)', stroke: 'var(--color-secondary)', strokeWidth: 2, label: 'Balok m' },
              { id: 'f-push', type: 'arrow', x: 340, y: 215, x2: '340 + force * 1.5', y2: 215, stroke: 'var(--color-secondary)', strokeWidth: 2.5, label: 'F' },
              { id: 'f-fric', type: 'arrow', x: 260, y: 235, x2: '260 - frictionForce * 1.5', y2: 235, stroke: 'var(--color-accent)', strokeWidth: 2, label: 'f_gesek' },
            ],
          },
          results: [
            { key: 'res-a', label: 'Percepatan Gerak', symbol: 'a', calculationKey: 'acceleration', unit: 'm/s²', highlight: true },
            { key: 'res-fnet', label: 'Gaya Bersih', symbol: 'F_net', calculationKey: 'netForce', unit: 'N' },
            { key: 'res-fric', label: 'Gaya Gesek', symbol: 'f', calculationKey: 'frictionForce', unit: 'N' },
          ],
          insight: {
            summary: 'Percepatan benda sebanding dengan resultan gaya bersih dorong dikurangi hambatan gesek.',
            causeAndEffect: 'Meningkatkan koefisien gesek meredam percepatan secara langsung.',
            whatIf: 'Jika gaya dorong sama persis dengan gaya gesek, percepatan bernilai nol dan balok bergerak konstan atau diam.',
          },
          experiments: [
            {
              id: 'exp-dyn-1',
              title: 'Target Percepatan Tepat 6,0 m/s²',
              objective: 'Atur gaya dorong dan massa agar percepatan balok mencapai 6,0 m/s² (toleransi 0,2 m/s²).',
              targetMetric: 'acceleration',
              targetValue: 6.0,
              tolerance: 0.2,
              unit: 'm/s²',
              successMessage: 'Percepatan 6,0 m/s² berhasil dicapai secara presisi.',
            },
          ],
        };
      }

      // Default: Hukum Hooke
      return {
        id: 'sim-hukum-hooke',
        slug: 'hukum-hooke',
        info: {
          title: 'Hukum Hooke: Elastisitas & Konstanta Pegas',
          description: 'Eksperimen pertambahan panjang pegas terhadap beban gantung dan konstanta pegas mekanik (F = k · Δx).',
          discipline: 'Fisika',
          topic: 'Elastisitas & Getaran',
          difficulty: 'basic',
          estimatedTime: '10–15 menit',
          status: 'draft',
          version: 1,
        },
        parameters: {
          k: { key: 'k', label: 'Konstanta Pegas (k)', min: 50, max: 500, step: 25, defaultVal: 200, unit: 'N/m', description: 'Kekakuan pegas' },
          mass: { key: 'mass', label: 'Massa Beban', min: 0.5, max: 10, step: 0.5, defaultVal: 2, unit: 'kg', description: 'Massa gantung' },
          gravity: { key: 'gravity', label: 'Gravitasi (g)', min: 1, max: 20, step: 0.1, defaultVal: 9.8, unit: 'm/s²', description: 'Medan gravitasi' },
        },
        calculations: {
          weight: { key: 'weight', label: 'Gaya Berat Beban (W)', formula: 'mass * gravity', unit: 'N' },
          deltaX: { key: 'deltaX', label: 'Pertambahan Panjang (Δx)', formula: 'weight / k', unit: 'm' },
          potentialEnergy: { key: 'potentialEnergy', label: 'Energi Potensial Pegas (Ep)', formula: '0.5 * k * (deltaX * deltaX)', unit: 'J' },
        },
        visual: {
          viewBox: { width: 640, height: 360 },
          archetype: 'physics',
          groundPlane: false,
          elements: [
            { id: 'ceiling', type: 'line', x: 260, y: 40, x2: 380, y2: 40, stroke: 'var(--color-border)', strokeWidth: 4 },
            { id: 'spring-line', type: 'line', x: 320, y: 40, x2: 320, y2: '60 + deltaX * 800', stroke: 'var(--color-primary)', strokeWidth: 3 },
            { id: 'mass-box', type: 'shape', x: 290, y: '60 + deltaX * 800', width: 60, height: 50, fill: 'var(--color-primary)', stroke: 'var(--color-secondary)', strokeWidth: 2, label: 'Massa m' },
            { id: 'gravity-arrow', type: 'arrow', x: 320, y: '110 + deltaX * 800', x2: 320, y2: '160 + deltaX * 800', stroke: 'var(--color-accent)', strokeWidth: 2.5, label: 'W = m·g' },
          ],
        },
        results: [
          { key: 'res-dx', label: 'Pertambahan Panjang', symbol: 'Δx', calculationKey: 'deltaX', unit: 'm', highlight: true },
          { key: 'res-w', label: 'Gaya Berat Beban', symbol: 'W', calculationKey: 'weight', unit: 'N' },
          { key: 'res-ep', label: 'Energi Potensial', symbol: 'Ep', calculationKey: 'potentialEnergy', unit: 'J' },
        ],
        insight: {
          summary: 'Pertambahan panjang pegas berbanding lurus dengan gaya berat dan berbanding terbalik dengan konstanta kekakuan.',
          causeAndEffect: 'Semakin besar konstanta pegas (k), semakin pendek regangan untuk massa yang sama.',
          whatIf: 'Jika konstanta pegas digandakan, deformasi regangan terpangkas menjadi separuh.',
        },
        experiments: [
          {
            id: 'exp-hooke-1',
            title: 'Tantangan Regangan Tepat 0.10 m',
            objective: 'Atur konstanta pegas atau massa beban hingga pegas meregang tepat 0.10 m.',
            targetMetric: 'deltaX',
            targetValue: 0.1,
            tolerance: 0.01,
            unit: 'm',
            successMessage: 'Target regangan 0.10 m berhasil dicapai secara seimbang.',
          },
        ],
      };
    },
  },

  'math-proportional': {
    id: 'math-proportional',
    name: 'Kalkulasi & Formulasi Proporsional',
    discipline: 'Matematika',
    archetype: 'chart',
    description: 'Visualisasi matematis interaktif dari fungsi aljabar, kelengkungan parabola kuadrat, dan perhitungan proporsi diskriminan.',
    supportedCapabilities: [
      'Koefisien polinomial kuadrat (a, b, c)',
      'Perhitungan sumbu simetri dan koordinat puncak (Xv, Yv)',
      'Diskriminan D = b² - 4ac untuk eksistensi akar',
      'Graticule ortogonal hairline instrumen sains',
      'Target diskriminan atau titik puncak tertentu',
    ],
    samplePrompts: [
      'Grafik fungsi kuadrat, pengaruh koefisien terhadap kelengkungan parabola',
      'Eksplorasi titik puncak dan sumbu simetri fungsi kuadrat',
      'Analisis diskriminan dan akar real pada persamaan kuadrat',
    ],
    createSpec: (_prompt?: string): UnifiedSimulatorSpec => ({
      id: 'sim-fungsi-kuadrat',
      slug: 'fungsi-kuadrat',
      info: {
        title: 'Fungsi Kuadrat & Eksplorasi Parabola',
        description: 'Menganalisis pengaruh koefisien a, b, dan konstanta c terhadap bentuk parabola, titik puncak, dan nilai diskriminan.',
        discipline: 'Matematika',
        topic: 'Aljabar & Kalkulus',
        difficulty: 'basic',
        estimatedTime: '10–15 menit',
        status: 'draft',
        version: 1,
      },
      parameters: {
        a: { key: 'a', label: 'Koefisien a (Kelengkungan)', min: -5, max: 5, step: 0.5, defaultVal: 1, unit: '', description: 'Arah dan keterbukaan kurva' },
        b: { key: 'b', label: 'Koefisien b (Pergeseran)', min: -10, max: 10, step: 1, defaultVal: -4, unit: '', description: 'Posisi sumbu simetri' },
        c: { key: 'c', label: 'Konstanta c (Titik Potong Y)', min: -10, max: 10, step: 1, defaultVal: 3, unit: '', description: 'Intersep sumbu Y' },
      },
      calculations: {
        discriminant: { key: 'discriminant', label: 'Diskriminan (D)', formula: '(b * b) - (4 * a * c)', unit: '' },
        xVertex: { key: 'xVertex', label: 'Sumbu Simetri (Xv)', formula: '-b / (2 * a)', unit: '' },
        yVertex: { key: 'yVertex', label: 'Nilai Ekstrem (Yv)', formula: '-discriminant / (4 * a)', unit: '' },
      },
      visual: {
        viewBox: { width: 640, height: 360 },
        archetype: 'chart',
        groundPlane: false,
        elements: [
          { id: 'grid-bg', type: 'grid', x: 40, y: 20, width: 560, height: 320, stroke: 'var(--color-border-subtle)' },
          { id: 'axis-x', type: 'line', x: 40, y: 180, x2: 600, y2: 180, stroke: 'var(--color-border)', strokeWidth: 2 },
          { id: 'axis-y', type: 'line', x: 320, y: 20, x2: 320, y2: 340, stroke: 'var(--color-border)', strokeWidth: 2 },
          { id: 'vertex-point', type: 'point', x: '320 + xVertex * 20', y: '180 - yVertex * 10', radius: 6, fill: 'var(--color-secondary)', label: 'Puncak (Xv, Yv)' },
          { id: 'curve-parabola', type: 'curve', x: 40, y: 180, stroke: 'var(--color-primary)', strokeWidth: 3 },
        ],
      },
      results: [
        { key: 'res-d', label: 'Diskriminan', symbol: 'D', calculationKey: 'discriminant', unit: '', highlight: true },
        { key: 'res-xv', label: 'Sumbu Simetri', symbol: 'Xv', calculationKey: 'xVertex', unit: '' },
        { key: 'res-yv', label: 'Puncak Kurva', symbol: 'Yv', calculationKey: 'yVertex', unit: '' },
      ],
      insight: {
        summary: 'Tanda koefisien a menentukan arah buka kurva; D > 0 menunjukkan parabola memotong sumbu X di dua titik berbeda.',
        causeAndEffect: 'Nilai a positif membuka kurva ke atas (minimum), sedangkan a negatif membuka ke bawah (maksimum).',
        whatIf: 'Jika diskriminan D bernilai tepat nol, parabola menyinggung sumbu X di satu titik tunggal.',
      },
      experiments: [
        {
          id: 'exp-quad-1',
          title: 'Tantangan Diskriminan Tepat 0',
          objective: 'Sesuaikan koefisien a, b, dan c agar diskriminan D = 0 (parabola menyinggung sumbu X).',
          targetMetric: 'discriminant',
          targetValue: 0,
          tolerance: 0.1,
          unit: '',
          successMessage: 'Hebat! Kamu berhasil membuat parabola menyinggung sumbu X di satu titik.',
        },
      ],
    }),
  },

  'data-chart': {
    id: 'data-chart',
    name: 'Grafik Responsif & Gelombang Kurva',
    discipline: 'Sains & Sinyal',
    archetype: 'chart',
    description: 'Visualisasi gelombang harmonik, fluktuasi osilasi, frekuensi sinyal, periode waktu, dan panjang gelombang.',
    supportedCapabilities: [
      'Amplitudo gelombang, frekuensi getaran (Hz), kecepatan rambat',
      'Perhitungan periode T = 1/f dan panjang gelombang λ = v/f',
      'Kurva dinamis berosilasi pada koordinat kartesius',
      'Target frekuensi atau panjang gelombang terukur',
    ],
    samplePrompts: [
      'Simulasi gelombang harmonik: pengaruh frekuensi dan amplitudo',
      'Hubungan frekuensi, panjang gelombang, dan cepat rambat bunyi',
      'Osilasi periodik dan analisis siklus waktu gelombang',
    ],
    createSpec: (_prompt?: string): UnifiedSimulatorSpec => ({
      id: 'sim-gelombang-harmonik',
      slug: 'gelombang-harmonik',
      info: {
        title: 'Gelombang Harmonik Sederhana & Osilasi',
        description: 'Eksplorasi hubungan antara amplitudo, frekuensi sinyal, kecepatan rambat gelombang, dan panjang gelombang.',
        discipline: 'Fisika Gelombang',
        topic: 'Gelombang & Getaran',
        difficulty: 'intermediate',
        estimatedTime: '15 menit',
        status: 'draft',
        version: 1,
      },
      parameters: {
        amplitude: { key: 'amplitude', label: 'Amplitudo (A)', min: 10, max: 80, step: 5, defaultVal: 40, unit: 'cm', description: 'Simpangan maksimum gelombang' },
        frequency: { key: 'frequency', label: 'Frekuensi (f)', min: 1, max: 10, step: 0.5, defaultVal: 2, unit: 'Hz', description: 'Jumlah siklus per detik' },
        velocity: { key: 'velocity', label: 'Cepat Rambat (v)', min: 5, max: 50, step: 5, defaultVal: 20, unit: 'm/s', description: 'Kecepatan perambatan fase' },
      },
      calculations: {
        period: { key: 'period', label: 'Periode (T)', formula: '1 / frequency', unit: 's' },
        wavelength: { key: 'wavelength', label: 'Panjang Gelombang (λ)', formula: 'velocity / frequency', unit: 'm' },
        angularFreq: { key: 'angularFreq', label: 'Kecepatan Sudut (ω)', formula: '6.28318 * frequency', unit: 'rad/s' },
      },
      visual: {
        viewBox: { width: 640, height: 360 },
        archetype: 'chart',
        groundPlane: false,
        elements: [
          { id: 'grid-lines', type: 'grid', x: 40, y: 40, width: 560, height: 280, stroke: 'var(--color-border-subtle)' },
          { id: 'axis-center', type: 'line', x: 40, y: 180, x2: 600, y2: 180, stroke: 'var(--color-border)', strokeWidth: 2 },
          { id: 'wave-curve', type: 'curve', x: 40, y: 180, stroke: 'var(--color-secondary)', strokeWidth: 3 },
          { id: 'amp-marker', type: 'arrow', x: 180, y: 180, x2: 180, y2: '180 - amplitude', stroke: 'var(--color-accent)', strokeWidth: 2, label: 'Amplitudo A' },
        ],
      },
      results: [
        { key: 'res-t', label: 'Periode Gelombang', symbol: 'T', calculationKey: 'period', unit: 's', highlight: true },
        { key: 'res-lambda', label: 'Panjang Gelombang', symbol: 'λ', calculationKey: 'wavelength', unit: 'm', highlight: true },
        { key: 'res-omega', label: 'Kecepatan Sudut', symbol: 'ω', calculationKey: 'angularFreq', unit: 'rad/s' },
      ],
      insight: {
        summary: 'Frekuensi yang lebih tinggi menghasilkan periode yang lebih pendek dan merapatkan panjang gelombang pada kecepatan konstan.',
        causeAndEffect: 'Meningkatkan cepat rambat gelombang memperpanjang jarak satu siklus penuh (λ).',
        whatIf: 'Jika frekuensi dilipatgandakan, periode gelombang terbagi dua secara presisi.',
      },
      experiments: [
        {
          id: 'exp-wave-1',
          title: 'Target Panjang Gelombang Tepat 5,0 m',
          objective: 'Atur frekuensi dan kecepatan rambat agar panjang gelombang tepat 5,0 m.',
          targetMetric: 'wavelength',
          targetValue: 5.0,
          tolerance: 0.1,
          unit: 'm',
          successMessage: 'Panjang gelombang 5,0 m berhasil dikalibrasi.',
        },
      ],
    }),
  },

  'process-flow': {
    id: 'process-flow',
    name: 'Alur Proses & Debit Transfer',
    discipline: 'Rekayasa & Proses',
    archetype: 'sequence',
    description: 'Simulasi tahapan proses stasiun transfer fluida, debit volume aliran, efisiensi konversi, dan waktu pengisian.',
    supportedCapabilities: [
      'Debit aliran masuk (L/s), efisiensi stasiun transfer (%)',
      'Kapasitas tangki reservoir dan debit keluaran terkontrol',
      'Kalkulasi waktu transit dan debit netto',
      'Diagram apparatus visual stasiun kerja dan pipa aliran',
    ],
    samplePrompts: [
      'Alur debit fluida stasiun pompa dengan efisiensi transfer',
      'Simulasi pengisian tangki penampung dengan laju aliran bertahap',
      'Analisis debit masuk vs debit keluar sistem perpipaan industri',
    ],
    createSpec: (_prompt?: string): UnifiedSimulatorSpec => ({
      id: 'sim-alur-debit-fluida',
      slug: 'alur-debit-fluida',
      info: {
        title: 'Alur Debit Fluida & Laju Aliran Stasiun',
        description: 'Menganalisis debit aliran masuk, efisiensi transfer stasiun pompa, dan waktu pengisian reservoir.',
        discipline: 'Teknik Proses & Fluida',
        topic: 'Dinamika Aliran Fluida',
        difficulty: 'intermediate',
        estimatedTime: '15 menit',
        status: 'draft',
        version: 1,
      },
      parameters: {
        inflow: { key: 'inflow', label: 'Debit Masuk (Q_in)', min: 10, max: 100, step: 5, defaultVal: 50, unit: 'L/s', description: 'Laju masukan fluida' },
        efficiency: { key: 'efficiency', label: 'Efisiensi Pompa (η)', min: 50, max: 100, step: 5, defaultVal: 80, unit: '%', description: 'Kapasitas konversi stasiun' },
        tankVolume: { key: 'tankVolume', label: 'Kapasitas Tangki (V)', min: 500, max: 5000, step: 250, defaultVal: 2000, unit: 'L', description: 'Volume tangki penerima' },
      },
      calculations: {
        outflow: { key: 'outflow', label: 'Debit Keluaran (Q_out)', formula: 'inflow * (efficiency / 100)', unit: 'L/s' },
        fillTime: { key: 'fillTime', label: 'Waktu Pengisian Tangki (t)', formula: 'tankVolume / outflow', unit: 's' },
      },
      visual: {
        viewBox: { width: 640, height: 360 },
        archetype: 'sequence',
        groundPlane: true,
        elements: [
          { id: 'source-tank', type: 'shape', x: 80, y: 120, width: 100, height: 120, fill: 'var(--color-surface)', stroke: 'var(--color-primary)', strokeWidth: 2, label: 'Tangki Sumber' },
          { id: 'pipe-flow', type: 'arrow', x: 190, y: 180, x2: 370, y2: 180, stroke: 'var(--color-secondary)', strokeWidth: 3, label: 'Q_out' },
          { id: 'pump-station', type: 'shape', x: 260, y: 155, width: 50, height: 50, fill: 'var(--color-primary)', stroke: 'var(--color-secondary)', strokeWidth: 2, label: 'Pompa' },
          { id: 'dest-tank', type: 'shape', x: 380, y: 100, width: 140, height: 140, fill: 'var(--color-surface)', stroke: 'var(--color-primary)', strokeWidth: 2, label: 'Tangki Reservoir' },
        ],
      },
      results: [
        { key: 'res-qout', label: 'Debit Keluaran', symbol: 'Q_out', calculationKey: 'outflow', unit: 'L/s', highlight: true },
        { key: 'res-tfill', label: 'Waktu Pengisian', symbol: 't', calculationKey: 'fillTime', unit: 's' },
      ],
      insight: {
        summary: 'Debit keluaran netto ditentukan langsung oleh hasil perkalian debit masukan dan efisiensi pompa transfer.',
        causeAndEffect: 'Penurunan efisiensi pompa secara otomatis memperpanjang durasi waktu pengisian tangki.',
        whatIf: 'Jika efisiensi mencapai 100%, seluruh debit fluida masukan tersalurkan tanpa kehilangan kapasitas.',
      },
      experiments: [
        {
          id: 'exp-flow-1',
          title: 'Target Debit Keluaran 40 L/s',
          objective: 'Sesuaikan debit masukan dan efisiensi pompa agar debit keluaran tepat bernilai 40 L/s.',
          targetMetric: 'outflow',
          targetValue: 40,
          tolerance: 0.5,
          unit: 'L/s',
          successMessage: 'Debit keluaran 40 L/s berhasil distabilkan.',
        },
      ],
    }),
  },

  'network-graph': {
    id: 'network-graph',
    name: 'Topologi Jaringan & Struktur Simpul',
    discipline: 'Ilmu Komputer',
    archetype: 'network',
    description: 'Analisis struktur keterhubungan graf, simpul jaringan (nodes), sisi berbobot (edges), dan kerapatan jalur data.',
    supportedCapabilities: [
      'Jumlah simpul (N), tingkat konektivitas per simpul',
      'Perkiraan total sisi jaringan E dan kerapatan graf',
      'Representasi visual simpul dan sisi saling terhubung',
      'Tantangan konfigurasi topologi jaringan optimal',
    ],
    samplePrompts: [
      'Analisis topologi graf jaringan komputer dan kerapatan simpul',
      'Struktur data graf berarah dan jumlah keterhubungan sisi',
      'Kerapatan jaringan dan analisis jalur komunikasi antar simpul',
    ],
    createSpec: (_prompt?: string): UnifiedSimulatorSpec => ({
      id: 'sim-topologi-graf',
      slug: 'topologi-graf',
      info: {
        title: 'Topologi Graf Jaringan & Kerapatan Simpul',
        description: 'Simulasi topologi jaringan komputer: menghitung jumlah sisi penghubung dan indeks kerapatan koneksi antar simpul.',
        discipline: 'Ilmu Komputer',
        topic: 'Struktur Data & Graf',
        difficulty: 'intermediate',
        estimatedTime: '15 menit',
        status: 'draft',
        version: 1,
      },
      parameters: {
        nodes: { key: 'nodes', label: 'Jumlah Simpul (N)', min: 3, max: 10, step: 1, defaultVal: 5, unit: 'simpul', description: 'Jumlah perangkat terminal' },
        connectivity: { key: 'connectivity', label: 'Derajat Koneksi Rata-rata (k)', min: 1, max: 4, step: 1, defaultVal: 2, unit: 'sisi/simpul', description: 'Keterhubungan tiap simpul' },
      },
      calculations: {
        totalEdges: { key: 'totalEdges', label: 'Total Sisi Jaringan (E)', formula: '(nodes * connectivity) / 2', unit: 'sisi' },
        maxEdges: { key: 'maxEdges', label: 'Maksimum Sisi Graf Lengkap', formula: '(nodes * (nodes - 1)) / 2', unit: 'sisi' },
        densityPct: { key: 'densityPct', label: 'Kerapatan Jaringan (%)', formula: '(totalEdges / maxEdges) * 100', unit: '%' },
      },
      visual: {
        viewBox: { width: 640, height: 360 },
        archetype: 'network',
        groundPlane: false,
        elements: [
          { id: 'node-a', type: 'shape', x: 200, y: 100, radius: 24, fill: 'var(--color-primary)', label: 'Node A' },
          { id: 'node-b', type: 'shape', x: 440, y: 100, radius: 24, fill: 'var(--color-primary)', label: 'Node B' },
          { id: 'node-c', type: 'shape', x: 500, y: 240, radius: 24, fill: 'var(--color-secondary)', label: 'Node C' },
          { id: 'node-d', type: 'shape', x: 140, y: 240, radius: 24, fill: 'var(--color-secondary)', label: 'Node D' },
          { id: 'node-e', type: 'shape', x: 320, y: 280, radius: 24, fill: 'var(--color-accent)', label: 'Node E' },
          { id: 'edge-ab', type: 'line', x: 200, y: 100, x2: 440, y2: 100, stroke: 'var(--color-border)', strokeWidth: 2 },
          { id: 'edge-bc', type: 'line', x: 440, y: 100, x2: 500, y2: 240, stroke: 'var(--color-border)', strokeWidth: 2 },
          { id: 'edge-cd', type: 'line', x: 500, y: 240, x2: 140, y2: 240, stroke: 'var(--color-border)', strokeWidth: 2 },
          { id: 'edge-da', type: 'line', x: 140, y: 240, x2: 200, y2: 100, stroke: 'var(--color-border)', strokeWidth: 2 },
          { id: 'edge-ce', type: 'line', x: 500, y: 240, x2: 320, y2: 280, stroke: 'var(--color-border)', strokeWidth: 2 },
        ],
      },
      results: [
        { key: 'res-e', label: 'Total Sisi Terhubung', symbol: 'E', calculationKey: 'totalEdges', unit: 'sisi', highlight: true },
        { key: 'res-d', label: 'Kerapatan Graf', symbol: 'D', calculationKey: 'densityPct', unit: '%', highlight: true },
        { key: 'res-max', label: 'Kapasitas Lengkap', symbol: 'E_max', calculationKey: 'maxEdges', unit: 'sisi' },
      ],
      insight: {
        summary: 'Kerapatan jaringan mengukur seberapa dekat topologi terhadap graf lengkap (setiap simpul terhubung langsung ke semua simpul lain).',
        causeAndEffect: 'Menambah simpul tanpa meningkatkan konektivitas akan menurunkan persentase kerapatan keseluruhan.',
        whatIf: 'Pada graf lengkap (kerapatan 100%), rute alternatif maksimal dan latensi transmisi minimal.',
      },
      experiments: [
        {
          id: 'exp-net-1',
          title: 'Target 5 Sisi Jaringan',
          objective: 'Konfigurasikan 5 simpul dengan derajat konektivitas 2 untuk menghasilkan tepat 5 sisi.',
          targetMetric: 'totalEdges',
          targetValue: 5,
          tolerance: 0.1,
          unit: 'sisi',
          successMessage: 'Topologi 5 sisi jaringan berhasil dikonfigurasi.',
        },
      ],
    }),
  },
};

/**
 * Match a user prompt to the best supported STEM archetype and generate a calibrated spec.
 */
export function generateArchetypeSpec(prompt: string): UnifiedSimulatorSpec {
  const lower = (prompt || '').toLowerCase();

  // 1. Check network / graph keywords
  if (lower.includes('graf') || lower.includes('jaringan') || lower.includes('simpul') || lower.includes('node') || lower.includes('topologi')) {
    return STEM_ARCHETYPES['network-graph'].createSpec(prompt);
  }

  // 2. Check process / flow keywords
  if (lower.includes('debit') || lower.includes('fluida') || lower.includes('pompa') || lower.includes('alir') || lower.includes('tangki') || lower.includes('proses')) {
    return STEM_ARCHETYPES['process-flow'].createSpec(prompt);
  }

  // 3. Check chart / wave / signal / curve keywords
  if (lower.includes('gelombang') || lower.includes('harmonik') || lower.includes('amplitudo') || lower.includes('frekuensi') || lower.includes('sinyal') || lower.includes('osilasi')) {
    return STEM_ARCHETYPES['data-chart'].createSpec(prompt);
  }

  // 4. Check math / quadratic / function keywords
  if (lower.includes('fungsi') || lower.includes('kuadrat') || lower.includes('parabola') || lower.includes('diskriminan') || lower.includes('aljabar') || lower.includes('puncak')) {
    return STEM_ARCHETYPES['math-proportional'].createSpec(prompt);
  }

  // 5. Default to physics-dynamics (Hooke or Newton)
  return STEM_ARCHETYPES['physics-dynamics'].createSpec(prompt);
}
