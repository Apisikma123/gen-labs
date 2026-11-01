'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  IconCheckCircle,
  IconAlertCircle,
  IconAlertTriangle,
  IconInfo,
  IconClose,
} from '@/components/icons';
import { ToastItemData } from './feedback-types';

interface ToastItemProps {
  toast: ToastItemData;
  onDismiss: (id: string) => void;
}

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const { id, variant, message, title, duration = 5000, action } = toast;
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (duration <= 0) return;

    if (!isPaused) {
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        onDismiss(id);
      }, remainingTimeRef.current);

      // Smooth progress bar tick
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const currentRemaining = Math.max(0, remainingTimeRef.current - elapsed);
        setProgress((currentRemaining / duration) * 100);
      }, 50);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        clearInterval(interval);
      };
    } else {
      // Record how much time was left when paused
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const elapsedSinceResume = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsedSinceResume);
    }
  }, [id, duration, isPaused, onDismiss]);

  const variantConfig = {
    success: {
      icon: IconCheckCircle,
      iconClass: 'text-emerald-600 dark:text-emerald-400',
      badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      progressClass: 'bg-emerald-600 dark:bg-emerald-400',
      defaultTitle: 'Berhasil',
    },
    error: {
      icon: IconAlertCircle,
      iconClass: 'text-rose-600 dark:text-rose-400',
      badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
      progressClass: 'bg-rose-600 dark:bg-rose-400',
      defaultTitle: 'Terjadi Kesalahan',
    },
    warning: {
      icon: IconAlertTriangle,
      iconClass: 'text-amber-600 dark:text-amber-400',
      badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
      progressClass: 'bg-amber-600 dark:bg-amber-400',
      defaultTitle: 'Perhatian',
    },
    info: {
      icon: IconInfo,
      iconClass: 'text-teal-600 dark:text-teal-400',
      badgeClass: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20',
      progressClass: 'bg-teal-600 dark:bg-teal-400',
      defaultTitle: 'Informasi',
    },
  }[variant];

  const IconComponent = variantConfig.icon;

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)',
      }}
      className="relative overflow-hidden w-full max-w-[420px] rounded-xl border shadow-floating transition-all duration-200 select-none animate-in fade-in slide-in-from-bottom-2 sm:slide-in-from-right-2"
    >
      <div className="p-3.5 sm:p-4 flex items-start gap-3">
        {/* Variant Icon badge */}
        <div
          className={`shrink-0 w-8 h-8 rounded-md flex items-center justify-center border ${variantConfig.badgeClass}`}
        >
          <IconComponent size={17} className={variantConfig.iconClass} />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              style={{ color: 'var(--color-text)' }}
              className="font-heading text-xs font-bold tracking-tight truncate"
            >
              {title || variantConfig.defaultTitle}
            </span>
          </div>
          <p
            style={{ color: 'var(--color-text-secondary)' }}
            className="text-xs leading-relaxed break-words"
          >
            {message}
          </p>

          {/* Optional inline action button */}
          {action && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => {
                  action.onClick();
                  onDismiss(id);
                }}
                className="text-[11px] font-semibold text-[var(--color-primary-text)] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                {action.label}
              </button>
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => onDismiss(id)}
          aria-label="Tutup notifikasi"
          style={{ color: 'var(--color-text-tertiary)' }}
          className="shrink-0 p-1 rounded-sm hover:opacity-80 transition-colors cursor-pointer"
        >
          <IconClose size={14} />
        </button>
      </div>

      {/* Progress bar countdown */}
      {duration > 0 && (
        <div className="w-full h-[2px] bg-[var(--color-border-subtle)] overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ${variantConfig.progressClass}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
