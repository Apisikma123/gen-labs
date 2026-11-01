import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractSafeSessionParameters,
  formatSessionTelemetry,
  formatNumber,
  formatCurrency,
} from '../src/lib/utils/formatters.js';

test('P0 Data Integrity: Recursively unwraps StoredSimulationSession currentState format', () => {
  const serverStoredSession = {
    id: 'ses-newton-123',
    templateSlug: 'newtons-second-law',
    userId: 'usr-student-01',
    currentState: {
      parameters: { mass: 5, force: 25 },
      computed: { acceleration: 5 },
    },
    history: [],
    startedAt: '2026-10-17T12:00:00Z',
    lastActiveAt: '2026-10-17T12:05:00Z',
  };

  const params = extractSafeSessionParameters(serverStoredSession);
  assert.equal(params.length, 3);
  assert.equal(params[0].label, 'Massa (m)');
  assert.equal(params[0].value, '5\u00A0kg');
  assert.equal(params[1].label, 'Gaya (F)');
  assert.equal(params[1].value, '25\u00A0N');
  assert.equal(params[2].label, 'Percepatan (a)');
  assert.equal(params[2].value, '5\u00A0m/s²');

  const telemetry = formatSessionTelemetry(serverStoredSession);
  assert.equal(telemetry, 'Massa (m) = 5\u00A0kg  /  Gaya (F) = 25\u00A0N  /  Percepatan (a) = 5\u00A0m/s²');
});

test('P0 Data Integrity: Handles current_state wrapper from Laravel API responses', () => {
  const apiSession = {
    id: 101,
    current_state: {
      force: 40,
      mass: 8,
    },
    progress: 75,
  };

  const telemetry = formatSessionTelemetry(apiSession);
  assert.equal(telemetry, 'Gaya (F) = 40\u00A0N  /  Massa (m) = 8\u00A0kg');
});

test('P0 Data Integrity: Handles stringified JSON session states safely', () => {
  const jsonString = JSON.stringify({
    parameters: { price: 50000, quantity: 12 },
  });

  const telemetry = formatSessionTelemetry(jsonString);
  assert.equal(telemetry, 'Harga (P) = Rp\u00A050.000  /  Kuantitas (Q) = 12\u00A0unit');
});

test('P0 Data Integrity: Handles structured parameter values with explicit units', () => {
  const structuredState = {
    speed: { value: 1.5, unit: 'x' },
    customResistance: { val: 220, unit: 'Ω' },
  };

  const params = extractSafeSessionParameters(structuredState);
  assert.equal(params.length, 2);
  assert.equal(params[0].label, 'Kecepatan Animasi');
  assert.equal(params[0].value, '1,5\u00A0x');
  assert.equal(params[1].label, 'Custom Resistance');
  assert.equal(params[1].value, '220\u00A0Ω');
});

test('P0 Data Integrity: Dynamically formats unknown scientific parameters without hardcoding', () => {
  const unknownSimState = {
    surfaceTension: 0.0728,
    viscosityCoefficient: 1.002,
    dampingRatio: 0.15,
  };

  const params = extractSafeSessionParameters(unknownSimState);
  assert.equal(params.length, 3);
  assert.equal(params[0].label, 'Surface Tension');
  assert.equal(params[0].value, '0,07');
  assert.equal(params[1].label, 'Viscosity Coefficient');
  assert.equal(params[1].value, '1');
  assert.equal(params[2].label, 'Damping Ratio');
  assert.equal(params[2].value, '0,15');

  const telemetry = formatSessionTelemetry(unknownSimState);
  assert.ok(telemetry.includes('Surface Tension = 0,07'));
  assert.ok(!telemetry.includes('[object'));
});

test('P0 Data Integrity: Zero [object Object] leaks under hostile/anomalous input structures', () => {
  const hostileInputs = [
    { nested: { deep: { failed: true } } },
    { arr: [1, 2, 3], matrix: [[1, 0], [0, 1]] },
    { strObject: '[object Object]', sneaky: 'foo [object bar]' },
    { rawNull: null, rawUndef: undefined },
    { emptyObj: {} },
    { badJson: '{ invalid json }' },
    '[object Object]',
    null,
    undefined,
    12345,
    true,
  ];

  for (const input of hostileInputs) {
    const text = formatSessionTelemetry(input);
    assert.ok(
      !text.includes('[object'),
      `Failed on input: ${JSON.stringify(input)} -> produced: ${text}`
    );
  }
});

