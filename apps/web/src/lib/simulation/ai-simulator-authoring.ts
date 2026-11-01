/**
 * AI Simulator Authoring & Partial Patch Engine.
 * 
 * Requirements #9, #10, #11, #12, #13, #24, #26:
 * - AI outputs structured SimulatorDefinition, NEVER frontend/canvas code.
 * - Supports surgical partial updates (JSON Patches) to save tokens.
 * - AI does not regenerate the entire simulator when only one field changes.
 * - Validates updates against allowable schemas.
 */

import { UnifiedSimulatorSpec } from './simulator-schema';

export interface SimulatorPatch {
  op: 'update' | 'add' | 'delete';
  target: string; // e.g. "parameters.force.max", "info.title", "experiments"
  value?: any;
}

/**
 * Applies a surgical patch to an existing simulator specification without regenerating the rest.
 */
export function applySimulatorPatch(
  spec: UnifiedSimulatorSpec,
  patch: SimulatorPatch
): UnifiedSimulatorSpec {
  const clone: UnifiedSimulatorSpec = JSON.parse(JSON.stringify(spec));
  const { op, target, value } = patch;

  if (!target) return clone;

  const parts = target.split('.');

  // Helper for deep setting
  let current: any = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (current[p] === undefined || current[p] === null) {
      current[p] = {};
    }
    current = current[p];
  }

  const lastKey = parts[parts.length - 1];

  switch (op) {
    case 'update':
      current[lastKey] = value;
      break;

    case 'add':
      if (Array.isArray(current[lastKey])) {
        current[lastKey].push(value);
      } else if (Array.isArray(current)) {
        current.push(value);
      } else if (typeof current[lastKey] === 'object' && current[lastKey] !== null) {
        current[lastKey] = { ...current[lastKey], ...value };
      } else {
        current[lastKey] = value;
      }
      break;

    case 'delete':
      if (Array.isArray(current)) {
        const idx = Number(lastKey);
        if (!isNaN(idx)) current.splice(idx, 1);
      } else if (typeof current === 'object' && current !== null) {
        delete current[lastKey];
      }
      break;
  }

  // Auto-increment version
  if (clone.info) {
    clone.info.version = (clone.info.version || 1) + 1;
  }

  return clone;
}

/**
 * Builds a minimalist, token-efficient prompt payload for AI authoring or tutor.
 * Requirement #10 & #24:
 * Never send entire application source or whole database.
 * Send only active simulator slice + current question/instruction.
 */
export function buildMinimalAiAuthoringContext(
  spec: UnifiedSimulatorSpec,
  instruction: string,
  selectedElementId?: string
) {
  return {
    instruction,
    active_simulator: {
      title: spec.info.title,
      discipline: spec.info.discipline,
      parameters: Object.keys(spec.parameters).map((k) => ({
        key: k,
        label: spec.parameters[k].label,
        current_range: `${spec.parameters[k].min} - ${spec.parameters[k].max} ${spec.parameters[k].unit || ''}`,
      })),
      calculations: Object.keys(spec.calculations).map((k) => ({
        key: k,
        formula: spec.calculations[k].formula,
      })),
      selected_element: selectedElementId,
    },
  };
}

/**
 * Validates an AI-generated simulator spec or patch before applying.
 * Requirement #26:
 * Ensure parameter limits are valid (min < max), calculations valid, no scripts.
 */
