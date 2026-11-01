'use client';

import React from 'react';

interface LoadingStateProps {
  message?: string;
  rows?: number;
  className?: string;
}

export function LoadingState({
  message = 'Memuat data...',
  rows = 3,
  className = '',
}: LoadingStateProps) {
  return (
    <div
      className={`py-12 sm:py-16 px-4 max-w-lg mx-auto space-y-4 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)]">
          {message}
        </span>
      </div>

      <div className="space-y-2.5 pt-2">
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="h-12 bg-[var(--color-surface-subtle)] rounded-md animate-pulse"
            style={{ opacity: 1 - idx * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonBox({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-[var(--color-surface-subtle)] rounded-md animate-pulse ${className}`} />
  );
}
