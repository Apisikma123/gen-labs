'use client';

import {
  IconArrowLeft,
  IconCheckCircle,
  IconAlertCircle,
  IconClock,
  IconPlay,
  IconShare,
  IconCopy,
  IconCheck,
  IconClose,
} from '@/components/icons';
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  modulesApi,
  ModuleModel,
  ExperimentModel,
  InsightModel,
} from '@/lib/api/modules';
import { sessionsApi } from '@/lib/api/sessions';
import { useFeedback } from '@/components/feedback';
import { useAuth } from '@/components/auth-provider';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { SuperCanvas } from '@/components/simulation/super-canvas';
import { getGenlabSimulation, ACTIVE_SIMULATION_CATALOG } from '@genlab/simulation-core';
import { resolveMediaUrl } from '@/lib/utils/media';
import { ProductEmoji } from '@/components/ui/product-emoji';

interface ModuleWorkspaceProps {
  moduleSlugOrId: string;
}

function resolveSimulationSlug(module: ModuleModel | null): string {
  if (!module) return 'newtons-second-law';
  if (module.simulations && module.simulations.length > 0 && module.simulations[0].slug) {
    const s = module.simulations[0].slug;
    if (s.includes(':')) {
      const parts = s.split(':');
      return parts[1].replace(/_/g, '-');
    }
    return s;
  }
  const mSlug = (module.slug || '').toLowerCase();
  if (getGenlabSimulation(mSlug)) return mSlug;
  if (mSlug.includes('vektor') || mSlug.includes('vector')) return 'vector-math';
  if (mSlug.includes('parabola') || mSlug.includes('peluru') || mSlug.includes('projectile')) return 'projectile-motion';
  if (mSlug.includes('momentum') || mSlug.includes('tumbukan') || mSlug.includes('collision')) return 'momentum-collision';
  if (mSlug.includes('kuadrat') || mSlug.includes('fungsi') || mSlug.includes('function')) return 'function-explorer';
  if (mSlug.includes('peluang') || mSlug.includes('koin') || mSlug.includes('probability')) return 'probability-coin';
  if (mSlug.includes('sorting') || mSlug.includes('urut')) return 'sorting-algorithms';
  if (mSlug.includes('biner') || mSlug.includes('binary')) return 'binary-search';
  if (mSlug.includes('graf') || mSlug.includes('bfs') || mSlug.includes('dfs') || mSlug.includes('graph')) return 'graph-traversal';
  if (mSlug.includes('regresi') || mSlug.includes('regression')) return 'linear-regression';
  if (mSlug.includes('normal') || mSlug.includes('gauss') || mSlug.includes('distribusi')) return 'normal-distribution';
  if (mSlug.includes('pasar') || mSlug.includes('permintaan') || mSlug.includes('supply')) return 'supply-demand';
  if (mSlug.includes('bunga') || mSlug.includes('compound') || mSlug.includes('interest')) return 'compound-interest';
  if (mSlug.includes('ph') || mSlug.includes('asam') || mSlug.includes('basa')) return 'ph-scale';
  if (mSlug.includes('newton') || mSlug.includes('gaya') || mSlug.includes('force')) return 'newtons-second-law';

  const disc = (module.discipline || '').toLowerCase();
  if (disc.includes('fisika') || disc.includes('physics')) return 'newtons-second-law';
  if (disc.includes('matematika') || disc.includes('math')) return 'vector-math';
  if (disc.includes('ekonomi') || disc.includes('economics')) return 'supply-demand';
  if (disc.includes('informatika') || disc.includes('computer')) return 'sorting-algorithms';
  if (disc.includes('kimia') || disc.includes('chemistry')) return 'ph-scale';

  return 'newtons-second-law';
}

