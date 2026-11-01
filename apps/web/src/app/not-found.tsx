import Link from 'next/link';
import {
  IconCompass,
  IconHome,
} from '@/components/icons';
import { ProductEmoji } from '@/components/ui/product-emoji';

export const metadata = {
  title: '404 — Halaman Tidak Ditemukan — GEN LABS',
  description: 'Halaman yang Anda tuju tidak ditemukan di platform laboratorium GEN LABS.',
};

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-md w-full p-8 sm:p-10 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm text-center space-y-6">
        {/* Dimensional Telescope Asset */}
        <div className="w-20 h-20 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] mx-auto flex items-center justify-center shadow-2xs">
          <ProductEmoji name="telescope" size={48} />
        </div>

        {/* Status & Message */}
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-secondary)] px-2.5 py-1 rounded-md bg-[var(--color-secondary-soft)] border border-[var(--color-secondary)]/20">
            KODE KESALAHAN 404
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text)] pt-2">
            Koordinat Tidak Ditemukan
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Rute atau modul laboratorium yang Anda cari tidak tersedia, sedang dalam pembaruan instrumen, atau tautan telah berpindah.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/app"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-xs min-h-[44px] active:scale-95"
          >
            <IconHome size={14} />
            <span>Beranda Lab</span>
          </Link>

          <Link
            href="/app"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text)] text-xs font-mono font-bold transition-all cursor-pointer min-h-[44px] active:scale-95"
          >
            <IconCompass size={14} />
            <span>Katalog Simulasi</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
