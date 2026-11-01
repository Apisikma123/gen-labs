'use client';

import {
  IconSearch,
  IconPlus,
  IconArrowRight,
  IconCheckCircle,
  IconClose,
  IconSparkles,
  IconChevronDown,
  IconCheck,
  IconLoader,
  IconHelpCircle,
  IconLock,
  IconShieldCheck,
  IconBookOpen,
  IconExternalLink,
  IconRotateCcw,
  IconAlertCircle,
  IconLayers,
  IconTrash,
  IconEdit,
  IconPanelLeftClose,
  IconPanelLeftOpen,
  IconMessageSquare,
  IconArrowUp,
  IconArrowDown,
  IconAiTutor,
  IconCoins,
} from '@/components/icons';
import { Icon3dAiCore, Icon3dAiCredit } from '@/components/icons/3d';
import { Suspense, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ACTIVE_SIMULATION_CATALOG, searchSimulations } from '@genlab/simulation-core';
import { scoreModule, fuzzyFilterAndRankModules } from '@/lib/search/fuzzy-search';
import { ModuleModel } from '@/lib/api/modules';
import { aiApi, AiUsageModel, SourceItem, TutorState } from '@/lib/api/ai';
import { isSafeUrl } from '@/lib/utils/url';
import { useAuth } from '@/components/auth-provider';
import { AiUsageBadge } from '@/components/ui/ai-usage-badge';
import { LoadingState } from '@/components/ui/loading-state';
import { FormattedMessage } from '@/components/ui/formatted-message';
import { GenLabsLogo } from '@/components/ui/gen-labs-logo';
import { motion, AnimatePresence } from 'motion/react';
import { ProductEmoji, ProductEmojiName } from '@/components/ui/product-emoji';
import {
  getConversations,
  getConversation,
  saveConversation,
  createNewConversation,
  deleteConversation,
  renameConversation,
  groupConversationsByDate,
  deriveConversationTitle,
  getActiveConversationId,
  setActiveConversationId,
  ChatConversation,
  ChatMessage,
} from '@/lib/storage/chat-storage';

const DISCIPLINES_FILTER: { slug: string; name: string; emoji: ProductEmojiName | null }[] = [
  { slug: 'all', name: 'Semua Bidang', emoji: null },
  { slug: 'trpl', name: 'TRPL (Informatika)', emoji: 'laptop' },
  { slug: 'akuntansi', name: 'Akuntansi Perpajakan', emoji: 'bar_chart' },
  { slug: 'pemasaran', name: 'Pemasaran Internasional', emoji: 'economics' },
  { slug: 'agribisnis', name: 'Agribisnis Hortikultura', emoji: 'microscope' },
  { slug: 'event', name: 'Konvensi & Acara (MICE)', emoji: 'sparkles' },
  { slug: 'Fisika', name: 'Fisika Terapan', emoji: 'physics' },
  { slug: 'Matematika', name: 'Matematika Komputasi', emoji: 'math' },
  { slug: 'Statistika', name: 'Statistika Terapan', emoji: 'bar_chart' },
  { slug: 'Ekonomi', name: 'Ekonomi Bisnis', emoji: 'economics' },
  { slug: 'Kimia', name: 'Kimia Terapan', emoji: 'chemistry' },
];

interface StarterPrompt {
  title: string;
  question: string;
  icon: ProductEmojiName;
}

