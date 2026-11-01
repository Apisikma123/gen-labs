'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  IconSearch,
  IconBell,
  IconClose,
  IconArrowRight,
  IconShield,
  IconUser,
  IconLogOut,
  IconRotateCcw,
} from '@/components/icons';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from './auth-provider';
import { ACTIVE_SIMULATION_CATALOG } from '@genlab/simulation-core';
import { AiUsageBadge } from '@/components/ui/ai-usage-badge';
import { fuzzyFilterAndRank } from '@/lib/search/fuzzy-search';
import { ProductEmoji } from '@/components/ui/product-emoji';

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout, switchRole } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut Cmd+K / Ctrl+K & global search open event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    const handleCustomOpen = () => {
      setSearchOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('genlabs_open_search', handleCustomOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('genlabs_open_search', handleCustomOpen);
    };
  }, [searchOpen]);

  // Click outside listener for user menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide global header in admin pages, module workspace, and simulation workspace
  // to avoid double headers and duplicate theme toggles (each has its own dedicated header)
  if (
    pathname?.startsWith('/simulation/') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/modules/')
  ) {
    return null;
  }

  const getPageTitle = () => {
    if (pathname === '/') return 'GEN LABS — Belajar dengan Mencoba';
    if (pathname === '/tanya-ai' || pathname === '/explore') return 'Tanya AI Laboratorium';
    if (pathname === '/history') return 'Riwayat Sesi Eksperimen';
    if (pathname === '/analytics') return 'Kemajuan Praktikum & Analisis';
    if (pathname === '/settings') return 'Preferensi Tampilan & Sistem';
    if (pathname === '/admin') return 'Panel Admin Laboratorium';
    if (pathname === '/profile') return 'Profil Pengguna';
    if (pathname === '/login') return 'Masuk ke GEN LABS';
    return 'GEN LABS';
  };

  const searchResults = query.trim()
    ? fuzzyFilterAndRank(ACTIVE_SIMULATION_CATALOG, query).slice(0, 5)
    : ACTIVE_SIMULATION_CATALOG.slice(0, 4);

  const handleSelectSimulation = (slug: string) => {
    setSearchOpen(false);
    setQuery('');
    router.push(`/simulation/${slug}`);
  };

  return (
    <header className="w-full h-16 sm:h-20 px-4 sm:px-8 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4 transition-colors">
      {/* ── LEFT: PAGE TITLE ── */}
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="font-heading text-lg sm:text-2xl font-bold tracking-tight text-[var(--color-text)] truncate">
          {getPageTitle()}
        </h1>
      </div>

      {/* ── RIGHT: SEARCH CHASSIS, NOTIFICATIONS & PROFILE ── */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Precision Search Trigger Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-all cursor-pointer shadow-2xs group active:scale-95 min-h-[36px] w-36 sm:w-56 select-none"
            title="Cari konsep simulasi (Ctrl+K)"
            aria-label="Cari simulasi"
          >
            <ProductEmoji
              name="search"
              size={14}
              className="shrink-0 drop-shadow-2xs group-hover:scale-110 transition-transform"
            />
            <span className="truncate text-left flex-1 font-mono text-[11px] text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)] transition-colors">
              Cari konsep...
            </span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-[var(--color-surface-subtle)] text-[var(--color-text-tertiary)] border border-[var(--color-border)] group-hover:border-[var(--color-primary)]/40 transition-colors">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-9 h-9 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer shadow-2xs relative active:scale-95"
            title="Pemberitahuan"
            aria-label="Pemberitahuan"
          >
            <IconBell size={15} />
          </button>

          {/* Simple Notifications Popover */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-floating z-50 space-y-2 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2">
                <span className="font-heading font-bold text-[var(--color-text)]">Pemberitahuan</span>
                <span className="text-[10px] text-[var(--color-primary-text)] font-semibold font-mono">1 Baru</span>
              </div>
              <div className="p-2 rounded-xl bg-[var(--color-surface-subtle)] space-y-1">
                <p className="font-semibold text-[var(--color-text)]">Modul Fisika Selesai</p>
                <p className="text-[11px] text-[var(--color-text-secondary)]">
                  Hasil eksperimen kamu telah tersimpan dengan aman di jurnal praktikum.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User AI Credit Indicator */}
        {user && (
          <div className="hidden sm:block">
            <AiUsageBadge variant="compact" />
          </div>
        )}

        {/* User Profile Avatar with Interactive Dropdown or Login button */}
        {user ? (
          <div className="relative flex items-center gap-2 pl-1 border-l border-[var(--color-border-subtle)]" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-0.5 rounded-full hover:bg-[var(--color-surface-subtle)] transition-colors cursor-pointer min-h-[36px] group active:scale-95"
              title="Menu Akun & Peran"
              aria-label="Menu Akun & Peran"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
            >
              <div className="relative">
                {/* Fine gradient ring */}
                <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-[#1D4838] via-[#4B8F8C] to-[#BA8230] shadow-2xs group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full bg-[var(--color-surface)] dark:bg-[#0E1410] flex items-center justify-center text-[var(--color-primary)] dark:text-[#E6ECE8] font-heading font-bold text-xs select-none transition-colors">
                    {user.avatar || (role === 'admin' ? 'A' : user.name.charAt(0).toUpperCase())}
                  </div>
                </div>
              </div>

              <div className="hidden lg:block text-left pr-1">
                <div className="text-xs font-semibold text-[var(--color-text)] leading-tight max-w-[120px] truncate">
                  {user.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-[var(--color-text-secondary)] font-mono uppercase">
                  {role === 'admin' ? 'Admin' : 'Mhs'}
                </div>
              </div>
            </button>

            {/* User Popover Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 top-12 w-72 p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-floating z-50 space-y-2 text-xs">
                <div className="p-2.5 border-b border-[var(--color-border-subtle)]">
                  <div className="font-heading font-bold text-[var(--color-text)] truncate">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-secondary)] font-mono truncate">
                    {user.email}
                  </div>
                  <div className="mt-1">
                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase ${
                      role === 'admin'
                        ? 'bg-[#152B1E] text-[var(--color-primary-accent)] border border-[#2D4C38]'
                        : 'bg-[var(--color-surface-subtle)] text-[var(--color-text)] border border-[var(--color-border)]'
                    }`}>
                      Peran: {role === 'admin' ? 'Administrator' : 'Pengguna'}
                    </span>
                  </div>
                </div>

                {/* AI Credit Card inside popover */}
                <div className="px-1">
                  <AiUsageBadge variant="card" />
                </div>

                <Link
                  href="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full px-3 py-2 rounded-md hover:bg-[var(--color-surface-subtle)] text-[var(--color-text)] flex items-center gap-2 cursor-pointer font-medium"
                >
                  <IconUser size={14} className="text-[var(--color-primary-accent)]" />
                  <span>Profil & Eksplorasi</span>
                </Link>

                {role === 'admin' ? (
                  <Link
                    href="/admin"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full px-3 py-2 rounded-md hover:bg-[var(--color-surface-subtle)] text-[var(--color-text)] flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <IconShield size={14} className="text-[var(--color-primary-accent)]" />
                    <span>Panel Administrasi</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      switchRole('admin');
                    }}
                    className="w-full px-3 py-2 rounded-md hover:bg-[var(--color-surface-subtle)] text-[var(--color-text)] flex items-center gap-2 cursor-pointer text-left"
                  >
                    <IconRotateCcw size={14} className="text-[var(--color-text-secondary)]" />
                    <span>Beralih ke Administrator</span>
                  </button>
                )}

                {role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      switchRole('student');
                    }}
                    className="w-full px-3 py-2 rounded-md hover:bg-[var(--color-surface-subtle)] text-[var(--color-text)] flex items-center gap-2 cursor-pointer text-left"
                  >
                    <IconRotateCcw size={14} className="text-[var(--color-text-secondary)]" />
                    <span>Beralih ke Pengguna</span>
                  </button>
                )}

                <div className="pt-1 border-t border-[var(--color-border-subtle)]">
                  <button
                    type="button"
                    onClick={async () => {
                      setUserMenuOpen(false);
                      await logout();
                      router.push('/login');
                    }}
                    className="w-full px-3 py-2 rounded-md hover:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-2 cursor-pointer text-left font-medium"
                  >
                    <IconLogOut size={14} />
                    <span>Keluar Sesi</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold transition-colors shadow-2xs whitespace-nowrap min-h-[44px] flex items-center justify-center cursor-pointer"
          >
            Masuk
          </Link>
        )}
      </div>

      {/* ── SEARCH MODAL ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl max-w-lg w-full p-4 space-y-3 shadow-floating animate-fade-in">
            <div className="relative flex items-center">
              <IconSearch size={16} className="absolute left-3.5 text-[var(--color-text-secondary)]" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari konsep sains, rumus, atau algoritma..."
                className="w-full pl-10 pr-10 py-2.5 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-md text-xs sm:text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-primary)]"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] cursor-pointer"
              >
                <IconClose size={16} />
              </button>
            </div>

            <div className="space-y-1 max-h-72 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="py-8 px-4 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] flex items-center justify-center icon-3d-interactive">
                    <ProductEmoji name="search" size={28} />
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Tidak ditemukan simulator yang cocok dengan <span className="font-mono text-[var(--color-text)] font-semibold">&quot;{query}&quot;</span>
                  </p>
                </div>
              ) : (
                <>
                  <div className="px-2 py-1 text-[11px] font-sans uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold">
                    Modul Terkalibrasi ({searchResults.length})
                  </div>
                  {searchResults.map((item) => (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => handleSelectSimulation(item.slug)}
                      className="w-full p-2.5 rounded-md hover:bg-[var(--color-surface-subtle)] flex items-center justify-between text-left transition-colors cursor-pointer group"
                    >
                      <div className="space-y-0.5 min-w-0 pr-3">
                        <div className="font-heading text-xs sm:text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary-accent)] truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-secondary)] truncate font-mono">
                          {item.formula || item.description}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-[var(--color-primary-accent)] bg-[#152B1E] px-2 py-0.5 rounded-full shrink-0 border border-[#2D4C38]">
                        {item.discipline}
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
