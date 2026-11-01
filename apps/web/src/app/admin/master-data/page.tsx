'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  IconDatabase,
  IconPlus,
  IconSearch,
  IconBookOpen,
  IconCompass,
  IconLayers,
  IconEdit,
  IconClose,
  IconCheckCircle,
  IconAlertCircle,
  IconToggleLeft,
  IconToggleRight,
} from '@/components/icons';
import {
  adminApi,
  StudyProgramModel,
  TopicModel,
  DifficultyModel,
} from '@/lib/api/admin';
import { LoadingState } from '@/components/ui/loading-state';
import { useFeedback } from '@/components/feedback';

type TabKey = 'programs' | 'topics' | 'difficulties';

export default function AdminMasterDataPage() {
  const feedback = useFeedback();
  const [activeTab, setActiveTab] = useState<TabKey>('programs');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Data states
  const [programs, setPrograms] = useState<StudyProgramModel[]>([]);
  const [topics, setTopics] = useState<TopicModel[]>([]);
  const [difficulties, setDifficulties] = useState<DifficultyModel[]>([]);
  const [counts, setCounts] = useState<{ programs: number; topics: number; difficulties: number }>({
    programs: 0,
    topics: 0,
    difficulties: 0,
  });
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<StudyProgramModel | TopicModel | null>(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formProgramId, setFormProgramId] = useState<number | string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [progRes, topRes, diffRes] = await Promise.all([
        adminApi.getStudyPrograms({ search: activeTab === 'programs' && search.trim() ? search.trim() : undefined }),
        adminApi.getTopics({ search: activeTab === 'topics' && search.trim() ? search.trim() : undefined }),
        adminApi.getDifficulties(),
      ]);

      if (progRes.success) {
        setPrograms(progRes.data);
        if (!search.trim() || activeTab !== 'programs') {
          setCounts((prev) => ({ ...prev, programs: progRes.data.length }));
        }
      }
      if (topRes.success) {
        setTopics(topRes.data);
        if (!search.trim() || activeTab !== 'topics') {
          setCounts((prev) => ({ ...prev, topics: topRes.data.length }));
        }
      }
      if (diffRes.success) {
        setDifficulties(diffRes.data);
        setCounts((prev) => ({ ...prev, difficulties: diffRes.data.length }));
      }

      if (!progRes.success && !topRes.success && !diffRes.success) {
        setFetchError('Gagal memuat data master dari server.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data master dari server.';
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditItem(null);
    setFormName('');
    setFormCode('');
    setFormDesc('');
    setFormProgramId(programs[0]?.id || '');
    setErrorMsg('');
    setSuccessMsg('');
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: StudyProgramModel | TopicModel) => {
    setEditItem(item);
    setFormName(item.name);
    setFormDesc(item.description || '');
    if ('code' in item) {
      setFormCode(item.code || '');
    } else if ('study_program_id' in item) {
      setFormProgramId(item.study_program_id || programs[0]?.id || '');
    }
    setErrorMsg('');
    setSuccessMsg('');
    setModalOpen(true);
  };

  // Submit Create or Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMsg('Nama wajib diisi.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');

    try {
      if (activeTab === 'programs') {
        if (editItem) {
          const res = await adminApi.updateStudyProgram(editItem.id, {
            name: formName.trim(),
            code: formCode.trim() || undefined,
            description: formDesc.trim() || undefined,
          });
          if (res.success) {
            setSuccessMsg('Bidang berhasil diperbarui.');
            setTimeout(() => setModalOpen(false), 800);
            loadData();
          }
        } else {
          const res = await adminApi.createStudyProgram({
            name: formName.trim(),
            code: formCode.trim() || undefined,
            description: formDesc.trim() || undefined,
          });
          if (res.success) {
            setSuccessMsg('Bidang berhasil ditambahkan.');
            setTimeout(() => setModalOpen(false), 800);
            loadData();
          }
        }
      } else if (activeTab === 'topics') {
        if (editItem) {
          const res = await adminApi.updateTopic(editItem.id, {
            name: formName.trim(),
            study_program_id: formProgramId || undefined,
            description: formDesc.trim() || undefined,
          });
          if (res.success) {
            setSuccessMsg('Topik berhasil diperbarui.');
            setTimeout(() => setModalOpen(false), 800);
            loadData();
          }
        } else {
          const res = await adminApi.createTopic({
            name: formName.trim(),
            study_program_id: formProgramId || undefined,
            description: formDesc.trim() || undefined,
          });
          if (res.success) {
            setSuccessMsg('Topik berhasil ditambahkan.');
            setTimeout(() => setModalOpen(false), 800);
            loadData();
          }
        }
      }
    } catch (err: any) {
      const msg = err?.message || 'Gagal menyimpan perubahan.';
      setErrorMsg(msg);
      feedback.toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Program Status
  const handleToggleProgram = async (id: number) => {
    try {
      const res = await adminApi.toggleStudyProgramStatus(id);
      if (res.success) {
        setPrograms((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: res.data.status } : p))
        );
        feedback.toast.info('Status bidang keahlian diperbarui.');
      }
    } catch {
      feedback.toast.error('Gagal memperbarui status bidang.');
    }
  };

  // Toggle Topic Status
  const handleToggleTopic = async (id: number) => {
    try {
      const res = await adminApi.toggleTopicStatus(id);
      if (res.success) {
        setTopics((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: res.data.status } : t))
        );
        feedback.toast.info('Status topik pembelajaran diperbarui.');
      }
    } catch {
      feedback.toast.error('Gagal memperbarui status topik.');
    }
  };

  // Toggle Difficulty Status
  const handleToggleDifficulty = async (id: number) => {
    try {
      const res = await adminApi.toggleDifficultyStatus(id);
      if (res.success) {
        setDifficulties((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status: res.data.status } : d))
        );
        feedback.toast.info('Status tingkat kesulitan diperbarui.');
      }
    } catch {
      feedback.toast.error('Gagal memperbarui status tingkat kesulitan.');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-5">
        <div className="space-y-0.5">
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-2">
            <IconDatabase size={22} className="text-[var(--color-primary)]" />
            Master Data
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Kelola taksonomi simulator universal: bidang keilmuan, topik, dan tingkat pemahaman.
          </p>
        </div>

        {activeTab !== 'difficulties' && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition cursor-pointer"
          >
            <IconPlus size={15} />
            Tambah {activeTab === 'programs' ? 'Bidang' : 'Topik'}
          </button>
        )}
      </div>

      {/* ── TABS ── */}
      <div className="flex border-b border-[var(--color-border)] gap-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab('programs');
            setSearch('');
          }}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'programs'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
          }`}
        >
          <IconCompass size={15} />
          Bidang ({counts.programs || programs.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('topics');
            setSearch('');
          }}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'topics'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
          }`}
        >
          <IconBookOpen size={15} />
          Topik ({counts.topics || topics.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('difficulties');
            setSearch('');
          }}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'difficulties'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
          }`}
        >
          <IconLayers size={15} />
          Tingkat ({counts.difficulties || difficulties.length})
        </button>
      </div>

      {/* ── SEARCH (for programs and topics) ── */}
      {activeTab !== 'difficulties' && (
        <div className="relative max-w-sm">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            placeholder={`Cari ${activeTab === 'programs' ? 'bidang' : 'topik'}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>
      )}

      {/* ── CONTENT ── */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <LoadingState message="Memuat data master..." />
        </div>
      ) : fetchError ? (
        <div className="p-8 rounded-xl border border-rose-500/20 bg-rose-500/5 text-center space-y-3">
          <div className="inline-flex p-2.5 rounded-full bg-rose-500/10 text-rose-500">
            <IconAlertCircle size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">
              Gagal Memuat Master Data
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto font-mono">
              {fetchError}
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="px-4 py-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] text-xs font-semibold text-[var(--color-text)] transition cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-2xs">
          {/* 1. BIDANG TAB */}
          {activeTab === 'programs' && (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {programs.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--color-text-secondary)]">
                  Belum ada bidang yang terdaftar.
                </div>
              ) : (
                programs.map((prog) => (
                  <div
                    key={prog.id}
                    className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[var(--color-surface-subtle)]/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--color-text)] text-sm">
                          {prog.name}
                        </span>
                        {prog.code && (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]">
                            {prog.code}
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-sm font-medium ${
                            prog.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {prog.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                      {prog.description && (
                        <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-1">
                          {prog.description}
                        </p>
                      )}
                      {typeof prog.topics_count === 'number' && (
                        <p className="text-[10px] text-[var(--color-text-tertiary)]">
                          {prog.topics_count} topik terkait
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(prog)}
                        className="p-1.5 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] transition-colors cursor-pointer"
                        title="Edit bidang keilmuan"
                      >
                        <IconEdit size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleProgram(prog.id)}
                        className={`p-1.5 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] transition-colors cursor-pointer ${
                          prog.status === 'active' ? 'text-emerald-600' : 'text-rose-500'
                        }`}
                        title={prog.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        {prog.status === 'active' ? (
                          <IconToggleRight size={17} />
                        ) : (
                          <IconToggleLeft size={17} />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 2. TOPIK TAB */}
          {activeTab === 'topics' && (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {topics.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--color-text-secondary)]">
                  Belum ada topik yang terdaftar.
                </div>
              ) : (
                topics.map((top) => (
                  <div
                    key={top.id}
                    className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[var(--color-surface-subtle)]/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--color-text)] text-sm">
                          {top.name}
                        </span>
                        {top.study_program && (
                          <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium">
                            {top.study_program.name}
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-sm font-medium ${
                            top.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {top.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                      {top.description && (
                        <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-1">
                          {top.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(top)}
                        className="p-1.5 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] transition-colors cursor-pointer"
                        title="Edit topik"
                      >
                        <IconEdit size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleTopic(top.id)}
                        className={`p-1.5 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] transition-colors cursor-pointer ${
                          top.status === 'active' ? 'text-emerald-600' : 'text-rose-500'
                        }`}
                        title={top.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        {top.status === 'active' ? (
                          <IconToggleRight size={17} />
                        ) : (
                          <IconToggleLeft size={17} />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 3. TINGKAT KESULITAN TAB */}
          {activeTab === 'difficulties' && (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {difficulties.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--color-text-secondary)]">
                  Belum ada data tingkat kesulitan.
                </div>
              ) : (
                difficulties.map((diff) => (
                  <div
                    key={diff.id}
                    className="p-4 sm:px-5 flex items-center justify-between gap-3 text-xs hover:bg-[var(--color-surface-subtle)]/40 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--color-text)] text-sm">
                          {diff.name}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]">
                          {diff.slug}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-sm font-medium ${
                            diff.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {diff.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-secondary)]">
                        Tingkat kesulitan materi modul simulasi.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleDifficulty(diff.id)}
                      className={`p-1.5 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] transition-colors cursor-pointer ${
                        diff.status === 'active' ? 'text-emerald-600' : 'text-rose-500'
                      }`}
                      title={diff.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      {diff.status === 'active' ? (
                        <IconToggleRight size={18} />
                      ) : (
                        <IconToggleLeft size={18} />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ── CREATE / EDIT MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
              <h3 className="font-semibold text-sm text-[var(--color-text)]">
                {editItem ? 'Edit ' : 'Tambah '}
                {activeTab === 'programs' ? 'Bidang' : 'Topik'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] cursor-pointer"
              >
                <IconClose size={16} />
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs">
                <IconAlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs">
                <IconCheckCircle size={14} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-[var(--color-text)]">
                  Nama {activeTab === 'programs' ? 'Bidang' : 'Topik'} *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={activeTab === 'programs' ? 'Contoh: Fisika / Informatika / Akuntansi' : 'Contoh: Mekanika Gerak'}
                  className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                />
              </div>

              {activeTab === 'programs' && (
                <div className="space-y-1">
                  <label className="font-medium text-[var(--color-text)]">
                    Kode Singkat
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: FIS"
                    maxLength={10}
                    className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] uppercase font-mono"
                  />
                </div>
              )}

              {activeTab === 'topics' && (
                <div className="space-y-1">
                  <label className="font-medium text-[var(--color-text)]">
                    Bidang Terkait
                  </label>
                  <select
                    value={formProgramId}
                    onChange={(e) => setFormProgramId(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  >
                    <option value="">-- Pilih Bidang --</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-medium text-[var(--color-text)]">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Deskripsi ruang lingkup atau kurikulum..."
                  className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border-subtle)]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-md bg-[var(--color-primary)] text-white font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer transition"
                >
                  {submitting ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Buat Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
