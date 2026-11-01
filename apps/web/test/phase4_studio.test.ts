import { test } from 'node:test';
import assert from 'node:assert';
import { findReusableSimulation } from '../src/lib/simulation/reuse-matcher';
import { validateUnifiedSimulatorSpec } from '../src/lib/simulation/spec-validator';
import { STEM_ARCHETYPES, generateArchetypeSpec } from '../src/lib/simulation/stem-archetypes';
import { evaluateSimulator, safeEvaluateFormula } from '../src/lib/simulation/simulator-schema';

test('Phase 4: Reuse-First Matcher selects adequate existing module when confidence >= 0.65', () => {
  // Newton prompt should match newtons-second-law
  const resNewton = findReusableSimulation('Saya ingin bereksperimen dengan Hukum Newton dan percepatan massa');
  assert.strictEqual(resNewton.matchFound, true);
  assert.ok(resNewton.confidence >= 0.65, `Confidence ${resNewton.confidence} should be >= 0.65`);
  assert.strictEqual(resNewton.simulation?.slug, 'newtons-second-law');

  // Supply-Demand prompt should match supply-demand
  const resSupply = findReusableSimulation('Simulasi kurva permintaan dan penawaran ekuilibrium pasar');
  assert.strictEqual(resSupply.matchFound, true);
  assert.ok(resSupply.confidence >= 0.65);
  assert.strictEqual(resSupply.simulation?.slug, 'supply-demand');

  // Sorting algorithms should match sorting-algorithms
  const resSort = findReusableSimulation('Mempelajari algoritma sorting pengurutan bubble sort dan quicksort');
  assert.strictEqual(resSort.matchFound, true);
  assert.ok(resSort.confidence >= 0.65);
  assert.strictEqual(resSort.simulation?.slug, 'sorting-algorithms');
});

test('Phase 4: Insufficient matching confidence (< 0.65) does not incorrectly select a module', () => {
  // Hooke elasticity is not in the default 15 static catalog, should not force match Newton or Supply
  const resHooke = findReusableSimulation('Eksperimen elastisitas pegas spiral dan konstanta gaya k');
  assert.strictEqual(resHooke.matchFound, false);
  assert.ok(resHooke.confidence < 0.65, `Confidence ${resHooke.confidence} should be < 0.65`);

  // Unrelated prompt
  const resUnrelated = findReusableSimulation('Mekanisme fotosintesis kloroplas sel daun tumbuhan');
  assert.strictEqual(resUnrelated.matchFound, false);
  assert.ok(resUnrelated.confidence < 0.65);
});

test('Phase 4: 5 STEM Archetypes generate strictly valid UnifiedSimulatorSpec', () => {
  const archetypes = Object.keys(STEM_ARCHETYPES);
  assert.strictEqual(archetypes.length, 5, 'Must have exactly 5 verified STEM archetypes');

  for (const archKey of archetypes) {
    const arch = STEM_ARCHETYPES[archKey];
    const spec = arch.createSpec();
    const validation = validateUnifiedSimulatorSpec(spec);

    assert.strictEqual(
      validation.valid,
      true,
      `Archetype "${archKey}" failed validation: ${validation.errors.join(', ')}`
    );
    assert.strictEqual(spec.info.status, 'draft', 'Generated draft must have status draft');
    assert.ok(Object.keys(spec.parameters).length >= 2, 'Must have at least 2 parameters');
    assert.ok(Object.keys(spec.calculations).length >= 1, 'Must have at least 1 calculation');
    assert.ok(spec.visual.elements.length >= 2, 'Must have visual elements');
  }
});

