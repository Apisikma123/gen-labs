'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
  useInView,
  type Variants,
} from 'motion/react';
import {
  IconArrowRight,
  IconCheck,
  IconClose,
  IconPlay,
  IconRotateCcw,
  IconChevronDown,
  IconSparkles,
  IconCompass,
  IconShield,
  IconZap,
} from '@/components/icons';
import {
  Icon3dPhysicsEnergy,
  Icon3dMathFunction,
  Icon3dCsMatrix,
  Icon3dQuantCandlestick,
  Icon3dChemistryFlask,
  Icon3dAiCore,
  Icon3dBookModule,
  Icon3dGearSettings,
  Icon3dVerifiedEquilibrium,
  Icon3d,
} from '@/components/icons/3d';


import {
  MOTION_EASE,
  MOTION_DURATION,
  MOTION_SPRING,
  heroContainerVariants,
  heroItemVariants,
  stagedContainerVariants,
  stagedItemVariants,
  reducedMotionVariants,
} from '@/lib/motion-tokens';

interface DirectoryModuleItem {
  code: string;
  title: string;
  discipline: string;
  formula: string;
  desc: string;
  slug: string;
  emoji?: string;
  level: string;
  accent: string;
  rot?: number;
}

interface ScrollDrivenDirectoryRowProps {
  item: DirectoryModuleItem;
  idx: number;
  prefersReducedMotion: boolean;
}

