'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconArrowRight } from '@/components/icons';
import { Icon3d } from '@/components/icons/3d';

export interface CarouselModule {
  id: string;
  code: string;
  discipline: string;
  shortTitle: string;
  title: string;
  formula: string;
  desc: string;
  slug: string;
  level: string;
  accent: string;
  emoji?: string;
}

export const ALL_14_LAB_MODULES: CarouselModule[] = [
  {
    id: 'mod-1',
    code: 'LAB-01',
    discipline: 'FISIKA',
    shortTitle: 'Hukum Newton',
    title: 'Hukum II Newton',
    formula: 'a = F / m',
    desc: 'Buktikan percepatan balok bertambah saat gaya dinaikkan dan melambat saat beban bertambah berat.',
    slug: 'newtons-second-law',
    emoji: 'physics',
    level: 'D4 Vokasi / S1',
    accent: '#4B8F8C',
  },
  {
    id: 'mod-2',
    code: 'LAB-02',
    discipline: 'MATEMATIKA',
    shortTitle: 'Kurva Parabola',
    title: 'Parabola Kuadrat',
    formula: 'y = ax² + bx + c',
    desc: 'Ubah koefisien a, b, c dan saksikan bentuk lengkungan kurva kuadrat serta titik puncaknya seketika.',
    slug: 'function-explorer',
    emoji: 'geometry',
    level: 'D4 Vokasi / S1',
    accent: '#BA8230',
  },
  {
    id: 'mod-3',
    code: 'LAB-03',
    discipline: 'EKONOMI',
    shortTitle: 'Pasar & Harga',
    title: 'Keseimbangan Pasar',
    formula: 'Qd = Qs → P*',
    desc: 'Simulasi harga keseimbangan pasar dan kuantitas barang saat terjadi pergeseran permintaan atau penawaran.',
    slug: 'supply-demand',
    emoji: 'bar_chart',
    level: 'D4 MPI & AKT / S1',
    accent: '#4B8F8C',
  },
  {
    id: 'mod-4',
    code: 'LAB-04',
    discipline: 'INFORMATIKA',
    shortTitle: 'Urutkan Angka',
    title: 'Visualisasi Sorting',
    formula: 'O(n log n)',
    desc: 'Lihat bagaimana komputer menyusun barisan angka acak menjadi berurutan langkah demi langkah secara visual.',
    slug: 'sorting-algorithms',
    emoji: 'informatics',
    level: 'D4 TRPL / S1',
    accent: '#BA8230',
  },
  {
    id: 'mod-5',
    code: 'LAB-05',
    discipline: 'FISIKA',
    shortTitle: 'Gerak Peluru',
    title: 'Gerak Peluru Parabola',
    formula: 'R = (v₀² sin 2θ) / g',
    desc: 'Atur sudut tembakan meriam untuk mencari elevasi optimal agar proyektil mencapai jarak terjauh.',
    slug: 'projectile-motion',
    emoji: 'rocket',
    level: 'D4 Vokasi / S2',
    accent: '#4B8F8C',
  },
  {
    id: 'mod-6',
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
  },
  {
    id: 'mod-7',
    code: 'LAB-07',
    discipline: 'FISIKA',
    shortTitle: 'Tumbukan 1D',
    title: 'Hukum Momentum',
    formula: 'p = m₁v₁ + m₂v₂',
    desc: 'Simulasikan tumbukan lenting sempurna dan tidak lenting untuk membuktikan hukum kekekalan momentum.',
    slug: 'momentum-collision',
    emoji: 'atom',
    level: 'D4 TRPL & Vokasi / S2',
    accent: '#4B8F8C',
  },
  {
    id: 'mod-8',
    code: 'LAB-08',
    discipline: 'MATEMATIKA',
    shortTitle: 'Vektor 2D',
    title: 'Resultan Vektor 2D',
    formula: 'R = A + B',
    desc: 'Ubah panjang dan arah komponen vektor A dan B untuk mengamati resultan grafis dan perkalian titik.',
    slug: 'vector-math',
    emoji: 'triangular_ruler',
    level: 'D4 TRPL / S1',
    accent: '#BA8230',
  },
  {
    id: 'mod-9',
    code: 'LAB-09',
    discipline: 'INFORMATIKA',
    shortTitle: 'Pencarian Biner',
    title: 'Binary Search Algorithm',
    formula: 'T(n) = O(log₂ n)',
    desc: 'Temukan elemen angka dalam larik terurut dengan membagi ruang pencarian menjadi separuh pada setiap langkah.',
    slug: 'binary-search',
    emoji: 'laptop',
    level: 'D4 TRPL / S1',
    accent: '#4B8F8C',
  },
  {
    id: 'mod-10',
    code: 'LAB-10',
    discipline: 'INFORMATIKA',
    shortTitle: 'Traversal Graf',
    title: 'Graf BFS & DFS',
    formula: 'T(V, E) = O(V + E)',
    desc: 'Telusuri simpul graf berbobot menggunakan metode Breadth-First Search dan Depth-First Search realtime.',
    slug: 'graph-traversal',
    emoji: 'brain',
    level: 'D4 TRPL / S2',
    accent: '#BA8230',
  },
  {
    id: 'mod-11',
    code: 'LAB-11',
    discipline: 'STATISTIKA',
    shortTitle: 'Regresi Linear',
    title: 'Linear Regression (OLS)',
    formula: 'y = β₁x + β₀ + ε',
    desc: 'Tarik garis kecocokan terbaik melewati sebaran titik acak untuk meminimalkan kuadrat galat residu.',
    slug: 'linear-regression',
    emoji: 'chart_increasing',
    level: 'D4 AKT & MPI / S2',
    accent: '#4B8F8C',
  },
  {
    id: 'mod-12',
    code: 'LAB-12',
    discipline: 'STATISTIKA',
    shortTitle: 'Distribusi Normal',
    title: 'Distribusi Gauss',
    formula: 'f(x) ~ N(μ, σ²)',
    desc: 'Amati bentuk lonceng distribusi probabilitas kontinu saat nilai rata-rata dan deviasi standar diubah.',
    slug: 'normal-distribution',
    emoji: 'wave',
    level: 'D4 Vokasi / S2',
    accent: '#BA8230',
  },
  {
    id: 'mod-13',
    code: 'LAB-13',
    discipline: 'EKONOMI',
    shortTitle: 'Bunga Majemuk',
    title: 'Compound Interest',
    formula: 'A = P(1 + r/n)^(nt)',
    desc: 'Simulasikan pertumbuhan modal eksponensial terhadap waktu berdasarkan variasi suku bunga dan frekuensi.',
    slug: 'compound-interest',
    emoji: 'chart_decreasing',
    level: 'D4 AKT & MPI / S1',
    accent: '#4B8F8C',
  },
  {
    id: 'mod-14',
    code: 'LAB-14',
    discipline: 'MATEMATIKA',
    shortTitle: 'Peluang Koin',
    title: 'Hukum Bilangan Besar',
    formula: 'P(H) = k / N → 0.50',
    desc: 'Simulasikan ribuan lemparan koin acak dan amati konvergensi frekuensi empiris menuju probabilitas teoretis.',
    slug: 'probability-coin',
    emoji: 'abacus',
    level: 'D4 Vokasi / S1',
    accent: '#BA8230',
  },
];

