import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  newtonsSecondLaw,
  functionExplorer,
  supplyDemand,
} from '@genlab/simulation-core';

test('Landing Page: Newton simulation engine model validation', () => {
  // Test case 1: m = 4 kg, F = 40 N -> a = 10 m/s^2
  const res1 = newtonsSecondLaw.compute({ mass: 4, force: 40, friction: 0 });
  assert.equal(res1.acceleration, 10);
  assert.equal(res1.netForce, 40);

  // Test case 2: m = 8 kg, F = 40 N -> a = 5 m/s^2
  const res2 = newtonsSecondLaw.compute({ mass: 8, force: 40, friction: 0 });
  assert.equal(res2.acceleration, 5);

  // Test case 3: m = 5 kg, F = 60 N -> a = 12 m/s^2 (Grounded in AI Tutor case)
  const res3 = newtonsSecondLaw.compute({ mass: 5, force: 60, friction: 0 });
  assert.equal(res3.acceleration, 12);
});

test('Landing Page: Function Explorer simulation model validation', () => {
  const res = functionExplorer.compute?.({ a: 1, b: 0, c: 30 });
  assert.ok(res);
  assert.equal(Math.abs(Number(res.vertexX)), 0);
  assert.equal(res.vertexY, 30);
});

test('Landing Page: Supply Demand simulation model validation', () => {
  const res = supplyDemand.compute?.({ demandShift: 0, supplyShift: 0 });
  assert.ok(res);
  assert.ok(typeof res.equilibriumPrice === 'number');
  assert.ok(typeof res.equilibriumQuantity === 'number');
});
