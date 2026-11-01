import React from 'react';
import Link from 'next/link';
import {
  IconArrowRight,
  IconCompass,
} from '@/components/icons';
import { InfiniteCurvedCarousel } from './infinite-curved-carousel';

const TICKER_ITEMS = [
  { label: 'Kurikulum Sains & Vokasi', spec: 'Standar Terapan Terakreditasi' },
  { label: 'Gerakan 60 FPS Super Mulus', spec: 'Bebas Lag' },
  { label: 'Tanya AI Laboratorium', spec: 'Panduan Interaktif' },
  { label: 'Lembar Praktikum Digital', spec: 'Logbook Otomatis' },
  { label: 'Eksperimen Fisika & Gerak', spec: 'Hukum Newton' },
  { label: 'Grafik & Aljabar Matematika', spec: 'Fungsi Kuadrat' },
  { label: 'Logika & Pengurutan Data', spec: 'Informatika' },
  { label: 'Reaksi Kimia & Skala pH', spec: 'Asam & Basa' },
];

export const HeroShowcase = React.memo(function HeroShowcase() {
  return (
    <section
      className="relative w-full pt-20 sm:pt-24 lg:pt-28 pb-10 sm:pb-14 overflow-hidden flex flex-col items-center justify-between bg-[#0C0E12] text-[#F1F5F9]"
    >
      <div
        style={{
          backgroundImage: `linear-gradient(to right, #4B8F8C 1px, transparent 1px), linear-gradient(to bottom, #4B8F8C 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        aria-hidden="true"
      />

      <div
        className="relative max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12 flex flex-col items-center text-center z-10 w-full"
      >
        {/* Dual-Weight Confident Title */}
        <h1
          className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[3.2rem] xl:text-[3.5rem] tracking-[-0.035em] text-[#F1F5F9] leading-[1.12] max-w-[1040px] mx-auto"
        >
          <span className="block font-normal text-[#CBD5E1]">
            Eksperimen Sains Presisi
          </span>
          <span className="block font-extrabold text-[#F1F5F9]">
            Dibuktikan Langsung di Layar
          </span>
        </h1>

        {/* Descriptive Narrative Subtitle */}
        <p
          className="font-sans text-sm sm:text-base text-[#94A3B8] max-w-[620px] mx-auto mt-4 sm:mt-5 leading-relaxed"
        >
          Ubah angka variabel, saksikan simulasi fisika 60 FPS bergerak seketika, dan pahami konsepnya secara langsung — didampingi Tanya AI yang memandu langkah demi langkah.
        </p>

        {/* Dual Action Buttons */}
        <div
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 mb-2 sm:mb-3"
        >
          <Link
            href="/login"
            prefetch={false}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#286B56] hover:bg-[#3E8E75] text-white font-heading font-bold text-xs sm:text-[13px] transition-all cursor-pointer shadow-sm border border-[#286B56] min-h-[42px] active:scale-95"
          >
            <span>Mulai Belajar Sekarang</span>
            <IconArrowRight size={13} />
          </Link>

          <a
            href="#pilar-disiplin"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#222733] bg-[#14171E] hover:border-[#4B8F8C] hover:bg-[#1B202A] text-[#F1F5F9] font-heading font-semibold text-xs sm:text-[13px] transition-all cursor-pointer shadow-2xs min-h-[42px] active:scale-95"
          >
            <IconCompass size={14} className="shrink-0 text-[#4EAA8F]" />
            <span>Eksplorasi 5 Pilar Lab</span>
          </a>
        </div>

        {/* ── THE HERO VISUAL: 3D INFINITE CURVED ROTATING CAROUSEL (SPATIAL SCROLL TILT) ── */}
        <div className="w-full relative mt-8 sm:mt-12 lg:mt-14 [perspective:1200px]">
          <InfiniteCurvedCarousel />
        </div>
      </div>

      {/* ── CONTINUOUS SEAMLESS SUBJECT TICKER ── */}
      <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)] py-2.5 sm:py-3 border-y border-[#222733] bg-[#0C0E12] select-none mt-10 sm:mt-14">
        <div
          className="animate-ticker-continuous flex items-center gap-10 sm:gap-14 lg:gap-18 whitespace-nowrap w-max"
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} className="flex items-baseline gap-2 text-xs sm:text-sm">
              <span className="font-heading font-semibold text-[#F1F5F9] tracking-tight">
                {item.label}
              </span>
              <span className="font-mono text-xs text-[#94A3B8] font-normal">
                {item.spec}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
