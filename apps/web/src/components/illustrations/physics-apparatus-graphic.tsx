'use client';

import React from 'react';

interface PhysicsApparatusGraphicProps {
  className?: string;
  isHovered?: boolean;
}

/**
 * Precision Linear Air-Track Apparatus
 * Scientific illustration: Newton's Second Law (F = m * a)
 * Features:
 * - Orthogonal graticule ground (#0E1410)
 * - Rigid air-track rail with photogate sensor stations
 * - Low-friction glider cart with mass m = 4.0 kg
 * - Pulley and hanging counterweight with tension line
 * - Calibrated vector arrows: Applied force F (Warm Ochre) & Acceleration a (Phosphor Cyan)
 */
export function PhysicsApparatusGraphic({
  className = 'w-full h-full',
  isHovered = false,
}: PhysicsApparatusGraphicProps) {
  // Dynamic displacement values on hover
  const cartX = isHovered ? 170 : 80;
  const weightY = isHovered ? 86 : 58;
  const accelWidth = isHovered ? 48 : 28;

  return (
    <svg
      viewBox="0 0 360 110"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Aparatur Lintasan Udara Dinamika Newton F=ma"
    >
      <defs>
        {/* Anti-slop orthogonal graticule pattern */}
        <pattern id="physics-graticule" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" stroke="#2B3025" strokeWidth="0.5" strokeOpacity="0.5" />
        </pattern>
        {/* Cyan arrow marker */}
        <marker id="cyan-arr" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 1 L 5 3 L 0 5 Z" fill="#4B8F8C" />
        </marker>
        {/* Ochre arrow marker */}
        <marker id="ochre-arr" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 1 L 5 3 L 0 5 Z" fill="#BA8230" />
        </marker>
      </defs>

      {/* Recessed Ground Surface */}
      <rect width="360" height="110" fill="#0E1410" rx="8" />
      <rect width="360" height="110" fill="url(#physics-graticule)" rx="8" />

      {/* Air-Track Bench Rail */}
      <line x1="20" y1="78" x2="310" y2="78" stroke="#1D4838" strokeWidth="3" strokeLinecap="round" />
      <line x1="20" y1="81" x2="310" y2="81" stroke="#2B3025" strokeWidth="1" />

      {/* Bench Vernier Metric Ticks */}
      {[30, 60, 90, 120, 150, 180, 210, 240, 270, 300].map((x) => (
        <g key={x}>
          <line x1={x} y1="81" x2={x} y2="86" stroke="#2B3025" strokeWidth="1" />
          <text
            x={x}
            y="94"
            fill="#8FA396"
            fontSize="7"
            fontFamily="Space Mono, monospace"
            textAnchor="middle"
            opacity="0.6"
          >
            {(x - 30) / 3}cm
          </text>
        </g>
      ))}

      {/* Optical Photogate Sensors (Station x1 and Station x2) */}
      {/* Photogate 1 */}
      <g opacity="0.85">
        <path d="M 65 52 L 65 78 M 73 52 L 73 78 M 65 52 L 73 52" stroke="#2B3025" strokeWidth="1.5" />
        <rect x="63" y="48" width="12" height="6" rx="1.5" fill="#151B16" stroke="#4B8F8C" strokeWidth="0.8" />
        <line x1="69" y1="58" x2="69" y2="74" stroke="#4B8F8C" strokeWidth="0.8" strokeDasharray="1.5 1.5" opacity="0.5" />
        <text x="69" y="44" fill="#4B8F8C" fontSize="6.5" fontFamily="Space Mono, monospace" textAnchor="middle">
          GATE 1
        </text>
      </g>

      {/* Photogate 2 */}
      <g opacity="0.85">
        <path d="M 235 52 L 235 78 M 243 52 L 243 78 M 235 52 L 243 52" stroke="#2B3025" strokeWidth="1.5" />
        <rect x="233" y="48" width="12" height="6" rx="1.5" fill="#151B16" stroke="#4B8F8C" strokeWidth="0.8" />
        <line x1="239" y1="58" x2="239" y2="74" stroke="#4B8F8C" strokeWidth="0.8" strokeDasharray="1.5 1.5" opacity="0.5" />
        <text x="239" y="44" fill="#4B8F8C" fontSize="6.5" fontFamily="Space Mono, monospace" textAnchor="middle">
          GATE 2
        </text>
      </g>

      {/* Pulley Mechanism at End of Rail */}
      <g>
        <line x1="310" y1="64" x2="310" y2="78" stroke="#1D4838" strokeWidth="2" />
        <circle cx="316" cy="62" r="7" fill="#151B16" stroke="#4B8F8C" strokeWidth="1" />
        <circle cx="316" cy="62" r="2" fill="#BA8230" />
      </g>

      {/* Low-Friction Glider Cart (Smooth transition) */}
      <g
        style={{
          transform: `translateX(${cartX}px)`,
          transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Cart Body */}
        <rect x="-24" y="58" width="48" height="19" rx="3" fill="#151B16" stroke="#1D4838" strokeWidth="1.2" />
        <rect x="-20" y="61" width="40" height="13" rx="1.5" fill="#1D241E" />

        {/* Mass Label */}
        <text
          x="0"
          y="70"
          fill="#E6ECE8"
          fontSize="8"
          fontFamily="Space Mono, monospace"
          fontWeight="700"
          textAnchor="middle"
        >
          4.0 kg
        </text>

        {/* Air Cushion Jets / Feet */}
        <circle cx="-14" cy="78" r="1.5" fill="#4B8F8C" opacity="0.8" />
        <circle cx="14" cy="78" r="1.5" fill="#4B8F8C" opacity="0.8" />

        {/* Force Vector Vector Arrow (Pulling Right) */}
        <line
          x1="24"
          y1="67"
          x2="60"
          y2="67"
          stroke="#BA8230"
          strokeWidth="1.6"
          markerEnd="url(#ochre-arr)"
        />
        <text
          x="44"
          y="62"
          fill="#BA8230"
          fontSize="7"
          fontFamily="Space Mono, monospace"
          fontWeight="700"
          textAnchor="middle"
        >
          F=24N
        </text>

        {/* Acceleration Vector Arrow (Above Cart) */}
        <line
          x1="-10"
          y1="50"
          x2={-10 + accelWidth}
          y2="50"
          stroke="#4B8F8C"
          strokeWidth="1.4"
          markerEnd="url(#cyan-arr)"
        />
        <text
          x={-10 + accelWidth / 2}
          y="45"
          fill="#4B8F8C"
          fontSize="6.5"
          fontFamily="Space Mono, monospace"
          textAnchor="middle"
        >
          a=6m/s²
        </text>
      </g>

      {/* Tension Wire from Cart to Pulley to Hanging Mass */}
      <path
        d={`M ${cartX + 24} 62 L 316 62 L 316 ${weightY}`}
        stroke="#8FA396"
        strokeWidth="1"
        strokeDasharray="2 1.5"
        opacity="0.75"
        style={{
          transition: 'd 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Hanging Mass */}
      <g
        style={{
          transform: `translate(316px, ${weightY}px)`,
          transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <rect x="-5" y="0" width="10" height="12" rx="1.5" fill="#BA8230" opacity="0.9" />
        <line x1="-3" y1="3" x2="3" y2="3" stroke="#0E1410" strokeWidth="0.7" />
        <text x="0" y="9" fill="#0E1410" fontSize="5.5" fontFamily="Space Mono, monospace" fontWeight="700" textAnchor="middle">
          m₂
        </text>
      </g>

      {/* Telemetry Indicator Chip (Top Right Corner) */}
      <g transform="translate(268, 12)">
        <rect width="80" height="18" rx="4" fill="#151B16" stroke="#2B3025" strokeWidth="0.8" />
        <rect width="2.5" height="18" rx="1" fill="#4B8F8C" />
        <text x="8" y="12" fill="#8FA396" fontSize="6.5" fontFamily="Space Mono, monospace">
          DYNAMIC EQU
        </text>
      </g>

      {/* Telemetry Left Formula Chip */}
      <g transform="translate(14, 12)">
        <rect width="90" height="18" rx="4" fill="#151B16" stroke="#2B3025" strokeWidth="0.8" />
        <rect width="2.5" height="18" rx="1" fill="#BA8230" />
        <text x="8" y="12" fill="#E6ECE8" fontSize="7" fontFamily="Space Mono, monospace" fontWeight="700">
          a = F / (m₁ + m₂)
        </text>
      </g>
    </svg>
  );
}
