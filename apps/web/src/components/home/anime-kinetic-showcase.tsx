'use client';

import React, { useState, useEffect, useRef } from 'react';
import { animate, createTimeline } from 'animejs';
import {
  IconPlay,
  IconRotateCcw,
  IconActivity,
  IconArrowRight,
  IconGauge,
  IconLayers,
} from '@/components/icons';

export type DynamicMode = 'linear' | 'projectile' | 'harmonic';

export function AnimeKineticShowcase() {
  const [mode, setMode] = useState<DynamicMode>('linear');
  const [force, setForce] = useState<number>(40);
  const [mass, setMass] = useState<number>(4);
  const [angle, setAngle] = useState<number>(45);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Live telemetry numbers
  const [telemetry, setTelemetry] = useState({
    time: 0,
    velocity: 0,
    distance: 0,
    accel: 10,
  });

  // DOM Refs for Anime.js animation
  const gliderRef = useRef<HTMLDivElement>(null);
  const vectorFRef = useRef<HTMLDivElement>(null);
  const vectorVRef = useRef<HTMLDivElement>(null);
  const projectileRef = useRef<SVGCircleElement | null>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const wavePathRef = useRef<SVGPathElement>(null);
  const springBlockRef = useRef<HTMLDivElement>(null);

  const accel = Number((force / mass).toFixed(2));

  // ── TRIGGER ANIME.JS KINETIC MOTION ──
  const runLinearAnimation = () => {
    if (isRunning || !gliderRef.current) return;
    setIsRunning(true);

    const trackWidth = 520;
    const duration = Math.max(800, Math.min(2400, Math.round(2000 / Math.sqrt(accel))));

    // Reset initial state
    gliderRef.current.style.transform = 'translateX(0px)';
    if (vectorVRef.current) vectorVRef.current.style.width = '0px';

    const obj = { x: 0, t: 0 };

    animate(obj, {
      x: trackWidth,
      t: duration / 1000,
      duration,
      ease: 'inQuad', // Constant acceleration physical profile
      onUpdate: () => {
        if (gliderRef.current) {
          gliderRef.current.style.transform = `translateX(${obj.x}px)`;
        }
        const currentSpeed = (accel * obj.t).toFixed(1);
        if (vectorVRef.current) {
          vectorVRef.current.style.width = `${Math.min(90, Math.round(Number(currentSpeed) * 3))}px`;
        }
        setTelemetry({
          time: Number(obj.t.toFixed(2)),
          velocity: Number(currentSpeed),
          distance: Number(((0.5 * accel * obj.t * obj.t) / (0.5 * accel * (duration / 1000) * (duration / 1000)) * 10).toFixed(2)),
          accel,
        });
      },
      onComplete: () => {
        setIsRunning(false);
      },
    });
  };

  // ── TRIGGER ANIME.JS PROJECTILE PATH DRAWING ──
  const runProjectileAnimation = () => {
    if (isRunning || !pathRef.current) return;
    setIsRunning(true);

    const pathLength = pathRef.current.getTotalLength();
    pathRef.current.style.strokeDasharray = `${pathLength}`;
    pathRef.current.style.strokeDashoffset = `${pathLength}`;

    const obj = { p: 0 };
    animate(obj, {
      p: 1,
      duration: 1600,
      ease: 'outQuad',
      onUpdate: () => {
        if (pathRef.current) {
          pathRef.current.style.strokeDashoffset = `${pathLength * (1 - obj.p)}`;
        }
        const t = obj.p * 3.2;
        setTelemetry({
          time: Number(t.toFixed(2)),
          velocity: Number((30 * Math.cos((angle * Math.PI) / 180)).toFixed(1)),
          distance: Number((obj.p * 85).toFixed(1)),
          accel: 9.8,
        });
      },
      onComplete: () => {
        setIsRunning(false);
      },
    });
  };

  // ── TRIGGER ANIME.JS HARMONIC SPRING OSCILLATION ──
  const runHarmonicAnimation = () => {
    if (isRunning || !springBlockRef.current) return;
    setIsRunning(true);

    springBlockRef.current.style.transform = 'translateX(0px)';

    animate(springBlockRef.current, {
      translateX: [0, 140, -110, 75, -45, 20, 0],
      duration: 2200,
      ease: 'outElastic(1, 0.4)',
      onUpdate: () => {
        setTelemetry((prev) => ({
          ...prev,
          accel: Number((Math.random() * 4).toFixed(2)),
        }));
      },
      onComplete: () => {
        setIsRunning(false);
      },
    });
  };

  const handleExecute = () => {
    if (mode === 'linear') runLinearAnimation();
    if (mode === 'projectile') runProjectileAnimation();
    if (mode === 'harmonic') runHarmonicAnimation();
  };

  const handleReset = () => {
    setIsRunning(false);
    if (gliderRef.current) gliderRef.current.style.transform = 'translateX(0px)';
    if (vectorVRef.current) vectorVRef.current.style.width = '0px';
    if (springBlockRef.current) springBlockRef.current.style.transform = 'translateX(0px)';
    if (pathRef.current) {
      const pathLength = pathRef.current.getTotalLength();
      pathRef.current.style.strokeDashoffset = '0';
    }
    setTelemetry({
      time: 0,
      velocity: 0,
      distance: 0,
      accel,
    });
  };

  // Parabolic path dynamically based on angle
  const parabolaD = angle === 30
    ? 'M 20,160 Q 260,70 500,160'
    : angle === 45
    ? 'M 20,160 Q 260,20 500,160'
    : 'M 20,160 Q 200,-10 380,160';

  return (
    <div className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-7 shadow-md select-none transition-colors">
      {/* ── TOP CONTROLS: DYNAMIC MODE SELECTOR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[var(--color-border)] font-mono text-xs">
        <div className="flex items-center gap-2 font-bold text-sm text-[var(--color-text)]">
          <IconActivity size={16} className="text-[var(--color-secondary)]" />
          <span>Anime.js Vector Dynamics &amp; Solver</span>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
          {[
            { id: 'linear', label: '01 Kinematika 1D' },
            { id: 'projectile', label: '02 Parabola 2D' },
            { id: 'harmonic', label: '03 Pegas Hooke' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id as DynamicMode);
                handleReset();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                mode === m.id
                  ? 'bg-[var(--color-primary)] text-white shadow-xs font-bold dark:bg-[#F1F5F9] dark:text-[#0C0E12]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── INTERACTIVE CANVAS VIEWPORT ── */}
      <div className="mt-5 p-5 sm:p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] relative overflow-hidden">
        {/* Orthogonal hairline graticule backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hairline-rail" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hairline-rail)" />
          </svg>
        </div>

        {/* MODE 1: LINEAR AIR TRACK */}
        {mode === 'linear' && (
          <div className="relative py-8">
            {/* The 10m Air Track Rail */}
            <div className="w-full h-2 bg-[var(--color-border)] rounded-sm relative">
              {/* Metric Tick Marks */}
              <div className="absolute -bottom-5 inset-x-0 flex justify-between font-mono text-[10px] text-[var(--color-text-secondary)]">
                <span>0m</span>
                <span>2m</span>
                <span>4m</span>
                <span>6m</span>
                <span>8m</span>
                <span>10m [Target]</span>
              </div>

              {/* Dynamic Glider Block */}
              <div
                ref={gliderRef}
                className="absolute -top-7 left-0 w-20 h-10 rounded-lg bg-[var(--color-surface)] border-2 border-[var(--color-secondary)] flex items-center justify-center font-mono text-xs font-bold text-[var(--color-text)] shadow-xs transition-transform ease-linear"
                style={{ transform: 'translateX(0px)' }}
              >
                <span>{mass} kg</span>

                {/* Force Vector Arrow (Warm Ochre) */}
                <div
                  ref={vectorFRef}
                  className="absolute left-full top-1/2 -translate-y-1/2 flex items-center"
                >
                  <div
                    className="h-0.5 bg-[#BA8230] transition-all"
                    style={{ width: `${Math.round(force * 0.9)}px` }}
                  />
                  <div className="w-0 h-0 border-y-3 border-y-transparent border-l-[6px] border-l-[#BA8230]" />
                  <span className="text-[10px] font-mono font-bold text-[#BA8230] ml-1.5 whitespace-nowrap">
                    F: {force}N
                  </span>
                </div>

                {/* Velocity Vector Arrow (Phosphor Sage) */}
                <div
                  className="absolute left-full top-1/2 translate-y-2 flex items-center"
                >
                  <div
                    ref={vectorVRef}
                    className="h-0.5 bg-[var(--color-secondary)] transition-all"
                    style={{ width: '0px' }}
                  />
                  <div className="w-0 h-0 border-y-3 border-y-transparent border-l-[6px] border-l-[var(--color-secondary)]" />
                  <span className="text-[10px] font-mono font-bold text-[var(--color-secondary)] ml-1.5 whitespace-nowrap">
                    v(t)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: PROJECTILE TRAJECTORY */}
        {mode === 'projectile' && (
          <div className="relative h-48 w-full flex items-center justify-center">
            <svg viewBox="0 0 540 180" className="w-full h-full overflow-visible">
              {/* Ground Baseline */}
              <line x1="10" y1="160" x2="530" y2="160" stroke="var(--color-border)" strokeWidth="1.5" />

              {/* Trajectory Parabola Path */}
              <path
                ref={pathRef}
                d={parabolaD}
                fill="none"
                stroke="#4B8F8C"
                strokeWidth="2.5"
                strokeDasharray="600"
                strokeDashoffset="0"
              />

              {/* Reticle Diamond at Origin */}
              <polygon points="20,154 26,160 20,166 14,160" fill="#BA8230" />
              <text x="20" y="176" fill="var(--color-text-secondary)" fontSize="10" fontFamily="monospace">
                0m ({angle}°)
              </text>

              {/* Reticle Diamond at Impact */}
              <polygon points="500,154 506,160 500,166 494,160" fill="#BA8230" />
              <text x="500" y="176" fill="var(--color-text-secondary)" fontSize="10" fontFamily="monospace">
                x_max
              </text>
            </svg>
          </div>
        )}

        {/* MODE 3: HARMONIC OSCILLATION */}
        {mode === 'harmonic' && (
          <div className="relative py-10 flex items-center justify-center">
            <div className="w-full max-w-lg h-2 bg-[var(--color-border)] rounded-sm relative flex items-center justify-center">
              {/* Center Equilbrium Line */}
              <div className="absolute h-10 w-0.5 bg-[var(--color-secondary)] top-1/2 -translate-y-1/2" />
              <span className="absolute -top-6 font-mono text-[10px] text-[var(--color-secondary)] font-bold">
                Ekuilibrium x = 0
              </span>

              {/* Oscillating Block */}
              <div
                ref={springBlockRef}
                className="w-20 h-10 rounded-lg bg-[var(--color-surface)] border-2 border-[#BA8230] flex items-center justify-center font-mono text-xs font-bold text-[var(--color-text)] shadow-xs"
              >
                <span>m: {mass}kg</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── PARAMETER CONTROLS & LIVE TELEMETRY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5 pt-4 border-t border-[var(--color-border)] items-center">
        {/* Sliders (7 Cols) */}
        <div className="lg:col-span-7 space-y-4 font-mono text-xs">
          {mode === 'linear' && (
            <>
              <div>
                <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1">
                  <span>Gaya Bersih Dorong (F_net):</span>
                  <span className="font-bold text-[#BA8230]">{force} Newton</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={force}
                  disabled={isRunning}
                  onChange={(e) => setForce(Number(e.target.value))}
                  className="w-full cursor-pointer accent-[#BA8230]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1">
                  <span>Massa Glider (m):</span>
                  <div className="flex items-center gap-1.5">
                    {[2, 4, 8].map((m) => (
                      <button
                        key={m}
                        type="button"
                        disabled={isRunning}
                        onClick={() => setMass(m)}
                        className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                          mass === m
                            ? 'bg-[var(--color-primary)] text-white dark:bg-[#F1F5F9] dark:text-[#0C0E12]'
                            : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
                        }`}
                      >
                        {m} kg
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {mode === 'projectile' && (
            <div>
              <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1">
                <span>Sudut Elevasi Tembak (θ):</span>
                <span className="font-bold text-[var(--color-secondary)]">{angle}°</span>
              </div>
              <div className="flex items-center gap-2">
                {[30, 45, 60].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    disabled={isRunning}
                    onClick={() => setAngle(deg)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      angle === deg
                        ? 'bg-[var(--color-primary)] text-white dark:bg-[#F1F5F9] dark:text-[#0C0E12]'
                        : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
                    }`}
                  >
                    {deg}° Elevasi
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'harmonic' && (
            <div>
              <span className="text-[var(--color-text-secondary)] block mb-1">
                Model: F_pegas = -k × x (Hukum Hooke)
              </span>
              <p className="font-sans text-xs text-[var(--color-text)]">
                Anime.js mengeksekusi osilasi redaman menggunakan kurva elastic easing sejati.
              </p>
            </div>
          )}
        </div>

        {/* Live Space Mono Telemetry Register (5 Cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] font-mono text-xs space-y-2">
          <div className="flex justify-between pb-1.5 border-b border-[var(--color-border)] text-[var(--color-text-secondary)] font-bold">
            <span>Register Kausalitas</span>
            <span className="text-[var(--color-secondary)]">WASM Telemetry</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Waktu (t):</span>
            <span className="font-bold text-[var(--color-text)] tabular-nums">{telemetry.time.toFixed(2)} s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Kecepatan (v):</span>
            <span className="font-bold text-[var(--color-secondary)] tabular-nums">{telemetry.velocity.toFixed(2)} m/s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Percepatan (a = F/m):</span>
            <span className="font-bold text-[#BA8230] tabular-nums">{accel.toFixed(2)} m/s²</span>
          </div>
        </div>
      </div>

      {/* ── ACTION TRIGGER BUTTONS ── */}
      <div className="mt-5 flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
        <button
          type="button"
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl border border-[var(--color-border)] text-xs font-mono font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] flex items-center gap-1.5 cursor-pointer hover:bg-[var(--color-surface-subtle)] transition-colors"
        >
          <IconRotateCcw size={13} />
          <span>Atur Ulang Posisi</span>
        </button>

        <button
          type="button"
          disabled={isRunning}
          onClick={handleExecute}
          className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] font-heading text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <IconPlay size={13} />
          <span>{isRunning ? 'Solver Sedang Berjalan...' : 'Luncurkan Animasi Solver'}</span>
        </button>
      </div>
    </div>
  );
}