const ScrollDrivenDirectoryRow = React.memo(function ScrollDrivenDirectoryRow({
  item,
  idx,
  prefersReducedMotion,
}: ScrollDrivenDirectoryRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ['start end', 'center 75%'],
  });

  // Staggered slide distance from the side so rows cascade in sequence ("berderetan")
  // and smoothly scrub back to the side ("balik lagi ke samping") when scrolling up
  const slideFrom = 60 + (idx % 4) * 15; // 60px, 75px, 90px, 105px

  const x = useTransform(scrollYProgress, [0, 1], [slideFrom, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [0.05, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.97, 1]);

  return (
    <motion.div
      ref={rowRef}
      style={
        prefersReducedMotion
          ? {}
          : {
              x,
              opacity,
              scale,
            }
      }
      className="relative group overflow-hidden will-change-[transform,opacity]"
    >
      {/* Precision Laboratory Seam Indicator on Hover */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#4EAA8F] scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-200 ease-out z-10"
        aria-hidden="true"
      />

      <Link
        href={`/simulation/${item.slug}`}
        prefetch={false}
        className="flex flex-col lg:flex-row lg:items-center justify-between py-5 px-6 sm:px-8 hover:bg-[#1B202A] transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B8F8C]"
      >
        <div className="flex items-center gap-3.5 lg:w-48 shrink-0 mb-2 lg:mb-0">
          <div className="p-1 rounded-lg bg-[#0C0E12]/50 border border-[#222733] group-hover:border-[#4B8F8C]/40 transition-colors">
            <Icon3d name={item.slug || item.discipline} size={26} interactive className="shrink-0" />
          </div>
          <span className="font-mono text-xs sm:text-sm font-extrabold text-[#4EAA8F] tracking-wider">
            {item.code}
          </span>
        </div>

        <div className="lg:flex-1 space-y-1 pr-6 text-left">
          <h3 className="font-heading text-base sm:text-lg font-bold text-[#F1F5F9] group-hover:text-[#4EAA8F] transition-colors">
            {item.title}
          </h3>
          <p className="font-sans text-xs sm:text-sm text-[#94A3B8] line-clamp-1 max-w-[50ch]">
            {item.desc}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 sm:gap-6 shrink-0 mt-3 lg:mt-0 font-mono text-xs">
          <span className="text-[#94A3B8] font-semibold text-xs px-3 py-1 rounded-[6px] bg-[#0C0E12] border border-[#222733] group-hover:border-[#3E8E75]/40 transition-colors">
            {item.level}
          </span>
          <span className="text-[#E5A642] font-bold group-hover:brightness-110 transition-all">
            {item.formula}
          </span>
          <span className="inline-flex items-center gap-1.5 font-sans text-xs font-bold text-[#4B8F8C] group-hover:text-[#4EAA8F] group-hover:translate-x-1.5 transition-all">
            <span>Buka Lab</span>
            <IconArrowRight size={14} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
});

interface ScrollDrivenFaqItemProps {
  item: { q: string; a: string };
  idx: number;
  isOpen: boolean;
  onToggle: () => void;
  prefersReducedMotion: boolean;
}

const ScrollDrivenFaqItem = React.memo(function ScrollDrivenFaqItem({
  item,
  idx,
  isOpen,
  onToggle,
  prefersReducedMotion,
}: ScrollDrivenFaqItemProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ['start end', 'center 80%'],
  });

  const direction = idx % 2 === 0 ? -1 : 1;
  const slideDistance = 65 + (idx % 3) * 15; // 65px, 80px, 95px
  const slideFrom = direction * slideDistance; // Alternates: left, right, left, right...

  const x = useTransform(scrollYProgress, [0, 1], [slideFrom, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [0.05, 1]);

  return (
    <motion.div
      ref={rowRef}
      style={prefersReducedMotion ? {} : { x, y, opacity }}
      className="transition-colors duration-150 will-change-[transform,opacity]"
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full py-6 flex items-center justify-between text-left cursor-pointer focus:outline-none group"
        aria-expanded={isOpen}
      >
        <span className="font-heading text-base sm:text-lg font-semibold text-[#F1F5F9] pr-4 group-hover:text-[#4B8F8C] transition-colors">
          {item.q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-[#94A3B8] group-hover:text-[#F1F5F9] transition-colors"
        >
          <IconChevronDown size={20} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE.precision }}
          >
            <div className="pb-6 font-sans text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-[70ch]">
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export const ShowcaseBelowTheFold = React.memo(function ShowcaseBelowTheFold() {
  const router = useRouter();
  const prefersReducedMotionSystem = useReducedMotion();
  const prefersReducedMotion = Boolean(prefersReducedMotionSystem);
  const [userHypothesis, setUserHypothesis] = useState<number | null>(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('SEMUA');
  const [activeFanIndex, setActiveFanIndex] = useState<number>(3);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Interactive Micro-Visualizer States
  const [vectorAngle, setVectorAngle] = useState<number>(45);
  const [parabolaA, setParabolaA] = useState<number>(1);
  const [phValue, setPhValue] = useState<number>(7);
  const [taxShift, setTaxShift] = useState<number>(0);
  const [sortBars, setSortBars] = useState<number[]>([42, 18, 65, 30, 84, 12, 55, 76]);
  const [isSorting, setIsSorting] = useState<boolean>(false);
  const [sortHighlighted, setSortHighlighted] = useState<number[]>([-1, -1]);

  // ── 2. PILAR BENTO TRACK (SPATIAL BLUEPRINT CONVERGENCE) ──
  const pilarTrackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: pilarScrollProgress } = useScroll({
    target: pilarTrackRef,
    offset: ['start end', 'center center'],
  });
  const smoothPilarProgress = pilarScrollProgress;

  const pilarHeaderY = useTransform(smoothPilarProgress, [0, 0.6], [50, 0]);
  const pilarHeaderOpacity = useTransform(smoothPilarProgress, [0, 0.45], [0.2, 1]);

  // Card 1: Fisika (Wide) — Diagonal glide from bottom-left with subtle tilt
  const card1X = useTransform(smoothPilarProgress, [0.1, 0.75], [-65, 0]);
  const card1Y = useTransform(smoothPilarProgress, [0.1, 0.75], [75, 0]);
  const card1Rot = useTransform(smoothPilarProgress, [0.1, 0.75], [-2, 0]);
  const card1Scale = useTransform(smoothPilarProgress, [0.1, 0.75], [0.93, 1]);
  const card1Opacity = useTransform(smoothPilarProgress, [0.1, 0.65], [0.25, 1]);

  // Card 2: Matematika — Vertical ascent with zoom from depth
  const card2Y = useTransform(smoothPilarProgress, [0.15, 0.8], [95, 0]);
  const card2Scale = useTransform(smoothPilarProgress, [0.15, 0.8], [0.91, 1]);
  const card2Opacity = useTransform(smoothPilarProgress, [0.15, 0.7], [0.25, 1]);

  // Card 3: Informatika — Diagonal glide from bottom-right with subtle counter tilt
  const card3X = useTransform(smoothPilarProgress, [0.2, 0.85], [65, 0]);
  const card3Y = useTransform(smoothPilarProgress, [0.2, 0.85], [75, 0]);
  const card3Rot = useTransform(smoothPilarProgress, [0.2, 0.85], [2, 0]);
  const card3Scale = useTransform(smoothPilarProgress, [0.2, 0.85], [0.93, 1]);
  const card3Opacity = useTransform(smoothPilarProgress, [0.2, 0.75], [0.25, 1]);

  // Card 4: Ekonomi — Lateral glide from left
  const card4X = useTransform(smoothPilarProgress, [0.25, 0.9], [-50, 0]);
  const card4Y = useTransform(smoothPilarProgress, [0.25, 0.9], [60, 0]);
  const card4Opacity = useTransform(smoothPilarProgress, [0.25, 0.8], [0.25, 1]);

  // Card 5: Kimia — Lateral glide from right
  const card5X = useTransform(smoothPilarProgress, [0.3, 0.95], [50, 0]);
  const card5Y = useTransform(smoothPilarProgress, [0.3, 0.95], [60, 0]);
  const card5Opacity = useTransform(smoothPilarProgress, [0.3, 0.85], [0.25, 1]);

  // ── 3. INKUIRI TRACK (PROGRESSIVE CIRCUIT ASSEMBLY) ──
  const inkuiriRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: inkuiriProgress } = useScroll({
    target: inkuiriRef,
    offset: ['start end', 'center center'],
  });
  const smoothInkuiriProgress = inkuiriProgress;

  const inkuiriHeaderY = useTransform(smoothInkuiriProgress, [0, 0.5], [40, 0]);
  const inkuiriHeaderOpacity = useTransform(smoothInkuiriProgress, [0, 0.4], [0.2, 1]);
  const beamScaleX = useTransform(smoothInkuiriProgress, [0.15, 0.85], [0, 1]);

  const step1X = useTransform(smoothInkuiriProgress, [0.12, 0.52], [-45, 0]);
  const step1Y = useTransform(smoothInkuiriProgress, [0.12, 0.52], [55, 0]);
  const step1Scale = useTransform(smoothInkuiriProgress, [0.12, 0.52], [0.92, 1]);
  const step1Opacity = useTransform(smoothInkuiriProgress, [0.12, 0.45], [0.2, 1]);

  const step2Y = useTransform(smoothInkuiriProgress, [0.32, 0.72], [65, 0]);
  const step2Scale = useTransform(smoothInkuiriProgress, [0.32, 0.72], [0.90, 1]);
  const step2Opacity = useTransform(smoothInkuiriProgress, [0.32, 0.65], [0.2, 1]);

  const step3X = useTransform(smoothInkuiriProgress, [0.52, 0.92], [45, 0]);
  const step3Y = useTransform(smoothInkuiriProgress, [0.52, 0.92], [55, 0]);
  const step3Scale = useTransform(smoothInkuiriProgress, [0.52, 0.92], [0.92, 1]);
  const step3Opacity = useTransform(smoothInkuiriProgress, [0.52, 0.85], [0.2, 1]);

  // ── 4. TANYA AI & WORKBENCH TRACK (DUAL-FIELD MAGNETIC CONVERGENCE) ──
  const tutorTrackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: tutorProgress } = useScroll({
    target: tutorTrackRef,
    offset: ['start end', 'center center'],
  });
  const smoothTutorProgress = tutorProgress;

  const tutorLeftX = useTransform(smoothTutorProgress, [0.15, 0.85], [-70, 0]);
  const tutorLeftY = useTransform(smoothTutorProgress, [0.15, 0.85], [40, 0]);
  const tutorLeftOpacity = useTransform(smoothTutorProgress, [0.15, 0.75], [0.2, 1]);

  const tutorRightX = useTransform(smoothTutorProgress, [0.2, 0.9], [70, 0]);
  const tutorRightY = useTransform(smoothTutorProgress, [0.2, 0.9], [50, 0]);
  const tutorRightScale = useTransform(smoothTutorProgress, [0.2, 0.9], [0.92, 1]);
  const tutorRightOpacity = useTransform(smoothTutorProgress, [0.2, 0.8], [0.2, 1]);

  // ── 5. SWISS COMPARISON MATRIX TRACK (WEIGHING SCALE CALIBRATION) ──
  const swissTrackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: swissProgress } = useScroll({
    target: swissTrackRef,
    offset: ['start end', 'center center'],
  });
  const smoothSwissProgress = swissProgress;

  const swissHeaderY = useTransform(smoothSwissProgress, [0, 0.5], [40, 0]);
  const swissHeaderOpacity = useTransform(smoothSwissProgress, [0, 0.4], [0.2, 1]);

  const convX = useTransform(smoothSwissProgress, [0.15, 0.85], [-55, 0]);
  const convY = useTransform(smoothSwissProgress, [0.15, 0.85], [60, 0]);
  const convRot = useTransform(smoothSwissProgress, [0.15, 0.85], [-2.5, 0]);
  const convOpacity = useTransform(smoothSwissProgress, [0.15, 0.75], [0.2, 1]);

  const genX = useTransform(smoothSwissProgress, [0.2, 0.9], [55, 0]);
  const genY = useTransform(smoothSwissProgress, [0.2, 0.9], [65, 0]);
  const genRot = useTransform(smoothSwissProgress, [0.2, 0.9], [2.5, 0]);
  const genScale = useTransform(smoothSwissProgress, [0.2, 0.9], [0.93, 1]);
  const genOpacity = useTransform(smoothSwissProgress, [0.2, 0.8], [0.2, 1]);

  // ── 6. STEM DIRECTORY TRACK (KINETIC TABULAR WAVE) ──
  const directoryTrackRef = useRef<HTMLDivElement>(null);
  const directoryTableRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: directoryProgress } = useScroll({
    target: directoryTrackRef,
    offset: ['start end', 'end start'],
  });
  const smoothDirectoryProgress = directoryProgress;

  const dirHeaderY = useTransform(smoothDirectoryProgress, [0, 0.3], [40, 0]);
  const dirHeaderOpacity = useTransform(smoothDirectoryProgress, [0, 0.25], [0.2, 1]);
  const dirTabsY = useTransform(smoothDirectoryProgress, [0.05, 0.35], [25, 0]);
  const dirTabsOpacity = useTransform(smoothDirectoryProgress, [0.05, 0.3], [0.3, 1]);

  // ── 7. FAQ TRACK (CASCADING DOSSIER UNFOLD) ──
  const faqTrackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: faqProgress } = useScroll({
    target: faqTrackRef,
    offset: ['start end', 'center center'],
  });
  const smoothFaqProgress = faqProgress;

  const faqHeaderY = useTransform(smoothFaqProgress, [0, 0.45], [40, 0]);
  const faqHeaderOpacity = useTransform(smoothFaqProgress, [0, 0.35], [0.2, 1]);

  const fanModules = [
    {
      id: 'fan-1',
      code: 'LAB-01',
      discipline: 'FISIKA',
      shortTitle: 'Hukum Newton',
      title: 'Hukum II Newton',
      formula: 'a = F / m',
      desc: 'Buktikan percepatan balok bertambah cepat saat ditarik lebih kuat dan melambat saat beban bertambah berat.',
      slug: 'newtons-second-law',
      emoji: 'physics',
      level: 'D4 Vokasi / S1',
      accent: '#4B8F8C',
      rot: -12,
    },
    {
      id: 'fan-2',
      code: 'LAB-02',
      discipline: 'MATEMATIKA',
      shortTitle: 'Kurva Parabola',
      title: 'Parabola Kuadrat',
      formula: 'y = ax² + bx + c',
      desc: 'Ubah angka koefisien dan saksikan bentuk lengkungan kurva kuadrat serta titik puncaknya berubah seketika.',
      slug: 'function-explorer',
      emoji: 'geometry',
      level: 'D4 Vokasi / S1',
      accent: '#BA8230',
      rot: -8,
    },
    {
      id: 'fan-3',
      code: 'LAB-03',
      discipline: 'EKONOMI',
      shortTitle: 'Pasar & Harga',
      title: 'Keseimbangan Pasar',
      formula: 'Qd = Qs',
      desc: 'Simulasi harga keseimbangan pasar dan kuantitas barang saat terjadi perubahan pajak atau subsidi.',
      slug: 'supply-demand',
      emoji: 'bar_chart',
      level: 'D4 MPI & AKT / S1',
      accent: '#4B8F8C',
      rot: -4,
    },
    {
      id: 'fan-4',
      code: 'LAB-04',
      discipline: 'INFORMATIKA',
      shortTitle: 'Urutkan Angka',
      title: 'Urutkan Angka (Sorting)',
      formula: 'O(n log n)',
      desc: 'Lihat bagaimana komputer menyusun barisan angka acak menjadi berurutan langkah demi langkah secara visual.',
      slug: 'sorting-algorithms',
      emoji: 'informatics',
      level: 'D4 TRPL / S1',
      accent: '#BA8230',
      rot: 0,
    },
    {
      id: 'fan-5',
      code: 'LAB-05',
      discipline: 'FISIKA',
      shortTitle: 'Gerak Peluru',
      title: 'Gerak Peluru Parabola',
      formula: 'Jarak = (v₀² sin 2θ) / g',
      desc: 'Atur sudut tembakan meriam untuk mencari sudut elevasi terbaik agar tembakan mencapai jarak terjauh.',
      slug: 'projectile-motion',
      emoji: 'rocket',
      level: 'D4 Vokasi / S2',
      accent: '#4B8F8C',
      rot: 4,
    },
    {
      id: 'fan-6',
      code: 'LAB-06',
      discipline: 'KIMIA',
      shortTitle: 'Skala pH Asam Basa',
      title: 'Derajat Asam Basa (pH)',
      formula: 'pH = -log₁₀[H⁺]',
      desc: 'Campurkan cairan asam dan basa, amati perubahan warna larutan, dan hitung konsentrasi ion hidrogen.',
      slug: 'ph-scale',
      emoji: 'chemistry',
      level: 'D4 HORTI / S1',
      accent: '#BA8230',
      rot: 8,
    },
    {
      id: 'fan-7',
      code: 'LAB-07',
      discipline: 'FISIKA',
      shortTitle: 'Hukum Hooke Pegas',
      title: 'Elastisitas Pegas',
      formula: 'F = -k · Δx',
      desc: 'Gantungkan variasi beban massa pada pegas baja dan ukur pertambahan panjang regangan secara presisi.',
      slug: 'hookes-law',
      emoji: 'wave',
      level: 'D4 Vokasi / S2',
      accent: '#4B8F8C',
      rot: 12,
    },
  ];

  const allDirectoryModules = [
    {
      code: 'LAB-01',
      title: 'Hukum II Newton: Percepatan Benda',
      discipline: 'FISIKA',
      formula: 'F = m · a',
      desc: 'Uji hubungan antara besaran gaya dorong, beban massa benda, dan percepatan yang dihasilkan pada lintasan gesek.',
      slug: 'newtons-second-law',
      emoji: 'physics',
      level: 'D4 Vokasi / S1',
      accent: '#4B8F8C',
      rot: 0,
    },
    {
      code: 'LAB-02',
      title: 'Eksplorasi Kurva Fungsi Kuadrat',
      discipline: 'MATEMATIKA',
      formula: 'f(x) = ax² + bx + c',
      desc: 'Eksplorasi pergeseran kurva parabola, titik puncak optimum, garis simetri, dan nilai diskriminan secara visual.',
      slug: 'function-explorer',
      emoji: 'geometry',
      level: 'D4 Vokasi / S1',
      accent: '#BA8230',
      rot: 0,
    },
    {
      code: 'LAB-03',
      title: 'Keseimbangan Permintaan & Penawaran Pasar',
      discipline: 'EKONOMI',
      formula: 'Qd(P) = Qs(P)',
      desc: 'Simulasi harga kliring pasar dan volume barang keseimbangan saat terjadi pergeseran kurva penawaran atau permintaan.',
      slug: 'supply-demand',
      emoji: 'bar_chart',
      level: 'D4 MPI & AKT / S1',
      accent: '#4B8F8C',
      rot: 0,
    },
    {
      code: 'LAB-04',
      title: 'Algoritma Pengurutan Data (Bubble & Quick Sort)',
      discipline: 'INFORMATIKA',
      formula: 'O(n²) / O(n log n)',
      desc: 'Bandingkan efisiensi algoritma pengurutan data dengan melacak pertukaran indeks baris dan perbandingan data visual.',
      slug: 'sorting-algorithms',
      emoji: 'informatics',
      level: 'D4 TRPL / S1',
      accent: '#BA8230',
      rot: 0,
    },
    {
      code: 'LAB-05',
      title: 'Gerak Parabola & Lintasan Peluru',
      discipline: 'FISIKA',
      formula: 'y(t) = v₀y·t - ½gt²',
      desc: 'Luncurkan proyektil meriam dengan berbagai sudut tembak dan kecepatan awal untuk membuktikan jarak tempuh terjauh.',
      slug: 'projectile-motion',
      emoji: 'rocket',
      level: 'D4 Vokasi / S2',
      accent: '#4B8F8C',
      rot: 0,
    },
    {
      code: 'LAB-06',
      title: 'Derajat Keasaman & Titrasi Asam Basa',
      discipline: 'KIMIA',
      formula: 'pH = -log[H⁺]',
      desc: 'Campur larutan asam dan basa dengan tetesan buret presisi untuk mengamati titik ekuivalen indikator warna.',
      slug: 'ph-scale',
      emoji: 'chemistry',
      level: 'D4 HORTI / S1',
      accent: '#BA8230',
      rot: 0,
    },
    {
      code: 'LAB-07',
      title: 'Hukum Hooke & Konstanta Elastisitas Pegas',
      discipline: 'FISIKA',
      formula: 'F_pegas = -k · Δx',
      desc: 'Uji konstanta elastisitas berbagai material pegas dan amati osilasi harmonik sederhana saat pegas dilepas.',
      slug: 'hookes-law',
      emoji: 'wave',
      level: 'D4 Vokasi / S2',
      accent: '#4B8F8C',
      rot: 0,
    },
    {
      code: 'LAB-08',
      title: 'Pencarian Biner (Binary Search vs Linear Search)',
      discipline: 'INFORMATIKA',
      formula: 'Langkah = ⌈log₂ n⌉',
      desc: 'Buktikan mengapa pembagian ruang pencarian separuh data jauh lebih cepat daripada mencari satu demi satu secara linear.',
      slug: 'binary-search',
      emoji: 'laptop',
      level: 'D4 TRPL / S1',
      accent: '#BA8230',
      rot: 0,
    },
    {
      code: 'LAB-09',
      title: 'Hukum Archimedes & Gaya Apung Fluida',
      discipline: 'FISIKA',
      formula: 'Fa = ρ_fluida · V_celup · g',
      desc: 'Celupkan benda dengan berbagai massa jenis ke dalam fluida untuk membuktikan kondisi terapung, melayang, dan tenggelam.',
      slug: 'archimedes-principle',
      emoji: 'droplet',
      level: 'D4 Vokasi / S2',
      accent: '#4B8F8C',
      rot: 0,
    },
    {
      code: 'LAB-10',
      title: 'Bunga Majemuk & Pertumbuhan Investasi Finansial',
      discipline: 'EKONOMI',
      formula: 'A = P(1 + r/n)ⁿᵗ',
      desc: 'Bandingkan kurva pertumbuhan bunga tunggal versus bunga majemuk dalam jangka waktu pendek hingga panjang.',
      slug: 'compound-interest',
      emoji: 'chart_increasing',
      level: 'D4 AKT & MPI / S1',
      accent: '#BA8230',
      rot: 0,
    },
    {
      code: 'LAB-11',
      title: 'Rangkaian Listrik Arus Searah (Hukum Ohm)',
      discipline: 'FISIKA',
      formula: 'V = I · R | P = V · I',
      desc: 'Rangkai resistor secara seri dan paralel, ukur kuat arus listrik dan beda potensial menggunakan multimeter virtual.',
      slug: 'circuits-ohms-law',
      emoji: 'electric_plug',
      level: 'D4 TRPL & Vokasi / S2',
      accent: '#4B8F8C',
      rot: 0,
    },
    {
      code: 'LAB-12',
      title: 'Laju Reaksi Kimia & Pengaruh Suhu',
      discipline: 'KIMIA',
      formula: 'v = k · [A]ᵐ · [B]ⁿ',
      desc: 'Amati frekuensi tumbukan efektif partikel zat kimia saat suhu dinaikkan atau konsentrasi pereaksi ditambah.',
      slug: 'reaction-rates',
      emoji: 'fire',
      level: 'D4 HORTI / S1',
      accent: '#BA8230',
      rot: 0,
    },
    {
      code: 'LAB-13',
      title: 'Optika Geometri: Pembiasan Lensa Cembung & Cekung',
      discipline: 'FISIKA',
      formula: '1/f = 1/s + 1/s\'',
      desc: 'Geser posisi benda di depan lensa untuk melihat pembentukan bayangan nyata, maya, tegak, atau terbalik secara live.',
      slug: 'lens-refraction',
      emoji: 'telescope',
      level: 'D4 Vokasi / S2',
      accent: '#4B8F8C',
      rot: 0,
    },
    {
      code: 'LAB-14',
      title: 'Distribusi Peluang & Percobaan Koin Binomial',
      discipline: 'MATEMATIKA',
      formula: 'P(X = k) = C(n,k) pᵏ',
      desc: 'Eksperimen lemparan koin acak untuk mengamati hukum bilangan besar dan distribusi probabilitas binomial.',
      slug: 'probability-coin',
      emoji: 'abacus',
      level: 'D4 Vokasi / S1',
      accent: '#BA8230',
      rot: 0,
    },
  ];



  const faqItems = [
    {
      q: 'Apakah GEN LABS gratis untuk digunakan mahasiswa?',
      a: 'Ya, seluruh modul laboratorium virtual dan fitur eksperimen dapat diakses oleh seluruh mahasiswa dan pelajar langsung dari peramban (browser) tanpa instalasi tambahan.',
    },
    {
      q: 'Apakah materi di sini sesuai dengan standar kurikulum sains & vokasi?',
      a: 'Sangat sesuai. Modul disusun berdasarkan kurikulum sains komputasi dan vokasi terapan (rekayasa perangkat lunak, sistem data, agribisnis, serta sains terapan).',
    },
    {
      q: 'Bagaimana jika saya bingung saat mencoba eksperimen?',
      a: 'Di setiap modul tersedia Tanya AI. Alih-alih membocorkan kunci jawaban, asisten akan memberikan petunjuk bertahap dan pertanyaan pemantik agar kamu memahami konsepnya sendiri lewat logika berpikir.',
    },
    {
      q: 'Apakah saya perlu mengunduh aplikasi atau butuh laptop spek tinggi?',
      a: 'Tidak perlu. GEN LABS berjalan 100% online di browser. Sangat ringan dan lancar dibuka di smartphone Android/iPhone, tablet, hingga laptop kerja biasa.',
    },
    {
      q: 'Bagaimana cara mengumpulkan hasil praktikum ke dosen atau instruktur lab?',
      a: 'Kamu bisa menggunakan Lembar Kerja Praktikum (Logbook) digital yang otomatis mencatat data percobaan, grafik hasil eksperimen, dan kesimpulanmu untuk diunduh sebagai laporan atau diserahkan ke dosen.',
    },
  ];

  const filteredModules =
    selectedDiscipline === 'SEMUA'
      ? allDirectoryModules
      : allDirectoryModules.filter((m) => m.discipline === selectedDiscipline);

  // Sorting Visualizer Simulation Handler
  const runSortingDemo = () => {
    if (isSorting) return;
    setIsSorting(true);
    const sorted = [...sortBars].sort((a, b) => a - b);
    setSortHighlighted([1, 4]);
    setTimeout(() => {
      setSortHighlighted([2, 5]);
      setTimeout(() => {
        setSortBars(sorted);
        setSortHighlighted([-1, -1]);
        setIsSorting(false);
      }, 500);
    }, 400);
  };

  const resetSortingDemo = () => {
    setSortBars([42, 18, 65, 30, 84, 12, 55, 76]);
    setSortHighlighted([-1, -1]);
  };

  return (
    <div className="w-full flex flex-col items-center">


      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── SECTION 2: PILAR DISIPLIN ── */}
      <hr className="w-full border-t border-[#222733] m-0" />
        <section
          id="pilar-disiplin"
        ref={pilarTrackRef}
        className="section-lazy-render relative w-full py-20 sm:py-28 bg-[#0C0E12] text-[#F1F5F9]"
      >
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12">
          {/* Section Header */}
          <motion.div
            style={prefersReducedMotion ? {} : { y: pilarHeaderY, opacity: pilarHeaderOpacity }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14171E] border border-[#222733] font-mono text-xs text-[#4EAA8F]">
              <IconSparkles size={14} className="shrink-0 text-[#4EAA8F]" />
              <span>Kurikulum Sains & Vokasi Terapan</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-[3.25rem] font-bold tracking-[-0.03em] text-[#F1F5F9] leading-[1.1]">
              5 Pilar Disiplin <span className="text-[#4B8F8C]">Laboratorium STEM</span>
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-[55ch] mx-auto">
              Setiap disiplin ilmu memiliki modul eksperimen terspesialisasi dengan visualisasi rumus eksak dan telemetri langsung di layar.
            </p>
          </motion.div>

          {/* 5 Distinct Cards in Varied Asymmetric Bento Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 text-left">
            {/* CARD 01: FISIKA (Wide 2-col or Feature treatment) */}
            <motion.div
              style={prefersReducedMotion ? {} : { x: card1X, y: card1Y, rotate: card1Rot, scale: card1Scale, opacity: card1Opacity }}
              className="lg:col-span-2 bg-[#14171E] hover:bg-[#181D26] border border-[#222733] hover:border-[#4B8F8C] rounded-3xl p-7 sm:p-8 flex flex-col justify-between space-y-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-[#4B8F8C]/10 will-change-transform group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-[#1C332A]/30 border border-[#1C332A] shrink-0">
                    <Icon3dPhysicsEnergy size={48} className="icon-3d-interactive cursor-pointer" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono text-xs text-[#4B8F8C] font-bold">
                      <span>12 MODUL RESMI</span>
                      <span className="text-[#222733]">/</span>
                      <span>D4 VOKASI &amp; STEM TERAPAN</span>
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-[#F1F5F9]">
                      Fisika Dinamis, Kinematika &amp; Gaya
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-[#94A3B8] max-w-lg leading-relaxed">
                      Eksperimen gerak lurus, gravitasi bumi, gerak peluru parabola, hukum kekekalan momentum, hingga osilasi bandul dengan presisi perhitungan analitik.
                    </p>
                  </div>
                </div>

                <span className="font-mono text-xs font-bold text-[#E5A642] px-3 py-1 rounded-lg bg-[#BA8230]/15 border border-[#BA8230]/40 shrink-0 self-start">
                  F = m · a
                </span>
              </div>

              {/* Interactive Vector Angle Resolver */}
              <div className="pt-4 border-t border-[#222733] space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-[#CBD5E1]">
                  <span>INTERAKTIF: SUDUT_ELEVASIKU (θ):</span>
                  <span className="text-[#4EAA8F] font-bold">{vectorAngle}°</span>
                </div>
                <div className="relative w-full h-24 bg-[#0C0E12] rounded-xl overflow-hidden flex items-center justify-center border border-[#222733]">
                  <svg className="w-full h-full" viewBox="0 0 200 90">
                    <line x1="20" y1="75" x2="180" y2="75" stroke="#222733" strokeWidth="1" />
                    <line x1="20" y1="15" x2="20" y2="75" stroke="#222733" strokeWidth="1" />
                    <line
                      x1="20"
                      y1="75"
                      x2={20 + Math.cos((vectorAngle * Math.PI) / 180) * 120}
                      y2="75"
                      stroke="#4B8F8C"
                      strokeWidth="2.5"
                    />
                    <line
                      x1={20 + Math.cos((vectorAngle * Math.PI) / 180) * 120}
                      y1="75"
                      x2={20 + Math.cos((vectorAngle * Math.PI) / 180) * 120}
                      y2={75 - Math.sin((vectorAngle * Math.PI) / 180) * 60}
                      stroke="#BA8230"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1="20"
                      y1="75"
                      x2={20 + Math.cos((vectorAngle * Math.PI) / 180) * 120}
                      y2={75 - Math.sin((vectorAngle * Math.PI) / 180) * 60}
                      stroke="#4EAA8F"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[15, 30, 45, 60, 75].map((deg) => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => setVectorAngle(deg)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                          vectorAngle === deg
                            ? 'bg-[#1C332A] border border-[#4B8F8C] text-[#4EAA8F]'
                            : 'bg-[#14171E] border border-[#222733] text-[#94A3B8] hover:text-[#F1F5F9]'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                  <Link
                    href="/simulation/projectile-motion"
                    className="text-[#4B8F8C] hover:text-[#4EAA8F] font-bold text-xs flex items-center gap-1 whitespace-nowrap transition-colors"
                  >
                    <span>Luncurkan Lab</span>
                    <IconArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* CARD 02: MATEMATIKA */}
            <motion.div
              style={prefersReducedMotion ? {} : { y: card2Y, scale: card2Scale, opacity: card2Opacity }}
              className="bg-[#14171E] hover:bg-[#181D26] border border-[#222733] hover:border-[#BA8230] rounded-3xl p-7 flex flex-col justify-between space-y-5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-[#BA8230]/10 will-change-transform group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-[#BA8230]/20 border border-[#BA8230]/40 shrink-0">
                    <Icon3dMathFunction size={44} className="icon-3d-interactive cursor-pointer" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#E5A642] px-2.5 py-0.5 rounded-lg bg-[#BA8230]/15 border border-[#BA8230]/30">
                    f(x) = ax²
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="font-mono text-xs text-[#E5A642] font-bold">
                    8 MODUL / ALJABAR &amp; GRAFIK
                  </div>
                  <h3 className="font-heading text-xl font-bold text-[#F1F5F9]">
                    Matematika &amp; Aljabar Dinamis
                  </h3>
                  <p className="font-sans text-xs text-[#94A3B8] leading-relaxed">
                    Visualisasi fungsi kuadrat, trigonometri sudut istimewa, matriks transformasi 2D, dan kalkulus diferensial.
                  </p>
                </div>
              </div>

              {/* Interactive Parabola Preview */}
              <div className="pt-3 border-t border-[#222733] space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-[#CBD5E1]">
                  <span>KOEFISIEN (a):</span>
                  <span className="text-[#E5A642] font-bold">a = {parabolaA > 0 ? `+${parabolaA}` : parabolaA}</span>
                </div>
                <div className="relative w-full h-20 bg-[#0C0E12] rounded-xl overflow-hidden flex items-center justify-center border border-[#222733]">
                  <svg className="w-full h-full" viewBox="-50 -35 100 70">
                    <line x1="-50" y1="0" x2="50" y2="0" stroke="#222733" strokeWidth="0.8" />
                    <line x1="0" y1="-35" x2="0" y2="35" stroke="#222733" strokeWidth="0.8" />
                    <path
                      d={Array.from({ length: 41 })
                        .map((_, idx) => {
                          const x = (idx - 20) * 2;
                          const y = -parabolaA * (x * x) * 0.04;
                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#BA8230"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1">
                    {[-1.5, -0.8, 0.8, 1.5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setParabolaA(val)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                          parabolaA === val
                            ? 'bg-[#BA8230] text-white font-bold'
                            : 'bg-[#14171E] border border-[#222733] text-[#94A3B8] hover:text-[#F1F5F9]'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  <Link href="/simulation/function-explorer" className="text-[#E5A642] font-bold text-xs">
                    Lab →
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* CARD 03: INFORMATIKA */}
            <motion.div
              style={prefersReducedMotion ? {} : { x: card3X, y: card3Y, rotate: card3Rot, scale: card3Scale, opacity: card3Opacity }}
              className="bg-[#14171E] hover:bg-[#181D26] border border-[#222733] hover:border-[#4B8F8C] rounded-3xl p-7 flex flex-col justify-between space-y-5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-[#4B8F8C]/10 will-change-transform group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-[#1C332A]/30 border border-[#1C332A] shrink-0">
                    <Icon3dCsMatrix size={44} className="icon-3d-interactive cursor-pointer" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#4EAA8F] px-2.5 py-0.5 rounded-lg bg-[#1C332A]/20 border border-[#1C332A]">
                    O(n log n)
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="font-mono text-xs text-[#4B8F8C] font-bold">
                    6 MODUL / STRUKTUR DATA
                  </div>
                  <h3 className="font-heading text-xl font-bold text-[#F1F5F9]">
                    Informatika &amp; Logika Algoritma
                  </h3>
                  <p className="font-sans text-xs text-[#94A3B8] leading-relaxed">
                    Pengurutan array visual, binary search traversal, stack &amp; queue, hingga traversal graph tree.
                  </p>
                </div>
              </div>

              {/* Interactive Sorting Simulator */}
              <div className="pt-3 border-t border-[#222733] space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-[#CBD5E1]">
                  <span>VISUALISASI SORTING:</span>
                  <span className="text-[#4EAA8F] font-bold">{isSorting ? 'PROSES...' : 'SIAP'}</span>
                </div>
                <div className="relative w-full h-20 bg-[#0C0E12] rounded-xl p-2.5 flex items-end justify-between gap-1 overflow-hidden border border-[#222733]">
                  {sortBars.map((val, idx) => {
                    const isHigh = sortHighlighted.includes(idx);
                    return (
                      <div
                        key={idx}
                        style={{ height: `${val}%` }}
                        className={`flex-1 rounded-sm transition-all duration-300 ${
                          isHigh ? 'bg-[#BA8230] ring-1 ring-[#BA8230]' : 'bg-[#4B8F8C]'
                        }`}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={runSortingDemo}
                    disabled={isSorting}
                    className="flex-1 py-1.5 rounded-lg bg-[#1C332A] hover:bg-[#4EAA8F] text-white font-sans text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <IconPlay size={12} />
                    <span>Jalankan</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetSortingDemo}
                    className="p-1.5 rounded-lg bg-[#14171E] border border-[#222733] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors cursor-pointer"
                    title="Acak kembali data"
                  >
                    <IconRotateCcw size={13} />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* CARD 04: EKONOMI */}
            <motion.div
              style={prefersReducedMotion ? {} : { x: card4X, y: card4Y, opacity: card4Opacity }}
              className="bg-[#14171E] hover:bg-[#181D26] border border-[#222733] hover:border-[#BA8230] rounded-3xl p-7 flex flex-col justify-between space-y-5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-[#BA8230]/10 will-change-transform group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-[#BA8230]/20 border border-[#BA8230]/40 shrink-0">
                    <Icon3dQuantCandlestick size={44} className="icon-3d-interactive cursor-pointer" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#E5A642] px-2.5 py-0.5 rounded-lg bg-[#BA8230]/15 border border-[#BA8230]/30">
                    Qd = Qs
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="font-mono text-xs text-[#E5A642] font-bold">
                    5 MODUL / PASAR &amp; KEUANGAN
                  </div>
                  <h3 className="font-heading text-xl font-bold text-[#F1F5F9]">
                    Ekonomi &amp; Dinamika Pasar
                  </h3>
                  <p className="font-sans text-xs text-[#94A3B8] leading-relaxed">
                    Ekuilibrium permintaan-penawaran, elastisitas harga, inflasi, dan simulasi bunga majemuk investasi.
                  </p>
                </div>
              </div>

              {/* Interactive Supply Demand Curves */}
              <div className="pt-3 border-t border-[#222733] space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-[#CBD5E1]">
                  <span>PERGESERAN PAJAK:</span>
                  <span className="text-[#E5A642] font-bold">+{taxShift * 10}%</span>
                </div>
                <div className="relative w-full h-20 bg-[#0C0E12] rounded-xl overflow-hidden flex items-center justify-center border border-[#222733]">
                  <svg className="w-full h-full" viewBox="0 0 100 60">
                    <line x1="10" y1="50" x2="90" y2="50" stroke="#222733" strokeWidth="1" />
                    <line x1="10" y1="10" x2="10" y2="50" stroke="#222733" strokeWidth="1" />
                    {/* Demand Curve (Downward) */}
                    <line x1="15" y1="15" x2="85" y2="45" stroke="#4B8F8C" strokeWidth="2" />
                    {/* Supply Curve (Upward with dynamic shift) */}
                    <line x1="15" y1={45 - taxShift * 5} x2="85" y2={15 - taxShift * 5} stroke="#BA8230" strokeWidth="2" />
                  </svg>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setTaxShift(lvl)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                          taxShift === lvl
                            ? 'bg-[#1C332A] border border-[#4B8F8C] text-[#4EAA8F]'
                            : 'bg-[#14171E] border border-[#222733] text-[#94A3B8] hover:text-[#F1F5F9]'
                        }`}
                      >
                        Pajak {lvl === 0 ? '0%' : lvl === 1 ? '10%' : '20%'}
                      </button>
                    ))}
                  </div>
                  <Link href="/simulation/supply-demand" className="text-[#E5A642] font-bold text-xs">
                    Lab →
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* CARD 05: KIMIA */}
            <motion.div
              style={prefersReducedMotion ? {} : { x: card5X, y: card5Y, opacity: card5Opacity }}
              className="bg-[#14171E] hover:bg-[#181D26] border border-[#222733] hover:border-[#4B8F8C] rounded-3xl p-7 flex flex-col justify-between space-y-5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-[#4B8F8C]/10 will-change-transform group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-[#1C332A]/30 border border-[#1C332A] shrink-0">
                    <Icon3dChemistryFlask size={44} className="icon-3d-interactive cursor-pointer" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#4EAA8F] px-2.5 py-0.5 rounded-lg bg-[#1C332A]/20 border border-[#1C332A]">
                    pH = -log[H⁺]
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="font-mono text-xs text-[#4B8F8C] font-bold">
                    4 MODUL / STOIKIOMETRI &amp; LARUTAN
                  </div>
                  <h3 className="font-heading text-xl font-bold text-[#F1F5F9]">
                    Kimia &amp; Derajat Larutan
                  </h3>
                  <p className="font-sans text-xs text-[#94A3B8] leading-relaxed">
                    Derajat keasaman pH, titrasi asam kuat-basa kuat, laju reaksi kimia, dan konsentrasi larutan molaritas.
                  </p>
                </div>
              </div>

              {/* Interactive pH Meter */}
              <div className="pt-3 border-t border-[#222733] space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-[#CBD5E1]">
                  <span>SKALA LARUTAN:</span>
                  <span className={`font-bold ${phValue < 7 ? 'text-[#D9534F]' : phValue > 7 ? 'text-[#4B8F8C]' : 'text-[#94A3B8]'}`}>
                    pH {phValue} ({phValue < 7 ? 'ASAM' : phValue > 7 ? 'BASA' : 'NETRAL'})
                  </span>
                </div>
                <div className="relative w-full h-20 bg-[#0C0E12] rounded-xl overflow-hidden flex items-center justify-center border border-[#222733]">
                  <div
                    className="w-16 h-16 rounded-full transition-all duration-300 flex items-center justify-center font-bold text-white shadow-sm"
                    style={{
                      backgroundColor:
                        phValue === 2
                          ? '#D9534F'
                          : phValue === 4
                          ? '#E88B58'
                          : phValue === 7
                          ? '#4B8F8C'
                          : phValue === 10
                          ? '#3B7A9E'
                          : '#285888',
                    }}
                  >
                    {phValue}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    {[2, 7, 12].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setPhValue(v)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                          phValue === v
                            ? 'bg-[#1C332A] border border-[#4B8F8C] text-[#4EAA8F]'
                            : 'bg-[#14171E] border border-[#222733] text-[#94A3B8] hover:text-[#F1F5F9]'
                        }`}
                      >
                        {v === 2 ? 'Asam (2)' : v === 7 ? 'Netral (7)' : 'Basa (12)'}
                      </button>
                    ))}
                  </div>
                  <Link href="/simulation/ph-scale" className="text-[#4B8F8C] font-bold text-xs">
                    Lab →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── SECTION 4: ALUR INKUIRI (HOW IT WORKS — THE 3-PHASE BLUEPRINT) ─── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <hr className="w-full border-t border-[#222733] m-0" />
        <section
          id="cara-belajar"
        ref={inkuiriRef}
        className="section-lazy-render relative w-full py-20 sm:py-28 bg-[#0C0E12] text-[#F1F5F9]"
      >
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            style={prefersReducedMotion ? {} : { y: inkuiriHeaderY, opacity: inkuiriHeaderOpacity }}
            className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14171E] border border-[#222733] font-mono text-xs text-[#4EAA8F]">
              <Icon3dGearSettings size={16} className="shrink-0" />
              <span>Metodologi Laboratorium Inkuiri</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-[3.25rem] font-bold tracking-[-0.03em] text-[#F1F5F9] leading-[1.1]">
              3 Langkah Memahami <span className="text-[#4B8F8C]">Konsep Sains Mandiri</span>
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-[55ch] mx-auto">
              Bukan sekadar membaca rumus di buku, kamu yang memegang kendali penuh eksperimen dari hipotesis hingga kesimpulan.
            </p>
          </motion.div>

          {/* Active Sequential Connecting Track */}
          <div className="hidden md:flex items-center justify-between max-w-2xl mx-auto mb-10 px-8 relative" aria-hidden="true">
            <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-[2px] bg-[#222733]" />
            <motion.div
              style={{
                scaleX: prefersReducedMotion ? 1 : beamScaleX,
                originX: 0,
              }}
              className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-[#4B8F8C] via-[#4EAA8F] to-[#BA8230]"
            />
            <div className="relative z-10 w-7 h-7 rounded-full bg-[#14171E] border border-[#4B8F8C] flex items-center justify-center font-mono text-xs text-[#4EAA8F] font-bold shadow-xs">
              01
            </div>
            <div className="relative z-10 w-7 h-7 rounded-full bg-[#14171E] border border-[#4EAA8F] flex items-center justify-center font-mono text-xs text-[#4EAA8F] font-bold shadow-xs">
              02
            </div>
            <div className="relative z-10 w-7 h-7 rounded-full bg-[#14171E] border border-[#BA8230] flex items-center justify-center font-mono text-xs text-[#E5A642] font-bold shadow-xs">
              03
            </div>
          </div>

          {/* 3 Step Connected Editorial Blueprint */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 text-left">
            {[
              {
                step: '01',
                emoji: 'gear',
                title: 'Konfigurasi Parameter Variabel',
                desc: 'Tentukan variabel bebas seperti massa benda, besaran gaya dorong, atau sudut elevasi tembakan meriam dengan slider presisi.',
                spec: 'Uji variasi nilai ekstrem tanpa takut alat laboratorium rusak',
                tag: 'INPUT VARIABEL',
              },
              {
                step: '02',
                emoji: 'zap',
                title: 'Simulasi Real-time 60 FPS',
                desc: 'Mesin komputasi menghitung pergerakan bodi fisika secara instan. Panah gaya resultan dan grafik kinematika terlukis tanpa jeda.',
                spec: 'Visualisasi grafik x(t) dan v(t) terhubung langsung dengan gerak benda',
                tag: 'SIMULASI LIVE',
              },
              {
                step: '03',
                emoji: 'robot',
                title: 'Panduan Pemahaman Interaktif',
                desc: 'Tanya AI mengajukan pertanyaan pemantik konseptual untuk menguji pemahaman dan menyusun laporan praktikum otomatis.',
                spec: 'Membimbing nalar berpikir tanpa membocorkan kunci jawaban instan',
                tag: 'REFLEKSI & LKPD',
              },
            ].map((st, i) => {
              const stepStyle =
                i === 0
                  ? { x: step1X, y: step1Y, scale: step1Scale, opacity: step1Opacity }
                  : i === 1
                  ? { y: step2Y, scale: step2Scale, opacity: step2Opacity }
                  : { x: step3X, y: step3Y, scale: step3Scale, opacity: step3Opacity };
              return (
                <motion.div
                  key={i}
                  style={prefersReducedMotion ? {} : stepStyle}
                  className="bg-[#14171E] hover:bg-[#181D26] border border-[#222733] hover:border-[#4EAA8F] rounded-3xl p-7 sm:p-8 flex flex-col justify-between space-y-6 transition-all duration-300 shadow-xs hover:shadow-xl hover:shadow-[#4EAA8F]/10 relative group will-change-transform"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#222733]">
                      <span className="font-mono text-xs font-bold text-[#4B8F8C]">
                        TAHAP {st.step}
                      </span>
                      <span className="font-mono text-[11px] text-[#E5A642] px-2 py-0.5 rounded-full bg-[#BA8230]/15 border border-[#BA8230]/30 font-bold">
                        {st.tag}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {st.step === '01' ? (
                        <Icon3dGearSettings size={40} className="shrink-0 icon-3d-interactive cursor-pointer" />
                      ) : st.step === '02' ? (
                        <Icon3dPhysicsEnergy size={40} className="shrink-0 icon-3d-interactive cursor-pointer" />
                      ) : (
                        <Icon3dAiCore size={40} className="shrink-0 icon-3d-interactive cursor-pointer" />
                      )}
                      <h3 className="font-heading text-lg sm:text-xl font-bold text-[#F1F5F9] leading-tight">
                        {st.title}
                      </h3>
                    </div>

                    <p className="font-sans text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                      {st.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#222733] font-mono text-xs text-[#4EAA8F] flex items-center gap-2">
                    <IconCheck size={13} className="text-[#4B8F8C] shrink-0" />
                    <span className="truncate">{st.spec}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── SECTION 5: TANYA AI & WORKBENCH TANTANGAN INTERAKTIF ──── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <hr className="w-full border-t border-[#222733] m-0" />
      <section
        ref={tutorTrackRef}
        className="section-lazy-render relative w-full py-20 sm:py-28 bg-[#0C0E12] text-[#F1F5F9]"
      >
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Pedagogical Philosophy */}
            <motion.div
              style={prefersReducedMotion ? {} : { x: tutorLeftX, y: tutorLeftY, opacity: tutorLeftOpacity }}
              className="lg:col-span-5 space-y-6 text-left will-change-transform"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14171E] border border-[#222733] font-mono text-xs text-[#E5A642]">
                <Icon3dAiCore size={18} className="shrink-0" />
                <span>Asisten Praktikum AI</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-[-0.03em] text-[#F1F5F9] leading-[1.12]">
                Membimbing Nalar, <br />
                <span className="text-[#4B8F8C]">Bukan Memberi Kunci Jawaban</span>
              </h2>

              <p className="font-sans text-sm text-[#94A3B8] leading-relaxed">
                Ketika mengalami kebingungan saat eksperimen, Tanya AI tidak langsung memberi bocoran jawaban. Lewat dialog tanya-jawab yang terarah, asisten memandu alur berpikirmu dengan analogi sederhana dan data percobaan nyata.
              </p>

              {/* LKPD Feature Capsule */}
              <div className="p-4 rounded-2xl bg-[#14171E] border border-[#222733] space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#4EAA8F]">
                  <Icon3dBookModule size={18} className="shrink-0" />
                  <span>Logbook Praktikum Digital Otomatis</span>
                </div>
                <p className="font-sans text-xs text-[#94A3B8] leading-relaxed">
                  Data percobaan, grafik percepatan, dan hipotesis mahasiswa tersusun rapi otomatis dalam format laporan praktikum siap unduh dan diserahkan ke dosen.
                </p>
              </div>

              <div>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1C332A] hover:bg-[#4EAA8F] text-white font-heading font-semibold text-xs sm:text-sm transition-all border border-[#1C332A] shadow-xs"
                >
                  <span>Coba Praktikum Interaktif</span>
                  <IconArrowRight size={14} />
                </Link>
              </div>
            </motion.div>

            {/* Right Column: Live Interactive GEN LABS AI Workbench */}
            <motion.div
              style={prefersReducedMotion ? {} : { x: tutorRightX, y: tutorRightY, scale: tutorRightScale, opacity: tutorRightOpacity }}
              className="lg:col-span-7 will-change-transform"
            >
              <div className="border border-[#222733] rounded-3xl bg-[#14171E] shadow-xl overflow-hidden text-left">
                <div className="flex flex-wrap items-center justify-between px-6 py-3.5 bg-[#0C0E12] border-b border-[#222733] font-mono text-xs">
                  <div className="flex items-center gap-2 text-[#4EAA8F] font-bold">
                    <IconZap size={14} className="text-[#4EAA8F] shrink-0" />
                    <span>WORKBENCH PENALARAN SISWA</span>
                  </div>
                  <span className="text-[#94A3B8] text-[11px]">
                    HUKUM II NEWTON (F = m · a)
                  </span>
                </div>

                <div className="p-6 sm:p-8 space-y-5">
                  <div className="p-4 bg-[#0C0E12] rounded-xl font-mono text-xs space-y-1.5 text-[#CBD5E1] border border-[#222733]">
                    <div className="text-[#4EAA8F] font-bold">&gt; Sensor Lintasan: Balok meluncur (t = 0.000s)</div>
                    <div>&gt; Gaya Tarik: F = 40.0 N | Beban Balok: m = 4.0 kg</div>
                    <div>&gt; Percepatan Terukur: a = 10.00 m/s²</div>
                    <div className="text-[#E5A642] font-bold pt-1">&gt; TANTANGAN PRAKTIKUM: Uji pemahamanmu sekarang...</div>
                  </div>

                  <div className="space-y-3">
                    <p className="font-heading text-base sm:text-lg text-[#F1F5F9] font-bold leading-relaxed">
                      &ldquo;Balok 4 kg ditarik dengan gaya 40 N melaju dengan percepatan 10 m/s². Jika massa balok digandakan menjadi 8 kg sementara gaya tarik tetap 40 N, apa yang akan terjadi pada percepatannya?&rdquo;
                    </p>

                    <div className="space-y-2.5 font-mono text-xs" role="group" aria-label="Pilihan Hipotesis">
                      <button
                        type="button"
                        onClick={() => setUserHypothesis(1)}
                        className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          userHypothesis === 1
                            ? 'border-[#4B8F8C] bg-[#1C332A]/40 text-[#4EAA8F] font-bold'
                            : 'border-[#222733] bg-[#0C0E12] text-[#CBD5E1] hover:border-[#4B8F8C] hover:text-[#F1F5F9]'
                        }`}
                      >
                        A. Percepatan berkurang jadi 5 m/s² karena massa sekarang 2x lebih berat (a = 40 / 8)
                      </button>

                      <button
                        type="button"
                        onClick={() => setUserHypothesis(2)}
                        className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          userHypothesis === 2
                            ? 'border-[#BA8230] bg-[#BA8230]/20 text-[#FFDDB5] font-bold'
                            : 'border-[#222733] bg-[#0C0E12] text-[#CBD5E1] hover:border-[#4B8F8C] hover:text-[#F1F5F9]'
                        }`}
                      >
                        B. Percepatan tetap 10 m/s² karena gaya tarikan yang diberikan tidak berubah sama sekali
                      </button>
                    </div>
                  </div>

                  {userHypothesis === 1 && (
                    <div className="p-4 rounded-xl bg-[#1C332A]/30 border border-[#1C332A] text-xs font-sans text-[#F1F5F9] leading-relaxed flex items-start gap-3">
                      <IconCheck size={18} className="text-[#4B8F8C] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#4EAA8F] font-mono block mb-1">Hebat! Analisismu Tepat Sekali!</strong>
                        Massa berbanding terbalik dengan percepatan. Beban bertambah 2x lipat menyebabkan akselerasi berkurang setengahnya menjadi 5.0 m/s².
                      </div>
                    </div>
                  )}

                  {userHypothesis === 2 && (
                    <div className="p-4 rounded-xl bg-[#BA8230]/20 border border-[#BA8230]/50 text-xs font-sans text-[#FFDDB5] leading-relaxed flex items-start gap-3">
                      <div>
                        <strong className="text-[#E5A642] font-mono block mb-1">Coba Renungkan Logika Ini:</strong>
                        Mendorong sepeda kosong vs mendorong sepeda yang dinaiki teman dengan tenaga dorong yang sama — manakah yang melaju lebih cepat?
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── SECTION 6: SWISS COMPARISON MATRIX (LAB SEKOLAH VS GEN LABS) ─────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <hr className="w-full border-t border-[#222733] m-0" />
        <section
          id="komparasi"
        ref={swissTrackRef}
        className="section-lazy-render relative w-full py-20 sm:py-28 bg-[#0C0E12] text-[#F1F5F9] transition-colors"
      >
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            style={prefersReducedMotion ? {} : { y: swissHeaderY, opacity: swissHeaderOpacity }}
            className="text-center max-w-3xl mx-auto space-y-3 mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14171E] border border-[#222733] font-mono text-xs text-[#4EAA8F]">
              <IconShield size={14} className="shrink-0 text-[#4EAA8F]" />
              <span>Efisiensi Pembelajaran Sains</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-[3.25rem] font-bold tracking-[-0.03em] text-[#F1F5F9] leading-[1.1]">
              Kenapa Belajar di GEN LABS <span className="text-[#4B8F8C]">Jauh Lebih Membantu?</span>
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-[55ch] mx-auto">
              Bandingkan kemudahan eksplorasi langsung di simulasi dengan keterbatasan ruang laboratorium konvensional.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 text-left">
            {/* The Rest (Lab Biasa) */}
            <motion.div
              style={prefersReducedMotion ? {} : { x: convX, y: convY, rotate: convRot, opacity: convOpacity }}
              className="rounded-3xl border border-[#222733] bg-[#14171E] p-7 sm:p-8 space-y-6 shadow-xs will-change-transform"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#222733]">
                <span className="font-mono text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  Laboratorium Sekolah Biasa
                </span>
                <span className="font-mono text-xs text-[#94A3B8] px-2.5 py-0.5 rounded-full bg-[#222733]">
                  Metode Konvensional
                </span>
              </div>

              <div className="space-y-4 font-sans text-xs sm:text-sm text-[#94A3B8]">
                {[
                  'Alat lab terbatas, harus antre dan bergantian dengan teman sekelas',
                  'Khawatir alat pecah atau rusak saat menguji variasi angka ekstrem',
                  'Waktu belajar habis untuk merakit kabel dan statif sebelum sempat memahami materi',
                  'Panah gaya resultan, medan, dan proses mikroskopis tidak kasat mata',
                  'Menunggu guru mengoreksi lembar kerja kertas berhari-hari',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#222733] flex items-center justify-center shrink-0 mt-0.5 text-[#94A3B8]">
                      <IconClose size={12} />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* GEN LABS */}
            <motion.div
              style={prefersReducedMotion ? {} : { x: genX, y: genY, scale: genScale, rotate: genRot, opacity: genOpacity }}
              className="rounded-3xl border-2 border-[#4B8F8C] hover:border-[#4EAA8F] bg-[#14171E] hover:bg-[#181D26] p-7 sm:p-8 space-y-6 relative shadow-md hover:shadow-2xl hover:shadow-[#4B8F8C]/15 transition-all duration-300 will-change-transform group"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#1C332A]">
                <span className="font-mono text-xs font-bold text-[#4EAA8F] uppercase tracking-wider">
                  Laboratorium Virtual GEN LABS
                </span>
                <span className="font-mono text-xs text-[#0C0E12] font-bold px-2.5 py-0.5 rounded-full bg-[#4B8F8C]">
                  Simulasi Akurat 60 FPS
                </span>
              </div>

              <div className="space-y-4 font-sans text-xs sm:text-sm text-[#F1F5F9]">
                {[
                  'Bebas coba kapan saja dari laptop, tablet, hingga smartphone',
                  'Eksperimen sepuasnya tanpa risiko kerusakan alat atau bahaya kimia',
                  'Tinggal geser nilai parameter, grafik kinematika seketika terlukis rapi',
                  'Vektor gaya resultan, kurva kecepatan, dan telemetri langsung terlihat jelas',
                  'Tanya AI mendampingi secara instan kapan pun kamu butuh arahan',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#4B8F8C] flex items-center justify-center shrink-0 mt-0.5 text-[#0C0E12]">
                      <IconCheck size={12} />
                    </div>
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── SECTION 7: KATALOG TABULAR LENGKAP (35+ SIMULASI RESMI) ─────────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <hr className="w-full border-t border-[#222733] m-0" />
        <section
          id="eksplorasi-modul"
        ref={directoryTrackRef}
        className="relative w-full py-20 sm:py-28 bg-[#0C0E12] text-[#F1F5F9] transition-colors"
      >
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            style={prefersReducedMotion ? {} : { y: dirHeaderY, opacity: dirHeaderOpacity }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#222733] text-left"
          >
            <div className="space-y-2">
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-[3.25rem] font-bold tracking-[-0.03em] text-[#F1F5F9] leading-[1.08]">
                Direktori Praktikum <span className="text-[#4B8F8C]">Vokasi STEM</span>
              </h2>
              <p className="font-sans text-sm text-[#94A3B8]">
                Pilih topik pembelajaran untuk langsung membuka lembar kerja dan kanvas komputasi.
              </p>
            </div>
            <div className="font-mono text-xs sm:text-sm text-[#94A3B8]">
              <span className="text-[#F1F5F9] font-bold">40+ SIMULASI</span> / SARJANA TERAPAN D4 &amp; STEM
            </div>
          </motion.div>

          {/* Discipline Filter Tabs */}
          <motion.div
            style={prefersReducedMotion ? {} : { y: dirTabsY, opacity: dirTabsOpacity }}
            className="flex flex-wrap items-center gap-2 pt-6 pb-6"
          >
            {['SEMUA', 'FISIKA', 'MATEMATIKA', 'EKONOMI', 'INFORMATIKA', 'KIMIA'].map((disc) => (
              <button
                key={disc}
                type="button"
                onClick={() => setSelectedDiscipline(disc)}
                className={`px-5 py-2 rounded-full font-mono text-xs font-bold transition-all cursor-pointer ${
                  selectedDiscipline === disc
                    ? 'bg-[#4B8F8C] border border-[#4B8F8C] text-[#0C0E12] shadow-xs'
                    : 'bg-[#14171E] border border-[#222733] text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                {disc}
              </button>
            ))}
          </motion.div>

          {/* Tabular Register Index with Scroll-Driven Cascading Wave */}
          <div
            ref={directoryTableRef}
            key={selectedDiscipline}
            className="border border-[#222733] divide-y divide-[#222733] bg-[#14171E] rounded-3xl overflow-hidden shadow-xs"
          >
            {filteredModules.map((item, idx) => (
              <ScrollDrivenDirectoryRow
                key={`${selectedDiscipline}-${item.code}-${item.slug}-${idx}`}
                item={item}
                idx={idx}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── SECTION 8: FAQ ACCORDION ────────────────────────────────────────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <hr className="w-full border-t border-[#222733] m-0" />
        <section
          id="faq"
        ref={faqTrackRef}
        className="section-lazy-render relative w-full py-20 sm:py-28 bg-[#0C0E12] text-[#F1F5F9] transition-colors"
      >
        <div className="max-w-[960px] mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            style={prefersReducedMotion ? {} : { y: faqHeaderY, opacity: faqHeaderOpacity }}
            className="text-center space-y-3 mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14171E] border border-[#222733] font-mono text-xs text-[#4EAA8F]">
              <IconSparkles size={14} className="shrink-0 text-[#4EAA8F]" />
              <span>Bantuan &amp; Panduan Siswa</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-[3.25rem] font-bold tracking-[-0.03em] text-[#F1F5F9] leading-[1.08]">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-[55ch] mx-auto">
              Informasi lengkap tentang akses gratis, kesesuaian kurikulum sekolah, dan fitur pendamping AI.
            </p>
          </motion.div>

          <div className="divide-y divide-[#222733] border-y border-[#222733] overflow-hidden">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <ScrollDrivenFaqItem
                  key={idx}
                  item={item}
                  idx={idx}
                  isOpen={isOpen}
                  onToggle={() => setOpenFaqIndex(isOpen ? null : idx)}
                  prefersReducedMotion={prefersReducedMotion}
                />
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
});

export const AnimejsScrollShowcase = ShowcaseBelowTheFold;

