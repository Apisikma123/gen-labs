'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { animate, createTimeline } from 'animejs';
import {
  IconPlay,
  IconRotateCcw,
  IconArrowRight,
  IconGauge,
  IconActivity,
} from '@/components/icons';
import {
  newtonsSecondLaw,
  functionExplorer,
  supplyDemand,
} from '@genlab/simulation-core';

export type ConceptKey = 'newton' | 'function' | 'sorting' | 'market';

interface HeroInteractiveShowcaseProps {
  activeConcept: ConceptKey;
  onConceptChange: (concept: ConceptKey) => void;
}

export function HeroInteractiveShowcase({
  activeConcept,
  onConceptChange,
}: HeroInteractiveShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const TABS: Array<{ id: ConceptKey; label: string; slug: string }> = [
    { id: 'newton', label: 'Gaya & Gerak', slug: 'newtons-second-law' },
    { id: 'function', label: 'Grafik Parabola', slug: 'function-explorer' },
    { id: 'sorting', label: 'Urutan Angka', slug: 'sorting-algorithms' },
    { id: 'market', label: 'Harga Pasar', slug: 'supply-demand' },
  ];

  const currentTab = TABS.find((t) => t.id === activeConcept) || TABS[0];

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5 transition-colors shadow-xs select-none"
    >
      {/* ── TOP CONCEPT SWITCHER (ANIME.JS V4 DOCS TABS STYLE) ── */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)] gap-2">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] font-sans text-xs flex-1 min-w-0">
          {TABS.map((tab) => {
            const isActive = activeConcept === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onConceptChange(tab.id)}
                className={`flex-1 text-center px-1.5 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[34px] ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white shadow-xs font-bold dark:bg-[#F1F5F9] dark:text-[#0C0E12]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <Link
          href={`/simulation/${currentTab.slug}`}
          title="Buka Penuh"
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[var(--color-border)] text-xs font-mono font-semibold text-[var(--color-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] transition-colors whitespace-nowrap shrink-0 min-h-[34px]"
        >
          <span>Penuh</span>
          <IconArrowRight size={12} />
        </Link>
      </div>

      {/* ── ACTIVE CONCEPT APPARATUS ── */}
      <div className="mt-4">
        {activeConcept === 'newton' && <NewtonShowcase />}
        {activeConcept === 'function' && <FunctionShowcase />}
        {activeConcept === 'sorting' && <SortingShowcase />}
        {activeConcept === 'market' && <MarketShowcase />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GAYA & GERAK (HUKUM II NEWTON — EXACT ANIME.JS TIMELINE & REAL MATH)
// ─────────────────────────────────────────────────────────────────────────────
function NewtonShowcase() {
  const [force, setForce] = useState<number>(40);
  const [mass, setMass] = useState<number>(4);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState({ time: 0, velocity: 0, distance: 0 });

  const trackRef = useRef<HTMLDivElement>(null);
  const gliderRef = useRef<HTMLDivElement>(null);
  const vectorVRef = useRef<HTMLDivElement>(null);
  const graphPathRef = useRef<SVGPathElement>(null);
  const animationInstance = useRef<any>(null);

  // Real validated physics model
  const simResult = newtonsSecondLaw.compute({ mass, force, friction: 0 });
  const accel = Number(simResult.acceleration);

  useEffect(() => {
    return () => {
      if (animationInstance.current) {
        animationInstance.current.pause();
      }
    };
  }, []);

  const handleLaunch = () => {
    if (isRunning || !gliderRef.current || !trackRef.current) return;
    setIsRunning(true);

    const trackWidth = Math.max(200, trackRef.current.clientWidth - 72);
    const realTime = Math.sqrt((2 * 10) / accel);
    const duration = Math.max(800, Math.min(2200, Math.round(realTime * 700)));

    gliderRef.current.style.transform = 'translateX(0px)';
    if (vectorVRef.current) vectorVRef.current.style.width = '0px';

    const obj = { x: 0, t: 0 };
    const points: string[] = ['M 0 35'];

    animationInstance.current = animate(obj, {
      x: trackWidth,
      t: realTime,
      duration,
      ease: 'inQuad', // Strict constant acceleration: s = 0.5 * a * t^2
      onUpdate: () => {
        if (gliderRef.current) {
          gliderRef.current.style.transform = `translateX(${obj.x}px)`;
        }
        const currentSpeed = (accel * obj.t).toFixed(1);
        if (vectorVRef.current) {
          vectorVRef.current.style.width = `${Math.min(60, Math.round(Number(currentSpeed) * 3))}px`;
        }

        // Live SVG velocity graph trace
        const graphX = Math.round((obj.x / trackWidth) * 110);
        const graphY = Math.max(5, Math.round(35 - (Number(currentSpeed) / (accel * realTime || 1)) * 30));
        points.push(`L ${graphX} ${graphY}`);
        if (graphPathRef.current) {
          graphPathRef.current.setAttribute('d', points.join(' '));
        }

        setTelemetry({
          time: Number(obj.t.toFixed(2)),
          velocity: Number(currentSpeed),
          distance: Number(((obj.x / trackWidth) * 10).toFixed(1)),
        });
      },
      onComplete: () => {
        setIsRunning(false);
      },
    });
  };

  const handleReset = () => {
    if (animationInstance.current) animationInstance.current.pause();
    setIsRunning(false);
    if (gliderRef.current) gliderRef.current.style.transform = 'translateX(0px)';
    if (vectorVRef.current) vectorVRef.current.style.width = '0px';
    if (graphPathRef.current) graphPathRef.current.setAttribute('d', 'M 0 35');
    setTelemetry({ time: 0, velocity: 0, distance: 0 });
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* ── ANIME.JS CANVAS CONTAINER (DARK OBSIDIAN / LIGHT INSTRUMENT GROUND) ── */}
      <div className="p-4 sm:p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] relative overflow-hidden">
        {/* Header Readout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-[var(--color-text-secondary)] mb-6 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-sans font-medium text-[var(--color-text)]">
              Lintasan Bebas Hambatan (10 Meter)
            </span>
          </div>
          <div className="font-bold text-[var(--color-text)]">
            Percepatan Gerak: <span className="text-[var(--color-secondary)]">{accel} m/s²</span>
          </div>
        </div>

        {/* Linear Track Stage */}
        <div ref={trackRef} className="relative py-7 px-1">
          <div className="w-full h-1.5 bg-[var(--color-border)] rounded-sm relative">
            {/* Distance Markers */}
            <div className="absolute -bottom-4 inset-x-0 flex justify-between text-[10px] font-mono text-[var(--color-text-secondary)]">
              <span>0m</span>
              <span>2.5m</span>
              <span>5.0m</span>
              <span>7.5m</span>
              <span>10m</span>
            </div>

            {/* Glider Block */}
            <div
              ref={gliderRef}
              className="absolute -top-5 left-0 w-16 h-9 rounded-md bg-[var(--color-surface)] border-2 border-[var(--color-secondary)] flex items-center justify-center font-bold text-[var(--color-text)] shadow-xs transition-transform ease-linear z-10"
              style={{ transform: 'translateX(0px)' }}
            >
              <span className="text-xs font-mono">{mass} kg</span>

              {/* Force Vector Arrow (Warm Ochre) */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 flex items-center pointer-events-none pl-1">
                <div className="relative flex items-center">
                  <span className="absolute -top-4 left-0.5 text-[10px] text-[#BA8230] font-mono font-bold whitespace-nowrap">
                    {force}N
                  </span>
                  <div
                    className="h-0.5 bg-[#BA8230] transition-all duration-150"
                    style={{ width: `${Math.max(22, Math.round(force * 0.65))}px` }}
                  />
                  <div className="w-0 h-0 border-y-3 border-y-transparent border-l-[6px] border-l-[#BA8230]" />
                </div>
              </div>

              {/* Velocity Vector (Phosphor Sage) */}
              <div className="absolute left-full top-1/2 translate-y-2 flex items-center pointer-events-none pl-1">
                <div
                  ref={vectorVRef}
                  className="h-0.5 bg-[var(--color-secondary)] transition-all"
                  style={{ width: '0px' }}
                />
                <div className="w-0 h-0 border-y-3 border-y-transparent border-l-[6px] border-l-[var(--color-secondary)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Live SVG Graph Strip (like Anime.js scrub graph) */}
        <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
          <span className="text-[11px] text-[var(--color-text-secondary)] font-sans">
            Grafik Kecepatan Terhadap Waktu (v vs t):
          </span>
          <div className="w-32 h-10 border border-[var(--color-border)] rounded bg-[var(--color-surface)]/60 px-1 py-0.5 relative">
            <svg viewBox="0 0 120 40" className="w-full h-full overflow-visible">
              <path
                ref={graphPathRef}
                d="M 0 35"
                fill="none"
                stroke="var(--color-secondary)"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ── CONTROLS & LIVE READOUT ── */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Sliders (7 Cols) */}
        <div className="sm:col-span-7 space-y-3">
          <div>
            <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1">
              <span>Besar Gaya Dorong:</span>
              <span className="font-bold text-[#BA8230] font-mono">{force} Newton</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              step="5"
              value={force}
              disabled={isRunning}
              onChange={(e) => setForce(Number(e.target.value))}
              aria-label="Gaya Dorong"
              className="w-full cursor-pointer accent-[#BA8230] min-h-[36px]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-1">
              <span>Berat Beban:</span>
              <div className="flex items-center gap-1.5">
                {[2, 4, 8].map((m) => (
                  <button
                    key={m}
                    type="button"
                    disabled={isRunning}
                    onClick={() => setMass(m)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer min-h-[32px] ${
                      mass === m
                        ? 'bg-[var(--color-primary)] text-white shadow-xs dark:bg-[#F1F5F9] dark:text-[#0C0E12]'
                        : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    {m} kg
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Readout Numbers (5 Cols) */}
        <div className="sm:col-span-5 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] space-y-2 text-xs font-mono">
          <div className="flex justify-between text-[var(--color-text-secondary)]">
            <span className="font-sans">Waktu Melaju:</span>
            <span className="font-bold text-[var(--color-text)] tabular-nums">
              {telemetry.time.toFixed(2)}s
            </span>
          </div>
          <div className="flex justify-between text-[var(--color-text-secondary)]">
            <span className="font-sans">Kecepatan Saat Ini:</span>
            <span className="font-bold text-[var(--color-secondary)] tabular-nums">
              {telemetry.velocity.toFixed(1)} m/s
            </span>
          </div>
          <div className="flex justify-between text-[var(--color-text-secondary)]">
            <span className="font-sans">Jarak Ditempuh:</span>
            <span className="font-bold text-[var(--color-text)] tabular-nums">
              {telemetry.distance.toFixed(1)} meter
            </span>
          </div>
        </div>
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] flex items-center gap-1.5 cursor-pointer min-h-[40px] transition-colors"
        >
          <IconRotateCcw size={13} />
          <span>Atur Ulang</span>
        </button>

        <button
          type="button"
          disabled={isRunning}
          onClick={handleLaunch}
          className="px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] font-heading text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs min-h-[40px] active:scale-[0.98] disabled:opacity-50 transition-all dark:bg-[#F1F5F9] dark:text-[#0C0E12]"
        >
          <IconPlay size={13} />
          <span>{isRunning ? 'Sedang Melaju...' : 'Luncurkan Benda'}</span>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GRAFIK PARABOLA (FUNGSI KUADRAT)
// ─────────────────────────────────────────────────────────────────────────────
function FunctionShowcase() {
  const [a, setA] = useState<number>(0.02);
  const [c, setC] = useState<number>(30);

  const points = [];
  for (let x = -130; x <= 130; x += 10) {
    const y = 110 - (a * x * x + c * 0.5);
    points.push(`${160 + x},${Math.max(10, Math.min(130, y))}`);
  }
  const pathD = `M ${points.join(' L ')}`;

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-2 font-mono">
          <span>Bentuk Grafik: f(x) = {a}x² + {c}</span>
          <span className="font-bold text-[var(--color-secondary)]">
            Titik Puncak: (0, {c})
          </span>
        </div>

        <div className="h-36 w-full flex items-center justify-center">
          <svg viewBox="0 0 320 140" className="w-full h-full overflow-visible">
            <line x1="20" y1="110" x2="300" y2="110" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="160" y1="10" x2="160" y2="130" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" />

            <path
              d={pathD}
              fill="none"
              stroke="#4B8F8C"
              strokeWidth="2.5"
              className="transition-all duration-150"
            />

            <rect
              x="156"
              y={106 - c * 0.5}
              width="8"
              height="8"
              fill="#BA8230"
              rx="2"
              className="transition-all duration-150"
            />
            <text
              x="170"
              y={112 - c * 0.5}
              fill="var(--color-text)"
              fontSize="10"
              fontFamily="monospace"
              className="transition-all duration-150"
            >
              Puncak (0, {c})
            </text>
          </svg>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1">
            <span>Kelengkungan Kurva:</span>
            <span className="font-bold text-[var(--color-secondary)] font-mono">{a}</span>
          </div>
          <input
            type="range"
            min="-0.04"
            max="0.04"
            step="0.01"
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            aria-label="Kelengkungan"
            className="w-full cursor-pointer accent-[var(--color-secondary)] min-h-[36px]"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1">
            <span>Tinggi Titik Puncak:</span>
            <span className="font-bold text-[#BA8230] font-mono">{c}</span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={c}
            onChange={(e) => setC(Number(e.target.value))}
            aria-label="Tinggi Puncak"
            className="w-full cursor-pointer accent-[#BA8230] min-h-[36px]"
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. URUTAN ANGKA (CARA KOMPUTER MENYUSUN DATA)
// ─────────────────────────────────────────────────────────────────────────────
function SortingShowcase() {
  const [array, setArray] = useState<number[]>([45, 18, 72, 33, 89, 56, 12, 60]);
  const [activeIndices, setActiveIndices] = useState<[number, number] | null>(null);
  const [stepCount, setStepCount] = useState<number>(0);

  const handleReset = () => {
    setArray([45, 18, 72, 33, 89, 56, 12, 60]);
    setActiveIndices(null);
    setStepCount(0);
  };

  const handleStep = () => {
    const arr = [...array];
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i + 1]) {
        setActiveIndices([i, i + 1]);
        const temp = arr[i];
        arr[i] = arr[i + 1];
        arr[i + 1] = temp;
        setArray(arr);
        setStepCount((s) => s + 1);
        return;
      }
    }
    setActiveIndices(null);
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)]">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-4 font-mono">
          <span>Menyusun Barisan Angka dari Kecil ke Besar</span>
          <span className="font-bold text-[var(--color-text)]">Langkah ke-{stepCount}</span>
        </div>

        <div className="h-32 flex items-end justify-center gap-2 px-2 pb-2">
          {array.map((val, idx) => {
            const isComparing = activeIndices && (activeIndices[0] === idx || activeIndices[1] === idx);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 max-w-[32px]">
                <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">{val}</span>
                <div
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    isComparing ? 'bg-[#BA8230]' : 'bg-[var(--color-secondary)]/80'
                  }`}
                  style={{ height: `${val}px` }}
                />
                <span className="text-[9px] font-mono text-[var(--color-text-secondary)] opacity-60">
                  #{idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] flex items-center gap-1.5 cursor-pointer min-h-[40px] transition-colors"
        >
          <IconRotateCcw size={13} />
          <span>Acak Ulang</span>
        </button>

        <button
          type="button"
          onClick={handleStep}
          className="px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] font-heading text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs min-h-[40px] active:scale-[0.98] transition-all dark:bg-[#F1F5F9] dark:text-[#0C0E12]"
        >
          <span>Tukar Satu Angka</span>
          <IconArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. HARGA PASAR (KESEIMBANGAN JUAL & BELI)
// ─────────────────────────────────────────────────────────────────────────────
function MarketShowcase() {
  const [demandShift, setDemandShift] = useState<number>(50);
  const qStar = Math.round(35 + demandShift * 0.4);
  const pStar = Math.round(25 + qStar * 0.8);

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)]">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-2 font-mono">
          <span>Titik Temu Penjual & Pembeli</span>
          <span className="font-bold text-[var(--color-secondary)]">
            Harga Terbentuk: Rp{pStar}.000
          </span>
        </div>

        <div className="h-36 w-full flex items-center justify-center">
          <svg viewBox="0 0 320 140" className="w-full h-full overflow-visible">
            <line x1="30" y1="120" x2="300" y2="120" stroke="var(--color-border)" strokeWidth="1" />
            <line x1="30" y1="10" x2="30" y2="120" stroke="var(--color-border)" strokeWidth="1" />

            <line x1="40" y1="110" x2="280" y2="20" stroke="#4B8F8C" strokeWidth="2.5" />
            <text x="285" y="25" fill="#4B8F8C" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
              Penjual
            </text>

            <line
              x1={40 + demandShift * 0.4}
              y1="20"
              x2={280 + demandShift * 0.4}
              y2="110"
              stroke="#BA8230"
              strokeWidth="2.5"
              className="transition-all duration-200"
            />
            <text
              x={240 + demandShift * 0.4}
              y="118"
              fill="#BA8230"
              fontSize="10"
              fontFamily="sans-serif"
              fontWeight="bold"
              className="transition-all duration-200"
            >
              Pembeli
            </text>

            <circle
              cx={80 + qStar * 2.2}
              cy={120 - pStar * 1.3}
              r="5"
              fill="var(--color-text)"
              stroke="var(--color-secondary)"
              strokeWidth="2"
              className="transition-all duration-200"
            />
          </svg>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1">
          <span>Jumlah Orang yang Ingin Membeli:</span>
          <span className="font-bold text-[#BA8230] font-mono">{demandShift}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="90"
          step="5"
          value={demandShift}
          onChange={(e) => setDemandShift(Number(e.target.value))}
          aria-label="Minat Pembeli"
          className="w-full cursor-pointer accent-[#BA8230] min-h-[36px]"
        />
      </div>
    </div>
  );
}
