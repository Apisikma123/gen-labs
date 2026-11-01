'use client';

import React from 'react';
import { IconAlertCircle, IconRotateCcw } from '@/components/icons';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Modul belum dapat dimuat.',
  message = 'Terjadi kendala saat menghubungkan ke database server. Silakan coba lagi.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`py-12 sm:py-16 px-4 text-center max-w-md mx-auto space-y-3 ${className}`}
      role="alert"
    >
      <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-error)] mx-auto flex items-center justify-center border border-[var(--color-error)]/20">
        <IconAlertCircle size={20} />
      </div>
      <h3 className="font-heading text-base sm:text-lg font-semibold text-[var(--color-text)] tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary-text)] transition-colors min-h-[44px] cursor-pointer"
          >
            <IconRotateCcw size={14} />
            <span>Coba lagi</span>
          </button>
        </div>
      )}
    </div>
  );
}
