import { formatNumber } from '../utils/formatters';

export type ExperimentOperator = '==' | '>=' | '<=' | '>' | '<' | '!=' | 'between';

export interface ExperimentTarget {
  parameter: string;
  targetValue: number;
  targetValue2?: number;
  operator?: ExperimentOperator;
  tolerance?: number;
  unit?: string;
}

export interface ExperimentRules {
  heldConstant?: string[];
  expectedValue?: Record<string, number>;
}

export interface UniversalExperimentChallenge {
  id?: string | number;
  title: string;
  objective?: string;
  description?: string;
  target?: ExperimentTarget;
  targetCondition?: {
    output?: string;
    parameter?: string;
    operator?: ExperimentOperator;
    value?: number;
    targetValue?: number;
    value2?: number;
    targetValue2?: number;
    tolerance?: number;
    unit?: string;
  };
  rules?: ExperimentRules;
  allowedParameters?: string[];
  initialParameters?: Record<string, number>;
  hint?: string;
  hints?: string[];
  successMessage?: string;
}

export interface ExperimentEvaluationResult {
  actualValue: number;
  targetValue: number;
  targetValue2?: number;
  operator: ExperimentOperator;
  delta: number;
  tolerance: number;
  unit: string;
  isAchieved: boolean;
  isClose: boolean;
  progressPercent: number;
  statusLabel: 'Tercapai' | 'Mendekati' | 'Belum Tercapai';
  message: string;
  ruleViolated: boolean;
  ruleViolationMessage?: string;
}

/**
 * Resolves the actual numeric value from simulation state or computed properties.
 * Returns NaN if metric is not present or non-numeric (never falsely returns 0).
 */
export function resolveActualValue(
  targetParam: string | undefined,
  params: Record<string, number> = {},
  computed: Record<string, unknown> = {}
): number {
  if (!targetParam || typeof targetParam !== 'string') {
    return NaN;
  }

  const normKey = targetParam.trim().toLowerCase();

  // 1. Direct computed check
  if (computed[targetParam] !== undefined && typeof computed[targetParam] === 'number' && !isNaN(computed[targetParam] as number)) {
    return computed[targetParam] as number;
  }

  // 2. Direct params check
  if (params[targetParam] !== undefined && typeof params[targetParam] === 'number' && !isNaN(params[targetParam])) {
    return params[targetParam];
  }

  // 3. Computed normalized check
  for (const [k, v] of Object.entries(computed)) {
    if (k.toLowerCase() === normKey && typeof v === 'number' && !isNaN(v)) {
      return v;
    }
  }

  // 4. Aliases for common physical and mathematical outputs across modules
  const aliases: Record<string, string[]> = {
    acceleration: ['acc', 'a_net', 'percepatan', 'a'],
    vertexx: ['vx', 'vertex_x', 'xpuncak', 'x_puncak', 'absis'],
    vertexy: ['vy', 'vertex_y', 'ypuncak', 'y_puncak', 'ordinat'],
    range: ['maxrange', 'r_max', 'jangkauan', 'distance', 'r'],
    maxheight: ['hmax', 'h_max', 'tinggimaks', 'tinggi_maks', 'h'],
    equilibriumprice: ['pe', 'price', 'eqprice', 'harga', 'hargapasar'],
    equilibriumquantity: ['qe', 'quantity', 'eqquantity', 'jumlah'],
    arraysize: ['n', 'size', 'elements', 'datasize'],
    resultantmag: ['magr', 'resultant', 'mag_r', 'magnitude', 'r'],
    dotproduct: ['dot', 'perkaliantitik'],
    ph: ['phvalue', 'skalaph'],
    finalamount: ['totalamount', 'saldoakhir', 'futurevalue'],
    v1final: ['v1_final', 'v1final_display', 'v1prime'],
    v2final: ['v2_final', 'v2final_display', 'v2prime'],
    ptotal: ['p_total', 'momentumtotal', 'ptotal_display'],
  };

  const candidateKeys = aliases[normKey] || [];
  for (const alt of candidateKeys) {
    if (computed[alt] !== undefined && typeof computed[alt] === 'number' && !isNaN(computed[alt] as number)) {
      return computed[alt] as number;
    }
    if (params[alt] !== undefined && typeof params[alt] === 'number' && !isNaN(params[alt])) {
      return params[alt];
    }
  }

  // 5. Fallback if computed value is numeric string
  if (computed[targetParam] !== undefined) {
    const parsed = parseFloat(String(computed[targetParam]));
    if (!isNaN(parsed) && isFinite(parsed)) return parsed;
  }

  for (const alt of candidateKeys) {
    if (computed[alt] !== undefined) {
      const parsed = parseFloat(String(computed[alt]));
      if (!isNaN(parsed) && isFinite(parsed)) return parsed;
    }
  }

  return NaN;
}

