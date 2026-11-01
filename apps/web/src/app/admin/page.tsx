'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IconSliders,
  IconCheckCircle,
  IconFileText,
  IconUsers,
  IconActivity,
  IconArrowRight,
  IconTrendingUp,
} from '@/components/icons';
import { adminApi, AdminMetrics, ActivityModel } from '@/lib/api/admin';
import { LoadingState } from '@/components/ui/loading-state';

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [activities, setActivities] = useState<ActivityModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setFetchError(null);
    Promise.all([
      adminApi.getMetrics().catch((err) => {
        console.warn('Metrics fetch warning:', err);
        return null;
      }),
      adminApi.getActivities({ per_page: 8 }).catch(() => null),
    ])
      .then(([metricsRes, actRes]) => {
        if (metricsRes?.success && metricsRes.metrics) {
          setMetrics(metricsRes.metrics);
        } else if (!metrics) {
          setFetchError('Gagal memuat metrik laboratorium dari server.');
        }
        if (actRes?.success && Array.isArray(actRes.data)) {
          setActivities(actRes.data);
        }
      })
      .catch((err) => {
        setFetchError(err?.message || 'Koneksi ke server simulasi belum terhubung.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingState message="Memuat metrik dashboard laboratorium..." />
      </div>
    );
  }

  if (fetchError && !metrics) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 text-xs">
          {fetchError}
        </div>
        <button
          type="button"
          onClick={loadData}
          className="px-4 py-2 rounded-md bg-[var(--color-primary)] text-white text-xs font-semibold cursor-pointer"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const totalSims = metrics?.totalSimulations ?? 0;
  const publishedSims = metrics?.publishedCount ?? 0;
  const draftSims = metrics?.draftCount ?? 0;
  const totalUsers = metrics?.totalUsers ?? metrics?.totalStudents ?? 0;
  const totalSessions = metrics?.totalSessions ?? 0;

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* ── 1. HEADER WITH PRIMARY ACTIONS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-6">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text)] tracking-tight">
            Overview Laboratorium
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Ringkasan status simulator aktif dan metrik eksplorasi pengguna.
          </p>
        </div>
      </div>

      {/* ── 2. REAL-DATA STATS (NO DECORATIVE CHARTS - PRD SECTION Q) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Simulator */}
        <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span className="font-medium">Total Simulator</span>
            <IconSliders size={14} className="text-[var(--color-primary-accent)]" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[var(--color-text)]">
            {totalSims}
          </div>
          <span className="text-[11px] text-[var(--color-text-tertiary)] block">
            Laboratorium Aktif
          </span>
        </div>

        {/* Published */}
        <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span className="font-medium">Published</span>
            <IconCheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-emerald-600 dark:text-emerald-400">
            {publishedSims}
          </div>
          <span className="text-[11px] text-[var(--color-text-tertiary)] block">
            Dapat Diakses Publik
          </span>
        </div>

        {/* Draft */}
        <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span className="font-medium">Draft</span>
            <IconFileText size={14} className="text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-amber-500">
            {draftSims}
          </div>
          <span className="text-[11px] text-[var(--color-text-tertiary)] block">
            Dalam Penyusunan
          </span>
        </div>

        {/* Total Pengguna */}
        <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span className="font-medium">Total Pengguna</span>
            <IconUsers size={14} className="text-[var(--color-secondary)]" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[var(--color-text)]">
            {totalUsers}
          </div>
          <span className="text-[11px] text-[var(--color-text-tertiary)] block">
            Pengguna Terdaftar ({metrics?.totalStudents ?? 0} Siswa, {metrics?.totalAdmins ?? 0} Admin)
          </span>
        </div>

        {/* Active Learning Sessions */}
        <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1 shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span className="font-medium">Sesi Eksperimen</span>
            <IconTrendingUp size={14} className="text-sky-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[var(--color-text)]">
            {totalSessions}
          </div>
          <span className="text-[11px] text-[var(--color-text-tertiary)] block">
            Total Sesi Praktikum
          </span>
        </div>
      </div>

      {/* ── AI USAGE PROTECTION & MONITORING (PRD Section 5 & 11) ── */}
      {metrics?.aiMonitoring && (
        <section aria-label="Monitoring Penggunaan AI" className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border-subtle)] pb-3">
            <div className="space-y-0.5">
              <h2 className="font-heading text-sm sm:text-base font-bold text-[var(--color-text)] flex items-center gap-2">
                <IconActivity size={16} className="text-[#4B8F8C]" />
                <span>Monitoring Penggunaan AI Tutor (Gemini API)</span>
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Status kuota darurat global dan pemantauan perlindungan sistem hari ini ({metrics.aiMonitoring.usage_date}).
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-sm bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]">
              Limit Global: {metrics.aiMonitoring.successful_requests} / {metrics.aiMonitoring.global_daily_limit} ({metrics.aiMonitoring.usage_percentage}%)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)]">
              <span className="text-[11px] text-[var(--color-text-secondary)] block">Permintaan Hari Ini</span>
              <span className="text-lg font-heading font-extrabold text-[var(--color-text)] mt-0.5 block">{metrics.aiMonitoring.requests_today}</span>
            </div>
            <div className="p-3 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)]">
              <span className="text-[11px] text-[var(--color-text-secondary)] block">Sukses (Gemini)</span>
              <span className="text-lg font-heading font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{metrics.aiMonitoring.successful_requests}</span>
            </div>
            <div className="p-3 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)]">
              <span className="text-[11px] text-[var(--color-text-secondary)] block">User Aktif AI</span>
              <span className="text-lg font-heading font-extrabold text-[var(--color-text)] mt-0.5 block">{metrics.aiMonitoring.active_users_today}</span>
            </div>
            <div className="p-3 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)]">
              <span className="text-[11px] text-[var(--color-text-secondary)] block">Gemini Failures</span>
              <span className="text-lg font-heading font-extrabold text-rose-500 mt-0.5 block">{metrics.aiMonitoring.gemini_failures}</span>
            </div>
            <div className="p-3 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)]">
              <span className="text-[11px] text-[var(--color-text-secondary)] block">Rate-Limited</span>
              <span className="text-lg font-heading font-extrabold text-amber-500 mt-0.5 block">{metrics.aiMonitoring.rate_limited_requests}</span>
            </div>
            <div className="p-3 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)]">
              <span className="text-[11px] text-[var(--color-text-secondary)] block">Quota Exceeded</span>
              <span className="text-lg font-heading font-extrabold text-[var(--color-text-tertiary)] mt-0.5 block">{metrics.aiMonitoring.quota_exceeded_requests}</span>
            </div>
          </div>
        </section>
      )}

      {/* ── 3. RECENT ACTIVITY LIST (PRD SECTION Q) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="font-heading text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
              <IconActivity size={18} className="text-[var(--color-primary-accent)]" />
              <span>Aktivitas Sistem Terkini</span>
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Log riwayat aksi pembuatan, publikasi, pengubahan simulator, dan sesi pengguna.
            </p>
          </div>

          <Link
            href="/admin/activity"
            className="text-xs font-semibold text-[var(--color-primary-text)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Lihat Semua Aktivitas</span>
            <IconArrowRight size={13} />
          </Link>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-2xs">
          {activities.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--color-text-secondary)]">
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
                        <span className="font-mono text-[10px] uppercase px-1.5 py-0.2 rounded-sm bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]">
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
      </div>
    </div>
  );
}
