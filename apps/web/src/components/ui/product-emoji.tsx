'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export type CanonicalEmojiName =
  | 'abacus'
  | 'atom'
  | 'bar_chart'
  | 'battery'
  | 'bell'
  | 'books'
  | 'brain'
  | 'chart_decreasing'
  | 'chart_increasing'
  | 'check_mark'
  | 'compass'
  | 'dna'
  | 'droplet'
  | 'electric_plug'
  | 'fire'
  | 'gear'
  | 'globe'
  | 'graduation_cap'
  | 'hourglass'
  | 'key'
  | 'laptop'
  | 'light_bulb'
  | 'lock'
  | 'magnet'
  | 'memo'
  | 'microscope'
  | 'package'
  | 'pencil'
  | 'robot'
  | 'rocket'
  | 'satellite'
  | 'seedling'
  | 'shield'
  | 'sparkles'
  | 'star'
  | 'straight_ruler'
  | 'sun'
  | 'telescope'
  | 'test_tube'
  | 'thermometer'
  | 'triangular_ruler'
  | 'trophy'
  | 'unlocked'
  | 'warning'
  | 'wave'
  | 'wrench'
  | 'zap'
  | 'moon'
  | 'crescent_moon'
  | 'magnifying_glass'
  | 'search';

export type SemanticEmojiAlias =
  | 'physics'
  | 'fisika'
  | 'chemistry'
  | 'kimia'
  | 'biology'
  | 'biologi'
  | 'mathematics'
  | 'matematika'
  | 'math'
  | 'economics'
  | 'ekonomi'
  | 'informatics'
  | 'informatika'
  | 'computer_science'
  | 'ilmu_komputer'
  | 'engineering'
  | 'rekayasa'
  | 'teknik'
  | 'signal'
  | 'sinyal'
  | 'astronomy'
  | 'astronomi'
  | 'fluid'
  | 'fluida'
  | 'energy'
  | 'energi'
  | 'geometry'
  | 'geometri'
  | 'student'
  | 'siswa'
  | 'verified'
  | 'kuota'
  | 'quota'
  | 'dark'
  | 'gelap'
  | 'light'
  | 'terang'
  | 'system'
  | 'sistem'
  | 'cari'
  | 'kredit'
  | 'credit';

export type ProductEmojiName = CanonicalEmojiName | SemanticEmojiAlias;

export const EMOJI_RESOLVER: Record<ProductEmojiName, CanonicalEmojiName> = {
  // Canonical
  abacus: 'abacus',
  atom: 'atom',
  bar_chart: 'bar_chart',
  battery: 'battery',
  bell: 'bell',
  books: 'books',
  brain: 'brain',
  chart_decreasing: 'chart_decreasing',
  chart_increasing: 'chart_increasing',
  check_mark: 'check_mark',
  compass: 'compass',
  dna: 'dna',
  droplet: 'droplet',
  electric_plug: 'electric_plug',
  fire: 'fire',
  gear: 'gear',
  globe: 'globe',
  graduation_cap: 'graduation_cap',
  hourglass: 'hourglass',
  key: 'key',
  laptop: 'laptop',
  light_bulb: 'light_bulb',
  lock: 'lock',
  magnet: 'magnet',
  memo: 'memo',
  microscope: 'microscope',
  package: 'package',
  pencil: 'pencil',
  robot: 'robot',
  rocket: 'rocket',
  satellite: 'satellite',
  seedling: 'seedling',
  shield: 'shield',
  sparkles: 'sparkles',
  star: 'star',
  straight_ruler: 'straight_ruler',
  sun: 'sun',
  moon: 'moon',
  crescent_moon: 'crescent_moon',
  magnifying_glass: 'magnifying_glass',
  search: 'search',
  telescope: 'telescope',
  test_tube: 'test_tube',
  thermometer: 'thermometer',
  triangular_ruler: 'triangular_ruler',
  trophy: 'trophy',
  unlocked: 'unlocked',
  warning: 'warning',
  wave: 'wave',
  wrench: 'wrench',
  zap: 'zap',

  // Semantic Aliases
  physics: 'atom',
  fisika: 'atom',
  chemistry: 'test_tube',
  kimia: 'test_tube',
  biology: 'dna',
  biologi: 'dna',
  mathematics: 'abacus',
  matematika: 'abacus',
  math: 'abacus',
  economics: 'chart_increasing',
  ekonomi: 'chart_increasing',
  informatics: 'laptop',
  informatika: 'laptop',
  computer_science: 'laptop',
  ilmu_komputer: 'laptop',
  engineering: 'gear',
  rekayasa: 'gear',
  teknik: 'gear',
  signal: 'wave',
  sinyal: 'wave',
  astronomy: 'telescope',
  astronomi: 'telescope',
  fluid: 'droplet',
  fluida: 'droplet',
  energy: 'fire',
  energi: 'fire',
  geometry: 'triangular_ruler',
  geometri: 'triangular_ruler',
  student: 'graduation_cap',
  siswa: 'graduation_cap',
  verified: 'shield',
  kuota: 'sparkles',
  quota: 'sparkles',
  dark: 'moon',
  gelap: 'moon',
  light: 'sun',
  terang: 'sun',
  system: 'laptop',
  sistem: 'laptop',
  cari: 'search',
  kredit: 'zap',
  credit: 'zap',
};

