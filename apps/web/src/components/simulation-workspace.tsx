'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import {
  IconRotateCcw,
  IconAlertTriangle,
  IconDatabase,
  IconClock,
  IconClose,
  IconCheckCircle,
  IconMoreHorizontal,
  IconChevronLeft,
  IconChevronDown,
  IconInfo,
} from '@/components/icons';
import { sessionsApi } from '@/lib/api/sessions';
import { useFeedback } from '@/components/feedback';
import { useAuth } from '@/components/auth-provider';
import {
  registerAllSimulations,
  MASTER_SIMULATION_CATALOG,
  ACTIVE_SIMULATION_CATALOG,
  newtonsSecondLaw,
  projectileMotion,
  momentumCollision,
  functionExplorer,
  vectorMath,
  probabilityCoin,
  sortingVisualizer,
  binarySearch,
  graphTraversal,
  linearRegression,
  normalDistribution,
  supplyDemand,
  compoundInterest,
  phScale,
  GENLAB_SIMULATIONS,
} from '@genlab/simulation-core';
import type { SimulationDefinition } from '@genlab/simulation-core';
import { useSimulationStore } from '@/store/simulation-store';
import { SuperCanvas } from '@/components/simulation/super-canvas';

registerAllSimulations();

const STATIC_SIMULATIONS: Record<string, SimulationDefinition> = {
  ...GENLAB_SIMULATIONS,
  'newtons-second-law': newtonsSecondLaw,
  'projectile-motion': projectileMotion,
  'momentum-collision': momentumCollision,
  'function-explorer': functionExplorer,
  'vector-math': vectorMath,
  'probability-coin': probabilityCoin,
  'sorting-algorithms': sortingVisualizer,
  'binary-search': binarySearch,
  'graph-traversal': graphTraversal,
  'linear-regression': linearRegression,
  'normal-distribution': normalDistribution,
  'supply-demand': supplyDemand,
  'compound-interest': compoundInterest,
  'ph-scale': phScale,
};

const CONCEPT_PROMPTS: Record<string, string> = {
  'newtons-second-law': 'Ubah gaya atau massa dan amati pengaruh langsungnya terhadap percepatan gerak.',
  'projectile-motion': 'Ubah kecepatan awal dan sudut elevasi untuk melihat kurva lintasan gerak peluru.',
  'momentum-collision': 'Ubah massa dan kecepatan kedua benda untuk melihat hukum kekekalan momentum.',
  'function-explorer': 'Geser koefisien a, b, dan c untuk melihat perubahan kurva kuadratik.',
  'vector-math': 'Ubah komponen vektor A dan B untuk mengamati resultan dan perkalian titik.',
  'probability-coin': 'Tentukan jumlah lemparan koin dan amati frekuensi relatif kemunculan gambar.',
  'sorting-algorithms': 'Pilih algoritma pengurutan dan amati bagaimana data disusun langkah demi langkah.',
  'binary-search': 'Tentukan target angka dan amati bagaimana ruang pencarian dipangkas separuh.',
  'graph-traversal': 'Pilih metode traversal (BFS/DFS) dan telusuri simpul graf langkah demi langkah.',
  'linear-regression': 'Sesuaikan kemiringan dan tingkat noise untuk mengamati garis kecocokan terbaik (OLS).',
  'normal-distribution': 'Ubah rata-rata dan deviasi standar untuk melihat kurva distribusi Gauss.',
  'supply-demand': 'Geser kurva permintaan atau penawaran untuk menemukan harga ekuilibrium pasar.',
  'compound-interest': 'Ubah modal awal dan suku bunga untuk melihat efek bunga majemuk terhadap waktu.',
  'ph-scale': 'Sesuaikan tingkat keasaman atau kebasaan untuk mengamati konsentrasi ion hidrogen.',
};

const DOMAIN_LABELS: Record<string, string> = {
  'FISIKA': 'Fisika',
  'MATEMATIKA': 'Matematika',
  'INFORMATIKA': 'Informatika',
  'STATISTIKA': 'Statistika',
  'EKONOMI': 'Ekonomi',
  'KIMIA': 'Kimia',
  'Teknologi Rekayasa Perangkat Lunak': 'TRPL (Informatika)',
  'Akuntansi Perpajakan': 'Akuntansi & Perpajakan',
  'Manajemen Pemasaran Internasional': 'Pemasaran Internasional',
  'Agribisnis Hortikultura': 'Agribisnis Hortikultura',
  'Pengelolaan Konvensi dan Acara': 'Pengelolaan Konvensi & Acara',
};


