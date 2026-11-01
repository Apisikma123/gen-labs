'use client';

import { useState } from 'react';

interface SimulationPreviewGraphicProps {
  slug: string;
  className?: string;
  preferPhoto?: boolean;
  src?: string | null;
}

const PHOTO_PREVIEWS: Record<string, string> = {};

function resolvePreviewSlug(slug: string): string {
  const lower = (slug || '').toLowerCase();
  if (lower.includes('newton') || lower.includes('gaya') || lower.includes('force')) return 'newtons-second-law';
  if (lower.includes('projectile') || lower.includes('peluru') || (lower.includes('parabola') && !lower.includes('fungsi') && !lower.includes('kuadrat'))) return 'projectile-motion';
  if (lower.includes('momentum') || lower.includes('collision') || lower.includes('tumbukan')) return 'momentum-collision';
  if (lower.includes('function') || lower.includes('fungsi') || lower.includes('kuadrat') || lower.includes('parabola')) return 'function-explorer';
  if (lower.includes('vector') || lower.includes('vektor')) return 'vector-math';
  if (lower.includes('probab') || lower.includes('peluang') || lower.includes('coin') || lower.includes('koin')) return 'probability-coin';
  if (lower.includes('sort') || lower.includes('urut')) return 'sorting-algorithms';
  if (lower.includes('binary') || lower.includes('biner') || lower.includes('search')) return 'binary-search';
  if (lower.includes('stack') || lower.includes('queue') || lower.includes('antrean')) return 'stack-queue';
  if (lower.includes('big-o') || lower.includes('kompleksitas')) return 'big-o';
  if (lower.includes('basis-data') || lower.includes('database') || lower.includes('sql') || lower.includes('index')) return 'database-index';
  if (lower.includes('subnet') || lower.includes('jaringan') || lower.includes('cidr') || lower.includes('network') || lower.includes('ip')) return 'network-subnet';
  if (lower.includes('logika') || lower.includes('gerbang') || lower.includes('boolean') || lower.includes('digital')) return 'logic-gates';
  if (lower.includes('akuntansi') || lower.includes('balance') || lower.includes('neraca') || lower.includes('pajak')) return 'accounting-ledger';
  if (lower.includes('graph') || lower.includes('graf') || lower.includes('traversal')) return 'graph-traversal';
  if (lower.includes('regres') || lower.includes('linear')) return 'linear-regression';
  if (lower.includes('normal') || lower.includes('gauss') || lower.includes('distribusi')) return 'normal-distribution';
  if (lower.includes('demand') || lower.includes('supply') || lower.includes('pasar') || lower.includes('ekonomi') || lower.includes('ekuilibrium')) return 'supply-demand';
  if (lower.includes('interest') || lower.includes('bunga') || lower.includes('compound')) return 'compound-interest';
  if (lower.includes('ph') || lower.includes('asam') || lower.includes('basa')) return 'ph-scale';
  return slug;
}

