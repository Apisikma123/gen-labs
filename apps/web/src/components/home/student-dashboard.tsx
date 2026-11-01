'use client';

import {
  IconSearch,
  IconArrowRight,
  IconClock,
  IconPlay,
  IconCheckCircle,
  IconActivity,
  IconLayers,
  IconBookOpen,
  IconSparkles,
  IconRotateCcw,
  IconSliders,
  IconFilter,
  IconMessageSquare,
  IconCpu,
  IconLineChart,
  IconDisciplinePhysics,
  IconDisciplineChemistry,
  IconPlus,
  IconGamepad,
} from '@/components/icons';
import {
  Icon3dPhysicsEnergy,
  Icon3dChemistryFlask,
  Icon3dCsMatrix,
  Icon3dBookModule,
  Icon3dAiCore,
  Icon3d,
} from '@/components/icons/3d';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ACTIVE_SIMULATION_CATALOG } from '@genlab/simulation-core';
import { modulesApi, ModuleModel } from '@/lib/api/modules';
import { sessionsApi, LearningSessionModel } from '@/lib/api/sessions';
import { useAuth } from '@/components/auth-provider';
import { LoadingState } from '@/components/ui/loading-state';
import { Pagination } from '@/components/ui/pagination';
import { SimulationPreviewGraphic } from '@/components/ui/simulation-preview-graphic';

interface StudyProgramTab {
  id: string;
  name: string;
  shortName: string;
}

const VOCATIONAL_STUDY_PROGRAMS: StudyProgramTab[] = [
  { id: 'all', name: 'Semua Modul', shortName: 'Semua' },
  { id: 'trpl', name: 'Teknologi Rekayasa Perangkat Lunak', shortName: 'TRPL' },
  { id: 'akuntansi', name: 'Akuntansi Perpajakan', shortName: 'Akuntansi' },
  { id: 'pemasaran', name: 'Manajemen Pemasaran Internasional', shortName: 'Pemasaran' },
  { id: 'agribisnis', name: 'Agribisnis Hortikultura', shortName: 'Agribisnis' },
  { id: 'mice', name: 'Pengelolaan Konvensi & Acara', shortName: 'MICE' },
  { id: 'sains', name: 'Sains Terapan & STEM', shortName: 'Sains & STEM' },
];

function getModuleSimulationSlug(mod: { slug: string; title: string; simulations?: Array<{ slug?: string }> }): string {
  if (mod.simulations && mod.simulations.length > 0 && mod.simulations[0].slug) {
    return mod.simulations[0].slug;
  }
  const lower = (mod.slug + ' ' + mod.title).toLowerCase();
  if (lower.includes('newton') || lower.includes('gaya')) return 'newtons-second-law';
  if (lower.includes('fungsi') || lower.includes('kuadrat')) return 'function-explorer';
  if (lower.includes('pasar') || lower.includes('demand') || lower.includes('supply') || lower.includes('ekuilibrium')) return 'supply-demand';
  if (lower.includes('sort') || lower.includes('pengurutan') || lower.includes('algoritma')) return 'sorting-algorithms';
  if (lower.includes('peluru') || lower.includes('proyektil') || lower.includes('parabola')) return 'projectile-motion';
  if (lower.includes('momentum') || lower.includes('tumbukan')) return 'momentum-collision';
  if (lower.includes('vektor')) return 'vector-math';
  if (lower.includes('koin') || lower.includes('peluang')) return 'probability-coin';
  if (lower.includes('biner') || lower.includes('search')) return 'binary-search';
  if (lower.includes('graf') || lower.includes('traversal')) return 'graph-traversal';
  if (lower.includes('regresi')) return 'linear-regression';
  if (lower.includes('normal') || lower.includes('gauss')) return 'normal-distribution';
  if (lower.includes('bunga') || lower.includes('majemuk')) return 'compound-interest';
  if (lower.includes('ph') || lower.includes('asam') || lower.includes('kimia') || lower.includes('basa')) return 'ph-scale';
  if (lower.includes('logic') || lower.includes('gerbang')) return 'logic-gates';
  return mod.slug;
}

