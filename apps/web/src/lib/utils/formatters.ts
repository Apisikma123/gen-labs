/**
 * Universal mathematical and scientific number formatter for Gen Labs.
 * Converts raw calculation floats into human-readable Indonesian notation:
 * - 10.00 -> "10"
 * - 10.50 -> "10,5"
 * - 12.8123 -> "12,81"
 * - 53.12999 -> "53,13°"
 * - 9.9999999997 -> "10"
 * Handles proper scientific units and eliminates raw floating-point noise.
 */

export function formatNumber(
  val: number | string | null | undefined,
  unit?: string,
  maxDecimals: number = 2
): string {
  if (val === null || val === undefined || val === '') return '-';
  const num = typeof val === 'number' ? val : Number(val);
  if (isNaN(num)) return String(val);

  // Eliminate floating point noise (e.g. 9.9999999997 -> 10, 53.12999999999999 -> 53.13)
  const factor = Math.pow(10, maxDecimals);
  const rounded = Math.round((num + Number.EPSILON) * factor) / factor;

  // Format with Indonesian locale (comma as decimal separator, period as thousand separator)
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(rounded);

  if (!unit) return formatted;
  if (unit === '°' || unit === 'deg') return `${formatted}°`;
  if (unit === '%') return `${formatted}%`;
  if (unit === 'Rp') return `Rp\u00A0${formatted}`;

  return `${formatted}\u00A0${unit}`;
}

export function formatCurrency(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return 'Rp\u00A00';
  const rounded = Math.round(val);
  return `Rp\u00A0${new Intl.NumberFormat('id-ID').format(rounded)}`;
}

export function formatAngle(deg: number | null | undefined): string {
  return formatNumber(deg, '°', 2);
}

export function formatPercent(rate: number | null | undefined, maxDecimals: number = 1): string {
  return formatNumber(rate, '%', maxDecimals);
}

export interface FormattedParamItem {
  key: string;
  label: string;
  value: string;
  unit?: string;
}

/**
 * Known parameter labels and units for educational simulations in GEN LABS.
 * Maps raw simulation state variables to human-readable scientific/curriculum notation.
 */
const PARAM_DEFINITIONS: Record<string, { label: string; unit?: string }> = {
  // Physics / Mechanics
  force: { label: 'Gaya (F)', unit: 'N' },
  mass: { label: 'Massa (m)', unit: 'kg' },
  friction: { label: 'Gesekan (μ)', unit: '' },
  acceleration: { label: 'Percepatan (a)', unit: 'm/s²' },
  velocity: { label: 'Kecepatan (v)', unit: 'm/s' },
  initial_velocity: { label: 'Kecepatan Awal (v₀)', unit: 'm/s' },
  angle: { label: 'Sudut (θ)', unit: '°' },
  gravity: { label: 'Gravitasi (g)', unit: 'm/s²' },
  displacement: { label: 'Jarak (s)', unit: 'm' },
  height: { label: 'Ketinggian (h)', unit: 'm' },
  time: { label: 'Waktu (t)', unit: 's' },
  momentum: { label: 'Momentum (p)', unit: 'kg·m/s' },
  elasticity: { label: 'Elastisitas (e)', unit: '' },

  // Chemistry
  pH: { label: 'Derajat pH', unit: '' },
  ph: { label: 'Derajat pH', unit: '' },
  concentration: { label: 'Konsentrasi', unit: 'M' },
  volume: { label: 'Volume (V)', unit: 'L' },
  temperature: { label: 'Suhu (T)', unit: '°C' },

  // Math & Statistics
  a: { label: 'Koefisien a', unit: '' },
  b: { label: 'Koefisien b', unit: '' },
  c: { label: 'Konstanta c', unit: '' },
  x: { label: 'Variabel x', unit: '' },
  y: { label: 'Variabel y', unit: '' },
  mean: { label: 'Rata-rata (μ)', unit: '' },
  stdDev: { label: 'Deviasi Standar (σ)', unit: '' },
  probability: { label: 'Peluang (P)', unit: '' },
  trials: { label: 'Percobaan (n)', unit: 'kali' },

  // Computer Science / Algorithms
  arraySize: { label: 'Jumlah Elemen', unit: 'data' },
  speed: { label: 'Kecepatan Animasi', unit: 'x' },
  algorithm: { label: 'Algoritma', unit: '' },
  target: { label: 'Nilai Target', unit: '' },
  steps: { label: 'Langkah Operasi', unit: '' },
  comparisons: { label: 'Perbandingan', unit: 'kali' },

  // Economics & Kejuruan
  price: { label: 'Harga (P)', unit: 'Rp' },
  quantity: { label: 'Kuantitas (Q)', unit: 'unit' },
  principal: { label: 'Modal Pokok', unit: 'Rp' },
  rate: { label: 'Suku Bunga', unit: '%' },
  periods: { label: 'Periode (t)', unit: 'thn' },
  tax: { label: 'Tarif Pajak', unit: '%' },
  kas: { label: 'Kas', unit: 'Rp' },
  modalAwal: { label: 'Modal Awal', unit: 'Rp' },
  targetValue: { label: 'Nilai Target', unit: '' },
  slope: { label: 'Kemiringan (m)', unit: '' },
  intercept: { label: 'Intersep (c)', unit: '' },
  rSquared: { label: 'Koefisien Determinasi (R²)', unit: '' },
  harvestYieldKg: { label: 'Hasil Panen', unit: 'kg' },
  seedCostJuta: { label: 'Biaya Benih', unit: 'Juta Rp' },
  fertilizerCostJuta: { label: 'Biaya Pupuk', unit: 'Juta Rp' },
  laborCostJuta: { label: 'Biaya Tenaga Kerja', unit: 'Juta Rp' },
  irrigationCostJuta: { label: 'Biaya Irigasi', unit: 'Juta Rp' },
  transportCostJuta: { label: 'Biaya Logistik', unit: 'Juta Rp' },
};

