import { UnifiedSimulatorSpec, evaluateSimulator } from './simulator-schema';

export interface KinematicPoint {
  t: number;
  x: number;
  v: number;
  a: number;
}

export interface SimulationDynamicsState {
  position: number;     // Current position along primary axis in meters
  velocity: number;     // Current velocity in m/s
  acceleration: number; // Current acceleration in m/s²
  distance: number;     // Cumulative distance traversed in meters
}

export interface SimulationRuntimeState {
  time: number;                                // Elapsed simulation time in seconds
  isRunning: boolean;                          // Play / Pause state
  playbackRate: number;                        // Speed multiplier (e.g. 1.0)
  parameters: Record<string, number>;          // Canonical live parameters (SINGLE SOURCE OF TRUTH)
  computed: Record<string, number | string>;   // Deterministic computed metrics
  dynamics: SimulationDynamicsState;           // Real physics dynamics
  trackLength: number;                         // Track boundary in meters (default 10)
  trajectory?: KinematicPoint[];               // Time-series history of kinematic state for graphs
}

/**
 * Creates the canonical simulation runtime state from a UnifiedSimulatorSpec.
 * Acts as the SINGLE SOURCE OF TRUTH for both AI-generated and Admin-generated simulators.
 */
export function createSimulationRuntimeState(
  spec: UnifiedSimulatorSpec,
  initialOverrides?: Record<string, number>
): SimulationRuntimeState {
  const parameters: Record<string, number> = {};

  const s = String(spec.slug || spec.id || '').toLowerCase();
  const isNewton = s.includes('newton') || s.includes('second-law');

  // Extract from spec.parameters
  if (spec.parameters && Object.keys(spec.parameters).length > 0) {
    for (const [key, p] of Object.entries(spec.parameters)) {
      const val = initialOverrides?.[key] ?? (p as any).value ?? p.defaultVal ?? p.min;
      const min = typeof p.min === 'number' ? p.min : 0;
      const max = typeof p.max === 'number' ? p.max : 1000;
      parameters[key] = Math.max(min, Math.min(max, Number(val)));
    }
  } else if (initialOverrides) {
    // Only adopt raw overrides if no spec parameters exist
    for (const [k, v] of Object.entries(initialOverrides)) {
      if (typeof v === 'number') {
        parameters[k] = v;
      }
    }
  }

  // Initial evaluation
  const evalResult = evaluateSimulator(spec, parameters);
  const computed = { ...evalResult.computed };

  // Determine initial speed and acceleration
  const speed = isNewton ? 0 : (parameters.speed ?? parameters.velocity ?? parameters.kecepatan ?? parameters.v ?? parameters.v0 ?? 0);
  const force = parameters.force ?? parameters.gaya ?? parameters.f;
  const mass = parameters.mass ?? parameters.massa ?? parameters.m ?? parameters.m1 ?? 5;
  const friction = parameters.friction ?? parameters.gesek ?? parameters.koefisienGesek ?? 0;

  let initialAccel = 0;
  const normalForceVal = mass * 9.81;
  const maxFrictionVal = Math.max(0, friction) * normalForceVal;
  let initialNetForce = 0;
  let initialActiveFriction = 0;

  if (force !== undefined && mass > 0) {
    if (Math.abs(force) > maxFrictionVal) {
      initialActiveFriction = maxFrictionVal;
      initialNetForce = force - Math.sign(force) * maxFrictionVal;
      initialAccel = Number((initialNetForce / mass).toFixed(3));
    } else {
      initialActiveFriction = Math.abs(force);
      initialNetForce = 0;
      initialAccel = 0;
    }
  } else if (computed.acceleration !== undefined) {
    initialAccel = Number(computed.acceleration) || 0;
  }

  const initialVelocity = speed > 0 ? speed : 0;
  const initialKineticEnergy = 0.5 * mass * initialVelocity * initialVelocity;
  const initialMomentum = mass * initialVelocity;

  const fullComputed = {
    ...computed,
    netForce: initialNetForce !== undefined ? Number(Number(initialNetForce).toFixed(2)) : computed.netForce,
    acceleration: initialAccel,
    realtime_velocity: initialVelocity,
    realtime_acceleration: initialAccel,
    realtime_position: 0,
    realtime_time: 0,
    activeFriction: Number(initialActiveFriction.toFixed(2)),
    normalForce: Number(normalForceVal.toFixed(2)),
    weight: Number(normalForceVal.toFixed(2)),
    kineticEnergy: Number(initialKineticEnergy.toFixed(2)),
    momentum: Number(initialMomentum.toFixed(2)),
  };

  return {
    time: 0,
    isRunning: false,
    playbackRate: 1.0,
    parameters,
    computed: fullComputed,
    trajectory: [{ t: 0, x: 0, v: initialVelocity, a: initialAccel }],
    dynamics: {
      position: 0,
      velocity: initialVelocity,
      acceleration: initialAccel,
      distance: 0,
    },
    trackLength: 10, // 10 meter default metric track
  };
}

