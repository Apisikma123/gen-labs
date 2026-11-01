'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconDashboard,
  IconSliders,
  IconUsers,
  IconDatabase,
  IconActivity,
  IconSettings,
  IconArrowLeft,
  IconLogOut,
  IconMenu,
  IconClose,
  IconShieldCheck,
} from '@/components/icons';
import { useAuth } from './auth-provider';
import { useFeedback } from '@/components/feedback';
import { GenLabsLogo } from '@/components/ui/gen-labs-logo';

export function AdminSidebar() {
  const pathname = usePathname();
  const feedback = useFeedback();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isOverview = pathname === '/admin';
  const isSimulatorsActive = pathname === '/admin/modules' || pathname.startsWith('/admin/modules/');
  const isUsersActive = pathname === '/admin/users';
  const isMasterDataActive = pathname === '/admin/master-data';
  const isActivityActive = pathname === '/admin/activity';
  const isSettingsActive = pathname === '/admin/settings';
  const isProfileActive = pathname === '/admin/profile';

  return (
    <>
      {/* ── MOBILE TOP NAVIGATION BAR ── */}
      <div className="md:hidden border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 h-14 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md hover:bg-[var(--color-surface-subtle)] text-[var(--color-text)] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Menu navigasi"
          >
            {mobileOpen ? <IconClose size={18} /> : <IconMenu size={18} />}
          </button>
          <GenLabsLogo variant="horizontal" size={20} />
        </div>
      </div>

      {/* ── BACKDROP FOR MOBILE DRAWER ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── ASIDE SIDEBAR ── */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-60 bg-[var(--color-surface)] border-r border-[var(--color-border)] z-50 flex flex-col justify-between p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] transition-transform duration-200 select-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-4 overflow-y-auto">
          {/* Brand */}
          <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-[var(--color-border-subtle)]">
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center hover:opacity-90 transition-opacity"
            >
              <GenLabsLogo variant="horizontal" size={24} />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup navigasi"
              title="Tutup navigasi"
              className="md:hidden p-1 rounded-md hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] cursor-pointer"
            >
              <IconClose size={16} />
            </button>
          </div>

          {/* 1. Overview */}
          <nav className="space-y-0.5">
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors min-h-[36px] ${
                isOverview
                  ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-semibold'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]'
              }`}
            >
              <IconDashboard size={15} className="shrink-0" />
              <span>Ringkasan</span>
            </Link>
          </nav>

          {/* 2. Simulator */}
          <div className="space-y-1">
            <span className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-tertiary)] font-semibold">
              Laboratorium
            </span>
            <nav className="space-y-0.5">
              <Link
                href="/admin/modules"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors min-h-[36px] ${
                  isSimulatorsActive
                    ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-semibold'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]'
                }`}
              >
                <IconSliders size={15} className="shrink-0" />
                <span>Simulator</span>
              </Link>
            </nav>
          </div>

          {/* 3. Management (Users, Master Data) */}
          <div className="space-y-1">
            <span className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-tertiary)] font-semibold">
              Pengelolaan
            </span>
            <nav className="space-y-0.5">
              <Link
                href="/admin/users"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors min-h-[36px] ${
                  isUsersActive
                    ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-semibold'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]'
                }`}
              >
                <IconUsers size={15} className="shrink-0" />
                <span>Pengguna</span>
              </Link>

              <Link
                href="/admin/master-data"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors min-h-[36px] ${
                  isMasterDataActive
                    ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-semibold'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]'
                }`}
              >
                <IconDatabase size={15} className="shrink-0" />
                <span>Data Utama</span>
              </Link>
            </nav>
          </div>

          {/* 4. System (Activity, Settings, Icons) */}
          <div className="space-y-1">
            <span className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-tertiary)] font-semibold">
              Sistem
            </span>
            <nav className="space-y-0.5">
              <Link
                href="/admin/activity"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors min-h-[36px] ${
                  isActivityActive
                    ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-semibold'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]'
                }`}
              >
                <IconActivity size={15} className="shrink-0" />
                <span>Aktivitas</span>
              </Link>

              <Link
                href="/admin/settings"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors min-h-[36px] ${
                  isSettingsActive
                    ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-semibold'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]'
                }`}
              >
                <IconSettings size={15} className="shrink-0" />
                <span>Pengaturan</span>
              </Link>

              <Link
                href="/admin/profile"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors min-h-[36px] ${
                  isProfileActive
                    ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-semibold'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]'
                }`}
              >
                <IconShieldCheck size={15} className="shrink-0" />
                <span>Profil Admin</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="pt-3 border-t border-[var(--color-border-subtle)] space-y-2 shrink-0">
          <Link
            href="/app"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] transition-colors min-h-[34px]"
          >
            <IconArrowLeft size={14} />
            <span>Kembali ke Lab Siswa</span>
          </Link>

          <div className="pt-1 px-1">
            <button
              type="button"
              onClick={() => {
                feedback.confirm({
                  title: 'Keluar dari Portal Admin?',
                  description: 'Sesi admin akan ditutup. Anda perlu masuk kembali untuk mengelola modul simulasi.',
                  variant: 'warning',
                  confirmLabel: 'Keluar',
                  cancelLabel: 'Batal',
                  onConfirm: async () => {
                    await logout();
                    feedback.toast.info('Anda telah keluar dari akun admin.');
                  },
                });
              }}
              className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] hover:text-rose-500 transition-colors cursor-pointer w-full py-1.5 px-2 rounded-md hover:bg-[var(--color-surface-subtle)]"
            >
              <IconLogOut size={14} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