function getInitialModule(moduleSlugOrId: string): { module: ModuleModel | null; params: Record<string, number> } {
  const sId = String(moduleSlugOrId || '').toLowerCase();
  const cat =
    ACTIVE_SIMULATION_CATALOG.find(
      (c) => c.slug.toLowerCase() === sId || String(c.id).toLowerCase() === sId || c.title.toLowerCase() === sId
    ) ||
    ACTIVE_SIMULATION_CATALOG.find(
      (c) => sId.includes(c.slug.toLowerCase()) || c.slug.toLowerCase().includes(sId)
    );

  const simDef = getGenlabSimulation(sId) || (cat ? getGenlabSimulation(cat.slug) : null);

  if (cat || simDef) {
    const slug = cat?.slug || sId;
    const title = cat?.title || simDef?.spec?.title || slug;
    const discipline = cat?.discipline || (simDef as { discipline?: string })?.discipline || 'Simulasi GEN LABS';
    const description = cat?.description || simDef?.spec?.description || '';
    const diff: 'basic' | 'intermediate' | 'advanced' =
      cat?.difficulty === 'Lanjutan'
        ? 'advanced'
        : cat?.difficulty === 'Menengah'
        ? 'intermediate'
        : 'basic';

    let initialParams: Record<string, number> = {};
    if (simDef?.spec?.parameters) {
      initialParams = Object.fromEntries(
        Object.entries(simDef.spec.parameters).map(([k, p]: [string, any]) => [
          k,
          typeof p.value === 'number' ? p.value : typeof p.defaultVal === 'number' ? p.defaultVal : 0,
        ])
      );
    }

    const experiments: ExperimentModel[] = (simDef?.experiments || []).map((exp: any, idx: number) => {
      const cond = typeof exp.targetCondition === 'object' && exp.targetCondition !== null ? exp.targetCondition : null;
      return {
        id: idx + 1,
        module_id: 1,
        title: exp.title,
        objective: exp.objective || exp.description || 'Eksperimen Interaktif',
        target: {
          parameter: cond?.output || 'output',
          targetValue: typeof cond?.value === 'number' ? cond.value : 50,
          tolerance: typeof cond?.tolerance === 'number' ? cond.tolerance : 5,
        },
        status: 'active',
      };
    });

    const syntheticModule: ModuleModel = {
      id: 1,
      slug,
      title,
      description,
      discipline,
      difficulty: diff,
      topic: cat?.category || discipline,
      estimated_time: '15–20 menit',
      content: description,
      learning_objectives: cat?.learningObjectives || [
        'Memahami keterkaitan antar variabel pada sistem simulasi.',
        'Mengamati respon keluaran sistem secara realtime.',
        'Menganalisis hasil eksperimen secara mandiri.',
      ],
      target_audience: 'Umum / Pelajar',
      status: 'published',
      simulations: [
        {
          id: 1,
          slug,
          title,
          type: cat?.engine || 'universal',
          formula: cat?.formula,
        },
      ],
      experiments:
        experiments.length > 0
          ? experiments
          : [
              {
                id: 1,
                module_id: 1,
                title: `Eksperimen ${title}`,
                objective:
                  cat?.learningObjectives?.[0] ||
                  'Ubah variabel eksperimen dan amati respon keluaran sistem secara langsung.',
                target: {
                  parameter: 'output',
                  targetValue: 50,
                  tolerance: 5,
                },
                status: 'active',
              },
            ],
      insights: [
        {
          id: 1,
          module_id: 1,
          title: `Konsep Utama ${title}`,
          content: `Simulasi ini dirancang untuk mendemonstrasikan prinsip interaktif pada bidang ${discipline}. Amati bagaimana perubahan variabel kontrol mempengaruhi respons dinamis sistem.`,
        },
      ],
      questions: [
        {
          id: 1,
          module_id: 1,
          question: `Bagaimana pengaruh perubahan variabel terhadap hasil keluaran pada ${title}?`,
          answer:
            'Setiap variabel memiliki pengaruh spesifik terhadap persamaan sistem. Perhatikan perubahan angka saat nilai digeser naik atau turun.',
        },
      ],
    };

    return { module: syntheticModule, params: initialParams };
  }

  return { module: null, params: {} };
}