/**
 * Steps the simulation forward by delta time `dt` (in seconds).
 * Deterministically integrates velocity and position based on parameters and acceleration.
 */
export function stepSimulationRuntime(
  state: SimulationRuntimeState,
  dt: number,
  spec: UnifiedSimulatorSpec
): SimulationRuntimeState {
  if (!state.isRunning || dt <= 0) {
    return state;
  }

  const effectiveDt = dt * (state.playbackRate || 1.0);
  const { parameters } = state;

  // 1. Identify parameter drivers with full alias normalization
  const directSpeed = parameters.speed ?? parameters.velocity ?? parameters.kecepatan ?? parameters.v ?? parameters.v0;
  const force = parameters.force ?? parameters.gaya ?? parameters.f;
  const mass = Math.max(0.01, parameters.mass ?? parameters.massa ?? parameters.m ?? parameters.m1 ?? 5);
  const rawFriction = parameters.friction ?? parameters.gesek ?? parameters.koefisienGesek ?? 0;
  const normalForce = mass * 9.81;
  const maxFriction = Math.max(0, rawFriction) * normalForce;

  const prevVelocity = state.dynamics.velocity;
  let newVelocity = prevVelocity;
  let newAcceleration = state.dynamics.acceleration;
  let activeFriction = 0;

  const isProj = String(spec.slug || spec.id || '').toLowerCase().includes('projectile') ||
                 String(spec.slug || spec.id || '').toLowerCase().includes('peluru') ||
                 String(spec.slug || spec.id || '').toLowerCase().includes('parabola');

  if (isProj) {
    const v0 = Math.max(0, Number(parameters.velocity ?? parameters.v0 ?? parameters.v ?? directSpeed ?? 25));
    const angleDeg = Number(parameters.angle ?? parameters.sudut ?? parameters.elevasi ?? 45);
    const rad = (angleDeg * Math.PI) / 180;
    const g = Math.max(0.1, Number(parameters.gravity ?? parameters.gravitasi ?? 9.81));
    const y0 = Math.max(0, Number(parameters.y0 ?? 0));
    const vx = v0 * Math.cos(rad);
    const vy = v0 * Math.sin(rad);
    const flightTime = Math.max(0.01, (vy + Math.sqrt(Math.max(0, vy * vy + 2 * g * y0))) / g);

    const nextT = state.time + effectiveDt;
    if (nextT >= flightTime) {
      newVelocity = 0;
      newAcceleration = 0;
      activeFriction = 0;
    } else {
      const curVy = vy - g * nextT;
      newVelocity = Math.sqrt(vx * vx + curVy * curVy);
      newAcceleration = g;
      activeFriction = 0;
    }
  } else if (directSpeed !== undefined && force === undefined) {
    // Mode A: Direct speed parameter driven
    newVelocity = directSpeed;
    newAcceleration = 0;
    activeFriction = 0;
  } else if (force !== undefined) {
    // Mode B: Newton's Second Law Dynamics: F_net = F + f_friction, a = F_net / m
    if (Math.abs(prevVelocity) > 0.0001) {
      // Cart is moving: kinetic friction strictly opposes velocity vector (-sign(v) * f_k)
      activeFriction = maxFriction;
      const frictionVector = -Math.sign(prevVelocity) * maxFriction;
      const netForce = force + frictionVector;
      newAcceleration = netForce / mass;
      const candidateV = prevVelocity + newAcceleration * effectiveDt;

      // Friction brings moving cart to rest when applied force cannot overcome static friction
      const crossedZero = (prevVelocity > 0 && candidateV <= 0) || (prevVelocity < 0 && candidateV >= 0);
      if (crossedZero && Math.abs(force) <= maxFriction) {
        newVelocity = 0;
        newAcceleration = 0;
        activeFriction = Math.abs(force);
      } else if (crossedZero) {
        // Opposing force overcomes friction: cart reverses direction through zero
        const reversedFriction = -Math.sign(candidateV) * maxFriction;
        newAcceleration = (force + reversedFriction) / mass;
        newVelocity = candidateV;
        activeFriction = maxFriction;
      } else {
        newVelocity = candidateV;
      }
    } else {
      // Cart is at rest: static friction cancels applied force up to maxFriction
      if (Math.abs(force) > maxFriction) {
        activeFriction = maxFriction;
        const netForce = force - Math.sign(force) * maxFriction;
        newAcceleration = netForce / mass;
        newVelocity = newAcceleration * effectiveDt;
      } else {
        activeFriction = Math.abs(force);
        newAcceleration = 0;
        newVelocity = 0;
      }
    }
  } else {
    // Mode C: General frequency / rate parameter
    const rate = parameters.rate ?? parameters.frekuensi ?? parameters.rpm ?? 1;
    newVelocity = rate;
    newAcceleration = 0;
    activeFriction = 0;
  }

  // 2. Exact physical position integration: x(t + dt) = x(t) + v_avg * dt = x(t) + v0 * dt + 0.5 * a * dt^2
  let continuousPos = state.dynamics.position;
  let dx = 0;
  if (isProj) {
    const v0 = Math.max(0, Number(parameters.velocity ?? parameters.v0 ?? parameters.v ?? directSpeed ?? 25));
    const angleDeg = Number(parameters.angle ?? parameters.sudut ?? parameters.elevasi ?? 45);
    const rad = (angleDeg * Math.PI) / 180;
    const g = Math.max(0.1, Number(parameters.gravity ?? parameters.gravitasi ?? 9.81));
    const y0 = Math.max(0, Number(parameters.y0 ?? 0));
    const vx = v0 * Math.cos(rad);
    const vy = v0 * Math.sin(rad);
    const flightTime = Math.max(0.01, (vy + Math.sqrt(Math.max(0, vy * vy + 2 * g * y0))) / g);

    const boundedT = Math.min(flightTime, state.time + effectiveDt);
    continuousPos = vx * boundedT;
    dx = continuousPos - state.dynamics.position;
  } else {
    const avgVelocity = (prevVelocity + newVelocity) / 2;
    dx = avgVelocity * effectiveDt;
    continuousPos = state.dynamics.position + dx;
  }

  // 3. High-performance deterministic telemetry update (no redundant formula re-eval)
  // Base formulas were already evaluated during initialization & parameter updates.
  const baseComputed = state.computed;
  const netForceVal = force !== undefined
    ? Number((newAcceleration * mass).toFixed(2))
    : baseComputed.netForce;

  const newTime = state.time + effectiveDt;

  // Optimized trajectory ring-sampling (25 Hz cap to prevent memory thrashing & GC pauses)
  const prevTraj = state.trajectory || [{ t: 0, x: 0, v: prevVelocity, a: state.dynamics.acceleration }];
  const lastPt = prevTraj[prevTraj.length - 1];
  let trajectory = prevTraj;

  if (!lastPt || (newTime - lastPt.t) >= 0.04) {
    const newPt: KinematicPoint = {
      t: Number(newTime.toFixed(2)),
      x: Number(continuousPos.toFixed(3)),
      v: Number(newVelocity.toFixed(3)),
      a: Number(newAcceleration.toFixed(3)),
    };
    trajectory = prevTraj.length >= 250
      ? [...prevTraj.slice(prevTraj.length - 249), newPt]
      : [...prevTraj, newPt];
  }

  const computed = {
    ...baseComputed,
    netForce: netForceVal !== undefined ? netForceVal : baseComputed.netForce,
    acceleration: Number(newAcceleration.toFixed(2)),
    realtime_velocity: Number(newVelocity.toFixed(2)),
    realtime_acceleration: Number(newAcceleration.toFixed(2)),
    realtime_position: Number(continuousPos.toFixed(2)),
    realtime_time: Number(newTime.toFixed(2)),
    activeFriction: Number(activeFriction.toFixed(2)),
    normalForce: Number(normalForce.toFixed(2)),
    weight: Number(normalForce.toFixed(2)),
    kineticEnergy: Number((0.5 * mass * newVelocity * newVelocity).toFixed(2)),
    momentum: Number((mass * newVelocity).toFixed(2)),
  };

  return {
    ...state,
    time: newTime,
    computed,
    trajectory,
    dynamics: {
      position: continuousPos,
      velocity: newVelocity,
      acceleration: newAcceleration,
      distance: state.dynamics.distance + Math.abs(dx),
    },
  };
}

