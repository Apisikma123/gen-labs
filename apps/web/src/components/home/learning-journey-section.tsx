'use client';

import React, { useState, useRef } from 'react';
import {
  IconArrowRight,
} from '@/components/icons';
import {
  Icon3dAiCore,
  Icon3dPhysicsEnergy,
  Icon3dCompassExplore,
  Icon3dVerifiedEquilibrium,
} from '@/components/icons/3d';
import { ScientificWorkflowGraphic } from '@/components/illustrations';

interface StepData {
  num: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tag: string;
}

const STEPS: StepData[] = [
  {
    num: '01',
    title: 'Tanya',
    subtitle: 'Mulai dari rasa penasaran',
    desc: 'Tuliskan pertanyaan dalam bahasa sehari-hari, misalnya: "Kenapa truk gandeng yang berat lebih susah mengerem dibanding motor?"',
    icon: Icon3dAiCore,
    tag: 'Rasa Ingin Tahu',
  },
  {
    num: '02',
    title: 'Coba',
    subtitle: 'Atur angka dengan sentuhan jari',
    desc: 'Geser dorongan tenaga, perbesar muatan beban, atau ubah kecepatan awal secara bebas tanpa takut salah.',
    icon: Icon3dPhysicsEnergy,
    tag: 'Eksperimen Bebas',
  },
  {
    num: '03',
    title: 'Amati',
    subtitle: 'Lihat reaksinya secara langsung',
    desc: 'Tonton pergerakan balok di lintasan, amati garis grafik yang terbentuk, dan perhatikan perubahannya seketika.',
    icon: Icon3dCompassExplore,
    tag: 'Pengamatan Nyata',
  },
  {
    num: '04',
    title: 'Pahami',
    subtitle: 'Temukan alasannya sendiri',
    desc: 'Buktikan bahwa rumus yang tertulis di buku pelajaran benar adanya. Kamu mengerti konsepnya karena pernah mencobanya sendiri.',
    icon: Icon3dVerifiedEquilibrium,
    tag: 'Paham Mendalam',
  },
];

export function LearningJourneySection() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section
      id="cara-belajar"
      ref={containerRef}
      className="relative w-full py-16 sm:py-24 px-4 sm:px-6 md:px-8 border-b border-[var(--color-border)] bg-[var(--color-bg)] transition-colors select-none"
    >
      <div className="max-w-[1160px] mx-auto text-left">
        {/* Section Header */}
        <div className="max-w-2xl mb-10 sm:mb-14">
          <span className="inline-block px-3 py-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] font-mono text-xs text-[var(--color-secondary)] font-bold uppercase tracking-wider mb-3">
            Cara Belajar
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--color-text)] leading-tight">
            Empat Langkah Menemukan Pemahaman
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed font-sans">
            Ubah cara belajar dari sekadar membaca dan menghafal rumus, menjadi membuktikannya sendiri melalui percobaan langsung.
          </p>
        </div>

        {/* ── AUTHORED SCIENTIFIC WORKFLOW APPARATUS ── */}
        <div className="w-full mb-8 sm:mb-10">
          <ScientificWorkflowGraphic activeStep={activeStep} className="w-full h-20 sm:h-24" />
        </div>

        {/* ── 4 INTERACTIVE STEP CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {STEPS.map((st, idx) => {
            const Icon = st.icon;
            const isSelected = activeStep === idx;
            return (
              <div
                key={st.num}
                onClick={() => setActiveStep(idx)}
                className={`p-5 sm:p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[220px] ${
                  isSelected
                    ? 'border-[var(--color-secondary)] bg-[var(--color-surface)] shadow-sm -translate-y-1'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)]/60 hover:border-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-[var(--color-surface)] border-[var(--color-secondary)] shadow-2xs'
                            : 'bg-[var(--color-surface-subtle)] border-[var(--color-border)]'
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <span className="font-mono font-bold text-xs text-[var(--color-secondary)]">
                        Langkah {st.num}
                      </span>
                    </div>

                    <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]">
                      {st.tag}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-[var(--color-text)] mb-1">
                    {st.title}
                  </h3>
                  <span className="font-sans text-xs text-[var(--color-text-secondary)] block mb-2 font-medium">
                    {st.subtitle}
                  </span>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-sans">
                    {st.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-sans text-[var(--color-text-secondary)] mt-4">
                  <span>{isSelected ? 'Tahap Aktif' : 'Klik untuk melihat'}</span>
                  <IconArrowRight
                    size={12}
                    className={`transition-transform ${
                      isSelected ? 'translate-x-1 text-[var(--color-secondary)]' : 'opacity-40'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
