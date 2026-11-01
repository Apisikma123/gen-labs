'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  IconSearch,
  IconActivity as ActivityIcon,
} from '@/components/icons';
import { adminApi, ActivityModel, PaginationMeta } from '@/lib/api/admin';
import { LoadingState } from '@/components/ui/loading-state';

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<ActivityModel[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const load = useCallback(async (s: string, p: number) => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await adminApi.getActivities({ search: s, page: p, per_page: 20 });
      if (res.success) {
        setActivities(res.data);
        setMeta(res.meta);
      } else {
        setFetchError('Gagal memuat log aktivitas dari server.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi ke server simulasi belum terhubung.';
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      load(search, page);
    }, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search, page, load]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-5">
        <div className="space-y-0.5">
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-2">
            <ActivityIcon size={20} className="text-[var(--color-primary)]" />
            Activity Log
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Riwayat aktivitas sistem — pembuatan, publikasi, perubahan simulator, dan pengguna.
          </p>
        </div>

        {meta && (
          <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">
            {meta.total} total
          </span>
        )}
      </div>

      {/* ── SEARCH ── */}
      <div className="relative max-w-sm">
        <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
        <input
          type="text"
          placeholder="Cari aktivitas..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-9 pr-3 py-2.5 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
        />
      </div>

      {/* ── LIST ── */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <LoadingState message="Memuat log aktivitas..." />
        </div>
      ) : fetchError ? (
        <div className="p-8 rounded-xl border border-rose-500/20 bg-rose-500/5 text-center space-y-3">
          <p className="text-xs text-rose-500">{fetchError}</p>
          <button
            type="button"
            onClick={() => load(search, page)}
            className="px-3.5 py-1.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] text-xs text-[var(--color-text)] cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-2xs">
          {activities.length === 0 ? (
            <div className="py-14 text-center text-xs text-[var(--color-text-secondary)]">
              Belum ada riwayat aktivitas tercatat.
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-[var(--color-surface-subtle)]/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[var(--color-text)]">
                          {act.user_name}
                        </span>
                        <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded-sm bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]">
                          {act.role}
                        </span>
                        <span className="text-[var(--color-text-secondary)]">/</span>
                        <span className="font-medium text-[var(--color-primary-text)]">
                          {act.action}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-secondary)]">
                        {act.target}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] text-[var(--color-text-tertiary)] shrink-0 sm:text-right">
                    {new Date(act.created_at).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PAGINATION ── */}
      {meta && meta.last_page > 1 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[var(--color-text-secondary)]">
          <span>
            Halaman {meta.current_page} dari {meta.last_page}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={meta.current_page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] disabled:opacity-40 text-xs cursor-pointer disabled:cursor-default transition-colors"
            >
              ← Sebelumnya
            </button>
            <button
              type="button"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] disabled:opacity-40 text-xs cursor-pointer disabled:cursor-default transition-colors"
            >
              Selanjutnya →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