export const InfiniteCurvedCarousel = React.memo(function InfiniteCurvedCarousel() {
  const router = useRouter();
  const prefersReducedMotionRef = useRef<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const progressRef = useRef<number>(0);
  const isHoveredRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartProgressRef = useRef<number>(0);
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const N = ALL_14_LAB_MODULES.length;

  // Direct GPU DOM update — updates 3D positions with zero React re-renders
  const updateCardTransforms = useCallback((currentProgress: number) => {
    const spacing = 175;
    for (let i = 0; i < N; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;

      let offset = (i - currentProgress) % N;
      if (offset > N / 2) offset -= N;
      if (offset < -N / 2) offset += N;

      const absOffset = Math.abs(offset);

      // Cull items outside viewport arc
      if (absOffset > 4.2) {
        el.style.display = 'none';
        continue;
      }

      el.style.display = 'block';

      // 3D trajectory calculation
      const transX = offset * spacing;
      const transY = absOffset * absOffset * 5.4 - 10;
      const rotZ = offset * 4;
      const rotY = -offset * 11.5;
      const rotX = -(absOffset * 3.8) - 4.5;
      const scale = Math.max(0.75, 1.03 - absOffset * 0.065);
      const zDepth = Math.round(200 - absOffset * 85);
      const zIndex = Math.round(30 - absOffset * 5);
      const opacity = absOffset > 3.2 ? Math.max(0, 1 - (absOffset - 3.2) / 0.8) : 1;

      el.style.transform = `translate3d(${transX}px, ${transY}px, ${zDepth}px) rotateZ(${rotZ}deg) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${scale})`;
      el.style.zIndex = String(zIndex);
      el.style.opacity = String(opacity);

      // Card shell styling toggle for apex card
      const cardShell = el.firstElementChild as HTMLElement | null;
      if (cardShell) {
        if (absOffset < 0.45) {
          cardShell.classList.add('border-[#4EAA8F]', 'shadow-[0_24px_48px_rgba(0,0,0,0.7)]', 'ring-2', 'ring-[#4EAA8F]/40');
          cardShell.classList.remove('border-[#222733]');
        } else {
          cardShell.classList.remove('border-[#4EAA8F]', 'shadow-[0_24px_48px_rgba(0,0,0,0.7)]', 'ring-2', 'ring-[#4EAA8F]/40');
          cardShell.classList.add('border-[#222733]');
        }
      }
    }
  }, [N]);

  // Reduced motion detection without re-render
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      prefersReducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  // 60 FPS Infinite Rotation Loop with IntersectionObserver & Visibility Pause
  useEffect(() => {
    const BASE_SPEED = 0.28; // Cards per second
    const container = containerRef.current;

    // Initial positioning
    updateCardTransforms(progressRef.current);

    const isTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    if (prefersReducedMotionRef.current || isTouch || isMobile) {
      // Do not run continuous RAF loop on reduced motion, touch, or mobile devices (swiping handled via pointer events)
      return;
    }

    let isVisible = false;
    let io: IntersectionObserver | null = null;
    let lastRenderTime = 0;

    const animate = (time: number) => {
      if (!isVisible || (typeof document !== 'undefined' && document.hidden)) {
        lastTimeRef.current = null;
        return;
      }

      // Cap at ~35 FPS (28ms interval) to keep main thread completely free of long tasks
      if (time - lastRenderTime < 28) {
        requestRef.current = requestAnimationFrame(animate);
        return;
      }
      lastRenderTime = time;

      if (lastTimeRef.current !== null) {
        const delta = (time - lastTimeRef.current) / 1000;
        if (!isDraggingRef.current) {
          // Slow down gently on hover for organic apparatus feel
          const currentSpeed = isHoveredRef.current ? BASE_SPEED * 0.12 : BASE_SPEED;
          const deltaProgress = currentSpeed * delta;

          progressRef.current = (progressRef.current + deltaProgress + N) % N;
          updateCardTransforms(progressRef.current);
        }
      }
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    if (typeof IntersectionObserver !== 'undefined' && container) {
      io = new IntersectionObserver(
        (entries) => {
          const nowVisible = entries[0]?.isIntersecting ?? false;
          if (nowVisible && !isVisible) {
            isVisible = true;
            lastTimeRef.current = null;
            requestRef.current = requestAnimationFrame(animate);
          } else if (!nowVisible && isVisible) {
            isVisible = false;
            lastTimeRef.current = null;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
          }
        },
        { threshold: 0.05 }
      );
      io.observe(container);
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        lastTimeRef.current = null;
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
      } else if (isVisible) {
        lastTimeRef.current = null;
        requestRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
      if (!isDraggingRef.current && isVisible) {
        progressRef.current = (progressRef.current + deltaY * 0.003 + N) % N;
        updateCardTransforms(progressRef.current);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      if (io) io.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('scroll', onScroll);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [N, updateCardTransforms]);

  // Pointer drag scrubbing handlers (0 React re-renders, direct GPU updates)
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartProgressRef.current = progressRef.current;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    const deltaCard = -dx / 180;
    progressRef.current = (dragStartProgressRef.current + deltaCard + N) % N;
    updateCardTransforms(progressRef.current);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Keyboard and button step navigation
  const step = (dir: 1 | -1) => {
    progressRef.current = (Math.round(progressRef.current) + dir + N) % N;
    updateCardTransforms(progressRef.current);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    }
  };

  return (
    <div
      className="w-full flex flex-col items-center select-none focus:outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Koleksi Praktikum 3D Interaktif"
    >
      {/* ── 3D INFINITE ARCH VIEWPORT CONTAINER ── */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden pt-4 sm:pt-6 pb-6 sm:pb-10 cursor-grab active:cursor-grabbing"
        style={{ perspective: '1200px' }}
        onMouseEnter={() => {
          isHoveredRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveredRef.current = false;
          isDraggingRef.current = false;
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Subtle Arc Laser Guide / Apparatus Elliptical Orbit Track */}
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-0"
          style={{
            top: '30px',
            width: '1200px',
            height: '200px',
          }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 1200 200" className="w-full h-full overflow-visible opacity-30">
            <path
              d="M 50 145 Q 600 30 1150 145"
              fill="none"
              stroke="#4B8F8C"
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />
            {/* Center Apex Reticle Crosshair */}
            <line x1="600" y1="20" x2="600" y2="40" stroke="#BA8230" strokeWidth="1.5" />
            <line x1="590" y1="30" x2="610" y2="30" stroke="#BA8230" strokeWidth="1.5" />
          </svg>
        </div>


        {/* Stage Container centering all calculated 3D cards */}
        <div className="relative w-full h-[270px] sm:h-[295px] flex items-center justify-center">
          {ALL_14_LAB_MODULES.map((mod, idx) => (
            <Link
              key={mod.id}
              ref={(el) => {
                cardRefs.current[idx] = el as unknown as HTMLDivElement;
              }}
              href={`/simulation/${mod.slug}`}
              prefetch={false}
              style={{
                position: 'absolute',
                willChange: 'transform, opacity',
              }}
              className="origin-bottom cursor-pointer select-none block"
            >
              {/* ── CARD SHELL (PURE DARK LUXURY PROFILE) ── */}
              <div className="block relative w-[180px] sm:w-[195px] lg:w-[210px] h-[228px] sm:h-[242px] rounded-2xl border border-[#222733] bg-[#14171E] shadow-xl p-3 sm:p-3.5 flex flex-col justify-between text-left transition-colors duration-200 hover:border-[#4EAA8F]/70">
                {/* Card Header: Functional Badge & Lab Code */}
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <span className="inline-flex items-center font-mono text-[10px] sm:text-[10.5px] font-bold uppercase tracking-normal text-[#4EAA8F] px-2 py-0.5 rounded-full bg-[#1C332A] border border-[#3E8E75]/30">
                    <span>{mod.discipline}</span>
                  </span>
                  <span className="font-mono text-[10px] sm:text-[11px] font-bold text-[#94A3B8] whitespace-nowrap shrink-0">
                    {mod.code}
                  </span>
                </div>

                {/* Card Mid: Dimensional 3D Asset & Distinct Formula */}
                <div className="my-auto py-1 flex flex-col items-center justify-center gap-1.5">
                  <div className="h-11 flex items-center justify-center">
                    <Icon3d name={mod.slug} size={44} interactive className="mx-auto drop-shadow-md" />
                  </div>
                  <span className="font-mono text-[10px] sm:text-[11px] font-bold text-[#E5A642] text-center px-1.5 py-0.5 rounded-md bg-[#BA8230]/10 border border-[#BA8230]/20 max-w-full truncate">
                    {mod.formula}
                  </span>
                </div>

                {/* Card Footer: Clear Title & Readable Narrative */}
                <div className="space-y-0.5 pt-1 border-t border-[#222733]">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-heading text-xs sm:text-[13px] font-bold text-[#F1F5F9] truncate">
                      {mod.shortTitle}
                    </p>
                    <IconArrowRight size={11} className="text-[#4EAA8F] shrink-0 opacity-80" />
                  </div>
                  <p className="font-sans text-[10px] sm:text-[11px] text-[#94A3B8] line-clamp-2 leading-snug">
                    {mod.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
});

