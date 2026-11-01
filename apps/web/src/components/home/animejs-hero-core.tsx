'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  IconPlay,
  IconPause,
  IconRotateCcw,
} from '@/components/icons';
import { newtonsSecondLaw } from '@genlab/simulation-core';

export function AnimejsHeroCore() {
  const [force, setForce] = useState<number>(40);
  const [mass, setMass] = useState<number>(4);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [telemetry, setTelemetry] = useState({
    time: 0,
    velocity: 0,
    distance: 0,
  });

  const gliderGroupRef = useRef<SVGGElement>(null);
  const vectorFRef = useRef<SVGLineElement>(null);
  const vectorVRef = useRef<SVGLineElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Compute acceleration using real simulation engine model: a = F / m
  const simResult = newtonsSecondLaw.compute({ mass, force, friction: 0 });
  const accel = Number(simResult.acceleration);

  // Smooth 60 FPS motion loop using RAF & hardware acceleration (smooth on mobile)
  const runSimulation = (timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsedSec = (timestamp - startTimeRef.current) / 1000;
    
    // 10-meter track, time to reach end: t_end = sqrt(2 * 10 / a)
    const tEnd = Math.sqrt((2 * 10) / accel);
    const tClamped = Math.min(elapsedSec, tEnd);
    const p = Math.min(100, (tClamped / tEnd) * 100);
    
    // Current distance: s = 0.5 * a * t^2
    const currentDist = 0.5 * accel * tClamped * tClamped;
    const currentVel = accel * tClamped;
    
    // Glider translation in SVG coordinate units (max rail width = 140)
    const maxTrackX = 140;
    const gliderX = (currentDist / 10) * maxTrackX;

    if (gliderGroupRef.current) {
      gliderGroupRef.current.style.transform = `translate3d(${gliderX}px, 0, 0)`;
    }

    if (vectorVRef.current) {
      vectorVRef.current.setAttribute('x2', `${Math.min(50, currentVel * 3.5)}`);
    }

    setProgress(Math.round(p));
    setTelemetry({
      time: Number(tClamped.toFixed(2)),
      velocity: Number(currentVel.toFixed(1)),
      distance: Number(currentDist.toFixed(1)),
    });

    if (tClamped < tEnd) {
      animFrameRef.current = requestAnimationFrame(runSimulation);
    } else {
      setIsRunning(false);
      startTimeRef.current = null;
    }
  };

  const handleTogglePlay = () => {
    if (isRunning) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setIsRunning(false);
      startTimeRef.current = null;
    } else {
      if (progress >= 100) {
        handleReset();
      }
      setIsRunning(true);
      startTimeRef.current = null;
      animFrameRef.current = requestAnimationFrame(runSimulation);
    }
  };

  const handleReset = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsRunning(false);
    startTimeRef.current = null;
    setProgress(0);
    if (gliderGroupRef.current) {
      gliderGroupRef.current.style.transform = 'translate3d(0, 0, 0)';
    }
    if (vectorVRef.current) {
      vectorVRef.current.setAttribute('x2', '0');
    }
    setTelemetry({ time: 0, velocity: 0, distance: 0 });
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Generate 72 fine radial ticks around the perimeter (exact animejs style)
  const radialTicks = [];
  for (let i = 0; i < 72; i++) {
    const deg = i * 5;
    const isMajor = i % 6 === 0;
    const len = isMajor ? 8 : 4;
    radialTicks.push(
      <line
        key={i}
        x1="200"
        y1={200 - 188}
        x2="200"
        y2={200 - 188 + len}
        stroke="#4B8F8C"
        strokeWidth={isMajor ? '1.5' : '1'}
        strokeOpacity={isMajor ? '0.7' : '0.3'}
        transform={`rotate(${deg} 200 200)`}
      />
    );
  }

  // Generate acoustic frequency horizontal bars (Anime.js signature waveform)
  const acousticLines = [];
  for (let i = -14; i <= 14; i++) {
    const y = 200 + i * 4;
    const factor = Math.cos((i / 15) * Math.PI * 0.5);
    const halfWidth = Math.max(12, factor * 90);
    acousticLines.push(
      <line
        key={i}
        x1={200 - halfWidth}
        y1={y}
        x2={200 + halfWidth}
        y2={y}
        stroke="#BA8230"
        strokeWidth="1.2"
        strokeOpacity={0.15 + factor * 0.35}
      />
    );
  }

  // Sine dots curve
  const waveDots = [];
  for (let i = 0; i <= 28; i++) {
    const x = 90 + i * 8;
    const t = (i / 28) * Math.PI * 2;
    const y = 200 + Math.sin(t) * 35;
    waveDots.push(
      <circle
        key={i}
        cx={x}
        cy={y}
        r="2"
        fill="#BA8230"
        fillOpacity={0.6 + Math.sin(t) * 0.3}
      />
    );
  }

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      {/* ── THE SIGNATURE CIRCULAR KINETIC APPARATUS ── */}
      <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] md:w-[430px] md:h-[430px] flex items-center justify-center">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full overflow-visible pointer-events-none"
        >
          <defs>
            {/* Luminous neon drop shadows */}
            <filter id="neonGlowLime" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="neonGlowRed" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="neonGlowCyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. CONTINUOUS ROTATING RADIAL TICKS (GPU ACCELERATED) */}
          <g className="animate-animejs-spin origin-[200px_200px]">
            {radialTicks}
          </g>

          {/* 2. CONCENTRIC STRUCTURAL RINGS */}
          <circle
            cx="200"
            cy="200"
            r="192"
            fill="none"
            stroke="#222733"
            strokeWidth="1"
            strokeOpacity="0.8"
          />
          <circle
            cx="200"
            cy="200"
            r="176"
            fill="none"
            stroke="#222733"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
          <circle
            cx="200"
            cy="200"
            r="150"
            fill="#0C0E12"
            stroke="#222733"
            strokeWidth="1.5"
          />

          {/* 3. SEGMENTED LUMINOUS NEON ARCS (LIKE ANIMEJS.COM HERO RIM) */}
          {/* Top-Left Arc: Phosphor Lime (#2ECC71) */}
          <path
            d="M 100 65 A 176 176 0 0 1 190 25"
            fill="none"
            stroke="#2ECC71"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#neonGlowLime)"
          />
          {/* Top-Right Arc: Crimson Coral (#FF4757) */}
          <path
            d="M 210 25 A 176 176 0 0 1 300 65"
            fill="none"
            stroke="#FF4757"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#neonGlowRed)"
          />
          {/* Right Arc: Warm Ochre Gold (#BA8230) */}
          <path
            d="M 365 140 A 176 176 0 0 1 365 260"
            fill="none"
            stroke="#BA8230"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Bottom Arc: Cyan (#00D2D3) */}
          <path
            d="M 300 335 A 176 176 0 0 1 200 376"
            fill="none"
            stroke="#00D2D3"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#neonGlowCyan)"
          />
          {/* Bottom-Left Arc: Lapis Blue (#3B82F6) */}
          <path
            d="M 190 376 A 176 176 0 0 1 100 335"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* 4. REVERSE ROTATING LENS REFLECTION CRESCENT */}
          <g className="animate-animejs-spin-reverse origin-[200px_200px]">
            <path
              d="M 95 140 A 145 145 0 0 1 200 55 A 130 130 0 0 0 115 150 Z"
              fill="#FFFFFF"
              fillOpacity="0.06"
            />
          </g>

          {/* 5. BACKGROUND FREQUENCY ACOUSTIC LINES & SINE WAVE */}
          <g>{acousticLines}</g>
          <g>{waveDots}</g>

          {/* 6. CONCENTRIC CROSSHAIR GRID */}
          <line x1="80" y1="200" x2="320" y2="200" stroke="#222733" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="200" y1="80" x2="200" y2="320" stroke="#222733" strokeWidth="1" strokeDasharray="3 3" />

          {/* 7. EXPERIMENTAL LINEAR MOTION APPARATUS (10 METERS) */}
          {/* Rail Track */}
          <line
            x1="120"
            y1="200"
            x2="280"
            y2="200"
            stroke="#222733"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Start and End Markers */}
          <line x1="120" y1="188" x2="120" y2="212" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="280" y1="188" x2="280" y2="212" stroke="#4B8F8C" strokeWidth="1.5" />

          {/* Glider Block Moving with Hardware Acceleration */}
          <g
            ref={gliderGroupRef}
            style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}
          >
            {/* Smooth Rounded Block */}
            <rect
              x="110"
              y="185"
              width="26"
              height="18"
              rx="5"
              fill="#1C332A"
              stroke="#4B8F8C"
              strokeWidth="1.5"
            />
            {/* Mass Text */}
            <text
              x="123"
              y="197"
              fill="#F1F5F9"
              fontSize="8"
              fontFamily="Space Mono, monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              {mass}kg
            </text>

            {/* Live Force Vector Arrow (Warm Ochre) */}
            <g transform="translate(138, 191)">
              <line
                ref={vectorFRef}
                x1="0"
                y1="0"
                x2={Math.max(16, Math.round(force * 0.45))}
                y2="0"
                stroke="#BA8230"
                strokeWidth="2"
              />
              <polygon
                points={`${Math.max(16, Math.round(force * 0.45))}, -3 ${Math.max(16, Math.round(force * 0.45)) + 4}, 0 ${Math.max(16, Math.round(force * 0.45))}, 3`}
                fill="#BA8230"
              />
            </g>

            {/* Live Velocity Vector Arrow (Phosphor Sage Cyan) */}
            <g transform="translate(138, 199)">
              <line
                ref={vectorVRef}
                x1="0"
                y1="0"
                x2="0"
                y2="0"
                stroke="#4B8F8C"
                strokeWidth="1.5"
              />
            </g>
          </g>

          {/* Center Coordinates Reticle */}
          <circle cx="200" cy="200" r="2.5" fill="#4B8F8C" />
        </svg>

        {/* TACTILE CENTER PLAY/PAUSE TRIGGER */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className="absolute z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1C332A] border border-[#4B8F8C] text-[#F1F5F9] hover:bg-[#245544] hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg transition-all cursor-pointer"
          aria-label={isRunning ? 'Jeda Simulasi' : 'Luncurkan Simulasi'}
          title={isRunning ? 'Jeda' : 'Luncurkan Balok (F = m × a)'}
        >
          {isRunning ? (
            <IconPause size={18} />
          ) : (
            <IconPlay size={18} className="translate-x-0.5 text-[#BA8230]" />
          )}
        </button>
      </div>

      {/* ── EMBEDDED PRECISION DIALS (NO CARDS - INTEGRATED TACTILE PILLS) ── */}
      <div className="w-full max-w-sm mt-3 px-2 sm:px-3 flex flex-col gap-2.5">
        {/* Force & Mass Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-[#94A3B8] text-[11px]">Dorongan:</span>
            {[20, 40, 80].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setForce(f);
                  handleReset();
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer min-h-[30px] ${
                  force === f
                    ? 'border-[#BA8230] bg-[#BA8230]/20 text-[#BA8230]'
                    : 'border-[#222733] bg-[#14171E] text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                {f}N
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#94A3B8] text-[11px]">Beban:</span>
            {[2, 4, 8].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMass(m);
                  handleReset();
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer min-h-[30px] ${
                  mass === m
                    ? 'border-[#4B8F8C] bg-[#4B8F8C]/20 text-[#4B8F8C]'
                    : 'border-[#222733] bg-[#14171E] text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                {m}kg
              </button>
            ))}
          </div>
        </div>

        {/* Telemetry Readout & Reset Button */}
        <div className="flex items-center justify-between pt-1 border-t border-[#222733] text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-2 py-0.5 rounded border border-[#222733] bg-[#14171E] text-[#94A3B8] hover:text-[#F1F5F9] flex items-center gap-1 cursor-pointer min-h-[28px] text-[11px]"
              title="Reset ke titik awal"
            >
              <IconRotateCcw size={11} />
              <span>Reset</span>
            </button>
            <span className="text-[#94A3B8] text-[11px]">
              a = <strong className="text-[#BA8230]">{accel}</strong> m/s²
            </span>
          </div>

          <div className="text-[11px] text-[#4B8F8C] tabular-nums font-bold">
            v = {telemetry.velocity.toFixed(1)} m/s
          </div>
        </div>
      </div>

      {/* ── SIGNATURE ANIME.JS TIMELINE TICK SCRUBBER ── */}
      <div className="w-full max-w-sm mt-3 flex items-center justify-between px-3 py-1.5 rounded-full border border-[#222733] bg-[#14171E]/90 backdrop-blur-sm text-[10px] font-mono">
        <span className="text-[#94A3B8] text-[10px]">TIMELINE</span>
        <div className="flex items-center gap-1">
          {Array.from({ length: 30 }).map((_, idx) => {
            const isScrubHead = Math.floor((progress / 100) * 30) === idx;
            return (
              <span
                key={idx}
                className={`inline-block w-[1.5px] rounded-full transition-all duration-75 ${
                  isScrubHead
                    ? 'h-3.5 bg-[#FF4757] shadow-[0_0_6px_#FF4757]'
                    : idx % 5 === 0
                    ? 'h-2.5 bg-[#4B8F8C]/60'
                    : 'h-1.5 bg-[#222733]'
                }`}
              />
            );
          })}
        </div>
        <span className="tabular-nums font-bold text-[#F1F5F9]">{progress}%</span>
      </div>
    </div>
  );
}
