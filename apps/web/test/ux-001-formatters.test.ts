import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractSafeSessionParameters,
  formatSessionTelemetry,
  formatNumber,
} from '../src/lib/utils/formatters.js';

test('UX-001: formatNumber formats scientific numbers with Indonesian locale', () => {
  assert.equal(formatNumber(10, 'N'), '10\u00A0N');
  assert.equal(formatNumber(10.5, 'kg'), '10,5\u00A0kg');
  assert.equal(formatNumber(8.0, 'm/s²'), '8\u00A0m/s²');
  assert.equal(formatNumber(null), '-');
  assert.equal(formatNumber(undefined), '-');
});

test('UX-001: extractSafeSessionParameters extracts nested parameters and computed safely', () => {
  const sessionState = {
    parameters: {
      force: 40,
      mass: 5,
    },
    computed: {
      acceleration: 8,
    },
    changes: ['initial_load'],
  };

  const params = extractSafeSessionParameters(sessionState);
  assert.equal(params.length, 3);
  assert.equal(params[0].label, 'Gaya (F)');
  assert.equal(params[0].value, '40\u00A0N');
  assert.equal(params[1].label, 'Massa (m)');
  assert.equal(params[1].value, '5\u00A0kg');
  assert.equal(params[2].label, 'Percepatan (a)');
  assert.equal(params[2].value, '8\u00A0m/s²');
});

test('UX-001: extractSafeSessionParameters handles flat parameters without crashing or leaking objects', () => {
  const flatState = {
    force: 60,
    mass: 10,
    nestedObj: { foo: 'bar' }, // Should be excluded safely
    itemsList: [1, 2, 3],       // Should be excluded safely
  };

  const params = extractSafeSessionParameters(flatState);
  assert.equal(params.length, 2);
  assert.equal(params[0].key, 'force');
  assert.equal(params[1].key, 'mass');

  // Verify no object serialization leaked
  params.forEach((p) => {
    assert.ok(!p.value.includes('[object'));
    assert.ok(!p.label.includes('[object'));
  });
});

test('UX-001: formatSessionTelemetry produces clean Indonesian telemetry readout', () => {
  const state = {
    parameters: { force: 50, mass: 2 },
  };
  const text = formatSessionTelemetry(state);
  assert.equal(text, 'Gaya (F) = 50\u00A0N  /  Massa (m) = 2\u00A0kg');
});

test('UX-001: formatSessionTelemetry returns natural Indonesian fallback when state is empty or invalid', () => {
  assert.equal(formatSessionTelemetry(null), 'Sesi tersimpan • Parameter awal siap diuji');
  assert.equal(formatSessionTelemetry({}), 'Sesi tersimpan • Parameter awal siap diuji');
  assert.equal(formatSessionTelemetry({ parameters: {} }), 'Sesi tersimpan • Parameter awal siap diuji');
  assert.equal(
    formatSessionTelemetry({ parameters: { complex: { a: 1 } } }),
    'Sesi tersimpan • Parameter awal siap diuji'
  );
  // Custom fallback text
  assert.equal(formatSessionTelemetry(null, 'Parameter standar'), 'Parameter standar');
});
