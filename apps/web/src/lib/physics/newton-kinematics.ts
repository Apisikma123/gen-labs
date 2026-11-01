/**
 * GEN LABS — Deterministic Newton Kinematics Model
 *
 * Explicit Physical Assumptions:
 * 1. Frictionless linear air track (\mu = 0) to highlight pure Newton II dynamics.
 * 2. Unidirectional applied horizontal force F_net >= 0 (in Newtons).
 * 3. Rigid point-mass cart m > 0 (in kilograms).
 * 4. Bounded track of length L = 10.0 meters with an inelastic stopper bumper at x = L.
 * 5. Analytical baseline:
 *    a = F_net / m
 *    v(t) = v0 + a * t
 *    x(t) = x0 + v0 * t + 0.5 * a * t^2
 *    Stopping time at track bumper: t_stop = sqrt(2 * L / a) (for v0 = 0, x0 = 0).
 */

export interface NewtonSimulationState {
  time: number;          // Elapsed time in seconds
  force: number;         // Applied force in N (0 to 100 N)
  mass: number;          // Cart mass in kg (0.5 to 20 kg)
  trackLength: number;   // Track length in meters (default 10 m)
  position: number;      // Current position in meters [0, trackLength]
  velocity: number;      // Current velocity in m/s
  acceleration: number;  // Current acceleration in m/s^2 (F / m)
  percent: number;       // Position mapped to percentage [0, 100]% for visual rendering
  isStopped: boolean;    // True when cart has reached the stopper bumper
  kineticEnergy: number; // 0.5 * m * v^2 in Joules
  workDone: number;      // F * x in Joules (equals kinetic energy when frictionless)
}

export const NEWTON_DEFAULTS = {
  force: 20,       // 20 N
  mass: 4,         // 4 kg -> a = 5 m/s^2
  trackLength: 10, // 10 m
};

/**
 * Calculates acceleration strictly via Newton's Second Law: a = F / m.
 */
export function computeAcceleration(force: number, mass: number): number {
  if (mass <= 0) {
    throw new Error('Mass must be strictly positive');
  }
  return force / mass;
}

/**
 * Initialises simulation state at t = 0.
 */
export function initNewtonState(
  force: number = NEWTON_DEFAULTS.force,
  mass: number = NEWTON_DEFAULTS.mass,
  trackLength: number = NEWTON_DEFAULTS.trackLength
): NewtonSimulationState {
  const safeMass = Math.max(0.1, mass);
  const a = computeAcceleration(force, safeMass);
  return {
    time: 0,
    force,
    mass: safeMass,
    trackLength,
    position: 0,
    velocity: 0,
    acceleration: a,
    percent: 0,
    isStopped: false,
    kineticEnergy: 0,
    workDone: 0,
  };
}

/**
 * Analytical computation for constant force starting from rest (t = 0, x0 = 0, v0 = 0).
 */
export function computeAnalyticalState(
  force: number,
  mass: number,
  time: number,
  trackLength: number = NEWTON_DEFAULTS.trackLength
): NewtonSimulationState {
  const safeMass = Math.max(0.1, mass);
  const a = computeAcceleration(force, safeMass);

  if (a <= 0 || time <= 0) {
    return {
      time: Math.max(0, time),
      force,
      mass: safeMass,
      trackLength,
      position: 0,
      velocity: 0,
      acceleration: a,
      percent: 0,
      isStopped: false,
      kineticEnergy: 0,
      workDone: 0,
    };
  }

  // Time to reach bumper: x = 0.5 * a * t^2 => t = sqrt(2 * L / a)
  const tStop = Math.sqrt((2 * trackLength) / a);

  if (time >= tStop) {
    // Cart is at stopper bumper
    const impactVelocity = a * tStop;
    const work = force * trackLength;
    return {
      time,
      force,
      mass: safeMass,
      trackLength,
      position: trackLength,
      velocity: 0, // Cart rests against inelastic bumper
      acceleration: 0, // Normal force from bumper cancels applied force
      percent: 100,
      isStopped: true,
      kineticEnergy: 0.5 * safeMass * impactVelocity * impactVelocity,
      workDone: work,
    };
  }

  const position = 0.5 * a * time * time;
  const velocity = a * time;
  const percent = (position / trackLength) * 100;
  const kineticEnergy = 0.5 * safeMass * velocity * velocity;
  const workDone = force * position;

  return {
    time,
    force,
    mass: safeMass,
    trackLength,
    position,
    velocity,
    acceleration: a,
    percent,
    isStopped: false,
    kineticEnergy,
    workDone,
  };
}

/**
 * Numerical step for live dynamic runtime (preserves position & velocity when force/mass changed dynamically).
 */
export function stepNewtonState(
  state: NewtonSimulationState,
  dt: number,
  newForce?: number,
  newMass?: number
): NewtonSimulationState {
  if (dt <= 0 || state.isStopped) {
    return state;
  }

  const force = newForce !== undefined ? newForce : state.force;
  const mass = Math.max(0.1, newMass !== undefined ? newMass : state.mass);
  const a = computeAcceleration(force, mass);

  // Velocity-Verlet / kinematic update: x(t+dt) = x + v*dt + 0.5*a*dt^2, v(t+dt) = v + a*dt
  const nextPos = state.position + state.velocity * dt + 0.5 * a * dt * dt;
  const nextVel = state.velocity + a * dt;
  const nextTime = state.time + dt;

  if (nextPos >= state.trackLength) {
    // Hit bumper
    const work = force * state.trackLength;
    const impactVel = Math.sqrt(Math.max(0, state.velocity * state.velocity + 2 * a * (state.trackLength - state.position)));
    return {
      ...state,
      time: nextTime,
      force,
      mass,
      position: state.trackLength,
      velocity: 0,
      acceleration: 0,
      percent: 100,
      isStopped: true,
      kineticEnergy: 0.5 * mass * impactVel * impactVel,
      workDone: work,
    };
  }

  const percent = Math.min(100, Math.max(0, (nextPos / state.trackLength) * 100));
  const kineticEnergy = 0.5 * mass * nextVel * nextVel;
  const workDone = force * nextPos;

  return {
    ...state,
    time: nextTime,
    force,
    mass,
    position: nextPos,
    velocity: nextVel,
    acceleration: a,
    percent,
    isStopped: false,
    kineticEnergy,
    workDone,
  };
}