/**
 * Set of structural and metadata keys that should never be presented as physical parameters.
 */
const EXCLUDED_METADATA_KEYS = new Set([
  'id',
  'user_id',
  'userId',
  'module_id',
  'moduleId',
  'simulation_id',
  'simulationId',
  'slug',
  'templateSlug',
  'title',
  'discipline',
  'progress',
  'started_at',
  'startedAt',
  'last_active_at',
  'lastActiveAt',
  'completed_at',
  'completedAt',
  'module',
  'simulation',
  'history',
  'chatMessages',
  'chat_messages',
  'changes',
  'parameters',
  'computed',
  'status',
  'version',
  'success',
  'database',
  'createdAt',
  'updatedAt',
  'engine',
  'domain',
  'state',
  'currentState',
  'current_state',
]);

/**
 * Safely extracts flat scalar parameter pairs from nested or flat session state.
 * Handles:
 * - `{ currentState: { parameters: { force: 25, mass: 5 }, computed: { acceleration: 5 } } }`
 * - `{ current_state: { force: 25, mass: 5 } }`
 * - `{ parameters: { force: 25, mass: 5 }, computed: { acceleration: 5 } }`
 * - Raw JSON string representations
 * - Structured parameter values like `{ value: 25, unit: 'N' }`
 * - Arbitrary scientific and vocational parameters without hardcoded measurements
 * - Strictly excludes non-primitive objects, arrays, and internal metadata.
 */
