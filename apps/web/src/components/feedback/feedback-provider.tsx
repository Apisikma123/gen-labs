'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  FeedbackContextValue,
  FeedbackVariant,
  ToastItemData,
  ToastMethods,
  ConfirmDialogOptions,
  AlertDialogOptions,
} from './feedback-types';
import { ToastContainer } from './toast-container';
import { ConfirmDialog } from './confirm-dialog';
import { AlertDialog } from './alert-dialog';

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const MAX_TOASTS = 4;
const DEDUPE_WINDOW_MS = 1500;

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  // ── 1. TOAST STATE ──
  const [toasts, setToasts] = useState<ToastItemData[]>([]);
  const lastToastRef = useRef<{ message: string; timestamp: number } | null>(null);

  const addToast = useCallback(
    (
      variant: FeedbackVariant,
      message: string,
      title?: string,
      duration: number = variant === 'error' ? 7000 : 4500
    ): string => {
      // Anti-duplicate spam filter
      const now = Date.now();
      if (
        lastToastRef.current &&
        lastToastRef.current.message === message &&
        now - lastToastRef.current.timestamp < DEDUPE_WINDOW_MS
      ) {
        return '';
      }
      lastToastRef.current = { message, timestamp: now };

      const id = `toast-${now}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItemData = {
        id,
        variant,
        message,
        title,
        duration,
        createdAt: now,
      };

      setToasts((prev) => [newToast, ...prev].slice(0, MAX_TOASTS));
      return id;
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const toastMethods: ToastMethods = {
    success: useCallback(
      (msg, title, dur) => addToast('success', msg, title, dur),
      [addToast]
    ),
    error: useCallback(
      (msg, title, dur) => addToast('error', msg, title, dur),
      [addToast]
    ),
    warning: useCallback(
      (msg, title, dur) => addToast('warning', msg, title, dur),
      [addToast]
    ),
    info: useCallback(
      (msg, title, dur) => addToast('info', msg, title, dur),
      [addToast]
    ),
    dismiss: dismissToast,
    dismissAll: dismissAllToasts,
  };

  // ── 2. CONFIRM DIALOG STATE & PROMISE ──
  const [confirmOptions, setConfirmOptions] = useState<ConfirmDialogOptions | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const confirmResolverRef = useRef<((val: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      confirmResolverRef.current = resolve;
      setConfirmOptions(options);
      setIsConfirmOpen(true);
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setConfirmOptions(null);
  }, []);

  const handleConfirmResolved = useCallback((result: boolean) => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(result);
      confirmResolverRef.current = null;
    }
  }, []);

  // ── 3. ALERT DIALOG STATE & PROMISE ──
  const [alertOptions, setAlertOptions] = useState<AlertDialogOptions | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const alertResolverRef = useRef<(() => void) | null>(null);

  const alert = useCallback((options: AlertDialogOptions): Promise<void> => {
    return new Promise((resolve) => {
      alertResolverRef.current = resolve;
      setAlertOptions(options);
      setIsAlertOpen(true);
    });
  }, []);

  const closeAlert = useCallback(() => {
    setIsAlertOpen(false);
    setAlertOptions(null);
  }, []);

  const handleAlertResolved = useCallback(() => {
    if (alertResolverRef.current) {
      alertResolverRef.current();
      alertResolverRef.current = null;
    }
  }, []);

  return (
    <FeedbackContext.Provider
      value={{
        toast: toastMethods,
        confirm,
        alert,
        closeConfirm,
        closeAlert,
      }}
    >
      {children}

      {/* Global Toast Layer */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Global Confirmation Dialog Layer */}
      <ConfirmDialog
        options={confirmOptions}
        isOpen={isConfirmOpen}
        onClose={closeConfirm}
        onResolved={handleConfirmResolved}
      />

      {/* Global Alert Dialog Layer */}
      <AlertDialog
        options={alertOptions}
        isOpen={isAlertOpen}
        onClose={closeAlert}
        onResolved={handleAlertResolved}
      />
    </FeedbackContext.Provider>
  );
}

/**
 * Main hook to access the unified global feedback system
 */
export function useFeedback(): FeedbackContextValue {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return ctx;
}

/**
 * Convenient shortcut hook for toast notifications
 */
export function useToast(): ToastMethods {
  return useFeedback().toast;
}