import { GenIcon, Icon3d } from '@/components/icons';

export const EMOJI_TO_3D_ICON: Record<string, string> = {
  // GEN LABS AI
  brain: '3d-ai-core',
  robot: '3d-ai-core',
  sparkles: '3d-ai-core',
  mic: '3d-mic',

  // Science & Physics
  atom: '3d-physics-energy',
  physics: '3d-physics-energy',
  fisika: '3d-physics-energy',
  fire: '3d-physics-energy',
  zap: '3d-physics-energy',
  battery: '3d-physics-energy',
  energy: '3d-physics-energy',
  energi: '3d-physics-energy',
  rocket: '3d-physics-energy',
  projectile: '3d-physics-energy',
  gyroscope: '3d-gyroscope-apparatus',
  giroskop: '3d-gyroscope-apparatus',
  mechanics: '3d-gyroscope-apparatus',
  momentum: '3d-gyroscope-apparatus',

  // Chemistry & Materials
  chemistry: '3d-chemistry-flask',
  kimia: '3d-chemistry-flask',
  droplet: '3d-chemistry-flask',
  test_tube: '3d-chemistry-flask',
  microscope: '3d-chemistry-flask',
  fluid: '3d-chemistry-flask',
  fluida: '3d-chemistry-flask',
  spectrometer: '3d-spectrometer-prism',
  prism: '3d-spectrometer-prism',
  prisma: '3d-spectrometer-prism',
  spectrum: '3d-spectrometer-prism',
  spektrometer: '3d-spectrometer-prism',
  optics: '3d-spectrometer-prism',

  // Biology & Genetics
  dna: '3d-biology-dna',
  biology: '3d-biology-dna',
  biologi: '3d-biology-dna',
  seedling: '3d-biology-dna',

  // Mathematics & Calculus
  math: '3d-math-function',
  matematika: '3d-math-function',
  mathematics: '3d-math-function',
  geometry: '3d-math-function',
  geometri: '3d-math-function',
  abacus: '3d-math-function',
  triangular_ruler: '3d-math-function',
  straight_ruler: '3d-math-function',

  // Computer Science & Algorithms
  computer_science: '3d-cs-matrix',
  ilmu_komputer: '3d-cs-matrix',
  informatics: '3d-cs-matrix',
  informatika: '3d-cs-matrix',
  laptop: '3d-cs-matrix',
  system: '3d-cs-matrix',
  sistem: '3d-cs-matrix',
  cpu: '3d-cs-matrix',
  engineering: '3d-cs-matrix',
  teknik: '3d-cs-matrix',

  // Economics & Finance
  economics: '3d-quant-candlestick',
  ekonomi: '3d-quant-candlestick',
  candlestick: '3d-quant-candlestick',
  coin: '3d-quant-candlestick',
  coins: '3d-quant-candlestick',
  bar_chart: '3d-quant-candlestick',
  chart_increasing: '3d-quant-candlestick',
  chart_decreasing: '3d-quant-candlestick',

  // Verification & Milestones
  check_mark: '3d-verified-equilibrium',
  verified: '3d-verified-equilibrium',
  shield: '3d-verified-equilibrium',

  // Exploration & Compass
  compass: '3d-compass-explore',
  globe: '3d-compass-explore',

  // Education & Curriculum
  books: '3d-book-module',
  graduation_cap: '3d-book-module',
  memo: '3d-book-module',

  // Technical Settings & Tools
  gear: '3d-gear-settings',
  wrench: '3d-gear-settings',

  // Security
  lock: '3d-lock-secure',
  key: '3d-lock-secure',

  // Achievement & Rating
  star: '3d-star-award',
  trophy: '3d-star-award',
  award: '3d-star-award',

  // Notifications
  bell: '3d-bell-alert',
  warning: '3d-bell-alert',

  // Storage & Cloud
  cloud: '3d-cloud-storage',
  package: '3d-cloud-storage',

  // Sensory, Astronomy & Wave Dynamics
  wave: '3d-math-function',
  light_bulb: '3d-ai-core',
  magnet: '3d-physics-energy',
  telescope: '3d-compass-explore',
  satellite: '3d-compass-explore',
};

