'use client';

import React from 'react';

interface EconomicsEquilibriumGraphicProps {
  className?: string;
  isHovered?: boolean;
}

/**
 * Marshallian Market Equilibrium & Surplus Geometry Apparatus
 * Scientific illustration: Supply and Demand Dynamics (P* & Q*)
 * Features:
 * - Orthogonal graticule ground (#0E1410)
 * - Calibrated P (Price) and Q (Quantity) axes
 * - Upward Supply Curve S (Phosphor Sage Cyan)
 * - Downward Demand Curve D (Warm Ochre Gold)
 * - Planar geometric Consumer Surplus and Producer Surplus areas
 * - Equilibrium intersection point E* with orthogonal projection reticles
 */
export function EconomicsEquilibriumGraphic({
  className = 'w-full h-full',
  isHovered = false,
}: EconomicsEquilibriumGraphicProps) {
  // Demand curve shifts rightward on hover (simulating increased demand)
  const dStart = isHovered ? { x: 70, y: 18 } : { x: 50, y: 22 };
  const dEnd = isHovered ? { x: 270, y: 84 } : { x: 240, y: 84 };

  // Supply curve (remains constant baseline)
  const sStart = { x: 50, y: 84 };
  const sEnd = { x: 260, y: 22 };

  // Equilibrium intersection coordinates
  const eqX = isHovered ? 168 : 145;
  const eqY = isHovered ? 48 : 53;
  const pVal = isHovered ? '72K' : '65K';
  const qVal = isHovered ? '140' : '120';

  return (
    <svg
      viewBox="0 0 360 110"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Aparatur Keseimbangan Pasar Permintaan dan Penawaran Ekonomi"
    >
      <defs>
        {/* Orthogonal graticule */}
        <pattern id="econ-graticule" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" stroke="#2B3025" strokeWidth="0.5" strokeOpacity="0.5" />
        </pattern>
        {/* Consumer surplus diagonal hatch */}
        <pattern id="cs-hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#BA8230" strokeWidth="0.6" strokeOpacity="0.3" />
        </pattern>
        {/* Producer surplus diagonal hatch */}
        <pattern id="ps-hatch" width="8" height="8" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#4B8F8C" strokeWidth="0.6" strokeOpacity="0.3" />
        </pattern>
      </defs>

      {/* Recessed Ground Surface */}
      <rect width="360" height="110" fill="#0E1410" rx="8" />
      <rect width="360" height="110" fill="url(#econ-graticule)" rx="8" />

      {/* Marshallian Coordinate Axes */}
      {/* P (Price) Vertical Axis */}
      <line x1="42" y1="12" x2="42" y2="92" stroke="#1D4838" strokeWidth="1.2" />
      <text x="36" y="16" fill="#8FA396" fontSize="7" fontFamily="Space Mono, monospace" fontWeight="700">
        P
      </text>

      {/* Q (Quantity) Horizontal Axis */}
      <line x1="42" y1="92" x2="330" y2="92" stroke="#1D4838" strokeWidth="1.2" />
      <text x="334" y="95" fill="#8FA396" fontSize="7" fontFamily="Space Mono, monospace" fontWeight="700">
        Q
      </text>

      {/* Origin Datum */}
      <text x="34" y="96" fill="#8FA396" fontSize="6" fontFamily="Space Mono, monospace" opacity="0.6">
        0
      </text>

      {/* Consumer Surplus Shaded Wedge (Above P*, Below D) */}
      <path
        d={`M 42 ${dStart.y} L ${eqX} ${eqY} L 42 ${eqY} Z`}
        fill="url(#cs-hatch)"
        style={{
          transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Producer Surplus Shaded Wedge (Below P*, Above S) */}
      <path
        d={`M 42 84 L ${eqX} ${eqY} L 42 ${eqY} Z`}
        fill="url(#ps-hatch)"
        style={{
          transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Supply Curve S: Upward Sloping */}
      <line
        x1={sStart.x}
        y1={sStart.y}
        x2={sEnd.x}
        y2={sEnd.y}
        stroke="#4B8F8C"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text x={sEnd.x + 6} y={sEnd.y + 4} fill="#4B8F8C" fontSize="7.5" fontFamily="Space Mono, monospace" fontWeight="700">
        S (Penawaran)
      </text>

      {/* Demand Curve D: Downward Sloping (Dynamic Shift) */}
      <line
        x1={dStart.x}
        y1={dStart.y}
        x2={dEnd.x}
        y2={dEnd.y}
        stroke="#BA8230"
        strokeWidth="2"
        strokeLinecap="round"
        style={{
          transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
      <text
        x={dEnd.x + 6}
        y={dEnd.y + 4}
        fill="#BA8230"
        fontSize="7.5"
        fontFamily="Space Mono, monospace"
        fontWeight="700"
        style={{
          transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {isHovered ? "D' (Pergeseran)" : 'D (Permintaan)'}
      </text>

      {/* Orthogonal Reticle Projections from Equilibrium Point to Axes */}
      {/* Price Projection (to P axis) */}
      <line
        x1="42"
        y1={eqY}
        x2={eqX}
        y2={eqY}
        stroke="#E6ECE8"
        strokeWidth="0.8"
        strokeDasharray="2 2"
        opacity="0.75"
        style={{
          transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
      <rect
        x="10"
        y={eqY - 6}
        width="28"
        height="12"
        rx="2"
        fill="#151B16"
        stroke="#2B3025"
        strokeWidth="0.8"
        style={{
          transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
      <text
        x="24"
        y={eqY + 3}
        fill="#E6ECE8"
        fontSize="6"
        fontFamily="Space Mono, monospace"
        fontWeight="700"
        textAnchor="middle"
        style={{
          transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        P*={pVal}
      </text>

      {/* Quantity Projection (to Q axis) */}
      <line
        x1={eqX}
        y1={eqY}
        x2={eqX}
        y2="92"
        stroke="#E6ECE8"
        strokeWidth="0.8"
        strokeDasharray="2 2"
        opacity="0.75"
        style={{
          transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
      <rect
        x={eqX - 16}
        y="94"
        width="32"
        height="12"
        rx="2"
        fill="#151B16"
        stroke="#2B3025"
        strokeWidth="0.8"
        style={{
          transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
      <text
        x={eqX}
        y="102"
        fill="#E6ECE8"
        fontSize="6"
        fontFamily="Space Mono, monospace"
        fontWeight="700"
        textAnchor="middle"
        style={{
          transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        Q*={qVal}
      </text>

      {/* Equilibrium Intersection Point E* */}
      <g
        style={{
          transform: `translate(${eqX}px, ${eqY}px)`,
          transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <circle cx="0" cy="0" r="5" fill="#151B16" stroke="#E6ECE8" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="2" fill="#BA8230" />
        <rect x="8" y="-14" width="46" height="13" rx="2.5" fill="#151B16" stroke="#4B8F8C" strokeWidth="0.8" />
        <text x="31" y="-5" fill="#4B8F8C" fontSize="6.5" fontFamily="Space Mono, monospace" fontWeight="700" textAnchor="middle">
          EKUILIBRIUM
        </text>
      </g>

      {/* Surplus Region Legend Indicators */}
      <g transform="translate(48, 40)" opacity="0.85">
        <text x="0" y="0" fill="#BA8230" fontSize="5.5" fontFamily="Space Mono, monospace">
          SURPLUS KONSUMEN
        </text>
      </g>
      <g transform="translate(48, 72)" opacity="0.85">
        <text x="0" y="0" fill="#4B8F8C" fontSize="5.5" fontFamily="Space Mono, monospace">
          SURPLUS PRODUSEN
        </text>
      </g>

      {/* Top Left Formula Chip */}
      <g transform="translate(14, 12)">
        <rect width="90" height="18" rx="4" fill="#151B16" stroke="#2B3025" strokeWidth="0.8" />
        <rect width="2.5" height="18" rx="1" fill="#BA8230" />
        <text x="8" y="12" fill="#E6ECE8" fontSize="7" fontFamily="Space Mono, monospace" fontWeight="700">
          Q_d(P) = Q_s(P)
        </text>
      </g>

      {/* Top Right Status Chip */}
      <g transform="translate(268, 12)">
        <rect width="78" height="18" rx="4" fill="#151B16" stroke="#2B3025" strokeWidth="0.8" />
        <rect width="2.5" height="18" rx="1" fill="#4B8F8C" />
        <text x="8" y="12" fill="#8FA396" fontSize="6.5" fontFamily="Space Mono, monospace">
          {isHovered ? 'DEMAND SHIFT' : 'MARKET CLEAR'}
        </text>
      </g>
    </svg>
  );
}
