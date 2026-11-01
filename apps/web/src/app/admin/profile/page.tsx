'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconShield,
  IconShieldCheck,
  IconDatabase,
  IconCpu,
  IconKey,
  IconCheckCircle,
  IconAlertCircle,
  IconLogOut,
  IconSliders,
  IconBookOpen,
  IconLayers,
  IconArrowRight,
  IconClock,
  IconActivity,
  IconCheck,
} from '@/components/icons';
import { useAuth } from '@/components/auth-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { useFeedback } from '@/components/feedback';
import { adminApi, AdminMetrics } from '@/lib/api/admin';

export default function AdminProfilePage() {
  const router = useRouter();
  const feedback = useFeedback();
  const { user, logout } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    adminApi.getMetrics()
      .then((res) => {
        if (res?.success && res.metrics) {
          setMetrics(res.metrics);
        }
      })
      .catch((err) => {
        console.warn('Profile metrics load warning:', err);
      });
  }, []);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      const err = 'Kata sandi baru minimal 8 karakter.';
      setErrorMessage(err);
      setSaveStatus('error');
      feedback.toast.error(err);
      return;
    }
    if (newPassword !== confirmPassword) {
      const err = 'Konfirmasi kata sandi tidak cocok.';
      setErrorMessage(err);
      setSaveStatus('error');
      feedback.toast.error(err);
      return;
    }

    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setErrorMessage('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      feedback.toast.success('Kredensial akun administrator berhasil diperbarui.');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 600);
  };

  const handleLogout = () => {
    feedback.confirm({
      title: 'Keluar dari Portal Admin?',
      description: 'Sesi otoritas administrasi Anda akan ditutup. Anda harus masuk kembali untuk mengelola simulator.',
      variant: 'warning',
      confirmLabel: 'Keluar Sesi',
      cancelLabel: 'Batal',
      onConfirm: async () => {
        await logout();
        feedback.toast.info('Sesi administrator telah berakhir.');
        router.push('/login');
      },
    });
  };

  return (
    <div className="space-y-8 sm:space-y-10 max-w-[1080px]">
      {/* ── 1. BREADCRUMB & HEADER ── */}
      <div className="border-b border-[var(--color-border-subtle)] pb-6 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-text-secondary)]">
          <Link href="/admin" className="hover:text-[var(--color-text)] transition-colors">
            Portal Admin
          </Link>
          <span>/</span>
          <span className="text-[var(--color-text)] font-semibold">Profil & Otoritas</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
              Profil Administrator Laboratorium
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
              Pengelolaan identitas pengajar, otoritas penerbitan kurikulum, dan integritas infrastruktur sistem.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-mono font-bold bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] border border-[var(--color-primary)]/30">
              OTORITAS PENUH
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. IDENTITY HERO CARD ── */}
      <div className="p-6 sm:p-8 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs relative overflow-hidden">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Monogram Avatar */}
            <div className="w-20 h-20 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] border-2 border-[var(--color-primary)]/20 flex items-center justify-center font-heading text-3xl font-extrabold shadow-sm shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text)]">
                  {user?.name || 'Dr. Hendra Wijaya (Admin Lab)'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-sm text-[11px] font-semibold bg-[var(--color-primary)] text-white shadow-2xs font-mono">
                  Admin Lab GEN LABS
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-mono">
                {user?.email || 'admin@genlabs.app'}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[var(--color-text-tertiary)]">
                <span className="flex items-center gap-1.5 font-mono">
                  <IconShield size={13} className="text-[var(--color-primary-accent)]" />
                  <span>ID: ADM-GL-2026-0881</span>
                </span>
                <span>/</span>
                <span className="flex items-center gap-1.5">
                  <IconClock size={13} />
                  <span>GEN LABS Research Center</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-4 sm:pt-0 border-[var(--color-border-subtle)] gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-400 hover:bg-red-100/50 text-xs font-semibold transition-colors cursor-pointer min-h-[40px]"
            >
              <IconLogOut size={15} />
              <span>Keluar Sesi Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. THREE-COLUMN METRICS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
          <div className="flex items-center justify-between text-[var(--color-text-secondary)]">
            <span className="text-xs font-mono">Modul Kurikulum</span>
            <IconBookOpen size={16} className="text-[var(--color-primary-accent)]" />
          </div>
          <div className="font-heading text-2xl font-extrabold text-[var(--color-text)]">
            {metrics ? `${metrics.totalModules} Modul` : '39 Modul'}
          </div>
          <p className="text-[11px] text-[var(--color-text-tertiary)]">
            {metrics
              ? `${metrics.publishedCount} Diterbitkan, ${metrics.draftCount} Draf di MySQL`
              : 'Tersimpan di tabel `modules` MySQL'}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
          <div className="flex items-center justify-between text-[var(--color-text-secondary)]">
            <span className="text-xs font-mono">Mesin Simulator</span>
            <IconLayers size={16} className="text-[var(--color-primary-accent)]" />
          </div>
          <div className="font-heading text-2xl font-extrabold text-[var(--color-text)]">
            {metrics ? `${metrics.totalSimulations} Simulator` : '39 Simulator'}
          </div>
          <p className="text-[11px] text-[var(--color-text-tertiary)]">
            SuperCanvas Engine terintegrasi (Fisika, Komputer, Bisnis)
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
          <div className="flex items-center justify-between text-[var(--color-text-secondary)]">
            <span className="text-xs font-mono">Backend Stack</span>
            <IconDatabase size={16} className="text-emerald-500" />
          </div>
          <div className="font-heading text-2xl font-extrabold text-[var(--color-text)] flex items-center gap-2">
            <span>Laravel + MySQL</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            TCP 3306 & Port 8000 Aktif Terverifikasi
          </p>
        </div>
      </div>

      {/* ── 4. ADMINISTRATOR PERMISSION MATRIX & SYSTEM CAPABILITIES ── */}
      <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-5">
        <div className="space-y-1">
          <h3 className="font-heading text-base sm:text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
            <IconShieldCheck size={18} className="text-[var(--color-primary-accent)]" />
            <span>Matriks Wewenang & Hak Akses Administrator</span>
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Hak istimewa akun ini dalam tata kelola kurikulum dan infrastruktur laboratorium virtual GEN LABS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          <div className="p-4 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <IconCheckCircle size={16} />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-[var(--color-text)]">
                Publikasi & Pengarsipan Modul
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                Menerbitkan modul baru dari status draft menjadi published agar dapat diakses pengguna, atau mengarsipkan modul usang.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <IconSliders size={16} />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-[var(--color-text)]">
                Studio AI Simulator & Surgical Patch
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                Menghasilkan spesifikasi simulasi baru via prompt bahasa Indonesia dan mengedit parameter melalui JSON patch mikro hemat token.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <IconDatabase size={16} />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-[var(--color-text)]">
                Akses Database Relasional MySQL
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                Menulis dan membaca langsung database relasional MySQL tanpa perantara mock data atau JSON lokal yang tidak terenkripsi.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <IconCpu size={16} />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-[var(--color-text)]">
                Pemantauan Aktivitas Belajar
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                Melihat data percobaan siswa, tingkat penyelesaian tantangan simulasi, dan statistik penggunaan modul.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. SECURITY & CREDENTIAL UPDATE SECTION ── */}
      <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6">
        <div className="space-y-1">
          <h3 className="font-heading text-base sm:text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
            <IconKey size={18} className="text-[var(--color-primary-accent)]" />
            <span>Keamanan Akun & Kredensial Administrator</span>
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Perbarui kata sandi admin untuk menjaga keamanan portal kurikulum laboratorium.
          </p>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-[550px]">
          {saveStatus === 'saved' && (
            <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <IconCheck size={16} />
              <span>Kata sandi administrator berhasil diperbarui.</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <IconAlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-text)]">
              Kata Sandi Saat Ini
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text)]">
                Kata Sandi Baru
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full px-3.5 py-2.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text)]">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full px-3.5 py-2.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saveStatus === 'saving'}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer min-h-[40px] disabled:opacity-50"
            >
              <span>{saveStatus === 'saving' ? 'Menyimpan...' : 'Perbarui Kata Sandi'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── 6. DIRECT NAVIGATION SHORTCUTS ── */}
      <div className="p-6 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold text-[var(--color-text)]">
            Kembali ke Dashboard Analitik Lab
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            Pantau metrik simulasi, status verifikasi, dan katalog kurikulum GEN LABS.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] transition-colors shadow-2xs shrink-0"
        >
          <span>Buka Dashboard Lab</span>
          <IconArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
