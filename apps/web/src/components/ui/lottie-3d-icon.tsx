'use client';

import React from 'react';
import { Icon3d, Icon3dName } from '@/components/icons/3d';

export type Lottie3DName =
  | 'cube'
  | 'home'
  | 'coin'
  | 'check'
  | 'clipboard'
  | 'mic'
  | 'ai-robot'
  | 'atom'
  | 'book'
  | 'empty-state'
  | 'settings'
  | 'search';

const LOTTIE_TO_3D_MAP: Record<Lottie3DName, Icon3dName> = {
  'cube': 'cs-matrix',
  'home': 'compass-explore',
  'coin': 'quant-candlestick',
  'check': 'verified-equilibrium',
  'clipboard': 'book-module',
  'mic': 'mic',
  'ai-robot': 'ai-core',
  'atom': 'physics-energy',
  'book': 'book-module',
  'empty-state': 'ai-core',
  'settings': 'gear-settings',
  'search': 'compass-explore',
};

export interface Lottie3DIconProps {
  name: Lottie3DName;
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  trigger?: 'autoplay' | 'hover' | 'click';
  loop?: boolean;
  className?: string;
  fallback?: React.ReactNode;
  respectReducedMotion?: boolean;
  title?: string;
}

const SIZE_MAP: Record<string, number> = {
  xs: 20,
  sm: 28,
  md: 40,
  lg: 56,
  xl: 72,
  '2xl': 96,
  hero: 140,
};

/**
 * Lottie3DIcon — High-performance vector drop-in replacement.
 * Automatically delegates to native 3D SVG icon components, eliminating
 * 25+ MB of heavy Lottie JSON/Canvas execution while retaining full API compatibility.
 */
export function Lottie3DIcon({
  name,
  size = 'md',
  className = '',
  title,
}: Lottie3DIconProps) {
  const dimension = typeof size === 'number' ? size : SIZE_MAP[size] || 40;
  const icon3dName = LOTTIE_TO_3D_MAP[name] || 'ai-core';

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: dimension, height: dimension }}
      title={title || name}
      role="img"
      aria-label={title || `${name} 3D icon`}
    >
      <Icon3d name={icon3dName} size={dimension} />
    </div>
  );
}
