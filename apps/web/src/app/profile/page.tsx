'use client';

import {
  IconShield,
  IconArrowRight,
  IconLogOut,
} from '@/components/icons';
import {
  Icon3dStarAward,
  Icon3dVerifiedEquilibrium,
  Icon3dBookModule,
  Icon3dAiCore,
} from '@/components/icons/3d';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useFeedback } from '@/components/feedback';
import { AiUsageBadge } from '@/components/ui/ai-usage-badge';

export default function ProfilePage() {
  const router = useRouter();
  const feedback = useFeedback();
  const { user, role, logout, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const handleLogout = () => {
    feedback.confirm({
      title: 'Keluar dari Akun Laboratorium?',
      description: 'Apakah Anda yakin ingin mengakhiri sesi ini? Seluruh progres simulasi yang telah dicapai tetap tersimpan di riwayat akun.',
      variant: 'warning',
      confirmLabel: 'Keluar Akun',
      cancelLabel: 'Batal',
      onConfirm: async () => {
        await logout();
        feedback.toast.info('Sesi Anda telah berakhir.');
        router.push('/login');
      },
    });
  };

  const isStudent = role === 'student';

  if (isLoading || !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="text-xs font-mono text-[var(--color-text-secondary)]">Memuat profil...</span>
      </div>
    );
  }

  return (
    <div className="max-w-[860px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 space-y-10 sm:space-y-12">
      {/* ── ADMIN NOTICE BANNER ── */}
      {role === 'admin' && (
        <div className="p-4 rounded-xl bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <IconShield size={18} className="text-[var(--color-primary-text)] shrink-0" />
            <span className="text-xs font-medium text-[var(--color-text)]">
              Anda sedang masuk dengan akun <strong>Administrator Laboratorium</strong>.
            </span>
          </div>
          <Link
            href="/admin/profile"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold transition-colors shrink-0 shadow-xs"
          >
            <span>Buka Profil & Otoritas Admin</span>
            <IconArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* ── 1. USER PROFILE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[var(--color-border-subtle)] pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] border border-[var(--color-border)] flex items-center justify-center font-heading text-2xl font-bold shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : (isStudent ? 'M' : 'A')}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text)] tracking-tight">
                {user?.name || 'Pengguna GEN LABS'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-sm text-xs font-semibold bg-[var(--color-primary-soft)] text-[var(--color-primary-text)]">
                {role === 'admin' ? 'Administrator' : 'Pengguna'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
              {user?.email || 'user@genlabs.app'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-error)] transition-colors cursor-pointer min-h-[42px] self-start sm:self-auto"
        >
          <IconLogOut size={14} />
          <span>Keluar Sesi</span>
        </button>
      </div>

      {/* ── KREDIT AI & KUOTA HARIAN ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base sm:text-lg font-bold text-[var(--color-text)]">
            Kredit AI Tutor & Kuota Harian
          </h2>
          <span className="text-[11px] font-mono text-[var(--color-text-secondary)]">
            Reset otomatis 00.00 WIB
          </span>
        </div>

        <AiUsageBadge variant="card" />

        <div className="p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)] space-y-1.5 leading-relaxed">
          <p className="font-semibold text-[var(--color-text)]">Ketentuan Penggunaan Kredit AI:</p>
          <ul className="list-disc list-inside space-y-1 text-[11.5px]">
            <li>Setiap akun pengguna memiliki kuota <strong>5 pertanyaan AI Tutor per hari</strong>.</li>
            <li>Pertanyaan mencakup bimbingan rumus, kausalitas parameter, dan rekomendasi nilai kontrol.</li>
            <li>Kuota diperbarui otomatis setiap pergantian hari pada <strong>pukul 00.00 WIB (Asia/Jakarta)</strong>.</li>
          </ul>
        </div>
      </section>

      {/* ── 2. PENCAPAIAN & REKAM PRAKTIKUM ── */}
      <section className="space-y-4">
        <h2 className="font-heading text-base sm:text-lg font-bold text-[var(--color-text)]">
          Pencapaian & Rekam Praktikum
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center justify-center shrink-0 shadow-2xs">
              <Icon3dStarAward size={26} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-[var(--color-text-secondary)]">Sains Terapan</div>
              <div className="font-heading font-bold text-sm text-[var(--color-text)]">Mastery 100%</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center justify-center shrink-0 shadow-2xs">
              <Icon3dVerifiedEquilibrium size={26} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-[var(--color-text-secondary)]">Eksperimen</div>
              <div className="font-heading font-bold text-sm text-[var(--color-text)]">Terverifikasi</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center justify-center shrink-0 shadow-2xs">
              <Icon3dBookModule size={26} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-[var(--color-text-secondary)]">Kurikulum</div>
              <div className="font-heading font-bold text-sm text-[var(--color-text)]">14 Modul</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center justify-center shrink-0 shadow-2xs">
              <Icon3dAiCore size={26} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-[var(--color-text-secondary)]">Tanya AI</div>
              <div className="font-heading font-bold text-sm text-[var(--color-text)]">Aktif Siap</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. ACCOUNT INFORMATION & ROLE ── */}
      <section className="space-y-4">
        <h2 className="font-heading text-base sm:text-lg font-bold text-[var(--color-text)]">
          Informasi Akun
        </h2>

        <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-[var(--color-text-secondary)] block text-xs">Nama Lengkap</span>
              <span className="font-semibold text-[var(--color-text)] mt-0.5 block">{user?.name || '-'}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-secondary)] block text-xs">Alamat Email</span>
              <span className="font-semibold text-[var(--color-text)] mt-0.5 block">{user?.email || '-'}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-secondary)] block text-xs">Hak Akses Sistem</span>
              <span className="font-semibold text-[var(--color-text)] mt-0.5 block">
                {role === 'admin' ? 'Administrator (Authoring & Kontrol)' : 'Pengguna / Pelajar (Eksplorasi)'}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-text-secondary)] block text-xs">ID Sesi Database</span>
              <span className="font-mono text-xs text-[var(--color-text-tertiary)] mt-0.5 block">
                usr_{user?.id || 'default'}
              </span>
            </div>
          </div>

          {role === 'admin' && (
            <div className="pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
              <span className="text-xs text-[var(--color-text-secondary)]">
                Anda memiliki hak istimewa untuk mengelola dan membuat modul baru.
              </span>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <IconShield size={14} />
                <span>Buka Panel Admin</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── 3. QUICK SHORTCUTS ── */}
      <section className="space-y-4 border-t border-[var(--color-border-subtle)] pt-8">
        <h2 className="font-heading text-base sm:text-lg font-bold text-[var(--color-text)]">
          Tautan Cepat
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/history"
            className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors flex items-center justify-between group"
          >
            <div>
              <div className="font-heading font-semibold text-xs sm:text-sm text-[var(--color-text)] group-hover:text-[var(--color-primary-text)]">
                Riwayat Praktikum
              </div>
              <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Lihat sesi dan parameter tersimpan
              </div>
            </div>
            <IconArrowRight size={15} className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary-text)] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href={user?.role === 'admin' ? '/admin/settings' : '/settings'}
            className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors flex items-center justify-between group"
          >
            <div>
              <div className="font-heading font-semibold text-xs sm:text-sm text-[var(--color-text)] group-hover:text-[var(--color-primary-text)]">
                Preferensi & Tampilan
              </div>
              <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Sesuaikan tema terang/gelap
              </div>
            </div>
            <IconArrowRight size={15} className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary-text)] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
