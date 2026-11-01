'use client';

import React from 'react';

export interface GenLabsAiApparatusGraphicProps {
  className?: string;
  variant?: 'compact' | 'hero';
}

/**
 * GEN LABS AI Empirical Reasoning Apparatus
 * Scientific illustration: AI Tutor Guided Discovery & Parameter Spectrometry
 * Concept:
 * - Concentric calibration reticles representing hypothesis -> simulation -> empirical deduction
 * - Angular vernier scale with precision degree ticks
 * - Converging optical collimator rays focusing telemetry into a central reasoning prism
 * - Pure GEN LABS palette (#0E1410 ground, #1D4838 bedrock, #4B8F8C telemetry, #BA8230 energy)
 */
export function GenLabsAiApparatusGraphic({
  className = 'w-full h-full',
  variant = 'hero',
}: GenLabsAiApparatusGraphicProps) {
  if (variant === 'compact') {
    return (
      <svg
        viewBox="0 0 80 80"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Lambang Aparatur Tanya AI Laboratorium"
      >
        <rect width="80" height="80" rx="16" fill="#151B16" stroke="#2B3025" strokeWidth="1" />
        {/* Outer Vernier Ring */}
        <circle cx="40" cy="40" r="28" stroke="#1D4838" strokeWidth="1.2" strokeDasharray="4 2" />
        {/* Active Reticle */}
        <circle cx="40" cy="40" r="20" stroke="#4B8F8C" strokeWidth="1" opacity="0.8" />
        {/* Crosshair Datum */}
        <line x1="40" y1="14" x2="40" y2="66" stroke="#2B3025" strokeWidth="0.8" />
        <line x1="14" y1="40" x2="66" y2="40" stroke="#2B3025" strokeWidth="0.8" />
        {/* Central Reasoning Prism */}
        <polygon points="40,28 49,46 31,46" fill="#1D241E" stroke="#BA8230" strokeWidth="1.4" />
        <circle cx="40" cy="40" r="3" fill="#4B8F8C" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 380 180"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Aparatur Penalaran Tanya AI Laboratorium"
    >
      <defs>
        {/* Orthogonal graticule */}
        <pattern id="tutor-graticule" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" stroke="#2B3025" strokeWidth="0.5" strokeOpacity="0.4" />
        </pattern>
        {/* Cyan arrow */}
        <marker id="tut-cyan-arr" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 1 L 5 3 L 0 5 Z" fill="#4B8F8C" />
        </marker>
        {/* Ochre arrow */}
        <marker id="tut-ochre-arr" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 1 L 5 3 L 0 5 Z" fill="#BA8230" />
        </marker>
      </defs>

      {/* Recessed Ground Surface */}
      <rect width="380" height="180" fill="#0E1410" rx="12" />
      <rect width="380" height="180" fill="url(#tutor-graticule)" rx="12" />

      {/* Outer Border Seam */}
      <rect x="0.5" y="0.5" width="379" height="179" rx="11.5" stroke="#2B3025" strokeWidth="1" />

      {/* ── LEFT APPARATUS: TELEMETRY SENSOR MATRIX ── */}
      <g transform="translate(24, 38)">
        <text x="0" y="0" fill="#8FA396" fontSize="7" fontFamily="Space Mono, monospace" fontWeight="700">
          INPUT OBSERVASI SISWA
        </text>

        {/* Observation Data Stream Tracks */}
        {[
          { label: 'Gaya F', val: '60.0 N', color: '#BA8230' },
          { label: 'Massa m', val: '5.00 kg', color: '#4B8F8C' },
          { label: 'Respon a', val: '12.0 m/s²', color: '#E6ECE8' },
        ].map((row, idx) => (
          <g key={idx} transform={`translate(0, ${14 + idx * 24})`}>
            <rect width="108" height="20" rx="4" fill="#151B16" stroke="#2B3025" strokeWidth="0.8" />
            <rect width="2" height="20" rx="1" fill={row.color} />
            <text x="8" y="13" fill="#8FA396" fontSize="6.5" fontFamily="Space Mono, monospace">
              {row.label}
            </text>
            <text x="100" y="13" fill={row.color} fontSize="7" fontFamily="Space Mono, monospace" fontWeight="700" textAnchor="end">
              {row.val}
            </text>
            {/* Horizontal Connecting Ray to Center Collimator */}
            <line
              x1="108"
              y1="10"
              x2="148"
              y2={56}
              stroke="#2B3025"
              strokeWidth="0.9"
              strokeDasharray="2 2"
            />
          </g>
        ))}
      </g>

      {/* ── CENTRAL APPARATUS: EMPIRICAL REASONING CORE ── */}
      <g transform="translate(190, 90)">
        {/* Outer Circular Calibrated Ring (Radius 62) */}
        <circle cx="0" cy="0" r="62" stroke="#1D4838" strokeWidth="1.2" />

        {/* Vernier Degree Ticks around the circumference */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = Math.cos(rad) * 58;
          const y1 = Math.sin(rad) * 58;
          const x2 = Math.cos(rad) * 62;
          const y2 = Math.sin(rad) * 62;
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4B8F8C" strokeWidth="1" opacity="0.6" />;
        })}

        {/* Inner Counter-Rotating Reticle (Radius 46) */}
        <circle cx="0" cy="0" r="46" stroke="#4B8F8C" strokeWidth="1" strokeDasharray="6 3" opacity="0.75" />

        {/* Orthogonal Reticle Crosshairs */}
        <line x1="-54" y1="0" x2="54" y2="0" stroke="#2B3025" strokeWidth="1" />
        <line x1="0" y1="-54" x2="0" y2="54" stroke="#2B3025" strokeWidth="1" />

        {/* Inner Chamber (Radius 30) */}
        <circle cx="0" cy="0" r="30" fill="#151B16" stroke="#2B3025" strokeWidth="1.2" />

        {/* GEN LABS AI Inversion Prism (Triangular Optics) */}
        <polygon
          points="0,-22 19,12 -19,12"
          fill="#1D241E"
          stroke="#BA8230"
          strokeWidth="1.6"
        />

        {/* Refracted Beam in Prism */}
        <line x1="-10" y1="2" x2="10" y2="2" stroke="#4B8F8C" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="3.5" fill="#BA8230" />

        {/* Angular Coordinate Labels */}
        <text x="0" y="-48" fill="#8FA396" fontSize="5.5" fontFamily="Space Mono, monospace" textAnchor="middle">
          0° HIPOTESIS
        </text>
        <text x="48" y="2" fill="#8FA396" fontSize="5.5" fontFamily="Space Mono, monospace">
          90° DATA
        </text>
        <text x="0" y="52" fill="#8FA396" fontSize="5.5" fontFamily="Space Mono, monospace" textAnchor="middle">
          180° VALIDASI
        </text>
        <text x="-48" y="2" fill="#8FA396" fontSize="5.5" fontFamily="Space Mono, monospace" textAnchor="end">
          270° SINTESIS
        </text>
      </g>

      {/* ── RIGHT APPARATUS: GUIDANCE OUTPUT ── */}
      <g transform="translate(244, 38)">
        <text x="0" y="0" fill="#4B8F8C" fontSize="7" fontFamily="Space Mono, monospace" fontWeight="700">
          ANALISIS &amp; PANDUAN BELAJAR
        </text>

        {/* Output Guidance Nodes */}
        {[
          { label: 'Analisis Sebab-Akibat', status: 'VERIFIED', color: '#4B8F8C' },
          { label: 'Pemberian Pertanyaan Pemandu', status: 'ACTIVE', color: '#BA8230' },
          { label: 'Konfirmasi Mandiri Siswa', status: 'PENDING', color: '#8FA396' },
        ].map((node, idx) => (
          <g key={idx} transform={`translate(0, ${14 + idx * 24})`}>
            <rect width="112" height="20" rx="4" fill="#151B16" stroke="#2B3025" strokeWidth="0.8" />
            <circle cx="8" cy="10" r="2.5" fill={node.color} />
            <text x="16" y="13" fill="#E6ECE8" fontSize="6" fontFamily="Space Mono, monospace">
              {node.label}
            </text>
            {/* Connecting line back from center */}
            <line
              x1="-14"
              y1="10"
              x2="0"
              y2="10"
              stroke="#4B8F8C"
              strokeWidth="0.9"
              strokeDasharray="2 1.5"
            />
          </g>
        ))}
      </g>

      {/* Top Left Instrument Tag */}
      <g transform="translate(14, 12)">
        <rect width="124" height="18" rx="4" fill="#151B16" stroke="#2B3025" strokeWidth="0.8" />
        <rect width="2.5" height="18" rx="1" fill="#4B8F8C" />
        <text x="8" y="12" fill="#E6ECE8" fontSize="7" fontFamily="Space Mono, monospace" fontWeight="700">
          GEN LABS // ASISTEN AI
        </text>
      </g>

      {/* Top Right Operational Telemetry */}
      <g transform="translate(262, 12)">
        <rect width="104" height="18" rx="4" fill="#151B16" stroke="#2B3025" strokeWidth="0.8" />
        <rect width="2.5" height="18" rx="1" fill="#BA8230" />
        <text x="8" y="12" fill="#BA8230" fontSize="6.5" fontFamily="Space Mono, monospace" fontWeight="700">
          MODE: PANDUAN INTERAKTIF
        </text>
      </g>

      {/* Bottom Telemetry Baseline */}
      <g transform="translate(14, 154)">
        <line x1="0" y1="0" x2="352" y2="0" stroke="#2B3025" strokeWidth="0.8" />
        <text x="0" y="14" fill="#8FA396" fontSize="6.5" fontFamily="Space Mono, monospace">
          RESPON CEPAT // KURIKULUM VOKASI &amp; STEM // GEN LABS AI
        </text>
      </g>
    </svg>
  );
}
