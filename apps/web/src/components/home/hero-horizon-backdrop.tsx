'use client';

import React from 'react';

/**
 * GEN LABS — Architectural Laboratory Perspective Ground
 * Clean, subtle orthogonal perspective lines calibrated for both Light and Dark mode.
 * Strictly adheres to anti-slop guidelines: no dark hardcoded blocks in light mode,
 * no neon glows, hairline precision orthogonal seams.
 */
export function HeroHorizonBackdrop() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Ambient background matches theme ground */}
      <div className="absolute inset-0 bg-[var(--color-bg)] transition-colors duration-300" />

      {/* Subtle hairline orthogonal perspective grid */}
      <svg
        viewBox="0 0 1440 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="horizonVanish" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="var(--color-border)" stopOpacity="0" />
            <stop offset="60%" stopColor="var(--color-border)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-border)" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Perspective converging rays toward central horizon */}
        <g stroke="url(#horizonVanish)" strokeWidth="1">
          <line x1="120" y1="600" x2="680" y2="280" />
          <line x1="280" y1="600" x2="700" y2="280" />
          <line x1="460" y1="600" x2="710" y2="280" />
          <line x1="640" y1="600" x2="716" y2="280" />
          <line x1="800" y1="600" x2="724" y2="280" />
          <line x1="980" y1="600" x2="730" y2="280" />
          <line x1="1160" y1="600" x2="740" y2="280" />
          <line x1="1320" y1="600" x2="760" y2="280" />
        </g>

        {/* Subtle horizontal metric rails */}
        <line x1="0" y1="280" x2="1440" y2="280" stroke="var(--color-border)" strokeWidth="1" strokeOpacity="0.25" />
        <line x1="0" y1="360" x2="1440" y2="360" stroke="var(--color-border)" strokeWidth="1" strokeOpacity="0.25" />
        <line x1="0" y1="460" x2="1440" y2="460" stroke="var(--color-border)" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="0" y1="580" x2="1440" y2="580" stroke="var(--color-border)" strokeWidth="1" strokeOpacity="0.35" />
      </svg>
    </div>
  );
}
