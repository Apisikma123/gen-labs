'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { IconArrowRight } from '@/components/icons';
import {
  Icon3dPhysicsEnergy,
  Icon3dMathFunction,
  Icon3dCsMatrix,
  Icon3dGyroscopeApparatus,
  Icon3dChemistryFlask,
} from '@/components/icons/3d';
import { useAuth } from '@/components/auth-provider';

export function CtaSection() {
  const { user } = useAuth();
  const ctaTrackRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: ctaScrollProgress } = useScroll({
    target: ctaTrackRef,
    offset: ['start end', 'center center'],
  });

  const ctaHeaderY = useTransform(ctaScrollProgress, [0, 0.7], [45, 0]);
  const ctaHeaderScale = useTransform(ctaScrollProgress, [0, 0.7], [0.94, 1]);
  const ctaHeaderOpacity = useTransform(ctaScrollProgress, [0, 0.55], [0.2, 1]);

  const cardRot0 = useTransform(ctaScrollProgress, [0, 1], [0, -12]);
  const cardX0 = useTransform(ctaScrollProgress, [0, 1], [40, -15]);
  const cardY0 = useTransform(ctaScrollProgress, [0, 1], [60, 0]);

  const cardRot1 = useTransform(ctaScrollProgress, [0, 1], [0, -6]);
  const cardX1 = useTransform(ctaScrollProgress, [0, 1], [20, -6]);
  const cardY1 = useTransform(ctaScrollProgress, [0, 1], [40, 0]);

  const cardRot2 = useTransform(ctaScrollProgress, [0, 1], [0, 0]);
  const cardX2 = useTransform(ctaScrollProgress, [0, 1], [0, 0]);
  const cardY2 = useTransform(ctaScrollProgress, [0, 1], [25, -6]);

  const cardRot3 = useTransform(ctaScrollProgress, [0, 1], [0, 6]);
  const cardX3 = useTransform(ctaScrollProgress, [0, 1], [-20, 6]);
  const cardY3 = useTransform(ctaScrollProgress, [0, 1], [40, 0]);

  const cardRot4 = useTransform(ctaScrollProgress, [0, 1], [0, 12]);
  const cardX4 = useTransform(ctaScrollProgress, [0, 1], [-40, 15]);
  const cardY4 = useTransform(ctaScrollProgress, [0, 1], [60, 0]);

  const cardRotValues = [cardRot0, cardRot1, cardRot2, cardRot3, cardRot4];
  const cardXValues = [cardX0, cardX1, cardX2, cardX3, cardX4];
  const cardYValues = [cardY0, cardY1, cardY2, cardY3, cardY4];

  return (
    <>
      <hr className="w-full border-t border-[#222733] m-0" />
      <section
        id="cta"
        ref={ctaTrackRef}
        className="relative w-full pt-20 sm:pt-28 pb-0 px-6 sm:px-8 lg:px-12 bg-[#0C0E12] overflow-hidden section-lazy-render"
      >
        <motion.div
          style={{ y: ctaHeaderY, scale: ctaHeaderScale, opacity: ctaHeaderOpacity }}
          className="relative max-w-[860px] mx-auto text-center flex flex-col items-center z-10 will-change-transform"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1C332A] border border-[#3E8E75]/40 font-mono text-xs text-[#4EAA8F] font-semibold mb-6">
            <span>Laboratorium Sains Virtual Indonesia</span>
          </span>

          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[-0.03em] text-[#F1F5F9] leading-[1.08]">
            <span className="block font-normal text-[#94A3B8]">Siap Memahami Sains dengan</span>
            <span className="block font-bold text-[#F1F5F9]">Cara Baru?</span>
          </h2>

          <p className="mt-6 text-base sm:text-lg text-[#94A3B8] font-sans max-w-xl mx-auto leading-relaxed">
            Tak perlu lagi bingung membayangkan rumus abstrak di buku. Coba langsung sekarang, buktikan sendiri konsepnya, dan raih pemahaman terbaik di sekolah.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={user ? (user.role === 'admin' ? '/admin' : '/app') : '/login'}
                prefetch={false}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-heading font-semibold text-sm transition-all cursor-pointer min-h-[46px] bg-[#337963] hover:bg-[#3E8E75] text-white shadow-sm"
              >
                <span>Mulai Belajar Sekarang</span>
                <IconArrowRight size={15} />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={user?.role === 'admin' ? '/admin/modules' : '/app'}
                prefetch={false}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-[#222733] bg-[#14171E] hover:border-[#3E8E75] hover:bg-[#1B202A] text-[#F1F5F9] font-heading font-semibold text-sm transition-all cursor-pointer min-h-[46px] shadow-xs"
              >
                <span>Jelajahi 35+ Modul Praktikum</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* ── THE SIGNATURE WEBANGLES FANNED CARD DECK (TACTILE INTERACTIVE CARDS) ── */}
        <div
          className="relative w-full max-w-3xl mx-auto mt-14 sm:mt-18 h-44 sm:h-56 flex items-end justify-center pointer-events-auto z-10"
        >
          {/* 5 Fanned Preview Cards with Dynamic Continuous Scroll-Linked Fan Spread */}
          <div className="flex items-end justify-center gap-2 sm:gap-3 w-full">
            {[
              { code: 'LAB-01', title: 'Hukum Newton', h: 'h-40 sm:h-52', icon: Icon3dPhysicsEnergy, slug: 'newtons-second-law' },
              { code: 'LAB-02', title: 'Parabola 2D', h: 'h-44 sm:h-56', icon: Icon3dMathFunction, slug: 'function-explorer' },
              { code: 'LAB-04', title: 'Sorting Array', h: 'h-48 sm:h-60', icon: Icon3dCsMatrix, slug: 'sorting-algorithms' },
              { code: 'LAB-05', title: 'Presesi Putar', h: 'h-44 sm:h-56', icon: Icon3dGyroscopeApparatus, slug: 'projectile-motion' },
              { code: 'LAB-06', title: 'Spektrometri', h: 'h-40 sm:h-52', icon: Icon3dChemistryFlask, slug: 'ph-scale' },
            ].map((c, i) => {
              const IconComp = c.icon;
              return (
                <motion.div
                  key={c.code}
                  style={{
                    rotate: cardRotValues[i],
                    x: cardXValues[i],
                    y: cardYValues[i],
                  }}
                  className="w-28 sm:w-36 will-change-transform z-10 hover:z-30 transition-[z-index]"
                >
                  <Link
                    href={`/simulation/${c.slug}`}
                    prefetch={false}
                    className={`w-full ${c.h} rounded-t-2xl border-t border-l border-r border-[#222733] hover:border-[#4EAA8F] bg-[#14171E] hover:bg-[#1B202A] shadow-xl hover:shadow-2xl hover:shadow-[#3E8E75]/25 p-3.5 flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-200 ease-out hover:-translate-y-5 hover:scale-[1.04] active:scale-95 group block`}
                  >
                    <div className="w-full flex items-center justify-center min-w-0">
                      <span className="font-mono text-xs font-bold text-[#4B8F8C] group-hover:text-[#4EAA8F] whitespace-nowrap">{c.code}</span>
                    </div>
                    <div className="my-auto py-1">
                      <IconComp size={36} className="icon-3d-interactive" />
                    </div>
                    <span className="font-heading text-xs font-bold text-[#F1F5F9] text-center leading-tight pb-1">{c.title}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
