'use client';

import {
  IconArrowLeft,
  IconCheck,
  IconArrowRight,
} from '@/components/icons';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { setAuthCookies } from '@/lib/api/auth';
import { GenLabsLogo } from '@/components/ui/gen-labs-logo';
import { ProductEmoji } from '@/components/ui/product-emoji';

function getSafeRedirect(userRole: string, redirectParam: string | null): string {
  if (userRole === 'admin') {
    if (!redirectParam || redirectParam === '/app' || redirectParam === '/' || redirectParam.startsWith('/app/')) {
      return '/admin';
    }
    if (
      redirectParam.startsWith('/admin') ||
      redirectParam.startsWith('/modules/') ||
      redirectParam.startsWith('/simulation/') ||
      redirectParam.startsWith('/eksplorasi') ||
      redirectParam.startsWith('/tanya-ai')
    ) {
      return redirectParam;
    }
    return '/admin';
  } else {
    if (!redirectParam || redirectParam.startsWith('/admin') || redirectParam === '/') {
      return '/app';
    }
    return redirectParam;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'admin'>('student');
  const [notice, setNotice] = useState<string | null>(null);

  /**
   * 1-Click quick login for testing: Authenticates against real Laravel backend.
   */
  const handleInstantLogin = async (role: 'student' | 'admin') => {
    setSelectedRole(role);
    setNotice(`Memproses masuk sebagai ${role === 'admin' ? 'Administrator' : 'Pengguna'}...`);

    const targetEmail = role === 'admin' ? 'admin@genlabs.app' : 'user@genlabs.app';
    const targetPass = 'secret123';

    const redirectParam = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('redirect')
      : null;

    try {
      const user = await login(targetEmail, targetPass, role);
      const verifiedRole = user.role || role;
      window.location.href = getSafeRedirect(verifiedRole, redirectParam);
    } catch (err: any) {
      setNotice(err?.message || 'Gagal masuk. Periksa server backend Laravel.');
    }
  };

  /**
   * Pre-fill the form credentials for manual submit testing.
   */
  const fillCredentials = (role: 'student' | 'admin') => {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmail('admin@genlabs.app');
      setPassword('secret123');
    } else {
      setEmail('user@genlabs.app');
      setPassword('secret123');
    }
    setNotice(`Kredensial ${role === 'admin' ? 'Administrator' : 'Pengguna'} diisi otomatis.`);
  };

  /**
   * Standard form submission: Authenticates against real Laravel backend.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice('Memproses sesi masuk...');
    const targetEmail =
      email || (selectedRole === 'admin' ? 'admin@genlabs.app' : 'user@genlabs.app');
    const targetPass = password || 'secret123';

    const redirectParam = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('redirect')
      : null;

    try {
      const user = await login(targetEmail, targetPass, selectedRole);
      const verifiedRole = user.role || selectedRole;
      window.location.href = getSafeRedirect(verifiedRole, redirectParam);
    } catch (err: any) {
      setNotice(err?.message || 'Kredensial tidak valid. Silakan periksa kembali email dan kata sandi.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-[var(--color-bg)]">
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
          className="text-xs font-mono text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] transition-colors"
        >
          GEN LABS
        </Link>
      </div>

      <div className="max-w-md w-full p-6 sm:p-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm space-y-6">
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
              Masuk ke GEN LABS
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Laboratorium Komputasi &amp; Pembelajaran Interaktif Sains.
            </p>
          </div>
        </div>

        {/* ── 1-CLICK QUICK LOGIN TESTING PANEL ── */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ProductEmoji name="zap" size={18} className="shrink-0" />
              <span className="text-xs font-heading font-bold text-[var(--color-text)]">
                Masuk Cepat (Uji Coba Langsung)
              </span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-semibold border border-[var(--color-primary)]/20">
              1-Klik Masuk
            </span>
          </div>

          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Pilih peran di bawah untuk langsung masuk dan menguji seluruh fitur tanpa perlu repot:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* Quick Admin */}
            <button
              type="button"
              id="quick-login-admin"
              onClick={() => handleInstantLogin('admin')}
              className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-left transition-all cursor-pointer group flex flex-col justify-between min-h-[76px] shadow-xs active:scale-[0.98]"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-1.5 text-xs font-heading font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
                  <ProductEmoji name="shield" size={16} className="shrink-0" />
                  <span>Admin</span>
                </div>
                <IconArrowRight size={13} className="text-[var(--color-text-tertiary)] group-hover:translate-x-0.5 group-hover:text-[var(--color-accent)] transition-transform" />
              </div>
              <div className="text-xs text-[var(--color-text-tertiary)] font-mono truncate">
                admin@genlabs.app
              </div>
              <div className="text-xs text-[var(--color-accent)] font-medium mt-1">
                Ringkasan &amp; Pengelolaan
              </div>
            </button>

            {/* Quick Student */}
            <button
              type="button"
              id="quick-login-student"
              onClick={() => handleInstantLogin('student')}
              className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-secondary)] hover:bg-[var(--color-secondary-soft)] text-left transition-all cursor-pointer group flex flex-col justify-between min-h-[76px] shadow-xs active:scale-[0.98]"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-1.5 text-xs font-heading font-bold text-[var(--color-text)] group-hover:text-[var(--color-secondary)]">
                  <ProductEmoji name="student" size={16} className="shrink-0" />
                  <span>Mahasiswa / Peneliti</span>
                </div>
                <IconArrowRight size={13} className="text-[var(--color-text-tertiary)] group-hover:translate-x-0.5 group-hover:text-[var(--color-secondary)] transition-transform" />
              </div>
              <div className="text-xs text-[var(--color-text-tertiary)] font-mono truncate">
                user@genlabs.app
              </div>
              <div className="text-xs text-[var(--color-secondary)] font-medium mt-1">
                Katalog &amp; Kanvas Simulasi
              </div>
            </button>
          </div>
        </div>

        {notice && (
          <div className="p-3 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text)] text-center font-medium animate-in fade-in duration-150">
            {notice}
          </div>
        )}

        {/* ── DIVIDER ── */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[var(--color-border)]"></div>
          <span className="flex-shrink mx-3 text-xs text-[var(--color-text-tertiary)] font-medium">
            atau masuk dengan email
          </span>
          <div className="flex-grow border-t border-[var(--color-border)]"></div>
        </div>

        {/* ── MANUAL INPUT FORM ── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="login-email" className="block text-xs font-semibold text-[var(--color-text)]">
              Email Akun
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--color-text-tertiary)]">Auto-fill:</span>
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="px-2 py-0.5 rounded-sm bg-[var(--color-surface-subtle)] hover:bg-[var(--color-primary-soft)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary-text)] border border-[var(--color-border)] text-xs font-medium transition-colors cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('student')}
                className="px-2 py-0.5 rounded-sm bg-[var(--color-surface-subtle)] hover:bg-[var(--color-primary-soft)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary-text)] border border-[var(--color-border)] text-xs font-medium transition-colors cursor-pointer"
              >
                Mahasiswa
              </button>
            </div>
          </div>

          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={selectedRole === 'admin' ? 'admin@genlabs.app' : 'user@genlabs.app'}
            aria-label="Email Akun"
            className="w-full px-4 py-2.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors min-h-[44px]"
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="block text-xs font-semibold text-[var(--color-text)]">
                Kata Sandi
              </label>
              <span className="text-xs text-[var(--color-text-tertiary)]">Kata sandi uji: secret123</span>
            </div>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              aria-label="Kata Sandi"
              className="w-full px-4 py-2.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors min-h-[44px]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs min-h-[44px] disabled:opacity-50"
            >
              <span>Masuk ke Laboratorium</span>
              <IconArrowRight size={15} />
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-[var(--color-border-subtle)]">
          <p className="text-xs text-[var(--color-text-secondary)]">
            Belum memiliki akun?{' '}
            <Link
              href="/register"
              className="font-semibold text-[var(--color-primary-text)] hover:underline"
            >
              Daftar Baru
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
