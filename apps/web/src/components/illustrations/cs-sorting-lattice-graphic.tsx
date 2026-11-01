'use client';

import React from 'react';

interface CsSortingLatticeGraphicProps {
  className?: string;
  isHovered?: boolean;
}

/**
 * Memory Register Array & Partition Lattice Apparatus
 * Scientific illustration: Computer Science Sorting Algorithms & Complexity
 * Features:
 * - Orthogonal graticule ground (#0E1410)
 * - Calibrated memory array cells with hex address labels [0x0 ... 0x6]
 * - Discrete magnitude bars with numeric labels
 * - Active dual-pointer comparator (i, j) with swap trajectory arc
 * - Pivot partition boundary (Warm Ochre) and compare vector (Phosphor Cyan)
 */
export function CsSortingLatticeGraphic({
  className = 'w-full h-full',
  isHovered = false,
}: CsSortingLatticeGraphicProps) {
  // Elements: [value, height, baseColor]
  // In normal state vs hovered swapped state
  const normalBars = [
    { val: 12, h: 22, color: '#1D4838', isPivot: false },
    { val: 45, h: 48, color: '#4B8F8C', isPivot: false }, // Left compare target
    { val: 28, h: 32, color: '#1D4838', isPivot: false },
    { val: 18, h: 26, color: '#BA8230', isPivot: false }, // Right compare target
    { val: 56, h: 56, color: '#1D4838', isPivot: false },
    { val: 34, h: 38, color: '#BA8230', isPivot: true },  // Pivot
    { val: 68, h: 64, color: '#1D4838', isPivot: false },
  ];

  const swappedBars = [
    { val: 12, h: 22, color: '#1D4838', isPivot: false },
    { val: 18, h: 26, color: '#BA8230', isPivot: false }, // Swapped
    { val: 28, h: 32, color: '#1D4838', isPivot: false },
    { val: 45, h: 48, color: '#4B8F8C', isPivot: false }, // Swapped
    { val: 56, h: 56, color: '#1D4838', isPivot: false },
    { val: 34, h: 38, color: '#BA8230', isPivot: true },  // Pivot
    { val: 68, h: 64, color: '#1D4838', isPivot: false },
  ];

  const bars = isHovered ? swappedBars : normalBars;

  return (
    <svg
      viewBox="0 0 360 110"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Aparatur Algoritma Pengurutan dan Partisi Memori Komputer"
    >
      <defs>
        {/* Orthogonal graticule */}
        <pattern id="cs-graticule" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" stroke="#2B3025" strokeWidth="0.5" strokeOpacity="0.5" />
        </pattern>
        <marker id="cs-cyan-arr" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 1 L 5 3 L 0 5 Z" fill="#4B8F8C" />
        </marker>
        <marker id="cs-ochre-arr" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 1 L 5 3 L 0 5 Z" fill="#BA8230" />
        </marker>
      </defs>

      {/* Recessed Ground Surface */}
      <rect width="360" height="110" fill="#0E1410" rx="8" />
      <rect width="360" height="110" fill="url(#cs-graticule)" rx="8" />

      {/* Memory Baseline Bus */}
      <line x1="28" y1="84" x2="332" y2="84" stroke="#1D4838" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="87" x2="332" y2="87" stroke="#2B3025" strokeWidth="1" />

      {/* 7 Array Register Cells */}
      {bars.map((bar, idx) => {
        const xPos = 48 + idx * 40;
        const barY = 84 - bar.h;

        return (
          <g key={idx}>
            {/* Cell Memory Slot Base */}
            <rect
              x={xPos - 16}
              y="84"
              width="32"
              height="18"
              rx="2"
              fill="#151B16"
              stroke="#2B3025"
              strokeWidth="0.8"
            />
            {/* Hex Address Index Label */}
            <text
              x={xPos}
              y="96"
              fill="#8FA396"
              fontSize="6.5"
              fontFamily="Space Mono, monospace"
              textAnchor="middle"
              opacity="0.8"
            >
              0x0{idx}
            </text>

            {/* Value Column Bar */}
            <rect
              x={xPos - 12}
              y={barY}
              width="24"
              height={bar.h}
              rx="3"
              fill={bar.isPivot ? '#1D241E' : '#151B16'}
              stroke={bar.isPivot ? '#BA8230' : bar.color}
              strokeWidth={bar.isPivot ? '1.5' : '1.2'}
              style={{
                transition: 'all 450ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />

            {/* Inner Fill Tint */}
            <rect
              x={xPos - 9}
              y={barY + 3}
              width="18"
              height={Math.max(bar.h - 6, 2)}
              rx="1.5"
              fill={bar.color}
              fillOpacity={bar.isPivot ? '0.3' : '0.2'}
              style={{
                transition: 'all 450ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />

            {/* Numeric Value Tag */}
            <text
              x={xPos}
              y={barY - 4}
              fill={bar.isPivot ? '#BA8230' : '#E6ECE8'}
              fontSize="7"
              fontFamily="Space Mono, monospace"
              fontWeight="700"
              textAnchor="middle"
              style={{
                transition: 'all 450ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {bar.val}
            </text>

            {/* Pivot Indicator Flag */}
            {bar.isPivot && (
              <g transform={`translate(${xPos}, ${barY - 14})`}>
                <rect x="-14" y="-8" width="28" height="10" rx="2" fill="#151B16" stroke="#BA8230" strokeWidth="0.8" />
                <text x="0" y="-1" fill="#BA8230" fontSize="5.5" fontFamily="Space Mono, monospace" fontWeight="700" textAnchor="middle">
                  PIVOT
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Dynamic Swap Trajectory Arc between Index 1 (45) and Index 3 (18) */}
      <g opacity={isHovered ? '1' : '0.7'}>
        <path
          d={
            isHovered
              ? 'M 88 34 Q 128 10 168 34'
              : 'M 88 32 Q 128 8 168 54'
          }
          fill="none"
          stroke="#4B8F8C"
          strokeWidth="1.2"
          strokeDasharray="2.5 2"
          markerEnd="url(#cs-cyan-arr)"
          style={{
            transition: 'all 450ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
        {/* Swap Label Chip */}
        <g transform="translate(112, 10)">
          <rect width="32" height="12" rx="2.5" fill="#151B16" stroke="#4B8F8C" strokeWidth="0.8" />
          <text x="16" y="8" fill="#4B8F8C" fontSize="5.5" fontFamily="Space Mono, monospace" fontWeight="700" textAnchor="middle">
            {isHovered ? 'SWAPPED' : 'CMP &gt; 0'}
          </text>
        </g>
      </g>

      {/* Dual Pointer Markers (i and j) */}
      <g transform="translate(88, 102)">
        <polygon points="0,0 -3,4 3,4" fill="#4B8F8C" />
        <text x="0" y="8" fill="#4B8F8C" fontSize="6" fontFamily="Space Mono, monospace" textAnchor="middle">
          i
        </text>
      </g>
      <g transform="translate(168, 102)">
        <polygon points="0,0 -3,4 3,4" fill="#BA8230" />
        <text x="0" y="8" fill="#BA8230" fontSize="6" fontFamily="Space Mono, monospace" textAnchor="middle">
          j
        </text>
      </g>

      {/* Top Left Algorithm Chip */}
      <g transform="translate(14, 12)">
        <rect width="90" height="18" rx="4" fill="#151B16" stroke="#2B3025" strokeWidth="0.8" />
        <rect width="2.5" height="18" rx="1" fill="#4B8F8C" />
        <text x="8" y="12" fill="#E6ECE8" fontSize="7" fontFamily="Space Mono, monospace" fontWeight="700">
          PARTITION A[p..r]
        </text>
      </g>

      {/* Top Right Big-O Chip */}
      <g transform="translate(268, 12)">
        <rect width="78" height="18" rx="4" fill="#151B16" stroke="#2B3025" strokeWidth="0.8" />
        <rect width="2.5" height="18" rx="1" fill="#BA8230" />
        <text x="8" y="12" fill="#8FA396" fontSize="6.5" fontFamily="Space Mono, monospace">
          O(N log N) AVG
        </text>
      </g>
    </svg>
  );
}
