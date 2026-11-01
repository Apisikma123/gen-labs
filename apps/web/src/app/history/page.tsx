'use client';

import {
  IconArrowRight,
  IconDisciplineChemistry,
  IconCheckCircle,
  IconAlertCircle,
  IconCalendar,
  IconTarget,
  IconSliders,
  IconTrash,
  IconClock,
} from '@/components/icons';
import {
  Icon3dVerifiedEquilibrium,
  Icon3dBellAlert,
} from '@/components/icons/3d';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { sessionsApi, LearningSessionModel } from '@/lib/api/sessions';
import { modulesApi, PaginationMeta } from '@/lib/api/modules';
import { Pagination } from '@/components/ui/pagination';
import { resolveMediaUrl } from '@/lib/utils/media';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { useFeedback } from '@/components/feedback';
import { formatSessionTelemetry } from '@/lib/utils/formatters';

function formatCampusDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}

interface AttemptItem {
  id: number;
  experiment_id: number;
  user_id: number;
  state: Record<string, unknown>;
  prediction?: string | null;
  result: {
    actualValue: number;
    targetValue: number;
    delta: number;
    message: string;
  };
  delta: number;
  passed: boolean;
  simulation_version?: string | null;
  created_at: string;
  experiment?: {
    id: number;
    title: string;
    objective: string;
    target: { parameter: string; targetValue: number; unit?: string; tolerance?: number };
    module?: { id: number; title: string; slug: string; version?: string };
    simulation?: { id: number; title: string; slug: string };
  };
}

