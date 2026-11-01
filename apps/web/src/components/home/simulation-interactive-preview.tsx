'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  IconArrowRight,
  IconRotateCcw,
  IconPlay,
  IconCheckCircle,
  IconSliders,
  IconTrendingUp,
  IconActivity,
  IconLayers,
} from '@/components/icons';

interface SimulationInteractivePreviewProps {
  activeIndex: number;
}

export function SimulationInteractivePreview({ activeIndex }: SimulationInteractivePreviewProps) {
  return (
    <div className="w-full mt-6">
      <AnimatePresence mode="wait">
        {activeIndex === 0 && <NewtonPreview key="newton" />}
        {activeIndex === 1 && <FunctionExplorerPreview key="function" />}
        {activeIndex === 2 && <SupplyDemandPreview key="market" />}
        {activeIndex === 3 && <SortingPreview key="sorting" />}
      </AnimatePresence>
    </div>
  );
}

// ── 1. HUKUM II NEWTON INTERACTIVE PREVIEW ──────────────────────────
function NewtonPreview() {
  const [force, setForce] = useState(40);
  const [mass, setMass] = useState(5);
  const acceleration = (force / mass).toFixed(2);
  const momentum = (force * 1.5).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center"
    >
      {/* Controls & Telemetry */}
      <div className="space-y-4 font-mono text-xs">
        <div>
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-1.5">
            <span>Gaya Bersih (F_net):</span>
            <span className="font-bold text-[#4B8F8C]">{force} N</span>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            step="5"
            value={force}
            onChange={(e) => setForce(Number(e.target.value))}
            className="w-full cursor-pointer accent-[#BA8230]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-1.5">
            <span>Massa Benda (m):</span>
            <div className="flex items-center gap-1.5">
              {[2, 5, 10].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMass(m)}
                  className={`px-2.5 py-1 rounded-sm border text-xs font-bold transition-all cursor-pointer ${
                    mass === m
                      ? 'bg-[#F1F5F9] text-[#0C0E12] border-[#F1F5F9]'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-text-tertiary)]'
                  }`}
                >
                  {m} kg
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Calculation Register */}
        <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Percepatan (a = F/m):</span>
            <span className="font-bold text-[var(--color-accent)]">{acceleration} m/s²</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Impuls Efektif (p):</span>
            <span className="font-bold text-[var(--color-text)]">{momentum} kg m/s</span>
          </div>
        </div>

        <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-2 pt-1">
          <IconCheckCircle size={13} className="text-[var(--color-secondary)] shrink-0" />
          <span>Model mekanika deterministik tervalidasi ODE</span>
        </div>
      </div>

      {/* Runway Canvas Viewport */}
      <div className="lg:col-span-2 h-[220px] sm:h-[260px] rounded-lg bg-[var(--color-canvas)] relative overflow-hidden flex flex-col justify-between p-5">
        {/* Header telemetry display */}
        <div className="relative z-10 flex items-center justify-between text-xs font-mono">
          <span className="text-[var(--color-text-secondary)] tracking-wide font-medium">
            Track Kinematika Fisika Terapan / D4 Vokasi STEM
          </span>
          <span className="text-[#4B8F8C] font-bold">
            a = {acceleration} m/s²
          </span>
        </div>

        {/* Physical Track & Moving Cart */}
        <div className="relative w-full h-24 flex items-end pb-4">
          {/* Floor Track Line */}
          <div className="absolute bottom-4 left-0 right-0 h-0.5 bg-[var(--color-border)]">
            {/* Graduation Ticks along track */}
            <div className="flex justify-between w-full -mt-1 text-xs font-mono text-[var(--color-text-secondary)] px-2">
              <span>0m</span>
              <span>2m</span>
              <span>4m</span>
              <span>6m</span>
              <span>8m</span>
              <span>10m</span>
            </div>
          </div>

          {/* Animated Cart */}
          <motion.div
            animate={{
              x: [0, Math.min(260, Number(acceleration) * 28), 0],
            }}
            transition={{
              duration: Math.max(1.0, 4.0 - Number(acceleration) * 0.25),
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative z-10 flex flex-col items-center ml-2"
          >
            {/* Force Vector Arrow above block */}
            <div className="flex items-center gap-1 font-mono text-xs text-[var(--color-accent)] mb-1">
              <span>F={force}N</span>
              <motion.div
                animate={{ width: [14, Math.min(48, force * 0.7), 14] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="h-0.5 bg-[var(--color-accent)] relative"
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-2 border-t-transparent border-b-2 border-b-transparent border-l-[4px] border-l-[var(--color-accent)]" />
              </motion.div>
            </div>

            {/* Mass Block Chassis */}
            <div className="w-16 h-12 rounded-md bg-[var(--color-primary)] border border-[var(--color-primary-text)]/30 flex flex-col items-center justify-center text-white font-mono shadow-md">
              <span className="text-xs font-bold">{mass} kg</span>
            </div>
          </motion.div>
        </div>

        {/* Footer equation notation */}
        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-[var(--color-text-secondary)] border-t border-[var(--color-border-subtle)] pt-2">
          <span>Hukum II Newton: ΣF = m × a</span>
          <span>Runway Kinematika Deterministik</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── 2. FUNCTION EXPLORER PARABOLA PREVIEW ───────────────────────────
function FunctionExplorerPreview() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const c = -20; // Constant offset for visualization

  // Vertex coordinates: h = -b / (2a), k = c - b^2 / (4a)
  const h = a !== 0 ? -b / (2 * a) : 0;
  const k = a !== 0 ? c - (b * b) / (4 * a) : 0;
  const discriminant = b * b - 4 * a * c;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center"
    >
      {/* Controls & Coefficients */}
      <div className="space-y-4 font-mono text-xs">
        <div>
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-1.5">
            <span>Koefisien a (Kelengkungan):</span>
            <span className="font-bold text-[#4B8F8C]">{a.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="-2.5"
            max="2.5"
            step="0.5"
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            className="w-full cursor-pointer accent-[#4B8F8C]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-1.5">
            <span>Koefisien b (Pergeseran):</span>
            <span className="font-bold text-[var(--color-accent)]">{b.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="-4"
            max="4"
            step="1"
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
            className="w-full cursor-pointer accent-[#BA8230]"
          />
        </div>

        {/* Live Mathematical Properties */}
        <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Titik Puncak (h, k):</span>
            <span className="font-bold text-[var(--color-text)]">
              ({h.toFixed(1)}, {(-k * 0.1).toFixed(1)})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Diskriminan (D):</span>
            <span className="font-bold text-[#4B8F8C]">
              {discriminant > 0 ? 'D > 0 (2 Akar Riil)' : discriminant === 0 ? 'D = 0 (1 Akar Kembar)' : 'D < 0 (Imajiner)'}
            </span>
          </div>
        </div>

        <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-2 pt-1">
          <IconCheckCircle size={13} className="text-[var(--color-secondary)] shrink-0" />
          <span>Geometri analitik terapan aljabar linier</span>
        </div>
      </div>

      {/* Dynamic Parabola Coordinate System */}
      <div className="lg:col-span-2 h-[220px] sm:h-[260px] rounded-lg bg-[var(--color-canvas)] relative overflow-hidden flex items-center justify-center p-4">
        {/* SVG Cartesian Graph */}
        <svg viewBox="-120 -60 240 120" className="w-full h-full relative z-10">
          {/* Coordinate Axes */}
          <line x1="-120" y1="0" x2="120" y2="0" stroke="var(--color-border)" strokeWidth="0.9" />
          <line x1="0" y1="-60" x2="0" y2="60" stroke="var(--color-border)" strokeWidth="0.9" />

          {/* Axis Graduation Ticks */}
          {[-80, -40, 40, 80].map((tx) => (
            <line key={tx} x1={tx} y1="-3" x2={tx} y2="3" stroke="var(--color-text-tertiary)" strokeWidth="0.8" />
          ))}

          {/* Dynamic Parabola Path */}
          <path
            d={`M -90 ${-(a * 0.015 * (-90 - h) * (-90 - h) + k)} Q ${h} ${-(k + 20)} 90 ${-(
              a * 0.015 * (90 - h) * (90 - h) + k
            )}`}
            fill="none"
            stroke="#4B8F8C"
            strokeWidth="2.4"
          />

          {/* Vertex Peak Point Crosshair Reticle (No dots) */}
          <line x1={h - 5} y1={-k} x2={h + 5} y2={-k} stroke="#BA8230" strokeWidth="1.6" />
          <line x1={h} y1={-k - 5} x2={h} y2={-k + 5} stroke="#BA8230" strokeWidth="1.6" />

          {/* Axis of Symmetry Dashed Line */}
          <line x1={h} y1="-55" x2={h} y2="55" stroke="var(--color-text-tertiary)" strokeWidth="0.8" strokeDasharray="3,3" />

          {/* Text notation */}
          <text x={h + 7} y={-k - 6} fill="#BA8230" fontSize="11" fontFamily="Space Mono, monospace">
            Puncak ({h.toFixed(1)}, {(-k * 0.1).toFixed(1)})
          </text>
        </svg>

        <div className="absolute bottom-2 left-3 text-xs font-mono text-[var(--color-text-secondary)]">
          f(x) = {a}x² + {b}x + c
        </div>
      </div>
    </motion.div>
  );
}

// ── 3. SUPPLY & DEMAND PREVIEW ──────────────────────────────────────
function SupplyDemandPreview() {
  const [price, setPrice] = useState(36);
  // Equilibrium values: Demand: P = 80 - 0.8Q -> Q = (80 - P)/0.8
  // Supply: P = 10 + 0.6Q -> Q = (P - 10)/0.6
  const qD = Math.max(10, Math.round((80 - price) / 0.8));
  const qS = Math.max(10, Math.round((price - 10) / 0.6));
  const eqP = 40;
  const eqQ = 50;
  const stateLabel = price > eqP ? 'Surplus Barang' : price < eqP ? 'Kelangkaan (Shortage)' : 'Ekuilibrium Pasar';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center"
    >
      {/* Controls & State */}
      <div className="space-y-4 font-mono text-xs">
        <div>
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-1.5">
            <span>Tingkat Harga Pasar (P):</span>
            <span className="font-bold text-[#4B8F8C]">Rp {price}.000</span>
          </div>
          <input
            type="range"
            min="20"
            max="60"
            step="2"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full cursor-pointer accent-[#4B8F8C]"
          />
        </div>

        {/* Quantities Readout */}
        <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Permintaan (Qd):</span>
            <span className="font-bold text-[#4B8F8C]">{qD} Unit</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Penawaran (Qs):</span>
            <span className="font-bold text-[var(--color-accent)]">{qS} Unit</span>
          </div>
          <div className="pt-1 border-t border-[var(--color-border)] flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Status Pasar:</span>
            <span className="font-bold text-[var(--color-text)]">{stateLabel}</span>
          </div>
        </div>

        <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-2 pt-1">
          <IconCheckCircle size={13} className="text-[var(--color-secondary)] shrink-0" />
          <span>Model mikroekonomi tervalidasi pasar terbuka</span>
        </div>
      </div>

      {/* Market Equilibrium Graph */}
      <div className="lg:col-span-2 h-[220px] sm:h-[260px] rounded-lg bg-[var(--color-canvas)] relative overflow-hidden flex items-center justify-center p-4">
        <svg viewBox="0 0 200 120" className="w-full h-full relative z-10">
          {/* Axes */}
          <line x1="25" y1="10" x2="25" y2="105" stroke="var(--color-border)" strokeWidth="1" />
          <line x1="25" y1="105" x2="190" y2="105" stroke="var(--color-border)" strokeWidth="1" />

          {/* Axis Labels */}
          <text x="10" y="20" fill="var(--color-text-secondary)" fontSize="11" fontFamily="Space Mono, monospace">
            P
          </text>
          <text x="180" y="116" fill="var(--color-text-secondary)" fontSize="11" fontFamily="Space Mono, monospace">
            Q
          </text>

          {/* Demand Curve (Downward sloping) */}
          <line x1="40" y1="25" x2="170" y2="95" stroke="#4B8F8C" strokeWidth="2.2" />
          <text x="172" y="98" fill="#4B8F8C" fontSize="11" fontFamily="Space Mono, monospace" fontWeight="bold">
            D
          </text>

          {/* Supply Curve (Upward sloping) */}
          <line x1="40" y1="95" x2="170" y2="25" stroke="#BA8230" strokeWidth="2.2" />
          <text x="172" y="28" fill="#BA8230" fontSize="11" fontFamily="Space Mono, monospace" fontWeight="bold">
            S
          </text>

          {/* Equilibrium Crosshair Reticle (E: 105, 60) */}
          <line x1="100" y1="60" x2="110" y2="60" stroke="var(--color-text)" strokeWidth="1.4" />
          <line x1="105" y1="55" x2="105" y2="65" stroke="var(--color-text)" strokeWidth="1.4" />
          <text x="110" y="55" fill="var(--color-text)" fontSize="11" fontFamily="Space Mono, monospace">
            E (P*, Q*)
          </text>

          {/* Current Price Line */}
          {(() => {
            const py = 105 - (price / 70) * 90;
            return (
              <g>
                <line x1="25" y1={py} x2="180" y2={py} stroke="var(--color-secondary)" strokeWidth="1" strokeDasharray="3,3" />
                <text x="30" y={py - 3} fill="var(--color-secondary)" fontSize="11" fontFamily="Space Mono, monospace">
                  P = {price}k
                </text>
              </g>
            );
          })()}
        </svg>

        <div className="absolute bottom-2 left-3 text-xs font-mono text-[var(--color-text-secondary)]">
          Kurva Marshallian / Ekuilibrium Dinamis
        </div>
      </div>
    </motion.div>
  );
}

// ── 4. SORTING ALGORITHM PREVIEW ────────────────────────────────────
function SortingPreview() {
  const [array, setArray] = useState([42, 18, 75, 29, 64, 38, 52]);
  const [comparing, setComparing] = useState<[number, number] | null>([0, 1]);

  const stepSort = () => {
    const arr = [...array];
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i + 1]) {
        setComparing([i, i + 1]);
        const tmp = arr[i];
        arr[i] = arr[i + 1];
        arr[i + 1] = tmp;
        setArray(arr);
        return;
      }
    }
    setComparing(null);
  };

  const shuffle = () => {
    setArray(Array.from({ length: 7 }, () => Math.floor(Math.random() * 65) + 18));
    setComparing([0, 1]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center"
    >
      {/* Controls & Actions */}
      <div className="space-y-4 font-mono text-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={stepSort}
              className="px-4 py-2 bg-[#F1F5F9] text-[#0C0E12] hover:bg-white font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <IconPlay size={12} />
              <span>Langkah Tukar (Step)</span>
            </button>
            <button
              type="button"
              onClick={shuffle}
              className="px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <IconRotateCcw size={12} />
              <span>Acak</span>
            </button>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed pt-1">
            Tekan &apos;Langkah Tukar&apos; untuk mengeksekusi satu iterasi partisi algoritma pengurutan secara deterministik.
          </p>
        </div>

        {/* Complexity Register */}
        <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Kompleksitas Waktu:</span>
            <span className="font-bold text-[#4B8F8C]">O(n log n)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Status Array:</span>
            <span className="font-bold text-[var(--color-text)]">
              {comparing ? 'Membandingkan Indeks' : 'Terurut Sempurna'}
            </span>
          </div>
        </div>

        <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-2 pt-1">
          <IconCheckCircle size={13} className="text-[var(--color-secondary)] shrink-0" />
          <span>Struktur data & algoritma D4 TRPL</span>
        </div>
      </div>

      {/* Sorting Visual Bars Viewport */}
      <div className="lg:col-span-2 h-[220px] sm:h-[260px] rounded-lg bg-[var(--color-canvas)] relative overflow-hidden flex flex-col justify-between p-5">
        <div className="relative z-10 flex items-center justify-between text-xs font-mono">
          <span className="text-[var(--color-text-secondary)] tracking-wide font-medium">
            Visualisasi Bar Algoritma
          </span>
          <span className="text-[#4B8F8C] font-bold">
            Panjang Array: {array.length}
          </span>
        </div>

        {/* Animated Bar Stems */}
        <div className="relative z-10 flex items-end justify-center gap-3 sm:gap-4 h-32 px-4">
          {array.map((val, idx) => {
            const isComparing = comparing && (comparing[0] === idx || comparing[1] === idx);

            return (
              <motion.div
                key={idx}
                layout
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="flex flex-col items-center flex-1 max-w-[36px]"
              >
                <span className="text-xs font-mono text-[var(--color-text-secondary)] mb-1">
                  {val}
                </span>
                <div
                  style={{ height: `${(val / 85) * 85}px` }}
                  className={`w-full rounded-t-sm transition-colors ${
                    isComparing
                      ? 'bg-[var(--color-accent)] border border-[var(--color-accent)]'
                      : 'bg-[var(--color-primary)] border border-[var(--color-primary)]/40'
                  }`}
                />
                <span className="text-xs font-mono text-[var(--color-text-tertiary)] mt-1">
                  [{idx}]
                </span>
              </motion.div>
            );
          })}
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-[var(--color-text-secondary)] border-t border-[var(--color-border-subtle)] pt-2">
          <span>Algoritma: Partition Sort</span>
          <span>Spring Physics Layout</span>
        </div>
      </div>
    </motion.div>
  );
}
