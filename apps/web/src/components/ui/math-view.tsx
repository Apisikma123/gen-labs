'use client';

import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathViewProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

/**
 * High-performance, accessible KaTeX equation renderer.
 * Renders mathematical formulas using KaTeX with real dynamic numbers.
 */
export function MathView({ math, displayMode = false, className = '' }: MathViewProps) {
  const cleanMath = useMemo(() => {
    if (!math || typeof math !== 'string') return '';
    return math
      .replace(/\^{2,}/g, '^') // Fix accidental double carets (e.g. ^^+)
      .replace(/\\text\{([A-Za-z0-9]+)\}\^([+\-0-9]+)/g, '\\text{$1}^{$2}') // Fix superscripts on text
      .trim();
  }, [math]);

  const html = useMemo(() => {
    if (!cleanMath) return null;
    try {
      const rendered = katex.renderToString(cleanMath, {
        displayMode,
        throwOnError: false,
        output: 'html',
      });
      // If KaTeX outputs error indicator, fallback to clean text view
      if (rendered.includes('katex-error')) {
        return null;
      }
      return rendered;
    } catch {
      return null;
    }
  }, [cleanMath, displayMode]);

  if (!cleanMath) return null;

  if (!html) {
    if (displayMode) {
      return (
        <div className={`my-3 p-3.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border-subtle)] overflow-x-auto text-center shadow-2xs ${className}`}>
          <span className="font-mono text-xs sm:text-sm text-[var(--color-primary-text)] font-semibold">
            {cleanMath}
          </span>
        </div>
      );
    }
    return (
      <span className={`font-mono text-xs sm:text-sm tracking-wide px-1 py-0.5 rounded-sm bg-[var(--color-surface)] text-[var(--color-primary-text)] font-semibold border border-[var(--color-border-subtle)] ${className}`}>
        {cleanMath}
      </span>
    );
  }

  if (displayMode) {
    return (
      <div className={`my-3 p-3.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border-subtle)] overflow-x-auto text-center shadow-2xs ${className}`}>
        <span
          className="katex-wrapper inline-block max-w-full overflow-x-auto text-[var(--color-text)]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  }

  return (
    <span
      className={`katex-wrapper inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
