'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { aiApi, AiUsageModel } from '@/lib/api/ai';
import { Icon3dAiCredit } from '@/components/icons';

export interface AiUsageBadgeProps {
  refreshTrigger?: number;
  onUsageLoaded?: (usage: AiUsageModel) => void;
  className?: string;
  variant?: 'pill' | 'compact' | 'card' | 'tag';
}

const QUOTA_STORAGE_KEY = 'genlabs_cached_ai_quota';

export function AiUsageBadge({
  refreshTrigger,
  onUsageLoaded,
  className = '',
  variant = 'pill',
}: AiUsageBadgeProps) {
  const [usage, setUsage] = useState<AiUsageModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onUsageLoadedRef = useRef(onUsageLoaded);
  onUsageLoadedRef.current = onUsageLoaded;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUOTA_STORAGE_KEY);
      if (raw) {
        setUsage(JSON.parse(raw) as AiUsageModel);
      }
    } catch {}
  }, []);

  const fetchUsage = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await aiApi.getUsage();
      setUsage(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(data));
      }
      if (onUsageLoadedRef.current) {
        onUsageLoadedRef.current(data);
      }
    } catch {
      // Unauthenticated or network error — fail quietly
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage, refreshTrigger]);

  // Global event listener: updates credit badge immediately whenever AI is queried anywhere in the app
  useEffect(() => {
    const handleGlobalQuotaUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<AiUsageModel>;
      if (customEvent.detail && typeof customEvent.detail.remaining === 'number') {
        const detail = customEvent.detail;
        queueMicrotask(() => {
          setUsage(detail);
          if (typeof window !== 'undefined') {
            localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(detail));
          }
          if (onUsageLoadedRef.current) {
            onUsageLoadedRef.current(detail);
          }
        });
      } else {
        fetchUsage();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('genlabs_ai_quota_updated', handleGlobalQuotaUpdate);
      return () => {
        window.removeEventListener('genlabs_ai_quota_updated', handleGlobalQuotaUpdate);
      };
    }
  }, [fetchUsage]);

  if (!usage) {
    if (isLoading) {
      if (variant === 'tag') {
        return (
          <span className={`inline-flex items-center gap-1 text-[10px] font-mono text-[var(--color-text-tertiary)] px-2 py-0.5 rounded-full bg-[var(--color-surface-subtle)] ${className}`}>
            <Icon3dAiCredit size={12} className="opacity-40 animate-pulse shrink-0" />
            <span>...</span>
          </span>
        );
      }
      return (
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--color-text-tertiary)] bg-[var(--color-surface)] px-3 py-1 rounded-full border border-[var(--color-border)] ${className}`}>
          <Icon3dAiCredit size={16} className="opacity-40 animate-pulse shrink-0" />
          <span>Memuat...</span>
        </span>
      );
    }
    return null;
  }

  const remaining = usage.remaining;
  const limit = usage.daily_limit || 5;

  // 1. Tag variant (for inside tab buttons, explore header, or inline chips)
  if (variant === 'tag') {
    return (
      <span
        title={`Sisa ${remaining} dari ${limit} pertanyaan hari ini (Reset 00.00 WIB)`}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tabular-nums transition-transform active:scale-95 ${
          remaining === 0
            ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
            : remaining <= 2
            ? 'bg-[#BA8230]/15 text-[#BA8230] border border-[#BA8230]/30'
            : 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] border border-[var(--color-primary)]/20'
        } ${className}`}
      >
        <Icon3dAiCredit size={14} className="shrink-0 drop-shadow-2xs" />
        <span>{remaining}/{limit}</span>
      </span>
    );
  }

  // 2. Compact variant (for navbar, app-header, action bars)
  if (variant === 'compact') {
    return (
      <Link
        href="/profile"
        title={`Kredit AI Tutor: ${remaining} dari ${limit} pertanyaan hari ini (Reset otomatis 00.00 WIB)`}
        className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer shadow-2xs select-none active:scale-95 group min-h-[36px] ${
          remaining === 0
            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/40 hover:bg-amber-500/15'
            : remaining <= 2
            ? 'bg-[#BA8230]/10 text-[#BA8230] border border-[#BA8230]/40 hover:bg-[#BA8230]/15'
            : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-primary)]'
        } ${className}`}
      >
        <Icon3dAiCredit
          size={18}
          className="shrink-0 drop-shadow-xs group-hover:scale-110 transition-transform"
        />
        <span className="tabular-nums font-bold text-xs">
          {remaining}/{limit}
        </span>
        <span className="hidden sm:inline font-sans text-[11px] text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)] transition-colors">
          Kredit AI
        </span>
      </Link>
    );
  }

  // 3. Card variant (for profile page and user menu popovers)
  if (variant === 'card') {
    return (
      <div className={`p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1C332A] flex items-center justify-center border border-[#2A4D3F] shrink-0">
              <Icon3dAiCredit size={26} className="shrink-0 drop-shadow-xs" />
            </div>
            <div>
              <h4 className="font-heading font-semibold text-xs sm:text-sm text-[var(--color-text)]">
                Kredit AI Tutor
              </h4>
              <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">
                {limit} pertanyaan / hari
              </p>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`text-sm sm:text-base font-mono font-bold tabular-nums ${
                remaining === 0 ? 'text-amber-500' : 'text-[var(--color-primary-text)]'
              }`}
            >
              {remaining} / {limit}
            </span>
            <span className="block text-[10px] text-[var(--color-text-secondary)] uppercase font-mono">
              Tersedia
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-[var(--color-surface-subtle)] overflow-hidden border border-[var(--color-border-subtle)]">
          <div
            className={`h-full transition-all duration-300 ${
              remaining === 0
                ? 'bg-amber-500'
                : remaining <= 2
                ? 'bg-[#BA8230]'
                : 'bg-[#4B8F8C]'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, (remaining / limit) * 100))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-text-secondary)] pt-1 border-t border-[var(--color-border-subtle)]">
          <span>Reset otomatis pukul 00.00 WIB</span>
          <span className="font-semibold text-[var(--color-text)]">
            {remaining === 0 ? 'Kuota Habis' : `Sisa ${remaining} Tanya`}
          </span>
        </div>
      </div>
    );
  }

  // 4. Default Pill variant (for simulation deck header)
  if (remaining === 0) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-mono font-semibold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/40 ${className}`}>
        <Icon3dAiCredit size={14} className="shrink-0 drop-shadow-2xs" />
        <span>Kuota habis (0/{limit}) / Reset 00.00 WIB</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-mono font-medium text-[var(--color-primary-text)] bg-[var(--color-primary-soft)] px-3 py-1 rounded-full border border-[var(--color-primary)]/30 ${className}`}>
      <Icon3dAiCredit size={15} className="shrink-0 drop-shadow-2xs" />
      <span>Sisa {remaining} dari {limit} pertanyaan hari ini</span>
    </span>
  );
}

export default AiUsageBadge;
