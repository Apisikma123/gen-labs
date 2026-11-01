'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  IconArrowRight,
  IconArrowUpRight,
  IconCompass,
} from '@/components/icons';
import {
  Icon3dPhysicsEnergy,
  Icon3dMathFunction,
  Icon3dCsMatrix,
  Icon3dQuantCandlestick,
} from '@/components/icons/3d';
import {
  PhysicsApparatusGraphic,
  MathParabolaGraphic,
  CsSortingLatticeGraphic,
  EconomicsEquilibriumGraphic,
} from '@/components/illustrations';

interface DisciplineCardData {
  domain: string;
  badge: string;
  title: string;
  formula: string;
  desc: string;
  slug: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: string;
}

const MODULES: DisciplineCardData[] = [
  {
    domain: 'Fisika',
    badge: 'Gerak & Tenaga',
    title: 'Gaya Dorong & Gerak Benda',
    formula: 'a = Gaya / Massa',
    desc: 'Uji seberapa kencang sebuah benda meluncur ketika gayanya dilipatgandakan di atas lintasan lurus.',
    slug: 'newtons-second-law',
    icon: Icon3dPhysicsEnergy,
    accentColor: '#BA8230',
  },
  {
    domain: 'Matematika',
    badge: 'Bentuk Kurva',
    title: 'Grafik Lengkung & Parabola',
    formula: 'y = ax² + c',
    desc: 'Ubah kelengkungan grafik dan amati bagaimana titik puncaknya berpindah tempat secara langsung.',
    slug: 'function-explorer',
    icon: Icon3dMathFunction,
    accentColor: '#4B8F8C',
  },
  {
    domain: 'Informatika',
    badge: 'Logika Komputer',
    title: 'Cara Komputer Mengurutkan Angka',
    formula: 'Langkah demi Langkah',
    desc: 'Tonton bagaimana komputer membandingkan angka-angka acak dan menukarnya hingga tersusun rapi.',
    slug: 'sorting-algorithms',
    icon: Icon3dCsMatrix,
    accentColor: '#4B8F8C',
  },
  {
    domain: 'Ekonomi',
    badge: 'Dinamika Pasar',
    title: 'Jual Beli & Kesepakatan Harga',
    formula: 'Pertemuan Penjual & Pembeli',
    desc: 'Pahami mengapa harga barang bisa naik ketika jumlah orang yang ingin membeli bertambah banyak.',
    slug: 'supply-demand',
    icon: Icon3dQuantCandlestick,
    accentColor: '#BA8230',
  },
];

export function DisciplinesShowcaseSection() {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  return (
    <section
      id="eksplorasi-modul"
      className="relative w-full py-16 sm:py-24 px-4 sm:px-6 md:px-8 border-b border-[var(--color-border)] bg-[var(--color-bg)] transition-colors select-none"
    >
      <div className="max-w-[1160px] mx-auto text-left">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] font-mono text-xs text-[var(--color-secondary)] font-bold uppercase tracking-wider mb-3">
              <IconCompass size={14} />
              <span>Pilihan Eksplorasi</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--color-text)] leading-tight">
              Eksplorasi Modul Pembelajaran
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed font-sans">
              Setiap mata pelajaran disajikan dalam bentuk simulator interaktif yang mudah dimengerti, bukan sekadar teori hafalan.
            </p>
          </div>

          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-xs font-sans font-semibold text-[var(--color-text)] transition-colors min-h-[44px] shrink-0"
          >
            <span>Buka Semua 14 Modul</span>
            <IconArrowRight size={13} className="text-[var(--color-secondary)]" />
          </Link>
        </div>

        {/* ── 4 DISCIPLINE CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {MODULES.map((item) => {
            const Icon = item.icon;
            const isHovered = hoveredSlug === item.slug;

            return (
              <div
                key={item.slug}
                onMouseEnter={() => setHoveredSlug(item.slug)}
                onMouseLeave={() => setHoveredSlug(null)}
                className={`p-6 sm:p-7 rounded-2xl border transition-all flex flex-col justify-between ${
                  isHovered
                    ? 'border-[var(--color-secondary)] bg-[var(--color-surface)] shadow-sm'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)]/80 hover:border-[var(--color-text-secondary)]'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--color-border)] text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                        <Icon size={24} />
                      </div>
                      <span className="font-bold text-[var(--color-text)] font-sans">
                        {item.domain}
                      </span>
                      <span className="text-[var(--color-text-tertiary)]">/</span>
                      <span className="text-[var(--color-text-secondary)] font-sans">
                        {item.badge}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-[var(--color-surface-subtle)] border border-[var(--color-border)] font-mono text-[11px] font-bold text-[var(--color-text)]">
                      {item.formula}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text)] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-sans mb-5">
                    {item.desc}
                  </p>

                  {/* Dedicated Bespoke Scientific Apparatus Illustration */}
                  <div className="w-full h-24 sm:h-28 rounded-xl bg-[#0C0E12] border border-[var(--color-border)] overflow-hidden mb-5 flex items-center justify-center">
                    {item.slug === 'newtons-second-law' && (
                      <PhysicsApparatusGraphic isHovered={isHovered} />
                    )}
                    {item.slug === 'function-explorer' && (
                      <MathParabolaGraphic isHovered={isHovered} />
                    )}
                    {item.slug === 'sorting-algorithms' && (
                      <CsSortingLatticeGraphic isHovered={isHovered} />
                    )}
                    {item.slug === 'supply-demand' && (
                      <EconomicsEquilibriumGraphic isHovered={isHovered} />
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                  <span className="font-sans text-xs text-[var(--color-text-secondary)]">
                    Simulator Interaktif
                  </span>
                  <Link
                    href={`/simulation/${item.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-[var(--color-primary)] dark:text-[var(--color-secondary)] hover:underline min-h-[44px]"
                  >
                    <span>Coba Sekarang</span>
                    <IconArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
