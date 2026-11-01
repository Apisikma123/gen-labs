'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  IconDisciplinePhysics,
  IconTrendingUp,
  IconScale,
  IconSearch,
  IconArrowUpRight,
} from '@/components/icons';
import dynamic from 'next/dynamic';

const SuperCanvas = dynamic(
  () => import('@/components/simulation/super-canvas').then((m) => m.SuperCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#0C0E12] text-xs font-mono text-slate-400">
        Inisialisasi Apparatus...
      </div>
    ),
  }
);

export interface DisciplineMeta {
  slug: string;
  name: string;
  discipline: string;
  topic: string;
  formula: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const DISCIPLINES: DisciplineMeta[] = [
  {
    slug: 'newtons-second-law',
    name: 'Hukum II Newton',
    discipline: 'Fisika',
    topic: 'Kinematika 1D & Gaya Bersih',
    formula: 'a = F_net / m',
    icon: IconDisciplinePhysics,
  },
  {
    slug: 'function-explorer',
    name: 'Fungsi Kuadrat',
    discipline: 'Matematika',
    topic: 'Aljabar & Parabola',
    formula: 'f(x) = ax² + bx + c',
    icon: IconTrendingUp,
  },
  {
    slug: 'supply-demand',
    name: 'Keseimbangan Pasar',
    discipline: 'Ekonomi',
    topic: 'Mikroekonomi Marshallian',
    formula: 'Qd(P) = Qs(P)',
    icon: IconScale,
  },
  {
    slug: 'sorting-algorithms',
    name: 'Partition Sort',
    discipline: 'Informatika',
    topic: 'Algoritma Komputasi',
    formula: 'T(n) = O(n log n)',
    icon: IconSearch,
  },
];

export function Hero3DScene() {
  const [activeSlug, setActiveSlug] = useState<string>('newtons-second-law');
  const activeMeta = DISCIPLINES.find((d) => d.slug === activeSlug) || DISCIPLINES[0];

  return (
    <div
      className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-6 select-none transition-colors shadow-sm"
      role="region"
      aria-label="Aparatus Laboratorium Deterministik Sistem"
    >
      {/* ── TOP BAR: DISCIPLINE SWITCHER TABS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <span className="font-heading font-extrabold text-sm text-[var(--color-text)]">
            Laboratorium Sistem Deterministik
          </span>
          <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-secondary)] font-bold">
            WASM 60 FPS
          </span>
        </div>

        {/* Minimal Tab Switcher (Zero Dots) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] font-mono text-xs overflow-x-auto max-w-full scrollbar-none">
          {DISCIPLINES.map((d) => {
            const Icon = d.icon;
            const isCurrent = activeSlug === d.slug;
            return (
              <button
                key={d.slug}
                type="button"
                onClick={() => setActiveSlug(d.slug)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? 'bg-[var(--color-primary)] text-white shadow-xs font-bold dark:bg-[#F1F5F9] dark:text-[#0C0E12]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                }`}
              >
                <Icon size={13} className="shrink-0" />
                <span>{d.discipline}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ACTIVE METRIC HEADER ── */}
      <div className="flex items-center justify-between py-3 text-xs font-mono text-[var(--color-text-secondary)] border-b border-[var(--color-border)] mb-4">
        <span>Modul Sistem: {activeMeta.name} ({activeMeta.topic})</span>
        <div className="flex items-center gap-3">
          <span className="font-bold text-[var(--color-text)] px-2 py-0.5 rounded bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
            {activeMeta.formula}
          </span>
          <Link
            href={`/simulation/${activeSlug}`}
            className="hidden sm:inline-flex items-center gap-1 text-[var(--color-secondary)] hover:underline font-bold"
          >
            <span>Buka Penuh</span>
            <IconArrowUpRight size={12} />
          </Link>
        </div>
      </div>

      {/* ── THE SYSTEM'S REAL SIMULATOR ENGINE (SuperCanvas) ── */}
      <div className="w-full">
        <SuperCanvas
          key={activeSlug}
          slug={activeSlug}
          mode="student"
          embedded={true}
        />
      </div>
    </div>
  );
}
