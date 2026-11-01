'use client';

import React from 'react';

interface MathParabolaGraphicProps {
  className?: string;
  isHovered?: boolean;
}

/**
 * Coordinate Plane & Parabolic Function Curve Apparatus
 * Scientific illustration: Mathematical Function Explorer (y = ax² + bx + c)
 * Features:
 * - Orthogonal rectilinear Cartesian graticule ground (#0E1410)
 * - Calibrated X and Y axes with datum tick marks
 * - Continuous quadratic curve f(x)
 * - Differential tangent line and slope triangle (dy/dx)
 * - Critical points: Vertex (Warm Ochre) and Root Intercepts (Phosphor Cyan)
 */
export function MathParabolaGraphic({
  className = 'w-full h-full',
  isHovered = false,
}: MathParabolaGraphicProps) {
  // Parabola control points
  const vertexY = isHovered ? 28 : 42;
  const tangentX = isHovered ? 210 : 200;
  const tangentY = isHovered ? 48 : 58;

  return (
    <svg
      viewBox="0 0 360 110"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Grafik Fungsi Kuadrat dan Vektor Tangensial Matematika"
    >
      <defs>
        {/* Orthogonal Cartesian graticule */}
        <pattern id="math-graticule" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" stroke="#2B3025" strokeWidth="0.5" strokeOpacity="0.5" />
        </pattern>
        <marker id="math-cyan-arr" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 1 L 5 3 L 0 5 Z" fill="#4B8F8C" />
        </marker>
      </defs>

      {/* Recessed Ground Surface */}
      <rect width="360" height="110" fill="#0E1410" rx="8" />
      <rect width="360" height="110" fill="url(#math-graticule)" rx="8" />

      {/* Cartesian Coordinate Axes */}
      {/* Horizontal X Axis */}
      <line x1="20" y1="84" x2="340" y2="84" stroke="#1D4838" strokeWidth="1.2" />
      <text x="345" y="87" fill="#8FA396" fontSize="7" fontFamily="Space Mono, monospace" fontWeight="700">
        X
      </text>

      {/* Vertical Y Axis */}
      <line x1="160" y1="12" x2="160" y2="98" stroke="#1D4838" strokeWidth="1.2" />
      <text x="160" y="8" fill="#8FA396" fontSize="7" fontFamily="Space Mono, monospace" fontWeight="700" textAnchor="middle">
        Y
      </text>

      {/* Axis Scale Ticks */}
      {[-6, -4, -2, 2, 4, 6].map((unit) => {
        const xPos = 160 + unit * 22;
        return (
          <g key={unit}>
            <line x1={xPos} y1="82" x2={xPos} y2="86" stroke="#2B3025" strokeWidth="1" />
            <text x={xPos} y="94" fill="#8FA396" fontSize="6" fontFamily="Space Mono, monospace" textAnchor="middle" opacity="0.6">
              {unit > 0 ? `+${unit}` : unit}
            </text>
          </g>
        );
      })}

      {/* Parabola Area Fill (Subtle deep pine elevation) */}
      <path
        d={
          isHovered
            ? 'M 60 84 Q 160 8 260 84 Z'
            : 'M 60 84 Q 160 28 260 84 Z'
        }
        fill="#1D4838"
        fillOpacity="0.15"
        style={{
          transition: 'd 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Parabolic Trajectory Curve f(x) = -ax² + k */}
      <path
        d={
          isHovered
            ? 'M 40 102 Q 160 -18 280 102'
            : 'M 40 102 Q 160 12 280 102'
        }
        stroke="#4B8F8C"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        style={{
          transition: 'd 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Symmetry Axis Line (x = h) */}
      <line
        x1="160"
        y1="18"
        x2="160"
        y2="84"
        stroke="#8FA396"
        strokeWidth="0.8"
        strokeDasharray="2 2"
        opacity="0.4"
      />

      {/* Vertex Point (Maximum f(x)) */}
      <g
        style={{
          transform: `translate(160px, ${vertexY}px)`,
          transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <circle cx="0" cy="0" r="4.5" fill="#151B16" stroke="#BA8230" strokeWidth="1.8" />
        <circle cx="0" cy="0" r="1.8" fill="#BA8230" />
        <rect x="8" y="-12" width="62" height="15" rx="3" fill="#151B16" stroke="#2B3025" strokeWidth="0.8" />
        <text x="12" y="-2" fill="#BA8230" fontSize="6.5" fontFamily="Space Mono, monospace" fontWeight="700">
          V(0, {isHovered ? '4.8' : '3.2'})
        </text>
      </g>

      {/* Root Intercepts (x1, x2 where y=0) */}
      <g>
        <circle cx="68" cy="84" r="3" fill="#151B16" stroke="#4B8F8C" strokeWidth="1.2" />
        <text x="68" y="78" fill="#4B8F8C" fontSize="6" fontFamily="Space Mono, monospace" textAnchor="middle">
          x₁
        </text>

        <circle cx="252" cy="84" r="3" fill="#151B16" stroke="#4B8F8C" strokeWidth="1.2" />
        <text x="252" y="78" fill="#4B8F8C" fontSize="6" fontFamily="Space Mono, monospace" textAnchor="middle">
          x₂
        </text>
      </g>

      {/* Differential Tangent Line dy/dx at Point P */}
      <g
        style={{
          transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Slope Triangle */}
        <path
          d={`M ${tangentX - 24} ${tangentY + 14} L ${tangentX} ${tangentY + 14} L ${tangentX} ${tangentY}`}
          stroke="#BA8230"
          strokeWidth="0.8"
          strokeDasharray="1.5 1.5"
          fill="none"
          opacity="0.7"
        />
        <text x={tangentX - 12} y={tangentY + 20} fill="#BA8230" fontSize="5.5" fontFamily="Space Mono, monospace" textAnchor="middle">
          Δx
        </text>
        <text x={tangentX + 6} y={tangentY + 8} fill="#BA8230" fontSize="5.5" fontFamily="Space Mono, monospace">
          Δy
        </text>

        {/* Tangent Vector */}
        <line
          x1={tangentX - 32}
          y1={tangentY + 18}
          x2={tangentX + 28}
          y2={tangentY - 16}
          stroke="#E6ECE8"
          strokeWidth="1.2"
          strokeDasharray="3 2"
          opacity="0.85"
        />
        {/* Point of Tangency */}
        <circle cx={tangentX} cy={tangentY} r="3" fill="#151B16" stroke="#E6ECE8" strokeWidth="1.2" />
        <text x={tangentX - 6} y={tangentY - 6} fill="#E6ECE8" fontSize="6" fontFamily="Space Mono, monospace" fontWeight="700">
          f'(x₀)
        </text>
      </g>

      {/* Top Left Formula Telemetry Chip */}
      <g transform="translate(14, 12)">
        <rect width="96" height="18" rx="4" fill="#151B16" stroke="#2B3025" strokeWidth="0.8" />
        <rect width="2.5" height="18" rx="1" fill="#4B8F8C" />
        <text x="8" y="12" fill="#E6ECE8" fontSize="7" fontFamily="Space Mono, monospace" fontWeight="700">
          f(x) = -0.5x² + {isHovered ? '4.8' : '3.2'}
        </text>
      </g>

      {/* Top Right Discriminant Chip */}
      <g transform="translate(262, 12)">
        <rect width="84" height="18" rx="4" fill="#151B16" stroke="#2B3025" strokeWidth="0.8" />
        <rect width="2.5" height="18" rx="1" fill="#BA8230" />
        <text x="8" y="12" fill="#8FA396" fontSize="6.5" fontFamily="Space Mono, monospace">
          D &gt; 0 (2 AKAR RIIL)
        </text>
      </g>
    </svg>
  );
}
