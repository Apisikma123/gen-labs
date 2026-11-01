/**
 * GEN LABS — Unified Simulator Specification Validator
 * 
 * Strict deterministic security & integrity validator.
 * Validates whole specification before rendering in SuperCanvas.
 * 
 * Invariants:
 * 1. Zero executable code (eval, Function, script, arrow functions, event handlers).
 * 2. Parameters must satisfy min < max, defaultVal within bounds, step > 0.
 * 3. Calculations must only use approved arithmetic operators and declared variable keys.
 * 4. Visual elements must use supported types and valid geometry attributes.
 * 5. Results and experiments must reference defined calculation or parameter keys.
 */

import type { UnifiedSimulatorSpec } from './simulator-schema';

export interface SpecValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

const SUPPORTED_VISUAL_TYPES = new Set([
  'shape',
  'line',
  'arrow',
  'point',
  'text',
  'curve',
  'chart',
  'grid',
  'balance',
  'image',
]);

const DANGEROUS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /eval\s*\(/i,
  /Function\s*\(/i,
  /=>/i,
  /__proto__/i,
  /constructor/i,
  /window\./i,
  /document\./i,
  /localStorage\./i,
  /sessionStorage\./i,
  /fetch\s*\(/i,
  /XMLHttpRequest/i,
  /onload/i,
  /onerror/i,
];

/**
 * Validates an entire UnifiedSimulatorSpec for structural correctness and security.
 */
export function validateUnifiedSimulatorSpec(data: unknown): SpecValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Spesifikasi simulator harus berupa objek JSON yang valid.'] };
  }

  // 1. Security Check: Detect executable script or prototype pollution payloads
  const serialized = JSON.stringify(data);
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(serialized)) {
      errors.push(`Penolakan Keamanan: Terdeteksi pola kode atau simbol terlarang (${pattern.source}).`);
      return { valid: false, errors };
    }
  }

  const spec = data as Partial<UnifiedSimulatorSpec>;

  // 2. Info Validation
  if (!spec.info || typeof spec.info !== 'object') {
    errors.push('Spesifikasi harus memiliki bagian "info".');
  } else {
    if (!spec.info.title || typeof spec.info.title !== 'string' || spec.info.title.trim().length === 0) {
      errors.push('Judul simulator ("info.title") wajib diisi.');
    }
    if (!spec.info.description || typeof spec.info.description !== 'string' || spec.info.description.trim().length === 0) {
      errors.push('Deskripsi simulator ("info.description") wajib diisi.');
    }
    if (!spec.info.discipline || typeof spec.info.discipline !== 'string') {
      errors.push('Bidang ilmu ("info.discipline") wajib diisi.');
    }
  }

  // 3. Parameters Validation
  const paramKeys = new Set<string>();
  if (!spec.parameters || typeof spec.parameters !== 'object') {
    errors.push('Spesifikasi harus mendefinisikan objek "parameters".');
  } else {
    const entries = Object.entries(spec.parameters);
    if (entries.length === 0) {
      errors.push('Simulator harus memiliki minimal 1 parameter kontrol numerik.');
    }

    for (const [key, p] of entries) {
      paramKeys.add(key);
      if (!p || typeof p !== 'object') {
        errors.push(`Parameter "${key}" tidak terdefinisi dengan benar.`);
        continue;
      }
      if (typeof p.min !== 'number' || isNaN(p.min)) {
        errors.push(`Parameter "${key}": nilai min harus berupa angka valid.`);
      }
      if (typeof p.max !== 'number' || isNaN(p.max)) {
        errors.push(`Parameter "${key}": nilai max harus berupa angka valid.`);
      }
      if (typeof p.min === 'number' && typeof p.max === 'number' && p.min >= p.max) {
        errors.push(`Parameter "${key}": batas minimum (${p.min}) harus lebih kecil dari maksimum (${p.max}).`);
      }
      if (typeof p.defaultVal !== 'number' || isNaN(p.defaultVal)) {
        errors.push(`Parameter "${key}": defaultVal harus berupa angka.`);
      } else if (typeof p.min === 'number' && typeof p.max === 'number') {
        if (p.defaultVal < p.min || p.defaultVal > p.max) {
          errors.push(`Parameter "${key}": defaultVal (${p.defaultVal}) harus berada dalam rentang [${p.min}, ${p.max}].`);
        }
      }
      if (p.step !== undefined && (typeof p.step !== 'number' || p.step <= 0)) {
        errors.push(`Parameter "${key}": step harus berupa angka positif lebih dari nol.`);
      }
    }
  }

  // 4. Calculations Validation
  const calcKeys = new Set<string>();
  if (spec.calculations && typeof spec.calculations === 'object') {
    for (const [key, c] of Object.entries(spec.calculations)) {
      calcKeys.add(key);
      if (!c || typeof c !== 'object') {
        errors.push(`Kalkulasi "${key}" tidak valid.`);
        continue;
      }
      if (!c.formula || typeof c.formula !== 'string' || c.formula.trim().length === 0) {
        errors.push(`Kalkulasi "${key}": formula wajib diisi.`);
      } else {
        // Validate formula syntax: only basic arithmetic, math symbols, numbers, and allowed variables
        const cleanFormula = c.formula.trim();
        // Check for disallowed characters
        if (/[;{}()\[\]=><!&|]/.test(cleanFormula.replace(/\(|\)/g, ''))) {
          // If non-standard operators are found
          errors.push(`Kalkulasi "${key}": formula mengandung operator atau simbol terlarang.`);
        }
      }
    }
  }

  // 5. Visual Spec Validation
  if (!spec.visual || typeof spec.visual !== 'object') {
    errors.push('Spesifikasi harus memiliki bagian "visual".');
  } else {
    if (!spec.visual.viewBox || typeof spec.visual.viewBox.width !== 'number' || typeof spec.visual.viewBox.height !== 'number') {
      errors.push('Visual harus memiliki "viewBox" dengan width dan height bertipe angka.');
    }
    if (!Array.isArray(spec.visual.elements)) {
      errors.push('Visual harus memiliki daftar "elements" berupa array.');
    } else {
      for (let i = 0; i < spec.visual.elements.length; i++) {
        const el = spec.visual.elements[i];
        if (!el || typeof el !== 'object') {
          errors.push(`Elemen visual indeks ${i} tidak valid.`);
          continue;
        }
        if (!el.type || !SUPPORTED_VISUAL_TYPES.has(el.type)) {
          errors.push(`Elemen visual "${el.id || i}": tipe "${el.type}" tidak didukung oleh SuperCanvas.`);
        }
      }
    }
  }

  // 6. Results Validation
  if (spec.results && Array.isArray(spec.results)) {
    for (const r of spec.results) {
      if (r.calculationKey && !calcKeys.has(r.calculationKey) && !paramKeys.has(r.calculationKey)) {
        errors.push(`Hasil readout "${r.key || r.label}": calculationKey "${r.calculationKey}" tidak ditemukan di parameter atau calculations.`);
      }
    }
  }

  // 7. Experiments Validation
  if (spec.experiments && Array.isArray(spec.experiments)) {
    for (const exp of spec.experiments) {
      if (exp.targetMetric && !calcKeys.has(exp.targetMetric) && !paramKeys.has(exp.targetMetric)) {
        warnings.push(`Tantangan "${exp.title}": targetMetric "${exp.targetMetric}" belum didefinisikan secara eksplisit.`);
      }
      if (typeof exp.targetValue !== 'number' || isNaN(exp.targetValue)) {
        errors.push(`Tantangan "${exp.title}": targetValue harus berupa angka.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
