'use client';

import React from 'react';
import Link from 'next/link';
import { ProductEmoji, ProductEmojiName } from '@/components/ui/product-emoji';
import { LabBenchEmptyStateGraphic } from '@/components/illustrations';
import { GenIconTile, GenIconName } from '@/components/icons';
import { Icon3d, Icon3dName } from '@/components/icons/3d';
import { Lottie3DIcon, Lottie3DName } from '@/components/ui/lottie-3d-icon';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: GenIconName | string;
  icon3d?: Icon3dName;
  emoji?: ProductEmojiName;
  lottieName?: Lottie3DName;
  illustration?: React.ReactNode;
  discipline?: string;
  className?: string;
}

export function EmptyState({
  title = 'Belum ada data.',
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
  icon3d,
  emoji,
  lottieName,
  illustration,
  discipline,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`py-10 sm:py-14 px-4 text-center max-w-md mx-auto space-y-4 ${className}`}
      role="status"
    >
      {illustration ? (
        <div className="mb-3">{illustration}</div>
      ) : icon3d ? (
        <div className="mb-2 flex justify-center">
          <div className="p-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
            <Icon3d name={icon3d} size={48} />
          </div>
        </div>
      ) : icon ? (
        <div className="mb-2 flex justify-center">
          <GenIconTile name={icon} size="xl" />
        </div>
      ) : lottieName ? (
        <div className="mb-2 flex justify-center">
          <div className="p-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
            <Icon3d name={lottieName === 'ai-robot' ? 'ai-core' : lottieName === 'coin' ? 'quant-candlestick' : lottieName === 'atom' ? 'physics-energy' : 'compass-explore'} size={48} />
          </div>
        </div>
      ) : emoji ? (
        <div className="mb-2 flex justify-center">
          <ProductEmoji name={emoji} size={48} />
        </div>
      ) : (
        <div className="mb-2">
          <LabBenchEmptyStateGraphic className="w-48 h-24 mx-auto" discipline={discipline} />
        </div>
      )}
      <div className="space-y-1.5">
        <h3 className="font-heading text-base sm:text-lg font-bold text-[var(--color-text)] tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {(actionLabel && (actionHref || onAction)) && (
        <div className="pt-2">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-hover)] transition-colors min-h-[44px]"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-hover)] transition-colors min-h-[44px] cursor-pointer"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