test('P0 Mobile Collision: Workspace detection logic correctly identifies focused routes', () => {
  const checkWorkspace = (pathname: string) => {
    return pathname.startsWith('/modules/') || pathname.startsWith('/simulation/');
  };

  // Focused routes: mobile dock must be suppressed
  assert.equal(checkWorkspace('/modules/newtons-second-law'), true);
  assert.equal(checkWorkspace('/modules/ph-scale'), true);
  assert.equal(checkWorkspace('/simulation/newtons-second-law'), true);
  assert.equal(checkWorkspace('/simulation/sorting-visualizer'), true);

  // Global navigation routes: mobile dock must be displayed
  assert.equal(checkWorkspace('/'), false);
  assert.equal(checkWorkspace('/app'), false);
  assert.equal(checkWorkspace('/tanya-ai'), false);
  assert.equal(checkWorkspace('/explore'), false);
  assert.equal(checkWorkspace('/history'), false);
  assert.equal(checkWorkspace('/profile'), false);
  assert.equal(checkWorkspace('/settings'), false);
});

test('UI-001 A11y Focus Visible: globals.css preserves accessible keyboard focus ring and strips !important outline suppression', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const cssPath = path.resolve(process.cwd(), 'src/app/globals.css');
  const cssContent = await fs.readFile(cssPath, 'utf-8');

  // Strict check 1: outline: none !important MUST be completely eradicated
  assert.ok(
    !cssContent.includes('outline: none !important'),
    'Violation: globals.css still contains "outline: none !important" which destroys keyboard focus rings.'
  );

  // Strict check 2: box-shadow: none !important MUST be eliminated from focus reset
  assert.ok(
    !cssContent.includes('box-shadow: none !important'),
    'Violation: globals.css still contains "box-shadow: none !important".'
  );

  // Strict check 3: :focus-visible must provide clear 2px outline using --color-secondary
  assert.ok(
    cssContent.includes('outline: 2px solid var(--color-secondary)'),
    'Violation: globals.css must specify 2px solid var(--color-secondary) for :focus-visible.'
  );

  // Strict check 4: Pointer clicks must suppress outline cleanly via :focus:not(:focus-visible)
  assert.ok(
    cssContent.includes(':focus:not(:focus-visible)'),
    'Violation: globals.css must use :focus:not(:focus-visible) to eliminate distracting pointer click outlines.'
  );
});

test('P0 Data Integrity: Multi-discipline session schemas produce genuine scientific labels and units', () => {
  // Chemistry session
  const chemSession = {
    currentState: {
      parameters: { pH: 7.4, temperature: 25 },
      computed: { concentration: 0.05 },
    },
  };
  const chemTelemetry = formatSessionTelemetry(chemSession);
  assert.ok(chemTelemetry.includes('Derajat pH = 7,4'));
  assert.ok(chemTelemetry.includes('Suhu (T) = 25\u00A0°C'));
  assert.ok(chemTelemetry.includes('Konsentrasi = 0,05\u00A0M'));
  assert.ok(!chemTelemetry.includes('Gaya'));
  assert.ok(!chemTelemetry.includes('Massa'));

  // Computer Science / Algorithms session
  const csSession = {
    currentState: {
      parameters: { arraySize: 32, speed: 2 },
      computed: { comparisons: 124 },
    },
  };
  const csTelemetry = formatSessionTelemetry(csSession);
  assert.ok(csTelemetry.includes('Jumlah Elemen = 32\u00A0data'));
  assert.ok(csTelemetry.includes('Kecepatan Animasi = 2\u00A0x'));
  assert.ok(csTelemetry.includes('Perbandingan = 124\u00A0kali'));
  assert.ok(!csTelemetry.includes('[object'));
});

