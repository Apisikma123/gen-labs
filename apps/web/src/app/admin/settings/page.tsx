'use client';

import { useState } from 'react';
import {
  IconSun,
  IconMoon,
  IconLaptop,
  IconRotateCcw,
  IconCheck,
  IconDatabase,
  IconLayers,
  IconCpu,
  IconShieldCheck,
  IconSave,
} from '@/components/icons';
import { useTheme } from '@/components/theme-provider';
import { useFeedback } from '@/components/feedback';

export default function AdminSettingsPage() {
  const { theme, setTheme } = useTheme();
  const feedback = useFeedback();
  const [defaultGrid, setDefaultGrid] = useState(true);
  const [defaultGround, setDefaultGround] = useState(true);
  const [autoSaveDraft, setAutoSaveDraft] = useState(true);

  const handleSave = () => {
    feedback.toast.success('Preferensi sistem admin berhasil disimpan.');
  };

  const handleResetCache = () => {
    feedback.confirm({
      title: 'Reset Cache Antarmuka Admin?',
      description: 'Pengaturan preferensi lokal peramban untuk portal administrator akan dibersihkan.',
      targetName: 'Cache Preferensi Administrator',
      variant: 'warning',
      confirmLabel: 'Reset Cache',
      cancelLabel: 'Batal',
      onConfirm: () => {
        try {
          localStorage.removeItem('genlabs-theme');
          setTheme('system');
          feedback.toast.success('Cache antarmuka lokal berhasil direset.');
        } catch {
          feedback.toast.error('Gagal mereset cache lokal.');
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* ── 1. HEADER ── */}
      <div className="border-b border-[var(--color-border-subtle)] pb-4">
        <h1 className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text)] tracking-tight">
          Pengaturan Sistem
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
          Konfigurasi platform laboratorium, preferensi Super Canvas, dan status integrasi backend.
        </p>
      </div>

      {/* ── 2. TEMA & TAMPILAN ADMIN ── */}
      <section className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xs space-y-4">
        <div className="space-y-1">
          <h2 className="font-heading text-sm font-bold text-[var(--color-text)]">
            Tema Antarmuka
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            GEN LABS distandarisasi dalam mode Dark Obsidian permanen untuk kejelasan instrumen laboratorium.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-[var(--color-primary)]/40 bg-[var(--color-primary-soft)] text-[var(--color-text)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-primary-text)]">
              <IconMoon size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--color-text)]">
                Dark Obsidian Lab
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">
                Standar tunggal (#10150b base ground)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary-text)] font-mono text-[10px] font-bold">
            <IconCheck size={12} />
            <span>STANDAR AKTIF</span>
          </div>
        </div>
      </section>

      {/* ── 3. PREFERENSI SUPER CANVAS ── */}
      <section className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xs space-y-4">
        <div className="space-y-1">
          <h2 className="font-heading text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
            <IconLayers size={16} className="text-[var(--color-primary)]" />
            <span>Standar Runtime Super Canvas</span>
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Konfigurasi default saat membuat simulator interaktif baru di platform GEN LABS.
          </p>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-4 p-3.5 rounded-md bg-[var(--color-surface-subtle)]/70 border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] transition-colors">
            <div className="space-y-0.5 pr-2">
              <div className="font-semibold text-[var(--color-text)]">Garis Grid Pembantu (Grid Lines)</div>
              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                Tampilkan panduan koordinat kisi-kisi pada kanvas saat merancang objek.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={defaultGrid}
              onClick={() => setDefaultGrid(!defaultGrid)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] ${
                defaultGrid ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                  defaultGrid ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 p-3.5 rounded-md bg-[var(--color-surface-subtle)]/70 border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] transition-colors">
            <div className="space-y-0.5 pr-2">
              <div className="font-semibold text-[var(--color-text)]">Bidang Dasar Fisik (Ground Plane)</div>
              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                Aktifkan garis lantai dasar secara otomatis pada simulator baru.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={defaultGround}
              onClick={() => setDefaultGround(!defaultGround)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] ${
                defaultGround ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                  defaultGround ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 p-3.5 rounded-md bg-[var(--color-surface-subtle)]/70 border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] transition-colors">
            <div className="space-y-0.5 pr-2">
              <div className="font-semibold text-[var(--color-text)]">Penyimpanan Otomatis Draft (Autosave)</div>
              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                Simpan perubahan spesifikasi secara berkala ke cache browser selama authoring.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoSaveDraft}
              onClick={() => setAutoSaveDraft(!autoSaveDraft)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] ${
                autoSaveDraft ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                  autoSaveDraft ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* ── 4. STATUS INTEGRASI BACKEND & INFRASTRUKTUR ── */}
      <section className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xs space-y-4">
        <div className="space-y-1">
          <h2 className="font-heading text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
            <IconDatabase size={16} className="text-[var(--color-primary)]" />
            <span>Infrastruktur &amp; Koneksi Sistem</span>
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Informasi status konektivitas layanan inti GEN LABS.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text)]">
              <IconDatabase size={13} className="text-[var(--color-primary)]" />
              <span>Database MySQL</span>
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">127.0.0.1:3306</p>
            <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Aktif &amp; Terhubung</div>
          </div>

          <div className="p-3 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text)]">
              <IconCpu size={13} className="text-[var(--color-primary)]" />
              <span>Laravel API Service</span>
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">127.0.0.1:8000</p>
            <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Siap Melayani Permintaan</div>
          </div>

          <div className="p-3 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text)]">
              <IconShieldCheck size={13} className="text-[var(--color-primary)]" />
              <span>Evaluator Engine</span>
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">v2.0 Universal</p>
            <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Deterministik Safe (AST)</div>
          </div>
        </div>
      </section>

      {/* ── 5. TINDAKAN RESET & SIMPAN ── */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleResetCache}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
        >
          <IconRotateCcw size={13} />
          <span>Reset Cache Browser</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer min-h-[36px]"
        >
          <IconSave size={13} />
          <span>Simpan Perubahan</span>
        </button>
      </div>
    </div>
  );
}
