import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  createSimulationRuntimeState,
  stepSimulationRuntime,
  setSimulationParameter,
  resetSimulationRuntime,
} from '../src/lib/simulation/simulation-runtime';
import { newtonsSecondLaw } from '@genlab/simulation-core';
import { createEmptySimulatorSpec } from '../src/lib/simulation/simulator-schema';

describe('Simulation Runtime Performance & Scientific Integrity', () => {
  it('correctly integrates Newton second law dynamics deterministically', () => {
    const spec = createEmptySimulatorSpec();
    spec.slug = 'newtons-second-law';
    spec.parameters = {
      mass: { key: 'mass', label: 'Massa', min: 1, max: 20, defaultVal: 5, step: 0.5, unit: 'kg' },
      force: { key: 'force', label: 'Gaya', min: 0, max: 100, defaultVal: 20, step: 1, unit: 'N' },
      friction: { key: 'friction', label: 'Gesek', min: 0, max: 1, defaultVal: 0, step: 0.05, unit: '' },
    };

    let state = createSimulationRuntimeState(spec, { mass: 5, force: 20, friction: 0 });
    assert.strictEqual(state.dynamics.acceleration, 4); // a = 20 / 5 = 4 m/s²
    assert.strictEqual(state.dynamics.velocity, 0);
    assert.strictEqual(state.dynamics.position, 0);

    // Turn running on
    state = { ...state, isRunning: true };

    // Step by 0.02s
    state = stepSimulationRuntime(state, 0.02, spec);
    assert.strictEqual(state.dynamics.acceleration, 4);
    assert.strictEqual(Number(state.dynamics.velocity.toFixed(3)), 0.08); // v = 4 * 0.02 = 0.08
    assert.strictEqual(Number(state.dynamics.position.toFixed(4)), 0.0008); // x = 0.5 * 4 * (0.02)^2 = 0.0008

    // Computed values must remain authoritative
    assert.strictEqual(state.computed.acceleration, 4);
    assert.strictEqual(state.computed.netForce, 20);
  });

  it('trajectory maintains bounded sampling without per-frame memory thrashing', () => {
    const spec = createEmptySimulatorSpec();
    spec.slug = 'newtons-second-law';
    spec.parameters = {
      mass: { key: 'mass', label: 'Massa', min: 1, max: 20, defaultVal: 2, step: 1, unit: 'kg' },
      force: { key: 'force', label: 'Gaya', min: 0, max: 100, defaultVal: 10, step: 1, unit: 'N' },
    };

    let state = createSimulationRuntimeState(spec, { mass: 2, force: 10 });
    state = { ...state, isRunning: true };

    // Simulate 300 rapid animation frames (approx 5 seconds at 60 FPS)
    for (let i = 0; i < 300; i++) {
      state = stepSimulationRuntime(state, 0.016, spec);
    }

    // Trajectory must be bounded to at most 250 points
    assert.ok(state.trajectory);
    assert.ok(state.trajectory.length <= 250);
    assert.ok(state.trajectory.length > 50);

    // Positions and time must monotonically increase
    const last = state.trajectory[state.trajectory.length - 1];
    const first = state.trajectory[0];
    assert.ok(last.t > first.t);
    assert.ok(last.x > first.x);
  });

  it('paused simulation does not advance time or trajectory', () => {
    const spec = createEmptySimulatorSpec();
    spec.slug = 'newtons-second-law';
    let state = createSimulationRuntimeState(spec);
    assert.strictEqual(state.isRunning, false);

    const initialTime = state.time;
    const initialPos = state.dynamics.position;

    const nextState = stepSimulationRuntime(state, 0.05, spec);
    assert.strictEqual(nextState.time, initialTime);
    assert.strictEqual(nextState.dynamics.position, initialPos);
  });

  it('Newton 2 ignores extraneous speed overrides, maintains v=0 at rest, and scales v with F/m', () => {
    const spec = createEmptySimulatorSpec();
    spec.slug = 'newtons-second-law';
    spec.parameters = {
      mass: { key: 'mass', label: 'Massa', min: 1, max: 20, defaultVal: 5, step: 0.5, unit: 'kg' },
      force: { key: 'force', label: 'Gaya', min: 0, max: 100, defaultVal: 20, step: 1, unit: 'N' },
      friction: { key: 'friction', label: 'Gesek', min: 0, max: 1, defaultVal: 0, step: 0.05, unit: '' },
    };

    // 1. Extraneous speed/velocity overrides must NOT pollute initial velocity for Newton
    let state = createSimulationRuntimeState(spec, { mass: 5, force: 20, friction: 0, speed: 50, velocity: 20 });
    assert.strictEqual(state.dynamics.velocity, 0, 'Newton initial velocity must be 0 m/s');
    assert.strictEqual(state.dynamics.acceleration, 4, 'a = 20/5 = 4 m/s²');
    assert.strictEqual(state.computed.realtime_velocity, 0);

    // 2. Changing force while stopped updates prospective acceleration and keeps v=0
    state = setSimulationParameter(state, 'force', 50, spec);
    assert.strictEqual(state.dynamics.velocity, 0, 'Velocity must stay 0 at rest');
    assert.strictEqual(state.dynamics.acceleration, 10, 'a = 50/5 = 10 m/s²');
    assert.strictEqual(state.computed.acceleration, 10);
    assert.strictEqual(state.computed.realtime_velocity, 0);

    // 3. Changing mass while stopped updates prospective acceleration and keeps v=0
    state = setSimulationParameter(state, 'mass', 10, spec);
    assert.strictEqual(state.dynamics.velocity, 0, 'Velocity must stay 0 at rest');
    assert.strictEqual(state.dynamics.acceleration, 5, 'a = 50/10 = 5 m/s²');

    // 4. Running the simulation accelerates smoothly starting from 0
    state = { ...state, isRunning: true };
    state = stepSimulationRuntime(state, 0.1, spec); // 0.1s at a = 5 m/s²
    assert.strictEqual(Number(state.dynamics.velocity.toFixed(3)), 0.5, 'v = 5 * 0.1 = 0.5 m/s');
    assert.strictEqual(Number(state.dynamics.position.toFixed(4)), 0.025, 'x = 0.5 * 5 * 0.01 = 0.025 m');

    // 5. Resetting restores v=0, x=0 while keeping current parameters (mass=10, force=50)
    state = resetSimulationRuntime(spec, state.parameters);
    assert.strictEqual(state.dynamics.velocity, 0, 'v must reset to 0');
    assert.strictEqual(state.dynamics.position, 0, 'x must reset to 0');
    assert.strictEqual(state.time, 0, 't must reset to 0');
    assert.strictEqual(state.parameters.force, 50, 'force parameter retained');
    assert.strictEqual(state.parameters.mass, 10, 'mass parameter retained');
    assert.strictEqual(state.dynamics.acceleration, 5, 'a = 50/10 = 5 m/s²');
  });
});