function getModuleSimulationSlug(mod: ModuleModel): string {
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
  return mod.slug;
}

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
    target_audience: 'Mahasiswa (Vokasi & STEM)',
    thumbnail_image: null,
    status: 'published' as const,
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

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id;

  // Strict Authentication Guard: Unauthenticated users are redirected to login
  useEffect(() => {
    if (!authLoading && !user) {
      const target = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/tanya-ai';
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
    }
  }, [user, authLoading, router]);

  // Canonical Route Synchronization: Normalize /explore to /tanya-ai
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.location.pathname === '/explore' || window.location.pathname === '/eksplorasi')) {
      router.replace('/tanya-ai' + window.location.search);
    }
  }, [router]);

  // Active Conversation State
  const initialConvId = searchParams.get('c');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConvId);
  const [activeDiscipline, setActiveDiscipline] = useState<string>('all');

  // Input & Generation State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUsage, setAiUsage] = useState<AiUsageModel | null>(null);
  const [aiUsageTrigger, setAiUsageTrigger] = useState(0);
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  // UI Controls State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [disciplineDropdownOpen, setDisciplineDropdownOpen] = useState(false);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');

  // Refs & Scroll State
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const prevMsgCountRef = useRef(0);

  // Detect active module from URL search params if present
  const activeSelectedModule = useMemo(() => {
    const m = searchParams.get('module') || searchParams.get('sim');
    if (!m) return null;
    return (
      ALL_CATALOG_MODULES.find(
        (mod) => mod.slug === m || mod.id.toString() === m || getModuleSimulationSlug(mod) === m
      ) || null
    );
  }, [searchParams]);

  // Dynamic context-aware starter questions (Part C)
  const contextualPrompts = useMemo<StarterPrompt[]>(() => {
    if (activeSelectedModule) {
      const modTitle = activeSelectedModule.title.replace(/\s*—\s*Laboratorium Interaktif Gen Labs.*$/i, '');
      return [
        {
          title: 'Konsep Eksperimen',
          question: `Jelaskan prinsip ilmiah dan formula fundamental pada eksperimen ${modTitle}.`,
          icon: 'atom',
        },
        {
          title: 'Fungsi Parameter',
          question: `Apa pengaruh variasi nilai parameter terhadap hasil telemetri simulasi ${modTitle}?`,
          icon: 'laptop',
        },
        {
          title: 'Pemahaman Hasil',
          question: `Bagaimana cara menafsirkan data observasi dan membuktikan validitas percobaan ${modTitle}?`,
          icon: 'bar_chart',
        },
      ];
    }

    if (activeDiscipline !== 'all') {
      const discName = DISCIPLINES_FILTER.find((d) => d.slug === activeDiscipline)?.name || 'Bidang Ini';
      if (activeDiscipline === 'trpl') {
        return [
          {
            title: 'Struktur Data & Algoritma',
            question: 'Bagaimana prinsip kerja algoritma dan efisiensi komputasi pada praktikum TRPL?',
            icon: 'laptop',
          },
          {
            title: 'Analisis Kompleksitas',
            question: 'Bagaimana cara menganalisis kompleksitas waktu Big-O pada simulasi algoritma pengurutan?',
            icon: 'bar_chart',
          },
          {
            title: 'Implementasi Industri',
            question: 'Jelaskan contoh penerapan riil algoritma komputasi ini di industri perangkat lunak.',
            icon: 'atom',
          },
        ];
      }
      if (activeDiscipline === 'akuntansi' || activeDiscipline === 'pemasaran' || activeDiscipline === 'Ekonomi') {
        return [
          {
            title: 'Keseimbangan Pasar',
            question: 'Bagaimana mekanisme elastisitas harga mempengaruhi titik ekuilibrium pasar?',
            icon: 'economics',
          },
          {
            title: 'Analisis Keuangan',
            question: 'Bagaimana cara menghitung titik impas (Break-Even Point) dan margin kontribusi?',
            icon: 'bar_chart',
          },
          {
            title: 'Mitigasi Risiko',
            question: 'Bagaimana memanfaatkan simulasi ekonomi untuk memitigasi risiko finansial usaha?',
            icon: 'sparkles',
          },
        ];
      }
      if (activeDiscipline === 'agribisnis' || activeDiscipline === 'Kimia') {
        return [
          {
            title: 'Parameter Kimia & pH',
            question: 'Bagaimana derajat keasaman (pH) mempengaruhi penyerapan unsur hara tanaman?',
            icon: 'microscope',
          },
          {
            title: 'Efisiensi Budidaya',
            question: 'Bagaimana mengoptimalkan parameter suhu dan irigasi pada sistem greenhouse modern?',
            icon: 'seedling',
          },
          {
            title: 'Interpretasi Data',
            question: 'Bagaimana cara menafsirkan grafik pertumbuhan vegetatif dari data laboratorium?',
            icon: 'bar_chart',
          },
        ];
      }
    }

    // Universal Curated Starter Questions (Part C)
    return [
      {
        title: 'Konsep Sains',
        question: 'Bantu saya memahami prinsip ilmiah dan hukum fundamental dalam simulasi laboratorium.',
        icon: 'atom',
      },
      {
        title: 'Metrik & Telemetri',
        question: 'Bagaimana cara membaca data telemetri dan memahami respons parameter eksperimen?',
        icon: 'laptop',
      },
      {
        title: 'Metodologi Praktikum',
        question: 'Jelaskan tahapan pengujian hipotesis dan pembuktian prinsip keilmuan sains terapan.',
        icon: 'bar_chart',
      },
    ];
  }, [activeSelectedModule, activeDiscipline]);

  // Load conversations on mount or when user changes
  useEffect(() => {
    if (authLoading) return;

    const loaded = getConversations(userId);
    setConversations(loaded);

    const storedActiveId = getActiveConversationId(userId);

    let targetId: string | null = null;
    if (loaded.length > 0) {
      if (initialConvId && loaded.some((c) => c.id === initialConvId)) {
        targetId = initialConvId;
      } else if (storedActiveId && loaded.some((c) => c.id === storedActiveId)) {
        targetId = storedActiveId;
      } else {
        targetId = loaded[0].id;
      }
      setActiveConvId(targetId);
      setActiveConversationId(targetId, userId);

      const activeObj = loaded.find((c) => c.id === targetId);
      if (activeObj?.discipline && activeObj.discipline !== 'all') {
        setActiveDiscipline(activeObj.discipline);
      }

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.searchParams.get('c') !== targetId) {
          url.searchParams.set('c', targetId);
          window.history.replaceState({}, '', url.toString());
        }
      }
    } else {
      // First time use: create clean empty conversation
      const fresh = createNewConversation('Percakapan Baru', 'all', userId);
      setConversations([fresh]);
      setActiveConvId(fresh.id);
      setActiveConversationId(fresh.id, userId);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('c', fresh.id);
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [authLoading, userId, initialConvId]);

  // Current active conversation object
  const currentConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConvId) || null;
  }, [conversations, activeConvId]);

  // Messages in active conversation
  const messages = currentConversation?.messages || [];

  // Transcript scroll tracker
  const handleTranscriptScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 140;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    setIsScrolledUp(!atBottom);
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    } else {
      chatEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
    setIsScrolledUp(false);
  }, []);

  // ChatGPT-style auto-scroll: scroll down on user send or if user is already at bottom
  useEffect(() => {
    const hasNew = messages.length > prevMsgCountRef.current;
    prevMsgCountRef.current = messages.length;

    if (hasNew) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === 'user' || !isScrolledUp) {
        scrollToBottom(true);
      }
    }
  }, [messages, isScrolledUp, scrollToBottom]);

  // Auto-adjust textarea height as user types
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const nextHeight = Math.min(el.scrollHeight, 160);
    el.style.height = `${Math.max(nextHeight, 44)}px`;
  }, [aiPrompt]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDisciplineDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Realtime countdown timer until quota reset
  const [countdown, setCountdown] = useState<string>('00:00:00');
  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      let target: Date;
      if (aiUsage?.reset_at) {
        target = new Date(aiUsage.reset_at);
        if (isNaN(target.getTime()) || target <= now) {
          target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        }
      } else {
        target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      }

      const diff = Math.max(0, target.getTime() - now.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (n: number) => n.toString().padStart(2, '0');
      setCountdown(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [aiUsage?.reset_at]);

  const isQuotaExhausted = aiUsage !== null && aiUsage.remaining <= 0;

  // Filter conversations by search term and group by date
  const groupedConversations = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    const filtered = q
      ? conversations.filter((c) => c.title.toLowerCase().includes(q))
      : conversations;
    return groupConversationsByDate(filtered);
  }, [conversations, historySearch]);

  // Handler: Switch active conversation
  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
    setActiveConversationId(id, userId);
    setMobileDrawerOpen(false);
    setAiError(null);
    const targetConv = conversations.find((c) => c.id === id);
    if (targetConv?.discipline && targetConv.discipline !== 'all') {
      setActiveDiscipline(targetConv.discipline);
    }
    router.replace(`/tanya-ai?c=${id}`, { scroll: false });
  };

  // Handler: Start a new conversation
  const handleNewChat = () => {
    // If current conversation is already empty, just keep it
    if (currentConversation && currentConversation.messages.length === 0) {
      setMobileDrawerOpen(false);
      textareaRef.current?.focus();
      return;
    }

    const fresh = createNewConversation('Percakapan Baru', activeDiscipline, userId);
    setConversations((prev) => [fresh, ...prev]);
    setActiveConvId(fresh.id);
    setActiveConversationId(fresh.id, userId);
    setMobileDrawerOpen(false);
    setAiError(null);
    router.replace(`/tanya-ai?c=${fresh.id}`, { scroll: false });
    setTimeout(() => textareaRef.current?.focus(), 60);
  };

  // Handler: Delete conversation
  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id, userId);
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);

    if (activeConvId === id) {
      if (updated.length > 0) {
        const nextId = updated[0].id;
        setActiveConvId(nextId);
        setActiveConversationId(nextId, userId);
        router.replace(`/tanya-ai?c=${nextId}`, { scroll: false });
      } else {
        const fresh = createNewConversation('Percakapan Baru', activeDiscipline, userId);
        setConversations([fresh]);
        setActiveConvId(fresh.id);
        setActiveConversationId(fresh.id, userId);
        router.replace(`/tanya-ai?c=${fresh.id}`, { scroll: false });
      }
    }
  };

  // Handler: Start inline rename
  const handleStartRename = (e: React.MouseEvent, conv: ChatConversation) => {
    e.stopPropagation();
    setEditingConvId(conv.id);
    setEditTitleValue(conv.title);
  };

  // Handler: Save rename
  const handleSaveRename = (id: string) => {
    const trimmed = editTitleValue.trim();
    if (trimmed) {
      renameConversation(id, trimmed, userId);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: trimmed } : c))
      );
    }
    setEditingConvId(null);
  };

  // Handler: Submit AI message
  const handleAiSubmit = async (e?: React.FormEvent, overridePrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = (overridePrompt ?? aiPrompt).trim();
    if (!promptToSend || aiLoading) return;

    if (isQuotaExhausted) {
      setAiError('Batas kuota 5 kali per hari telah tercapai. Kuota akan direset pukul 00:00.');
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiPrompt('');

    // Optimistically decrement AI quota immediately upon sending
    setAiUsage((prev) => {
      const current = prev || { daily_limit: 5, used: 0, remaining: 5, reset_at: '', rate_limit: { limit: 5, window_minutes: 10 } };
      const nextRemaining = Math.max(0, current.remaining - 1);
      const nextUsed = current.used + 1;
      const updated: AiUsageModel = {
        ...current,
        remaining: nextRemaining,
        used: nextUsed,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('genlabs_cached_ai_quota', JSON.stringify(updated));
        queueMicrotask(() => {
          window.dispatchEvent(new CustomEvent('genlabs_ai_quota_updated', { detail: updated }));
        });
      }
      return updated;
    });
    setAiUsageTrigger((prev) => prev + 1);

    // Ensure we have an active conversation
    let targetConv = currentConversation;
    if (!targetConv) {
      targetConv = createNewConversation(deriveConversationTitle(promptToSend), activeDiscipline, userId);
      setConversations((prev) => [targetConv!, ...prev]);
      setActiveConvId(targetConv.id);
      setActiveConversationId(targetConv.id, userId);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('c', targetConv.id);
        window.history.replaceState({}, '', url.toString());
      }
    }

    const isFirstQuestion = targetConv.messages.length === 0;
    const newTitle = isFirstQuestion ? deriveConversationTitle(promptToSend) : targetConv.title;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: promptToSend,
      timestamp: new Date().toISOString(),
    };

    // Optimistically update conversation state
    const convWithUser: ChatConversation = {
      ...targetConv,
      title: newTitle,
      updatedAt: Date.now(),
      messages: [...targetConv.messages, userMsg],
    };

    saveConversation(convWithUser, userId);
    setConversations((prev) =>
      prev.map((c) => (c.id === convWithUser.id ? convWithUser : c))
    );

    // Instant local simulation search for supplementary recommendations
    let matchedModules: ModuleModel[] = [];
    try {
      const coreHits = searchSimulations(promptToSend);
      if (coreHits.length > 0) {
        const hitSlugs = new Set(coreHits.map((h) => h.slug));
        matchedModules = ALL_CATALOG_MODULES.filter((m) => hitSlugs.has(m.slug)).slice(0, 3);
      }
      if (matchedModules.length === 0) {
        matchedModules = fuzzyFilterAndRankModules(ALL_CATALOG_MODULES, promptToSend).slice(0, 3);
      }
    } catch {
      matchedModules = [];
    }

    try {
      const activeDiscLabel = DISCIPLINES_FILTER.find((d) => d.slug === activeDiscipline)?.name || 'Sains Terapan';
      const historyPayload = convWithUser.messages.slice(-8).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

      const res = await aiApi.askTutor({
        question: `[Disiplin: ${activeDiscLabel}] ${promptToSend}`,
        context: {
          discipline: activeDiscipline,
          matched_simulations: matchedModules.map((m) => m.title),
        },
        history: historyPayload,
      });

      setAiUsageTrigger((prev) => prev + 1);
      if (res.quota) {
        const quotaData = res.quota as unknown as AiUsageModel;
        setAiUsage(quotaData);
        if (typeof window !== 'undefined') {
          localStorage.setItem('genlabs_cached_ai_quota', JSON.stringify(quotaData));
          queueMicrotask(() => {
            window.dispatchEvent(
              new CustomEvent('genlabs_ai_quota_updated', { detail: quotaData })
            );
          });
        }
      }
      setLastFailedPrompt(null);

      const assistantMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: res.answer || res.explanation || 'Berikut hasil analisis konsep dan simulasi yang relevan untuk eksperimen Anda.',
        state: res.state,
        sources: res.sources,
        matchedModules: matchedModules.length > 0 ? matchedModules : undefined,
        suggestedFollowUp: res.suggestedFollowUp,
        timestamp: new Date().toISOString(),
      };

      const finalConv: ChatConversation = {
        ...convWithUser,
        updatedAt: Date.now(),
        discipline: activeDiscipline,
        messages: [...convWithUser.messages, assistantMsg],
      };

      saveConversation(finalConv, userId);
      setActiveConversationId(finalConv.id, userId);
      setConversations((prev) =>
        prev.map((c) => (c.id === finalConv.id ? finalConv : c))
      );
    } catch (err: any) {
      setLastFailedPrompt(promptToSend);
      const errPayload = err?.response?.data || err?.data || err?.details;
      const errCode = errPayload?.code || errPayload?.error || err?.code;
      const errMsg = errPayload?.message || err?.message || 'Gagal memproses pertanyaan ke AI.';

      // Re-sync actual quota from backend to reflect true server state
      aiApi.getUsage().then((actual) => {
        setAiUsage(actual);
        if (typeof window !== 'undefined') {
          localStorage.setItem('genlabs_cached_ai_quota', JSON.stringify(actual));
          queueMicrotask(() => {
            window.dispatchEvent(new CustomEvent('genlabs_ai_quota_updated', { detail: actual }));
          });
        }
      }).catch(() => {});

      if (err?.status === 401 || errMsg.toLowerCase().includes('unauthenticated')) {
        setAiError('Silakan masuk ke akun Anda untuk menggunakan AI Tutor dan kuota konsultasi laboratorium.');
      } else if (errCode === 'DAILY_AI_QUOTA_EXCEEDED' || (err?.status === 429 && errMsg.includes('00:00'))) {
        setAiUsage((prev) => (prev ? { ...prev, remaining: 0 } : null));
        setAiUsageTrigger((prev) => prev + 1);
        setAiError('Batas 5 konsultasi AI per hari telah habis. Kuota akan direset pukul 00:00 WIB.');
      } else if (errCode === 'AI_RATE_LIMITED' || errMsg.toLowerCase().includes('terlalu banyak permintaan')) {
        setAiError(errMsg || 'Terlalu banyak permintaan berturut-turut. Kredit Anda tetap aman, silakan tunggu beberapa detik.');
      } else if (errCode === 'AI_PROVIDER_UNAVAILABLE' || err?.status === 503) {
        setAiError('Layanan AI sedang mengalami gangguan sementara. Kredit Anda tidak terpotong. Silakan coba beberapa saat lagi.');
      } else {
        setAiError(`Gagal menghubungi AI Tutor: ${errMsg}`);
      }
    } finally {
      setAiLoading(false);
    }
  };

  // Keyboard navigation for composer textarea (Enter to send, Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAiSubmit();
    }
  };

  // Helper renderer for conversation list item
  const renderConversationItem = (conv: ChatConversation) => {
    const isActive = conv.id === activeConvId;
    const isEditing = editingConvId === conv.id;

    if (isEditing) {
      return (
        <div
          key={conv.id}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1B202A] border border-[#2F3646] shadow-xs"
        >
          <input
            type="text"
            value={editTitleValue}
            onChange={(e) => setEditTitleValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename(conv.id);
              if (e.key === 'Escape') setEditingConvId(null);
            }}
            autoFocus
            className="flex-1 bg-transparent text-xs text-white outline-none font-sans"
          />
          <button
            type="button"
            onClick={() => handleSaveRename(conv.id)}
            className="p-1 text-[#4EAA8F] hover:text-white transition-colors cursor-pointer"
            title="Simpan"
            aria-label="Simpan judul"
          >
            <IconCheck size={13} />
          </button>
          <button
            type="button"
            onClick={() => setEditingConvId(null)}
            className="p-1 text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            title="Batal"
            aria-label="Batal ubah judul"
          >
            <IconClose size={13} />
          </button>
        </div>
      );
    }

    return (
      <div
        key={conv.id}
        onClick={() => handleSelectConversation(conv.id)}
        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-sans transition-all cursor-pointer select-none ${
          isActive
            ? 'bg-[#1B202A] text-[#4EAA8F] border border-[#2F3646] font-medium shadow-xs'
            : 'text-[#94A3B8] hover:bg-[#1B202A]/60 hover:text-[#F1F5F9] border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
          <IconMessageSquare
            size={14}
            className={`shrink-0 ${isActive ? 'text-[#4EAA8F]' : 'text-[#64748B] group-hover:text-[#94A3B8]'}`}
          />
          <span className="truncate">{conv.title || 'Percakapan Tanpa Judul'}</span>
        </div>

        {/* Hover/Active Action Buttons */}
        <div className={`flex items-center gap-1 shrink-0 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
          <button
            type="button"
            onClick={(e) => handleStartRename(e, conv)}
            className="p-1 rounded-md text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Ubah Nama"
            aria-label={`Ubah nama percakapan ${conv.title}`}
          >
            <IconEdit size={12} />
          </button>
          <button
            type="button"
            onClick={(e) => handleDeleteConversation(e, conv.id)}
            className="p-1 rounded-md text-[#94A3B8] hover:text-[#F28B82] hover:bg-white/10 transition-colors cursor-pointer"
            title="Hapus Percakapan"
            aria-label={`Hapus percakapan ${conv.title}`}
          >
            <IconTrash size={12} />
          </button>
        </div>
      </div>
    );
  };

  if (authLoading || !user) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#0C0E12] text-[#94A3B8]">
        <LoadingState message="Memverifikasi autentikasi laboratorium..." />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex overflow-hidden bg-[#0C0E12] text-[#F1F5F9]">
      {/* ── 1. DESKTOP CONVERSATION SIDEBAR ── */}
      <aside
        className={`hidden md:flex flex-col border-r border-[#222733] bg-[#14171E] transition-all duration-300 ease-in-out shrink-0 ${
          sidebarCollapsed ? 'w-0 overflow-hidden border-none' : 'w-72'
        }`}
      >
        {/* Sidebar Header: "Chat Baru" & Search */}
        <div className="p-3.5 space-y-2.5 border-b border-[#222733]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GenLabsLogo variant="symbol" size={20} />
              <span className="font-heading font-bold text-xs tracking-tight text-white uppercase">
                Tanya AI
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSidebarCollapsed(true)}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Tutup Bilah Samping"
              aria-label="Tutup bilah samping"
            >
              <IconPanelLeftClose size={16} />
            </button>
          </div>

          {/* "Chat Baru" Action */}
          <button
            type="button"
            onClick={handleNewChat}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#1B202A] hover:bg-[#222836] border border-[#2F3646] hover:border-[#3E8E75] text-[#F1F5F9] font-mono text-xs font-semibold transition-all shadow-xs cursor-pointer group active:scale-98"
          >
            <IconPlus size={16} className="text-[#4B8F8C] shrink-0" />
            <span>Chat Baru</span>
          </button>

          {/* Search conversation history input */}
          <div className="relative">
            <IconSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Cari percakapan..."
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[#0F1217] border border-[#222733] focus:border-[#3E8E75] text-xs text-[#F1F5F9] placeholder:text-[#64748B] outline-none font-sans transition-colors"
            />
            {historySearch && (
              <button
                type="button"
                onClick={() => setHistorySearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
                aria-label="Hapus kata kunci pencarian riwayat"
              >
                <IconClose size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List Grouped Chronologically */}
        <div
          data-lenis-prevent="true"
          className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-left custom-scrollbar overscroll-contain"
        >
          {conversations.length === 0 ? (
            <div className="py-8 px-4 text-center space-y-2">
              <IconMessageSquare size={24} className="mx-auto text-[#64748B]" />
              <p className="text-xs text-[#94A3B8]">Belum ada riwayat percakapan.</p>
            </div>
          ) : (
            <>
              {groupedConversations.today.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider text-[#64748B] uppercase">
                    Hari Ini
                  </div>
                  {groupedConversations.today.map(renderConversationItem)}
                </div>
              )}

              {groupedConversations.yesterday.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider text-[#64748B] uppercase">
                    Kemarin
                  </div>
                  {groupedConversations.yesterday.map(renderConversationItem)}
                </div>
              )}

              {groupedConversations.previous.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider text-[#64748B] uppercase">
                    Sebelumnya
                  </div>
                  {groupedConversations.previous.map(renderConversationItem)}
                </div>
              )}

              {historySearch &&
                groupedConversations.today.length === 0 &&
                groupedConversations.yesterday.length === 0 &&
                groupedConversations.previous.length === 0 && (
                  <div className="py-6 px-4 text-center text-xs text-[#94A3B8]">
                    Tidak ada percakapan yang cocok dengan "{historySearch}".
                  </div>
                )}
            </>
          )}
        </div>

        {/* Sidebar Footer: Daily Quota Telemetry */}
        <div className="p-3 border-t border-[#222733] bg-[#0F1217] flex items-center justify-between text-xs font-mono text-[#94A3B8]">
          <AiUsageBadge
            variant="tag"
            refreshTrigger={aiUsageTrigger}
            onUsageLoaded={(data) => setAiUsage(data)}
          />
          <span className="text-[10px] text-[#64748B]">Maks 5/hari</span>
        </div>
      </aside>

      {/* ── 2. MOBILE DRAWER SLIDE-OVER (Backdrop + Left Panel) ── */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide-over panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-80 max-w-[85vw] h-full bg-[#14171E] border-r border-[#222733] flex flex-col z-10 text-left shadow-2xl"
            >
              <div className="p-4 space-y-3 border-b border-[#222733]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GenLabsLogo variant="symbol" size={22} />
                    <span className="font-heading font-bold text-sm text-white">Tanya AI</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white"
                    aria-label="Tutup menu riwayat"
                  >
                    <IconClose size={18} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleNewChat}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1B202A] border border-[#2F3646] text-[#F1F5F9] font-mono text-xs font-semibold active:scale-98"
                >
                  <IconPlus size={15} className="text-[#4EAA8F]" />
                  <span>Chat Baru</span>
                </button>

                <div className="relative">
                  <IconSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Cari percakapan..."
                    className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[#0F1217] border border-[#222733] text-xs text-[#F1F5F9] outline-none"
                  />
                  {historySearch && (
                    <button
                      type="button"
                      onClick={() => setHistorySearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                      aria-label="Hapus kata kunci pencarian riwayat ponsel"
                    >
                      <IconClose size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Grouped items for mobile */}
              <div
                data-lenis-prevent="true"
                className="flex-1 overflow-y-auto px-2 py-3 space-y-4 custom-scrollbar overscroll-contain"
              >
                {groupedConversations.today.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider text-[#64748B] uppercase">
                      Hari Ini
                    </div>
                    {groupedConversations.today.map(renderConversationItem)}
                  </div>
                )}

                {groupedConversations.yesterday.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider text-[#64748B] uppercase">
                      Kemarin
                    </div>
                    {groupedConversations.yesterday.map(renderConversationItem)}
                  </div>
                )}

                {groupedConversations.previous.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider text-[#64748B] uppercase">
                      Sebelumnya
                    </div>
                    {groupedConversations.previous.map(renderConversationItem)}
                  </div>
                )}
              </div>

              <div className="p-3.5 border-t border-[#222733] bg-[#0F1217] flex items-center justify-between text-xs font-mono text-[#94A3B8]">
                <AiUsageBadge
                  variant="tag"
                  refreshTrigger={aiUsageTrigger}
                  onUsageLoaded={(data) => setAiUsage(data)}
                />
                <span className="text-[10px] text-[#64748B]">Maks 5/hari</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 3. MAIN CONVERSATION AREA ── */}
      <main
        data-lenis-prevent="true"
        className="flex-1 min-h-0 flex flex-col h-full min-w-0 relative bg-[#0C0E12] overflow-hidden"
      >
        {/* Top Chat Header Bar */}
        <header className="h-14 border-b border-[#222733] bg-[#14171E]/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Drawer Toggle (Chat list) */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden w-10 h-10 min-w-[40px] min-h-[40px] aspect-square flex items-center justify-center rounded-xl bg-[#14171E] hover:bg-[#1B202A] border border-[#222733] text-[#94A3B8] hover:text-white transition-colors cursor-pointer active:scale-95 shrink-0"
              title="Daftar Chat"
              aria-label="Buka riwayat percakapan"
            >
              <IconMessageSquare size={16} />
            </button>

            {/* Desktop Sidebar Toggle (when collapsed) */}
            {sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                className="hidden md:flex p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Buka Bilah Samping"
                aria-label="Buka bilah samping"
              >
                <IconPanelLeftOpen size={18} />
              </button>
            )}

            <div className="flex items-center gap-2 min-w-0">
              <h1 className="font-heading text-sm sm:text-base font-bold text-white tracking-tight truncate">
                Tanya AI
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-[#1C332A] border border-[#2A4D3F] text-[10px] font-mono text-[#4EAA8F] font-semibold">
                Laboratorium Eksperimen
              </span>
            </div>
          </div>

          {/* Right Header Controls: Discipline Picker & New Chat */}
          <div className="flex items-center gap-2">
            {/* Discipline Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDisciplineDropdownOpen(!disciplineDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-xl bg-[#14171E] border border-[#222733] hover:border-[#3E8E75]/60 text-xs font-mono text-[#94A3B8] hover:text-white transition-all cursor-pointer shrink-0"
                aria-label="Pilih bidang keilmuan simulasi"
              >
                <span className="truncate max-w-[120px] sm:max-w-[180px]">
                  {DISCIPLINES_FILTER.find((d) => d.slug === activeDiscipline)?.name || 'Semua Bidang'}
                </span>
                <IconChevronDown size={13} className={`text-[#94A3B8] transition-transform duration-200 ${disciplineDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {disciplineDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 max-h-64 overflow-y-auto no-scrollbar rounded-2xl bg-[#14171E] border border-[#222733] p-1.5 shadow-2xl z-50 text-left">
                  {DISCIPLINES_FILTER.map((cat) => {
                    const isSelected = activeDiscipline === cat.slug;
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => {
                          setActiveDiscipline(cat.slug);
                          setDisciplineDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#1C332A] text-[#F1F5F9] font-medium'
                            : 'text-[#94A3B8] hover:bg-[#1B202A] hover:text-white'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {isSelected && <IconCheck size={13} className="shrink-0 text-[#4EAA8F]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile New Chat Button */}
            <button
              type="button"
              onClick={handleNewChat}
              className="md:hidden w-10 h-10 min-w-[40px] min-h-[40px] aspect-square flex items-center justify-center rounded-xl bg-[#1B202A] hover:bg-[#222836] border border-[#2F3646] hover:border-[#3E8E75] text-[#4EAA8F] hover:text-white transition-all cursor-pointer active:scale-95 shrink-0"
              title="Chat Baru"
              aria-label="Mulai chat baru"
            >
              <IconPlus size={16} />
            </button>
          </div>
        </header>

        {/* ── 4. SCROLLABLE CONVERSATION TRANSCRIPT ── */}
        <div
          ref={scrollContainerRef}
          onScroll={handleTranscriptScroll}
          data-lenis-prevent="true"
          data-lenis-prevent-wheel="true"
          data-lenis-prevent-touch="true"
          className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-4 pb-12 sm:pb-16 text-left relative custom-scrollbar overscroll-contain touch-pan-y"
        >
          <div className="max-w-3xl mx-auto w-full min-h-full flex flex-col">
            {authLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <LoadingState message="Memuat sesi laboratorium..." rows={2} />
              </div>
            ) : messages.length === 0 ? (
              /* ── 4.A EMPTY / FIRST-USE STATE (Auto-fits, never clipped) ── */
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-5 py-4 sm:py-6">
                {/* Official Nexus Icon */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#14171E] border border-[#222733] flex items-center justify-center p-2 shadow-sm">
                  <Icon3dAiCore size={52} />
                </div>

                <div className="space-y-1.5 max-w-md">
                  <h2 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
                    Tanya AI Laboratorium
                  </h2>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {activeSelectedModule
                      ? `Konteks Praktikum: ${activeSelectedModule.title.replace(/\s*—\s*Laboratorium Interaktif Gen Labs.*$/i, '')}`
                      : 'Asisten cerdas untuk memandu eksperimen laboratorium, menganalisis formula fisis, dan memecahkan persoalan praktikum.'}
                  </p>
                </div>

                {/* Grounded Contextual Starter Prompts */}
                <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 pb-2">
                  {contextualPrompts.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAiSubmit(undefined, item.question)}
                      className="group p-3.5 rounded-2xl bg-[#14171E] hover:bg-[#1B202A] border border-[#222733] hover:border-[#3E8E75]/50 text-left transition-all duration-200 cursor-pointer shadow-xs active:scale-98 flex flex-col justify-between min-h-[96px]"
                    >
                      <div className="flex items-center justify-between gap-1 text-[11px] font-mono text-[#4EAA8F]">
                        <span className="font-semibold">{item.title}</span>
                        <ProductEmoji name={item.icon} size={13} />
                      </div>
                      <p className="text-xs text-[#94A3B8] group-hover:text-[#F1F5F9] line-clamp-3 leading-snug mt-2">
                        "{item.question}"
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* ── 4.B CONVERSATION STREAM ── */
              <div className="space-y-6">
                {messages.map((item) => {
                  if (item.role === 'user') {
                    return (
                      <div key={item.id} className="flex justify-end w-full">
                        <div className="max-w-[88%] sm:max-w-[72%] px-4 sm:px-5 py-3 rounded-2xl rounded-tr-xs bg-[#1B202A] border border-[#2F3646] text-[#F1F5F9] text-sm sm:text-[15px] font-sans shadow-xs break-words whitespace-pre-wrap leading-relaxed">
                          {item.content}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={item.id} className="flex items-start gap-3 sm:gap-4 w-full">
                      {/* Avatar */}
                      <div className="shrink-0 w-8 h-8 rounded-full bg-[#14171E] border border-[#222733] flex items-center justify-center text-[#4B8F8C] shadow-xs mt-0.5 overflow-hidden">
                        <Icon3dAiCore size={22} />
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 space-y-3 min-w-0">
                        {/* State & Citation Header Badge */}
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                          {item.state === 'STATE_A' && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1C332A] border border-[#2A4D3F] text-[11px] font-mono text-[#4EAA8F] font-semibold">
                              <IconCheckCircle size={13} className="text-[#4EAA8F]" />
                              <span>Terverifikasi Kurikulum GEN LABS</span>
                            </div>
                          )}

                          {item.state === 'STATE_B' && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#142328] border border-[#1F454A] text-[11px] font-mono text-[#4B8F8C] font-semibold">
                              <IconBookOpen size={13} className="text-[#4B8F8C]" />
                              <span>Riset Ilmiah Eksternal Terverifikasi</span>
                            </div>
                          )}

                          {item.state === 'STATE_C' && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#241F14] border border-[#4A3B1C] text-[11px] font-mono text-[#BA8230] font-semibold">
                              <IconHelpCircle size={13} className="text-[#BA8230]" />
                              <span>Penjelasan Teori Sains Umum</span>
                            </div>
                          )}

                          {item.state === 'STATE_D' && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1B202A] border border-[#2F3646] text-[11px] font-mono text-[#94A3B8] font-semibold">
                              <IconShieldCheck size={13} className="text-[#94A3B8]" />
                              <span>Di Luar Cakupan Laboratorium</span>
                            </div>
                          )}
                        </div>

                        {/* State B & C Explicit Disclaimers */}
                        {item.state === 'STATE_B' && (
                          <div className="p-3 rounded-xl bg-[#101B1E] border border-[#193539] text-xs text-[#78B4B0] font-sans flex items-start gap-2.5">
                            <IconBookOpen size={14} className="shrink-0 mt-0.5 text-[#4B8F8C]" />
                            <span>Penjelasan berikut didasarkan pada referensi ilmiah eksternal. Kami belum menemukan penjelasan spesifik tersebut dalam dokumentasi GEN LABS yang tersedia.</span>
                          </div>
                        )}

                        {item.state === 'STATE_C' && (
                          <div className="p-3 rounded-xl bg-[#1E190F] border border-[#3D2E14] text-xs text-[#D8A65C] font-sans flex items-start gap-2.5">
                            <IconAlertCircle size={14} className="shrink-0 mt-0.5 text-[#BA8230]" />
                            <span>Secara umum, penjelasan ini merupakan prinsip sains fundamental dan belum memverifikasi perilaku spesifik simulasi GENLABS.</span>
                          </div>
                        )}

                        {/* Formatted Assistant Message Content (LaTeX math + Markdown support) */}
                        <div className="text-sm sm:text-[15px] leading-relaxed text-[#F1F5F9] font-sans space-y-3 break-words">
                          <FormattedMessage content={item.content} />
                        </div>

                        {/* Clickable Source Citations */}
                        {item.sources && item.sources.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-[#222733] space-y-2">
                            <div className="flex items-center gap-2 text-[11px] font-mono font-bold tracking-wider text-[#94A3B8] uppercase">
                              <IconLayers size={13} className="text-[#4B8F8C]" />
                              <span>Sumber Rujukan ({item.sources.length}):</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {item.sources.map((src, sIdx) => {
                                const isExt = src.type === 'external';
                                const isGen = src.type === 'general_science';

                                if (isGen) {
                                  return (
                                    <div
                                      key={sIdx}
                                      className="p-2.5 rounded-xl bg-[#14171E] border border-[#222733] text-xs flex flex-col justify-between"
                                    >
                                      <div className="font-semibold text-[#BA8230] line-clamp-1">{src.title}</div>
                                      <div className="text-[10px] text-[#94A3B8] font-mono mt-1">
                                        {src.publisher || 'Fundamental Scientific Principles'}
                                      </div>
                                    </div>
                                  );
                                }

                                if (isExt) {
                                  return (
                                    <a
                                      key={sIdx}
                                      href={isSafeUrl(src.url) ? src.url : '#'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="group p-2.5 rounded-xl bg-[#14171E] border border-[#222733] hover:border-[#4B8F8C] transition-all text-xs flex flex-col justify-between"
                                    >
                                      <div className="flex items-start justify-between gap-1.5">
                                        <span className="font-semibold text-[#F1F5F9] group-hover:text-[#4B8F8C] line-clamp-1 transition-colors">
                                          {src.title}
                                        </span>
                                        <IconExternalLink size={12} className="shrink-0 text-[#94A3B8] group-hover:text-[#4B8F8C] mt-0.5 transition-colors" />
                                      </div>
                                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#94A3B8] mt-1.5">
                                        <span className="text-[#4B8F8C] truncate max-w-[140px]">{src.publisher || 'CrossRef'}</span>
                                        {src.year && <span>• {src.year}</span>}
                                      </div>
                                    </a>
                                  );
                                }

                                return (
                                  <Link
                                    key={sIdx}
                                    href={isSafeUrl(src.url) ? src.url : `/modules/${src.id}`}
                                    className="group p-2.5 rounded-xl bg-[#14171E] border border-[#222733] hover:border-[#3E8E75] transition-all text-xs flex flex-col justify-between"
                                  >
                                    <div className="flex items-start justify-between gap-1.5">
                                      <span className="font-semibold text-[#F1F5F9] group-hover:text-[#4EAA8F] line-clamp-1 transition-colors">
                                        {src.title}
                                      </span>
                                      <IconArrowRight size={12} className="shrink-0 text-[#94A3B8] group-hover:text-[#4EAA8F] mt-0.5 transition-transform group-hover:translate-x-0.5" />
                                    </div>
                                    <span className="text-[10px] font-mono text-[#4EAA8F] mt-1">
                                      {src.publisher || 'GEN LABS Kurikulum'}
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Matched Laboratory Simulations */}
                        {item.matchedModules && item.matchedModules.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-[#222733] space-y-2.5">
                            <div className="text-[11px] font-mono font-bold tracking-wider text-[#4B8F8C] uppercase">
                              Laboratorium Simulasi Terkait:
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {item.matchedModules.map((mod) => (
                                <div
                                  key={mod.id}
                                  className="group p-3 rounded-xl bg-[#14171E] border border-[#222733] hover:border-[#3E8E75]/60 transition-all flex flex-col justify-between shadow-xs"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#4B8F8C]">
                                      <span>{mod.discipline || 'Sains'}</span>
                                      <span>•</span>
                                      <span>{mod.difficulty}</span>
                                    </div>
                                    <h4 className="font-heading text-xs font-bold text-[#F1F5F9] group-hover:text-[#4EAA8F] transition-colors line-clamp-1">
                                      {mod.title}
                                    </h4>
                                    <p className="text-[11px] text-[#94A3B8] line-clamp-2 leading-relaxed">
                                      {mod.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-[#222733]">
                                    <Link
                                      href={`/simulation/${getModuleSimulationSlug(mod)}`}
                                      className="text-[11px] font-mono text-[#4B8F8C] hover:underline"
                                    >
                                      Kanvas
                                    </Link>
                                    <Link
                                      href={`/modules/${mod.slug || mod.id}`}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1C332A] hover:bg-[#234438] border border-[#2A4D3F] text-[#F1F5F9] text-[11px] font-mono font-bold transition-all shadow-xs active:scale-95"
                                    >
                                      <span>Eksperimen</span>
                                      <IconArrowRight size={11} />
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Suggested Follow-up Chips */}
                        {item.suggestedFollowUp && item.suggestedFollowUp.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-2">
                            {item.suggestedFollowUp.map((fu, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleAiSubmit(undefined, fu)}
                                className="text-xs font-mono px-3 py-1.5 rounded-full bg-[#14171E] hover:bg-[#1B202A] border border-[#222733] hover:border-[#3E8E75]/40 text-[#94A3B8] hover:text-[#F1F5F9] transition-all cursor-pointer shadow-2xs active:scale-95"
                              >
                                {fu}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Loading / Thought State */}
                {aiLoading && (
                  <div className="flex items-start gap-3 sm:gap-4 w-full">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#14171E] border border-[#222733] flex items-center justify-center text-[#4B8F8C] shadow-xs mt-0.5 overflow-hidden">
                      <IconAiTutor size={18} />
                    </div>
                    <div className="px-4 py-2.5 rounded-2xl bg-[#14171E] border border-[#222733] text-xs font-mono text-[#94A3B8] flex items-center gap-2.5">
                      <IconLoader size={13} className="animate-spin text-[#4EAA8F]" />
                      <span>Menganalisis kurikulum laboratorium dan formula sains...</span>
                    </div>
                  </div>
                )}

                {/* Retry Banner if Failed */}
                {lastFailedPrompt && !aiLoading && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#211717] border border-[#4D2424] text-xs text-[#F28B82] w-full shadow-xs">
                    <div className="flex items-center gap-2">
                      <IconAlertCircle size={15} className="text-[#F28B82] shrink-0" />
                      <span>Permintaan laboratorium belum berhasil dijawab. Silakan coba lagi.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAiSubmit(undefined, lastFailedPrompt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3D1E1E] hover:bg-[#522727] text-white font-mono font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                    >
                      <IconRotateCcw size={12} />
                      <span>Coba Lagi</span>
                    </button>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Floating Scroll to Bottom Button (Visible when scrolled up reading older messages) */}
        {isScrolledUp && (
          <div className="absolute bottom-[140px] sm:bottom-[90px] left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
            <button
              type="button"
              onClick={() => scrollToBottom(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1B202A] hover:bg-[#222836] border border-[#2F3646] text-[#F1F5F9] text-xs font-mono font-medium shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <IconArrowDown size={13} className="text-[#4EAA8F]" />
              <span>Pesan Terbaru</span>
            </button>
          </div>
        )}

        {/* ── 5. MESSAGE COMPOSER — FIXED AT THE BOTTOM ── */}
        <div className="shrink-0 border-t border-[#222733] bg-[#0C0E12]/95 backdrop-blur-md p-3 sm:p-4 pb-3 sm:pb-4 mb-16 md:mb-0 z-20">
          <div className="max-w-3xl mx-auto w-full space-y-2">
            {/* Quota Exhausted Lockout Banner */}
            {isQuotaExhausted ? (
              <div className="rounded-2xl bg-[#14171E] border border-[#222733] shadow-xl p-4 sm:p-5 space-y-3 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#1B202A] border border-[#222733] flex items-center justify-center shrink-0">
                      <Icon3dAiCredit size={36} />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="font-heading text-sm sm:text-base font-bold text-white">
                        Kuota AI Tutor Hari Ini Sudah Terpakai Penuh
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-[#94A3B8]">
                        <span>Reset otomatis dalam:</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#1C332A] border border-[#2A4D3F] text-[#4EAA8F] font-mono font-bold text-[11px]">
                          {countdown}
                        </span>
                        <span className="text-[11px] text-[#64748B] hidden sm:inline">(pukul 00.00 WIB)</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#1B202A] hover:bg-[#222836] border border-[#2F3646] hover:border-[#3E8E75] text-[#F1F5F9] font-mono text-xs font-semibold shadow-xs transition-all active:scale-95 self-start sm:self-auto"
                  >
                    <span>Status Akun & Kuota</span>
                    <IconArrowRight size={13} className="text-[#4EAA8F]" />
                  </Link>
                </div>
              </div>
            ) : (
              /* Composer Input Box */
              <form
                onSubmit={handleAiSubmit}
                className="relative rounded-2xl bg-[#14171E] border border-[#222733] focus-within:border-[#3E8E75] focus-within:ring-1 focus-within:ring-[#3E8E75]/20 shadow-lg transition-all p-2 flex flex-col"
              >
                {/* Auto-growing multiline textarea */}
                <textarea
                  ref={textareaRef}
                  id="ai-explore-textarea"
                  value={aiPrompt}
                  onChange={(e) => {
                    setAiPrompt(e.target.value);
                    if (aiError) setAiError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={aiLoading}
                  placeholder="Ketik pertanyaan atau konsep laboratorium..."
                  className="w-full bg-transparent text-sm text-[#F1F5F9] placeholder:text-[#64748B] no-outline outline-none border-none font-sans px-2.5 pt-1.5 pb-2 resize-none leading-relaxed min-h-[44px] max-h-[160px] overflow-y-auto no-scrollbar"
                />

                {/* Composer Bottom Row: Send Button */}
                <div className="flex items-center justify-end pt-1 px-1">
                  <button
                    type="submit"
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#3E8E75] hover:bg-[#4EAA8F] disabled:bg-[#1B202A] text-white disabled:text-[#64748B] transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs active:scale-95"
                    title="Kirim Pertanyaan"
                    aria-label="Kirim pertanyaan ke Tanya AI"
                  >
                    {aiLoading ? (
                      <IconLoader size={15} className="animate-spin text-white" />
                    ) : (
                      <IconArrowUp size={16} className="stroke-[2.5]" />
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* AI Error Alert */}
            {aiError && (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs font-mono text-left flex items-start gap-2">
                <IconHelpCircle size={14} className="shrink-0 mt-0.5 text-amber-400" />
                <span>{aiError}</span>
              </div>
            )}

            {/* Bottom Disclaimer */}
            <p className="text-xs text-[#94A3B8] text-center font-sans select-none">
              Tanya AI dapat membuat kekeliruan. Selalu verifikasi formula dan rujukan laboratorium.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExploreContent />
    </Suspense>
  );
}
