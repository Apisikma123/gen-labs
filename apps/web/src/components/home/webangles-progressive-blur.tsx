'use client';

import React from 'react';

/**
 * GEN LABS — Calibrated Progressive Ground Blur Dock
 * High-performance hardware-accelerated bottom viewport diffusion.
 * Eliminates GPU rasterization thrashing by using a single progressive mask
 * and obsidian ground gradient rather than redundant 8-tier stacked filters.
 */
export function WebAnglesBottomBlur() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-28 sm:h-36 pointer-events-none z-40 select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Precision single-pass progressive backdrop blur */}
      <div
        className="absolute inset-0 z-10"
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 35%, rgba(0,0,0,1) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 35%, rgba(0,0,0,1) 100%)',
        }}
      />
      {/* Deep Obsidian Ground Fade */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0C0E12] via-[#0C0E12]/50 to-transparent" />
    </div>
  );
}
