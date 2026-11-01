'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  IconSearch,
  IconCompass,
  IconDashboard,
  IconCalendar,
  IconUser,
  IconClose,
  IconArrowRight,
  IconShield,
  IconSettings,
  IconLogOut,
  IconDisciplinePhysics,
  IconDisciplineInformatics,
  IconDisciplineMath,
  IconDisciplineEconomics,
  IconBookOpen,
  IconDisciplineChemistry,
  IconCheckCircle,
  IconPlay,
  IconSparkles,
} from '@/components/icons';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from './auth-provider';
import { useFeedback } from '@/components/feedback';
import { GenLabsLogo } from '@/components/ui/gen-labs-logo';
import { ACTIVE_SIMULATION_CATALOG } from '@genlab/simulation-core';
import { SimulationPreviewGraphic } from './ui/simulation-preview-graphic';
import { AiUsageBadge } from '@/components/ui/ai-usage-badge';
import { fuzzyFilterAndRank } from '@/lib/search/fuzzy-search';
import { ProductEmoji, ProductEmojiName } from '@/components/ui/product-emoji';

const SEARCH_DISCIPLINES: Array<{ slug: string; name: string; emoji?: ProductEmojiName }> = [
  { slug: 'all', name: 'Semua Bidang' },
  { slug: 'fisika', name: 'Fisika', emoji: 'physics' },
  { slug: 'matematika', name: 'Matematika', emoji: 'math' },
  { slug: 'trpl', name: 'Informatika', emoji: 'informatics' },
  { slug: 'kimia', name: 'Kimia', emoji: 'chemistry' },
  { slug: 'ekonomi', name: 'Ekonomi', emoji: 'economics' },
  { slug: 'statistika', name: 'Statistika', emoji: 'bar_chart' },
];

const POPULAR_CONCEPTS = [
  'Hukum Newton',
  'Permintaan & Penawaran',
  'Binary Search',
  'Algoritma Pengurutan',
  'Fungsi Kuadrat',
  'Regresi Linear',
  'Gerak Peluru',
  'Bunga Majemuk',
];

function getDisciplineMeta(discipline: string) {
  const d = (discipline || '').toLowerCase();
  if (d.includes('perangkat lunak') || d.includes('trpl') || d.includes('informatika') || d.includes('cs')) {
    return {
      label: 'TRPL',
      icon: IconDisciplineInformatics,
      badgeColor: 'bg-[var(--color-secondary-soft)] text-[var(--color-secondary)] border-[var(--color-secondary)]/30',
    };
  }
  if (d.includes('fisika')) {
    return {
      label: 'Fisika',
      icon: IconDisciplinePhysics,
      badgeColor: 'bg-[var(--color-secondary-soft)] text-[var(--color-secondary)] border-[var(--color-secondary)]/30',
    };
  }
  if (d.includes('matematika')) {
    return {
      label: 'Matematika',
      icon: IconDisciplineMath,
      badgeColor: 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] border-[var(--color-primary)]/20',
    };
  }
  if (d.includes('ekonomi') || d.includes('pasar') || d.includes('bisnis')) {
    return {
      label: 'Ekonomi',
      icon: IconDisciplineEconomics,
      badgeColor: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--color-accent)]/30',
    };
  }
  if (d.includes('akuntansi')) {
    return {
      label: 'Akuntansi',
      icon: IconBookOpen,
      badgeColor: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--color-accent)]/30',
    };
  }
  if (d.includes('agribisnis') || d.includes('hortikultura') || d.includes('pertanian') || d.includes('kimia')) {
    return {
      label: d.includes('kimia') ? 'Kimia' : 'Agribisnis',
      icon: IconDisciplineChemistry,
      badgeColor: 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] border-[var(--color-primary)]/20',
    };
  }
  return {
    label: discipline || 'Sains',
    icon: IconDisciplinePhysics,
    badgeColor: 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] border-[var(--color-primary)]/20',
  };
}

