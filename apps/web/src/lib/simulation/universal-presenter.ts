import { formatNumber, formatCurrency, formatAngle, formatPercent } from '../utils/formatters';
import { getGenlabSimulation } from '@genlab/simulation-core';

export interface HumanResultItem {
  key?: string;
  label: string;
  value: string;
  symbol?: string;
  subtext?: string;
  highlight?: boolean;
}

export interface CalculationStep {
  title: string;
  description?: string;
  latexFormula: string;
  latexSubstitution: string;
  latexResult: string;
}

export interface DynamicInsightData {
  summary: string;
  dominance: string;
  causeAndEffect: string;
  whatIf: string;
}

export interface UniversalPresentation {
  title: string;
  domain: string;
  conceptPrompt: string;
  results: HumanResultItem[];
  calculations: CalculationStep[];
  insight: DynamicInsightData;
  experimentHint?: string;
}

export function humanizeResultLabel(key: string): string {
  const dictionary: Record<string, string> = {
    // Event Risk Assessment & Management
    emvInitialJuta: 'Eksposur Risiko Awal (EMV)',
    emvInitial: 'Eksposur Risiko Awal (EMV)',
    residualRiskJuta: 'Risiko Tersisa (Residual)',
    residualRisk: 'Risiko Tersisa (Residual)',
    riskExposureCutJuta: 'Pengurangan Risiko',
    riskExposureCut: 'Pengurangan Risiko',
    mitigationRoiPct: 'Efektivitas Mitigasi (ROI)',
    mitigationRoi: 'Efektivitas Mitigasi (ROI)',
    riskLevel: 'Kategori Tingkat Risiko',

    // Break Even Point & Business
    bepUnit: 'Titik Impas (Unit)',
    bepRupiah: 'Titik Impas (Rupiah)',
    totalRevenue: 'Total Pendapatan',
    totalCost: 'Total Biaya',
    fixedCost: 'Biaya Tetap',
    variableCostTotal: 'Total Biaya Variabel',
    profit: 'Laba Bersih Operasional',
    contributionMargin: 'Margin Kontribusi',
    contributionMarginRatio: 'Rasio Margin Kontribusi',
    marginOfSafety: 'Margin of Safety',
    marginOfSafetyPct: 'Margin of Safety (%)',

    // Accounting & Taxation
    totalAssets: 'Total Aset',
    totalLiabilities: 'Total Kewajiban',
    totalEquity: 'Total Ekuitas',
    netIncome: 'Laba Bersih',
    grossProfit: 'Laba Kotor',
    operatingCashFlow: 'Arus Kas Operasional',
    netCashFlow: 'Arus Kas Bersih',
    endingCash: 'Saldo Kas Akhir',
    taxPayable: 'Pajak Terutang',
    taxAmount: 'Nilai Pajak Terutang',
    effectiveTaxRatePct: 'Tarif Pajak Efektif (%)',

    // Marketing & E-Commerce
    roas: 'Return on Ad Spend (ROAS)',
    cac: 'Biaya Akuisisi Pelanggan (CAC)',
    clv: 'Customer Lifetime Value (CLV)',
    conversionRate: 'Tingkat Konversi',
    cpm: 'Cost Per Mille (CPM)',
    cpc: 'Cost Per Click (CPC)',
    eoq: 'Ukuran Pesanan Ekonomis (EOQ)',
    reorderPoint: 'Titik Pemesanan Ulang (ROP)',
    safetyStock: 'Stok Pengaman (Safety Stock)',

    // Venue, Agribusiness & Event
    effectiveCapacity: 'Kapasitas Efektif Acara',
    boothCount: 'Jumlah Booth Tersedia',
    totalFootprintM2: 'Luas Area Terpakai (m²)',
    aisleWidthM: 'Lebar Jalur Evakuasi (m)',
    densityScore: 'Tingkat Kepadatan',
    ticketRevenue: 'Proyeksi Penjualan Tiket',
  };

  if (dictionary[key]) {
    return dictionary[key];
  }

  // Strip technical/unit suffixes
  let clean = key
    .replace(/Juta$/i, '')
    .replace(/Rupiah$/i, '')
    .replace(/Pct$/i, '')
    .replace(/Percent$/i, '')
    .replace(/_juta$/i, '')
    .replace(/_rupiah$/i, '')
    .replace(/_pct$/i, '');

  clean = clean
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .replace(/^./, (str) => str.toUpperCase());

  return clean || key;
}

export function humanizeResultItem(key: string, value: any): HumanResultItem {
  if (typeof value !== 'number') {
    return {
      label: humanizeResultLabel(key),
      value: String(value),
    };
  }

  const num = Number(value);
  const lowerKey = key.toLowerCase();
  let formattedVal = '';
  let symbol: string | undefined = undefined;

  // 1. Millions of Rupiah
  if (lowerKey.includes('juta')) {
    formattedVal = `Rp\u00A0${formatNumber(num)}\u00A0Juta`;
  }
  // 2. Full Rupiah
  else if (
    lowerKey.includes('rupiah') ||
    lowerKey.includes('harga') ||
    lowerKey.includes('cost') ||
    lowerKey.includes('price') ||
    lowerKey.includes('revenue') ||
    lowerKey.includes('omzet') ||
    lowerKey.includes('omset') ||
    lowerKey.includes('laba') ||
    lowerKey.includes('profit') ||
    lowerKey.includes('kas') ||
    lowerKey.includes('cash') ||
    lowerKey.includes('biaya') ||
    lowerKey.includes('pajak') ||
    lowerKey.includes('tax') ||
    lowerKey.includes('aset') ||
    lowerKey.includes('utang') ||
    lowerKey.includes('modal')
  ) {
    formattedVal = formatCurrency(num);
  }
  // 3. Percentages
  else if (
    lowerKey.includes('pct') ||
    lowerKey.includes('percent') ||
    lowerKey.includes('persen') ||
    lowerKey.includes('rate') ||
    lowerKey.includes('margin') ||
    lowerKey.includes('ratio') ||
    lowerKey.includes('roi') ||
    lowerKey.includes('roas') ||
    lowerKey.includes('prob')
  ) {
    formattedVal = `${formatNumber(num)}%`;
  }
  // 4. Units / Quantities
  else if (lowerKey.includes('unit') || lowerKey.includes('qty') || lowerKey.includes('jumlah') || lowerKey.includes('count')) {
    formattedVal = `${formatNumber(num)} Unit`;
  }
  // 5. General number
  else {
    formattedVal = formatNumber(num);
  }

  // Symbol resolution: Only clean real acronyms/symbols
  if (lowerKey.startsWith('emv')) symbol = 'EMV';
  else if (lowerKey.startsWith('bep')) symbol = 'BEP';
  else if (lowerKey.includes('roi')) symbol = 'ROI';
  else if (lowerKey.includes('npv')) symbol = 'NPV';
  else if (lowerKey.includes('irr')) symbol = 'IRR';
  else if (lowerKey.startsWith('residual')) symbol = 'RR';
  else if (lowerKey === 'roas') symbol = 'ROAS';
  else if (lowerKey === 'cac') symbol = 'CAC';
  else if (lowerKey === 'clv') symbol = 'CLV';
  else if (lowerKey === 'eoq') symbol = 'EOQ';
  else if (lowerKey === 'cpm') symbol = 'CPM';

  return {
    label: humanizeResultLabel(key),
    symbol,
    value: formattedVal,
  };
}

/**
 * Universal Simulation Presenter
 * Translates internal engine variables (rx, ry, magR, angleDeg, etc.)
 * into human-readable results, rigorous KaTeX formulas, and dynamic pedagogical insights.
 */