export function extractSafeSessionParameters(
  state: unknown
): FormattedParamItem[] {
  if (state === null || state === undefined) {
    return [];
  }

  // 1. Unwrap stringified JSON if provided
  let current: unknown = state;
  if (typeof current === 'string') {
    const trimmed = current.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        current = JSON.parse(trimmed);
      } catch {
        return [];
      }
    } else {
      return [];
    }
  }

  if (!current || typeof current !== 'object' || Array.isArray(current)) {
    return [];
  }

  // 2. Recursively unwrap known outer wrapper properties
  let unwrapped = current as Record<string, unknown>;
  let depth = 0;
  while (depth < 4) {
    if (unwrapped.currentState && typeof unwrapped.currentState === 'object' && !Array.isArray(unwrapped.currentState)) {
      unwrapped = unwrapped.currentState as Record<string, unknown>;
    } else if (unwrapped.current_state && typeof unwrapped.current_state === 'object' && !Array.isArray(unwrapped.current_state)) {
      unwrapped = unwrapped.current_state as Record<string, unknown>;
    } else if (unwrapped.session && typeof unwrapped.session === 'object' && !Array.isArray(unwrapped.session)) {
      unwrapped = unwrapped.session as Record<string, unknown>;
    } else if (unwrapped.state && typeof unwrapped.state === 'object' && !Array.isArray(unwrapped.state)) {
      unwrapped = unwrapped.state as Record<string, unknown>;
    } else {
      break;
    }
    depth++;
  }

  // 3. Resolve target dictionary
  let targetDict: Record<string, unknown> = {};
  if (unwrapped.parameters && typeof unwrapped.parameters === 'object' && !Array.isArray(unwrapped.parameters)) {
    targetDict = { ...(unwrapped.parameters as Record<string, unknown>) };
    if (unwrapped.computed && typeof unwrapped.computed === 'object' && !Array.isArray(unwrapped.computed)) {
      targetDict = { ...targetDict, ...(unwrapped.computed as Record<string, unknown>) };
    }
  } else {
    targetDict = { ...unwrapped };
  }

  const items: FormattedParamItem[] = [];

  for (const [key, rawVal] of Object.entries(targetDict)) {
    if (EXCLUDED_METADATA_KEYS.has(key)) {
      continue;
    }

    if (
      rawVal === null ||
      rawVal === undefined ||
      typeof rawVal === 'function' ||
      typeof rawVal === 'symbol'
    ) {
      continue;
    }

    // Resolve scalar value and optional explicit unit
    let scalarVal: unknown = rawVal;
    let explicitUnit: string | undefined = undefined;

    // Handle structured parameter objects, e.g. { value: 10, unit: 'N' } or { val: 10 }
    if (typeof rawVal === 'object' && !Array.isArray(rawVal)) {
      const obj = rawVal as Record<string, unknown>;
      if ('value' in obj && (typeof obj.value === 'number' || typeof obj.value === 'string' || typeof obj.value === 'boolean')) {
        scalarVal = obj.value;
        if (typeof obj.unit === 'string') explicitUnit = obj.unit;
      } else if ('val' in obj && (typeof obj.val === 'number' || typeof obj.val === 'string' || typeof obj.val === 'boolean')) {
        scalarVal = obj.val;
        if (typeof obj.unit === 'string') explicitUnit = obj.unit;
      } else if ('amount' in obj && (typeof obj.amount === 'number' || typeof obj.amount === 'string')) {
        scalarVal = obj.amount;
        if (typeof obj.unit === 'string') explicitUnit = obj.unit;
      } else {
        // Skip complex non-scalar objects safely
        continue;
      }
    } else if (Array.isArray(rawVal)) {
      // Skip array containers (vectors/matrices are handled by specialized apparatus renderers)
      continue;
    }

    const def = PARAM_DEFINITIONS[key] || {
      label: key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, (str) => str.toUpperCase())
        .trim(),
      unit: undefined,
    };

    const unit = explicitUnit || def.unit;
    let formattedValue: string;

    if (typeof scalarVal === 'number') {
      formattedValue = formatNumber(scalarVal, unit);
    } else if (typeof scalarVal === 'boolean') {
      formattedValue = scalarVal ? 'Aktif' : 'Nonaktif';
    } else if (typeof scalarVal === 'string') {
      const trimmed = scalarVal.trim();
      const numCandidate = Number(trimmed);
      if (!isNaN(numCandidate) && trimmed !== '') {
        formattedValue = formatNumber(numCandidate, unit);
      } else {
        formattedValue = unit ? `${trimmed}\u00A0${unit}` : trimmed;
      }
    } else {
      continue;
    }

    // Strict guard: ensure no [object Object] can ever leak
    if (formattedValue.includes('[object') || def.label.includes('[object')) {
      continue;
    }

    items.push({
      key,
      label: def.label,
      value: formattedValue,
      unit,
    });

    if (items.length >= 4) {
      break;
    }
  }

  return items;
}

/**
 * Formats session parameters into clean Indonesian telemetry readout.
 * If parameters exist: "Gaya (F) = 25 N  /  Massa (m) = 5 kg"
 * If no parameters exist: returns fallback text in natural Bahasa Indonesia.
 */
export function formatSessionTelemetry(
  state: unknown,
  fallbackText: string = 'Sesi tersimpan • Parameter awal siap diuji'
): string {
  const items = extractSafeSessionParameters(state);
  if (items.length === 0) {
    return fallbackText;
  }

  return items
    .map((item) => `${item.label} = ${item.value}`)
    .join('  /  ');
}