export type ParameterBehaviorType = 'dynamic' | 'initial_condition' | 'algorithm';

/**
 * Classifies parameters into dynamic, initial_condition, or algorithm
 * to ensure realistic, physically sound, and stable behavior across all simulation modules.
 */
export function getParameterBehaviorType(slug?: string, paramKey: string = ''): ParameterBehaviorType {
  const s = String(slug || '').toLowerCase();
  const k = String(paramKey || '').toLowerCase();

  // 1. Computer science / Algorithm modules
  if (
    s.includes('sort') ||
    s.includes('search') ||
    s.includes('biner') ||
    s.includes('graf') ||
    s.includes('graph')
  ) {
    if (k === 'speed' || k === 'kecepatan') {
      return 'dynamic';
    }
    return 'algorithm';
  }

  // 2. Initial condition physics modules (projectile, momentum collision)
  if (s.includes('projectile') || s.includes('peluru') || s.includes('parabola')) {
    return 'initial_condition';
  }
  if (s.includes('momentum') || s.includes('collision') || s.includes('tumbukan')) {
    return 'initial_condition';
  }

  // 3. Newton's second law: mass, force, friction are dynamic
  if (s.includes('newton')) {
    return 'dynamic';
  }

  // General heuristics based on key
  if (/^(v0|angle|sudut|theta|gravity|gravitasi|elasticity|m1|m2|v1|v2)$/i.test(k)) {
    return 'initial_condition';
  }
  if (/^(target|find|size|arraysize|algorithm|metode|startnode|node)$/i.test(k)) {
    return 'algorithm';
  }

  return 'dynamic';
}

