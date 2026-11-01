'use client';

import React from 'react';
import { GenIcon, GenIconName } from './gen-icon';

export type GenIconTileVariant = 'cyan' | 'mint' | 'ochre' | 'pine' | 'error' | 'auto';

export interface GenIconTileProps {
  name: GenIconName | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: GenIconTileVariant;
  className?: string;
  title?: string;
}

const TILE_SIZES = {
  sm: { box: 'w-9 h-9 rounded-lg', icon: 16 },
  md: { box: 'w-12 h-12 rounded-xl', icon: 20 },
  lg: { box: 'w-14 h-14 rounded-2xl', icon: 24 },
  xl: { box: 'w-18 h-18 rounded-2xl', icon: 30 },
};

function resolveAutoVariant(name: string): Exclude<GenIconTileVariant, 'auto'> {
  const lower = name.toLowerCase();
  if (lower.includes('error') || lower.includes('alert') || lower.includes('trash') || lower.includes('close') || lower.includes('x-circle')) {
    return 'error';
  }
  if (
    lower.includes('kredit') ||
    lower.includes('coin') ||
    lower.includes('limit') ||
    lower.includes('premium') ||
    lower.includes('ochre') ||
    lower.includes('warning') ||
    lower.includes('math') ||
    lower.includes('econ') ||
    lower.includes('candlestick') ||
    lower.includes('percent') ||
    lower.includes('dice') ||
    lower.includes('zap')
  ) {
    return 'ochre';
  }
  if (
    lower.includes('check') ||
    lower.includes('sukses') ||
    lower.includes('success') ||
    lower.includes('tutor') ||
    lower.includes('ai') ||
    lower.includes('brain') ||
    lower.includes('hypothesis')
  ) {
    return 'cyan';
  }
  if (
    lower.includes('physics') ||
    lower.includes('vector') ||
    lower.includes('folder') ||
    lower.includes('database') ||
    lower.includes('layers') ||
    lower.includes('code')
  ) {
    return 'pine';
  }
  return 'cyan';
}

/**
 * Planar laboratory styling tokens matching DESIGN (4).md & anti-slop rules:
 * Pure planar luminance tiering with 1px hairline seam borders and semantic color accents.
 */
const VARIANT_STYLES: Record<Exclude<GenIconTileVariant, 'auto'>, {
  bg: string;
  border: string;
  iconColor: string;
  badgeAccent: string;
}> = {
  cyan: {
    bg: 'bg-[#151B16] dark:bg-[#151B16]',
    border: 'border-[#2B3025] hover:border-[#4B8F8C]',
    iconColor: 'text-[#4B8F8C] dark:text-[#8ED3CF]',
    badgeAccent: 'bg-[#4B8F8C]/10 text-[#4B8F8C]',
  },
  mint: {
    bg: 'bg-[#151B16] dark:bg-[#151B16]',
    border: 'border-[#2B3025] hover:border-[#A3D0BB]',
    iconColor: 'text-[#A3D0BB]',
    badgeAccent: 'bg-[#A3D0BB]/10 text-[#A3D0BB]',
  },
  ochre: {
    bg: 'bg-[#181D13] dark:bg-[#181D13]',
    border: 'border-[#2B3025] hover:border-[#BA8230]',
    iconColor: 'text-[#BA8230] dark:text-[#FBBA63]',
    badgeAccent: 'bg-[#BA8230]/10 text-[#BA8230]',
  },
  pine: {
    bg: 'bg-[#151B16] dark:bg-[#151B16]',
    border: 'border-[#2B3025] hover:border-[#1D4838]',
    iconColor: 'text-[#89B6A1] dark:text-[#A3D0BB]',
    badgeAccent: 'bg-[#1D4838]/20 text-[#89B6A1]',
  },
  error: {
    bg: 'bg-[#1D1516] dark:bg-[#1D1516]',
    border: 'border-[#3D2528] hover:border-[#FFB4AB]',
    iconColor: 'text-[#FFB4AB]',
    badgeAccent: 'bg-[#93000A]/20 text-[#FFB4AB]',
  },
};

/**
 * GenIconTile
 * Renders icons as precision laboratory planar apparatus tiles conforming to DESIGN (4).md
 * Features:
 * - Anti-slop: zero glossy drop-shadows or neon halos
 * - Planar luminance tiering (#151B16 elevated ground, #2B3025 hairline seam)
 * - PRD v2.0 radius scale (8px, 12px, 16px)
 * - Semantic GEN LABS instrument color accents (Cyan #4B8F8C, Ochre #BA8230, Pine #1D4838)
 */
export function GenIconTile({
  name,
  size = 'md',
  variant = 'auto',
  className = '',
  title,
}: GenIconTileProps) {
  const resolvedVariant: Exclude<GenIconTileVariant, 'auto'> =
    variant === 'auto' ? resolveAutoVariant(name) : variant;
  const sizeConfig = TILE_SIZES[size];
  const styleConfig = VARIANT_STYLES[resolvedVariant];

  return (
    <div
      className={`relative group flex items-center justify-center shrink-0 border transition-colors duration-200 select-none ${sizeConfig.box} ${styleConfig.bg} ${styleConfig.border} ${className}`}
      title={title || name}
      role="img"
      aria-label={title || name}
    >
      {/* Precision Vector Icon Glyph */}
      <div className={`relative z-10 transition-transform duration-150 group-hover:scale-105 ${styleConfig.iconColor}`}>
        <GenIcon name={name} size={sizeConfig.icon} />
      </div>
    </div>
  );
}