export function SimulationPreviewGraphic({
  slug,
  className = '',
  preferPhoto = false,
  src,
}: SimulationPreviewGraphicProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const targetSlug = resolvePreviewSlug(slug);
  const photoUrl = !imgFailed ? (src || (preferPhoto ? PHOTO_PREVIEWS[targetSlug] : null)) : null;

  const renderSvgPreview = () => {
    switch (targetSlug) {
      // 1. HUKUM II NEWTON (DINAMIKA GERAK)
      case 'newtons-second-law':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            {/* Grid */}
            <defs>
              <pattern id="grid-newton" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#grid-newton)" />

            {/* Formula Badge */}
            <rect x="18" y="16" width="94" height="22" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
            <text x="65" y="31" fill="var(--color-primary)" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              F = m × a
            </text>

            {/* Runway */}
            <line x1="24" y1="126" x2="296" y2="126" stroke="var(--color-border)" strokeWidth="2" />
            {[40, 70, 100, 130, 160, 190, 220, 250, 280].map((x) => (
              <line key={x} x1={x} y1="126" x2={x - 8} y2="136" stroke="var(--color-border)" strokeWidth="1" strokeOpacity="0.6" />
            ))}

            {/* Mass Block */}
            <rect x="85" y="78" width="68" height="48" rx="6" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="2" />
            <rect x="91" y="84" width="56" height="36" rx="3" fill="var(--color-primary-soft)" />
            <text x="119" y="106" fill="var(--color-primary-text)" fontSize="12" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              5.0 kg
            </text>

            {/* Force Vector (Right) */}
            <line x1="155" y1="102" x2="236" y2="102" stroke="var(--color-primary)" strokeWidth="3" />
            <polygon points="236,96 248,102 236,108" fill="var(--color-primary)" />
            <text x="195" y="93" fill="var(--color-primary)" fontSize="11" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              F = 25 N →
            </text>

            {/* Friction Vector (Left, Dashed) */}
            <line x1="83" y1="116" x2="35" y2="116" stroke="#d97706" strokeWidth="2" strokeDasharray="3 2" />
            <polygon points="37,112 28,116 37,120" fill="#d97706" />
            <text x="56" y="110" fill="#d97706" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              ← f_k
            </text>

            {/* Acceleration Tag */}
            <rect x="18" y="146" width="130" height="20" rx="4" fill="var(--color-primary-soft)" />
            <text x="83" y="160" fill="var(--color-primary-text)" fontSize="10" fontFamily="monospace" fontWeight="600" textAnchor="middle">
              a = 4.80 m/s² →
            </text>
          </svg>
        );

      // 2. GERAK PARABOLA 2D
      case 'projectile-motion':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            <defs>
              <pattern id="grid-proj" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#grid-proj)" />

            {/* Ground */}
            <line x1="20" y1="145" x2="300" y2="145" stroke="var(--color-border)" strokeWidth="2" />

            {/* Trajectory Parabolic Curve */}
            <path
              d="M 40 145 Q 150 25 265 145"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
              strokeDasharray="5 3"
              fill="none"
            />

            {/* Launcher Base & Barrel */}
            <rect x="28" y="140" width="24" height="6" rx="2" fill="var(--color-text)" opacity="0.4" />
            <line x1="40" y1="145" x2="62" y2="123" stroke="var(--color-primary)" strokeWidth="4" strokeLinecap="round" />
            <polygon points="61,117 70,121 65,129" fill="var(--color-primary)" />

            {/* Angle Arc */}
            <path d="M 58 145 A 18 18 0 0 0 54 131" stroke="#d97706" strokeWidth="1.5" />
            <text x="68" y="137" fill="#d97706" fontSize="10" fontFamily="monospace" fontWeight="700">
              45°
            </text>

            {/* Apex (Peak Height) Marker */}
            <circle cx="150" cy="85" r="4.5" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="2" />
            <line x1="150" y1="85" x2="150" y2="145" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="2 2" />
            <rect x="120" y="60" width="60" height="18" rx="3" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
            <text x="150" y="73" fill="var(--color-primary)" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              H = 23.0m
            </text>

            {/* Landing Target Marker */}
            <circle cx="265" cy="145" r="5" fill="#ef4444" />
            <circle cx="265" cy="145" r="10" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" />
            <rect x="235" y="152" width="60" height="18" rx="3" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
            <text x="265" y="165" fill="var(--color-text)" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              R = 91.8m
            </text>

            {/* Formula Header */}
            <text x="28" y="28" fill="var(--color-text-secondary)" fontSize="10" fontFamily="monospace" fontWeight="600">
              v₀ = 30 m/s, θ = 45°
            </text>
          </svg>
        );

      // 3. TABRAKAN MOMENTUM & ELASTISITAS
      case 'momentum-collision':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            <defs>
              <pattern id="grid-mom" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#grid-mom)" />

            {/* Track */}
            <line x1="20" y1="120" x2="300" y2="120" stroke="var(--color-border)" strokeWidth="2" />

            {/* Sphere 1 (Moving Right) */}
            <circle cx="85" cy="98" r="22" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="2" />
            <text x="85" y="103" fill="var(--color-primary-text)" fontSize="11" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              m₁
            </text>
            <line x1="110" y1="98" x2="148" y2="98" stroke="var(--color-primary)" strokeWidth="2.5" />
            <polygon points="148,93 158,98 148,103" fill="var(--color-primary)" />
            <text x="130" y="88" fill="var(--color-primary)" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              v₁ = 4m/s
            </text>

            {/* Impact Flash Line */}
            <line x1="168" y1="75" x2="168" y2="121" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 2" />
            <polygon points="168,76 172,84 180,84 174,89 176,97 168,92 160,97 162,89 156,84 164,84" fill="#d97706" opacity="0.75" />

            {/* Sphere 2 (Target) */}
            <circle cx="215" cy="98" r="22" fill="var(--color-surface)" stroke="#0284c7" strokeWidth="2" />
            <text x="215" y="103" fill="#0284c7" fontSize="11" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              m₂
            </text>
            <text x="215" y="70" fill="var(--color-text-secondary)" fontSize="9" fontFamily="monospace" textAnchor="middle">
              v₂ = 0
            </text>

            {/* Momentum Law Pill */}
            <rect x="60" y="142" width="200" height="22" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
            <text x="160" y="157" fill="var(--color-text)" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              p_tot = m₁v₁ + m₂v₂ = 8 kg m/s
            </text>
          </svg>
        );

      // 4. FUNGSI & GRAFIK KUADRAT
      case 'function-explorer':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            <defs>
              <pattern id="grid-func" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#grid-func)" />

            {/* Cartesian Axes */}
            <line x1="20" y1="100" x2="300" y2="100" stroke="var(--color-border)" strokeWidth="1.5" />
            <line x1="160" y1="15" x2="160" y2="165" stroke="var(--color-border)" strokeWidth="1.5" />
            <text x="296" y="94" fill="var(--color-text-secondary)" fontSize="9" fontFamily="monospace">x</text>
            <text x="166" y="24" fill="var(--color-text-secondary)" fontSize="9" fontFamily="monospace">y</text>

            {/* Parabola Curve f(x) = x² - 4 */}
            <path
              d="M 80 30 Q 160 170 240 30"
              stroke="var(--color-primary)"
              strokeWidth="3"
              fill="none"
            />

            {/* Vertex Point (0, -4) */}
            <circle cx="160" cy="135" r="4.5" fill="var(--color-primary)" />
            <circle cx="160" cy="135" r="8" stroke="var(--color-primary)" strokeWidth="1" opacity="0.4" />
            <text x="160" y="154" fill="var(--color-primary)" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              Puncak (0, -4)
            </text>

            {/* Real Roots at X-axis */}
            <circle cx="107" cy="100" r="3.5" fill="#d97706" />
            <text x="107" y="92" fill="#d97706" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              x = -2
            </text>

            <circle cx="213" cy="100" r="3.5" fill="#d97706" />
            <text x="213" y="92" fill="#d97706" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              x = 2
            </text>

            {/* Formula Header */}
            <rect x="20" y="16" width="116" height="22" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
            <text x="78" y="31" fill="var(--color-text)" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              f(x) = x² - 4
            </text>
          </svg>
        );

      // 5. OPERASI VEKTOR 2D
      case 'vector-math':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            <defs>
              <pattern id="grid-vec" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#grid-vec)" />

            {/* Grid Axes */}
            <line x1="30" y1="140" x2="295" y2="140" stroke="var(--color-border)" strokeWidth="1.5" />
            <line x1="50" y1="20" x2="50" y2="165" stroke="var(--color-border)" strokeWidth="1.5" />

            {/* Vector A (Blue-Green) */}
            <line x1="50" y1="140" x2="160" y2="55" stroke="var(--color-primary)" strokeWidth="2.5" />
            <polygon points="156,51 166,51 161,61" fill="var(--color-primary)" />
            <text x="96" y="90" fill="var(--color-primary)" fontSize="10" fontFamily="monospace" fontWeight="700">
              A (4, 3)
            </text>

            {/* Vector B (Cyan) added to A */}
            <line x1="160" y1="55" x2="250" y2="90" stroke="#0284c7" strokeWidth="2.5" />
            <polygon points="245,84 255,92 243,96" fill="#0284c7" />
            <text x="214" y="66" fill="#0284c7" fontSize="10" fontFamily="monospace" fontWeight="700">
              B (2, -1)
            </text>

            {/* Resultant Vector R (Bold Emerald) */}
            <line x1="50" y1="140" x2="250" y2="90" stroke="#10b981" strokeWidth="3" />
            <polygon points="242,84 254,89 245,98" fill="#10b981" />
            <text x="145" y="128" fill="#10b981" fontSize="11" fontFamily="monospace" fontWeight="700">
              R = A + B
            </text>

            {/* Angle Arc */}
            <path d="M 80 140 A 30 30 0 0 0 76 128" stroke="#d97706" strokeWidth="1.5" />
            <text x="86" y="134" fill="#d97706" fontSize="9" fontFamily="monospace">
              18.4°
            </text>

            {/* Magnitude Readout */}
            <rect x="210" y="18" width="90" height="22" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
            <text x="255" y="33" fill="var(--color-text)" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              |R| = 6.32
            </text>
          </svg>
        );

      // 6. PELUANG & PROBABILITAS KOIN
      case 'probability-coin':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            <defs>
              <pattern id="grid-prob" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#grid-prob)" />

            {/* Base line */}
            <line x1="30" y1="145" x2="290" y2="145" stroke="var(--color-border)" strokeWidth="1.5" />

            {/* Bar 1: Heads (52%) */}
            <rect x="65" y="55" width="55" height="90" rx="4" fill="var(--color-primary)" />
            <text x="92" y="47" fill="var(--color-primary)" fontSize="11" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              52%
            </text>
            <text x="92" y="160" fill="var(--color-text)" fontSize="10" fontFamily="monospace" fontWeight="600" textAnchor="middle">
              Muka (H)
            </text>

            {/* Bar 2: Tails (48%) */}
            <rect x="145" y="65" width="55" height="80" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1.5" />
            <text x="172" y="57" fill="var(--color-text-secondary)" fontSize="11" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              48%
            </text>
            <text x="172" y="160" fill="var(--color-text)" fontSize="10" fontFamily="monospace" fontWeight="600" textAnchor="middle">
              Ekor (T)
            </text>

            {/* 50% Theoretical Line */}
            <line x1="45" y1="60" x2="225" y2="60" stroke="#d97706" strokeWidth="2" strokeDasharray="4 3" />
            <text x="210" y="45" fill="#d97706" fontSize="9" fontFamily="monospace" fontWeight="700">
              p = 0.50
            </text>

            {/* Coin Graphic */}
            <circle cx="260" cy="95" r="26" fill="var(--color-surface)" stroke="#d97706" strokeWidth="2" />
            <circle cx="260" cy="95" r="22" stroke="#d97706" strokeWidth="1" strokeDasharray="2 2" />
            <text x="260" y="100" fill="#d97706" fontSize="13" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              Rp
            </text>
            <text x="260" y="135" fill="var(--color-text-secondary)" fontSize="9" fontFamily="monospace" textAnchor="middle">
              n = 1000
            </text>
          </svg>
        );

      // 7. VISUALISASI ALGORITMA PENGURUTAN (SORTING)
      case 'sorting-algorithms':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            <defs>
              <pattern id="grid-sort" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#grid-sort)" />

            <line x1="24" y1="145" x2="296" y2="145" stroke="var(--color-border)" strokeWidth="1.5" />

            {/* Array Bars */}
            {[
              { h: 25, active: false, sorted: true },
              { h: 38, active: false, sorted: true },
              { h: 50, active: false, sorted: true },
              { h: 62, active: false, sorted: true },
              { h: 105, active: true, sorted: false },
              { h: 45, active: true, sorted: false },
              { h: 80, active: false, sorted: false },
              { h: 92, active: false, sorted: false },
              { h: 70, active: false, sorted: false },
              { h: 118, active: false, sorted: false },
              { h: 85, active: false, sorted: false },
              { h: 130, active: false, sorted: false },
            ].map((bar, i) => {
              const x = 32 + i * 22;
              const y = 145 - bar.h;
              const fillColor = bar.active
                ? '#10b981'
                : bar.sorted
                ? 'var(--color-primary)'
                : 'var(--color-border)';

              return (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width="16"
                  height={bar.h}
                  rx="3"
                  fill={fillColor}
                  stroke={bar.active ? '#059669' : 'none'}
                  strokeWidth={bar.active ? 1.5 : 0}
                />
              );
            })}

            {/* Swap Curved Arrow over active pair */}
            <path d="M 128 32 Q 139 18 150 32" stroke="#10b981" strokeWidth="2" fill="none" />
            <polygon points="152,30 152,38 144,35" fill="#10b981" />
            <text x="139" y="14" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              SWAP
            </text>

            {/* Complexity Badge */}
            <rect x="24" y="154" width="165" height="18" rx="3" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
            <text x="106" y="166" fill="var(--color-text-secondary)" fontSize="9" fontFamily="monospace" fontWeight="600" textAnchor="middle">
              Kompleksitas: O(n log n)
            </text>
          </svg>
        );

      // 8. PENCARIAN BINER (BINARY SEARCH)
      case 'binary-search':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            <defs>
              <pattern id="grid-bs" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#grid-bs)" />

            {/* Array Elements */}
            {[12, 24, 31, 42, 55, 68, 77, 89].map((val, i) => {
              const x = 24 + i * 34;
              const isTarget = val === 42;
              const isEliminated = i < 3;

              return (
                <g key={i}>
                  <rect
                    x={x}
                    y="75"
                    width="30"
                    height="38"
                    rx="4"
                    fill={isTarget ? 'var(--color-primary)' : 'var(--color-surface)'}
                    stroke={isTarget ? 'var(--color-primary)' : 'var(--color-border)'}
                    strokeWidth={isTarget ? 2 : 1}
                    opacity={isEliminated ? 0.35 : 1}
                  />
                  <text
                    x={x + 15}
                    y="98"
                    fill={isTarget ? '#ffffff' : 'var(--color-text)'}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {val}
                  </text>
                  <text x={x + 15} y="124" fill="var(--color-text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="middle">
                    [{i}]
                  </text>
                </g>
              );
            })}

            {/* Pointer Arrows */}
            {/* Low Pointer */}
            <polygon points="126,140 121,150 131,150" fill="#d97706" />
            <text x="126" y="162" fill="#d97706" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              L [3]
            </text>

            {/* Mid / Target Pointer */}
            <polygon points="141,65 136,55 146,55" fill="var(--color-primary)" />
            <text x="141" y="48" fill="var(--color-primary)" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              TARGET = 42
            </text>

            {/* High Pointer */}
            <polygon points="277,140 272,150 282,150" fill="#0284c7" />
            <text x="277" y="162" fill="#0284c7" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              H [7]
            </text>

            {/* Header info */}
            <text x="24" y="28" fill="var(--color-text)" fontSize="10" fontFamily="monospace" fontWeight="700">
              Divide &amp; Conquer: ⌈log₂ 8⌉ = 3 Langkah
            </text>
          </svg>
        );

      // 9. PENELUSURAN GRAF (BFS & DFS)
      case 'graph-traversal':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            <defs>
              <pattern id="grid-graph" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#grid-graph)" />

            {/* Graph Edges */}
            <line x1="55" y1="90" x2="125" y2="45" stroke="var(--color-primary)" strokeWidth="3" />
            <line x1="55" y1="90" x2="125" y2="135" stroke="var(--color-border)" strokeWidth="1.5" />
            <line x1="125" y1="45" x2="205" y2="45" stroke="var(--color-primary)" strokeWidth="3" />
            <line x1="125" y1="45" x2="205" y2="135" stroke="var(--color-border)" strokeWidth="1.5" strokeDasharray="3 2" />
            <line x1="125" y1="135" x2="205" y2="135" stroke="var(--color-border)" strokeWidth="1.5" />
            <line x1="205" y1="45" x2="275" y2="90" stroke="var(--color-primary)" strokeWidth="3" />
            <line x1="205" y1="135" x2="275" y2="90" stroke="var(--color-border)" strokeWidth="1.5" />

            {/* Visited Path Label */}
            <text x="160" y="24" fill="var(--color-primary)" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              Lintasan Terpendek: A → B → D → F
            </text>

            {/* Graph Nodes */}
            {[
              { id: 'A', x: 55, y: 90, visited: true, order: 1 },
              { id: 'B', x: 125, y: 45, visited: true, order: 2 },
              { id: 'C', x: 125, y: 135, visited: false },
              { id: 'D', x: 205, y: 45, visited: true, order: 3 },
              { id: 'E', x: 205, y: 135, visited: false },
              { id: 'F', x: 275, y: 90, visited: true, order: 4 },
            ].map((node) => (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="16"
                  fill={node.visited ? 'var(--color-primary)' : 'var(--color-surface)'}
                  stroke={node.visited ? 'var(--color-primary)' : 'var(--color-border)'}
                  strokeWidth="2"
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  fill={node.visited ? '#ffffff' : 'var(--color-text)'}
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {node.id}
                </text>
                {node.order && (
                  <circle cx={node.x + 12} cy={node.y - 12} r="6" fill="#d97706" />
                )}
                {node.order && (
                  <text x={node.x + 12} y={node.y - 9} fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="700" textAnchor="middle">
                    {node.order}
                  </text>
                )}
              </g>
            ))}
          </svg>
        );

      // 10. REGRESI LINEAR ORDINARY LEAST SQUARES (OLS)
      case 'linear-regression':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            <defs>
              <pattern id="grid-reg" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#grid-reg)" />

            {/* Axes */}
            <line x1="30" y1="145" x2="290" y2="145" stroke="var(--color-border)" strokeWidth="1.5" />
            <line x1="45" y1="20" x2="45" y2="155" stroke="var(--color-border)" strokeWidth="1.5" />

            {/* Regression Line: y = mx + c */}
            <line x1="50" y1="135" x2="280" y2="35" stroke="var(--color-primary)" strokeWidth="3" />

            {/* Residual error vertical dashes & Scatter points */}
            {[
              { x: 70, y: 130, py: 125 },
              { x: 95, y: 110, py: 115 },
              { x: 120, y: 112, py: 105 },
              { x: 145, y: 88, py: 94 },
              { x: 170, y: 80, py: 83 },
              { x: 195, y: 65, py: 72 },
              { x: 220, y: 68, py: 61 },
              { x: 245, y: 46, py: 50 },
              { x: 270, y: 35, py: 40 },
            ].map((pt, i) => (
              <g key={i}>
                <line x1={pt.x} y1={pt.y} x2={pt.x} y2={pt.py} stroke="#d97706" strokeWidth="1" strokeDasharray="2 2" />
                <circle cx={pt.x} cy={pt.y} r="3.5" fill="var(--color-primary)" stroke="var(--color-surface)" strokeWidth="1.5" />
              </g>
            ))}

            {/* Metrics */}
            <rect x="55" y="16" width="130" height="22" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
            <text x="120" y="31" fill="var(--color-primary)" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              y = 2.05x + 4.80
            </text>
            <text x="285" y="31" fill="#d97706" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="end">
              R² = 0.85
            </text>
          </svg>
        );

      // 11. DISTRIBUSI NORMAL GAUSSIAN
      case 'normal-distribution':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            <defs>
              <pattern id="grid-norm" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#grid-norm)" />

            {/* Baseline */}
            <line x1="20" y1="145" x2="300" y2="145" stroke="var(--color-border)" strokeWidth="1.5" />

            {/* Shaded Area between -1σ and +1σ */}
            <path
              d="M 115 145 C 130 142, 145 110, 160 55 C 175 110, 190 142, 205 145 Z"
              fill="var(--color-primary-soft)"
              opacity="0.8"
            />

            {/* Gaussian Bell Curve */}
            <path
              d="M 30 145 C 80 145, 115 140, 140 85 C 150 55, 170 55, 180 85 C 205 140, 240 145, 290 145"
              stroke="var(--color-primary)"
              strokeWidth="3"
              fill="none"
            />

            {/* Mean dashed line */}
            <line x1="160" y1="45" x2="160" y2="145" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Standard Deviation Ticks & Labels */}
            <text x="160" y="160" fill="var(--color-text)" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              μ (0)
            </text>
            <text x="115" y="160" fill="var(--color-text-secondary)" fontSize="9" fontFamily="monospace" textAnchor="middle">
              -1σ
            </text>
            <text x="205" y="160" fill="var(--color-text-secondary)" fontSize="9" fontFamily="monospace" textAnchor="middle">
              +1σ
            </text>

            {/* Area Label */}
            <text x="160" y="98" fill="var(--color-primary-text)" fontSize="11" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              68.2%
            </text>

            {/* Formula Header */}
            <text x="24" y="26" fill="var(--color-text)" fontSize="10" fontFamily="monospace" fontWeight="700">
              f(z) = [1/√(2π)] e^(-½z²)
            </text>
          </svg>
        );

      // 12. SUPPLY & DEMAND (KESEIMBANGAN PASAR)
      case 'supply-demand':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            <defs>
              <pattern id="grid-sd" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#grid-sd)" />

            {/* Axes */}
            <line x1="45" y1="145" x2="295" y2="145" stroke="var(--color-border)" strokeWidth="1.5" />
            <line x1="45" y1="20" x2="45" y2="155" stroke="var(--color-border)" strokeWidth="1.5" />
            <text x="290" y="138" fill="var(--color-text-secondary)" fontSize="9" fontFamily="monospace">Q</text>
            <text x="32" y="24" fill="var(--color-text-secondary)" fontSize="9" fontFamily="monospace">P</text>

            {/* Demand Curve (Downward Sloping, Green) */}
            <line x1="60" y1="40" x2="260" y2="140" stroke="var(--color-primary)" strokeWidth="3" />
            <text x="268" y="145" fill="var(--color-primary)" fontSize="10" fontFamily="monospace" fontWeight="700">
              D
            </text>

            {/* Supply Curve (Upward Sloping, Amber) */}
            <line x1="60" y1="140" x2="260" y2="40" stroke="#d97706" strokeWidth="3" />
            <text x="268" y="44" fill="#d97706" fontSize="10" fontFamily="monospace" fontWeight="700">
              S
            </text>

            {/* Equilibrium Point E (160, 90) */}
            <line x1="45" y1="90" x2="160" y2="90" stroke="var(--color-text-secondary)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="160" y1="90" x2="160" y2="145" stroke="var(--color-text-secondary)" strokeWidth="1" strokeDasharray="3 3" />

            <circle cx="160" cy="90" r="5" fill="var(--color-primary)" />
            <circle cx="160" cy="90" r="10" stroke="var(--color-primary)" strokeWidth="1" opacity="0.4" />

            <text x="160" y="80" fill="var(--color-text)" fontSize="11" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              Ekuilibrium (E)
            </text>
            <text x="40" y="93" fill="var(--color-text)" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="end">
              P*
            </text>
            <text x="160" y="160" fill="var(--color-text)" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              Q* = 20
            </text>
          </svg>
        );

      // 13. BUNGA MAJEMUK & INVESTASI
      case 'compound-interest':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            <defs>
              <pattern id="grid-comp" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#grid-comp)" />

            {/* Axes */}
            <line x1="45" y1="145" x2="290" y2="145" stroke="var(--color-border)" strokeWidth="1.5" />
            <line x1="45" y1="20" x2="45" y2="155" stroke="var(--color-border)" strokeWidth="1.5" />
            <text x="285" y="138" fill="var(--color-text-secondary)" fontSize="9" fontFamily="monospace">Tahun</text>

            {/* Shaded Interest Difference */}
            <path
              d="M 50 135 L 260 95 L 260 38 Q 160 110 50 135 Z"
              fill="var(--color-primary-soft)"
              opacity="0.85"
            />

            {/* Simple Interest Baseline (Linear) */}
            <line x1="50" y1="135" x2="260" y2="95" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />
            <text x="268" y="100" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              Tunggal
            </text>

            {/* Compound Interest Curve (Exponential) */}
            <path
              d="M 50 135 Q 160 110 260 38"
              stroke="var(--color-primary)"
              strokeWidth="3.5"
              fill="none"
            />

            {/* Final Target Marker */}
            <circle cx="260" cy="38" r="4.5" fill="var(--color-primary)" />
            <rect x="175" y="24" width="80" height="20" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
            <text x="215" y="38" fill="var(--color-primary)" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              1.47x Nilai
            </text>

            {/* Formula Banner */}
            <text x="50" y="26" fill="var(--color-text)" fontSize="10" fontFamily="monospace" fontWeight="700">
              A = P(1 + r/n)^(nt)
            </text>
          </svg>
        );

      // 14. SKALA PH & KESETIMBANGAN ASAM-BASA
      case 'ph-scale':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            <defs>
              <pattern id="grid-ph" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
              {/* Spectrum Gradient Strip */}
              <linearGradient id="phBarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="25%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="75%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <rect width="320" height="180" fill="url(#grid-ph)" />

            {/* Laboratory Erlenmeyer Flask */}
            <g transform="translate(35, 30)">
              {/* Flask Neck & Body */}
              <path
                d="M 25 15 L 25 45 L 6 95 A 6 6 0 0 0 11 103 L 69 103 A 6 6 0 0 0 74 95 L 55 45 L 55 15"
                stroke="var(--color-text)"
                strokeWidth="2.5"
                fill="none"
              />
              <line x1="20" y1="15" x2="60" y2="15" stroke="var(--color-text)" strokeWidth="3" strokeLinecap="round" />

              {/* Liquid Solution Inside (Neutral Green) */}
              <path
                d="M 14 85 L 66 85 L 70 95 A 4 4 0 0 1 66 100 L 14 100 A 4 4 0 0 1 10 95 Z"
                fill="#10b981"
                opacity="0.85"
              />
              <ellipse cx="40" cy="85" rx="26" ry="4" fill="#34d399" />
              {/* Bubbles */}
              <circle cx="34" cy="92" r="2" fill="#ffffff" opacity="0.6" />
              <circle cx="48" cy="90" r="1.5" fill="#ffffff" opacity="0.6" />
            </g>

            {/* Horizontal pH Gradient Bar */}
            <rect x="135" y="80" width="155" height="18" rx="6" fill="url(#phBarGradient)" />

            {/* Indicator Pointer aimed at pH 7.00 */}
            <polygon points="212,74 207,64 217,64" fill="#10b981" />
            <rect x="180" y="38" width="65" height="22" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
            <text x="212" y="53" fill="var(--color-primary)" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              pH 7.00
            </text>

            {/* Scale End Labels */}
            <text x="135" y="112" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="700">
              0 (Asam)
            </text>
            <text x="212" y="112" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              Netral
            </text>
            <text x="290" y="112" fill="#7c3aed" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="end">
              14 (Basa)
            </text>

            {/* Formula */}
            <text x="135" y="145" fill="var(--color-text-secondary)" fontSize="9" fontFamily="monospace">
              pH = -log₁₀[H⁺]
            </text>
          </svg>
        );

      // 15. STRUKTUR DATA STACK & QUEUE (LIFO / FIFO)
      case 'stack-queue':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            <defs>
              <pattern id="grid-sq" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#grid-sq)" />
            {/* Formula Header */}
            <rect x="18" y="14" width="130" height="20" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
            <text x="83" y="28" fill="var(--color-primary-text)" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              LIFO (STACK) / FIFO (QUEUE)
            </text>
            {/* Stack Container */}
            <rect x="36" y="52" width="70" height="96" rx="4" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="0 70 96 70" />
            <rect x="42" y="118" width="58" height="22" rx="3" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
            <text x="71" y="133" fill="var(--color-text)" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">[0] 10</text>
            <rect x="42" y="92" width="58" height="22" rx="3" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
            <text x="71" y="107" fill="var(--color-text)" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">[1] 25</text>
            <rect x="42" y="66" width="58" height="22" rx="3" fill="var(--color-primary)" stroke="#4B8F8C" strokeWidth="1" />
            <text x="71" y="81" fill="#FFFFFF" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">[2] 42</text>
            {/* Stack Pointer */}
            <text x="120" y="81" fill="#4B8F8C" fontSize="9" fontFamily="monospace" fontWeight="700">← TOP</text>
            {/* Queue Pipeline */}
            <g transform="translate(160, 68)">
              <rect x="0" y="12" width="128" height="38" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1.5" />
              <rect x="10" y="18" width="26" height="26" rx="3" fill="var(--color-primary-soft)" />
              <text x="23" y="35" fill="var(--color-text)" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">A</text>
              <rect x="42" y="18" width="26" height="26" rx="3" fill="var(--color-primary-soft)" />
              <text x="55" y="35" fill="var(--color-text)" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">B</text>
              <rect x="74" y="18" width="26" height="26" rx="3" fill="var(--color-primary)" />
              <text x="87" y="35" fill="#FFFFFF" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">C</text>
              <text x="14" y="58" fill="#BA8230" fontSize="8" fontFamily="monospace">DEQUEUE →</text>
              <text x="74" y="58" fill="#4B8F8C" fontSize="8" fontFamily="monospace">← ENQUEUE</text>
            </g>
          </svg>
        );

      // 16. KOMPLEKSITAS ALGORITMA (BIG-O NOTATION)
      case 'big-o':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            <defs>
              <pattern id="grid-bo" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#grid-bo)" />
            {/* Axes */}
            <line x1="36" y1="145" x2="295" y2="145" stroke="var(--color-border)" strokeWidth="1.5" />
            <line x1="36" y1="20" x2="36" y2="145" stroke="var(--color-border)" strokeWidth="1.5" />
            <text x="280" y="157" fill="var(--color-text-secondary)" fontSize="9" fontFamily="monospace">Elemen (n)</text>
            <text x="44" y="28" fill="var(--color-text-secondary)" fontSize="9" fontFamily="monospace">Waktu O(n)</text>
            {/* Curves */}
            {/* O(1) Constant */}
            <line x1="36" y1="130" x2="280" y2="130" stroke="#4B8F8C" strokeWidth="2" />
            <text x="286" y="133" fill="#4B8F8C" fontSize="8" fontFamily="monospace" fontWeight="700">O(1)</text>
            {/* O(log n) */}
            <path d="M 36 140 Q 120 115 280 102" stroke="#8ED3CF" strokeWidth="2" fill="none" />
            <text x="286" y="105" fill="#8ED3CF" fontSize="8" fontFamily="monospace" fontWeight="700">O(log n)</text>
            {/* O(n) Linear */}
            <line x1="36" y1="145" x2="250" y2="60" stroke="#BA8230" strokeWidth="2" strokeDasharray="4 2" />
            <text x="256" y="62" fill="#BA8230" fontSize="8" fontFamily="monospace" fontWeight="700">O(n)</text>
            {/* O(n^2) Quadratic */}
            <path d="M 36 145 Q 120 140 180 30" stroke="#D9534F" strokeWidth="2.5" fill="none" />
            <text x="186" y="32" fill="#D9534F" fontSize="8" fontFamily="monospace" fontWeight="700">O(n²)</text>
          </svg>
        );

      // 17. BASIS DATA & INDEX QUERY EXECUTION
      case 'database-index':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            <defs>
              <pattern id="grid-db" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#grid-db)" />
            {/* Badge */}
            <rect x="18" y="14" width="126" height="20" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
            <text x="81" y="28" fill="var(--color-primary-text)" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              B-TREE INDEX SCAN
            </text>
            {/* Root Node */}
            <rect x="125" y="46" width="70" height="24" rx="4" fill="var(--color-surface)" stroke="#4B8F8C" strokeWidth="1.5" />
            <text x="160" y="62" fill="var(--color-text)" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">ID: 50 | 100</text>
            {/* Split Lines */}
            <line x1="140" y1="70" x2="70" y2="100" stroke="#4B8F8C" strokeWidth="1.5" />
            <line x1="160" y1="70" x2="160" y2="100" stroke="#4B8F8C" strokeWidth="1.5" />
            <line x1="180" y1="70" x2="250" y2="100" stroke="#4B8F8C" strokeWidth="1.5" />
            {/* Leaf Nodes */}
            <rect x="36" y="100" width="68" height="22" rx="3" fill="var(--color-primary-soft)" stroke="var(--color-border)" strokeWidth="1" />
            <text x="70" y="115" fill="var(--color-text)" fontSize="9" fontFamily="monospace" textAnchor="middle">ID: 1..49</text>
            <rect x="126" y="100" width="68" height="22" rx="3" fill="#1D4838" stroke="#4B8F8C" strokeWidth="1.5" />
            <text x="160" y="115" fill="#8ED3CF" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle">ID: 50..99</text>
            <rect x="216" y="100" width="68" height="22" rx="3" fill="var(--color-primary-soft)" stroke="var(--color-border)" strokeWidth="1" />
            <text x="250" y="115" fill="var(--color-text)" fontSize="9" fontFamily="monospace" textAnchor="middle">ID: 100..150</text>
            {/* Target Found Indicator */}
            <rect x="95" y="142" width="130" height="20" rx="4" fill="var(--color-surface)" stroke="#4B8F8C" strokeWidth="1" />
            <text x="160" y="156" fill="#4B8F8C" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              Index Hit (1 ms) vs Scan (85 ms)
            </text>
          </svg>
        );

      // 18. JARINGAN KOMPUTER & SUBNETTING CIDR
      case 'network-subnet':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            <defs>
              <pattern id="grid-net" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#grid-net)" />
            {/* IP Header */}
            <rect x="24" y="20" width="272" height="36" rx="6" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1.5" />
            <text x="160" y="43" fill="var(--color-text)" fontSize="13" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              192.168.1.0 <tspan fill="#4B8F8C">/ 24</tspan>
            </text>
            {/* Subnet Division Visual */}
            <g transform="translate(24, 72)">
              <rect x="0" y="0" width="190" height="28" rx="4" fill="#1D4838" stroke="#4B8F8C" strokeWidth="1.5" />
              <text x="95" y="18" fill="#8ED3CF" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">
                NETWORK BITS (24 BITS)
              </text>
              <rect x="198" y="0" width="74" height="28" rx="4" fill="var(--color-primary-soft)" stroke="#BA8230" strokeWidth="1.5" />
              <text x="235" y="18" fill="#BA8230" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">
                HOST (8)
              </text>
            </g>
            {/* Telemetry Readouts */}
            <rect x="24" y="118" width="130" height="40" rx="5" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
            <text x="34" y="133" fill="var(--color-text-secondary)" fontSize="8" fontFamily="monospace">Netmask:</text>
            <text x="34" y="148" fill="var(--color-text)" fontSize="10" fontFamily="monospace" fontWeight="700">255.255.255.0</text>
            <rect x="166" y="118" width="130" height="40" rx="5" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
            <text x="176" y="133" fill="var(--color-text-secondary)" fontSize="8" fontFamily="monospace">Usable Hosts:</text>
            <text x="176" y="148" fill="#4B8F8C" fontSize="10" fontFamily="monospace" fontWeight="700">254 Alamat</text>
          </svg>
        );

      // 19. GERBANG LOGIKA DIGITAL (BOOLEAN LOGIC)
      case 'logic-gates':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            <defs>
              <pattern id="grid-log" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#grid-log)" />
            {/* Inputs */}
            <text x="28" y="65" fill="#4B8F8C" fontSize="10" fontFamily="monospace" fontWeight="700">A = 1</text>
            <line x1="68" y1="62" x2="110" y2="62" stroke="#4B8F8C" strokeWidth="2" />
            <text x="28" y="118" fill="#4B8F8C" fontSize="10" fontFamily="monospace" fontWeight="700">B = 1</text>
            <line x1="68" y1="115" x2="110" y2="115" stroke="#4B8F8C" strokeWidth="2" />
            {/* AND Gate Body */}
            <path d="M 110 46 L 140 46 A 44 44 0 0 1 184 90 A 44 44 0 0 1 140 134 L 110 134 Z" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
            <text x="138" y="95" fill="var(--color-primary-text)" fontSize="11" fontFamily="monospace" fontWeight="700" textAnchor="middle">AND</text>
            {/* Output Line */}
            <line x1="184" y1="90" x2="240" y2="90" stroke="#4B8F8C" strokeWidth="2.5" />
            <circle cx="248" cy="90" r="8" fill="#4B8F8C" />
            <text x="270" y="94" fill="#4B8F8C" fontSize="11" fontFamily="monospace" fontWeight="700">Y = 1</text>
            {/* Truth equation */}
            <rect x="70" y="148" width="180" height="20" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
            <text x="160" y="162" fill="var(--color-text)" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              Y = A ∧ B (Logika Biner 5V)
            </text>
          </svg>
        );

      // 20. AKUNTANSI & PERSAMAAN NERACA
      case 'accounting-ledger':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            <defs>
              <pattern id="grid-acc" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#grid-acc)" />
            {/* Formula Header */}
            <rect x="24" y="16" width="272" height="28" rx="5" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1.5" />
            <text x="160" y="34" fill="var(--color-text)" fontSize="11" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              ASET = LIABILITAS + EKUITAS
            </text>
            {/* Dual T-Account */}
            <rect x="24" y="58" width="128" height="96" rx="5" fill="var(--color-surface)" stroke="#4B8F8C" strokeWidth="1.5" />
            <rect x="24" y="58" width="128" height="24" rx="5" fill="#1D4838" />
            <text x="88" y="74" fill="#8ED3CF" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">DEBIT (ASET)</text>
            <text x="36" y="100" fill="var(--color-text)" fontSize="9" fontFamily="monospace">+ Kas: Rp 10.000k</text>
            <text x="36" y="118" fill="var(--color-text)" fontSize="9" fontFamily="monospace">+ Alat: Rp 15.000k</text>
            <line x1="32" y1="128" x2="144" y2="128" stroke="var(--color-border)" strokeWidth="1" />
            <text x="36" y="144" fill="#4B8F8C" fontSize="10" fontFamily="monospace" fontWeight="700">Total: Rp 25.000k</text>

            <rect x="168" y="58" width="128" height="96" rx="5" fill="var(--color-surface)" stroke="#BA8230" strokeWidth="1.5" />
            <rect x="168" y="58" width="128" height="24" rx="5" fill="var(--color-surface-subtle)" />
            <text x="232" y="74" fill="#BA8230" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">KREDIT (PASIVA)</text>
            <text x="180" y="100" fill="var(--color-text)" fontSize="9" fontFamily="monospace">Utang: Rp 5.000k</text>
            <text x="180" y="118" fill="var(--color-text)" fontSize="9" fontFamily="monospace">Modal: Rp 20.000k</text>
            <line x1="176" y1="128" x2="288" y2="128" stroke="var(--color-border)" strokeWidth="1" />
            <text x="180" y="144" fill="#BA8230" fontSize="10" fontFamily="monospace" fontWeight="700">Total: Rp 25.000k</text>
          </svg>
        );

      // DEFAULT FALLBACK: Orthogonal Laboratory Signal Schematic
      default:
        return (
          <svg viewBox="0 0 320 180" className="w-full h-full block" fill="none">
            <defs>
              <pattern id="grid-def" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeOpacity="0.2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#grid-def)" />
            {/* Central Calibrated Waveform */}
            <path
              d="M 20 90 Q 65 30 110 90 T 200 90 T 290 90"
              stroke="#4B8F8C"
              strokeWidth="2.5"
              fill="none"
            />
            {/* Center Focal Dial */}
            <circle cx="160" cy="90" r="32" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
            <circle cx="160" cy="90" r="5" fill="#BA8230" />
            <line x1="160" y1="40" x2="160" y2="140" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="110" y1="90" x2="210" y2="90" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" />
            {/* Status Pill */}
            <rect x="95" y="136" width="130" height="22" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
            <text x="160" y="151" fill="var(--color-text)" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              LABORATORIUM EMPIRIS
            </text>
          </svg>
        );
    }
  };

  return (
    <div
      className={`w-full h-full bg-[var(--color-surface-subtle)] overflow-hidden transition-all pointer-events-none select-none relative flex items-center justify-center ${className}`}
    >
      {photoUrl ? (
        <div className="relative w-full h-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt={slug}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgFailed(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          {renderSvgPreview()}
        </div>
      )}
    </div>
  );
}