/**
 * Universal Experiment Evaluation Engine
 * Performs rigorous evaluation of student parameter state against target criteria,
 * operators (==, >=, <=, >, <, !=, between), and parameter constraints.
 */
export function evaluateExperiment(
  experiment: UniversalExperimentChallenge | null | undefined,
  params: Record<string, number> = {},
  computed: Record<string, unknown> = {},
  baselineParams?: Record<string, number>
): ExperimentEvaluationResult | null {
  if (!experiment) {
    return null;
  }

  // Extract target criteria from either targetCondition or target
  const cond = experiment.targetCondition;
  const tgt = experiment.target;

  if (!cond && !tgt) {
    return null;
  }

  const parameter = cond?.output || cond?.parameter || tgt?.parameter || '';
  if (!parameter) {
    return null;
  }

  const operator: ExperimentOperator = cond?.operator || tgt?.operator || '==';
  const targetValue = cond?.value ?? cond?.targetValue ?? tgt?.targetValue ?? 0;
  const targetValue2 = cond?.value2 ?? cond?.targetValue2 ?? tgt?.targetValue2;
  const tolerance = cond?.tolerance ?? tgt?.tolerance ?? 0.05;
  const unit = cond?.unit || tgt?.unit || '';

  const actualValue = resolveActualValue(parameter, params, computed);

  // If signal is missing, uncomputed, or NaN -> strictly fail
  if (isNaN(actualValue) || !isFinite(actualValue)) {
    return {
      actualValue: 0,
      targetValue,
      targetValue2,
      operator,
      delta: Math.abs(targetValue),
      tolerance,
      unit,
      isAchieved: false,
      isClose: false,
      progressPercent: 0,
      statusLabel: 'Belum Tercapai',
      message: `Parameter "${parameter}" belum terhitung atau belum tersedia dalam simulasi.`,
      ruleViolated: true,
      ruleViolationMessage: `Sinyal output "${parameter}" tidak ditemukan dalam status komputasi.`,
    };
  }

  // Check parameter modification constraints (allowedParameters)
  let ruleViolated = false;
  let ruleViolationMessage: string | undefined;

  const effectiveBaseline = experiment.initialParameters || baselineParams;
  if (experiment.allowedParameters && experiment.allowedParameters.length > 0 && effectiveBaseline) {
    const disallowedChanges: string[] = [];
    for (const [key, val] of Object.entries(params)) {
      const baseVal = effectiveBaseline[key];
      if (baseVal !== undefined && Math.abs(val - baseVal) > 0.001) {
        if (!experiment.allowedParameters.includes(key)) {
          disallowedChanges.push(key);
        }
      }
    }
    if (disallowedChanges.length > 0) {
      ruleViolated = true;
      ruleViolationMessage = `Syarat eksperimen dilanggar: Variabel [${disallowedChanges.join(', ')}] harus dipertahankan tetap untuk percobaan ini.`;
    }
  }

  // Check constant holding rules (heldConstant)
  if (!ruleViolated && experiment.rules?.heldConstant) {
    const expectedValues = experiment.rules.expectedValue || {};
    for (const heldKey of experiment.rules.heldConstant) {
      const expected = expectedValues[heldKey] ?? (effectiveBaseline ? effectiveBaseline[heldKey] : undefined);
      const actualHeld = params[heldKey];
      if (expected !== undefined && actualHeld !== undefined && Math.abs(actualHeld - expected) > 0.001) {
        ruleViolated = true;
        ruleViolationMessage = `Variabel '${heldKey}' harus dipertahankan di ${expected} sesuai instruksi eksperimen.`;
        break;
      }
    }
  }

  // Operator evaluation
  let conditionMet = false;
  let delta = Math.abs(actualValue - targetValue);

  switch (operator) {
    case '==':
      delta = Math.abs(actualValue - targetValue);
      conditionMet = delta <= tolerance;
      break;

    case '>=':
      conditionMet = actualValue >= targetValue - tolerance;
      delta = actualValue < targetValue ? targetValue - actualValue : 0;
      break;

    case '<=':
      conditionMet = actualValue <= targetValue + tolerance;
      delta = actualValue > targetValue ? actualValue - targetValue : 0;
      break;

    case '>':
      conditionMet = actualValue > targetValue + 0.0001;
      delta = actualValue <= targetValue ? targetValue - actualValue + 0.0001 : 0;
      break;

    case '<':
      conditionMet = actualValue < targetValue - 0.0001;
      delta = actualValue >= targetValue ? actualValue - targetValue + 0.0001 : 0;
      break;

    case '!=':
      delta = Math.abs(actualValue - targetValue);
      conditionMet = delta > tolerance;
      break;

    case 'between': {
      const lower = Math.min(targetValue, targetValue2 ?? targetValue);
      const upper = Math.max(targetValue, targetValue2 ?? targetValue);
      conditionMet = actualValue >= lower - tolerance && actualValue <= upper + tolerance;
      if (actualValue < lower) {
        delta = lower - actualValue;
      } else if (actualValue > upper) {
        delta = actualValue - upper;
      } else {
        delta = 0;
      }
      break;
    }

    default:
      conditionMet = false;
      break;
  }

  const isAchieved = conditionMet && !ruleViolated;
  const isClose = !isAchieved && !ruleViolated && delta <= Math.max(tolerance * 3, 0.5);

  // Compute progress percentage
  let progressPercent = 0;
  if (isAchieved) {
    progressPercent = 100;
  } else if (targetValue !== 0) {
    const errorRatio = delta / Math.max(Math.abs(targetValue), 1);
    progressPercent = Math.max(0, Math.min(95, Math.round((1 - errorRatio) * 100)));
  } else {
    progressPercent = delta <= 1 ? 80 : 20;
  }

  // Status label
  let statusLabel: 'Tercapai' | 'Mendekati' | 'Belum Tercapai' = 'Belum Tercapai';
  if (isAchieved) {
    statusLabel = 'Tercapai';
  } else if (isClose) {
    statusLabel = 'Mendekati';
  }

  // Pedagogical feedback messages
  let message = '';
  if (isAchieved) {
    message = experiment.successMessage ||
      `Target berhasil dicapai! Parameter ${parameter} bernilai ${formatNumber(actualValue, unit)} (target: ${formatNumber(targetValue, unit)}).`;
  } else if (ruleViolated) {
    message = ruleViolationMessage || 'Aturan eksperimen belum terpenuhi.';
  } else if (isClose) {
    message = `Hampir tercapai! Nilai saat ini: ${formatNumber(actualValue, unit)}, selisih ${formatNumber(delta, unit)} dari target (${formatNumber(targetValue, unit)}).`;
  } else {
    // Helpful guidance without giving away the final formula
    if (operator === '>=') {
      message = `Nilai saat ini (${formatNumber(actualValue, unit)}) masih di bawah target minimal (>= ${formatNumber(targetValue, unit)}). Coba sesuaikan variabel kontrol.`;
    } else if (operator === '<=') {
      message = `Nilai saat ini (${formatNumber(actualValue, unit)}) melebihi batas maksimal (<= ${formatNumber(targetValue, unit)}). Coba turunkan variabel kontrol.`;
    } else if (operator === 'between') {
      const lower = Math.min(targetValue, targetValue2 ?? targetValue);
      const upper = Math.max(targetValue, targetValue2 ?? targetValue);
      message = `Nilai saat ini (${formatNumber(actualValue, unit)}) berada di luar rentang target [${lower}, ${upper}] ${unit}. Coba lagi.`;
    } else {
      const dir = actualValue < targetValue ? 'menaikkan' : 'menurunkan';
      message = `Belum tepat. Coba ubah variabel kontrol (perlu ${dir} nilai) dan amati perubahannya. Target: ${formatNumber(targetValue, unit)}.`;
    }
  }

  return {
    actualValue,
    targetValue,
    targetValue2,
    operator,
    delta,
    tolerance,
    unit,
    isAchieved,
    isClose,
    progressPercent,
    statusLabel,
    message,
    ruleViolated,
    ruleViolationMessage,
  };
}
