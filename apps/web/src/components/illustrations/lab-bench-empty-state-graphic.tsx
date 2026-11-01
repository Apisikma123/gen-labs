'use client';

import React from 'react';

interface LabBenchEmptyStateGraphicProps {
  className?: string;
  discipline?: string;
}

/**
 * Precision Laboratory Optical Bench & Datum Reticle
 * Scientific empty-state illustration replacing generic emojis and placeholders.
 * Features:
 * - Rigid optical bench rail with millimeter vernier metric calibrations
 * - Precision laser collimator with targeting reticle crosshairs
 * - Datum seeker targeting aperture in Warm Ochre (#BA8230)
 * - Telemetry status chip: STANDBY // MENUNGGU PARAMETER
 */
export function LabBenchEmptyStateGraphic({
  className = 'w-48 h-28 mx-auto',
  discipline,
}: LabBenchEmptyStateGraphicProps) {
  return (
    <svg
      viewBox="0 0 240 120"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Aparatur Meja Optik Laboratorium Siaga Belum Terkalibrasi"
    >
      <defs>
        {/* Orthogonal graticule */}
        <pattern id="empty-graticule" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" stroke="#2B3025" strokeWidth="0.5" strokeOpacity="0.5" />
        </pattern>
        {/* Collimator laser gradient */}
        <linearGradient id="laser-grad" x1="40" y1="60" x2="190" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4B8F8C" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#4B8F8C" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#BA8230" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Recessed Ground Surface */}
      <rect width="240" height="120" rx="10" fill="#0E1410" />
      <rect width="240" height="120" rx="10" fill="url(#empty-graticule)" />
      <rect x="0.5" y="0.5" width="239" height="119" rx="9.5" stroke="#2B3025" strokeWidth="1" />

      {/* Optical Bench Heavy Rail */}
      <line x1="20" y1="88" x2="220" y2="88" stroke="#1D4838" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="20" y1="91" x2="220" y2="91" stroke="#2B3025" strokeWidth="1" />

      {/* Rail Metric Vernier Ticks */}
      {[30, 50, 70, 90, 110, 130, 150, 170, 190, 210].map((x) => (
        <line key={x} x1={x} y1="91" x2={x} y2="95" stroke="#2B3025" strokeWidth="0.8" />
      ))}

      {/* Optical Bench Left Post (Laser Source) */}
      <g transform="translate(36, 44)">
        <rect x="0" y="0" width="16" height="44" rx="2" fill="#151B16" stroke="#1D4838" strokeWidth="1.2" />
        <rect x="3" y="6" width="10" height="14" rx="1" fill="#1D241E" />
        <circle cx="8" cy="13" r="2.5" fill="#4B8F8C" />
        {/* Adjustment Micrometer Dial */}
        <circle cx="16" cy="22" r="3" fill="#151B16" stroke="#2B3025" strokeWidth="0.8" />
      </g>

      {/* Collimated Laser Beam */}
      <line x1="52" y1="57" x2="168" y2="57" stroke="url(#laser-grad)" strokeWidth="1.2" strokeDasharray="3 2" />

      {/* Optical Bench Center Target (Reticle Aperture) */}
      <g transform="translate(168, 57)">
        {/* Post Stand */}
        <line x1="0" y1="0" x2="0" y2="31" stroke="#1D4838" strokeWidth="2" />
        <rect x="-10" y="28" width="20" height="3" rx="1" fill="#151B16" stroke="#2B3025" strokeWidth="0.8" />

        {/* Circular Target Ring */}
        <circle cx="0" cy="0" r="18" fill="#151B16" stroke="#2B3025" strokeWidth="1.2" />
        <circle cx="0" cy="0" r="12" stroke="#4B8F8C" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.7" />

        {/* Target Reticle Crosshairs */}
        <line x1="-16" y1="0" x2="16" y2="0" stroke="#BA8230" strokeWidth="1" />
        <line x1="0" y1="-16" x2="0" y2="16" stroke="#BA8230" strokeWidth="1" />
        <circle cx="0" cy="0" r="2.5" fill="#BA8230" />

        {/* Corner alignment marks */}
        <path d="M -6 -10 L -10 -10 L -10 -6" stroke="#4B8F8C" strokeWidth="0.8" fill="none" />
        <path d="M 6 -10 L 10 -10 L 10 -6" stroke="#4B8F8C" strokeWidth="0.8" fill="none" />
        <path d="M -6 10 L -10 10 L -10 6" stroke="#4B8F8C" strokeWidth="0.8" fill="none" />
        <path d="M 6 10 L 10 10 L 10 6" stroke="#4B8F8C" strokeWidth="0.8" fill="none" />
      </g>

      {/* Top Status Telemetry Tag */}
      <g transform="translate(14, 12)">
        <rect width="98" height="16" rx="3.5" fill="#151B16" stroke="#2B3025" strokeWidth="0.8" />
        <rect width="2.5" height="16" rx="1" fill="#BA8230" />
        <text x="8" y="11" fill="#8FA396" fontSize="6.5" fontFamily="Space Mono, monospace" fontWeight="700">
          STANDBY // DATA KOSONG
        </text>
      </g>

      {/* Top Right Datum Coordinates */}
      <g transform="translate(162, 12)">
        <text x="64" y="11" fill="#4B8F8C" fontSize="6" fontFamily="Space Mono, monospace" textAnchor="end">
          {discipline ? `[${discipline.toUpperCase()}]` : 'POS: 0.000 // NULL'}
        </text>
      </g>
    </svg>
  );
}