test('Phase 4: Validator rejects unsafe or malformed specifications', () => {
  // 1. Script injection attempt
  const maliciousSpec: any = {
    info: { title: 'Test <script>alert(1)</script>', description: 'Test', discipline: 'Fisika' },
    parameters: { m: { key: 'm', label: 'Massa', min: 1, max: 10, defaultVal: 5 } },
    calculations: {},
    visual: { viewBox: { width: 640, height: 360 }, elements: [] },
  };
  const valMalicious = validateUnifiedSimulatorSpec(maliciousSpec);
  assert.strictEqual(valMalicious.valid, false);
  assert.ok(valMalicious.errors.some((e) => e.includes('Penolakan Keamanan')));

  // 2. Invalid parameter bounds (min >= max)
  const invalidBoundsSpec: any = {
    info: { title: 'Test Bounds', description: 'Test', discipline: 'Fisika' },
    parameters: { m: { key: 'm', label: 'Massa', min: 10, max: 5, defaultVal: 5 } },
    calculations: {},
    visual: { viewBox: { width: 640, height: 360 }, elements: [] },
  };
  const valBounds = validateUnifiedSimulatorSpec(invalidBoundsSpec);
  assert.strictEqual(valBounds.valid, false);
  assert.ok(valBounds.errors.some((e) => e.includes('harus lebih kecil dari maksimum')));

  // 3. Eval or Function call in formula
  const unsafeFormulaSpec: any = {
    info: { title: 'Test Formula', description: 'Test', discipline: 'Fisika' },
    parameters: { x: { key: 'x', label: 'X', min: 1, max: 10, defaultVal: 5 } },
    calculations: { out: { key: 'out', label: 'Out', formula: 'eval("2+2")' } },
    visual: { viewBox: { width: 640, height: 360 }, elements: [] },
  };
  const valFormula = validateUnifiedSimulatorSpec(unsafeFormulaSpec);
  assert.strictEqual(valFormula.valid, false);
});

test('Phase 4: Deterministic simulation calculation engine reacts to parameter updates', () => {
  const hookeSpec = STEM_ARCHETYPES['physics-dynamics'].createSpec('Hukum Hooke');
  
  // Test evaluation with initial params: k = 200, mass = 2, gravity = 9.8
  const eval1 = evaluateSimulator(hookeSpec, { k: 200, mass: 2, gravity: 9.8 });
  assert.strictEqual(eval1.computed.weight, 19.6); // 2 * 9.8
  assert.strictEqual(eval1.computed.deltaX, 0.098); // 19.6 / 200

  // Update mass to 4 kg -> weight should double to 39.2 N, deltaX to 0.196 m
  const eval2 = evaluateSimulator(hookeSpec, { k: 200, mass: 4, gravity: 9.8 });
  assert.strictEqual(eval2.computed.weight, 39.2);
  assert.strictEqual(eval2.computed.deltaX, 0.196);

  // Test quadratic function archetype: a = 1, b = -4, c = 3
  // D = (-4)^2 - 4(1)(3) = 16 - 12 = 4
  const quadSpec = STEM_ARCHETYPES['math-proportional'].createSpec();
  const evalQuad = evaluateSimulator(quadSpec, { a: 1, b: -4, c: 3 });
  assert.strictEqual(evalQuad.computed.discriminant, 4);
  assert.strictEqual(evalQuad.computed.xVertex, 2); // -(-4) / (2*1) = 2
});

test('Phase 4: generateArchetypeSpec selects the appropriate archetype based on prompt', () => {
  const p1 = generateArchetypeSpec('simulasi graf jaringan dan keterhubungan simpul node');
  assert.strictEqual(p1.slug, 'topologi-graf');

  const p2 = generateArchetypeSpec('debit air aliran pompa fluida reservoir');
  assert.strictEqual(p2.slug, 'alur-debit-fluida');

  const p3 = generateArchetypeSpec('gelombang sinus frekuensi dan amplitudo');
  assert.strictEqual(p3.slug, 'gelombang-harmonik');

  const p4 = generateArchetypeSpec('fungsi kuadrat parabola dan diskriminan');
  assert.strictEqual(p4.slug, 'fungsi-kuadrat');

  const p5 = generateArchetypeSpec('gaya gesek dan balok dorong');
  assert.strictEqual(p5.slug, 'dinamika-gerak');
});