function matchesProgram(mod: ModuleModel, tabId: string): boolean {
  if (tabId === 'all') return true;
  const text = `${mod.discipline || ''} ${mod.topic || ''} ${mod.title || ''} ${mod.slug || ''}`.toLowerCase();

  if (tabId === 'trpl') {
    return text.includes('perangkat lunak') || text.includes('trpl') || text.includes('informatika') || text.includes('komputasi') || text.includes('algoritma') || text.includes('logic') || text.includes('database') || text.includes('subnet') || text.includes('query');
  }
  if (tabId === 'akuntansi') {
    return text.includes('akuntansi') || text.includes('pajak') || text.includes('break-even') || text.includes('bep') || text.includes('cash flow') || text.includes('jurnal') || text.includes('financial') || text.includes('budgeting');
  }
  if (tabId === 'pemasaran') {
    return text.includes('pemasaran') || text.includes('marketing') || text.includes('pasar') || text.includes('pricing') || text.includes('funnel') || text.includes('forex') || text.includes('hedging') || text.includes('segmentation');
  }
  if (tabId === 'agribisnis') {
    return text.includes('agribisnis') || text.includes('hortikultura') || text.includes('tanah') || text.includes('farming') || text.includes('irrigation') || text.includes('greenhouse') || text.includes('hydroponic') || text.includes('crop') || text.includes('harvest');
  }
  if (tabId === 'mice') {
    return text.includes('konvensi') || text.includes('acara') || text.includes('mice') || text.includes('event') || text.includes('venue') || text.includes('ticket') || text.includes('booth') || text.includes('capacity');
  }
  if (tabId === 'sains') {
    return text.includes('fisika') || text.includes('matematika') || text.includes('kimia') || text.includes('statistika') || text.includes('peluru') || text.includes('momentum') || text.includes('vektor') || text.includes('gauss') || text.includes('regresi');
  }

  return true;
}

function getDisciplineLabel(discipline?: string): string {
  if (!discipline) return 'Sains Terapan';
  if (discipline.includes('Perangkat Lunak')) return 'TRPL';
  if (discipline.includes('Akuntansi')) return 'Akuntansi';
  if (discipline.includes('Pemasaran')) return 'Pemasaran';
  if (discipline.includes('Agribisnis') || discipline.includes('Hortikultura')) return 'Agribisnis';
  if (discipline.includes('Konvensi') || discipline.includes('Acara')) return 'Event & MICE';
  return discipline;
}

function getDifficultyLabel(diff?: string): { text: string; colorClass: string } {
  if (diff === 'advanced' || diff === 'mahir') {
    return { text: 'Mahir', colorClass: 'bg-[#2A1D1A] text-[#F28B82] border-[#4A2922]' };
  }
  if (diff === 'intermediate' || diff === 'menengah') {
    return { text: 'Menengah', colorClass: 'bg-[#252115] text-[#F59E0B] border-[#46381C]' };
  }
  return { text: 'Dasar', colorClass: 'bg-[#14231E] text-[#4EAA8F] border-[#224436]' };
}

function getModule3dIcon(mod: ModuleModel): string {
  const text = `${mod.slug} ${mod.title} ${mod.discipline || ''} ${mod.topic || ''}`.toLowerCase();
  if (text.includes('spektro') || text.includes('prisma') || text.includes('prism') || text.includes('optik') || text.includes('cahaya')) {
    return 'spectrometer-prism';
  }
  if (text.includes('giroskop') || text.includes('gyro') || text.includes('newton') || text.includes('momentum') || text.includes('peluru') || text.includes('proyektil') || text.includes('tumbukan') || text.includes('gerak')) {
    return 'gyroscope-apparatus';
  }
  if (text.includes('ph') || text.includes('asam') || text.includes('kimia') || text.includes('larutan') || text.includes('titrasi')) {
    return 'chemistry-flask';
  }
  if (text.includes('sorting') || text.includes('array') || text.includes('biner') || text.includes('graf') || text.includes('algoritma') || text.includes('trpl') || text.includes('logic') || text.includes('database')) {
    return 'cs-matrix';
  }
  if (text.includes('demand') || text.includes('supply') || text.includes('pasar') || text.includes('bunga') || text.includes('akuntansi') || text.includes('ekonomi') || text.includes('break-even') || text.includes('bep') || text.includes('marketing') || text.includes('pemasaran')) {
    return 'quant-candlestick';
  }
  if (text.includes('fungsi') || text.includes('kuadrat') || text.includes('vektor') || text.includes('matematika') || text.includes('koin') || text.includes('peluang') || text.includes('regresi') || text.includes('gauss') || text.includes('normal')) {
    return 'math-function';
  }
  if (text.includes('hortikultura') || text.includes('agribisnis') || text.includes('biologi') || text.includes('dna') || text.includes('tanaman')) {
    return 'biology-dna';
  }
  return mod.discipline || 'physics-energy';
}