const SIMULATION_META: Record<
  string,
  { code: string; index: string; domainId: string; disciplineSlug: string; formula: string }
> = {
  'newtons-second-law': { code: 'FIS-01', index: '01 / 14', domainId: 'FISIKA', disciplineSlug: 'physics', formula: 'a = F_net / m' },
  'projectile-motion': { code: 'FIS-02', index: '02 / 14', domainId: 'FISIKA', disciplineSlug: 'physics', formula: 'y = v₀·sin(θ)·t - ½·g·t²' },
  'momentum-collision': { code: 'FIS-03', index: '03 / 14', domainId: 'FISIKA', disciplineSlug: 'physics', formula: 'p_total = m₁v₁ + m₂v₂' },
  'function-explorer': { code: 'MAT-01', index: '04 / 14', domainId: 'MATEMATIKA', disciplineSlug: 'mathematics', formula: 'f(x) = ax² + bx + c' },
  'vector-math': { code: 'MAT-02', index: '05 / 14', domainId: 'MATEMATIKA', disciplineSlug: 'mathematics', formula: 'R = A + B, |R| = √(Rx² + Ry²)' },
  'probability-coin': { code: 'MAT-03', index: '06 / 14', domainId: 'MATEMATIKA', disciplineSlug: 'mathematics', formula: 'P(H) = k / N → 0.50' },
  'sorting-algorithms': { code: 'KOM-01', index: '07 / 14', domainId: 'INFORMATIKA', disciplineSlug: 'computer-science', formula: 'T(n) = O(n²) / O(n log n)' },
  'binary-search': { code: 'KOM-02', index: '08 / 14', domainId: 'INFORMATIKA', disciplineSlug: 'computer-science', formula: 'T(n) = O(log₂ n)' },
  'graph-traversal': { code: 'KOM-03', index: '09 / 14', domainId: 'INFORMATIKA', disciplineSlug: 'computer-science', formula: 'T(V, E) = O(V + E)' },
  'linear-regression': { code: 'STA-01', index: '10 / 14', domainId: 'STATISTIKA', disciplineSlug: 'statistics', formula: 'y = β₁x + β₀ + ε' },
  'normal-distribution': { code: 'STA-02', index: '11 / 14', domainId: 'STATISTIKA', disciplineSlug: 'statistics', formula: 'f(x) = (1 / σ√(2π)) · e^(-½z²)' },
  'supply-demand': { code: 'EKO-01', index: '12 / 14', domainId: 'EKONOMI', disciplineSlug: 'economics', formula: 'Q_d(P) = Q_s(P) → P*' },
  'compound-interest': { code: 'EKO-02', index: '13 / 14', domainId: 'EKONOMI', disciplineSlug: 'economics', formula: 'A = P·(1 + r/n)^(nt)' },
  'ph-scale': { code: 'KIM-01', index: '14 / 14', domainId: 'KIMIA', disciplineSlug: 'chemistry', formula: 'pH = -log₁₀[H⁺]' },
};

function formatFormula(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\times/g, '×')
    .replace(/\\quad/g, ' · ')
    .replace(/\\cdot/g, '·')
    .replace(/\\/g, '')
    .trim();
}

