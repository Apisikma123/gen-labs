'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  IconSearch,
  IconExternalLink,
  IconEdit,
  IconTrash,
  IconMoreVertical,
} from '@/components/icons';
import { ACTIVE_SIMULATION_CATALOG } from '@genlab/simulation-core';
import { modulesApi, ModuleModel, PaginationMeta } from '@/lib/api/modules';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { useFeedback } from '@/components/feedback';

const DISCIPLINES_FILTER = [
  { id: 'all', label: 'Semua Bidang', filterKey: '' },
  { id: 'trpl', label: 'Teknologi Komputer', filterKey: 'Perangkat Lunak' },
  { id: 'akuntansi', label: 'Akuntansi & Keuangan', filterKey: 'Akuntansi' },
  { id: 'pemasaran', label: 'Pemasaran & Bisnis', filterKey: 'Pemasaran' },
  { id: 'konvensi', label: 'Manajemen Acara', filterKey: 'Konvensi' },
  { id: 'hortikultura', label: 'Sains Agribisnis', filterKey: 'Agribisnis' },
  { id: 'fisika', label: 'Fisika', filterKey: 'Fisika' },
  { id: 'matematika', label: 'Matematika', filterKey: 'Matematika' },
  { id: 'ekonomi', label: 'Ekonomi', filterKey: 'Ekonomi' },
  { id: 'statistika', label: 'Statistika', filterKey: 'Statistika' },
];

const STATUS_FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'draft', label: 'Draft' },
  { id: 'published', label: 'Published' },
  { id: 'archived', label: 'Archived' },
];

// Convert ACTIVE_SIMULATION_CATALOG to ModuleModel format for catalog parity
const ALL_CATALOG_MODULES: ModuleModel[] = ACTIVE_SIMULATION_CATALOG.map((cat, idx) => {
  const diff: 'basic' | 'intermediate' | 'advanced' =
    cat.difficulty === 'Lanjutan'
      ? 'advanced'
      : cat.difficulty === 'Menengah'
      ? 'intermediate'
      : 'basic';

  return {
    id: idx + 1000,
    slug: cat.slug,
    title: cat.title,
    description: cat.description,
    discipline: cat.discipline,
    difficulty: diff,
    topic: cat.category || cat.discipline,
    estimated_time: '15–20 menit',
    content: cat.description,
    learning_objectives: cat.learningObjectives || [
      'Memahami hubungan sebab-akibat antar parameter sistem.',
      'Mengamati respons dinamis sistem secara realtime.',
      'Menganalisis hasil eksperimen secara mandiri.',
    ],
    target_audience: 'Umum / Pelajar',
    thumbnail_image: null,
    status: 'published' as const,
    updated_at: new Date().toISOString(),
    simulations: [
      {
        id: idx + 1000,
        slug: cat.slug,
        title: cat.title,
        type: cat.engine || 'universal',
        formula: cat.formula,
      },
    ],
  };
});

function AdminModulesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const feedback = useFeedback();
  const initialStatus = (searchParams.get('status') as 'all' | 'published' | 'draft' | 'archived') || 'all';

  const [modules, setModules] = useState<ModuleModel[]>([]);
  const [moduleStats, setModuleStats] = useState<{ total: number; published: number; draft: number; archived: number } | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>(initialStatus);
  const [prodiFilter, setProdiFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Sync state if query param in URL changes
  useEffect(() => {
    const qStatus = searchParams.get('status') as 'all' | 'published' | 'draft' | 'archived';
    if (qStatus && qStatus !== statusFilter) {
      setStatusFilter(qStatus);
      setCurrentPage(1);
    }
  }, [searchParams]);

  const applyCatalogFallback = (page = 1) => {
    const q = search.trim().toLowerCase();
    const activeProdi = DISCIPLINES_FILTER.find((p) => p.id === prodiFilter);

    const filtered = ALL_CATALOG_MODULES.filter((m) => {
      // Status filter
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;

      // Bidang filter
      if (activeProdi && activeProdi.id !== 'all' && activeProdi.filterKey) {
        const discLower = (m.discipline || '').toLowerCase();
        const targetLower = activeProdi.filterKey.toLowerCase();
        if (!discLower.includes(targetLower) && !targetLower.includes(discLower)) {
          return false;
        }
      }

      // Search filter
      if (!q) return true;
      return (
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.discipline.toLowerCase().includes(q) ||
        (m.topic && m.topic.toLowerCase().includes(q)) ||
        m.slug.toLowerCase().includes(q)
      );
    });

    const perPage = 12;
    const total = filtered.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const safePage = Math.min(Math.max(1, page), lastPage);
    const start = (safePage - 1) * perPage;
    setModules(filtered.slice(start, start + perPage));
    setPagination({
      current_page: safePage,
      last_page: lastPage,
      per_page: perPage,
      total,
      from: total > 0 ? start + 1 : 0,
      to: Math.min(start + perPage, total),
      has_more: safePage < lastPage,
    });
  };

  const fetchModules = (page = currentPage) => {
    setLoading(true);
    const activeProdi = DISCIPLINES_FILTER.find((p) => p.id === prodiFilter);
    const disciplineParam = (activeProdi && activeProdi.id !== 'all' && activeProdi.filterKey) ? activeProdi.filterKey : undefined;

    modulesApi
      .adminList({
        status: statusFilter === 'all' ? undefined : statusFilter,
        discipline: disciplineParam,
        search: search.trim() || undefined,
        page,
        per_page: 12,
      })
      .then((res) => {
        if (res.success && Array.isArray(res.modules)) {
          setModules(res.modules);
          if (res.stats) {
            setModuleStats(res.stats);
          }
          if (res.pagination) {
            setPagination(res.pagination);
          } else {
            setPagination({
              current_page: page,
              last_page: Math.max(1, Math.ceil(res.modules.length / 12)),
              per_page: 12,
              total: res.modules.length,
              from: res.modules.length > 0 ? (page - 1) * 12 + 1 : 0,
              to: Math.min(page * 12, res.modules.length),
              has_more: page * 12 < res.modules.length,
            });
          }
        } else {
          applyCatalogFallback(page);
        }
      })
      .catch((err) => {
        if (err?.status !== 401) {
          console.warn('Info modul admin:', err?.message || err);
        }
        applyCatalogFallback(page);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchModules(currentPage);
  }, [statusFilter, prodiFilter, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchModules(1);
  };

  const handleDelete = (mod: ModuleModel) => {
    feedback.confirm({
      title: 'Hapus Simulator Ini?',
      description: 'Simulator dan seluruh konfigurasi visual akan dihapus secara permanen dari laboratorium. Tindakan ini tidak dapat dibatalkan.',
      targetName: mod.title,
      variant: 'danger',
      requirePhrase: true,
      confirmationPhrase: 'HAPUS',
      phrasePrompt: `Ketik HAPUS untuk mengonfirmasi penghapusan simulator "${mod.title}":`,
      confirmLabel: 'Hapus Simulator',
      cancelLabel: 'Batal',
      onConfirm: async () => {
        setActionLoading(mod.id);
        try {
          await modulesApi.adminDelete(mod.id);
          feedback.toast.success(`Simulator "${mod.title}" berhasil dihapus.`);
          fetchModules(currentPage);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Gagal menghapus simulator.';
          feedback.toast.error(msg);
          throw err;
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* ── 1. HEADER (CLEAN & COMPACT) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text)] tracking-tight">
            Simulator
          </h1>
        </div>
      </div>

      {/* ── 2. SEARCH & DUAL FILTERS ── */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
            <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search simulator..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-primary)] transition-colors min-h-[34px]"
            />
          </form>

          {/* Status Filters: Semua, Draft, Published, Archived */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {STATUS_FILTERS.map((s) => {
              const count = moduleStats
                ? s.id === 'all'
                  ? moduleStats.total
                  : moduleStats[s.id as keyof typeof moduleStats]
                : undefined;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(s.id as any);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer min-h-[30px] ${
                    statusFilter === s.id
                      ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-semibold border border-[var(--color-primary)]/20'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]'
                  }`}
                >
                  {s.label}
                  {typeof count === 'number' && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-sm font-mono text-[10px] bg-black/10 dark:bg-white/10">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bidang Keilmuan Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1.5 border-t border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] uppercase tracking-wider pr-1 shrink-0">
            Bidang:
          </span>
          {DISCIPLINES_FILTER.map((prodi) => (
            <button
              key={prodi.id}
              type="button"
              onClick={() => {
                setProdiFilter(prodi.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-md text-xs whitespace-nowrap transition-colors cursor-pointer min-h-[32px] flex items-center ${
                prodiFilter === prodi.id
                  ? 'bg-[var(--color-surface-subtle)] text-[var(--color-text)] font-semibold border border-[var(--color-border)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              {prodi.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. COMPACT SIMULATOR TABLE ── */}
      {loading ? (
        <LoadingState message="Memuat daftar simulator..." rows={4} />
      ) : modules.length > 0 ? (
        <div className="space-y-4">
          <div className="border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-subtle)] text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-secondary)]">
                    <th className="py-2.5 px-4 font-semibold">Judul</th>
                    <th className="py-2.5 px-3 font-semibold">Bidang</th>
                    <th className="py-2.5 px-3 font-semibold">Topik</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Updated</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)] text-xs">
                  {modules.map((mod) => {
                    const editUrl = `/admin/modules/${mod.slug || mod.id}/edit`;
                    const previewUrl = `/modules/${mod.slug}`;
                    const updatedDate = mod.updated_at
                      ? new Date(mod.updated_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Hari ini';

                    return (
                      <tr
                        key={mod.id || mod.slug}
                        className="hover:bg-[var(--color-surface-subtle)]/60 transition-colors"
                      >
                        {/* Judul */}
                        <td className="py-3 px-4">
                          <Link
                            href={editUrl}
                            className="font-medium text-[var(--color-text)] hover:text-[var(--color-primary-text)] transition-colors block truncate max-w-xs"
                          >
                            {mod.title}
                          </Link>
                        </td>

                        {/* Bidang */}
                        <td className="py-3 px-3 text-[var(--color-text-secondary)] whitespace-nowrap">
                          {mod.discipline || 'Umum'}
                        </td>

                        {/* Topik */}
                        <td className="py-3 px-3 text-[var(--color-text-secondary)] whitespace-nowrap">
                          {mod.topic || mod.discipline || 'Konsep'}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium border ${
                              mod.status === 'published'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                                : mod.status === 'draft'
                                ? 'bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
                                : 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40'
                            }`}
                          >
                            {mod.status === 'published' ? 'Published' : mod.status === 'draft' ? 'Draft' : 'Archived'}
                          </span>
                        </td>

                        {/* Updated */}
                        <td className="py-3 px-3 font-mono text-[11px] text-[var(--color-text-tertiary)] whitespace-nowrap">
                          {updatedDate}
                        </td>

                        {/* Actions: Edit, Preview, More */}
                        <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                          <Link
                            href={editUrl}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[var(--color-border)] hover:border-[var(--color-primary)] text-xs text-[var(--color-text)] hover:text-[var(--color-primary-text)] transition-colors min-h-[32px]"
                          >
                            <IconEdit size={12} />
                            <span>Edit</span>
                          </Link>

                          <Link
                            href={previewUrl}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-[var(--color-surface-subtle)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors min-h-[32px]"
                          >
                            <IconExternalLink size={12} />
                            <span>Preview</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(mod)}
                            disabled={actionLoading === mod.id}
                            className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[var(--color-text-secondary)] hover:text-rose-500 transition-colors cursor-pointer min-h-[32px] min-w-[32px]"
                            title="Hapus simulator"
                          >
                            <IconTrash size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.total > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.last_page}
              totalItems={pagination.total}
              pageSize={pagination.per_page}
              onPageChange={(p) => setCurrentPage(p)}
              itemName="Simulator"
            />
          )}
        </div>
      ) : (
        <EmptyState
          title={search ? 'Simulator tidak ditemukan.' : 'Belum ada simulator.'}
          description={search ? 'Coba kata kunci atau filter lain.' : 'Modul dan simulasi dikonfigurasi dan dirumuskan oleh AI Agent.'}
          actionLabel={search ? 'Reset Pencarian' : undefined}
          onAction={() => {
            setSearch('');
            setProdiFilter('all');
            setStatusFilter('all');
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
}

export default function AdminModulesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingState message="Memuat simulator..." />
        </div>
      }
    >
      <AdminModulesContent />
    </Suspense>
  );
}