/**
 * Updates a parameter in the simulation state and immediately re-evaluates the physics.
 * Adheres to parameter contracts: dynamic params maintain running state, initial conditions
 * reset cleanly to new origin, and algorithms recalculate steps from step 0.
 */
export function setSimulationParameter(
  state: SimulationRuntimeState,
  key: string,
  rawVal: number,
  spec: UnifiedSimulatorSpec
): SimulationRuntimeState {
  const paramDef = spec.parameters?.[key];
  let val = Number(rawVal);
  if (paramDef) {
    const min = typeof paramDef.min === 'number' ? paramDef.min : -Infinity;
    const max = typeof paramDef.max === 'number' ? paramDef.max : Infinity;
    val = Math.max(min, Math.min(max, val));
  }

  const updatedParameters = {
    ...state.parameters,
    [key]: val,
  };

  const category = getParameterBehaviorType(spec.slug, key);

  let newTime = state.time;
  let newPosition = state.dynamics.position;
  let newDistance = state.dynamics.distance;
  let newIsRunning = state.isRunning;

  // Re-calculate forces / acceleration with aliases
  const directSpeed = updatedParameters.speed ?? updatedParameters.velocity ?? updatedParameters.kecepatan ?? updatedParameters.v ?? updatedParameters.v0;
  const force = updatedParameters.force ?? updatedParameters.gaya ?? updatedParameters.f;
  const mass = Math.max(0.01, updatedParameters.mass ?? updatedParameters.massa ?? updatedParameters.m ?? updatedParameters.m1 ?? 5);
  const rawFriction = updatedParameters.friction ?? updatedParameters.gesek ?? updatedParameters.koefisienGesek ?? 0;
  const normalForce = mass * 9.81;
  const maxFriction = Math.max(0, rawFriction) * normalForce;

  let newVelocity = state.dynamics.velocity;
  let newAcceleration = state.dynamics.acceleration;

  if (category === 'initial_condition') {
    // Initial condition altered (e.g. angle or v0 in projectile, or velocities in collision):
    // Reset experiment state to the new initial condition to avoid mid-flight glitches
    newTime = 0;
    newPosition = 0;
    newDistance = 0;
    newVelocity = 0;
    newIsRunning = false;
  } else if (category === 'algorithm') {
    // Algorithmic input changed: reset execution step pointer to 0
    newTime = 0;
  }

  const s = String(spec.slug || spec.id || '').toLowerCase();
  const isNewton = s.includes('newton') || s.includes('second-law');

  if (directSpeed !== undefined && force === undefined) {
    newVelocity = category === 'initial_condition' && !newIsRunning ? 0 : directSpeed;
    newAcceleration = 0;
  } else if (force !== undefined) {
    if (!newIsRunning) {
      // Stopped/paused before run or at rest: cart remains stationary at rest
      if (state.time === 0 || isNewton) {
        newVelocity = 0;
        newPosition = 0;
        newDistance = 0;
      }
      newAcceleration = Math.abs(force) > maxFriction ? (force - Math.sign(force) * maxFriction) / mass : 0;
    } else if (Math.abs(newVelocity) > 0.0001) {
      const frictionVector = -Math.sign(newVelocity) * maxFriction;
      newAcceleration = (force + frictionVector) / mass;
    } else {
      if (Math.abs(force) > maxFriction) {
        newAcceleration = (force - Math.sign(force) * maxFriction) / mass;
      } else {
        newAcceleration = 0;
      }
      newVelocity = 0;
    }
  }

  const evalResult = evaluateSimulator(spec, updatedParameters);
  const netForceVal = force !== undefined
    ? Number((newAcceleration * mass).toFixed(2))
    : evalResult.computed.netForce;

  const activeFrictionVal = force !== undefined
    ? (Math.abs(newVelocity) > 0.0001 ? maxFriction : Math.min(maxFriction, Math.abs(force)))
    : 0;

  const newPt: KinematicPoint = {
    t: Number(newTime.toFixed(2)),
    x: Number(newPosition.toFixed(3)),
    v: Number(newVelocity.toFixed(3)),
    a: Number(newAcceleration.toFixed(3)),
  };

  const trajectory = category === 'initial_condition'
    ? [{ t: 0, x: 0, v: newVelocity, a: newAcceleration }]
    : (state.trajectory ? [...state.trajectory, newPt] : [newPt]);

  const computed = {
    ...evalResult.computed,
    netForce: netForceVal !== undefined ? netForceVal : evalResult.computed.netForce,
    acceleration: Number(newAcceleration.toFixed(2)),
    realtime_velocity: Number(newVelocity.toFixed(2)),
    realtime_acceleration: Number(newAcceleration.toFixed(2)),
    realtime_position: Number(newPosition.toFixed(2)),
    realtime_time: Number(newTime.toFixed(2)),
    activeFriction: Number(activeFrictionVal.toFixed(2)),
    normalForce: Number(normalForce.toFixed(2)),
    weight: Number(normalForce.toFixed(2)),
    kineticEnergy: Number((0.5 * mass * newVelocity * newVelocity).toFixed(2)),
    momentum: Number((mass * newVelocity).toFixed(2)),
  };

  return {
    ...state,
    time: newTime,
    isRunning: newIsRunning,
    parameters: updatedParameters,
    computed,
    trajectory,
    dynamics: {
      ...state.dynamics,
      position: newPosition,
      distance: newDistance,
      velocity: newVelocity,
      acceleration: newAcceleration,
    },
  };
}

/**
 * Resets runtime state to initial configuration.
 */
export function resetSimulationRuntime(
  spec: UnifiedSimulatorSpec,
  initialOverrides?: Record<string, number>
): SimulationRuntimeState {
  return createSimulationRuntimeState(spec, initialOverrides);
}