export function normalizeSimulationSlug(slug?: string): string {
  if (!slug) return 'newtons-second-law';
  const clean = slug.toLowerCase().trim().replace(/^wbi-/, '').replace(/_/g, '-');
  const ALIASES: Record<string, string> = {
    'gerak-peluru': 'projectile-motion',
    'kinematika-gerak-peluru': 'projectile-motion',
    'gerak-parabola': 'projectile-motion',
    'parabola': 'projectile-motion',
    'hukum-newton': 'newtons-second-law',
    'hukum-newton-2': 'newtons-second-law',
    'hukum-ii-newton': 'newtons-second-law',
    'newton': 'newtons-second-law',
    'tumbukan': 'momentum-collision',
    'momentum': 'momentum-collision',
    'momentum-dan-tumbukan': 'momentum-collision',
    'fungsi-kuadrat': 'function-explorer',
    'kuadrat': 'function-explorer',
    'vektor': 'vector-math',
    'vektor-2d': 'vector-math',
    'aljabar-vektor': 'vector-math',
    'peluang': 'probability-coin',
    'koin': 'probability-coin',
    'peluang-koin': 'probability-coin',
    'sorting': 'sorting-algorithms',
    'pengurutan': 'sorting-algorithms',
    'pencarian-biner': 'binary-search',
    'graf': 'graph-traversal',
    'bfs-dfs': 'graph-traversal',
    'regresi': 'linear-regression',
    'regresi-linear': 'linear-regression',
    'distribusi-normal': 'normal-distribution',
    'gauss': 'normal-distribution',
    'permintaan-penawaran': 'supply-demand',
    'pasar': 'supply-demand',
    'bunga-majemuk': 'compound-interest',
    'investasi': 'compound-interest',
    'ph': 'ph-scale',
    'skala-ph': 'ph-scale',
  };
  return ALIASES[clean] || clean;
}

interface SimulationWorkspaceProps {
  slug?: string;
  initialSlug?: string;
}