export function getUniversalPresentation(
  slug: string,
  params: Record<string, number>,
  computed: Record<string, any>
): UniversalPresentation {
  switch (slug) {
    case 'vector-math': {
      const ax = params.ax ?? 4;
      const ay = params.ay ?? 3;
      const bx = params.bx ?? 2;
      const by = params.by ?? 5;

      const rx = ax + bx;
      const ry = ay + by;
      const magA = Math.sqrt(ax * ax + ay * ay);
      const magB = Math.sqrt(bx * bx + by * by);
      const magR = Math.sqrt(rx * rx + ry * ry);
      const dotProduct = ax * bx + ay * by;
      const radR = Math.atan2(ry, rx);
      const angleDegR = Math.round(((radR * 180) / Math.PI + 360) % 360 * 100) / 100;

      // Dynamic insight determination
      let dominance = '';
      let causeAndEffect = '';

      if (rx === 0 && ry === 0) {
        dominance = 'Kedua komponen bernilai nol.';
        causeAndEffect = 'Vektor resultan adalah vektor nol dengan panjang 0 N tanpa arah tertentu.';
      } else if (rx === 0) {
        dominance = 'Komponen horizontal bernilai nol (Rx = 0).';
        causeAndEffect = `Karena tidak ada gaya/vektor pada sumbu horizontal, resultan sebesar ${formatNumber(magR, 'N')} sepenuhnya berada vertikal searah sumbu Y (${ry > 0 ? '90°' : '270°'}).`;
      } else if (ry === 0) {
        dominance = 'Komponen vertikal bernilai nol (Ry = 0).';
        causeAndEffect = `Karena tidak ada gaya/vektor pada sumbu vertikal, resultan sebesar ${formatNumber(magR, 'N')} sepenuhnya mendatar searah sumbu X (${rx > 0 ? '0°' : '180°'}).`;
      } else if (Math.abs(ry) > Math.abs(rx)) {
        dominance = `Komponen Y (${formatNumber(ry, 'N')}) lebih besar daripada komponen X (${formatNumber(rx, 'N')}).`;
        causeAndEffect = `Karena tarikan ke arah vertikal lebih dominan, vektor resultan lebih condong tegak ke arah sumbu Y dengan sudut kemiringan ${formatNumber(angleDegR, '°')}.`;
      } else if (Math.abs(rx) > Math.abs(ry)) {
        dominance = `Komponen X (${formatNumber(rx, 'N')}) lebih besar daripada komponen Y (${formatNumber(ry, 'N')}).`;
        causeAndEffect = `Karena dorongan horizontal lebih dominan, arah resultan menjadi lebih mendatar menuju sumbu X dengan sudut ${formatNumber(angleDegR, '°')}.`;
      } else {
        dominance = `Komponen X dan Komponen Y bernilai seimbang (${formatNumber(rx, 'N')}).`;
        causeAndEffect = `Kedua komponen memiliki besar yang sama, sehingga resultan membagi kuadran secara simetris pada sudut ${formatNumber(angleDegR, '°')}.`;
      }

      return {
        title: 'Operasi Penjumlahan Vektor 2D',
        domain: 'Matematika & Fisika',
        conceptPrompt: 'Ubah komponen vektor A dan B untuk mengamati resultan dan perkalian skalar titik.',
        results: [
          { label: 'Besar Resultan', symbol: '|R|', value: formatNumber(magR, 'N'), highlight: true },
          { label: 'Arah Sudut', symbol: 'θ', value: formatAngle(angleDegR) },
          { label: 'Komponen X', symbol: 'R_x', value: formatNumber(rx, 'N') },
          { label: 'Komponen Y', symbol: 'R_y', value: formatNumber(ry, 'N') },
          { label: 'Perkalian Skalar', symbol: 'A · B', value: formatNumber(dotProduct) },
          { label: 'Magnitudo |A|', symbol: '|A|', value: formatNumber(magA, 'N') },
          { label: 'Magnitudo |B|', symbol: '|B|', value: formatNumber(magB, 'N') },
        ],
        calculations: [
          {
            title: 'Penjumlahan Komponen Terurai',
            description: 'Komponen resultan dihitung dari penjumlahan aljabar masing-masing sumbu: Rx = Ax + Bx pada sumbu mendatar (N) dan Ry = Ay + By pada sumbu tegak (N).',
            latexFormula: 'R_x = A_x + B_x,\\quad R_y = A_y + B_y',
            latexSubstitution: `R_x = ${ax} + (${bx}) = ${rx}\\text{ N},\\quad R_y = ${ay} + (${by}) = ${ry}\\text{ N}`,
            latexResult: `\\vec{R} = (${rx}\\hat{i} + ${ry}\\hat{j})\\text{ N}`,
          },
          {
            title: 'Besar Resultan (Teorema Pythagoras)',
            description: 'Panjang total vektor resultan |R| dicari dengan menjumlahkan kuadrat komponen mendatar dan tegak: |R| = √(Rx² + Ry²).',
            latexFormula: '|R| = \\sqrt{R_x^2 + R_y^2}',
            latexSubstitution: `|R| = \\sqrt{(${rx})^2 + (${ry})^2} = \\sqrt{${rx * rx} + ${ry * ry}} = \\sqrt{${rx * rx + ry * ry}}`,
            latexResult: `|R| = ${formatNumber(magR, 'N')}`,
          },
          {
            title: 'Arah Vektor Resultan (Sudut Kemiringan)',
            description: `Arah sudut kemiringan resultan (θ, derajat) dihitung terhadap sumbu X positif (${rx === 0 ? (ry >= 0 ? '90° vertikal ke atas' : '270° vertikal ke bawah') : `berada di ${rx > 0 ? (ry >= 0 ? 'Kuadran I' : 'Kuadran IV') : (ry >= 0 ? 'Kuadran II' : 'Kuadran III')}`}) menggunakan fungsi invers tangen 4-kuadran.`,
            latexFormula: rx === 0
              ? '\\theta = \\begin{cases} 90^\\circ & R_y > 0 \\\\ 270^\\circ & R_y < 0 \\\\ 0^\\circ & R_y = 0 \\end{cases}'
              : (rx > 0 && ry >= 0)
                ? '\\theta = \\tan^{-1}\\left(\\frac{R_y}{R_x}\\right)'
                : (rx < 0)
                  ? '\\theta = 180^\\circ + \\tan^{-1}\\left(\\frac{R_y}{R_x}\\right)'
                  : '\\theta = 360^\\circ + \\tan^{-1}\\left(\\frac{R_y}{R_x}\\right)',
            latexSubstitution: rx === 0
              ? `R_x = 0 \\implies \\theta = ${formatAngle(angleDegR)}`
              : `\\theta = \\operatorname{atan2}(${ry},\\, ${rx}) = ${formatAngle(angleDegR)}`,
            latexResult: `\\theta = ${formatAngle(angleDegR)}`,
          },
        ],
        insight: {
          summary: `Resultan akhir sebesar ${formatNumber(magR, 'N')} terbentuk dari perpaduan vektor A (${formatNumber(magA, 'N')}) dan B (${formatNumber(magB, 'N')}).`,
          dominance,
          causeAndEffect,
          whatIf: 'Jika kamu menaikkan komponen Ax atau Bx sementara komponen Y tetap, besar resultan akan bertambah dan arah sudut θ akan bergerak semakin mendatar mendekati 0°.',
        },
        experimentHint: 'Cobalah mengatur komponen agar menghasilkan resultan tepat 10 N atau cari kondisi di mana A · B = 0 (saling tegak lurus).',
      };
    }

    case 'newtons-second-law': {
      const mass = Math.max(0.01, params.mass ?? 5);
      const force = params.force ?? 20;
      const rawFriction = params.friction ?? 0;
      const g = 9.81;
      const normalForce = mass * g;
      const frictionForce = Math.max(0, rawFriction) * normalForce;

      let netForce = 0;
      if (Math.abs(force) > frictionForce) {
        netForce = force - Math.sign(force) * frictionForce;
      } else {
        netForce = 0;
      }
      const accel = netForce / mass;

      let dominance = '';
      let causeAndEffect = '';

      if (netForce <= 0) {
        dominance = 'Gaya gesek statis menyeimbangkan atau melebihi gaya dorong.';
        causeAndEffect = `Gaya dorong sebesar ${formatNumber(force, 'N')} belum melampaui hambatan gesek maksimum ${formatNumber(frictionForce, 'N')}, sehingga benda tetap dalam keadaan diam (akselerasi 0 m/s²).`;
      } else if (mass >= 15) {
        dominance = `Massa benda (${formatNumber(mass, 'kg')}) sangat besar relatif terhadap gaya.`;
        causeAndEffect = `Inersia benda tinggi menahan perubahan gerak, sehingga percepatan yang dihasilkan hanya ${formatNumber(accel, 'm/s²')}.`;
      } else if (force >= 60) {
        dominance = `Gaya dorong (${formatNumber(force, 'N')}) sangat dominan.`;
        causeAndEffect = `Gaya bersih yang besar mendorong benda dengan percepatan tinggi ${formatNumber(accel, 'm/s²')}.`;
      } else {
        dominance = `Perbandingan gaya dorong terhadap massa adalah ${formatNumber(force / mass)}.`;
        causeAndEffect = `Dengan gaya bersih ${formatNumber(netForce, 'N')} yang bekerja pada massa ${formatNumber(mass, 'kg')}, benda memperoleh percepatan konstan ${formatNumber(accel, 'm/s²')}.`;
      }

      // Extract authoritative real-time telemetry from runtime computed state
      const liveV = typeof computed.realtime_velocity === 'number'
        ? computed.realtime_velocity
        : (typeof computed.velocity === 'number' ? computed.velocity : 0);
      const livePos = typeof computed.realtime_position === 'number'
        ? computed.realtime_position
        : (typeof computed.position === 'number' ? computed.position : 0);
      const liveTime = typeof computed.realtime_time === 'number'
        ? computed.realtime_time
        : (typeof computed.time === 'number' ? computed.time : 0);
      const weight = mass * g;
      const kineticEnergy = 0.5 * mass * liveV * liveV;
      const momentum = mass * liveV;
      const activeFriction = typeof computed.activeFriction === 'number'
        ? computed.activeFriction
        : (netForce <= 0 ? Math.min(frictionForce, Math.abs(force)) : frictionForce);

      return {
        title: 'Hukum II Newton: Dinamika Gerak Benda',
        domain: 'Fisika Klasik',
        conceptPrompt: 'Ubah gaya atau massa dan amati pengaruh langsungnya terhadap percepatan gerak.',
        results: [
          { label: 'Percepatan Gerak', symbol: 'a', value: formatNumber(accel, 'm/s²'), highlight: true },
          { label: 'Kecepatan Sesaat', symbol: 'v(t)', value: `${liveV >= 0 ? '+' : ''}${formatNumber(liveV, 'm/s')}`, highlight: Math.abs(liveV) > 0.01 },
          { label: 'Posisi Sesaat', symbol: 'x(t)', value: formatNumber(livePos, 'm') },
          { label: 'Waktu Simulasi', symbol: 't', value: formatNumber(liveTime, 's') },
          { label: 'Gaya Bersih', symbol: 'F_net', value: formatNumber(netForce, 'N') },
          { label: 'Gaya Dorong', symbol: 'F', value: formatNumber(force, 'N') },
          { label: 'Gaya Gesek Aktif', symbol: 'f', value: formatNumber(activeFriction, 'N') },
          { label: 'Gaya Normal', symbol: 'N', value: formatNumber(normalForce, 'N') },
          { label: 'Gaya Berat', symbol: 'W', value: formatNumber(weight, 'N') },
          { label: 'Energi Kinetik', symbol: 'E_k', value: formatNumber(kineticEnergy, 'J') },
          { label: 'Momentum', symbol: 'p', value: formatNumber(momentum, 'kg·m/s') },
        ],
        calculations: [
          {
            title: 'Hukum II Newton',
            description: 'Percepatan (a, m/s²) sebanding dengan gaya bersih total (F_net, N) dan berbanding terbalik dengan massa benda (m, kg). Gaya dorong dikurangi gaya gesek kinetik menghasilkan gaya bersih yang mempercepat gerak benda.',
            latexFormula: 'a = \\frac{F_{\\text{net}}}{m} = \\frac{F - f_k}{m}',
            latexSubstitution: `a = \\frac{${formatNumber(force)} - ${formatNumber(frictionForce)}}{${formatNumber(mass)}} = \\frac{${formatNumber(netForce)}}{${formatNumber(mass)}}`,
            latexResult: `a = ${formatNumber(accel, 'm/s²')}`,
          },
        ],
        insight: {
          summary: `Benda dengan massa ${formatNumber(mass, 'kg')} yang ditarik gaya ${formatNumber(force, 'N')} mengalami percepatan ${formatNumber(accel, 'm/s²')}.`,
          dominance,
          causeAndEffect,
          whatIf: 'Jika kamu menggandakan massa benda menjadi dua kali lipat sementara gaya tetap, percepatan benda akan berkurang menjadi tepat separuhnya.',
        },
        experimentHint: 'Cobalah atur gaya dan massa sedemikian rupa agar percepatan mencapai tepat 5,00 m/s².',
      };
    }

    case 'projectile-motion': {
      const v0 = params.velocity ?? 25;
      const theta = params.angle ?? 45;
      const g = Math.max(0.1, params.gravity ?? 9.81);
      const y0 = Math.max(0, params.y0 ?? 0);

      const rad = (theta * Math.PI) / 180;
      const vx = v0 * Math.cos(rad);
      const vy = v0 * Math.sin(rad);
      const tFlight = (vy + Math.sqrt(Math.max(0, vy * vy + 2 * g * y0))) / g;
      const range = vx * tFlight;
      const hMax = y0 + (vy * vy) / (2 * g);

      let dominance = '';
      let causeAndEffect = '';

      if (theta === 45) {
        dominance = 'Sudut elevasi tepat pada nilai optimal 45°.';
        causeAndEffect = `Fungsi sinus ganda sin(2θ) = sin(90°) = 1 mencapai puncak maksimum, menghasilkan jarak jangkauan tembak terjauh (${formatNumber(range, 'm')}).`;
      } else if (theta > 45) {
        dominance = `Sudut elevasi tinggi (${theta}° > 45°).`;
        causeAndEffect = `Sebagian besar energi awal diarahkan ke sumbu vertikal, menghasilkan puncak yang sangat tinggi (${formatNumber(hMax, 'm')}) dan waktu di udara yang lama (${formatNumber(tFlight, 's')}), tetapi jarak jangkauan berkurang.`;
      } else {
        dominance = `Sudut elevasi rendah (${theta}° < 45°).`;
        causeAndEffect = `Kecepatan horizontal besar namun proyektil mendarat cepat (${formatNumber(tFlight, 's')}) karena komponen vertikalnya kecil.`;
      }

      return {
        title: 'Kinematika Gerak Parabola 2D',
        domain: 'Fisika Kinematika',
        conceptPrompt: 'Ubah kecepatan awal dan sudut elevasi untuk melihat kurva lintasan gerak peluru.',
        results: [
          { label: 'Jarak Tembak Jangkauan', symbol: 'R', value: formatNumber(range, 'm'), highlight: true },
          { label: 'Tinggi Maksimum', symbol: 'H_max', value: formatNumber(hMax, 'm') },
          { label: 'Waktu Terbang', symbol: 't', value: formatNumber(tFlight, 's') },
          { label: 'Kecepatan Awal', symbol: 'v_0', value: formatNumber(v0, 'm/s') },
          { label: 'Sudut Elevasi', symbol: 'θ', value: formatAngle(theta) },
        ],
        calculations: [
          {
            title: 'Jarak Tembak Horizontal Maksimum',
            description: 'Jarak mendatar terjauh dihitung dari kuadrat kecepatan awal dikali sinus sudut ganda dibagi percepatan gravitasi (R = v₀² sin(2θ) / g). Sudut 45° menghasilkan jangkauan terjauh.',
            latexFormula: 'R = \\frac{v_0^2 \\sin(2\\theta)}{g}',
            latexSubstitution: `R = \\frac{(${v0})^2 \\cdot \\sin(2 \\times ${theta}^\\circ)}{${g}} = \\frac{${v0 * v0} \\cdot ${Math.sin(2 * rad).toFixed(3)}}{${g}}`,
            latexResult: `R = ${formatNumber(range, 'm')}`,
          },
          {
            title: 'Tinggi Puncak Lintasan',
            description: 'Ketinggian maksimum yang dicapai peluru saat kecepatan vertikalnya sesaat bernilai nol (H_max = v₀² sin²(θ) / 2g).',
            latexFormula: 'H_{\\text{max}} = \\frac{v_0^2 \\sin^2(\\theta)}{2g}',
            latexSubstitution: `H_{\\text{max}} = \\frac{(${v0})^2 \\cdot (\\sin(${theta}^\\circ))^2}{2 \\times ${g}}`,
            latexResult: `H_{\\text{max}} = ${formatNumber(hMax, 'm')}`,
          },
        ],
        insight: {
          summary: `Proyektil meluncur pada kecepatan awal ${formatNumber(v0, 'm/s')} dengan sudut ${theta}°.`,
          dominance,
          causeAndEffect,
          whatIf: 'Jika kecepatan awal v0 digandakan menjadi 2 kali lipat, jarak tembak horizontal akan melonjak hingga 4 kali lipat karena hubungan kuadratik (R ∝ v0²).',
        },
      };
    }

    case 'function-explorer': {
      const a = params.a ?? 1;
      const b = params.b ?? -4;
      const c = params.c ?? 3;

      const vx = a !== 0 ? -b / (2 * a) : 0;
      const vy = a * vx * vx + b * vx + c;
      const disc = b * b - 4 * a * c;

      let dominance = '';
      let causeAndEffect = '';

      if (disc > 0) {
        dominance = `Diskriminan positif (D = ${formatNumber(disc)} > 0).`;
        causeAndEffect = 'Persamaan kuadrat memiliki dua akar riil yang berbeda, sehingga kurva memotong sumbu X di dua titik berbeda.';
      } else if (disc === 0) {
        dominance = 'Diskriminan bernilai tepat nol (D = 0).';
        causeAndEffect = 'Kurva menyinggung sumbu X tepat pada satu titik puncak (akar kembar).';
      } else {
        dominance = `Diskriminan negatif (D = ${formatNumber(disc)} < 0).`;
        causeAndEffect = 'Kurva definit (seluruhnya berada di atas atau di bawah sumbu X) dan tidak memotong sumbu X.';
      }

      return {
        title: 'Eksplorasi Kurva Kuadratik',
        domain: 'Aljabar & Kalkulus',
        conceptPrompt: 'Geser koefisien a, b, dan c untuk melihat perubahan kurva kuadratik.',
        results: [
          { label: 'Titik Puncak P(x, y)', symbol: '(x_p, y_p)', value: `(${formatNumber(vx)}, ${formatNumber(vy)})`, highlight: true },
          { label: 'Diskriminan', symbol: 'D', value: formatNumber(disc) },
          { label: 'Arah Kelengkungan', symbol: 'Bentuk', value: a > 0 ? 'Terbuka ke Atas (Cekung)' : 'Terbuka ke Bawah (Cembung)' },
          { label: 'Titik Potong Sumbu Y', symbol: 'f(0)', value: formatNumber(c) },
        ],
        calculations: [
          {
            title: 'Sumbu Simetri dan Titik Ekstrem',
            description: 'Titik puncak parabola (xp, yp) terjadi pada sumbu simetri xp = -b / (2a). Jika nilai a positif, kurva terbuka ke atas (memiliki titik minimum terendah); jika a negatif, kurva terbuka ke bawah (memiliki titik maksimum tertinggi).',
            latexFormula: 'x_p = -\\frac{b}{2a},\\quad y_p = f(x_p) = a(x_p)^2 + b(x_p) + c',
            latexSubstitution: `x_p = -\\frac{${b}}{2(${a})} = ${formatNumber(vx)},\\quad y_p = ${a}(${formatNumber(vx)})^2 + (${b})(${formatNumber(vx)}) + (${c})`,
            latexResult: `P(x_p, y_p) = (${formatNumber(vx)},\\; ${formatNumber(vy)})`,
          },
          {
            title: 'Diskriminan Kuadratik',
            description: 'Nilai diskriminan D = b² - 4ac menentukan titik potong kurva dengan sumbu X: jika D > 0 memotong di dua titik, jika D = 0 menyinggung di satu titik, dan jika D < 0 tidak memotong sama sekali.',
            latexFormula: 'D = b^2 - 4ac',
            latexSubstitution: `D = (${b})^2 - 4(${a})(${c}) = ${b * b} - (${4 * a * c})`,
            latexResult: `D = ${formatNumber(disc)}`,
          },
        ],
        insight: {
          summary: `Fungsi kuadrat f(x) = ${a}x² ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}.`,
          dominance,
          causeAndEffect,
          whatIf: 'Mengubah koefisien a memperlebar atau mempersempit kelengkungan parabola serta menentukan apakah kurva memiliki nilai minimum atau maksimum.',
        },
      };
    }

    case 'supply-demand': {
      const demandInt = params.demandIntercept ?? 80;
      const demandSlope = params.demandSlope ?? 1;
      const supplyInt = params.supplyIntercept ?? 20;
      const supplySlope = params.supplySlope ?? 1;

      const sumSlope = demandSlope + supplySlope;
      const eqPrice = sumSlope > 0 ? (demandInt - supplyInt) / sumSlope : 0;
      const eqQty = demandInt - demandSlope * eqPrice;

      return {
        title: 'Keseimbangan Pasar: Kurva Permintaan & Penawaran',
        domain: 'Ekonomi Mikro',
        conceptPrompt: 'Geser kurva permintaan atau penawaran untuk menemukan harga ekuilibrium pasar.',
        results: [
          { label: 'Harga Keseimbangan', symbol: 'P*', value: formatCurrency(eqPrice), highlight: true },
          { label: 'Kuantitas Keseimbangan', symbol: 'Q*', value: formatNumber(eqQty, 'unit') },
          { label: 'Intersep Permintaan', symbol: 'a_d', value: formatNumber(demandInt) },
          { label: 'Intersep Penawaran', symbol: 'a_s', value: formatNumber(supplyInt) },
        ],
        calculations: [
          {
            title: 'Kondisi Ekuilibrium Pasar (Qd = Qs)',
            description: 'Harga keseimbangan terbentuk saat jumlah barang yang diminta pembeli sama persis dengan jumlah barang yang ditawarkan penjual (Qd = Qs).',
            latexFormula: 'Q_d = Q_s \\implies a_d - b_d P = a_s + b_s P',
            latexSubstitution: `${demandInt} - ${demandSlope}P = ${supplyInt} + ${supplySlope}P \\implies ${demandSlope + supplySlope}P = ${demandInt - supplyInt}`,
            latexResult: `P^* = ${formatCurrency(eqPrice)},\\quad Q^* = ${formatNumber(eqQty, 'unit')}`,
          },
        ],
        insight: {
          summary: `Ekuilibrium tercapai saat kuantitas yang diminta pembeli persis menyamai kuantitas yang ditawarkan produsen pada harga ${formatCurrency(eqPrice)}.`,
          dominance: eqPrice > 50 ? 'Tekanan permintaan pasar relatif tinggi mendorong kenaikan harga keseimbangan.' : 'Penawaran yang melimpah menjaga harga keseimbangan tetap stabil.',
          causeAndEffect: 'Tidak ada kelebihan permintaan (shortage) maupun kelebihan penawaran (surplus) pada titik perpotongan ini.',
          whatIf: 'Jika kurva permintaan bergeser ke kanan (permintaan naik), baik harga maupun kuantitas ekuilibrium pasar akan terdorong naik.',
        },
      };
    }

    case 'compound-interest': {
      const p = params.principal ?? 10;
      const r = (params.ratePercent ?? 10) / 100;
      const t = params.years ?? 5;
      const n = params.compoundsPerYear ?? 1;

      const finalAmount = p * Math.pow(1 + r / n, n * t);
      const totalInterest = finalAmount - p;
      const multiplier = p > 0 ? finalAmount / p : 1;
      const rule72 = (params.ratePercent ?? 10) > 0 ? 72 / (params.ratePercent ?? 10) : 0;

      return {
        title: 'Akumulasi Bunga Majemuk Eksponensial',
        domain: 'Matematika Finansial',
        conceptPrompt: 'Ubah modal awal dan suku bunga untuk melihat efek bunga majemuk terhadap waktu.',
        results: [
          { label: 'Nilai Akumulasi Akhir', symbol: 'A', value: `Rp\u00A0${formatNumber(finalAmount, 'juta')}`, highlight: true },
          { label: 'Bunga Terakumulasi', symbol: 'I', value: `Rp\u00A0${formatNumber(totalInterest, 'juta')}` },
          { label: 'Faktor Pelipatgandaan', symbol: 'M', value: `${formatNumber(multiplier)}x lipat` },
          { label: 'Waktu Penggandaan (Rule 72)', symbol: 'T_double', value: `~${formatNumber(rule72, 'tahun')}` },
        ],
        calculations: [
          {
            title: 'Rumus Bunga Majemuk Komposit',
            description: 'Saldo akhir (A) bertambah lebih cepat karena modal awal (P) ditambah bunga yang dihasilkan pada periode sebelumnya ikut dilipatgandakan pada periode berikutnya.',
            latexFormula: 'A = P \\left(1 + \\frac{r}{n}\\right)^{nt}',
            latexSubstitution: `A = ${p} \\left(1 + \\frac{${(r).toFixed(2)}}{${n}}\\right)^{${n} \\times ${t}} = ${p} \\times ${(Math.pow(1 + r / n, n * t)).toFixed(4)}`,
            latexResult: `A = \\text{Rp } ${formatNumber(finalAmount, 'juta')}`,
          },
        ],
        insight: {
          summary: `Modal awal sebesar Rp\u00A0${formatNumber(p, 'juta')} berkembang menjadi Rp\u00A0${formatNumber(finalAmount, 'juta')} dalam waktu ${t} tahun.`,
          dominance: t >= 10 ? 'Komponen waktu (t) telah menjadi kekuatan dominan eksponensial di mana bunga menghasilkan bunga yang jauh lebih besar dari modal awal.' : 'Pertumbuhan modal masih berada pada fase linier awal.',
          causeAndEffect: `Bunga terkumpul sebesar Rp\u00A0${formatNumber(totalInterest, 'juta')} merupakan buah dari compounding berkala.`,
          whatIf: 'Dengan kaidah 72, uang modalmu diproyeksikan akan melipatgandakan diri secara utuh setiap ~' + formatNumber(rule72, 'tahun') + '.',
        },
      };
    }

    case 'normal-distribution': {
      const mean = params.mean ?? 100;
      const stdDev = params.stdDev ?? 15;
      const testPoint = params.testPoint ?? 115;

      const z = stdDev > 0 ? (testPoint - mean) / stdDev : 0;
      const pdf = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);

      // Approximation for standard normal CDF
      const t = 1 / (1 + 0.2316419 * Math.abs(z));
      const d = 0.3989423 * Math.exp((-z * z) / 2);
      const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
      const cdf = z >= 0 ? 1 - prob : prob;

      return {
        title: 'Distribusi Normal Gauss: Peluang Kontinu',
        domain: 'Statistika & Probabilitas',
        conceptPrompt: 'Ubah rata-rata dan deviasi standar untuk melihat kurva distribusi Gauss.',
        results: [
          { label: 'Skor Standar', symbol: 'z', value: formatNumber(z), highlight: true },
          { label: 'Persentil Kumulatif P(X ≤ x)', symbol: 'CDF', value: formatPercent(cdf * 100) },
          { label: 'Densitas Titik', symbol: 'f(x)', value: formatNumber(pdf, '', 4) },
          { label: 'Nilai Rata-rata', symbol: 'μ', value: formatNumber(mean) },
          { label: 'Simpangan Baku', symbol: 'σ', value: formatNumber(stdDev) },
        ],
        calculations: [
          {
            title: 'Transformasi Skor Baku (Z-Score)',
            description: 'Skor Z menunjukkan berapa simpangan baku (standar deviasi σ) suatu nilai berjarak dari rata-rata (μ). Nilai positif berarti di atas rata-rata, nilai negatif berarti di bawah rata-rata.',
            latexFormula: 'z = \\frac{x - \\mu}{\\sigma}',
            latexSubstitution: `z = \\frac{${testPoint} - ${mean}}{${stdDev}} = \\frac{${testPoint - mean}}{${stdDev}}`,
            latexResult: `z = ${formatNumber(z)}`,
          },
        ],
        insight: {
          summary: `Titik uji x = ${testPoint} berjarak ${formatNumber(Math.abs(z))} standar deviasi dari nilai rata-rata (μ = ${mean}).`,
          dominance: Math.abs(z) > 2 ? 'Titik uji berada di wilayah ekstrem luar (kejadian langka < 5%).' : 'Titik uji berada di dalam rentang mayoritas populasi normal (±2σ).',
          causeAndEffect: `Peluang bahwa suatu sampel acak bernilai kurang dari atau sama dengan ${testPoint} adalah sebesar ${formatPercent(cdf * 100)}.`,
          whatIf: 'Jika kamu memperbesar standar deviasi σ, kurva lonceng akan melebar dan merata, menandakan variasi data yang semakin heterogen.',
        },
      };
    }

    case 'ph-scale': {
      const pH = Number(computed.pH ?? 7);
      const pOH = Number(computed.pOH ?? 7);
      const nature = String(computed.nature ?? (pH < 7 ? 'Asam' : pH > 7 ? 'Basa' : 'Netral'));

      return {
        title: 'Kesetimbangan Asam-Basa & Skala pH',
        domain: 'Kimia Larutan',
        conceptPrompt: 'Sesuaikan tingkat keasaman atau kebasaan untuk mengamati konsentrasi ion hidrogen.',
        results: [
          { label: 'Derajat Keasaman', symbol: 'pH', value: `pH ${formatNumber(pH)}`, highlight: true },
          { label: 'Derajat Kebasaan', symbol: 'pOH', value: `pOH ${formatNumber(pOH)}` },
          { label: 'Sifat Larutan', symbol: 'Klasifikasi', value: nature },
        ],
        calculations: [
          {
            title: 'Hubungan Tetapan Kesetimbangan Air (Kw)',
            description: 'Dalam larutan berair pada suhu kamar (25°C), derajat keasaman (pH) ditambah derajat kebasaan (pOH) selalu berjumlah konstan 14.',
            latexFormula: '\\text{pH} + \\text{pOH} = 14',
            latexSubstitution: `\\text{pOH} = 14 - \\text{pH} = 14 - ${formatNumber(pH)}`,
            latexResult: `\\text{pOH} = ${formatNumber(pOH)}`,
          },
          {
            title: 'Konsentrasi Ion Hidrogen [H⁺]',
            description: 'Skala pH berbanding terbalik secara logaritmik: larutan ber-pH 3 memiliki ion H⁺ 10 kali lebih pekat dibanding larutan ber-pH 4.',
            latexFormula: '[\\text{H}^+] = 10^{-\\text{pH}}\\text{ M}',
            latexSubstitution: `[\\text{H}^+] = 10^{-${formatNumber(pH)}}`,
            latexResult: `[\\text{H}^+] = 10^{-${formatNumber(pH)}}\\text{ M}`,
          },
        ],
        insight: {
          summary: `Larutan teridentifikasi sebagai ${nature} dengan nilai pH ${formatNumber(pH)}.`,
          dominance: pH < 7 ? 'Konsentrasi ion hidronium [H⁺] lebih tinggi daripada ion hidroksida [OH⁻].' : pH > 7 ? 'Konsentrasi ion hidroksida [OH⁻] mendominasi larutan.' : 'Konsentrasi [H⁺] dan [OH⁻] seimbang sempurna pada 10⁻⁷ M.',
          causeAndEffect: 'Setiap penurunan 1 poin skala pH mencerminkan peningkatan konsentrasi keasaman sebesar 10 kali lipat (skala logaritmik desimal).',
          whatIf: 'Menambahkan larutan basa akan menaikkan pH menuju netral atau basa dan menurunkan pOH secara bersamaan.',
        },
      };
    }

    case 'momentum-collision': {
      const m1 = Math.max(0.001, params.m1 ?? 2);
      const v1 = params.v1 ?? 5;
      const m2 = Math.max(0.001, params.m2 ?? 2);
      const v2 = params.v2 ?? 0;
      const e = Math.min(1, Math.max(0, params.elasticity ?? 1));

      const totalMass = m1 + m2;
      const v1Final = (m1 * v1 + m2 * v2 - m2 * e * (v1 - v2)) / totalMass;
      const v2Final = (m1 * v1 + m2 * v2 + m1 * e * (v1 - v2)) / totalMass;
      const pTotal = m1 * v1 + m2 * v2;
      const ekInitial = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
      const ekFinal = 0.5 * m1 * v1Final * v1Final + 0.5 * m2 * v2Final * v2Final;
      const ekLoss = Math.max(0, ekInitial - ekFinal);

      let dominance = '';
      let causeAndEffect = '';

      if (e === 1) {
        dominance = 'Koefisien restitusi maksimum (e = 1,00): Tumbukan lenting sempurna.';
        causeAndEffect = 'Momentum dan energi kinetik sistem kekal sepenuhnya tanpa ada energi yang hilang menjadi kalor atau deformasi benda.';
      } else if (e === 0) {
        dominance = 'Koefisien restitusi minimum (e = 0,00): Tumbukan tidak lenting sama sekali.';
        causeAndEffect = `Kedua benda menempel setelah tabrakan dan bergerak bersama dengan kecepatan yang sama persis (${formatNumber(v1Final, 'm/s')}). Disipasi energi maksimum terjadi sebesar ${formatNumber(ekLoss, 'J')}.`;
      } else {
        dominance = `Tumbukan lenting sebagian dengan koefisien elastisitas e = ${formatNumber(e)}.`;
        causeAndEffect = `Sebagian energi kinetik sebesar ${formatNumber(ekLoss, 'J')} terdisipasi, sementara momentum total tetap kekal sebesar ${formatNumber(pTotal, 'kg·m/s')}.`;
      }

      return {
        title: 'Hukum Kekekalan Momentum & Tumbukan 1D',
        domain: 'Fisika Dinamika',
        conceptPrompt: 'Ubah massa, kecepatan, dan elastisitas untuk mengamati konservasi momentum dan transfer energi.',
        results: [
          { label: 'Kecepatan Akhir Benda 1', symbol: "v₁'", value: formatNumber(v1Final, 'm/s'), highlight: true },
          { label: 'Kecepatan Akhir Benda 2', symbol: "v₂'", value: formatNumber(v2Final, 'm/s') },
          { label: 'Momentum Total Sistem', symbol: 'p_total', value: formatNumber(pTotal, 'kg·m/s') },
          { label: 'Energi Kinetik Hilang', symbol: 'ΔE_k', value: formatNumber(ekLoss, 'J') },
          { label: 'Elastisitas Restitusi', symbol: 'e', value: formatNumber(e) },
        ],
        calculations: [
          {
            title: 'Hukum Kekekalan Momentum Linear',
            description: 'Momentum total sebelum dan sesudah tumbukan selalu kekal pada sistem terisolasi.',
            latexFormula: 'p_{\\text{total}} = m_1 v_1 + m_2 v_2 = m_1 v_1\' + m_2 v_2\'',
            latexSubstitution: `p = (${m1} \\times ${v1}) + (${m2} \\times ${v2}) = ${m1 * v1} + ${m2 * v2}`,
            latexResult: `p_{\\text{total}} = ${formatNumber(pTotal, 'kg·m/s')}`,
          },
          {
            title: 'Kecepatan Pasca-Tumbukan 1D',
            description: 'Dihitung dengan menggabungkan persamaan momentum dan hukum koefisien restitusi e.',
            latexFormula: 'v_1\' = \\frac{m_1 v_1 + m_2 v_2 - m_2 e(v_1 - v_2)}{m_1 + m_2},\\quad v_2\' = \\frac{m_1 v_1 + m_2 v_2 + m_1 e(v_1 - v_2)}{m_1 + m_2}',
            latexSubstitution: `v_1\' = \\frac{${pTotal} - ${m2} \\times ${e} \\times (${v1 - v2})}{${totalMass}},\\quad v_2\' = \\frac{${pTotal} + ${m1} \\times ${e} \\times (${v1 - v2})}{${totalMass}}`,
            latexResult: `v_1\' = ${formatNumber(v1Final, 'm/s')},\\quad v_2\' = ${formatNumber(v2Final, 'm/s')}`,
          },
        ],
        insight: {
          summary: `Kereta 1 (${m1} kg, ${v1} m/s) menabrak Kereta 2 (${m2} kg, ${v2} m/s) dengan tingkat kelentingan e = ${formatNumber(e)}.`,
          dominance,
          causeAndEffect,
          whatIf: m1 === m2 && e === 1 ? 'Karena kedua massa bernilai sama dan tumbukan lenting sempurna, seluruh momentum kereta pertama ditransfer 100% ke kereta kedua.' : 'Jika massa benda penabrak jauh lebih besar daripada target (m1 >> m2), benda penabrak akan terus melaju nyaris tanpa melambat.',
        },
        experimentHint: 'Atur massa kedua kereta bernilai sama (2 kg) dan e = 1,0 untuk menyaksikan fenomena pertukaran kecepatan sempurna!',
      };
    }

    case 'linear-regression': {
      const slope = params.trueSlope ?? 1.5;
      const intercept = params.trueIntercept ?? 2.0;
      const noise = params.noise ?? 1.5;
      const n = Math.floor(params.sampleSize ?? 15);

      // Deterministic approximation matching engine
      const r2 = Math.max(0.1, Math.min(0.99, 1 - (noise * 0.15)));
      const r = Math.sqrt(r2) * (slope >= 0 ? 1 : -1);

      return {
        title: 'Regresi Linear Ordinary Least Squares (OLS)',
        domain: 'Statistika Inferensial',
        conceptPrompt: 'Sesuaikan kemiringan dan tingkat noise untuk mengamati garis kecocokan terbaik (OLS).',
        results: [
          { label: 'Kemiringan Garis (Slope)', symbol: 'm', value: formatNumber(slope), highlight: true },
          { label: 'Titik Potong (Intercept)', symbol: 'c', value: formatNumber(intercept) },
          { label: 'Koefisien Determinasi', symbol: 'R²', value: formatPercent(r2 * 100) },
          { label: 'Korelasi Pearson', symbol: 'r', value: formatNumber(r) },
          { label: 'Jumlah Titik Sampel', symbol: 'n', value: `${n} titik` },
        ],
        calculations: [
          {
            title: 'Persamaan Garis Kecocokan Terbaik (Best Fit Line)',
            description: 'Meminimalkan jumlah kuadrat residual galat vertikal antar data observasi.',
            latexFormula: '\\hat{y} = m x + c,\\quad m = \\frac{n\\sum xy - \\sum x\\sum y}{n\\sum x^2 - (\\sum x)^2}',
            latexSubstitution: `\\hat{y} = ${formatNumber(slope)}x ${intercept >= 0 ? '+ ' + formatNumber(intercept) : '- ' + formatNumber(Math.abs(intercept))}`,
            latexResult: `\\hat{y} = ${formatNumber(slope)}x ${intercept >= 0 ? '+ ' + formatNumber(intercept) : '- ' + formatNumber(Math.abs(intercept))}`,
          },
          {
            title: 'Kekuatan Hubungan (R² Goodness of Fit)',
            description: 'Proporsi variasi variabel dependen y yang dapat dijelaskan oleh model regresi x.',
            latexFormula: 'R^2 = 1 - \\frac{SS_{\\text{res}}}{SS_{\\text{tot}}}',
            latexSubstitution: `R^2 \\approx 1 - (${formatNumber(noise)} \\times 0{,}15) = ${formatNumber(r2)}`,
            latexResult: `R^2 = ${formatPercent(r2 * 100)}`,
          },
        ],
        insight: {
          summary: `Model regresi menangkap tren dengan kemiringan m = ${formatNumber(slope)} dan ketepatan varians R² = ${formatPercent(r2 * 100)}.`,
          dominance: noise <= 1.0 ? 'Data observasi sangat rapat mengelilingi garis regresi (hubungan sangat kuat).' : 'Noise data tinggi menyebabkan titik menyebar menjauhi garis tren.',
          causeAndEffect: `Setiap kenaikan 1 unit pada variabel X diproyeksikan akan meningkatkan variabel Y rata-rata sebesar ${formatNumber(slope)} unit.`,
          whatIf: 'Jika kamu menurunkan tingkat noise ke 0, semua titik sampel akan jatuh persis di sepanjang garis lurus sehingga R² bernilai 100%.',
        },
        experimentHint: 'Coba atur noise ke level terendah untuk membuktikan konvergensi nilai R² ke 100%.',
      };
    }

    case 'probability-coin': {
      const trials = params.trials ?? 100;
      const p = params.theoreticalProb ?? 0.5;
      const heads = Math.round(computed.headsCount ?? trials * p);
      const relFreq = heads / (trials || 1);
      const dev = Math.abs(relFreq - p);

      return {
        title: 'Probabilitas & Hukum Bilangan Besar (LLN)',
        domain: 'Teori Peluang & Statistik',
        conceptPrompt: 'Tentukan jumlah lemparan koin dan amati konvergensi frekuensi empiris menuju peluang teoretis.',
        results: [
          { label: 'Frekuensi Muncul Gambar', symbol: 'k', value: `${heads} kali (${formatPercent(relFreq * 100)})`, highlight: true },
          { label: 'Peluang Teoretis Acuan', symbol: 'p', value: formatPercent(p * 100) },
          { label: 'Deviasi Galat Empiris', symbol: '|f - p|', value: formatPercent(dev * 100) },
          { label: 'Total Percobaan', symbol: 'n', value: `${trials} lemparan` },
        ],
        calculations: [
          {
            title: 'Frekuensi Relatif Empiris',
            description: 'Perbandingan banyaknya kejadian sukses (gambar) terhadap total percobaan lemparan.',
            latexFormula: 'f_{\\text{rel}} = \\frac{k}{n}',
            latexSubstitution: `f_{\\text{rel}} = \\frac{${heads}}{${trials}} = ${formatNumber(relFreq, '', 4)}`,
            latexResult: `f_{\\text{rel}} = ${formatPercent(relFreq * 100)}`,
          },
          {
            title: 'Hukum Bilangan Besar (Law of Large Numbers)',
            description: 'Ketika n mendekati tak hingga, frekuensi empiris pasti berkonvergensi ke peluang teoretis p.',
            latexFormula: '\\lim_{n \\to \\infty} P\\left(\\left|\\frac{k}{n} - p\\right| < \\varepsilon\\right) = 1',
            latexSubstitution: `\\left|${formatPercent(relFreq * 100)} - ${formatPercent(p * 100)}\\right| = ${formatPercent(dev * 100)}`,
            latexResult: `\\text{Deviasi Galat } = ${formatPercent(dev * 100)}`,
          },
        ],
        insight: {
          summary: `Dari ${trials} lemparan acak, sisi gambar muncul sebanyak ${heads} kali (${formatPercent(relFreq * 100)}).`,
          dominance: dev <= 0.03 ? 'Frekuensi empiris sudah sangat dekat dengan probabilitas teoretis (deviasi < 3%).' : 'Fluktuasi acak masih cukup terlihat karena ukuran sampel yang terbatas.',
          causeAndEffect: 'Ketidakteraturan individu pada setiap pelemparan menghasilkan keteraturan statistik yang stabil saat diulang ratusan kali.',
          whatIf: 'Jika jumlah percobaan ditingkatkan dari 50 menjadi 1000 lemparan, simpangan deviasi akan menyusut mendekati 0% secara konsisten.',
        },
      };
    }

    case 'sorting-algorithms':
    case 'sorting-visualizer': {
      const n = params.arraySize ?? 20;
      const algoIdx = params.algorithm ?? 0;
      const speed = params.speed ?? 50;
      const algoNames = ['Bubble Sort', 'Selection Sort', 'Insertion Sort'];
      const algoName = algoNames[algoIdx] || 'Bubble Sort';
      const comparisons = Math.round(n * (n - 1) / 2);

      return {
        title: 'Analisis Algoritma Pengurutan Data',
        domain: 'Ilmu Komputer & Algoritma',
        conceptPrompt: 'Pilih algoritma pengurutan dan amati bagaimana data disusun langkah demi langkah.',
        results: [
          { label: 'Algoritma Aktif', symbol: 'Metode', value: algoName, highlight: true },
          { label: 'Ukuran Larik Data', symbol: 'n', value: `${n} elemen` },
          { label: 'Estimasi Komparasi', symbol: 'T(n)', value: `~${comparisons} perbandingan` },
          { label: 'Kompleksitas Teoretis', symbol: 'Asimptotik', value: 'O(n²)' },
          { label: 'Jeda Langkah Visual', symbol: 'Speed', value: `${speed} ms` },
        ],
        calculations: [
          {
            title: 'Analisis Kompleksitas Waktu Komparasi',
            description: 'Algoritma berbasis perbandingan pasangan membutuhkan pemeriksaan kuadratik pada kasus terburuk.',
            latexFormula: 'T(n) = \\sum_{i=1}^{n-1} (n - i) = \\frac{n(n - 1)}{2} \\in \\mathcal{O}(n^2)',
            latexSubstitution: `T(${n}) = \\frac{${n} \\times (${n} - 1)}{2} = \\frac{${n} \\times ${n - 1}}{2}`,
            latexResult: `T(${n}) = ${comparisons}\\text{ komparasi}`,
          },
        ],
        insight: {
          summary: `Algoritma ${algoName} sedang memproses ${n} elemen data acak.`,
          dominance: algoIdx === 0 ? 'Bubble Sort menukar elemen bersebelahan secara berulang hingga nilai terbesar mengapung ke ujung.' : algoIdx === 1 ? 'Selection Sort memindai seluruh sisa larik untuk mencari nilai minimum sebelum menukarnya sekali.' : 'Insertion Sort membangun larik terurut secara inkremental dengan menyisipkan tiap elemen ke posisi yang tepat.',
          causeAndEffect: `Dengan jumlah data n = ${n}, algoritma memerlukan sekitar ${comparisons} komparasi untuk menyelesaikan pengurutan.`,
          whatIf: 'Jika ukuran data digandakan dari 20 menjadi 40, beban komparasi tidak bertambah 2 kali lipat melainkan melonjak 4 kali lipat karena kompleksitas O(n²).',
        },
      };
    }

    case 'binary-search': {
      const target = params.target ?? 23;
      const n = params.arraySize ?? 16;
      const maxSteps = Math.floor(Math.log2(Math.max(1, n || 16))) + 1;

      return {
        title: 'Strategi Divide & Conquer: Binary Search',
        domain: 'Struktur Data & Algoritma',
        conceptPrompt: 'Tentukan target angka dan amati bagaimana ruang pencarian dipangkas separuh di setiap langkah.',
        results: [
          { label: 'Target Nilai Dicari', symbol: 'Target', value: formatNumber(target), highlight: true },
          { label: 'Ukuran Ruang Larik', symbol: 'n', value: `${n} elemen terurut` },
          { label: 'Batas Langkah Maksimum', symbol: 'k_max', value: `${maxSteps} langkah` },
          { label: 'Kompleksitas Waktu', symbol: 'T(n)', value: 'O(log₂ n)' },
        ],
        calculations: [
          {
            title: 'Batas Logaritmik Pencarian Biner',
            description: 'Setiap iterasi membagi dua ruang pencarian yang tersisa sehingga jumlah langkah perbandingan maksimum adalah ⌊log₂(n)⌋ + 1.',
            latexFormula: 'k_{\\text{max}} = \\lfloor \\log_2(n) \\rfloor + 1',
            latexSubstitution: `k_{\\text{max}} = \\lfloor \\log_2(${n}) \\rfloor + 1 = \\lfloor ${Math.log2(n).toFixed(2)} \\rfloor + 1`,
            latexResult: `k_{\\text{max}} = ${maxSteps}\\text{ langkah}`,
          },
        ],
        insight: {
          summary: `Pencarian target ${target} pada larik terurut berisi ${n} elemen dijamin selesai paling banyak dalam ${maxSteps} langkah.`,
          dominance: 'Strategi pemotongan separuh (biseksi) mengeliminasi 50% kandidat yang salah di setiap perbandingan tunggal.',
          causeAndEffect: 'Karena data sudah terurut (sorted), perbandingan dengan elemen tengah (mid) cukup untuk menentukan apakah target berada di paruh kiri atau kanan.',
          whatIf: 'Bahkan jika larik data diperbesar hingga 1.000.000 elemen, pencarian biner hanya memerlukan maksimal 20 langkah (⌊log₂ 1.000.000⌋ + 1 = 20).',
        },
      };
    }

    case 'graph-traversal': {
      const isDFS = (params.algorithm ?? 0) === 1;
      const startNodeIdx = Math.min(5, Math.max(0, Math.floor(params.startNode ?? 0)));
      const nodeLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
      const startLetter = nodeLetters[startNodeIdx] || 'A';

      return {
        title: 'Penelusuran Graf: BFS vs DFS',
        domain: 'Teori Graf & Algoritma',
        conceptPrompt: 'Pilih metode traversal (BFS/DFS) dan telusuri simpul graf langkah demi langkah.',
        results: [
          { label: 'Metode Penelusuran', symbol: 'Metode', value: isDFS ? 'Depth-First Search (DFS)' : 'Breadth-First Search (BFS)', highlight: true },
          { label: 'Struktur Data Utama', symbol: 'Struktur', value: isDFS ? 'Stack (Tumpukan LIFO)' : 'Queue (Antrean FIFO)' },
          { label: 'Simpul Awal (Root)', symbol: 'Start', value: `Simpul ${startLetter}` },
          { label: 'Kompleksitas Waktu', symbol: 'T(V, E)', value: 'O(|V| + |E|)' },
        ],
        calculations: [
          {
            title: 'Kompleksitas Traversal Graf Terhubung',
            description: 'Setiap simpul dan sisi diperiksa tepat satu kali selama proses penelusuran graf.',
            latexFormula: 'T(V, E) = \\mathcal{O}(|V| + |E|)',
            latexSubstitution: `|V| = 6\\text{ simpul},\\quad |E| = 7\\text{ sisi} \\implies T = 6 + 7`,
            latexResult: `T = 13\\text{ operasi dasar}`,
          },
        ],
        insight: {
          summary: `Penelusuran graf dimulai dari Simpul ${startLetter} menggunakan metode ${isDFS ? 'DFS' : 'BFS'}.`,
          dominance: isDFS ? 'DFS menelusuri sedalam mungkin ke ujung cabang sebelum melakukan backtracking (mundur).' : 'BFS mengeksplorasi seluruh tetangga langsung pada tingkat kedalaman yang sama sebelum maju ke lapis berikutnya.',
          causeAndEffect: isDFS ? 'Stack menyimpan jejak kedalaman, sangat efektif untuk mendeteksi siklus dan pencarian komponen topologi.' : 'Queue memastikan lintasan yang ditemukan selalu merupakan rute terpendek pada graf tak berbobot.',
          whatIf: 'Mengubah simpul awal akan mengubah urutan kunjungan simpul tanpa mempengaruhi total keterjangkauan komponen graf.',
        },
      };
    }

    // Default generic math/science presenter for other simulations
    default: {
      const simDef = getGenlabSimulation(slug);
      if (simDef) {
        const results: HumanResultItem[] = [];
        for (const [k, v] of Object.entries(computed)) {
          if (k.includes('spec') || k.includes('experiments') || typeof v === 'object' || v === null) continue;
          results.push(humanizeResultItem(k, v));
        }

        if (results.length > 0) {
          results[0].highlight = true;
        }

        const paramSummaries = Object.entries(params)
          .map(([k, v]) => `${k} = ${formatNumber(v)}`)
          .join(', ');

        const dyn = (simDef as any).generateInsight ? (simDef as any).generateInsight(params, computed) : null;
        const keyInsightText = (dyn as any)?.keyInsight || (dyn as any)?.summary || `Kondisi perhitungan saat ini: ${paramSummaries}.`;

        return {
          title: simDef.spec.title || slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          domain: simDef.discipline || 'Laboratorium GEN LABS',
          conceptPrompt: simDef.spec.description || 'Ubah nilai pada panel geser untuk melihat perubahan hasil dan grafik secara langsung.',
          results: results.slice(0, 6),
          calculations: [
            {
              title: 'Prinsip Dasar & Rumus Utama',
              description: 'Rumus matematika yang digunakan untuk menghitung hasil pada simulasi ini.',
              latexFormula: simDef.formulaLatex || 'R = f(P_1, P_2, \\dots, P_n)',
              latexSubstitution: paramSummaries,
              latexResult: results[0] ? `${results[0].symbol ? `${results[0].symbol} = ` : ''}${results[0].value}` : 'Selesai Dihitung',
            },
          ],
          insight: {
            summary: keyInsightText,
            dominance: (dyn as any)?.dominance || `Nilai saat ini: ${paramSummaries}.`,
            causeAndEffect: (dyn as any)?.causeAndEffect || (dyn as any)?.keyInsight || 'Setiap nilai yang kamu ubah akan langsung menghitung ulang hasil percobaan secara akurat.',
            whatIf: (dyn as any)?.tryNext || (dyn as any)?.whatIf || 'Coba selesaikan tantangan di panel eksperimen untuk menguji pemahamanmu.',
          },
        };
      }

      const results: HumanResultItem[] = [];
      const calculations: CalculationStep[] = [];

      for (const [k, v] of Object.entries(computed)) {
        if (typeof v === 'number' && !k.includes('display') && !k.includes('equation') && !k.includes('spec')) {
          results.push(humanizeResultItem(k, v));
        }
      }

      if (results.length > 0) {
        results[0].highlight = true;
      }

      const paramSummaries = Object.entries(params)
        .map(([k, v]) => `${k} = ${formatNumber(v)}`)
        .join(', ');

      return {
        title: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        domain: 'Sains Interaktif',
        conceptPrompt: 'Ubah nilai variabel untuk melihat pengaruhnya pada hasil perhitungan.',
        results: results.slice(0, 5),
        calculations: [
          {
            title: 'Perhitungan Nilai',
            description: 'Hubungan antarvariabel yang dihitung secara langsung.',
            latexFormula: 'f(P_1, P_2, \\dots, P_n) \\to \\text{Hasil Perhitungan}',
            latexSubstitution: paramSummaries,
            latexResult: results[0] ? `${results[0].symbol} = ${results[0].value}` : 'Selesai Dihitung',
          },
        ],
        insight: {
          summary: `Simulasi aktif dengan nilai (${paramSummaries}).`,
          dominance: 'Nilai yang dimasukkan berada dalam batas perhitungan yang tepat.',
          causeAndEffect: 'Setiap perubahan nilai langsung memperbarui tampilan di kanvas dan angka perhitungan.',
          whatIf: 'Geser tombol nilai untuk melihat apakah hasilnya bertambah atau berkurang.',
        },
      };
    }
  }

}

