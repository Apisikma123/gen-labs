'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  IconPlay,
  IconPause,
  IconRotateCcw,
  IconArrowRight,
} from '@/components/icons';
import Link from 'next/link';
import { newtonsSecondLaw } from '@genlab/simulation-core';
import { useTheme } from '@/components/theme-provider';
import { Icon3dPhysicsEnergy } from '@/components/icons/3d';

export interface PrecisionHeroApparatusProps {
  scrubProgress?: number;
  scrollDriven?: boolean;
}

export function PrecisionHeroApparatus({ scrubProgress, scrollDriven = false }: PrecisionHeroApparatusProps = {}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [force, setForce] = useState<number>(40); // N
  const [mass, setMass] = useState<number>(4); // kg
  const [friction, setFriction] = useState<number>(0); // μ
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simMotion, setSimMotion] = useState({ t: 0, x: 0, v: 0 });
  const simTime = simMotion.t;
  const distance = simMotion.x;
  const velocity = simMotion.v;

  const containerRef = useRef<HTMLDivElement>(null);
  const reqIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Compute instantaneous physics from official core engine
  const computed = newtonsSecondLaw.compute({ mass, force, friction });
  const accel = Number(computed.acceleration) || 0;
  const netForce = Number(computed.netForce) || 0;
  const normalForce = mass * 9.81;

  // Max track distance in meters
  const trackLimitM = 10;

  // Reset simulation
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    reqIdRef.current = null;
    lastTimeRef.current = null;
    setSimMotion({ t: 0, x: 0, v: 0 });
  }, []);

  // Synchronize state continuously when scrollDriven is active
  useEffect(() => {
    if (scrollDriven && scrubProgress !== undefined && !isPlaying) {
      const a = accel > 0 ? accel : 10;
      const tMax = Math.sqrt((2 * trackLimitM) / a);
      const clampedP = Math.max(0, Math.min(1, scrubProgress));
      const t = clampedP * tMax;
      const x = Math.min(trackLimitM, 0.5 * a * t * t);
      const v = Math.min(trackLimitM * 2, a * t);
      setSimMotion({ t, x, v });
    }
  }, [scrollDriven, scrubProgress, accel, trackLimitM, isPlaying]);

  // Run simulation frame loop with visibility & intersection checks
  useEffect(() => {
    if (!isPlaying) {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      lastTimeRef.current = null;
      return;
    }

    const container = containerRef.current;
    let isVisible = false;
    let io: IntersectionObserver | null = null;

    const loop = (timestamp: number) => {
      if (!isVisible || (typeof document !== 'undefined' && document.hidden)) {
        lastTimeRef.current = null;
        return;
      }

      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min(0.05, (timestamp - lastTimeRef.current) / 1000);
      lastTimeRef.current = timestamp;

      setSimMotion((prev) => {
        const nextT = prev.t + dt;
        const nextX = Math.min(trackLimitM, 0.5 * accel * nextT * nextT);
        const nextV = accel * nextT;

        if (nextX >= trackLimitM) {
          setIsPlaying(false);
        }
        return { t: nextT, x: nextX, v: nextV };
      });

      reqIdRef.current = requestAnimationFrame(loop);
    };

    if (typeof IntersectionObserver !== 'undefined' && container) {
      io = new IntersectionObserver(
        (entries) => {
          const nowVisible = entries[0]?.isIntersecting ?? false;
          if (nowVisible && !isVisible) {
            isVisible = true;
            lastTimeRef.current = null;
            reqIdRef.current = requestAnimationFrame(loop);
          } else if (!nowVisible && isVisible) {
            isVisible = false;
            lastTimeRef.current = null;
            if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
          }
        },
        { threshold: 0.05 }
      );
      io.observe(container);
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        lastTimeRef.current = null;
        if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      } else if (isVisible) {
        lastTimeRef.current = null;
        reqIdRef.current = requestAnimationFrame(loop);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (io) io.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    };
  }, [isPlaying, accel]);

  // SVG dimensions & coordinate scale
  const canvasW = 920;
  const canvasH = 260;
  const groundY = 190;
  const trackStart = 80;
  const trackEnd = 840;
  const trackUsableW = trackEnd - trackStart;
  const pxPerMeter = trackUsableW / trackLimitM;

  // Cart dimensions
  const cartW = 100;
  const cartH = 46;
  const cartX = trackStart + distance * pxPerMeter - cartW / 2;
  const cartY = groundY - cartH - 10;
  const cartCx = cartW / 2;
  const cartCy = cartH / 2;

  // Wheel rotation angle derived from physical distance
  const wheelR = 8;
  const wheelDeg = (distance / (2 * Math.PI * (wheelR / 100))) * 360;

  // Vector arrow lengths
  const forceArrowLen = Math.min(140, Math.max(25, force * 1.5));
  const velArrowLen = Math.min(130, Math.max(20, velocity * 12));

  return (
    <div ref={containerRef} className="w-full select-none space-y-5" data-impeccable-ignore="*">      {/* ── METROLOGICAL STATUS HEADER ── */}
      <div className="flex flex-wrap items-center justify-between pb-3.5 border-b border-[#222733] font-mono text-xs">
        <div className="flex items-center gap-2.5">
          <Icon3dPhysicsEnergy size={20} className="shrink-0" />
          <span className="font-extrabold text-[#F1F5F9] tracking-tight">
            LAB APPARATUS: HUKUM II NEWTON
          </span>
          <span className="text-[#222733]">/</span>
          <span className="text-[#4B8F8C] font-bold">
            F = m · a
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1 sm:pt-0">
          <span className="text-[#94A3B8] font-semibold">
            {distance >= trackLimitM
              ? 'SELESAI (TARGET 10m TERCAPAI)'
              : scrollDriven && distance > 0
              ? `SCROLL AKTIF: ${distance.toFixed(1)}m / 10m`
              : isPlaying
              ? 'AKSELERASI DINAMIS BERJALAN...'
              : 'SIAP SCROLL / LUNCURKAN'}
          </span>
          <span className="text-[#222733]">/</span>
          <Link
            href="/simulation/newtons-second-law"
            className="text-[#BA8230] hover:text-[#91621E] font-bold flex items-center gap-1 transition-colors"
          >
            <span>Buka Lab Penuh</span>
            <IconArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* ── REAL APP DYNAMICS CANVAS (PURE SVG VIEWPORT) ── */}
      <div className="relative w-full rounded-2xl bg-[#0C0E12] border border-[#222733] overflow-hidden p-2 sm:p-4 transition-colors shadow-2xs">
        <svg
          viewBox={`0 0 ${canvasW} ${canvasH}`}
          className="w-full h-auto max-h-[300px] select-none"
          preserveAspectRatio="xMidYMid meet"
          data-impeccable-ignore="*"
        >
          <defs>
            {/* Vector markers matching GEN LABS design palette */}
            <marker id="arrow-f-hero" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#BA8230" />
            </marker>
            <marker id="arrow-v-hero" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#4B8F8C" />
            </marker>
            <marker id="arrow-n-hero" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill={isDark ? '#4EAA8F' : '#4B8F8C'} />
            </marker>
          </defs>

          {/* Graticule laser guidelines */}
          <g opacity={isDark ? 0.35 : 0.7}>
            {Array.from({ length: 19 }).map((_, i) => (
              <line key={`gx-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={groundY} stroke={isDark ? '#222733' : '#DDE2DB'} strokeWidth={1} />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={`gy-${i}`} x1={0} y1={i * 45} x2={canvasW} y2={i * 45} stroke={isDark ? '#222733' : '#DDE2DB'} strokeWidth={1} />
            ))}
          </g>

          {/* Solid aluminum track chassis & guide rail */}
          <rect x={trackStart - 40} y={groundY} width={trackUsableW + 80} height={24} rx={4} fill={isDark ? '#14171E' : '#E8EDE6'} stroke={isDark ? '#222733' : '#D0DDD5'} strokeWidth={1.5} />
          <line x1={trackStart - 40} y1={groundY} x2={trackStart + trackUsableW + 40} y2={groundY} stroke={isDark ? '#4B8F8C' : '#1C332A'} strokeWidth={3} strokeLinecap="round" />

          {/* Metric Ruler Scale (0m to 10m) */}
          {Array.from({ length: 11 }).map((_, idx) => {
            const rx = trackStart + idx * pxPerMeter;
            return (
              <g key={`meter-${idx}`}>
                <line x1={rx} y1={groundY} x2={rx} y2={groundY + 12} stroke={isDark ? '#4B8F8C' : '#1C332A'} strokeWidth={1.5} />
                <text x={rx} y={groundY + 22} textAnchor="middle" fill={isDark ? '#CBD5E1' : '#4A5850'} fontSize="12" fontFamily="Space Mono, monospace" fontWeight="bold">
                  {idx}m
                </text>
              </g>
            );
          })}

          {/* Photogate Finish Trigger at 10m */}
          <g transform={`translate(${trackEnd}, ${groundY - 70})`}>
            <path d="M 0 70 L 0 8 Q 0 0 8 0 L 10 0 Q 18 0 18 8 L 18 70" fill="none" stroke="#BA8230" strokeWidth={2.5} />
            <line x1="9" y1="4" x2="9" y2="70" stroke="#BA8230" strokeWidth="2" strokeDasharray="3 2" opacity="0.8" />
            <text x="9" y="-6" fill="#BA8230" fontSize="12" fontFamily="Space Mono, monospace" textAnchor="middle" fontWeight="bold">
              FINISH
            </text>
          </g>

          {/* ── PHYSICAL SPECIMEN CART ASSEMBLY ── */}
          <g transform={`translate(${cartX}, ${cartY})`}>
            {/* Roller Bearing Wheels */}
            <g transform={`translate(22, ${cartH + 8}) rotate(${wheelDeg})`}>
              <circle r={wheelR} fill={isDark ? '#14171E' : '#FFFFFF'} stroke={isDark ? '#4B8F8C' : '#1C332A'} strokeWidth={2} />
              <line x1={-wheelR + 1} y1={0} x2={wheelR - 1} y2={0} stroke={isDark ? '#4B8F8C' : '#1C332A'} strokeWidth={1.5} />
              <line x1={0} y1={-wheelR + 1} x2={0} y2={wheelR - 1} stroke={isDark ? '#4B8F8C' : '#1C332A'} strokeWidth={1.5} />
              <circle r={2.5} fill="#BA8230" />
            </g>
            <g transform={`translate(${cartW - 22}, ${cartH + 8}) rotate(${wheelDeg})`}>
              <circle r={wheelR} fill={isDark ? '#14171E' : '#FFFFFF'} stroke={isDark ? '#4B8F8C' : '#1C332A'} strokeWidth={2} />
              <line x1={-wheelR + 1} y1={0} x2={wheelR - 1} y2={0} stroke={isDark ? '#4B8F8C' : '#1C332A'} strokeWidth={1.5} />
              <line x1={0} y1={-wheelR + 1} x2={0} y2={wheelR - 1} stroke={isDark ? '#4B8F8C' : '#1C332A'} strokeWidth={1.5} />
              <circle r={2.5} fill="#BA8230" />
            </g>

            {/* Cart Body */}
            <rect
              x={0}
              y={0}
              width={cartW}
              height={cartH}
              rx={6}
              fill="#1C332A"
              stroke={isDark ? '#4B8F8C' : '#2A6953'}
              strokeWidth={2}
            />

            {/* Mass Label */}
            <text
              x={cartCx}
              y={cartCy + 4}
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="Space Mono, monospace"
              fontSize="13"
              fontWeight="bold"
            >
              m = {mass} kg
            </text>

            {/* ── VECTOR 1: APPLIED FORCE F (Horizontal Ochre Vector) ── */}
            <g>
              <line
                x1={cartW}
                y1={cartCy}
                x2={cartW + forceArrowLen}
                y2={cartCy}
                stroke="#BA8230"
                strokeWidth={3.5}
                markerEnd="url(#arrow-f-hero)"
              />
              <text
                x={cartW + forceArrowLen + 8}
                y={cartCy + 4}
                fill={isDark ? '#FFDDB5' : '#8A5200'}
                fontFamily="Space Mono, monospace"
                fontSize="12"
                fontWeight="bold"
              >
                F = {force} N
              </text>
            </g>

            {/* ── VECTOR 2: VELOCITY VECTOR v (Cyan Phosphor Vector) ── */}
            {velocity > 0.2 && (
              <g transform="translate(0, -18)">
                <line
                  x1={cartCx}
                  y1={0}
                  x2={cartCx + velArrowLen}
                  y2={0}
                  stroke={isDark ? '#4B8F8C' : '#1C332A'}
                  strokeWidth={2.5}
                  strokeDasharray="4 2"
                  markerEnd="url(#arrow-v-hero)"
                />
                <text
                  x={cartCx + velArrowLen + 6}
                  y={4}
                  fill={isDark ? '#4EAA8F' : '#1C332A'}
                  fontFamily="Space Mono, monospace"
                  fontSize="12"
                  fontWeight="bold"
                >
                  v = {velocity.toFixed(2)} m/s
                </text>
              </g>
            )}

            {/* ── VECTOR 3: NORMAL FORCE N (Upwards Vector) ── */}
            <g>
              <line
                x1={cartCx}
                y1={0}
                x2={cartCx}
                y2={-32}
                stroke={isDark ? '#4EAA8F' : '#1C332A'}
                strokeWidth={2}
                markerEnd="url(#arrow-n-hero)"
              />
              <text
                x={cartCx + 6}
                y={-20}
                fill={isDark ? '#4EAA8F' : '#1C332A'}
                fontFamily="Space Mono, monospace"
                fontSize="12"
                fontWeight="bold"
              >
                N = {normalForce.toFixed(0)}N
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* ── ARCHITECTURAL TELEMETRY & LANDING CONTROLS CONSOLE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2 items-center font-mono text-xs">
        {/* Left Console: Parameter Toggles */}
        <div className="lg:col-span-5 flex flex-wrap items-center gap-4">
          {/* Gaya F */}
          <div className="flex items-center gap-2">
            <span className="text-[#94A3B8] font-bold uppercase tracking-wider">Gaya (F):</span>
            <div className="inline-flex rounded-full border border-[#222733] bg-[#14171E] p-1 shadow-xs">
              {[20, 40, 80].map((fVal) => (
                <button
                  key={fVal}
                  type="button"
                  onClick={() => {
                    setForce(fVal);
                    handleReset();
                  }}
                  className={`px-3 py-1 font-mono text-xs font-bold rounded-full transition-all cursor-pointer ${
                    force === fVal
                      ? 'bg-[#BA8230] text-white shadow-xs'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
                >
                  {fVal}N
                </button>
              ))}
            </div>
          </div>

          {/* Massa m */}
          <div className="flex items-center gap-2">
            <span className="text-[#94A3B8] font-bold uppercase tracking-wider">Massa (m):</span>
            <div className="inline-flex rounded-full border border-[#222733] bg-[#14171E] p-1 shadow-xs">
              {[2, 4, 8].map((mVal) => (
                <button
                  key={mVal}
                  type="button"
                  onClick={() => {
                    setMass(mVal);
                    handleReset();
                  }}
                  className={`px-3 py-1 font-mono text-xs font-bold rounded-full transition-all cursor-pointer ${
                    mass === mVal
                      ? 'bg-[#4B8F8C] border border-[#4B8F8C] text-white shadow-xs'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
                >
                  {mVal}kg
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Console: Play / Pause / Reset Action */}
        <div className="lg:col-span-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (distance >= trackLimitM) handleReset();
              setIsPlaying(!isPlaying);
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs font-bold transition-all cursor-pointer bg-[#4B8F8C] hover:bg-[#3E8E75] text-white shadow-md active:scale-95"
          >
            {isPlaying ? (
              <>
                <IconPause size={14} />
                <span>Jeda Simulasi</span>
              </>
            ) : (
              <>
                <IconPlay size={14} fill="currentColor" />
                <span>{distance >= trackLimitM ? 'Ulangi Percobaan' : 'Luncurkan Balok'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 rounded-full border border-[#222733] bg-[#14171E] hover:bg-[#1B202A] hover:border-[#4B8F8C] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors cursor-pointer"
            title="Reset Posisi Balok"
          >
            <IconRotateCcw size={15} />
          </button>
        </div>

        {/* Right Console: Live Telemetry Readouts */}
        <div className="lg:col-span-4 flex items-center justify-between lg:justify-end gap-5 text-left border-t lg:border-t-0 lg:border-l border-[#222733] pt-3 lg:pt-0 lg:pl-6">
          <div>
            <span className="text-[#94A3B8] block font-bold uppercase tracking-wider text-xs">PERCEPATAN (a)</span>
            <span className="font-extrabold text-sm sm:text-base tabular-nums text-[#4EAA8F]">
              {accel.toFixed(1)} m/s²
            </span>
          </div>

          <div>
            <span className="text-[#94A3B8] block font-bold uppercase tracking-wider text-xs">KECEPATAN (v)</span>
            <span className="text-[#4B8F8C] font-extrabold text-sm sm:text-base tabular-nums">
              {velocity.toFixed(2)} m/s
            </span>
          </div>

          <div>
            <span className="text-[#94A3B8] block font-bold uppercase tracking-wider text-xs">JARAK (x)</span>
            <span className="text-[#E0A045] font-extrabold text-sm sm:text-base tabular-nums">
              {distance.toFixed(2)} m
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
