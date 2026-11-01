'use client';

import React from 'react';
import { IconLoader } from '@/components/icons';

interface AiThinkingStateProps {
  variant?: 'inline' | 'card';
  message?: string;
  className?: string;
}

export function AiThinkingState({
  variant = 'inline',
  message,
  className = '',
}: AiThinkingStateProps) {
  const label = message || 'Menganalisis parameter simulasi...';

  if (variant === 'card') {
    return (
      <div
        className={`p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-subtle)] flex items-center gap-3 transition-colors ${className}`}
        role="status"
        aria-live="polite"
      >
        <IconLoader size={14} className="text-[var(--color-secondary)] animate-spin shrink-0" aria-hidden="true" />
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-medium">
          {label}
        </p>
      </div>
    );
  }

  // Inline chat variant (for tutor chat streams)
  return (
    <div
      className={`px-3.5 py-2.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] text-[var(--color-text)] flex items-center gap-2.5 shadow-2xs ${className}`}
      role="status"
      aria-live="polite"
    >
      <IconLoader size={13} className="text-[var(--color-secondary)] animate-spin shrink-0" aria-hidden="true" />
      <span className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-medium">
        {label}
      </span>
    </div>
  );
}