const EMOJI_TO_GEN_ICON: Record<string, string> = {
  abacus: 'math',
  atom: 'atom',
  bar_chart: 'bar-chart',
  battery: 'zap',
  bell: 'bell',
  books: 'book-open',
  brain: 'brain',
  chart_decreasing: 'line-chart',
  chart_increasing: 'trending-up',
  check_mark: 'check',
  compass: 'compass',
  dna: 'dna',
  droplet: 'chemistry',
  electric_plug: 'zap',
  fire: 'physics',
  gear: 'settings',
  globe: 'compass',
  graduation_cap: 'graduation-cap',
  hourglass: 'clock',
  key: 'key',
  laptop: 'informatics',
  light_bulb: 'lightbulb',
  lock: 'lock',
  magnet: 'magnet',
  memo: 'file-text',
  microscope: 'flask',
  package: 'layers',
  pencil: 'edit',
  robot: 'bot',
  rocket: 'projectile',
  satellite: 'physics',
  seedling: 'agribusiness',
  shield: 'shield-check',
  sparkles: 'sparkles',
  star: 'sparkles',
  straight_ruler: 'ruler',
  sun: 'sun',
  moon: 'moon',
  crescent_moon: 'moon',
  magnifying_glass: 'search',
  search: 'search',
  telescope: 'crosshair',
  test_tube: 'test-tube',
  thermometer: 'thermometer',
  triangular_ruler: 'math',
  trophy: 'award',
  unlocked: 'unlock',
  warning: 'alert-triangle',
  wave: 'activity',
  wrench: 'settings',
  zap: 'zap',
  mic: 'mic',
  coin: 'coins',
  coins: 'coins',
  candlestick: 'candlestick',

  // Semantics
  physics: 'physics',
  fisika: 'physics',
  chemistry: 'chemistry',
  kimia: 'chemistry',
  biology: 'agribusiness',
  biologi: 'agribusiness',
  mathematics: 'math',
  matematika: 'math',
  math: 'math',
  economics: 'economics',
  ekonomi: 'economics',
  informatics: 'informatics',
  informatika: 'informatics',
  computer_science: 'informatics',
  ilmu_komputer: 'informatics',
  engineering: 'cpu',
  rekayasa: 'cpu',
  teknik: 'cpu',
  signal: 'activity',
  sinyal: 'activity',
  astronomy: 'atom',
  astronomi: 'atom',
  fluid: 'chemistry',
  fluida: 'chemistry',
  energy: 'zap',
  energi: 'zap',
  geometry: 'math',
  geometri: 'math',
  student: 'user',
  siswa: 'user',
  verified: 'check-circle',
  kuota: 'zap',
  quota: 'zap',
  dark: 'moon',
  gelap: 'moon',
  light: 'sun',
  terang: 'sun',
  system: 'cpu',
  sistem: 'cpu',
  cari: 'search',
  kredit: 'zap',
  credit: 'zap',
};

const SIZE_MAP = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
  '2xl': 64,
} as const;

export type ProductEmojiSize = keyof typeof SIZE_MAP | number;

export interface ProductEmojiProps {
  name: ProductEmojiName;
  size?: ProductEmojiSize;
  className?: string;
  alt?: string;
  decorative?: boolean;
  priority?: boolean;
  native?: boolean;
  variant?: 'auto' | '2d' | '3d';
  interactive?: boolean;
}

export function ProductEmoji({
  name,
  size = 'md',
  className = '',
  alt,
  decorative = true,
  priority = false,
  native = false,
  variant = 'auto',
  interactive = false,
}: ProductEmojiProps) {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] ?? 24;
  const canonicalName = EMOJI_RESOLVER[name] || 'sparkles';

  // 1. High-Craft 3D SVG Rendering for Feature Highlights & Cards (or when native/3d is requested)
  const icon3dName = EMOJI_TO_3D_ICON[name] || EMOJI_TO_3D_ICON[canonicalName];
  const shouldRender3d = (variant === '3d' || (variant === 'auto' && pixelSize >= 28) || native) && !!icon3dName;

  if (shouldRender3d) {
    return (
      <Icon3d
        name={icon3dName}
        size={pixelSize}
        interactive={interactive}
        title={decorative ? undefined : (alt || canonicalName.replace(/_/g, ' '))}
        aria-label={decorative ? undefined : (alt || canonicalName.replace(/_/g, ' '))}
        aria-hidden={decorative ? true : undefined}
        className={className}
      />
    );
  }

  // 2. Precision 2D Vector Mode for Compact Inline Controls (< 28px)
  const iconName = EMOJI_TO_GEN_ICON[name] || EMOJI_TO_GEN_ICON[canonicalName] || 'sparkles';
  return (
    <GenIcon
      name={iconName}
      size={pixelSize}
      aria-label={decorative ? undefined : (alt || canonicalName.replace(/_/g, ' '))}
      aria-hidden={decorative ? true : undefined}
      className={className}
    />
  );
}
