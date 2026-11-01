'use client';

import React from 'react';
import { ToastItem } from './toast-item';
import { ToastItemData } from './feedback-types';

interface ToastContainerProps {
  toasts: ToastItemData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Pemberitahuan Sistem"
      className="fixed z-[9999] pointer-events-none bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 flex flex-col items-center sm:items-end gap-2.5 max-h-[85vh] overflow-hidden"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto w-full sm:w-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </aside>
  );
}