export function ModuleWorkspace({ moduleSlugOrId }: ModuleWorkspaceProps) {
  const router = useRouter();
  const feedback = useFeedback();
  const { role } = useAuth();
  const isAdminExploring = role === 'admin';

  // Synchronous initial module resolution for instant LCP render
  const initialData = useMemo(() => getInitialModule(moduleSlugOrId), [moduleSlugOrId]);

  // Active module data
  const [module, setModule] = useState<ModuleModel | null>(initialData.module);
  const [loading, setLoading] = useState<boolean>(!initialData.module);
  const [loadError, setLoadError] = useState(false);

  // Simulation Parameters State
  const [params, setParams] = useState<Record<string, number>>(initialData.params);

  const [sessionId, setSessionId] = useState<string | number | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fallbackFromCatalog = () => {
    const fallback = getInitialModule(moduleSlugOrId);
    if (fallback.module) {
      setModule(fallback.module);
      setLoadError(false);
    } else {
      setLoadError(true);
    }
  };

  // Fetch module from Laravel API on mount
  const fetchModuleData = () => {
    if (!initialData.module) {
      setLoading(true);
    }
    setLoadError(false);

    modulesApi
      .getById(moduleSlugOrId)
      .then((res) => {
        if (res.success && res.module) {
          setModule(res.module);

          const simSlug = resolveSimulationSlug(res.module);
          const genlabDef = getGenlabSimulation(simSlug);
          let initialParams = { ...params };
          if (genlabDef?.spec?.parameters) {
            initialParams = Object.fromEntries(
              Object.entries(genlabDef.spec.parameters).map(([k, p]: [string, any]) => [k, p.value])
            );
            setParams(initialParams);
          }

          // Register or restore real learning session in MySQL database (Skipped in Admin Exploration Pure View)
          if (!isAdminExploring) {
            sessionsApi
              .create(res.module.id, initialParams, 25)
              .then((sRes) => {
                if (sRes.success && sRes.session) {
                  setSessionId(sRes.session.id);
                  const rawState = sRes.session.current_state || (sRes.session as unknown as { currentState?: { parameters?: Record<string, number> } }).currentState?.parameters;
                  if (rawState && typeof rawState === 'object' && Object.keys(rawState).length > 0) {
                    setParams((prev) => ({
                      ...prev,
                      ...(rawState as Record<string, number>),
                    }));
                  }
                }
              })
              .catch(() => {});
          }
        } else {
          fallbackFromCatalog();
        }
      })
      .catch(() => {
        fallbackFromCatalog();
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchModuleData();
  }, [moduleSlugOrId]);

  // Sync parameter changes to database session (Skipped in Admin Exploration Pure View)
  useEffect(() => {
    if (!sessionId || isAdminExploring) return;
    const timer = setTimeout(() => {
      sessionsApi.updateState(sessionId, params).catch(() => {});
    }, 1200);
    return () => clearTimeout(timer);
  }, [params, sessionId, isAdminExploring]);

  const simSlug = useMemo(() => resolveSimulationSlug(module), [module]);
  const activeExperiment = module?.experiments?.[0];

  const handleExperimentVerify = (passed: boolean, actualVal?: number, prediction?: string) => {
    const val = actualVal ?? 0;
    if (isAdminExploring) {
      feedback.toast.info('Sesi Eksplorasi Admin: Hasil eksperimen diverifikasi (Pure View — data tidak disimpan ke database).');
      return;
    }
    if (activeExperiment && module) {
      const targetKey = activeExperiment.target?.parameter || 'value';
      modulesApi
        .submitAttempt(module.id || module.slug, activeExperiment.id, {
          state: { ...params },
          computed: { [targetKey]: val, value: val },
          actual_value: val,
          prediction: prediction,
        })
        .catch(() => {});
    }
    if (sessionId) {
      sessionsApi.updateState(sessionId, params, passed ? 100 : 70).catch(() => {});
    }
  };


  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingState message="Menyiapkan ruang belajar modul..." rows={3} />
      </div>
    );
  }

  if (loadError || !module) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <ErrorState
          title="Modul tidak ditemukan atau gagal dimuat."
          message="Pastikan koneksi database aktif dan modul sudah diterbitkan."
          onRetry={fetchModuleData}
        />
      </div>
    );
  }

  return (
    <article className="w-full max-w-[1260px] mx-auto px-3 sm:px-6 md:px-8 py-6 sm:py-10 pb-28 md:pb-16 space-y-10 sm:space-y-12 min-w-0 overflow-x-clip">
      {/* ── ADMIN EXPLORATION PURE VIEW BANNER ── */}
      {isAdminExploring && (
        <aside aria-label="Status Eksplorasi Admin" className="bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-lg px-4 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <IconAlertCircle size={14} className="text-[var(--color-secondary)] shrink-0" />
            <span className="font-semibold text-[var(--color-text)]">Sesi Eksplorasi Admin</span>
            <span className="text-[var(--color-text-secondary)] hidden sm:inline">
              — Pure View (Hanya lihat, data simulasi tidak disimpan ke database)
            </span>
          </div>
          <Link
            href="/admin"
            className="font-semibold text-[var(--color-primary-text)] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Kembali ke Portal Admin</span> &rarr;
          </Link>
        </aside>
      )}

      {/* ── 1. BREADCRUMB & HEADER (SECTION 10: GAMBAR SAMPUL, METADATA, DAN MULAI SIMULASI) ── */}
      <nav aria-label="Navigasi Jejak" className="space-y-6">
        <Link
          href={role === 'admin' ? '/admin/modules' : '/app'}
          className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary-accent)] transition-colors min-h-[36px] max-w-full"
        >
          <IconArrowLeft size={14} className="shrink-0" />
          <span className="truncate">
            {role === 'admin' ? 'Kembali ke Manajemen Modul' : 'Kembali ke Katalog Modul'}
          </span>
        </Link>

        {/* Cover Image Banner */}
        {(module.cover_image || module.thumbnail_image) && (
          <div className="w-full aspect-[21/9] max-h-[300px] rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-subtle)] shadow-xs relative">
            <img
              src={resolveMediaUrl(module.cover_image || module.thumbnail_image)}
              alt={module.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

        <div className="space-y-4 max-w-[860px]">
          {/* Metadata Row: Bidang, Topik, Tingkat, Target Audience, Estimasi Waktu */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="inline-flex items-center gap-1.5 max-w-full truncate px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-mono font-semibold bg-[#1C332A] text-[#4EAA8F] border border-[#2A4D3F] whitespace-nowrap shadow-2xs">
              <ProductEmoji name={(module.discipline?.toLowerCase() || 'physics') as any} size={14} className="shrink-0" />
              <span>{module.discipline || 'Sains'}</span>
            </span>

            {module.topic && (
              <span className="inline-flex items-center max-w-full truncate px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-sans font-semibold bg-[var(--color-surface-subtle)] text-[var(--color-text)] border border-[var(--color-border)] whitespace-nowrap">
                {module.topic}
              </span>
            )}

            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-mono font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] whitespace-nowrap">
              {module.difficulty === 'basic' ? 'Tingkat Dasar' : module.difficulty === 'advanced' ? 'Tingkat Mahir' : 'Tingkat Menengah'}
            </span>

            {module.target_audience && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-mono font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] whitespace-nowrap">
                {module.target_audience}
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] whitespace-nowrap font-mono">
              <IconClock size={13} className="text-[var(--color-secondary)]" />
              <span>{module.estimated_time || '10–15 menit'}</span>
            </span>
          </div>

          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center justify-center shrink-0 shadow-sm mt-1">
              <ProductEmoji name={(module.discipline?.toLowerCase() || 'physics') as any} size={36} variant="3d" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--color-text)] tracking-tight leading-[1.2] break-words">
                {module.title}
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-[var(--color-text-secondary)] leading-relaxed pt-0.5 break-words">
                {module.description}
              </p>
            </div>
          </div>

          {/* Direct CTA: Mulai Simulasi & Bagikan */}
          <div className="pt-2 flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('simulation-canvas-area');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs sm:text-sm font-heading font-semibold transition-all shadow-xs cursor-pointer min-h-[42px] active:scale-[0.98]"
            >
              <IconPlay size={15} className="fill-current" />
              <span>Mulai Simulasi</span>
            </button>

            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] text-xs sm:text-sm font-heading font-semibold text-[var(--color-text)] transition-all shadow-2xs cursor-pointer min-h-[42px] active:scale-[0.98]"
              title="Bagikan tautan dan QR Code simulasi ini"
            >
              <IconShare size={15} />
              <span>Bagikan &amp; QR</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── 2. SINGLE SUPER CANVAS (THE SINGLE MASTER ENGINE FOR ALL DISCIPLINES) ── */}
      <div id="simulation-canvas-area">
        <SuperCanvas
          slug={simSlug}
          initialParams={params}
          mode="student"
          onParameterChange={(key, val) => {
            setParams((prev) => ({ ...prev, [key]: val }));
          }}
          onVerifyExperiment={handleExperimentVerify}
        />
      </div>

      {/* ── 4. SHARE & QR CODE MODAL (SECTION 19) ── */}
      {shareModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 sm:p-6 space-y-5 shadow-floating animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <IconShare size={18} className="text-[var(--color-primary-accent)]" />
                <h3 className="font-heading text-base font-bold text-[var(--color-text)]">
                  Bagikan Simulasi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="p-1 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text)] cursor-pointer"
              >
                <IconClose size={18} />
              </button>
            </div>

            {/* QR Code image */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)]">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                  typeof window !== 'undefined' ? `${window.location.origin}/modules/${module.slug}` : ''
                )}`}
                alt="QR Code Simulasi"
                className="w-40 h-40 rounded-lg bg-white p-2 border border-[var(--color-border-subtle)]"
              />
              <span className="text-[11px] font-mono text-[var(--color-text-secondary)] pt-2">
                Pindai untuk membuka langsung di ponsel
              </span>
            </div>

            {/* URL & Copy button */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-[var(--color-text-secondary)]">
                Tautan Publik:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}/modules/${module.slug}` : ''}
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text)] outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(`${window.location.origin}/modules/${module.slug}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-heading font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 shadow-xs"
                >
                  {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
                  <span>{copied ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
