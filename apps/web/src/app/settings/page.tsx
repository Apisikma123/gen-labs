'use client';

import {
  IconSun,
  IconMoon,
  IconLaptop,
  IconCheck,
  IconRotateCcw,
  IconShield,
  IconArrowRight,
  Icon3dGearSettings,
} from '@/components/icons';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { useTheme } from '@/components/theme-provider';
import { useFeedback } from '@/components/feedback';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const feedback = useFeedback();
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [sliderSensitivity, setSliderSensitivity] = useState<'normal' | 'smooth'>('normal');

  const handleClearCache = () => {
    feedback.confirm({
      title: 'Kembalikan Pengaturan Tampilan?',
      description: 'Pengaturan tema warna dan respon kontrol akan dikembalikan ke kondisi standar.',
      targetName: 'Pengaturan Tampilan',
      variant: 'warning',
      confirmLabel: 'Kembalikan Standar',
      cancelLabel: 'Batal',
      onConfirm: () => {
        try {
          localStorage.removeItem('genlabs-theme');
          setTheme('system');
          setSliderSensitivity('normal');
          feedback.toast.success('Pengaturan tampilan berhasil dikembalikan ke standar.');
        } catch {
          feedback.toast.error('Gagal mengembalikan pengaturan tampilan.');
        }
      },
    });
  };

  return (
    <div className="max-w-[860px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 space-y-10 sm:space-y-12">
      {/* ── 1. PAGE HEADING ── */}
      <div className="flex items-start justify-between border-b border-[var(--color-border-subtle)] pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#152B1E] border border-[#2D4C38] font-mono text-[10px] font-bold text-[var(--color-primary-accent)] tracking-wider uppercase">
              PREFERENSI SISTEM
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text)] tracking-tight">
            Pengaturan
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Kelola preferensi antarmuka visual laboratorium dan kontrol interaktif simulasi.
          </p>
        </div>
        <div className="hidden sm:flex p-2.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] shadow-2xs icon-3d-interactive">
          <Icon3dGearSettings size={36} />
        </div>
      </div>

      {user?.role === 'admin' && (
        <div className="p-3.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[var(--color-text)]">
            <IconShield size={16} className="text-[var(--color-primary-accent)] shrink-0" />
            <span>Anda masuk sebagai Administrator. Ingin mengonfigurasi Super Canvas &amp; infrastruktur?</span>
          </div>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-1 font-semibold text-[var(--color-primary-text)] hover:underline shrink-0"
          >
            <span>Buka Pengaturan Admin</span>
            <IconArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* ── 2. THEME SETTING ── */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="font-heading text-base sm:text-lg font-bold text-[var(--color-text)]">
            Tema Tampilan
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            GEN LABS dikonfigurasi dalam standar visual Dark Obsidian terpadu untuk instrumen laboratorium interaktif.
          </p>
        </div>

        <div className="max-w-lg p-4 rounded-xl border border-[var(--color-primary)]/40 bg-[var(--color-primary-soft)] text-[var(--color-text)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-primary-text)]">
              <IconMoon size={18} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">
                Dark Obsidian Lab
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">
                Tema aktif permanen (#10150b base ground)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary-text)] font-mono text-[10px] font-bold">
            <IconCheck size={12} />
            <span>STANDAR AKTIF</span>
          </div>
        </div>
      </section>

      {/* ── 3. SIMULATION CONTROLS SENSITIVITY ── */}
      <section className="space-y-4 border-t border-[var(--color-border-subtle)] pt-8">
        <div className="space-y-1">
          <h2 className="font-heading text-base sm:text-lg font-bold text-[var(--color-text)]">
            Kecepatan Respons Slider
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Kecepatan pembaruan hasil hitungan saat tombol geser digerakkan.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md">
          <button
            type="button"
            onClick={() => setSliderSensitivity('normal')}
            className={`p-4 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between min-h-[56px] ${
              sliderSensitivity === 'normal'
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-semibold'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)]'
            }`}
          >
            <span className="text-xs sm:text-sm">Standar (Langsung)</span>
            {sliderSensitivity === 'normal' && <IconCheck size={16} />}
          </button>

          <button
            type="button"
            onClick={() => setSliderSensitivity('smooth')}
            className={`p-4 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between min-h-[56px] ${
              sliderSensitivity === 'smooth'
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-semibold'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)]'
            }`}
          >
            <span className="text-xs sm:text-sm">Halus (Gerakan Mulus)</span>
            {sliderSensitivity === 'smooth' && <IconCheck size={16} />}
          </button>
        </div>
      </section>

      {/* ── 4. SYSTEM CACHE & RESET ── */}
      <section className="space-y-4 border-t border-[var(--color-border-subtle)] pt-8">
        <div className="space-y-1">
          <h2 className="font-heading text-base sm:text-lg font-bold text-[var(--color-text)]">
            Penyimpanan Peramban
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Kembalikan preferensi tema dan tampilan ke kondisi awal jika diperlukan.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={handleClearCache}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] transition-colors cursor-pointer min-h-[42px]"
          >
            <IconRotateCcw size={14} />
            <span>Kembalikan Pengaturan Awal</span>
          </button>
        </div>
      </section>
    </div>
  );
}