export default function HistoryPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'experiments' ? 'experiments' : 'sessions';
  const feedback = useFeedback();
  const [activeTab, setActiveTab] = useState<'experiments' | 'sessions'>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'sessions' || tabParam === 'experiments') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleClearSessions = () => {
    feedback.confirm({
      title: 'Hapus Seluruh Riwayat Sesi?',
      description: 'Semua riwayat belajar dan kemajuan simulasi akan dihapus dari perangkat ini. Tindakan ini tidak dapat dibatalkan.',
      targetName: `Riwayat ${sessions.length} Sesi Simulasi`,
      variant: 'danger',
      requirePhrase: true,
      confirmationPhrase: 'HAPUS',
      phrasePrompt: 'Ketik HAPUS untuk mengonfirmasi penghapusan riwayat sesi:',
      confirmLabel: 'Hapus Riwayat Sesi',
      cancelLabel: 'Batal',
      onConfirm: async () => {
        try {
          localStorage.removeItem('genlabs_learning_sessions');
          localStorage.removeItem('simula_learning_sessions');
          setSessions([]);
          feedback.toast.success('Seluruh riwayat sesi simulasi berhasil dihapus.');
        } catch {
          feedback.toast.error('Gagal menghapus riwayat sesi.');
        }
      },
    });
  };

  // Experiments state
  const [attempts, setAttempts] = useState<AttemptItem[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const [attemptPage, setAttemptPage] = useState(1);
  const [attemptPagination, setAttemptPagination] = useState<PaginationMeta | null>(null);

  // Sessions state
  const [sessions, setSessions] = useState<LearningSessionModel[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionPage, setSessionPage] = useState(1);
  const [sessionPagination, setSessionPagination] = useState<PaginationMeta | null>(null);

  const fetchAttempts = useCallback(async (targetPage = 1) => {
    setLoadingAttempts(true);
    try {
      const res = await modulesApi.getExperimentHistory({ page: targetPage, per_page: 8 });
      if (res.success && res.attempts) {
        setAttempts(res.attempts);
        if (res.pagination) {
          setAttemptPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil riwayat eksperimen:', err);
    } finally {
      setLoadingAttempts(false);
    }
  }, []);

  const fetchSessions = useCallback(async (targetPage = 1) => {
    setLoadingSessions(true);
    try {
      const res = await sessionsApi.list({ page: targetPage, per_page: 8 });
      if (res.success && res.sessions) {
        setSessions(res.sessions);
        if (res.pagination) {
          setSessionPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil riwayat simulasi:', err);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    fetchAttempts(1);
    fetchSessions(1);
  }, [fetchAttempts, fetchSessions]);

  useEffect(() => {
    if (activeTab === 'experiments') {
      fetchAttempts(attemptPage);
    } else {
      fetchSessions(sessionPage);
    }
  }, [activeTab, attemptPage, sessionPage, fetchAttempts, fetchSessions]);

  const formatParamSummary = (state: Record<string, unknown> | null | undefined): string => {
    return formatSessionTelemetry(state, 'Parameter standar');
  };

  return (
    <div className="max-w-[1260px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10">
      {/* ── 1. PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#152B1E] border border-[#2D4C38] font-mono text-[10px] font-bold text-[var(--color-primary-accent)] tracking-wider uppercase">
              REKAM JEJAK EMPIRIS
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text)] tracking-tight">
            Riwayat Laboratorium
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Aktivitas percobaan, uji coba target, dan eksperimen empiris Anda di GEN LABS.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center gap-1.5 p-1 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)]">
          <button
            type="button"
            onClick={() => setActiveTab('experiments')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer text-center justify-center min-h-[38px] flex items-center ${
              activeTab === 'experiments'
                ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-xs border border-[var(--color-border-subtle)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            Riwayat Eksperimen {attemptPagination?.total ? `(${attemptPagination.total})` : ''}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer text-center justify-center min-h-[38px] flex items-center ${
              activeTab === 'sessions'
                ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-xs border border-[var(--color-border-subtle)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            Sesi Simulasi {sessionPagination?.total ? `(${sessionPagination.total})` : ''}
          </button>
        </div>
      </div>

      {/* ── 2. TAB: RIWAYAT EKSPERIMEN (PRD SECTION 9) ── */}
      {activeTab === 'experiments' && (
        <>
          {loadingAttempts ? (
            <LoadingState message="Memuat riwayat uji coba eksperimen..." rows={4} />
          ) : attempts.length > 0 ? (
            <div className="space-y-4">
              <div className="divide-y divide-[var(--color-border-subtle)] rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-xs overflow-hidden">
                {attempts.map((attempt) => {
                  const simTitle =
                    attempt.experiment?.module?.title ||
                    attempt.experiment?.simulation?.title ||
                    'Simulasi GEN LABS';
                  const targetSlug =
                    attempt.experiment?.module?.slug
                      ? `/modules/${attempt.experiment.module.slug}`
                      : attempt.experiment?.simulation?.slug
                      ? `/simulation/${attempt.experiment.simulation.slug}`
                      : '/';
                  const dateText = formatCampusDate(attempt.created_at);
                  const version = attempt.simulation_version || '1.0';

                  return (
                    <div
                      key={attempt.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[var(--color-surface-subtle)]/40 transition-colors"
                    >
                      <div className="flex items-start gap-3.5 min-w-0 w-full sm:w-auto">
                        {/* Status Icon */}
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                            attempt.passed
                              ? 'bg-[var(--color-primary-soft)] border-[var(--color-primary)]/30'
                              : 'bg-[var(--color-accent-soft)] border-[var(--color-accent)]/30'
                          }`}
                        >
                          {attempt.passed ? <Icon3dVerifiedEquilibrium size={24} /> : <Icon3dBellAlert size={24} />}
                        </div>

                        {/* Details */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-heading text-sm sm:text-base font-bold text-[var(--color-text)] truncate">
                              {simTitle}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]">
                              v{version}
                            </span>
                            <span
                              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-sm ${
                                attempt.passed
                                  ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)]'
                                  : 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                              }`}
                            >
                              {attempt.passed ? '✓ Berhasil' : 'Belum Tercapai'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[var(--color-text-secondary)]">
                            <span>
                              Target: <strong className="text-[var(--color-text)]">{attempt.result.targetValue}</strong>
                            </span>
                            <span>/</span>
                            <span>
                              Hasil: <strong className="text-[var(--color-text)]">{attempt.result.actualValue}</strong>
                            </span>
                            <span>/</span>
                            <span>
                              Δ: <strong className="text-[var(--color-text)]">{attempt.delta}</strong>
                            </span>
                            <span>/</span>
                            <span className="font-sans text-[var(--color-text-tertiary)] flex items-center gap-1">
                              <IconClock size={11} /> {dateText}
                            </span>
                          </div>

                          {attempt.prediction && (
                            <p className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface-subtle)] px-2.5 py-1 rounded-sm inline-block break-words">
                              <span className="font-semibold text-[var(--color-text)]">Prediksi:</span> "{attempt.prediction}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="shrink-0 w-full sm:w-auto self-stretch sm:self-center">
                        <Link
                          href={targetSlug}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-primary-soft)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-xs font-semibold text-[var(--color-text)] hover:text-[var(--color-primary-text)] transition-colors w-full sm:w-auto min-h-[38px]"
                        >
                          <span>Buka Lab</span>
                          <IconArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {attemptPagination && attemptPagination.last_page > 1 && (
                <div className="pt-4">
                  <Pagination
                    currentPage={attemptPagination.current_page}
                    totalPages={attemptPagination.last_page}
                    totalItems={attemptPagination.total}
                    pageSize={attemptPagination.per_page}
                    itemName="Eksperimen"
                    onPageChange={(newPage) => {
                      setAttemptPage(newPage);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon3d="verified-equilibrium"
              title="Belum ada data eksperimen tersimpan."
              description="Buka salah satu simulasi di laboratorium, ubah parameter kontrol, dan klik 'Uji & Simpan Eksperimen' untuk membuktikan target."
              actionLabel="Jelajahi Laboratorium"
              actionHref="/app"
            />
          )}
        </>
      )}

      {/* ── 3. TAB: SESI SIMULASI ── */}
      {activeTab === 'sessions' && (
        <>
          {loadingSessions ? (
            <LoadingState message="Memuat riwayat sesi simulasi..." rows={4} />
          ) : sessions.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs text-[var(--color-text-secondary)]">
                  Menampilkan {sessions.length} sesi simulasi tersimpan
                </span>
                <button
                  type="button"
                  onClick={handleClearSessions}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--color-error)]/20 bg-[var(--color-error)]/10 hover:bg-[var(--color-error)]/20 text-[var(--color-error)] text-xs font-semibold transition-colors cursor-pointer"
                >
                  <IconTrash size={13} />
                  <span>Bersihkan Riwayat Sesi</span>
                </button>
              </div>
              <div className="divide-y divide-[var(--color-border-subtle)] rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-xs overflow-hidden">
                {sessions.map((session) => {
                  const isCompleted = (session.progress ?? 0) >= 100 || !!session.completed_at;
                  const targetUrl = session.module?.slug
                    ? `/modules/${session.module.slug}`
                    : session.simulation?.slug
                    ? `/simulation/${session.simulation.slug}`
                    : '/';
                  const title = session.module?.title || session.simulation?.title || 'Simulasi Interaktif';
                  const discipline = session.module?.discipline || 'GEN LABS';
                  const dateText = formatCampusDate(session.completed_at || session.last_active_at || session.started_at);
                  const thumbUrl = resolveMediaUrl(session.module?.thumbnail_image);

                  return (
                    <div
                      key={session.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[var(--color-surface-subtle)]/40 transition-colors"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] shrink-0 flex items-center justify-center">
                          {thumbUrl ? (
                            <img src={thumbUrl} alt={title} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <IconDisciplineChemistry className="w-5 h-5 text-[var(--color-primary-text)]" />
                          )}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-[var(--color-primary-soft)] text-[var(--color-primary-text)]">
                              {discipline}
                            </span>
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-primary-text)]">
                                <IconCheckCircle size={12} />
                                <span>Selesai</span>
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-[var(--color-accent)]">
                                Berjalan ({session.progress ?? 0}%)
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)]">
                              <IconCalendar size={11} />
                              <span>{dateText}</span>
                            </span>
                          </div>

                          <h3 className="font-heading text-base font-bold text-[var(--color-text)] truncate">
                            <Link href={targetUrl} className="hover:text-[var(--color-primary-text)] transition-colors">
                              {title}
                            </Link>
                          </h3>

                          <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">
                            Parameter: {formatParamSummary(
                              session.current_state ??
                              (session as unknown as { currentState?: Record<string, unknown> }).currentState ??
                              session
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 w-full sm:w-auto self-stretch sm:self-center">
                        <Link
                          href={targetUrl}
                          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-primary-soft)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-xs font-semibold text-[var(--color-text)] hover:text-[var(--color-primary-text)] transition-colors w-full sm:w-auto min-h-[38px]"
                        >
                          <span>{isCompleted ? 'Uji Ulang' : 'Lanjutkan'}</span>
                          <IconArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {sessionPagination && sessionPagination.last_page > 1 && (
                <div className="pt-4">
                  <Pagination
                    currentPage={sessionPagination.current_page}
                    totalPages={sessionPagination.last_page}
                    totalItems={sessionPagination.total}
                    pageSize={sessionPagination.per_page}
                    itemName="Sesi"
                    onPageChange={(newPage) => {
                      setSessionPage(newPage);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon3d="compass-explore"
              title="Belum ada sesi simulasi."
              description="Pilih salah satu simulasi di laboratorium interaktif GEN LABS untuk memulai percobaan."
              actionLabel="Mulai Eksperimen"
              actionHref="/app"
            />
          )}
        </>
      )}
    </div>
  );
}
