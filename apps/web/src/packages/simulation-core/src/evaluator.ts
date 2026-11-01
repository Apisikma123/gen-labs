import type { ExperimentTargetCondition, ExperimentEvaluation } from '@genlab/simulation-types';

export function evaluateTargetCondition(
  condition: ExperimentTargetCondition | string | undefined,
  computed: Record<string, number | string>,
  activeParameters?: Record<string, number>,
  startParameters?: Record<string, number>,
  allowedParameters?: string[]
): ExperimentEvaluation {
  if (!condition) {
    return {
      success: true,
      currentValue: 0,
      targetValue: 0,
      message: 'No validation constraints specified for this trial.',
    };
  }

  // If string condition, parse basic expression or return default
  if (typeof condition === 'string') {
    return {
      success: true,
      currentValue: 0,
      targetValue: 0,
      message: `Evaluation target: ${condition}`,
    };
  }

  const { output, operator, value, value2, tolerance = 0.05 } = condition;
  const rawValue = computed[output];

  if (rawValue === undefined || rawValue === null) {
    return {
      success: false,
      currentValue: 0,
      targetValue: value,
      message: `Telemetry output signal "${output}" not found in current compute state.`,
    };
  }

  const numericCurrent = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue));
  if (isNaN(numericCurrent)) {
    return {
      success: false,
      currentValue: 0,
      targetValue: value,
      message: `Telemetry output signal "${output}" is not a numeric quantity.`,
    };
  }

  // Check if student modified disallowed parameters
  if (allowedParameters && allowedParameters.length > 0 && activeParameters && startParameters) {
    const disallowedChanges: string[] = [];
    for (const [param, val] of Object.entries(activeParameters)) {
      if (startParameters[param] !== undefined && startParameters[param] !== val) {
        if (!allowedParameters.includes(param)) {
          disallowedChanges.push(param);
        }
      }
    }
    if (disallowedChanges.length > 0) {
      return {
        success: false,
        currentValue: numericCurrent,
        targetValue: value,
        message: `Constraint violation: You changed [${disallowedChanges.join(', ')}], which must be held constant for this trial.`,
      };
    }
  }

  let success = false;
  let message = '';

  switch (operator) {
    case '==': {
      const diff = Math.abs(numericCurrent - value);
      success = diff <= tolerance;
      if (success) {
        message = `Target achieved: ${output} is ${numericCurrent.toFixed(2)} (target: ${value.toFixed(2)} ± ${tolerance}).`;
      } else {
        const dir = numericCurrent < value ? 'increase' : 'decrease';
        message = `Current ${output} is ${numericCurrent.toFixed(2)}. Target is ${value.toFixed(2)} (${dir} needed).`;
      }
      break;
    }
    case '>=': {
      success = numericCurrent >= value - tolerance;
      message = success
        ? `Target achieved: ${output} is ${numericCurrent.toFixed(2)} >= ${value.toFixed(2)}.`
        : `Current ${output} is ${numericCurrent.toFixed(2)}. Target threshold is >= ${value.toFixed(2)}.`;
      break;
    }
    case '<=': {
      success = numericCurrent <= value + tolerance;
      message = success
        ? `Target achieved: ${output} is ${numericCurrent.toFixed(2)} <= ${value.toFixed(2)}.`
        : `Current ${output} is ${numericCurrent.toFixed(2)}. Target threshold is <= ${value.toFixed(2)}.`;
      break;
    }
    case '>': {
      success = numericCurrent > value;
      message = success
        ? `Target achieved: ${output} (${numericCurrent.toFixed(2)}) is greater than ${value.toFixed(2)}.`
        : `Current ${output} (${numericCurrent.toFixed(2)}) must exceed ${value.toFixed(2)}.`;
      break;
    }
    case '<': {
      success = numericCurrent < value;
      message = success
        ? `Target achieved: ${output} (${numericCurrent.toFixed(2)}) is less than ${value.toFixed(2)}.`
        : `Current ${output} (${numericCurrent.toFixed(2)}) must be below ${value.toFixed(2)}.`;
      break;
    }
    case '!=': {
      success = Math.abs(numericCurrent - value) > tolerance;
      message = success
        ? `Target achieved: ${output} changed from baseline ${value.toFixed(2)}.`
        : `Current ${output} (${numericCurrent.toFixed(2)}) is still at baseline value.`;
      break;
    }
    case 'between': {
      const lower = Math.min(value, value2 ?? value);
      const upper = Math.max(value, value2 ?? value);
      success = numericCurrent >= lower - tolerance && numericCurrent <= upper + tolerance;
      message = success
        ? `Target achieved: ${output} (${numericCurrent.toFixed(2)}) is bounded within [${lower}, ${upper}].`
        : `Current ${output} (${numericCurrent.toFixed(2)}) is outside the range [${lower}, ${upper}].`;
      break;
    }
    default:
      success = false;
      message = `Unsupported evaluation operator: ${operator}`;
  }

  return {
    success,
    currentValue: numericCurrent,
    targetValue: value,
    message,
    toleranceMet: success,
  };
}
