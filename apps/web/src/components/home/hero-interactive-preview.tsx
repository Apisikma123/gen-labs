'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { animate } from 'animejs';
import {
  IconPlay,
  IconPause,
  IconRotateCcw,
  IconArrowRight,
} from '@/components/icons';

export type ConceptKey = 'newton' | 'function' | 'sorting' | 'market';

interface HeroInteractivePreviewProps {
  activeConcept: ConceptKey;
  onConceptChange: (concept: ConceptKey) => void;
}

export function HeroInteractivePreview({
  activeConcept,
  onConceptChange,
}: HeroInteractivePreviewProps) {
  return (
    <div className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-6 transition-colors shadow-xs">
      {/* Concept Switcher Tabs */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)] gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] font-mono text-xs">
          {[
            { id: 'newton', label: 'Hukum Newton' },
            { id: 'function', label: 'Fungsi Kuadrat' },
            { id: 'sorting', label: 'Algoritma Sorting' },
            { id: 'market', label: 'Supply & Demand' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onConceptChange(item.id as ConceptKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                activeConcept === item.id
                  ? 'bg-[var(--color-primary)] text-white shadow-xs dark:bg-[#F1F5F9] dark:text-[#0C0E12]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <Link
          href={
            activeConcept === 'newton'
              ? '/simulation/newtons-second-law'
              : activeConcept === 'function'
              ? '/simulation/function-explorer'
              : activeConcept === 'sorting'
              ? '/simulation/sorting-algorithms'
              : '/simulation/supply-demand'
          }
          className="hidden sm:inline-flex items-center gap-1 text-xs font-mono font-semibold text-[var(--color-secondary)] hover:underline whitespace-nowrap"
        >
          <span>Modul Penuh</span>
          <IconArrowRight size={12} />
        </Link>
      </div>

      {/* Active Concept Preview */}
      <div className="mt-4">
        {activeConcept === 'newton' && <NewtonHeroPreview />}
        {activeConcept === 'function' && <FunctionHeroPreview />}
        {activeConcept === 'sorting' && <SortingHeroPreview />}
        {activeConcept === 'market' && <MarketHeroPreview />}
      </div>
    </div>
  );
}

// ── 1. NEWTON KINEMATICS PREVIEW ──
function NewtonHeroPreview() {
  const [force, setForce] = useState<number>(40);
  const [mass, setMass] = useState<number>(4);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState({ time: 0, velocity: 0, distance: 0 });

  const gliderRef = useRef<HTMLDivElement>(null);
  const vectorVRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<any>(null);

  const accel = Number((force / mass).toFixed(2));

  const runAnimation = () => {
    if (isRunning || !gliderRef.current) return;
    setIsRunning(true);

    const trackWidth = 320;
    const duration = Math.max(900, Math.min(2200, Math.round(2000 / Math.sqrt(accel))));

    gliderRef.current.style.transform = 'translateX(0px)';
    if (vectorVRef.current) vectorVRef.current.style.width = '0px';

    const obj = { x: 0, t: 0 };
    animRef.current = animate(obj, {
      x: trackWidth,
      t: duration / 1000,
      duration,
      ease: 'inQuad',
      onUpdate: () => {
        if (gliderRef.current) {
          gliderRef.current.style.transform = `translateX(${obj.x}px)`;
        }
        const currentSpeed = (accel * obj.t).toFixed(1);
        if (vectorVRef.current) {
          vectorVRef.current.style.width = `${Math.min(70, Math.round(Number(currentSpeed) * 3))}px`;
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

  const resetAnimation = () => {
    if (animRef.current) animRef.current.pause();
    setIsRunning(false);
    if (gliderRef.current) gliderRef.current.style.transform = 'translateX(0px)';
    if (vectorVRef.current) vectorVRef.current.style.width = '0px';
    setTelemetry({ time: 0, velocity: 0, distance: 0 });
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* 2D Canvas Track Area */}
      <div className="p-4 sm:p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-[var(--color-text-secondary)] mb-6">
          <span>Rel Linear Gesekan Nol (μ = 0)</span>
          <span className="font-bold text-[var(--color-text)]">a = F / m = {accel} m/s²</span>
        </div>

        {/* Linear Track Rail */}
        <div className="relative py-6">
          <div className="w-full h-1.5 bg-[var(--color-border)] rounded-sm relative">
            {/* Metric markers */}
            <div className="absolute -bottom-4 inset-x-0 flex justify-between text-[10px] text-[var(--color-text-secondary)]">
              <span>0m</span>
              <span>2.5m</span>
              <span>5.0m</span>
              <span>7.5m</span>
              <span>10.0m</span>
            </div>

            {/* Glider Block */}
            <div
              ref={gliderRef}
              className="absolute -top-5 left-0 w-16 h-9 rounded-md bg-[var(--color-surface)] border-2 border-[var(--color-secondary)] flex items-center justify-center font-bold text-[var(--color-text)] shadow-xs transition-transform ease-linear"
              style={{ transform: 'translateX(0px)' }}
            >
              <span>{mass} kg</span>

              {/* Force Vector (Warm Ochre) */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 flex items-center">
                <div
                  className="h-0.5 bg-[#BA8230] transition-all"
                  style={{ width: `${Math.round(force * 0.75)}px` }}
                />
                <div className="w-0 h-0 border-y-3 border-y-transparent border-l-[6px] border-l-[#BA8230]" />
                <span className="text-[10px] text-[#BA8230] font-bold ml-1">F: {force}N</span>
              </div>

              {/* Velocity Vector (Phosphor Sage) */}
              <div className="absolute left-full top-1/2 translate-y-2 flex items-center">
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
      </div>

      {/* Controls & Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Sliders */}
        <div className="sm:col-span-7 space-y-3">
          <div>
            <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1">
              <span>Gaya Tarik (F):</span>
              <span className="font-bold text-[#BA8230]">{force} N</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              step="5"
              value={force}
              disabled={isRunning}
              onChange={(e) => setForce(Number(e.target.value))}
              aria-label="Gaya Tarik"
              className="w-full cursor-pointer accent-[#BA8230] min-h-[36px]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1">
              <span>Massa Beban (m):</span>
              <div className="flex items-center gap-1">
                {[2, 4, 8].map((m) => (
                  <button
                    key={m}
                    type="button"
                    disabled={isRunning}
                    onClick={() => setMass(m)}
                    className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all cursor-pointer min-h-[30px] ${
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
        </div>

        {/* Telemetry numbers */}
        <div className="sm:col-span-5 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] space-y-1.5 text-xs">
          <div className="flex justify-between text-[var(--color-text-secondary)]">
            <span>Waktu:</span>
            <span className="font-bold text-[var(--color-text)] tabular-nums">{telemetry.time.toFixed(2)}s</span>
          </div>
          <div className="flex justify-between text-[var(--color-text-secondary)]">
            <span>Kecepatan (v):</span>
            <span className="font-bold text-[var(--color-secondary)] tabular-nums">{telemetry.velocity.toFixed(1)} m/s</span>
          </div>
          <div className="flex justify-between text-[var(--color-text-secondary)]">
            <span>Jarak Tempuh:</span>
            <span className="font-bold text-[var(--color-text)] tabular-nums">{telemetry.distance.toFixed(1)} m</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={resetAnimation}
          className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] flex items-center gap-1.5 cursor-pointer min-h-[38px]"
        >
          <IconRotateCcw size={13} />
          <span>Atur Ulang</span>
        </button>

        <button
          type="button"
          disabled={isRunning}
          onClick={runAnimation}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] font-heading text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs min-h-[38px] active:scale-[0.98] disabled:opacity-50 dark:bg-[#F1F5F9] dark:text-[#0C0E12]"
        >
          <IconPlay size={13} />
          <span>{isRunning ? 'Berjalan...' : 'Luncurkan Glider'}</span>
        </button>
      </div>
    </div>
  );
}

// ── 2. QUADRATIC FUNCTION PARABOLA PREVIEW ──
function FunctionHeroPreview() {
  const [a, setA] = useState<number>(0.02);
  const [c, setC] = useState<number>(30);

  // Parabola vertex: (0, c). SVG canvas is 320x140, center is x=160, ground y=120
  const points = [];
  for (let x = -140; x <= 140; x += 10) {
    const y = 110 - (a * x * x + c * 0.5);
    points.push(`${160 + x},${Math.max(10, Math.min(130, y))}`);
  }
  const pathD = `M ${points.join(' L ')}`;

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] relative overflow-hidden">
        <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)] mb-2">
          <span>Persamaan Parabola: f(x) = ax² + c</span>
          <span className="font-bold text-[var(--color-secondary)]">a = {a > 0 ? `+${a}` : a}</span>
        </div>

        {/* 2D Coordinate Grid & Curve */}
        <div className="h-36 w-full flex items-center justify-center">
          <svg viewBox="0 0 320 140" className="w-full h-full overflow-visible">
            {/* Axis Lines */}
            <line x1="20" y1="110" x2="300" y2="110" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="160" y1="10" x2="160" y2="130" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" />

            {/* Parabola Curve */}
            <path d={pathD} fill="none" stroke="#4B8F8C" strokeWidth="2.5" />

            {/* Vertex Point */}
            <rect x="156" y={106 - c * 0.5} width="8" height="8" fill="#BA8230" rx="1" />
            <text x="170" y={112 - c * 0.5} fill="var(--color-text)" fontSize="10" fontFamily="monospace">
              Puncak (0, {c})
            </text>
          </svg>
        </div>
      </div>

      {/* Control Sliders */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1">
            <span>Kelengkungan Kurva (a):</span>
            <span className="font-bold text-[var(--color-secondary)]">{a}</span>
          </div>
          <input
            type="range"
            min="-0.04"
            max="0.04"
            step="0.01"
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            aria-label="Koefisien a"
            className="w-full cursor-pointer accent-[var(--color-secondary)] min-h-[36px]"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1">
            <span>Konstanta Vertikal (c):</span>
            <span className="font-bold text-[var(--color-text)]">{c}</span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={c}
            onChange={(e) => setC(Number(e.target.value))}
            aria-label="Konstanta c"
            className="w-full cursor-pointer accent-[#BA8230] min-h-[36px]"
          />
        </div>
      </div>
    </div>
  );
}

// ── 3. SORTING ALGORITHM PREVIEW ──
function SortingHeroPreview() {
  const [array, setArray] = useState<number[]>([45, 18, 72, 33, 89, 56, 12, 60]);
  const [activeIndices, setActiveIndices] = useState<[number, number] | null>(null);
  const [stepCount, setStepCount] = useState<number>(0);

  const resetArray = () => {
    setArray([45, 18, 72, 33, 89, 56, 12, 60]);
    setActiveIndices(null);
    setStepCount(0);
  };

  const stepSort = () => {
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
    <div className="space-y-4 font-mono text-xs">
      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)]">
        <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)] mb-4">
          <span>Visualisasi Langkah Pengurutan Array</span>
          <span className="font-bold text-[var(--color-text)]">Langkah: {stepCount}</span>
        </div>

        {/* Array Bars */}
        <div className="h-32 flex items-end justify-center gap-2 px-2 pb-2">
          {array.map((val, idx) => {
            const isComparing = activeIndices && (activeIndices[0] === idx || activeIndices[1] === idx);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 max-w-[32px]">
                <span className="text-[10px] text-[var(--color-text-secondary)]">{val}</span>
                <div
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    isComparing
                      ? 'bg-[#BA8230]'
                      : 'bg-[var(--color-secondary)]/80'
                  }`}
                  style={{ height: `${val}px` }}
                />
                <span className="text-[9px] text-[var(--color-text-secondary)] opacity-60">[{idx}]</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={resetArray}
          className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] flex items-center gap-1.5 cursor-pointer min-h-[38px]"
        >
          <IconRotateCcw size={13} />
          <span>Acak Ulang</span>
        </button>

        <button
          type="button"
          onClick={stepSort}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] font-heading text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs min-h-[38px] dark:bg-[#F1F5F9] dark:text-[#0C0E12]"
        >
          <span>Satu Langkah Sortir</span>
          <IconArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ── 4. SUPPLY & DEMAND MARKET PREVIEW ──
function MarketHeroPreview() {
  const [demandShift, setDemandShift] = useState<number>(50);

  // Equilibrium math: Demand P = (100 + demandShift) - Q, Supply P = 20 + Q
  // 100 + S - Q = 20 + Q => 2Q = 80 + S => Q* = 40 + S/2, P* = 20 + Q*
  const qStar = Math.round(40 + demandShift * 0.5);
  const pStar = Math.round(20 + qStar);

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)]">
        <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)] mb-2">
          <span>Keseimbangan Pasar (Permintaan & Penawaran)</span>
          <span className="font-bold text-[var(--color-secondary)]">
            Titik Keseimbangan: Harga = Rp{pStar}rb, Jumlah = {qStar} unit
          </span>
        </div>

        {/* 2D Supply & Demand Cross Lines */}
        <div className="h-36 w-full flex items-center justify-center">
          <svg viewBox="0 0 300 140" className="w-full h-full overflow-visible">
            {/* Coordinate Axes */}
            <line x1="30" y1="120" x2="280" y2="120" stroke="var(--color-border)" strokeWidth="1.5" />
            <line x1="30" y1="10" x2="30" y2="120" stroke="var(--color-border)" strokeWidth="1.5" />

            <text x="285" y="124" fill="var(--color-text-secondary)" fontSize="9" fontFamily="monospace">Q</text>
            <text x="24" y="14" fill="var(--color-text-secondary)" fontSize="9" fontFamily="monospace">P</text>

            {/* Supply Line (Fixed slope upward) */}
            <line x1="40" y1="100" x2="260" y2="20" stroke="#BA8230" strokeWidth="2" />
            <text x="264" y="24" fill="#BA8230" fontSize="9" fontWeight="bold" fontFamily="monospace">S</text>

            {/* Demand Line (Shifts right/left) */}
            <line
              x1={30 + demandShift * 0.4}
              y1="20"
              x2={210 + demandShift * 0.5}
              y2="110"
              stroke="#4B8F8C"
              strokeWidth="2"
            />
            <text
              x={214 + demandShift * 0.5}
              y="114"
              fill="#4B8F8C"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
            >
              D
            </text>

            {/* Equilibrium Intersection Marker */}
            <rect
              x={30 + qStar * 2.2 - 4}
              y={120 - pStar * 1.1 - 4}
              width="8"
              height="8"
              fill="var(--color-text)"
              rx="1"
            />
          </svg>
        </div>
      </div>

      {/* Demand Slider */}
      <div>
        <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1">
          <span>Pergeseran Kurva Permintaan (Demand):</span>
          <span className="font-bold text-[var(--color-secondary)]">+{demandShift}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="80"
          step="5"
          value={demandShift}
          onChange={(e) => setDemandShift(Number(e.target.value))}
          aria-label="Pergeseran Permintaan"
          className="w-full cursor-pointer accent-[var(--color-secondary)] min-h-[36px]"
        />
      </div>
    </div>
  );
}
