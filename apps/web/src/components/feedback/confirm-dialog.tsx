'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  IconLoader,
  IconClose,
  IconAlertCircle,
} from '@/components/icons';
import {
  Icon3dLockSecure,
  Icon3dBellAlert,
  Icon3dVerifiedEquilibrium,
} from '@/components/icons/3d';
import { ConfirmDialogOptions } from './feedback-types';

interface ConfirmDialogProps {
  options: ConfirmDialogOptions | null;
  isOpen: boolean;
  onClose: () => void;
  onResolved: (result: boolean) => void;
}

export function ConfirmDialog({
  options,
  isOpen,
  onClose,
  onResolved,
}: ConfirmDialogProps) {
  const [typedPhrase, setTypedPhrase] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const phraseInputRef = useRef<HTMLInputElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Reset state whenever options change or modal opens
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setTypedPhrase('');
      setIsSubmitting(false);
      setErrorMessage(null);

      // Focus appropriate element
      setTimeout(() => {
        if (options?.requirePhrase && phraseInputRef.current) {
          phraseInputRef.current.focus();
        } else if (cancelBtnRef.current) {
          cancelBtnRef.current.focus();
        }
      }, 50);
    } else {
      // Restore focus on close
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen, options]);

  // Keyboard navigation & Focus trap
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        e.preventDefault();
        handleCancel();
        return;
      }

      // Trap focus
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSubmitting, options]
  );

  if (!isOpen || !options) return null;

  const {
    title,
    description,
    targetName,
    variant = 'danger',
    confirmLabel,
    cancelLabel = 'Batal',
    requirePhrase = false,
    confirmationPhrase = 'HAPUS',
    phrasePrompt,
    onConfirm,
    onCancel,
  } = options;

  const isPhraseMatched = !requirePhrase || typedPhrase.trim() === confirmationPhrase.trim();

  const handleCancel = () => {
    if (isSubmitting) return;
    if (onCancel) onCancel();
    onResolved(false);
    onClose();
  };

  const handleConfirm = async () => {
    if (!isPhraseMatched || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onConfirm();
      onResolved(true);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err instanceof Error && err.message) ||
        (typeof err === 'string' && err) ||
        'Tindakan belum berhasil dijalankan. Silakan periksa koneksi dan coba lagi.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Variant 3D icons
  const variant3dIcons = {
    danger: Icon3dLockSecure,
    warning: Icon3dBellAlert,
    primary: Icon3dVerifiedEquilibrium,
  };
  const Icon3dComponent = variant3dIcons[variant];

  const confirmBtnClass = {
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-2 focus:ring-rose-500/30',
    warning:
      'bg-amber-600 hover:bg-amber-700 text-white shadow-xs focus:ring-2 focus:ring-amber-500/30',
    primary:
      'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-xs focus:ring-2 focus:ring-[var(--color-primary)]/30',
  }[variant];

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
        }}
        className="w-full max-w-md rounded-xl border shadow-floating overflow-hidden animate-in zoom-in-95 duration-150"
      >
        <div className="p-5 sm:p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3.5">
            <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface-subtle)] shadow-xs">
              <Icon3dComponent size={28} />
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h2
                id="confirm-dialog-title"
                style={{ color: 'var(--color-text)' }}
                className="font-heading text-base sm:text-lg font-bold tracking-tight leading-snug"
              >
                {title}
              </h2>
              <p
                id="confirm-dialog-desc"
                style={{ color: 'var(--color-text-secondary)' }}
                className="text-xs sm:text-sm mt-1 leading-relaxed"
              >
                {description}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              aria-label="Tutup dialog"
              style={{ color: 'var(--color-text-tertiary)' }}
              className="shrink-0 p-1 rounded-md hover:opacity-80 transition-colors cursor-pointer disabled:opacity-50"
            >
              <IconClose size={16} />
            </button>
          </div>

          {/* Target Name highlighted badge */}
          {targetName && (
            <div
              style={{
                backgroundColor: 'var(--color-surface-subtle)',
                borderColor: 'var(--color-border-subtle)',
              }}
              className="p-3 rounded-md border"
            >
              <span
                style={{ color: 'var(--color-text-tertiary)' }}
                className="text-[10px] font-sans uppercase tracking-wider block font-semibold mb-0.5"
              >
                Target Sumber Daya:
              </span>
              <p
                style={{ color: 'var(--color-text)' }}
                className="font-heading text-xs font-semibold break-all"
              >
                {targetName}
              </p>
            </div>
          )}

          {/* Typed confirmation input for high-risk actions */}
          {requirePhrase && (
            <div className="p-3.5 rounded-md bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/20 space-y-2">
              <label
                htmlFor="confirm-phrase-input"
                style={{ color: 'var(--color-text)' }}
                className="block text-xs font-medium leading-relaxed"
              >
                {phrasePrompt || (
                  <>
                    Ketik kata <strong className="font-mono text-rose-600 dark:text-rose-400 font-bold tracking-wider">{confirmationPhrase}</strong> untuk melanjutkan:
                  </>
                )}
              </label>
              <input
                id="confirm-phrase-input"
                ref={phraseInputRef}
                type="text"
                value={typedPhrase}
                onChange={(e) => setTypedPhrase(e.target.value)}
                disabled={isSubmitting}
                placeholder={`Ketik ${confirmationPhrase}...`}
                autoComplete="off"
                spellCheck={false}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
                className="w-full px-3 py-2 text-xs font-mono rounded-md border placeholder:opacity-50 outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          )}

          {/* In-dialog Error alert if onConfirm threw an exception */}
          {errorMessage && (
            <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-100">
              <IconAlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-subtle)',
            borderColor: 'var(--color-border-subtle)',
          }}
          className="p-4 sm:p-5 border-t flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5"
        >
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-md border text-xs font-semibold hover:opacity-85 transition-opacity cursor-pointer min-h-[44px] disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            ref={confirmBtnRef}
            type="button"
            onClick={handleConfirm}
            disabled={!isPhraseMatched || isSubmitting}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-md text-xs font-semibold transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-2 ${confirmBtnClass} ${
              !isPhraseMatched || isSubmitting ? 'opacity-45 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <IconLoader size={14} className="animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>{confirmLabel || (variant === 'danger' ? 'Hapus Permanen' : 'Konfirmasi')}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
