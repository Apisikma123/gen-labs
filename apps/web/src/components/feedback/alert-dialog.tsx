'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import {
  IconClose,
} from '@/components/icons';
import {
  Icon3dVerifiedEquilibrium,
  Icon3dBellAlert,
  Icon3dLockSecure,
  Icon3dCompassExplore,
} from '@/components/icons/3d';
import { AlertDialogOptions } from './feedback-types';

interface AlertDialogProps {
  options: AlertDialogOptions | null;
  isOpen: boolean;
  onClose: () => void;
  onResolved: () => void;
}

export function AlertDialog({
  options,
  isOpen,
  onClose,
  onResolved,
}: AlertDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const actionBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setTimeout(() => {
        actionBtnRef.current?.focus();
      }, 50);
    } else {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleAcknowledge();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options]
  );

  if (!isOpen || !options) return null;

  const {
    title,
    message,
    variant = 'info',
    actionLabel = 'Mengerti',
    onAcknowledge,
  } = options;

  const handleAcknowledge = () => {
    if (onAcknowledge) onAcknowledge();
    onResolved();
    onClose();
  };

  const variantConfig = {
    info: {
      icon: Icon3dCompassExplore,
      badgeClass: 'bg-teal-500/10 border-teal-500/20',
      btnClass: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white',
    },
    success: {
      icon: Icon3dVerifiedEquilibrium,
      badgeClass: 'bg-emerald-500/10 border-emerald-500/20',
      btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    warning: {
      icon: Icon3dBellAlert,
      badgeClass: 'bg-amber-500/10 border-amber-500/20',
      btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    error: {
      icon: Icon3dLockSecure,
      badgeClass: 'bg-rose-500/10 border-rose-500/20',
      btnClass: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
  }[variant];

  const IconComponent = variantConfig.icon;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-desc"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
        }}
        className="w-full max-w-md rounded-xl border shadow-floating overflow-hidden animate-in zoom-in-95 duration-150"
      >
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3.5">
            <div
              className="shrink-0 p-1.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] flex items-center justify-center icon-3d-interactive"
            >
              <IconComponent size={28} />
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h2
                id="alert-dialog-title"
                style={{ color: 'var(--color-text)' }}
                className="font-heading text-base sm:text-lg font-bold tracking-tight leading-snug"
              >
                {title}
              </h2>
              <p
                id="alert-dialog-desc"
                style={{ color: 'var(--color-text-secondary)' }}
                className="text-xs sm:text-sm mt-1.5 leading-relaxed"
              >
                {message}
              </p>
            </div>

            <button
              type="button"
              onClick={handleAcknowledge}
              aria-label="Tutup dialog"
              style={{ color: 'var(--color-text-tertiary)' }}
              className="shrink-0 p-1 rounded-md hover:opacity-80 transition-colors cursor-pointer"
            >
              <IconClose size={16} />
            </button>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-surface-subtle)',
            borderColor: 'var(--color-border-subtle)',
          }}
          className="p-4 sm:p-5 border-t flex items-center justify-end"
        >
          <button
            ref={actionBtnRef}
            type="button"
            onClick={handleAcknowledge}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-md text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${variantConfig.btnClass}`}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
