'use client';

import React from 'react';
import Link from 'next/link';
import { GenLabsLogo } from '@/components/ui/gen-labs-logo';

export function Footer() {
  const y = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)]/80 backdrop-blur-md py-6 px-4 sm:px-6 mb-16 md:mb-0 transition-colors">
      <div className="max-w-[1260px] mx-auto px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--color-text-secondary)]">
        <div className="flex items-center gap-2.5">
          <GenLabsLogo variant="horizontal" size={18} />
          <span className="text-[var(--color-text-tertiary)]">/</span>
          <span>Laboratorium Virtual & Simulasi Interaktif</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center font-sans">
          <span>&copy; {y} GEN LABS</span>
          <span className="text-[var(--color-text-tertiary)]">All rights reserved.</span>
          <span className="text-[var(--color-text-tertiary)]">/</span>
          <span>Created by</span>
          <a
            href="https://porto-aga.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--color-text)] hover:text-[var(--color-primary-accent)] underline underline-offset-4 decoration-[var(--color-border)] hover:decoration-[var(--color-primary-accent)] transition-colors cursor-pointer"
          >
            Muhammad Aga Putra
          </a>
        </div>
      </div>
    </footer>
  );
}
