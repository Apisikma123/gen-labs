import type { SimulationSpecification, SimulationEngine } from '@genlab/simulation-types';

const ALLOWED_ENGINES: readonly SimulationEngine[] = [
  'physics',
  'mathematics',
  'computer-science',
  'statistics',
  'economics',
  'chemistry',
  'biology',
];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  specification?: SimulationSpecification;
}

export function validateSimulationSpecification(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Specification must be a JSON object.'] };
  }

  const spec = data as Partial<SimulationSpecification>;

  // 1. Engine check
  if (!spec.engine || !ALLOWED_ENGINES.includes(spec.engine as SimulationEngine)) {
    errors.push(
      `Engine "${spec.engine}" is unsupported. Allowed engines: ${ALLOWED_ENGINES.join(', ')}.`
    );
  }

  // 2. Simulation identifier check
  if (!spec.simulation || typeof spec.simulation !== 'string' || spec.simulation.trim().length === 0) {
    errors.push('Specification must contain a non-empty "simulation" string identifier.');
  }

  // 3. Title & description
  if (!spec.title || typeof spec.title !== 'string') {
    errors.push('Specification must contain a string "title".');
  }
  if (!spec.description || typeof spec.description !== 'string') {
    errors.push('Specification must contain a string "description".');
  }

  // 4. Version check
  if (typeof spec.version !== 'number' || spec.version < 1) {
    errors.push('"version" must be a positive integer.');
  }

  // 5. Parameters check
  if (!spec.parameters || typeof spec.parameters !== 'object') {
    errors.push('"parameters" must be an object defining numeric variables.');
  } else {
    for (const [key, param] of Object.entries(spec.parameters)) {
      if (!param || typeof param !== 'object') {
        errors.push(`Parameter "${key}" definition must be an object.`);
        continue;
      }
      if (typeof param.value !== 'number' || isNaN(param.value)) {
        errors.push(`Parameter "${key}.value" must be a valid number.`);
      }
      if (typeof param.min !== 'number' || isNaN(param.min)) {
        errors.push(`Parameter "${key}.min" must be a valid number.`);
      }
      if (typeof param.max !== 'number' || isNaN(param.max)) {
        errors.push(`Parameter "${key}.max" must be a valid number.`);
      }
      if (typeof param.min === 'number' && typeof param.max === 'number' && param.min >= param.max) {
        errors.push(`Parameter "${key}.min" must be strictly less than "max".`);
      }
    }
  }

  // 6. Controls list check
  if (!Array.isArray(spec.controls) || spec.controls.length === 0) {
    errors.push('"controls" must be a non-empty array of parameter keys.');
  } else if (spec.parameters) {
    for (const ctrl of spec.controls) {
      if (!(ctrl in spec.parameters)) {
        errors.push(`Control "${ctrl}" does not exist in "parameters" map.`);
      }
    }
  }

  // 7. Security check: no executable code or script injection
  const serialized = JSON.stringify(data);
  if (/<script|javascript:|function\s*\(|eval\(|=>|__proto__|constructor/i.test(serialized)) {
    errors.push('Security rejection: executable code or dangerous symbols detected in specification.');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    specification: spec as SimulationSpecification,
  };
}