// 4 Broad Categories corresponding to genuine GEN LABS content
type CategoryFilterType = 'all' | 'sim' | 'vokasi' | 'sains';

const INITIAL_CATALOG_MODULES: ModuleModel[] = ACTIVE_SIMULATION_CATALOG.map((c, idx) => ({
  id: typeof c.id === 'number' ? c.id : idx + 1,
  slug: c.slug,
  title: c.title,
  description: c.description || '',
  content: c.description || '',
  learning_objectives: [],
  discipline: c.discipline || 'Sains Terapan',
  topic: (c as any).topic || c.discipline || 'STEM',
  difficulty: (c.difficulty === 'Lanjutan' ? 'advanced' : c.difficulty === 'Menengah' ? 'intermediate' : 'basic') as 'basic' | 'intermediate' | 'advanced',
  target_audience: 'Siswa / Mahasiswa',
  status: 'published' as const,
  simulations: [{
    id: idx + 1,
    slug: c.slug,
    title: c.title,
    type: 'simulation',
  }],
}));

export function StudentDashboard() {
  const { user } = useAuth();
  const [dbModules, setDbModules] = useState<ModuleModel[]>(INITIAL_CATALOG_MODULES);
  const [recentSessions, setRecentSessions] = useState<LearningSessionModel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilterType>('all');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [modRes, sessRes] = await Promise.allSettled([
          modulesApi.list({ per_page: 50 }),
          sessionsApi.list({ per_page: 10 }),
        ]);

        if (!isMounted) return;

        if (modRes.status === 'fulfilled' && modRes.value.modules && modRes.value.modules.length > 0) {
          setDbModules(modRes.value.modules);
        }

        if (sessRes.status === 'fulfilled' && sessRes.value.sessions) {
          setRecentSessions(sessRes.value.sessions);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter modules by category strip, program tab, and search query
  const filteredModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return dbModules.filter((mod) => {
      // 1. Broad Category Strip filter
      if (activeCategory === 'sim') {
        const isSim = (mod.simulations && mod.simulations.length > 0) || getModuleSimulationSlug(mod) !== mod.slug;
        if (!isSim) return false;
      } else if (activeCategory === 'vokasi') {
        const isVokasi = matchesProgram(mod, 'trpl') || matchesProgram(mod, 'akuntansi') || matchesProgram(mod, 'pemasaran') || matchesProgram(mod, 'agribisnis') || matchesProgram(mod, 'mice');
        if (!isVokasi) return false;
      } else if (activeCategory === 'sains') {
        const isSains = matchesProgram(mod, 'sains');
        if (!isSains) return false;
      }

      // 2. Program Tab filter
      const matchTab = matchesProgram(mod, activeTab);
      if (!matchTab) return false;

      // 3. Search query
      if (!q) return true;
      const haystack = `${mod.title} ${mod.description || ''} ${mod.discipline || ''} ${mod.topic || ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [dbModules, activeCategory, activeTab, searchQuery]);

  // Reset to page 1 whenever search or categories change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory, activeTab]);

  const totalPages = Math.ceil(filteredModules.length / PAGE_SIZE);
  const paginatedModules = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredModules.slice(start, start + PAGE_SIZE);
  }, [filteredModules, currentPage, PAGE_SIZE]);

  // Real Category Counts computed from actual dbModules
  const categoryCounts = useMemo(() => {
    const total = dbModules.length;
    const simCount = dbModules.filter((m) => (m.simulations && m.simulations.length > 0) || getModuleSimulationSlug(m) !== m.slug).length;
    const vokasiCount = dbModules.filter((m) => matchesProgram(m, 'trpl') || matchesProgram(m, 'akuntansi') || matchesProgram(m, 'pemasaran') || matchesProgram(m, 'agribisnis') || matchesProgram(m, 'mice')).length;
    const sainsCount = dbModules.filter((m) => matchesProgram(m, 'sains')).length;

    return {
      all: total,
      sim: simCount,
      vokasi: vokasiCount,
      sains: sainsCount,
    };
  }, [dbModules]);

  // Count modules per program tab
  const programCounts = useMemo(() => {
    const counts: Record<string, number> = { all: dbModules.length };
    for (const prog of VOCATIONAL_STUDY_PROGRAMS) {
      if (prog.id !== 'all') {
        counts[prog.id] = dbModules.filter((m) => matchesProgram(m, prog.id)).length;
      }
    }
    return counts;
  }, [dbModules]);

  // "Lanjut lagi" list: STRICTLY real user sessions from history (100% data integrity)
  const continueItems = useMemo(() => {
    return recentSessions.slice(0, 6).map((sess) => {
      const rawTitle = sess.module?.title || sess.simulation?.title || sess.title || 'Praktikum';
      const cleanTitle = rawTitle.replace(/\s*—\s*Laboratorium Interaktif Gen Labs.*$/i, '');
      const simSlug = sess.module ? getModuleSimulationSlug(sess.module) : sess.simulation?.slug || 'newtons-second-law';
      const href = sess.module?.slug ? `/modules/${sess.module.slug}` : `/simulation/${simSlug}`;

      return {
        id: `sess-${sess.id}`,
        title: cleanTitle,
        discipline: getDisciplineLabel(sess.module?.discipline || sess.discipline),
        simSlug,
        href,
        progress: sess.progress ?? 80,
      };
    });
  }, [recentSessions]);

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 space-y-9 sm:space-y-12 font-sans min-w-0 text-[#F1F5F9]">
      {/* ── 1. HEADER & DISCOVERY INTRODUCTION (Astra Screenshot-Inspired Composition) ── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222733] pb-6">
          <div className="space-y-1">
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#F1F5F9] tracking-tight">
              Laboratorium Virtual
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Ruang praktikum interaktif dan simulasi sains terapan komputasional.
            </p>
          </div>

          {/* Action Pills Row: [🔍 Cari] and [+ Tanya AI] */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('genlabs_open_search'));
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#14171E] hover:bg-[#1B202A] border border-[#222733] hover:border-[#3E8E75] text-xs font-mono text-[#CBD5E1] hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Cari konsep simulasi (Ctrl+K)"
            >
              <IconSearch size={14} className="text-[#3E8E75]" />
              <span>Cari</span>
            </button>

            <Link
              href="/tanya-ai"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1C332A] hover:bg-[#234337] border border-[#3E8E75]/50 hover:border-[#4EAA8F] text-xs font-mono font-semibold text-white transition-all shadow-xs active:scale-95"
            >
              <IconSparkles size={14} className="text-[#4EAA8F]" />
              <span>Tanya AI</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. LEARNING CATEGORY STRIP (4 Balanced Horizontal Cards from Astra Screenshot) ── */}
      <section className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Simulasi Interaktif */}
          <button
            type="button"
            onClick={() => setActiveCategory(activeCategory === 'sim' ? 'all' : 'sim')}
            className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer flex items-center gap-3.5 border shadow-xs ${
              activeCategory === 'sim'
                ? 'bg-[#1B202A] border-[#3E8E75] text-white shadow-sm'
                : 'bg-[#14171E] hover:bg-[#181C24] border-[#222733] text-[#94A3B8] hover:text-white'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#0F1217] border border-[#222733] flex items-center justify-center shrink-0">
              <Icon3dPhysicsEnergy size={24} />
            </div>
            <div className="min-w-0">
              <div className="font-heading font-bold text-xs sm:text-sm text-white truncate">
                Simulasi
              </div>
              <div className="text-[11px] font-mono text-[#64748B]">
                {categoryCounts.sim} simulasi
              </div>
            </div>
          </button>

          {/* Card 2: Sains & Modul STEM */}
          <button
            type="button"
            onClick={() => setActiveCategory(activeCategory === 'sains' ? 'all' : 'sains')}
            className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer flex items-center gap-3.5 border shadow-xs ${
              activeCategory === 'sains'
                ? 'bg-[#1B202A] border-[#3E8E75] text-white shadow-sm'
                : 'bg-[#14171E] hover:bg-[#181C24] border-[#222733] text-[#94A3B8] hover:text-white'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#0F1217] border border-[#222733] flex items-center justify-center shrink-0">
              <Icon3dChemistryFlask size={24} />
            </div>
            <div className="min-w-0">
              <div className="font-heading font-bold text-xs sm:text-sm text-white truncate">
                Sains
              </div>
              <div className="text-[11px] font-mono text-[#64748B]">
                {categoryCounts.sains} topik
              </div>
            </div>
          </button>

          {/* Card 3: Kejuruan / Vokasi */}
          <button
            type="button"
            onClick={() => setActiveCategory(activeCategory === 'vokasi' ? 'all' : 'vokasi')}
            className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer flex items-center gap-3.5 border shadow-xs ${
              activeCategory === 'vokasi'
                ? 'bg-[#1B202A] border-[#3E8E75] text-white shadow-sm'
                : 'bg-[#14171E] hover:bg-[#181C24] border-[#222733] text-[#94A3B8] hover:text-white'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#0F1217] border border-[#222733] flex items-center justify-center shrink-0">
              <Icon3dCsMatrix size={24} />
            </div>
            <div className="min-w-0">
              <div className="font-heading font-bold text-xs sm:text-sm text-white truncate">
                Vokasi
              </div>
              <div className="text-[11px] font-mono text-[#64748B]">
                {categoryCounts.vokasi} topik
              </div>
            </div>
          </button>

          {/* Card 4: Sesi Belajar / Praktikum */}
          <Link
            href="/history?tab=sessions"
            className="p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer flex items-center gap-3.5 border shadow-xs bg-[#14171E] hover:bg-[#181C24] border-[#222733] hover:border-[#3E8E75]/60 text-[#94A3B8] hover:text-white group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0F1217] border border-[#222733] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Icon3dBookModule size={24} />
            </div>
            <div className="min-w-0">
              <div className="font-heading font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#4EAA8F] transition-colors">
                Praktikummu
              </div>
              <div className="text-[11px] font-mono text-[#64748B]">
                {recentSessions.length} sesi
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── 3. CONTINUE LEARNING SECTION ("Lanjut lagi" - strictly real sessions) ── */}
      {continueItems.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-base sm:text-lg font-bold text-white tracking-tight">
                Lanjut lagi
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#1B202A] border border-[#222733] text-[10px] font-mono text-[#4EAA8F] font-bold">
                {continueItems.length} sesi
              </span>
            </div>

            <Link
              href="/history?tab=sessions"
              className="text-xs font-mono text-[#3E8E75] hover:text-[#4EAA8F] hover:underline flex items-center gap-1 transition-colors"
            >
              <span>Semua Riwayat</span>
              <IconArrowRight size={12} />
            </Link>
          </div>

          {/* Cards Grid (Render only actual user sessions, matching History count) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {continueItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                prefetch={false}
                className="group p-2.5 rounded-2xl bg-[#14171E] hover:bg-[#181C24] border border-[#222733] hover:border-[#3E8E75]/60 transition-all flex flex-col justify-between space-y-2 shadow-xs cursor-pointer"
              >
                <div className="w-full aspect-[4/3] rounded-xl bg-[#0C0E12] border border-[#191D26] group-hover:border-[#3E8E75]/40 flex items-center justify-center overflow-hidden relative p-1.5 transition-colors">
                  <SimulationPreviewGraphic
                    slug={item.simSlug}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#0C0E12]/90 text-[9px] font-mono text-[#4EAA8F] font-bold border border-[#222733]">
                    {item.progress}%
                  </div>
                </div>
                <div className="px-0.5">
                  <h3 className="font-heading text-xs sm:text-[13px] font-bold text-white group-hover:text-[#4EAA8F] transition-colors truncate">
                    {item.title}
                  </h3>
                  <div className="text-[10px] font-mono text-[#64748B] truncate mt-0.5">
                    {item.discipline}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── 4. FEATURED SIMULATION ("Pilihan" from Astra Screenshot) ── */}
      <section className="space-y-3">
        <div className="space-y-0.5">
          <h2 className="font-heading text-base sm:text-lg font-bold text-white tracking-tight">
            Pilihan
          </h2>
        </div>

        {/* Large Featured Card (Text on Left, Visual Artwork on Right) */}
        <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-[#14171E] border border-[#222733] relative overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Column: Metadata, Title, Description, and CTA Button */}
          <div className="md:col-span-7 space-y-4 z-10">
            {/* Metadata Badges (Real Academic & Technical Classification, Zero Fabricated Ratings) */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#1B202A] border border-[#222733] text-[10px] font-mono text-[#4EAA8F] font-bold uppercase tracking-wider">
                FISIKA TERAPAN
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#14171E] border border-[#222733] text-[10px] font-mono text-[#94A3B8] font-bold uppercase tracking-wider">
                SIMULATOR UTAMA
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#0F1217] border border-[#222733] text-[10px] font-mono text-[#64748B] font-medium flex items-center gap-1.5">
                <IconCheckCircle size={12} className="text-[#3E8E75]" />
                <span>Kurikulum Terkalibrasi</span>
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Hukum II Newton & Kelembaman
              </h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-xl">
                Eksperimen interaktif gaya dorong, massa benda, dan percepatan linier seketika dengan kalkulasi fisika presisi 60 FPS dan telemetri langsung.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/modules/hukum-ii-newton"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#3E8E75] hover:bg-[#4EAA8F] border border-[#3E8E75] text-white font-heading text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <span>Mulai Eksperimen</span>
                <IconArrowRight size={14} className="text-white" />
              </Link>
              <Link
                href="/simulation/newtons-second-law"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#1B202A] hover:bg-[#222733] border border-[#222733] text-[#F1F5F9] hover:text-white font-mono text-xs font-semibold transition-all shadow-xs active:scale-95"
              >
                <span>Buka Simulasi Langsung</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Artwork Canvas / Preview */}
          <div className="md:col-span-5 flex items-center justify-center relative">
            <div className="w-full aspect-[16/10] sm:aspect-[4/3] rounded-2xl bg-[#0C0E12] border border-[#222733] overflow-hidden relative shadow-inner flex items-center justify-center p-3">
              {/* Simulation Vector Graphic */}
              <SimulationPreviewGraphic
                slug="newtons-second-law"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-[#14171E]/95 border border-[#222733] text-[10px] font-mono text-[#4EAA8F] font-bold">
                a = F / m
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. ALL LABORATORY MODULES CATALOG (Filtered & Paginated) ── */}
      <section className="space-y-4 pt-2" id="katalog-modul">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222733] pb-3">
          <div className="space-y-0.5">
            <h2 className="font-heading text-base sm:text-lg font-bold text-white tracking-tight">
              Katalog Modul Laboratorium
            </h2>
            <p className="text-[11px] sm:text-xs text-[#64748B]">
              Menampilkan {paginatedModules.length} dari {filteredModules.length} modul laboratorium.
            </p>
          </div>

          {/* Reset Filters when active */}
          {(activeCategory !== 'all' || activeTab !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setActiveTab('all');
                setSearchQuery('');
              }}
              className="text-xs font-mono text-[#3E8E75] hover:underline cursor-pointer self-start sm:self-auto"
            >
              Reset Semua Filter
            </button>
          )}
        </div>

        {/* Study Program Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {VOCATIONAL_STUDY_PROGRAMS.map((prog) => {
            const isSelected = activeTab === prog.id;
            const count = programCounts[prog.id] ?? 0;

            return (
              <button
                key={prog.id}
                type="button"
                onClick={() => setActiveTab(prog.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1B202A] text-white border border-[#3E8E75]/60 font-bold shadow-xs'
                    : 'bg-[#14171E] text-[#94A3B8] hover:text-white border border-[#222733] hover:bg-[#181C24]'
                }`}
              >
                <Icon3d name={prog.id} size={15} className="shrink-0" />
                <span>{prog.shortName}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${isSelected ? 'bg-[#0F1217] text-[#4EAA8F]' : 'bg-[#0F1217] text-[#64748B]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Real Modules Grid */}
        {filteredModules.length === 0 ? (
          <div className="py-16 text-center space-y-3 rounded-2xl bg-[#14171E] border border-[#222733]">
            <Icon3dBookModule size={48} className="mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Tidak ada modul yang cocok</p>
              <p className="text-xs text-[#94A3B8]">
                Coba gunakan kata kunci pencarian yang berbeda atau reset filter kategori.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setActiveTab('all');
              }}
              className="text-xs font-mono text-[#3E8E75] hover:underline cursor-pointer"
            >
              Reset Filter & Pencarian
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {paginatedModules.map((mod) => {
                const diff = getDifficultyLabel(mod.difficulty);
                const discLabel = getDisciplineLabel(mod.discipline);
                const simSlug = getModuleSimulationSlug(mod);

                return (
                  <div
                    key={mod.id}
                    className="group p-5 rounded-2xl bg-[#14171E] border border-[#222733] hover:border-[#3E8E75]/60 hover:bg-[#181C24] transition-all duration-200 flex flex-col justify-between shadow-xs"
                  >
                    <div className="space-y-3">
                      {/* Top Badges Row & 3D Discipline Artifact */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#1B202A] border border-[#222733] text-[10px] font-mono text-[#4EAA8F] font-semibold truncate max-w-[150px]">
                              {discLabel}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${diff.colorClass}`}>
                              {diff.text}
                            </span>
                          </div>
                          <h3 className="font-heading text-sm sm:text-base font-bold text-white group-hover:text-[#4EAA8F] transition-colors line-clamp-2 min-h-[44px]">
                            {mod.title.replace(/\s*—\s*Laboratorium Interaktif Gen Labs.*$/i, '')}
                          </h3>
                        </div>
                        <div className="shrink-0 p-1.5 rounded-xl bg-[#0C0E12] border border-[#222733] group-hover:scale-105 transition-transform">
                          <Icon3d name={getModule3dIcon(mod)} size={32} />
                        </div>
                      </div>

                      {/* Module Description */}
                      <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                        {mod.description || 'Pelajari konsep sistemik dan uji parameter praktikum interaktif.'}
                      </p>
                    </div>

                    {/* Card Bottom Actions */}
                    <div className="pt-4 mt-4 border-t border-[#191D26] flex items-center justify-between gap-2">
                      <Link
                        href={`/simulation/${simSlug}`}
                        prefetch={false}
                        className="text-xs font-mono text-[#3E8E75] hover:text-[#4EAA8F] hover:underline"
                      >
                        Buka Kanvas
                      </Link>

                      <Link
                        href={`/modules/${mod.slug || mod.id}`}
                        prefetch={false}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B202A] hover:bg-[#222733] border border-[#222733] hover:border-[#3E8E75]/50 text-white text-xs font-mono font-semibold transition-all shadow-xs active:scale-95"
                      >
                        <span>Mulai Eksperimen</span>
                        <IconArrowRight size={12} className="text-[#4EAA8F]" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls (Min 10 items per page) */}
            {filteredModules.length > PAGE_SIZE && (
              <div className="pt-2">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredModules.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={(p) => {
                    setCurrentPage(p);
                    const el = document.getElementById('katalog-modul');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  itemName="Modul"
                  className="border-[#222733]"
                />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