export function SimulationWorkspace({ slug, initialSlug }: SimulationWorkspaceProps) {
  const feedback = useFeedback();

  // Active topic state with robust alias normalization
  const [currentSlug, setCurrentSlug] = useState<string>(() => {
    return normalizeSimulationSlug(slug || initialSlug || 'newtons-second-law');
  });

  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);
  const [topicDropdownOpen, setTopicDropdownOpen] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  // Database persistence state
  const [sessionId, setSessionId] = useState<string>('sess-init');
  const [dbStatus, setDbStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('00:00:00');
  const [saveCount, setSaveCount] = useState(1);
  const [showDbInspector, setShowDbInspector] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<any | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);

  useEffect(() => {
    setSessionId(`sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
    setLastSavedTime(new Date().toLocaleTimeString('id-ID'));
  }, []);

  const overflowRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    definition,
    spec,
    state,
    experimentHistory,
    loadSimulation,
    setParameter,
    resetParameters,
    addChatMessage,
  } = useSimulationStore();
  const { role } = useAuth();
  const isAdminExploring = role === 'admin';

  const handleResetParameters = () => {
    feedback.confirm({
      title: 'Atur Ulang Variabel Eksperimen?',
      description: 'Seluruh nilai parameter kontrol akan dikembalikan ke konfigurasi standar awal modul ini.',
      variant: 'warning',
      confirmLabel: 'Atur Ulang',
      cancelLabel: 'Batal',
      onConfirm: () => {
        resetParameters();
        feedback.toast.info('Variabel eksperimen dikembalikan ke kondisi awal.');
      },
    });
  };

  // Read URL query parameter ?topic= on initial client mount if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const topic = new URLSearchParams(window.location.search).get('topic');
      if (topic) {
        const norm = normalizeSimulationSlug(topic);
        if (norm !== currentSlug) {
          setCurrentSlug(norm);
        }
      }
    }
  }, []);

  // Update if slug prop changes externally
  useEffect(() => {
    if (slug) {
      const norm = normalizeSimulationSlug(slug);
      if (norm !== currentSlug) {
        setCurrentSlug(norm);
      }
    }
  }, [slug]);

  // Click outside listener for menus
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setOverflowMenuOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTopicDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load target simulation when currentSlug changes
  useEffect(() => {
    const targetDef = STATIC_SIMULATIONS[currentSlug];
    if (targetDef) {
      loadSimulation(targetDef);
      addChatMessage(
        'assistant',
        `Modul ${targetDef.spec.title} aktif. Geser variabel eksperimen untuk mengamati respon sistem secara langsung.`
      );
    }
  }, [currentSlug, loadSimulation, addChatMessage]);

  // Debounced auto-save session state to backend database/storage (Skipped in Admin Exploration Pure View)
  useEffect(() => {
    if (!currentSlug || !state) return;
    if (isAdminExploring) {
      setDbStatus('saved');
      return;
    }
    setDbStatus('saving');
    const timer = setTimeout(async () => {
      try {
        const res = await sessionsApi.create(currentSlug, {
          parameters: state?.parameters || {},
          computed: state?.computed || {},
          changes: experimentHistory[experimentHistory.length - 1]?.parameterChanges || [],
        });

        if (res.success) {
          setDbStatus('saved');
          setLastSavedTime(new Date().toLocaleTimeString('id-ID'));
          setSaveCount((prev) => prev + 1);
        } else {
          setDbStatus('error');
        }
      } catch {
        setDbStatus('error');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [currentSlug, state?.parameters, state?.computed, experimentHistory, isAdminExploring]);

  const activeDef = definition || STATIC_SIMULATIONS[currentSlug];
  const activeSpec = spec || activeDef?.spec;
  const simMeta = SIMULATION_META[currentSlug] || {
    code: (activeDef as any)?.discipline ? 'GEN' : 'LAB',
    index: '01 / 34',
    domainId: (activeDef as any)?.discipline || 'GEN LABS',
    disciplineSlug: (activeDef as any)?.category || 'general',
    formula: (activeDef as any)?.formulaLatex || '',
  };


  const activeParams = useMemo(() => {
    if (state?.parameters) return state.parameters;
    if (activeDef) {
      return Object.fromEntries(
        Object.entries(activeDef.spec.parameters).map(([k, p]: [string, any]) => [k, p.value])
      );
    }
    return {};
  }, [state, activeDef]);

  const activeComputed = useMemo(() => {
    if (state?.computed) return state.computed;
    if (activeDef) {
      return activeDef.compute(activeParams);
    }
    return {};
  }, [state, activeDef, activeParams]);

  // Handle switching topic seamlessly without page reload
  const handleSelectLesson = (slugKey: string) => {
    setTopicDropdownOpen(false);
    if (slugKey === currentSlug) return;
    setCurrentSlug(slugKey);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('topic', slugKey);
      window.history.replaceState(null, '', url.pathname + url.search);
    }
  };

  // Live test database connection via API
  const handleTestDatabaseApi = async () => {
    setIsTestingApi(true);
    setApiTestResult(null);
    try {
      const start = performance.now();
      const res = await sessionsApi.list();
      const latency = Math.round(performance.now() - start);
      setApiTestResult({
        status: 200,
        statusText: 'OK',
        latencyMs: latency,
        data: res,
      });
    } catch (err: any) {
      setApiTestResult({
        status: 500,
        error: err?.message || 'Gagal menghubungi server.',
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  if (!activeDef || !activeSpec) {
    const catalogItem = MASTER_SIMULATION_CATALOG.find((item) => item.slug === currentSlug);
    const isComingSoon = catalogItem?.status === 'coming_soon';

    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 text-center space-y-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm">
          <div className="w-12 h-12 mx-auto bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] rounded-lg flex items-center justify-center">
            {isComingSoon ? <IconClock size={20} /> : <IconAlertTriangle size={20} />}
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-sans font-semibold text-[var(--color-primary-text)] uppercase tracking-wider">
              {catalogItem?.discipline || 'Laboratorium'} / {isComingSoon ? 'Tahap Riset & Kalibrasi' : 'Katalog'}
            </span>
            <h2 className="font-heading text-lg font-bold text-[var(--color-text)]">
              {catalogItem?.title || `Topik "${currentSlug}"`}
            </h2>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            {isComingSoon
              ? (catalogItem?.description || 'Modul ini sedang dirancang dan dikalibrasi untuk laboratorium interaktif GEN LABS.')
              : `Topik "${currentSlug}" belum terdaftar dalam 14 modul terkalibrasi saat ini.`}
          </p>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href={role === 'admin' ? '/admin/modules' : '/app'}
              className="w-full py-2.5 px-4 bg-[var(--color-primary)] text-white font-medium rounded-md text-xs text-center hover:opacity-95 transition-opacity"
            >
              Jelajahi 14 Modul Terkalibrasi
            </Link>
            <button
              type="button"
              onClick={() => handleSelectLesson('newtons-second-law')}
              className="w-full py-2 px-4 bg-[var(--color-surface-subtle)] text-[var(--color-text)] font-medium rounded-md text-xs border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
            >
              Buka Praktikum Hukum II Newton
            </button>
          </div>
        </div>
      </div>
    );
  }

  const domainLabel = DOMAIN_LABELS[simMeta.domainId] || simMeta.domainId;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-24 sm:pb-16 flex flex-col">
      {/* ── ADMIN EXPLORATION PURE VIEW BANNER ── */}
      {isAdminExploring && (
        <aside aria-label="Status Eksplorasi Admin" className="bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)] px-4 sm:px-6 md:px-8 py-2 flex items-center justify-between text-xs z-50">
          <div className="flex items-center gap-2">
            <IconInfo size={14} className="text-[var(--color-secondary)] shrink-0" />
            <span className="font-semibold text-[var(--color-text)]">Sesi Eksplorasi Admin</span>
            <span className="text-[var(--color-text-secondary)] hidden sm:inline">
              — Pure View (Hanya lihat, data simulasi tidak disimpan ke database)
            </span>
          </div>
          <Link
            href="/admin"
            className="font-semibold text-[var(--color-primary-text)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Kembali ke Portal Admin</span> &rarr;
          </Link>
        </aside>
      )}

      {/* ── 1. MINIMAL WORKSPACE HEADER (DISTRACTION-FREE) ── */}
      <header className="w-full border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-40 transition-colors shadow-2xs">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 md:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Back Link & Topic Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href={role === 'admin' ? '/admin' : '/app'}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] border border-transparent hover:border-[var(--color-border)] transition-colors flex items-center gap-1.5 text-xs font-mono font-semibold shrink-0"
              title={role === 'admin' ? 'Kembali ke Portal Admin' : 'Kembali ke Laboratorium'}
              aria-label={role === 'admin' ? 'Kembali ke Portal Admin' : 'Kembali ke Laboratorium'}
            >
              <IconChevronLeft size={16} />
              <span className="hidden sm:inline">{role === 'admin' ? 'Portal Admin' : 'Laboratorium'}</span>
            </Link>

            <div className="h-5 w-px bg-[var(--color-border)] hidden sm:block" />

            {/* Topic Dropdown Switcher */}
            <div className="relative min-w-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setTopicDropdownOpen(!topicDropdownOpen)}
                className="flex items-center gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-all text-left cursor-pointer min-w-0 shadow-2xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="text-[10px] sm:text-[11px] font-mono text-[var(--color-primary-accent)] font-bold uppercase tracking-wider truncate">
                    {domainLabel} / {simMeta.code}
                  </div>
                  <h1 className="flex items-center gap-1.5 font-heading text-xs sm:text-sm font-bold text-[var(--color-text)] truncate max-w-[160px] sm:max-w-xs md:max-w-sm">
                    <span className="truncate">{activeSpec.title}</span>
                    <IconChevronDown size={13} className="text-[var(--color-text-secondary)] shrink-0" />
                  </h1>
                </div>
              </button>

              {/* Topic Select Menu */}
              {topicDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 sm:w-80 p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-floating z-50 max-h-80 overflow-y-auto space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-secondary)] border-b border-[var(--color-border-subtle)] font-bold">
                    Pilih Modul Laboratorium (14)
                  </div>
                  {ACTIVE_SIMULATION_CATALOG.map((item) => (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => handleSelectLesson(item.slug)}
                      className={`w-full p-2.5 rounded-xl text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        currentSlug === item.slug
                          ? 'bg-[#152B1E] text-[var(--color-primary-accent)] font-bold border border-[#2D4C38]'
                          : 'text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]'
                      }`}
                    >
                      <span className="truncate pr-2 font-medium">{item.title}</span>
                      <span className="text-[11px] font-mono text-[var(--color-text-secondary)] shrink-0">{item.discipline}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Formula Badge, Reset, Help, Overflow Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {simMeta.formula && (
              <span
                title={formatFormula(simMeta.formula)}
                className="hidden xl:inline-flex items-center px-3 py-1.5 rounded-lg bg-[#152B1E] border border-[#2D4C38] text-xs font-mono font-bold text-[var(--color-primary-accent)] max-w-[260px] truncate shadow-2xs"
              >
                {formatFormula(simMeta.formula)}
              </span>
            )}

            {/* Reset Variables Button */}
            <button
              onClick={handleResetParameters}
              className="p-1.5 sm:p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] border border-transparent hover:border-[var(--color-border)] transition-colors cursor-pointer"
              title="Kembalikan variabel ke nilai awal"
              aria-label="Atur ulang variabel"
            >
              <IconRotateCcw size={15} />
            </button>

            {/* Instructions / Help Trigger */}
            <button
              type="button"
              onClick={() => setInstructionsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-heading font-semibold bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-all cursor-pointer shadow-2xs"
              title="Petunjuk interaksi praktikum"
              aria-label="Petunjuk interaksi praktikum"
            >
              <IconInfo size={14} className="text-[var(--color-secondary)]" />
              <span className="hidden sm:inline">Petunjuk</span>
            </button>

            {/* Overflow Options Menu */}
            <div className="relative" ref={overflowRef}>
              <button
                type="button"
                onClick={() => setOverflowMenuOpen(!overflowMenuOpen)}
                className="p-1.5 sm:p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] border border-transparent hover:border-[var(--color-border)] transition-colors cursor-pointer"
                title="Menu opsi lanjutan"
                aria-label="Opsi lanjutan"
              >
                <IconMoreHorizontal size={16} />
              </button>

              {overflowMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-floating z-50 space-y-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setOverflowMenuOpen(false);
                      setShowDbInspector(true);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] flex items-center gap-2.5 cursor-pointer font-medium"
                  >
                    <IconDatabase size={14} className="text-[var(--color-primary)]" />
                    <span>Status Penyimpanan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOverflowMenuOpen(false);
                      resetParameters();
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] flex items-center gap-2.5 cursor-pointer"
                  >
                    <IconRotateCcw size={14} />
                    <span>Kembalikan Nilai Awal</span>
                  </button>
                  <div className="pt-1.5 mt-1 border-t border-[var(--color-border-subtle)] px-3 py-1 text-[11px] font-mono text-[var(--color-text-secondary)]">
                    <span>Sinkronisasi otomatis aktif</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. MAIN LEARNING WORKSPACE VIEWPORT ── */}
      <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 space-y-10 flex-1 flex flex-col">
        {/* ── THE SINGLE SUPER CANVAS ── */}
        <SuperCanvas
          slug={currentSlug}
          initialParams={activeParams}
          mode="student"
          onParameterChange={(key, val) => {
            setParameter(key, val);
          }}
          onVerifyExperiment={(passed, actualVal, prediction) => {
            if (isAdminExploring) {
              feedback.toast.info('Sesi Eksplorasi Admin: Hasil eksperimen diverifikasi (Pure View — data tidak disimpan ke database).');
              return;
            }
            sessionsApi.create(currentSlug, {
              ...activeParams,
              actualValue: actualVal,
              prediction,
            }, passed ? 100 : 70).catch(() => {});
          }}
        />
      </main>


      {/* ── 5. LEARNING INSTRUCTIONS MODAL (Section 13: TRY THIS) ── */}
      {instructionsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-sans font-semibold text-[var(--color-primary-text)] uppercase tracking-wider">
                  Panduan Belajar Mandiri
                </span>
                <h3 className="font-heading text-base font-bold text-[var(--color-text)]">
                  Cara Bereksperimen di Laboratorium
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInstructionsOpen(false)}
                className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] rounded-md cursor-pointer"
                aria-label="Tutup instruksi"
              >
                <IconClose size={15} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[var(--color-text-secondary)]">
              <div className="p-3 bg-[var(--color-surface-subtle)] rounded-md border border-[var(--color-border-subtle)] flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-[var(--color-primary-accent)] bg-[#152B1E] border border-[#2D4C38] px-2 py-0.5 rounded-sm shrink-0">1</span>
                <div>
                  <strong className="text-[var(--color-text)] block font-semibold mb-0.5">Pilih & Amati Objek</strong>
                  <p className="leading-relaxed">Perhatikan elemen grafis pada kanvas laboratorium (posisi, lintasan gerak, atau sebaran data).</p>
                </div>
              </div>

              <div className="p-3 bg-[var(--color-surface-subtle)] rounded-md border border-[var(--color-border-subtle)] flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-[var(--color-primary-accent)] bg-[#152B1E] border border-[#2D4C38] px-2 py-0.5 rounded-sm shrink-0">2</span>
                <div>
                  <strong className="text-[var(--color-text)] block font-semibold mb-0.5">Atur Variabel Bebas</strong>
                  <p className="leading-relaxed">Geser tombol di bawah kanvas untuk melihat bagaimana perubahan variabel memengaruhi gerak atau perhitungan.</p>
                </div>
              </div>

              <div className="p-3 bg-[var(--color-surface-subtle)] rounded-md border border-[var(--color-border-subtle)] flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-[var(--color-primary-accent)] bg-[#152B1E] border border-[#2D4C38] px-2 py-0.5 rounded-sm shrink-0">3</span>
                <div>
                  <strong className="text-[var(--color-text)] block font-semibold mb-0.5">Amati Perubahan Hasil</strong>
                  <p className="leading-relaxed">Perhatikan pergerakan objek, grafik, atau hasil perhitungan yang langsung berubah di layar kanvas.</p>
                </div>
              </div>

              <div className="p-3 bg-[var(--color-surface-subtle)] rounded-md border border-[var(--color-border-subtle)] flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-[var(--color-primary-accent)] bg-[#152B1E] border border-[#2D4C38] px-2 py-0.5 rounded-sm shrink-0">4</span>
                <div>
                  <strong className="text-[var(--color-text)] block font-semibold mb-0.5">Uji Pemahaman Lewat Tantangan</strong>
                  <p className="leading-relaxed">Buka tab Tantangan Praktikum untuk menguji pemahaman konsep secara terarah.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--color-border-subtle)] flex justify-end">
              <button
                type="button"
                onClick={() => setInstructionsOpen(false)}
                className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
              >
                Mulai Eksperimen
              </button>
            </div>
          </div>
        </div>
      )}



      {/* ── 7. STATUS PENYIMPANAN MODAL ── */}
      {showDbInspector && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-5 sm:p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <IconDatabase size={16} className="text-[var(--color-primary-accent)]" />
                  <h3 className="font-heading text-sm sm:text-base font-bold text-[var(--color-text)]">
                    Status Penyimpanan Eksperimen
                  </h3>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Variabel dan progres eksperimen Anda disimpan secara otomatis agar tidak hilang saat halaman ditutup.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDbInspector(false)}
                className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] rounded-md cursor-pointer"
                aria-label="Tutup modal"
              >
                <IconClose size={15} />
              </button>
            </div>

            {/* Spec Table */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-sans font-semibold text-[var(--color-primary-accent)] uppercase tracking-wider">
                1. Status Penyimpanan Otomatis
              </h4>
              <div className="bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] rounded-md p-3 space-y-1.5 text-xs">
                <div className="flex justify-between py-0.5">
                  <span className="text-[var(--color-text-secondary)]">Status:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Tersimpan Otomatis (Terakhir: {lastSavedTime})
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-[var(--color-text-secondary)]">Penyimpanan Otomatis:</span>
                  <span className="text-[var(--color-text)]">{saveCount} kali pembaharuan</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-[var(--color-text-secondary)]">Lokasi:</span>
                  <span className="text-[var(--color-text)]">Laboratorium Virtual Interaktif GEN LABS</span>
                </div>
              </div>
            </div>

            {/* Session Snapshot */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-sans font-semibold text-[var(--color-primary-accent)] uppercase tracking-wider">
                2. Ringkasan Eksperimen
              </h4>
              <div className="bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] rounded-md p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Simulasi:</span>
                  <span className="text-[var(--color-primary-text)] font-semibold">{simMeta.code} / {activeSpec.title}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-secondary)] block mb-1">Daftar Variabel Aktif:</span>
                  <div className="p-2.5 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-sm text-[11px] text-[var(--color-text)] space-y-1">
                    {Object.entries(activeParams).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">{k.replace(/_/g, ' ')}:</span>
                        <span className="font-semibold text-[var(--color-primary-text)]">{Number(v).toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Live API Ping Test */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-sans font-semibold text-[var(--color-primary-text)] uppercase tracking-wider">
                  3. Sambungan Laboratorium
                </h4>
                <button
                  type="button"
                  onClick={handleTestDatabaseApi}
                  disabled={isTestingApi}
                  className="px-3 py-1 bg-[var(--color-primary)] text-white text-xs font-medium rounded-md hover:bg-[var(--color-primary-hover)] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <IconDatabase size={12} />
                  <span>{isTestingApi ? 'Memeriksa...' : 'Periksa Sambungan'}</span>
                </button>
              </div>

              {apiTestResult && (
                <div className="p-3 bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] rounded-md space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <IconCheckCircle size={14} />
                    <span>Sambungan Laboratorium: Stabil & Terhubung</span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">
                    Eksperimen Anda terhubung dengan laboratorium virtual interaktif GEN LABS.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