export function Navbar() {
  const pathname = usePathname();
  const isFocusedWorkspace = pathname?.startsWith('/modules/') || pathname?.startsWith('/simulation/');
  const router = useRouter();
  const feedback = useFeedback();
  const { user, role, logout } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll and auto-focus when full-page search opens
  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [searchOpen]);

  // Click outside for profile dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Desktop navigation links
  const navLinks = [
    { href: role === 'admin' ? '/admin' : '/app', label: 'Beranda', icon: IconDashboard },
    { href: '/tanya-ai', label: 'Tanya AI', icon: IconSparkles },
    { href: '/history', label: 'Riwayat', icon: IconCalendar },
  ];

  // Filtered simulations list
  const searchResults = useMemo(() => {
    let list = ACTIVE_SIMULATION_CATALOG;

    if (selectedDiscipline !== 'all') {
      list = list.filter((item) => {
        const d = (item.discipline || '').toLowerCase();
        const discSlug = (item.disciplineSlug || '').toLowerCase();
        if (selectedDiscipline === 'trpl') return d.includes('perangkat lunak') || d.includes('trpl') || discSlug === 'trpl' || discSlug === 'cs';
        if (selectedDiscipline === 'akuntansi') return d.includes('akuntansi') || discSlug === 'akuntansi';
        if (selectedDiscipline === 'pemasaran') return d.includes('pemasaran') || discSlug === 'pemasaran';
        if (selectedDiscipline === 'agribisnis') return d.includes('agribisnis') || d.includes('hortikultura') || discSlug === 'agribisnis';
        if (selectedDiscipline === 'konvensi') return d.includes('konvensi') || d.includes('acara') || discSlug === 'event';
        if (selectedDiscipline === 'matematika') return d.includes('matematika') || discSlug === 'mathematics';
        if (selectedDiscipline === 'fisika') return d.includes('fisika') || discSlug === 'physics';
        if (selectedDiscipline === 'ekonomi') return d.includes('ekonomi') || discSlug === 'economics';
        return true;
      });
    }

    const q = query.trim();
    if (!q) {
      return list;
    }

    return fuzzyFilterAndRank(list, q);
  }, [query, selectedDiscipline]);

  // Reset selection index when list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedDiscipline]);

  const activeItem = searchResults[selectedIndex] || searchResults[0] || null;

  const handleSelectSimulation = (slug: string) => {
    setSearchOpen(false);
    setQuery('');
    router.push(`/modules/${slug}`);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (searchResults.length > 0 ? (prev + 1) % searchResults.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (searchResults.length > 0 ? (prev - 1 + searchResults.length) % searchResults.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeItem) {
        handleSelectSimulation(activeItem.slug);
      }
    }
  };

  return (
    <>
      {/* ── DESKTOP & MOBILE TOP HEADER ── */}
      <header className="w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-[1260px] mx-auto px-3 sm:px-4 md:px-5 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Desktop Nav Links */}
          <div className="flex items-center gap-3 lg:gap-8">
            <Link
              href={role === 'admin' ? '/admin' : '/app'}
              className="flex items-center group rounded-lg"
              aria-label="GEN LABS"
            >
              <GenLabsLogo variant="horizontal" size={26} className="group-hover:opacity-90 transition-opacity" />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
              {navLinks.map(({ href, label }) => {
                const isActive = href === '/' ? pathname === '/' : pathname?.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`px-2 py-1 lg:px-3 lg:py-1.5 rounded-full text-[11px] lg:text-xs font-mono uppercase tracking-wider transition-all ${
                      isActive
                        ? 'text-[var(--color-primary-text)] bg-[var(--color-surface-elevated)] border border-[var(--color-border-strong)] font-bold shadow-2xs'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] border border-transparent'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions: Search, Theme Toggle, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 shrink-0">
            {/* Quick Search trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 lg:px-3.5 py-1.5 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-all cursor-pointer shadow-2xs min-h-[36px] group active:scale-95 select-none"
              title="Cari konsep simulasi (Ctrl+K)"
              aria-label="Cari konsep simulasi (Ctrl+K)"
            >
              <ProductEmoji
                name="search"
                size={14}
                className="shrink-0 drop-shadow-2xs group-hover:scale-110 transition-transform"
              />
              <span className="hidden lg:inline font-mono text-[11px] text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)] transition-colors">
                Cari konsep...
              </span>
              <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-[var(--color-surface-subtle)] text-[var(--color-text-tertiary)] border border-[var(--color-border)] group-hover:border-[var(--color-primary)]/40 transition-colors">
                Ctrl+K
              </kbd>
            </button>

            <ThemeToggle />

            {/* User AI Credit Indicator */}
            <AiUsageBadge variant="compact" />

            {/* Profile Dropdown or Login Button */}
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-1.5 p-0.5 rounded-full hover:bg-[var(--color-surface-subtle)] border border-transparent hover:border-[var(--color-border)] transition-all cursor-pointer min-h-[36px] justify-center group active:scale-95"
                  aria-label="Menu profil pengguna"
                  aria-expanded={profileOpen}
                >
                  <div className="relative">
                    {/* Sophisticated fine gradient ring: Deep Pine -> Phosphor Cyan -> Warm Ochre */}
                    <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-[#1D4838] via-[#4B8F8C] to-[#BA8230] shadow-2xs group-hover:scale-105 group-hover:shadow-xs transition-all">
                      <div className="w-full h-full rounded-full bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text)] font-heading font-bold text-xs select-none transition-colors">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-72 p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-floating z-50 space-y-2 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-3 border-b border-[var(--color-border-subtle)]">
                      <p className="font-heading font-semibold text-sm text-[var(--color-text)] truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-secondary)] truncate">
                        {user.email}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[var(--color-surface-elevated)] text-[var(--color-primary-text)] border border-[var(--color-border)]">
                        {role === 'admin' ? 'Administrator' : 'Pengguna'}
                      </span>
                    </div>

                    {/* AI Credit Summary Card */}
                    <div className="px-1">
                      <AiUsageBadge variant="card" />
                    </div>

                    <Link
                      href={role === 'admin' ? '/admin/profile' : '/profile'}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] transition-colors font-medium min-h-[36px]"
                    >
                      <IconUser size={15} className="text-[var(--color-text-secondary)]" />
                      <span>Profil Saya</span>
                    </Link>

                    <Link
                      href={role === 'admin' ? '/admin/settings' : '/settings'}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] transition-colors font-medium min-h-[36px]"
                    >
                      <IconSettings size={15} className="text-[var(--color-text-secondary)]" />
                      <span>Pengaturan</span>
                    </Link>

                    {role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[var(--color-primary-accent)] font-semibold hover:bg-[var(--color-surface-subtle)] transition-colors min-h-[36px]"
                      >
                        <IconShield size={15} />
                        <span>Portal Admin</span>
                      </Link>
                    )}

                    <div className="border-t border-[var(--color-border-subtle)] pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          feedback.confirm({
                            title: 'Keluar dari Akun?',
                            description: 'Kamu ingin keluar dari akun? Seluruh kemajuan belajarmu sudah tersimpan otomatis.',
                            variant: 'warning',
                            confirmLabel: 'Keluar',
                            cancelLabel: 'Batal',
                            onConfirm: async () => {
                              await logout();
                              feedback.toast.info('Kamu telah keluar dari akun.');
                              router.push('/login');
                            },
                          });
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[var(--color-error)] hover:bg-[var(--color-surface-subtle)] transition-colors font-medium cursor-pointer text-left min-h-[36px]"
                      >
                        <IconLogOut size={15} />
                        <span>Keluar Akun</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-heading font-semibold transition-all shadow-xs whitespace-nowrap min-h-[36px] sm:min-h-[38px] items-center justify-center cursor-pointer active:scale-95 shrink-0"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── MOBILE BOTTOM NAVIGATION (Hidden in focused simulation/module workspaces to prevent control collision) ── */}
      {!isFocusedWorkspace && (
        <nav
          aria-label="Navigasi Bawah Ponsel"
          className="md:hidden fixed bottom-0 left-0 right-0 h-16 pb-[env(safe-area-inset-bottom,0px)] bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] flex items-center justify-around z-40 px-2 transition-colors"
        >
          {[
            { href: role === 'admin' ? '/admin' : '/app', label: 'Beranda', icon: IconDashboard },
            { href: '/tanya-ai', label: 'Tanya AI', icon: IconSparkles },
            { href: '/history', label: 'Riwayat', icon: IconCalendar },
            { href: role === 'admin' ? '/admin/profile' : '/profile', label: 'Profil', icon: IconUser },
          ].map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/app' || href === '/admin'
                ? pathname === href
                : pathname?.startsWith(href) || (href === '/tanya-ai' && (pathname?.startsWith('/explore') || pathname?.startsWith('/eksplorasi')));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] py-1 transition-colors ${
                  isActive
                    ? 'text-[var(--color-primary-text)] font-semibold'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                <Icon size={19} className={isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'} />
                <span className="text-[11px] mt-0.5">{label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* ── IMMERSIVE FULL-PAGE SEARCH WORKSPACE (Taste Design v2) ── */}
      {searchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pencarian Laboratorium Simulasi GEN LABS"
          className="fixed inset-0 z-50 bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col overflow-hidden animate-in fade-in duration-200"
        >
          {/* 1. TOP UTILITY BAR */}
          <div className="w-full border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <GenLabsLogo variant="symbol" size={24} />
              <div className="font-heading font-bold text-sm tracking-tight text-[var(--color-text)] flex items-center gap-2">
                <span>GEN LABS</span>
                <span className="text-[var(--color-border)]">/</span>
                <span className="text-xs font-normal text-[var(--color-text-secondary)]">Eksplorasi Konsep</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden md:inline-flex text-[11px] font-mono text-[var(--color-text-tertiary)] items-center gap-1.5">
                <span>Tekan</span>
                <kbd className="px-1.5 py-0.5 rounded-sm bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[10px]">Esc</kbd>
                <span>untuk kembali</span>
              </span>

              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] transition-colors cursor-pointer shadow-2xs"
                aria-label="Tutup pencarian"
              >
                <IconClose size={15} />
                <span>Tutup</span>
              </button>
            </div>
          </div>

          {/* 2. HERO SEARCH INPUT & CHIPS */}
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8 pb-4 shrink-0 space-y-4">
            {/* Search Input Box (DESIGN (4).md Phosphor Mint Focus) */}
            <div className="relative flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20 rounded-xl shadow-sm transition-all px-4 sm:px-6 py-3 sm:py-4">
              <IconSearch size={22} className="text-[var(--color-primary-text)] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Cari konsep simulasi, rumus, topik, atau algoritma..."
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                className="w-full bg-transparent text-base sm:text-xl font-heading font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] border-0 outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 pl-3.5 pr-10 !border-0 !outline-none !shadow-none !ring-0"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1.5 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] transition-colors cursor-pointer"
                  title="Bersihkan input"
                >
                  <IconClose size={16} />
                </button>
              )}
            </div>

            {/* Horizontal Discipline Chips (Active in clean Blue) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-0.5 -mx-4 px-4 sm:mx-0 sm:px-0">
              {SEARCH_DISCIPLINES.map((item) => {
                const isActive = selectedDiscipline === item.slug;
                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => setSelectedDiscipline(item.slug)}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-colors cursor-pointer min-h-[36px] flex items-center gap-1.5 active:scale-95 ${
                      isActive
                        ? 'bg-[var(--color-primary)] text-white font-semibold shadow-2xs'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border)]'
                    }`}
                  >
                    {item.emoji && <ProductEmoji name={item.emoji} size={14} className="shrink-0" />}
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Suggestion Chips (when query is empty) */}
            {!query && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[var(--color-text-tertiary)]">
                <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">Coba langsung:</span>
                {POPULAR_CONCEPTS.map((concept) => (
                  <button
                    key={concept}
                    type="button"
                    onClick={() => setQuery(concept)}
                    className="px-2.5 py-1 rounded-sm bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-secondary)] hover:text-[var(--color-primary-text)] transition-colors cursor-pointer"
                  >
                    {concept}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. SPLIT MASTER-DETAIL WORKSPACE */}
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 flex-1 overflow-hidden pb-6">
            <div className="grid grid-cols-12 gap-6 h-full">
              {/* Left Column: Results List */}
              <div className="col-span-12 lg:col-span-7 flex flex-col h-full overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xs">
                <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-surface-subtle)]/50 shrink-0">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold">
                    Hasil Pencarian ({searchResults.length})
                  </span>
                  <span className="text-[11px] text-[var(--color-text-tertiary)] hidden sm:inline">
                    Gunakan ↑↓ untuk bernavigasi / ↵ untuk membuka
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2.5 space-y-1.5">
                  {searchResults.length > 0 ? (
                    searchResults.map((item, idx) => {
                      const meta = getDisciplineMeta(item.discipline);
                      const isSelected = idx === selectedIndex;

                      return (
                        <div
                          key={item.slug}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          onClick={() => handleSelectSimulation(item.slug)}
                          className={`w-full p-3 sm:p-3.5 rounded-lg text-left transition-all flex items-center justify-between gap-3 group cursor-pointer border ${
                            isSelected
                              ? 'bg-[var(--color-primary-soft)] border-[var(--color-primary)]/40 shadow-xs'
                              : 'border-transparent hover:bg-[var(--color-surface-subtle)]'
                          }`}
                        >
                          {/* Icon Box with ProductEmoji */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                            isSelected
                              ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)] scale-105 shadow-2xs'
                              : 'bg-[var(--color-surface-subtle)] border-[var(--color-border-subtle)]'
                          }`}>
                            <ProductEmoji name={(item.discipline?.toLowerCase() || 'physics') as any} size={22} className="shrink-0" />
                          </div>

                          {/* Content Text */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-heading font-bold text-sm sm:text-base text-[var(--color-text)] group-hover:text-[var(--color-primary-text)] truncate">
                                {item.title}
                              </span>
                              <span className={`px-2 py-0.5 rounded-sm text-[10px] font-sans font-medium border shrink-0 ${meta.badgeColor}`}>
                                {meta.label}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">
                              {item.formula || item.description}
                            </p>
                          </div>

                          {/* Right Arrow indicator */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-semibold text-[var(--color-primary-text)] opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                              Eksplorasi
                            </span>
                            <IconArrowRight
                              size={15}
                              className={`text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary-text)] transition-transform ${
                                isSelected ? 'translate-x-1 text-[var(--color-primary-text)]' : ''
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-16 text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-subtle)] flex items-center justify-center mx-auto border border-[var(--color-border)] p-2">
                        <ProductEmoji name="telescope" size={32} />
                      </div>
                      <p className="font-heading font-semibold text-sm text-[var(--color-text)]">
                        Tidak ada simulasi yang cocok
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
                        Coba periksa kata kunci atau pilih bidang studi lain di atas.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Live Rich Detail Preview (Desktop) */}
              <div className="hidden lg:flex col-span-5 flex-col h-full overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xs">
                {activeItem ? (
                  <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
                    {/* Media Preview Header & Box */}
                    <div className="flex items-center justify-between px-3.5 py-2 bg-[var(--color-surface)] border-b border-[var(--color-border-subtle)] text-xs font-mono select-none">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <ProductEmoji name={(activeItem.discipline?.toLowerCase() || 'physics') as any} size={14} className="shrink-0" />
                        <span className="font-bold text-[var(--color-text)] uppercase tracking-wider text-[11px] truncate">
                          {activeItem.discipline}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[var(--color-surface-elevated)] text-[var(--color-primary-text)] font-mono text-[9px] font-bold border border-[var(--color-border)]">
                        60 FPS
                      </span>
                    </div>
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--color-surface-subtle)] border-b border-[var(--color-border-subtle)] shrink-0">
                      <SimulationPreviewGraphic
                        slug={activeItem.slug}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Detail Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-mono text-[var(--color-primary-text)] font-semibold tracking-wider uppercase">
                            {activeItem.category || activeItem.discipline}
                          </span>
                          <h3 className="font-heading font-bold text-lg text-[var(--color-text)] leading-snug">
                            {activeItem.title}
                          </h3>
                          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                            {activeItem.description}
                          </p>
                        </div>

                        {/* Formula snippet if exists */}
                        {activeItem.formula && (
                          <div className="p-2.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] space-y-1">
                            <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] uppercase font-semibold">
                              Persamaan Sistem:
                            </span>
                            <div className="font-mono text-xs font-bold text-[var(--color-text)]">
                              {activeItem.formula}
                            </div>
                          </div>
                        )}

                        {/* Learning objectives preview */}
                        {activeItem.learningObjectives && activeItem.learningObjectives.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[11px] font-mono text-[var(--color-text-tertiary)] uppercase font-semibold block">
                              Sasaran Pembelajaran:
                            </span>
                            <ul className="space-y-1.5">
                              {activeItem.learningObjectives.slice(0, 3).map((obj, i) => (
                                <li key={i} className="text-xs text-[var(--color-text-secondary)] flex items-start gap-2">
                                  <IconCheckCircle size={13} className="text-[var(--color-primary-text)] shrink-0 mt-0.5" />
                                  <span className="line-clamp-2">{obj}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-[var(--color-border-subtle)] space-y-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSelectSimulation(activeItem.slug)}
                          className="w-full py-2.5 px-4 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        >
                          <span>Mulai Eksperimen Modul</span>
                          <IconArrowRight size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchOpen(false);
                            router.push(`/simulation/${activeItem.slug}`);
                          }}
                          className="w-full py-2 px-4 rounded-md bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] text-[var(--color-text)] font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <IconPlay size={13} className="text-[var(--color-primary-text)]" />
                          <span>Buka Simulator Mandiri</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-[var(--color-text-tertiary)] flex items-center justify-center h-full">
                    Pilih simulasi di sebelah kiri untuk melihat pratinjau.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
