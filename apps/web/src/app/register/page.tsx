'use client';

import {
  IconArrowRight,
  IconArrowLeft,
  IconCheckCircle,
  IconAlertCircle,
} from '@/components/icons';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/components/auth-provider';
import { GenLabsLogo } from '@/components/ui/gen-labs-logo';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Semua kolom wajib diisi.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await authApi.register(name.trim(), email.trim(), password, 'student');
      if (res.success && res.user) {
        // Log in immediately and navigate to Student Dashboard
        await login(email.trim(), password, 'student');
        router.push('/app');
      } else {
        setErrorMsg(res.message || 'Pendaftaran gagal. Silakan coba lagi.');
      }
    } catch {
      setErrorMsg('Tidak dapat terhubung ke server. Periksa koneksi internetmu dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[var(--color-bg)]">
      {/* ── TOP BACK NAVIGATION BAR ── */}
      <div className="max-w-md w-full mb-3 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors group px-3 py-1.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] shadow-2xs cursor-pointer"
          aria-label="Kembali ke Beranda Publik"
        >
          <IconArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform text-[var(--color-primary)]" />
          <span>Kembali ke Beranda</span>
        </Link>
        <Link
          href="/"
          className="text-[11px] font-mono text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] transition-colors"
        >
          GEN LABS
        </Link>
      </div>

      <div className="max-w-md w-full p-5 sm:p-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm space-y-8">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center mb-1 hover:scale-105 transition-transform"
          >
            <GenLabsLogo variant="symbol" size={44} />
          </Link>
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-bold text-[var(--color-text)] tracking-tight">
              Daftar Akun Pengguna
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Mulai eksplorasi simulasi interaktif di GEN LABS.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-md bg-red-500/10 border border-red-500/20 text-[var(--color-error)] text-xs font-medium flex items-center gap-2">
            <IconAlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Register Form with 20-24px vertical spacing */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="register-name" className="block text-xs font-semibold text-[var(--color-text)]">
              Nama Lengkap
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              aria-label="Nama Lengkap"
              className="w-full px-4 py-3 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors min-h-[44px]"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="register-email" className="block text-xs font-semibold text-[var(--color-text)]">
              Alamat Email
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@genlabs.app"
              aria-label="Alamat Email"
              className="w-full px-4 py-3 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors min-h-[44px]"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="register-password" className="block text-xs font-semibold text-[var(--color-text)]">
              Kata Sandi
            </label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              aria-label="Kata Sandi"
              className="w-full px-4 py-3 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors min-h-[44px]"
              required
              minLength={6}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs min-h-[44px] disabled:opacity-50"
            >
              <span>{loading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}</span>
              <IconArrowRight size={15} />
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-[var(--color-border-subtle)]">
          <p className="text-xs text-[var(--color-text-secondary)]">
            Sudah memiliki akun?{' '}
            <Link
              href="/login"
              className="font-semibold text-[var(--color-primary-text)] hover:underline"
            >
              Masuk di Sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
