'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { IconArrowRight } from '@/components/icons';
import { modulesApi, ModuleModel } from '@/lib/api/modules';
import { sessionsApi, LearningSessionModel } from '@/lib/api/sessions';
import { LoadingState } from '@/components/ui/loading-state';
import { ProductEmoji, ProductEmojiName } from '@/components/ui/product-emoji';

function getDisciplineEmoji(discipline: string): ProductEmojiName {
  const d = discipline.toLowerCase();
  if (d.includes('fisika')) return 'physics';
  if (d.includes('matematika')) return 'math';
  if (d.includes('kimia')) return 'chemistry';
  if (d.includes('komputer') || d.includes('informatika') || d.includes('trpl')) return 'informatics';
  if (d.includes('ekonomi')) return 'economics';
  if (d.includes('statistika')) return 'bar_chart';
  return 'telescope';
}

export default function AnalyticsPage() {
  const [modules, setModules] = useState<ModuleModel[]>([]);
  const [sessions, setSessions] = useState<LearningSessionModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      modulesApi.list().catch(() => ({ success: false, modules: [] })),
      sessionsApi.list().catch(() => ({ success: false, sessions: [] })),
    ])
      .then(([modRes, sessRes]) => {
        if (!isMounted) return;
        if (modRes.success && modRes.modules) {
          setModules(modRes.modules);
        }
        if (sessRes.success && sessRes.sessions) {
          setSessions(sessRes.sessions);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute metrics dynamically from real database records
  const stats = useMemo(() => {
    const totalModules = modules.length;
    const completedSessions = sessions.filter(
      (s) => (s.progress ?? 0) >= 100 || !!s.completed_at
    );
    const completedCount = completedSessions.length;
    const completionPercent =
      totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
    const activeSessions = sessions.filter(
      (s) => (s.progress ?? 0) < 100 && !s.completed_at
    ).length;

    const avgProgress =
      sessions.length > 0
        ? Math.round(
            sessions.reduce((acc, s) => acc + (s.progress ?? 0), 0) /
              sessions.length
          )
        : 0;

    return {
      totalModules,
      completedCount,
      completionPercent,
      totalSessions: sessions.length,
      activeSessions,
      avgProgress,
    };
  }, [modules, sessions]);

  // Discipline breakdown
  const disciplineBreakdown = useMemo(() => {
    const map = new Map<string, { discipline: string; total: number; completed: number }>();

    modules.forEach((m) => {
      const disc = m.discipline || 'Sains';
      if (!map.has(disc)) {
        map.set(disc, { discipline: disc, total: 0, completed: 0 });
      }
      map.get(disc)!.total += 1;
    });

    sessions.forEach((s) => {
      const disc = s.module?.discipline || s.discipline || 'Sains';
      const isDone = (s.progress ?? 0) >= 100 || !!s.completed_at;
      if (isDone && map.has(disc)) {
        map.get(disc)!.completed = Math.min(
          map.get(disc)!.total,
          map.get(disc)!.completed + 1
        );
      }
    });

    return Array.from(map.values()).map((item) => {
      const percent =
        item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
      return {
        ...item,
        percent,
      };
    });
  }, [modules, sessions]);

  return (
    <div className="max-w-[1260px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 space-y-10 sm:space-y-12">
      {/* ── 1. PAGE HEADING ── */}
      <div className="space-y-1.5 border-b border-[var(--color-border-subtle)] pb-6">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-[#152B1E] border border-[#2D4C38] font-mono text-[10px] font-bold text-[var(--color-primary-accent)] tracking-wider uppercase">
            TELEMETRI PEMBELAJARAN
          </span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text)] tracking-tight">
          Analisis & Kemajuan Belajar
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
          Ringkasan aktivitas percobaan, penguasaan bidang sains, dan eksplorasi simulator interaktif.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Menghitung metrik pembelajaran..." rows={4} />
      ) : (
        <>
          {/* ── 2. METRIC BLOCKS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-2xs hover:border-[var(--color-border-strong)] transition-all group">
              <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                <span className="font-mono text-xs font-semibold">Modul Selesai</span>
                <div className="p-1 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] icon-3d-interactive">
                  <ProductEmoji name="graduation_cap" size={28} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-[var(--color-text)] tabular-nums tracking-tight">
                {stats.completedCount} <span className="text-sm font-normal text-[var(--color-text-secondary)]">/ {stats.totalModules}</span>
              </div>
              <span className="text-[11px] font-mono font-semibold text-[var(--color-primary-text)] block">
                {stats.completionPercent}% Kurikulum
              </span>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-2xs hover:border-[var(--color-border-strong)] transition-all group">
              <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                <span className="font-mono text-xs font-semibold">Total Sesi</span>
                <div className="p-1 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] icon-3d-interactive">
                  <ProductEmoji name="zap" size={28} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-[var(--color-text)] tabular-nums tracking-tight">
                {stats.totalSessions}
              </div>
              <span className="text-[11px] font-mono text-[var(--color-text-tertiary)] block">
                {stats.activeSessions} sesi aktif
              </span>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-2xs hover:border-[var(--color-border-strong)] transition-all group">
              <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                <span className="font-mono text-xs font-semibold">Rata-rata Progres</span>
                <div className="p-1 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] icon-3d-interactive">
                  <ProductEmoji name="bar_chart" size={28} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-[var(--color-text)] tabular-nums tracking-tight">
                {stats.avgProgress}%
              </div>
              <span className="text-[11px] font-mono text-[var(--color-text-tertiary)] block">
                Pemahaman empiris
              </span>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-2xs hover:border-[var(--color-border-strong)] transition-all group">
              <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                <span className="font-mono text-xs font-semibold">Katalog Modul</span>
                <div className="p-1 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] icon-3d-interactive">
                  <ProductEmoji name="books" size={28} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-[var(--color-text)] tabular-nums tracking-tight">
                {stats.totalModules}
              </div>
              <span className="text-[11px] font-mono text-[var(--color-text-tertiary)] block">
                Simulator interaktif
              </span>
            </div>
          </div>

          {/* ── 3. DISCIPLINE PROGRESS BREAKDOWN ── */}
          <section className="space-y-4 pt-4 border-t border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text)] tracking-tight">
                Kemajuan per Bidang Ilmu
              </h2>
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--color-primary-accent)] hover:underline"
              >
                <span>Buka Seluruh Modul</span>
                <IconArrowRight size={13} />
              </Link>
            </div>

            <div className="divide-y divide-[var(--color-border-subtle)] rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 sm:p-6 shadow-2xs">
              {disciplineBreakdown.map((item) => (
                <div key={item.discipline} className="py-4 first:pt-0 last:pb-0 space-y-2.5">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <ProductEmoji name={getDisciplineEmoji(item.discipline)} size={18} />
                      <span className="font-heading font-bold text-[var(--color-text)]">{item.discipline}</span>
                    </div>
                    <span className="font-mono text-xs text-[var(--color-text-secondary)]">
                      <strong className="text-[var(--color-text)]">{item.completed}</strong> dari {item.total} modul ({item.percent}%)
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-[var(--color-surface-subtle)] rounded-full overflow-hidden border border-[var(--color-border-subtle)]">
                    <div
                      className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.max(item.percent, 3)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
