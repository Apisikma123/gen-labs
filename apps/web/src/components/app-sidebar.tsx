'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  IconDashboard,
  IconGraduationCap,
  IconBarChart,
  IconCalendar,
  IconMessageSquare,
  IconSettings,
  IconLogOut,
  IconShield,
  IconUser,
  IconBookOpen,
} from '@/components/icons';
import { useAuth } from './auth-provider';
import { GenLabsLogo } from '@/components/ui/gen-labs-logo';

interface AppSidebarProps {
  onOpenAiStudio?: () => void;
  onOpenSettings?: () => void;
}

export function AppSidebar({ onOpenAiStudio, onOpenSettings }: AppSidebarProps) {
  const pathname = usePathname();
  const { role, logout } = useAuth();

  // If in active simulation workspace, we can hide the left rail so canvas gets 100% full screen
  if (pathname?.startsWith('/simulation/')) {
    return null;
  }

  const isAdminRoute = pathname?.startsWith('/admin');

  // IT Admin exclusive navigation - strictly for admin operations
  const adminNavItems = [
    {
      id: 'admin-dashboard',
      href: '/admin',
      label: 'Dashboard IT Admin',
      icon: IconDashboard,
      isActive: pathname === '/admin',
    },
    {
      id: 'admin-modules',
      href: '/admin/modules',
      label: 'Manajemen Modul',
      icon: IconBookOpen,
      isActive: Boolean(pathname?.startsWith('/admin/modules')),
    },
    {
      id: 'admin-profile',
      href: '/admin/profile',
      label: 'Profil Admin',
      icon: IconShield,
      isActive: pathname === '/admin/profile',
    },
  ];

  // Student navigation - strictly learning & simulation focused
  const studentNavItems = [
    {
      id: 'dashboard',
      href: '/',
      label: 'Beranda Laboratorium',
      icon: IconDashboard,
      isActive: pathname === '/',
    },
    {
      id: 'tanya-ai',
      href: '/tanya-ai',
      label: 'Tanya AI Laboratorium',
      icon: IconGraduationCap,
      isActive: pathname === '/tanya-ai' || pathname === '/explore',
    },
    {
      id: 'history',
      href: '/history',
      label: 'Riwayat Praktikum',
      icon: IconCalendar,
      isActive: pathname === '/history',
    },
    {
      id: 'analytics',
      href: '/analytics',
      label: 'Analisis & Kemajuan',
      icon: IconBarChart,
      isActive: pathname === '/analytics',
    },
    {
      id: 'profile',
      href: '/profile',
      label: 'Profil Pengguna',
      icon: IconUser,
      isActive: pathname === '/profile',
    },
    {
      id: 'settings',
      href: '/settings',
      label: 'Pengaturan Sistem',
      icon: IconSettings,
      isActive: pathname === '/settings',
    },
    ...(role === 'admin'
      ? [
          {
            id: 'admin-switch',
            href: '/admin',
            label: 'Masuk Panel Admin',
            icon: IconShield,
            isActive: false,
          },
        ]
      : []),
  ];

  const currentNavItems = isAdminRoute ? adminNavItems : studentNavItems;

  return (
    <>
      {/* ── DESKTOP DOCKED LEFT RAIL ── */}
      <aside
        aria-label={isAdminRoute ? "Navigasi Admin" : "Navigasi Utama"}
        className="hidden md:flex w-20 flex-col justify-between items-center py-6 border-r border-[var(--color-border)] bg-[var(--color-surface)] h-screen sticky top-0 shrink-0 z-40 select-none transition-colors"
      >
        {/* Top: Brand Logo Badge */}
        <div className="flex flex-col items-center gap-6">
          <Link
            href={isAdminRoute ? "/admin" : "/"}
            className="w-11 h-11 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] border border-[var(--color-border)] flex items-center justify-center hover:scale-105 transition-transform shadow-xs"
            title={isAdminRoute ? "GEN LABS : Panel Admin" : "GEN LABS : Beranda"}
            aria-label={isAdminRoute ? "Panel Admin GEN LABS" : "Beranda GEN LABS"}
          >
            {isAdminRoute ? (
              <IconShield size={22} className="stroke-[2.2] text-[var(--color-primary-accent)]" />
            ) : (
              <GenLabsLogo size={22} />
            )}
          </Link>

          {/* Nav Stack */}
          <nav className="flex flex-col items-center gap-2">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="relative flex items-center justify-center">
                  {/* Active Left Indicator Notch */}
                  {item.isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-[var(--color-primary-accent)]"
                    />
                  )}

                  <Link
                    href={item.href}
                    title={item.label}
                    aria-label={item.label}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                      item.isActive
                        ? 'bg-[var(--color-surface-subtle)] text-[var(--color-text)] shadow-xs border border-[var(--color-border)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]'
                    }`}
                  >
                    <Icon size={20} className={item.isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'} />
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Exit / Logout */}
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/login"
            title="Ganti Akun / Masuk"
            aria-label="Ganti Akun"
            className="w-10 h-10 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary-accent)] hover:bg-[var(--color-surface-subtle)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <IconUser size={18} className="stroke-[1.8]" />
          </Link>
          <button
            type="button"
            onClick={logout}
            title="Keluar Sesi"
            aria-label="Keluar Sesi"
            className="w-10 h-10 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-error)] hover:bg-[var(--color-surface-subtle)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <IconLogOut size={18} className="stroke-[1.8]" />
          </button>
        </div>
      </aside>

      {/* ── MOBILE BOTTOM BAR (Responsive reflow) ── */}
      <nav
        aria-label="Navigasi Bawah Mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex items-center justify-around z-40 px-2 transition-colors shadow-lg"
      >
        {isAdminRoute ? (
          <>
            <Link
              href="/admin"
              className={`p-1.5 rounded-md flex flex-col items-center gap-0.5 text-[10px] font-sans ${
                pathname === '/admin'
                  ? 'text-[var(--color-primary-text)] font-semibold'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              <IconDashboard size={18} />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/modules"
              className={`p-1.5 rounded-md flex flex-col items-center gap-0.5 text-[10px] font-sans ${
                Boolean(pathname?.startsWith('/admin/modules'))
                  ? 'text-[var(--color-primary-text)] font-semibold'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              <IconBookOpen size={18} />
              <span>Modul</span>
            </Link>

            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-md flex flex-col items-center gap-0.5 text-[10px] font-sans text-[var(--color-text-secondary)] hover:text-[var(--color-error)]"
            >
              <IconLogOut size={18} />
              <span>Keluar</span>
            </button>
          </>
        ) : (
          <>
            <Link
              href="/app"
              className={`p-1.5 rounded-md flex flex-col items-center gap-0.5 text-[10px] font-sans ${
                pathname === '/app'
                  ? 'text-[var(--color-primary-text)] font-semibold'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              <IconDashboard size={18} />
              <span>Beranda</span>
            </Link>

            <Link
              href="/tanya-ai"
              className={`p-1.5 rounded-md flex flex-col items-center gap-0.5 text-[10px] font-sans ${
                pathname === '/tanya-ai' || pathname === '/explore'
                  ? 'text-[var(--color-primary-text)] font-semibold'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              <IconGraduationCap size={18} />
              <span>Modul</span>
            </Link>

            <Link
              href="/history"
              className={`p-1.5 rounded-md flex flex-col items-center gap-0.5 text-[10px] font-sans ${
                pathname === '/history'
                  ? 'text-[var(--color-primary-text)] font-semibold'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              <IconCalendar size={18} />
              <span>Riwayat</span>
            </Link>

            <Link
              href="/analytics"
              className={`p-1.5 rounded-md flex flex-col items-center gap-0.5 text-[10px] font-sans ${
                pathname === '/analytics'
                  ? 'text-[var(--color-primary-text)] font-semibold'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              <IconBarChart size={18} />
              <span>Analisis</span>
            </Link>

            {role === 'admin' ? (
              <Link
                href="/admin"
                className={`p-1.5 rounded-md flex flex-col items-center gap-0.5 text-[10px] font-sans ${
                  pathname === '/admin'
                    ? 'text-[var(--color-accent)] font-semibold'
                    : 'text-[var(--color-text-secondary)]'
                }`}
              >
                <IconShield size={18} />
                <span>Admin</span>
              </Link>
            ) : (
              <Link
                href="/profile"
                className={`p-1.5 rounded-md flex flex-col items-center gap-0.5 text-[10px] font-sans ${
                  pathname === '/profile'
                    ? 'text-[var(--color-primary-text)] font-semibold'
                    : 'text-[var(--color-text-secondary)]'
                }`}
              >
                <IconUser size={18} />
                <span>Profil</span>
              </Link>
            )}
          </>
        )}
      </nav>
    </>
  );
}