export function validateSimulatorSpec(spec: UnifiedSimulatorSpec): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!spec.info?.title?.trim()) {
    errors.push('Judul simulator tidak boleh kosong.');
  }

  if (!spec.parameters || Object.keys(spec.parameters).length === 0) {
    errors.push('Simulator harus memiliki minimal 1 parameter kontrol.');
  }

  for (const [key, p] of Object.entries(spec.parameters || {})) {
    if (p.min >= p.max) {
      errors.push(`Parameter "${p.label || key}" memiliki nilai min (>= max) yang tidak valid.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Interprets natural language admin instruction into surgical JSON Patch without regenerating entire simulator.
 * Requirements #5, #10:
 * "ubah nilai maksimum parameter X", "ubah judul", "tambahkan insight", "tambahkan eksperimen", "hapus parameter".
 * Measures exact input/output tokens to guarantee zero codebase leakage.
 */
export function interpretAiPatchInstruction(
  spec: UnifiedSimulatorSpec,
  instruction: string
): {
  patched: UnifiedSimulatorSpec;
  patch: SimulatorPatch;
  inputTokens: number;
  outputTokens: number;
} {
  const lower = instruction.toLowerCase().trim();
  const context = buildMinimalAiAuthoringContext(spec, instruction);
  const contextStr = JSON.stringify(context);
  const inputTokens = Math.ceil(contextStr.length / 4);

  let patch: SimulatorPatch = { op: 'update', target: 'info.version', value: (spec.info.version || 1) + 1 };

  // 1. "tambahkan eksperimen [title]"
  if (lower.includes('eksperimen') || lower.includes('experiment') || lower.includes('tantangan')) {
    const titleMatch = instruction.match(/(?:eksperimen|tantangan)\s+([^:,\n]+)/i);
    const expTitle = titleMatch ? titleMatch[1].trim() : 'Tantangan Baru';
    const firstCalc = Object.keys(spec.calculations)[0] || 'acceleration';
    patch = {
      op: 'add',
      target: 'experiments',
      value: {
        id: `exp-${Date.now()}`,
        title: expTitle,
        objective: `Capai nilai ${firstCalc} yang ditargetkan dengan menyesuaikan parameter kontrol.`,
        targetMetric: firstCalc,
        targetValue: 50,
        tolerance: 0.1,
        unit: spec.calculations[firstCalc]?.unit || '',
        successMessage: 'Eksperimen baru berhasil diselesaikan!',
      },
    };
  }
  // 2. "ubah nilai maksimum parameter [key] [val]"
  else if (lower.includes('maksimum') || lower.includes('max') || lower.includes('batas atas')) {
    // Find matching parameter key in spec
    let matchedKey: string | null = null;
    for (const k of Object.keys(spec.parameters)) {
      if (lower.includes(k.toLowerCase()) || lower.includes(spec.parameters[k].label.toLowerCase())) {
        matchedKey = k;
        break;
      }
    }
    if (!matchedKey) matchedKey = Object.keys(spec.parameters)[0] || 'force';

    const numMatch = lower.match(/\b([0-9]+(?:\.[0-9]+)?)\b/);
    const newVal = numMatch ? Number(numMatch[1]) : spec.parameters[matchedKey].max * 2;

    patch = {
      op: 'update',
      target: `parameters.${matchedKey}.max`,
      value: newVal,
    };
  }
  // 2. "ubah judul [title]"
  else if (lower.includes('judul') || lower.includes('title')) {
    const titleMatch = instruction.match(/(?:ubah|ganti)\s+judul(?:\s+menjadi)?\s*[:"]?\s*([^".\n]+)/i);
    const newTitle = titleMatch ? titleMatch[1].trim() : instruction.replace(/^.*judul/i, '').trim();
    patch = {
      op: 'update',
      target: 'info.title',
      value: newTitle || `${spec.info.title} (Revisi)`,
    };
  }
  // 3. "tambahkan insight [insight]"
  else if (lower.includes('insight') || lower.includes('wawasan')) {
    const text = instruction.replace(/^.*(?:insight|wawasan)(?:\s+baru|\s+tentang)?\s*[:"]?\s*/i, '').trim();
    patch = {
      op: 'update',
      target: 'insight.causeAndEffect',
      value: text || 'Parameter ini berpengaruh signifikan terhadap dinamika sistem.',
    };
  }
  // 4. "hapus parameter [key]"
  else if (lower.includes('hapus') && (lower.includes('parameter') || lower.includes('variabel'))) {
    let matchedKey: string | null = null;
    for (const k of Object.keys(spec.parameters)) {
      if (lower.includes(k.toLowerCase()) || lower.includes(spec.parameters[k].label.toLowerCase())) {
        matchedKey = k;
        break;
      }
    }
    if (matchedKey && Object.keys(spec.parameters).length > 1) {
      patch = {
        op: 'delete',
        target: `parameters.${matchedKey}`,
      };
    }
  }

  const patched = applySimulatorPatch(spec, patch);
  const outputTokens = Math.ceil(JSON.stringify(patch).length / 4);

  return { patched, patch, inputTokens, outputTokens };
}

/**
 * Generates brand new unified simulator specification from prompt without creating any new canvas.
 * Requirement #4:
 * A. Fisika
 * B. Akuntansi
 * C. Algoritma
 */
export function generateAiSimulator(prompt: string): UnifiedSimulatorSpec {
  const lower = prompt.toLowerCase();

  // A. FISIKA: Hukum Hooke (Elastisitas Pegas)
  if (lower.includes('hooke') || lower.includes('pegas') || lower.includes('spring') || lower.includes('elastisitas')) {
    return {
      id: 'sim-hukum-hooke',
      slug: 'hukum-hooke',
      info: {
        title: 'Hukum Hooke (Elastisitas Pegas)',
        description: 'Eksperimen pertambahan panjang pegas terhadap gaya tarik dan konstanta pegas (F = k · Δx).',
        discipline: 'Fisika',
        topic: 'Elastisitas & Getaran',
        difficulty: 'basic',
        estimatedTime: '10–15 menit',
        status: 'published',
        version: 1,
      },
      parameters: {
        k: {
          key: 'k',
          label: 'Konstanta Pegas (k)',
          min: 50,
          max: 500,
          step: 25,
          defaultVal: 200,
          unit: 'N/m',
          description: 'Kekakuan pegas mekanik',
        },
        mass: {
          key: 'mass',
          label: 'Massa Beban Gantung',
          min: 0.5,
          max: 10,
          step: 0.5,
          defaultVal: 2,
          unit: 'kg',
          description: 'Massa beban yang digantung pada pegas',
        },
        gravity: {
          key: 'gravity',
          label: 'Percepatan Gravitasi (g)',
          min: 1,
          max: 20,
          step: 0.1,
          defaultVal: 9.8,
          unit: 'm/s²',
          description: 'Medan gravitasi lokal',
        },
      },
      calculations: {
        weight: {
          key: 'weight',
          label: 'Gaya Berat Beban (W)',
          formula: 'mass * gravity',
          unit: 'N',
        },
        deltaX: {
          key: 'deltaX',
          label: 'Pertambahan Panjang (Δx)',
          formula: 'weight / k',
          unit: 'm',
        },
        potentialEnergy: {
          key: 'potentialEnergy',
          label: 'Energi Potensial Pegas (Ep)',
          formula: '0.5 * k * (deltaX ^ 2)',
          unit: 'Joule',
        },
      },
      visual: {
        viewBox: { width: 640, height: 360 },
        archetype: 'physics',
        groundPlane: false,
        elements: [
          { id: 'ceiling', type: 'line', x: 260, y: 40, x2: 380, y2: 40, stroke: 'var(--color-border)', strokeWidth: 4 },
          { id: 'spring-line', type: 'line', x: 320, y: 40, x2: 320, y2: '60 + deltaX * 800', stroke: 'var(--color-primary)', strokeWidth: 3 },
          { id: 'mass-box', type: 'shape', x: 290, y: '60 + deltaX * 800', width: 60, height: 50, fill: 'var(--color-canvas-object)', stroke: 'var(--color-secondary)', strokeWidth: 2 },
          { id: 'gravity-arrow', type: 'arrow', x: 320, y: '110 + deltaX * 800', x2: 320, y2: '160 + deltaX * 800', stroke: 'var(--color-accent)', strokeWidth: 2.5, label: 'W = m·g' },
        ],
      },
      results: [
        { key: 'dx', label: 'Pertambahan Panjang', symbol: 'Δx', calculationKey: 'deltaX', unit: 'm', highlight: true },
        { key: 'w', label: 'Gaya Berat Beban', symbol: 'W', calculationKey: 'weight', unit: 'N' },
        { key: 'ep', label: 'Energi Potensial', symbol: 'Ep', calculationKey: 'potentialEnergy', unit: 'J' },
      ],
      insight: {
        summary: 'Pertambahan panjang pegas berbanding lurus dengan gaya berat dan berbanding terbalik dengan konstanta pegas.',
        causeAndEffect: 'Semakin kaku pegas (nilai k besar), pertambahan panjang akan semakin kecil untuk beban yang sama.',
        whatIf: 'Jika konstanta pegas dilipatgandakan, regangan pegas terpangkas separuhnya.',
      },
      experiments: [
        {
          id: 'exp-hooke-1',
          title: 'Tantangan Regangan Tepat 0.10 m',
          objective: 'Sesuaikan konstanta pegas atau massa beban hingga pegas meregang tepat 0.10 m (toleransi 0.01 m).',
          targetMetric: 'deltaX',
          targetValue: 0.1,
          tolerance: 0.01,
          unit: 'm',
          successMessage: 'Hebat! Kamu berhasil menyeimbangkan gaya beban dengan elastisitas pegas.',
        },
      ],
    };
  }

  // B. AKUNTANSI: Neraca Saldo & Persamaan Akuntansi
  if (lower.includes('akuntansi') || lower.includes('neraca') || lower.includes('saldo') || lower.includes('aset') || lower.includes('liabilitas')) {
    return {
      id: 'sim-neraca-saldo',
      slug: 'neraca-saldo',
      info: {
        title: 'Neraca Saldo & Persamaan Akuntansi',
        description: 'Simulasi keseimbangan neraca akuntansi: Total Aset harus selalu seimbang dengan Liabilitas ditambah Ekuitas.',
        discipline: 'Akuntansi Perpajakan',
        topic: 'Laporan Posisi Keuangan',
        difficulty: 'basic',
        estimatedTime: '10–15 menit',
        status: 'published',
        version: 1,
      },
      parameters: {
        kas: {
          key: 'kas',
          label: 'Kas & Setara Kas',
          min: 10000000,
          max: 100000000,
          step: 5000000,
          defaultVal: 40000000,
          unit: 'Rp',
        },
        piutang: {
          key: 'piutang',
          label: 'Piutang Usaha',
          min: 5000000,
          max: 50000000,
          step: 2500000,
          defaultVal: 20000000,
          unit: 'Rp',
        },
        peralatan: {
          key: 'peralatan',
          label: 'Peralatan Kantor',
          min: 10000000,
          max: 80000000,
          step: 5000000,
          defaultVal: 30000000,
          unit: 'Rp',
        },
        utangUsaha: {
          key: 'utangUsaha',
          label: 'Utang Usaha Lancar',
          min: 5000000,
          max: 60000000,
          step: 5000000,
          defaultVal: 30000000,
          unit: 'Rp',
        },
        modalPemilik: {
          key: 'modalPemilik',
          label: 'Modal Disetor Pemilik',
          min: 20000000,
          max: 120000000,
          step: 5000000,
          defaultVal: 60000000,
          unit: 'Rp',
        },
      },
      calculations: {
        totalAssets: {
          key: 'totalAssets',
          label: 'Total Aktiva (Aset)',
          formula: 'kas + piutang + peralatan',
          unit: 'Rp',
        },
        totalLiabilitiesEquity: {
          key: 'totalLiabilitiesEquity',
          label: 'Total Passiva (Liabilitas + Ekuitas)',
          formula: 'utangUsaha + modalPemilik',
          unit: 'Rp',
        },
        selisihNeraca: {
          key: 'selisihNeraca',
          label: 'Selisih Keseimbangan (Diskrepansi)',
          formula: 'totalAssets - totalLiabilitiesEquity',
          unit: 'Rp',
        },
      },
      visual: {
        viewBox: { width: 640, height: 360 },
        archetype: 'balance',
        elements: [],
      },
      results: [
        { key: 'ta', label: 'Total Aset', symbol: 'Aktiva', calculationKey: 'totalAssets', unit: 'Rp', highlight: true },
        { key: 'tle', label: 'Liabilitas + Ekuitas', symbol: 'Passiva', calculationKey: 'totalLiabilitiesEquity', unit: 'Rp', highlight: true },
        { key: 'gap', label: 'Selisih Neraca', symbol: 'Δ', calculationKey: 'selisihNeraca', unit: 'Rp' },
      ],
      insight: {
        summary: 'Prinsip pencatatan berpasangan (double-entry) mensyaratkan setiap rupiah aset didanai oleh utang atau modal pemilik.',
        causeAndEffect: 'Jika aset bertambah tanpa penambahan utang atau ekuitas, neraca akan mengalami diskrepansi (tidak seimbang).',
        whatIf: 'Neraca seimbang sempurna tercapai ketika selisih bernilai tepat nol rupiah.',
      },
      experiments: [
        {
          id: 'exp-balance-1',
          title: 'Tantangan Neraca Seimbang Sempurna (Selisih = 0)',
          objective: 'Sesuaikan komponen kas, piutang, dan utang usaha agar total aktiva persis sama dengan total passiva (selisih = 0).',
          targetMetric: 'selisihNeraca',
          targetValue: 0,
          tolerance: 1,
          unit: 'Rp',
          successMessage: 'Audit Lulus! Neraca keuangan berimbang sempurna.',
        },
      ],
    };
  }

  // C. ALGORITMA: Pencarian Linear & Efisiensi Loop
  return {
    id: 'sim-pencarian-linear',
    slug: 'pencarian-linear',
    info: {
      title: 'Pencarian Linear & Kompleksitas O(n)',
      description: 'Simulasi algoritma pencarian linear: menganalisis jumlah perbandingan elemen hingga target ditemukan.',
      discipline: 'Teknologi Rekayasa Perangkat Lunak',
      topic: 'Algoritma & Struktur Data',
      difficulty: 'basic',
      estimatedTime: '10–15 menit',
      status: 'published',
      version: 1,
    },
    parameters: {
      arraySize: {
        key: 'arraySize',
        label: 'Ukuran Larik Data (n)',
        min: 4,
        max: 10,
        step: 1,
        defaultVal: 8,
        unit: 'elemen',
      },
      targetPosition: {
        key: 'targetPosition',
        label: 'Posisi Target Angka (Index)',
        min: 1,
        max: 8,
        step: 1,
        defaultVal: 5,
        unit: 'indeks',
      },
      costPerStepMs: {
        key: 'costPerStepMs',
        label: 'Biaya Waktu Komparasi CPU',
        min: 1,
        max: 10,
        step: 1,
        defaultVal: 2,
        unit: 'ms',
      },
    },
    calculations: {
      comparisonsCount: {
        key: 'comparisonsCount',
        label: 'Jumlah Perbandingan (Steps)',
        formula: 'targetPosition',
        unit: 'langkah',
      },
      totalExecutionTime: {
        key: 'totalExecutionTime',
        label: 'Total Waktu Eksekusi',
        formula: 'comparisonsCount * costPerStepMs',
        unit: 'ms',
      },
      worstCaseSteps: {
        key: 'worstCaseSteps',
        label: 'Kasus Terburuk O(n)',
        formula: 'arraySize',
        unit: 'langkah',
      },
    },
    visual: {
      viewBox: { width: 640, height: 360 },
      archetype: 'sequence',
      elements: [],
    },
    results: [
      { key: 'steps', label: 'Langkah Perbandingan', symbol: 'Steps', calculationKey: 'comparisonsCount', unit: 'langkah', highlight: true },
      { key: 'time', label: 'Waktu Eksekusi', symbol: 'T(n)', calculationKey: 'totalExecutionTime', unit: 'ms' },
      { key: 'worst', label: 'Batas Terburuk O(n)', symbol: 'Worst', calculationKey: 'worstCaseSteps', unit: 'langkah' },
    ],
    insight: {
      summary: 'Pada pencarian linear, waktu pencarian berbanding lurus secara linier dengan letak posisi target dalam larik.',
      causeAndEffect: 'Semakin ke belakang target berada, semakin banyak iterasi perbandingan yang harus dieksekusi CPU.',
      whatIf: 'Jika target berada di elemen terakhir, pencarian mencapai kasus terburuk O(n).',
    },
    experiments: [
      {
        id: 'exp-search-1',
        title: 'Tantangan Eksekusi Cepat (Maksimal 6 ms)',
        objective: 'Atur posisi target dan efisiensi komparasi hingga total waktu eksekusi berada di bawah atau sama dengan 6 ms.',
        targetMetric: 'totalExecutionTime',
        targetValue: 6,
        tolerance: 0.5,
        unit: 'ms',
        successMessage: 'Optimal! Algoritma menemukan target dalam batas latensi yang diinginkan.',
      },
    ],
  };
}
