'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  IconMenu,
  IconClose,
  IconArrowRight,
  IconSparkles,
} from '@/components/icons';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { HeroShowcase } from './hero-showcase';
import { GenLabsLogo } from '@/components/ui/gen-labs-logo';
import { useAuth } from '@/components/auth-provider';
import { WebAnglesBottomBlur } from './webangles-progressive-blur';

const ShowcaseBelowTheFold = dynamic(
  () => import('./animejs-scroll-showcase').then((m) => m.ShowcaseBelowTheFold),
  { ssr: true }
);

const CtaSection = dynamic(
  () => import('./cta-section').then((m) => m.CtaSection),
  { ssr: true }
);

export function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Hardware-accelerated top scroll progress bar without React re-renders or Framer Motion
  useEffect(() => {
    let ticking = false;
    const updateProgress = () => {
      if (progressBarRef.current) {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
        progressBarRef.current.style.transform = `scaleX(${ratio})`;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open to prevent background bleed-through
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <div className="w-full min-h-screen bg-[#0C0E12] text-[#F1F5F9] font-sans antialiased overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* ── TOP SCROLL PROGRESS INDICATOR (PRECISION SAGE HAIRLINE) ── */}
      <div
        ref={progressBarRef}
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#3E8E75] origin-left z-[60] scale-x-0 will-change-transform"
        aria-hidden="true"
      />

      {/* ── A. NAVIGATION BAR (WEBANGLES FULL-WIDTH FIXED TOP BAR - PURE DARK FROSTED BLUR) ── */}
      <header className="fixed top-0 left-0 right-0 w-full h-[72px] sm:h-[84px] z-50 bg-gradient-to-b from-[#0C0E12]/95 via-[#0C0E12]/80 to-[#0C0E12]/50 backdrop-blur-md border-b border-[#222733]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12 h-full flex items-center justify-between">
          {/* Brand Logo & Lockup */}
          <Link
            href="/"
            prefetch={false}
            className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer focus:outline-none"
            aria-label="GEN LABS Beranda"
          >
            <GenLabsLogo variant="symbol" size={24} theme="dark" />
            <div className="flex flex-col text-left">
              <span className="font-heading text-base sm:text-lg font-bold tracking-tight text-[#F1F5F9]">
                GEN LABS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (WebAngles Centered Group) */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9 font-sans text-xs sm:text-sm font-medium">
            <a
              href="#pilar-disiplin"
              className="text-[#94A3B8] hover:text-[#4EAA8F] transition-colors py-1 cursor-pointer tracking-wide"
            >
              Pilar
            </a>

            <a
              href="#komparasi"
              className="text-[#94A3B8] hover:text-[#4EAA8F] transition-colors py-1 cursor-pointer tracking-wide"
            >
              Komparasi
            </a>
            <a
              href="#cara-belajar"
              className="text-[#94A3B8] hover:text-[#4EAA8F] transition-colors py-1 cursor-pointer tracking-wide"
            >
              Alur
            </a>
            <a
              href="#faq"
              className="text-[#94A3B8] hover:text-[#4EAA8F] transition-colors py-1 cursor-pointer tracking-wide"
            >
              FAQ
            </a>
          </nav>

          {/* Actions & Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {user ? (
              <Link
                href={user.role === 'admin' ? '/admin' : '/app'}
                prefetch={false}
                className="inline-flex items-center px-4 sm:px-5 py-2.5 rounded-xl font-heading text-xs sm:text-sm font-semibold bg-[#3E8E75] text-white hover:bg-[#4EAA8F] transition-colors cursor-pointer min-h-[38px] shadow-xs active:scale-95"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  prefetch={false}
                  className="hidden sm:inline-flex items-center px-3 py-1.5 font-heading text-xs sm:text-sm font-semibold text-[#94A3B8] hover:text-[#F1F5F9] transition-colors cursor-pointer"
                >
                  Masuk
                </Link>
                <Link
                  href="/login"
                  prefetch={false}
                  className="inline-flex items-center px-4 sm:px-5 py-2.5 rounded-xl font-heading text-xs sm:text-sm font-semibold bg-[#337963] text-white hover:bg-[#3E8E75] transition-all cursor-pointer min-h-[38px] whitespace-nowrap active:scale-95 shadow-xs"
                >
                  Mulai Belajar
                </Link>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1B202A] border border-[#222733] transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
              aria-label="Buka navigasi"
            >
              {mobileMenuOpen ? <IconClose size={18} /> : <IconMenu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full-Height Navigation Sheet (Covers down to bottom without gaps) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[72px] sm:top-[84px] bottom-0 bg-[#0C0E12] z-50 flex flex-col justify-between p-6 overflow-y-auto border-t border-[#222733] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B] px-2 mb-1">
              Navigasi Laboratorium
            </span>
            <a
              href="#pilar-disiplin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3.5 rounded-xl bg-[#14171E] hover:bg-[#1B202A] border border-[#222733] text-[#F1F5F9] font-heading font-semibold text-sm transition-colors flex items-center justify-between active:scale-98"
            >
              <span>Pilar Inovasi STEM</span>
              <span className="text-[11px] font-mono text-[#4EAA8F]">01</span>
            </a>

            <a
              href="#komparasi"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3.5 rounded-xl bg-[#14171E] hover:bg-[#1B202A] border border-[#222733] text-[#F1F5F9] font-heading font-semibold text-sm transition-colors flex items-center justify-between active:scale-98"
            >
              <span>Komparasi Lab Virtual</span>
              <span className="text-[11px] font-mono text-[#4EAA8F]">02</span>
            </a>

            <a
              href="#cara-belajar"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3.5 rounded-xl bg-[#14171E] hover:bg-[#1B202A] border border-[#222733] text-[#F1F5F9] font-heading font-semibold text-sm transition-colors flex items-center justify-between active:scale-98"
            >
              <span>Alur Inkuiri 4-Fase</span>
              <span className="text-[11px] font-mono text-[#4EAA8F]">03</span>
            </a>

            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3.5 rounded-xl bg-[#14171E] hover:bg-[#1B202A] border border-[#222733] text-[#F1F5F9] font-heading font-semibold text-sm transition-colors flex items-center justify-between active:scale-98"
            >
              <span>Tanya Jawab (FAQ)</span>
              <span className="text-[11px] font-mono text-[#4EAA8F]">04</span>
            </a>

            <Link
              href="/tanya-ai"
              prefetch={false}
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3.5 rounded-xl bg-[#1C332A] hover:bg-[#254237] border border-[#2A4D3F] text-[#F1F5F9] font-heading font-semibold text-sm transition-colors flex items-center justify-between active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <IconSparkles size={16} className="text-[#4EAA8F]" />
                <span>Tanya AI Laboratorium</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#14171E] text-[10px] font-mono text-[#4EAA8F] border border-[#2A4D3F]">
                Aktif
              </span>
            </Link>
          </div>

          <div className="pt-6 border-t border-[#222733] space-y-3 mt-6">
            {user ? (
              <Link
                href={user.role === 'admin' ? '/admin' : '/app'}
                prefetch={false}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#3E8E75] hover:bg-[#4EAA8F] text-white font-heading font-semibold text-sm shadow-xs transition-colors"
              >
                <span>Buka Dashboard</span>
                <IconArrowRight size={16} />
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/login"
                  prefetch={false}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-3 px-4 rounded-xl bg-[#14171E] hover:bg-[#1B202A] border border-[#222733] text-[#F1F5F9] font-heading font-semibold text-xs transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/login"
                  prefetch={false}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-[#337963] hover:bg-[#3E8E75] text-white font-heading font-semibold text-xs transition-colors shadow-xs"
                >
                  <span>Mulai Belajar</span>
                  <IconArrowRight size={14} />
                </Link>
              </div>
            )}
            <p className="text-center font-mono text-xs text-[#94A3B8]">
              GEN LABS &copy; 2026 &mdash; Sains Virtual Presisi
            </p>
          </div>
        </div>
      )}

      {/* ── B. THE SIGNATURE HERO SHOWCASE (IMMEDIATE PRE-RENDER & ULTRA-FAST PAINT) ── */}
      <HeroShowcase />

      {/* ── C. BELOW-THE-FOLD CORE SECTIONS (ASYNC CHUNK WITH FULL SSR HTML) ── */}
      <ShowcaseBelowTheFold />

      {/* ── F. CLOSING CALL TO ACTION (WEBANGLES-STYLE FANNED DECK - PURE DARK) ── */}
      <CtaSection />

      {/* ── G. INSTITUTIONAL MINIMALIST FOOTER (HIGH-CONTRAST LEGIBILITY) ── */}
      <footer className="relative z-20 -mt-12 sm:-mt-16 w-full pt-16 pb-14 px-6 sm:px-8 lg:px-12 bg-[#0C0E12] text-[#94A3B8] font-mono text-xs border-t border-[#222733] overflow-hidden section-lazy-render">
        <div className="max-w-[1360px] mx-auto space-y-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 pb-8 border-b border-[#222733]">
            {/* Col 1: Brand & Thesis */}
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="inline-flex items-center gap-3 group">
                <GenLabsLogo variant="symbol" size={24} theme="dark" />
                <span className="font-heading font-extrabold text-lg text-[#F1F5F9]">
                  GEN LABS
                </span>
              </Link>
              <p className="font-sans text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-sm">
                Platform laboratorium digital interaktif untuk eksplorasi sains terapan dan vokasi komputasional terbukti presisi langsung di layar.
              </p>
              <p className="font-mono text-xs text-[#94A3B8]">
                Disusun untuk Program Sarjana Terapan (D4) &amp; Riset Vokasi Komputasi
              </p>
            </div>

            {/* Col 2: Laboratorium */}
            <div className="space-y-3 text-left">
              <span className="font-bold text-[11px] tracking-widest text-[#F1F5F9] uppercase block">
                Laboratorium
              </span>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/simulation/newtons-second-law" prefetch={false} className="hover:text-[#4EAA8F] transition-colors">
                    Hukum II Newton
                  </Link>
                </li>
                <li>
                  <Link href="/simulation/function-explorer" prefetch={false} className="hover:text-[#4EAA8F] transition-colors">
                    Fungsi Parabola Kuadrat
                  </Link>
                </li>
                <li>
                  <Link href="/simulation/supply-demand" prefetch={false} className="hover:text-[#4EAA8F] transition-colors">
                    Ekuilibrium Pasar
                  </Link>
                </li>
                <li>
                  <Link href="/simulation/sorting-algorithms" prefetch={false} className="hover:text-[#4EAA8F] transition-colors">
                    Algoritma Pengurutan
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Akses Platform */}
            <div className="space-y-3 text-left">
              <span className="font-bold text-[11px] tracking-widest text-[#F1F5F9] uppercase block">
                Akses Platform
              </span>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/app" prefetch={false} className="hover:text-[#4EAA8F] transition-colors">
                    Semua Modul (35+)
                  </Link>
                </li>
                <li>
                  <Link href="/login" prefetch={false} className="hover:text-[#4EAA8F] transition-colors">
                    Masuk Akun
                  </Link>
                </li>
                <li>
                  <Link href="/register" prefetch={false} className="hover:text-[#4EAA8F] transition-colors">
                    Registrasi Siswa &amp; Guru
                  </Link>
                </li>
                <li>
                  <a
                    href="https://porto-aga.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#4EAA8F] transition-colors inline-flex items-center gap-1"
                  >
                    <span>Portofolio Pengembang</span>
                    <IconArrowRight size={11} />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Subfooter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
            <div>
              © {new Date().getFullYear()} GEN LABS. Hak Cipta Dilindungi Undang-Undang.
            </div>
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <span>Dibangun untuk pendidikan Indonesia oleh</span>
              <a
                href="https://porto-aga.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#4EAA8F] hover:underline underline-offset-2 transition-colors cursor-pointer"
              >
                Muhammad Aga Putra
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── THE SIGNATURE WEBANGLES FIXED PROGRESSIVE BOTTOM BLUR DOCK ── */}
      <WebAnglesBottomBlur />
    </div>
  );
}
