'use client';

import React from 'react';
import { IconChevronLeft, IconChevronRight } from '@/components/icons';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemName?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemName = 'Simulasi',
  className = '',
}: PaginationProps) {
  if (totalItems <= 0 || totalPages <= 1) {
    return null;
  }

  const from = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const to = Math.min(currentPage * pageSize, totalItems);

  // Compute page numbers to show on desktop
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    pages.push(totalPages);
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      aria-label="Navigasi Halaman"
      className={`pt-6 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      {/* ── 1. ITEM COUNT SUMMARY ── */}
      <div className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-medium text-center sm:text-left order-2 sm:order-1">
        <span>
          Menampilkan <span className="font-semibold text-[var(--color-text)]">{itemName} {from}–{to}</span> dari{' '}
          <span className="font-semibold text-[var(--color-text)]">{totalItems}</span> total
        </span>
      </div>

      {/* ── 2. DESKTOP PAGINATION CONTROLS ── */}
      <div className="hidden sm:flex items-center gap-1.5 order-1 sm:order-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-xs font-semibold text-[var(--color-text)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer min-h-[36px]"
          aria-label="Halaman sebelumnya"
        >
          <IconChevronLeft size={14} />
          <span>Sebelumnya</span>
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-xs text-[var(--color-text-tertiary)] select-none"
                >
                  …
                </span>
              );
            }

            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[36px] h-9 px-2 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white shadow-2xs'
                    : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-xs font-semibold text-[var(--color-text)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer min-h-[36px]"
          aria-label="Halaman berikutnya"
        >
          <span>Berikutnya</span>
          <IconChevronRight size={14} />
        </button>
      </div>

      {/* ── 3. MOBILE PAGINATION CONTROLS (COMPACT & TOUCH-OPTIMIZED) ── */}
      <div className="flex sm:hidden items-center justify-between w-full gap-2 order-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-text)] disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
        >
          <IconChevronLeft size={16} />
          <span>Sebelumnya</span>
        </button>

        <span className="text-xs font-medium text-[var(--color-text-secondary)] whitespace-nowrap px-2">
          Hal <span className="font-bold text-[var(--color-text)]">{currentPage}</span> dari{' '}
          <span className="font-bold text-[var(--color-text)]">{totalPages}</span>
        </span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-text)] disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
        >
          <span>Berikutnya</span>
          <IconChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
