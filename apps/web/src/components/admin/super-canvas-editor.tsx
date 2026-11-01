'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  IconArrowLeft,
  IconArrowUpRight,
  IconLineChart,
  IconSliders,
  IconFilter,
  IconPointer,
  IconDisciplineMath,
  IconGauge,
  IconLightbulb,
  IconTarget,
  IconPlus,
  IconTrash,
  IconCopy,
  IconEye,
  IconSave,
  IconSend,
  IconSparkles,
  IconSettings,
  IconClose,
  IconLayers,
  IconHelpCircle,
  IconCheckCircle,
  IconAlertCircle,
  IconChevronRight,
  IconChevronDown,
  IconInfo,
  IconMaximize,
  IconRotateCcw,
  IconShield,
  IconType,
  IconSquare,
  IconImage as ImageIcon,
  IconHash,
  IconToggleLeft,
} from '@/components/icons';
import { SuperCanvas } from '@/components/simulation/super-canvas';
import {
  UnifiedSimulatorSpec,
  VisualElement,
  SimulatorParameter,
  SimulatorCalculation,
  SimulatorResultItem,
  SimulatorExperimentSpec,
  createEmptySimulatorSpec,
  evaluateSimulator,
  safeEvaluateFormula,
} from '@/lib/simulation/simulator-schema';

export interface SuperCanvasEditorProps {
  initialSpec?: UnifiedSimulatorSpec;
  onSave: (spec: UnifiedSimulatorSpec, status: 'draft' | 'published') => Promise<void>;
  isSaving?: boolean;
}

const GEN_LABS_DISCIPLINES = [
  'Computer Science',
  'Accounting & Finance',
  'Business & Marketing',
  'Event Management',
  'Agriculture & Agribusiness',
  'Physics',
  'Mathematics',
  'Statistics',
  'Economics',
  'Chemistry',
  'Biology',
];

type ElementCategory = 'visual' | 'interaction' | 'learning';

interface SelectedTarget {
  category: ElementCategory | 'info';
  type: string;
  id: string;
}

// Human-Friendly Patch Description Formatter (Converts RFC 6902 to plain Indonesian)
function getFriendlyPatchDescription(patch: { op: string; path: string; value?: any }) {
  const path = patch.path || '';
  const op = (patch.op || 'replace').toLowerCase();

  let category = 'Simulator';
  let title = 'Penyesuaian Konfigurasi';
  let detail = 'Nilai konfigurasi simulator disesuaikan.';

  if (path.startsWith('/visual')) {
    category = 'Visual & Aparatus Lab';
    if (path.includes('elements')) {
      const isAdd = op === 'add';
      const isRemove = op === 'remove';
      title = isAdd
        ? 'Komponen Visual Baru Ditambahkan'
        : isRemove
        ? 'Komponen Visual Dihapus'
        : 'Komponen Visual Diperbarui';
      if (patch.value && typeof patch.value === 'object' && patch.value.label) {
        detail = `Elemen "${patch.value.label}" (${patch.value.type || 'visual'}) dikonfigurasi pada kanvas laboratorium.`;
      } else {
        detail = 'Posisi, warna, dimensi, atau elemen aparatus pada kanvas visual diperbarui.';
      }
    } else {
      title = 'Struktur Tata Letak Visual Diperbarui';
      detail = 'Skema visual kanvas laboratorium disesuaikan dengan kebutuhan pembelajaran interaktif.';
    }
  } else if (path.startsWith('/parameters')) {
    category = 'Variabel Kontrol';
    const parts = path.split('/').filter(Boolean);
    const paramKey = parts[1] || 'variabel';
    const isAdd = op === 'add';
    const isRemove = op === 'remove';
    title = isAdd
      ? `Variabel Kontrol Ditambahkan (${paramKey})`
      : isRemove
      ? `Variabel Kontrol Dihapus (${paramKey})`
      : `Variabel Kontrol Disesuaikan (${paramKey})`;

    if (patch.value && typeof patch.value === 'object') {
      const label = patch.value.label || paramKey;
      const range = patch.value.min !== undefined && patch.value.max !== undefined
        ? ` (rentang: ${patch.value.min} - ${patch.value.max} ${patch.value.unit || ''})`
        : '';
      detail = `Parameter "${label}"${range} dikonfigurasi sebagai pengendali simulasi.`;
    } else if (parts[2]) {
      detail = `Properti "${parts[2]}" pada parameter "${paramKey}" disesuaikan menjadi ${String(patch.value)}.`;
    } else {
      detail = `Parameter "${paramKey}" diperbarui untuk interaktivitas pengguna.`;
    }
  } else if (path.startsWith('/calculations')) {
    category = 'Formula & Fisika';
    const parts = path.split('/').filter(Boolean);
    const calcKey = parts[1] || 'formula';
    const isAdd = op === 'add';
    const isRemove = op === 'remove';
    title = isAdd
      ? `Formula Matematis Ditambahkan (${calcKey})`
      : isRemove
      ? `Formula Matematis Dihapus (${calcKey})`
      : `Formula Matematis Diperbarui (${calcKey})`;

    if (patch.value && typeof patch.value === 'object') {
      detail = `Rumus "${patch.value.label || calcKey}": ${patch.value.formula || 'perhitungan sistematis'} dikalkulasi secara realtime.`;
    } else if (parts[2] === 'formula') {
      detail = `Persamaan matematis diperbarui: ${String(patch.value)}.`;
    } else {
      detail = `Perhitungan hukum sains pada variabel "${calcKey}" diperbarui.`;
    }
  } else if (path.startsWith('/results')) {
    category = 'Indikator Hasil';
    title = op === 'add' ? 'Indikator Hasil Ditambahkan' : 'Indikator Hasil Diperbarui';
    detail = 'Panel pembacaan instrumen hasil simulasi disesuaikan.';
  } else if (path.startsWith('/experiments')) {
    category = 'Tantangan Eksperimen';
    title = 'Misi Pembelajaran Disesuaikan';
    if (patch.value && typeof patch.value === 'object' && patch.value.title) {
      detail = `Tantangan: "${patch.value.title}" dengan target ilmiah yang dapat diuji.`;
    } else {
      detail = 'Target numerik, batas toleransi verifikasi, atau misi sains siswa diperbarui.';
    }
  } else if (path.startsWith('/info')) {
    category = 'Informasi Lab';
    if (path.includes('title')) {
      title = 'Judul Simulator Diperbarui';
      detail = typeof patch.value === 'string' ? `"${patch.value}"` : 'Judul simulator disesuaikan.';
    } else if (path.includes('description')) {
      title = 'Deskripsi Modul Diperbarui';
      detail = typeof patch.value === 'string' ? patch.value : 'Deskripsi modul pembelajaran disesuaikan.';
    } else {
      title = 'Informasi Metadata Diperbarui';
      detail = 'Tingkat kesulitan atau topik modul disesuaikan.';
    }
  } else if (path.startsWith('/insight')) {
    category = 'Insight & Teori';
    title = 'Konsep & Penjelasan Ilmiah Diperbarui';
    detail = typeof patch.value === 'string' ? patch.value : 'Catatan teori fenomena dan panduan observasi diperbarui.';
  }

  const opLabel = op === 'add' ? 'Ditambahkan' : op === 'remove' ? 'Dihapus' : 'Diperbarui';
  const opColor = op === 'add'
    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    : op === 'remove'
    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';

  return { category, title, detail, opLabel, opColor };
}

export function SuperCanvasEditor({
  initialSpec,
  onSave,
  isSaving = false,
}: SuperCanvasEditorProps) {
  // 1. Initial State: Always fresh empty spec unless an existing spec was explicitly passed
  const [spec, setSpec] = useState<UnifiedSimulatorSpec>(() => initialSpec || createEmptySimulatorSpec());

  // 2. Selection state for contextual Right Panel
  const [selectedTarget, setSelectedTarget] = useState<SelectedTarget | null>(null);

  // 3. Workspace Mode: 'editor' (3-area authoring) vs 'preview' (live student testing)
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');

  // 4. Modals
  const [showAiModal, setShowAiModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 4.A Real Gemini AI Authoring & Patch States
  const [aiMode, setAiMode] = useState<'create' | 'patch'>('create');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState<'basic' | 'intermediate' | 'advanced'>('basic');
  const [aiLearningObjective, setAiLearningObjective] = useState('');
  const [aiDiscipline, setAiDiscipline] = useState('Computer Science');
  const [aiPatchInstruction, setAiPatchInstruction] = useState('');
  const [aiIsLoading, setAiIsLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [pendingPatchResult, setPendingPatchResult] = useState<{ patched: UnifiedSimulatorSpec; patches: any[] } | null>(null);
  const [patchReviewTab, setPatchReviewTab] = useState<'visual' | 'summary'>('visual');

  // Gen Labs AI Assistant Loading Animation States
  const [aiElapsedSeconds, setAiElapsedSeconds] = useState(0);
  const [aiStep, setAiStep] = useState(0);

  const GEN_LABS_AI_PHASES = useMemo(() => [
    {
      label: 'Menganalisis konsep pembelajaran & variabel kontrol',
      detail: 'Mengidentifikasi domain akademis, parameter kontrol, dan rentang nilai aman...',
    },
    {
      label: 'Merumuskan model matematis & formula sebab-akibat',
      detail: 'Menyusun persamaan analitis dan fungsi komputasi tanpa angka acak...',
    },
    {
      label: 'Menyusun kanvas visual, instrumen, & vektor gaya',
      detail: 'Merancang geometri laboratorium interaktif, aparatus, dan indikator hasil...',
    },
    {
      label: 'Memformulasikan tantangan eksperimen mandiri',
      detail: 'Menetapkan target numerik terukur dan toleransi verifikasi ilmiah...',
    },
    {
      label: 'Memvalidasi spesifikasi simulator GEN LABS',
      detail: 'Memverifikasi integritas skema UnifiedSimulatorSpec dan kesiapan interaksi...',
    },
  ], []);

  useEffect(() => {
    if (!aiIsLoading) {
      setAiElapsedSeconds(0);
      setAiStep(0);
      return;
    }
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setAiElapsedSeconds(elapsed);
      if (elapsed < 0.7) setAiStep(0);
      else if (elapsed < 1.5) setAiStep(1);
      else if (elapsed < 2.3) setAiStep(2);
      else if (elapsed < 3.0) setAiStep(3);
      else setAiStep(4);
    }, 100);

    return () => clearInterval(interval);
  }, [aiIsLoading]);

  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiIsLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/v1/admin/simulations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          topic: aiTopic.trim() || undefined,
          difficulty: aiDifficulty,
          learningObjective: aiLearningObjective.trim() || undefined,
          discipline: aiDiscipline,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.spec) {
        throw new Error(data.error || 'Gagal membuat simulator dengan AI.');
      }
      setSpec(data.spec);
      setShowAiModal(false);
      setAiPrompt('');
      setSaveFeedback({
        type: 'success',
        message: `Simulator "${data.spec.info.title}" berhasil dibuat dengan AI! Silakan tinjau dan klik Simpan Draft.`,
      });
    } catch (err: any) {
      setAiError(err.message || 'Terjadi kesalahan saat memproses permintaan AI.');
    } finally {
      setAiIsLoading(false);
    }
  };

  const handleAiPatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPatchInstruction.trim()) return;
    setAiIsLoading(true);
    setAiError(null);
    setPendingPatchResult(null);
    try {
      const res = await fetch('/api/v1/admin/simulations/patch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spec,
          instruction: aiPatchInstruction.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal merevisi simulator.');
      }
      setPendingPatchResult({ patched: data.patched, patches: data.patches });
      setPatchReviewTab('visual');
    } catch (err: any) {
      setAiError(err.message || 'Terjadi kesalahan saat merevisi simulator.');
    } finally {
      setAiIsLoading(false);
    }
  };

  const handleApplyPendingPatch = () => {
    if (!pendingPatchResult) return;
    setSpec(pendingPatchResult.patched);
    setPendingPatchResult(null);
    setShowAiModal(false);
    setAiPatchInstruction('');
    setSaveFeedback({
      type: 'success',
      message: 'Perubahan AI berhasil diterapkan pada simulator.',
    });
  };

  // 5. Drag-over highlight on canvas
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);
  const canvasSvgRef = useRef<SVGSVGElement | null>(null);

  // 6. Canvas element dragging & resizing state
  type ResizeHandle = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w' | 'arrow-start' | 'arrow-end';
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number; elemStartX: number; elemStartY: number } | null>(null);
  const [resizingState, setResizingState] = useState<{ id: string; handle: ResizeHandle } | null>(null);
  const resizeStartPos = useRef<{
    clientX: number;
    clientY: number;
    initX: number;
    initY: number;
    initW: number;
    initH: number;
    initFontSize: number;
    initX2: number;
    initY2: number;
  } | null>(null);

  // 7. Responsive Mobile Panel Toggle: 'none' | 'elements' | 'properties'
  const [mobileDrawer, setMobileDrawer] = useState<'none' | 'elements' | 'properties'>('none');

  // Compute live values for telemetry preview in canvas
  const currentTelemetry = useMemo(() => {
    return evaluateSimulator(spec, {});
  }, [spec]);

  // Evaluates dynamic geometry expressions against currentTelemetry
  const evalGeometryInEditor = useCallback((
    val: number | string | undefined,
    defaultVal: number
  ): number => {
    if (val === undefined || val === null) return defaultVal;
    if (typeof val === 'number') return val;
    const num = Number(val);
    if (!isNaN(num)) return num;
    const scope: Record<string, number> = {
      ...currentTelemetry.parameters,
    };
    for (const [k, v] of Object.entries(currentTelemetry.computed)) {
      if (typeof v === 'number') scope[k] = v;
    }
    return safeEvaluateFormula(String(val), scope);
  }, [currentTelemetry]);

  // ── ELEMENT FACTORY HELPERS ──
  const addVisualElement = useCallback((type: 'text' | 'shape' | 'arrow' | 'image' | 'chart', dropX?: number, dropY?: number) => {
    const id = `el_${Date.now()}`;
    const x = dropX ?? 180 + ((spec.visual.elements.length * 25) % 300);
    const y = dropY ?? 100 + ((spec.visual.elements.length * 20) % 140);

    let newEl: VisualElement;

    switch (type) {
      case 'text':
        newEl = {
          id,
          type: 'text',
          label: 'Keterangan Visual',
          x,
          y,
          fontSize: 14,
          fontWeight: 'bold',
          color: 'var(--color-text)',
          width: 140,
          height: 24,
        };
        break;
      case 'shape':
        newEl = {
          id,
          type: 'shape',
          label: 'Objek Simulasi',
          x,
          y,
          width: 90,
          height: 60,
          fill: 'var(--color-canvas-object)',
          stroke: 'var(--color-secondary)',
          strokeWidth: 2,
        };
        break;
      case 'arrow':
        newEl = {
          id,
          type: 'arrow',
          label: 'Vektor Gaya',
          x,
          y,
          x2: x + 100,
          y2: y,
          stroke: 'var(--color-primary)',
          strokeWidth: 2.5,
          side: 'top',
        };
        break;
      case 'image':
        newEl = {
          id,
          type: 'image',
          label: 'Media Visual',
          url: '',
          x,
          y,
          width: 120,
          height: 80,
        };
        break;
      case 'chart':
        newEl = {
          id,
          type: 'chart',
          label: 'Grafik Respons',
          x,
          y,
          width: 160,
          height: 100,
        };
        break;
    }

    setSpec((prev) => ({
      ...prev,
      visual: {
        ...prev.visual,
        elements: [...prev.visual.elements, newEl],
      },
    }));

    setSelectedTarget({ category: 'visual', type, id });
    setMobileDrawer('properties');
  }, [spec.visual.elements.length]);

  const addInteractionElement = useCallback((type: 'slider' | 'input' | 'choice' | 'toggle' | 'button') => {
    const key = `var_${Object.keys(spec.parameters).length + 1}`;
    const newParam: SimulatorParameter = {
      key,
      label: type === 'slider' ? 'Variabel Kontrol' : type === 'toggle' ? 'Saklar Biner' : 'Input Angka',
      min: 0,
      max: 100,
      step: 1,
      defaultVal: 20,
      unit: '',
      description: 'Parameter yang dapat disesuaikan oleh pengguna',
    };

    setSpec((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: newParam,
      },
    }));

    setSelectedTarget({ category: 'interaction', type, id: key });
    setMobileDrawer('properties');
  }, [spec.parameters]);

  const addLearningElement = useCallback((type: 'formula' | 'result' | 'insight' | 'experiment') => {
    if (type === 'formula') {
      const key = `calc_${Object.keys(spec.calculations).length + 1}`;
      const firstParam = Object.keys(spec.parameters)[0] || '10';
      const newCalc: SimulatorCalculation = {
        key,
        label: 'Perhitungan Relasi',
        formula: `${firstParam} * 2`,
        unit: '',
      };
      setSpec((prev) => ({
        ...prev,
        calculations: { ...prev.calculations, [key]: newCalc },
      }));
      setSelectedTarget({ category: 'learning', type: 'formula', id: key });
    } else if (type === 'result') {
      const calcKey = Object.keys(spec.calculations)[0] || Object.keys(spec.parameters)[0] || 'output';
      const newResult: SimulatorResultItem = {
        key: `res_${spec.results.length + 1}`,
        label: 'Hasil Output',
        symbol: 'R',
        calculationKey: calcKey,
        unit: '',
        highlight: true,
      };
      setSpec((prev) => ({
        ...prev,
        results: [...prev.results, newResult],
      }));
      setSelectedTarget({ category: 'learning', type: 'result', id: newResult.key });
    } else if (type === 'experiment') {
      const metric = Object.keys(spec.calculations)[0] || Object.keys(spec.parameters)[0] || 'output';
      const newExp: SimulatorExperimentSpec = {
        id: `exp-${spec.experiments.length + 1}`,
        title: `Tantangan Eksperimen #${spec.experiments.length + 1}`,
        objective: 'Atur variabel hingga indikator sistem mencapai nilai target.',
        targetMetric: metric,
        targetValue: 50,
        tolerance: 2,
        unit: '',
        successMessage: 'Selamat! Kamu berhasil menyeimbangkan parameter dengan tepat.',
      };
      setSpec((prev) => ({
        ...prev,
        experiments: [...prev.experiments, newExp],
      }));
      setSelectedTarget({ category: 'learning', type: 'experiment', id: newExp.id });
    } else if (type === 'insight') {
      if (!spec.insight.summary) {
        setSpec((prev) => ({
          ...prev,
          insight: {
            summary: 'Ringkasan konsep fenomena yang teramati.',
            causeAndEffect: 'Menaikkan variabel kontrol akan memengaruhi respons sistem.',
            whatIf: 'Jika parameter dinaikkan melebihi batas, sistem mencapai titik jenuh.',
          },
        }));
      }
      setSelectedTarget({ category: 'learning', type: 'insight', id: 'insight' });
    }
    setMobileDrawer('properties');
  }, [spec.calculations, spec.parameters, spec.results.length, spec.experiments.length, spec.insight.summary]);

  // ── DRAG & DROP FROM ELEMENT LIBRARY TO CANVAS ──
  const handleDragStart = (e: React.DragEvent, category: ElementCategory, type: string) => {
    e.dataTransfer.setData('genlabs/category', category);
    e.dataTransfer.setData('genlabs/type', type);
    e.dataTransfer.setData('simula/category', category);
    e.dataTransfer.setData('simula/type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOverCanvas) setIsDragOverCanvas(true);
  };

  const handleCanvasDragLeave = () => {
    setIsDragOverCanvas(false);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverCanvas(false);
    const category = (e.dataTransfer.getData('genlabs/category') || e.dataTransfer.getData('simula/category')) as ElementCategory;
    const type = e.dataTransfer.getData('genlabs/type') || e.dataTransfer.getData('simula/type');

    if (!category || !type) return;

    if (category === 'visual') {
      // Calculate coordinates relative to SVG viewBox (720 x 360)
      if (canvasSvgRef.current) {
        const rect = canvasSvgRef.current.getBoundingClientRect();
        const dropX = Math.round(((e.clientX - rect.left) / rect.width) * 720);
        const dropY = Math.round(((e.clientY - rect.top) / rect.height) * 360);
        addVisualElement(type as any, dropX, dropY);
      } else {
        addVisualElement(type as any);
      }
    } else if (category === 'interaction') {
      addInteractionElement(type as any);
    } else if (category === 'learning') {
      addLearningElement(type as any);
    }
  };

  // ── ELEMENT MOVING (DRAGGING ON CANVAS) ──
  const startMoveElement = (e: React.MouseEvent, elem: VisualElement) => {
    e.stopPropagation();
    setSelectedTarget({ category: 'visual', type: elem.type, id: elem.id });
    setDraggingElementId(elem.id);

    const startX = typeof elem.x === 'number' ? elem.x : 100;
    const startY = typeof elem.y === 'number' ? elem.y : 100;
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      elemStartX: startX,
      elemStartY: startY,
    };

    const handleMouseMove = (moveEvt: MouseEvent) => {
      if (!dragStartPos.current || !canvasSvgRef.current) return;
      const rect = canvasSvgRef.current.getBoundingClientRect();
      const scaleX = 720 / rect.width;
      const scaleY = 360 / rect.height;

      const deltaX = (moveEvt.clientX - dragStartPos.current.x) * scaleX;
      const deltaY = (moveEvt.clientY - dragStartPos.current.y) * scaleY;

      const newX = Math.max(10, Math.min(680, Math.round(dragStartPos.current.elemStartX + deltaX)));
      const newY = Math.max(10, Math.min(340, Math.round(dragStartPos.current.elemStartY + deltaY)));

      setSpec((prev) => ({
        ...prev,
        visual: {
          ...prev.visual,
          elements: prev.visual.elements.map((el) => {
            if (el.id !== elem.id) return el;
            if (el.type === 'arrow' || el.type === 'line') {
              const curX = typeof el.x === 'number' ? el.x : 100;
              const curY = typeof el.y === 'number' ? el.y : 100;
              const curX2 = typeof el.x2 === 'number' ? el.x2 : curX + 100;
              const curY2 = typeof el.y2 === 'number' ? el.y2 : curY;
              const spanX = curX2 - curX;
              const spanY = curY2 - curY;
              return { ...el, x: newX, y: newY, x2: newX + spanX, y2: newY + spanY };
            }
            return { ...el, x: newX, y: newY };
          }),
        },
      }));
    };

    const handleMouseUp = () => {
      setDraggingElementId(null);
      dragStartPos.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // ── ELEMENT RESIZING (DRAGGING HANDLES ON CANVAS - ALA EDITOR) ──
  const startResizeElement = (
    e: React.MouseEvent,
    elem: VisualElement,
    handle: ResizeHandle
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const elX = typeof elem.x === 'number' ? elem.x : 100;
    const elY = typeof elem.y === 'number' ? elem.y : 100;
    const fontSize = elem.fontSize || 14;
    const defaultW = elem.type === 'text'
      ? Math.max(50, Math.round((elem.label || 'Teks Visual').length * fontSize * 0.62))
      : elem.radius ? elem.radius * 2 : 90;
    const defaultH = elem.type === 'text'
      ? Math.round(fontSize * 1.3)
      : elem.radius ? elem.radius * 2 : 60;

    const elW = typeof elem.width === 'number' ? elem.width : defaultW;
    const elH = typeof elem.height === 'number' ? elem.height : defaultH;
    const elX2 = typeof elem.x2 === 'number' ? elem.x2 : elX + 100;
    const elY2 = typeof elem.y2 === 'number' ? elem.y2 : elY;

    setResizingState({ id: elem.id, handle });
    resizeStartPos.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initX: elX,
      initY: elY,
      initW: elW,
      initH: elH,
      initFontSize: fontSize,
      initX2: elX2,
      initY2: elY2,
    };

    const handleMouseMove = (moveEvt: MouseEvent) => {
      if (!resizeStartPos.current || !canvasSvgRef.current) return;
      const rect = canvasSvgRef.current.getBoundingClientRect();
      const scaleX = 720 / rect.width;
      const scaleY = 360 / rect.height;

      const deltaX = (moveEvt.clientX - resizeStartPos.current.clientX) * scaleX;
      const deltaY = (moveEvt.clientY - resizeStartPos.current.clientY) * scaleY;
      const { initX, initY, initW, initH, initFontSize, initX2, initY2 } = resizeStartPos.current;

      let newX = initX;
      let newY = initY;
      let newW = initW;
      let newH = initH;
      let newFontSize = initFontSize;
      let newX2 = initX2;
      let newY2 = initY2;

      if (handle === 'se') {
        newW = Math.max(20, Math.round(initW + deltaX));
        newH = Math.max(16, Math.round(initH + deltaY));
        if (elem.type === 'text') {
          const ratio = newH / Math.max(1, initH);
          newFontSize = Math.max(9, Math.min(64, Math.round(initFontSize * ratio)));
        }
      } else if (handle === 'sw') {
        newW = Math.max(20, Math.round(initW - deltaX));
        newH = Math.max(16, Math.round(initH + deltaY));
        newX = Math.round(initX + (initW - newW));
        if (elem.type === 'text') {
          const ratio = newH / Math.max(1, initH);
          newFontSize = Math.max(9, Math.min(64, Math.round(initFontSize * ratio)));
        }
      } else if (handle === 'ne') {
        newW = Math.max(20, Math.round(initW + deltaX));
        newH = Math.max(16, Math.round(initH - deltaY));
        newY = Math.round(initY + (initH - newH));
        if (elem.type === 'text') {
          const ratio = newH / Math.max(1, initH);
          newFontSize = Math.max(9, Math.min(64, Math.round(initFontSize * ratio)));
        }
      } else if (handle === 'nw') {
        newW = Math.max(20, Math.round(initW - deltaX));
        newH = Math.max(16, Math.round(initH - deltaY));
        newX = Math.round(initX + (initW - newW));
        newY = Math.round(initY + (initH - newH));
        if (elem.type === 'text') {
          const ratio = newH / Math.max(1, initH);
          newFontSize = Math.max(9, Math.min(64, Math.round(initFontSize * ratio)));
        }
      } else if (handle === 'e') {
        newW = Math.max(20, Math.round(initW + deltaX));
      } else if (handle === 's') {
        newH = Math.max(16, Math.round(initH + deltaY));
        if (elem.type === 'text') {
          const ratio = newH / Math.max(1, initH);
          newFontSize = Math.max(9, Math.min(64, Math.round(initFontSize * ratio)));
        }
      } else if (handle === 'w') {
        newW = Math.max(20, Math.round(initW - deltaX));
        newX = Math.round(initX + (initW - newW));
      } else if (handle === 'n') {
        newH = Math.max(16, Math.round(initH - deltaY));
        newY = Math.round(initY + (initH - newH));
        if (elem.type === 'text') {
          const ratio = newH / Math.max(1, initH);
          newFontSize = Math.max(9, Math.min(64, Math.round(initFontSize * ratio)));
        }
      } else if (handle === 'arrow-start') {
        newX = Math.round(initX + deltaX);
        newY = Math.round(initY + deltaY);
      } else if (handle === 'arrow-end') {
        newX2 = Math.round(initX2 + deltaX);
        newY2 = Math.round(initY2 + deltaY);
      }

      setSpec((prev) => ({
        ...prev,
        visual: {
          ...prev.visual,
          elements: prev.visual.elements.map((el) => {
            if (el.id !== elem.id) return el;
            if (el.type === 'arrow' || el.type === 'line') {
              return { ...el, x: newX, y: newY, x2: newX2, y2: newY2 };
            }
            if (el.type === 'text') {
              return {
                ...el,
                x: newX,
                y: newY,
                width: newW,
                height: newH,
                fontSize: newFontSize,
              };
            }
            if (el.type === 'shape' && el.radius) {
              const rad = Math.max(8, Math.round(Math.min(newW, newH) / 2));
              return {
                ...el,
                x: newX + rad,
                y: newY + rad,
                width: newW,
                height: newH,
                radius: rad,
              };
            }
            return {
              ...el,
              x: newX,
              y: newY,
              width: newW,
              height: newH,
            };
          }),
        },
      }));
    };

    const handleMouseUp = () => {
      setResizingState(null);
      resizeStartPos.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // ── KEYBOARD SHORTCUTS & NUDGING ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedTarget || selectedTarget.category !== 'visual') return;
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true')) {
        return;
      }

      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;

        setSpec((prev) => ({
          ...prev,
          visual: {
            ...prev.visual,
            elements: prev.visual.elements.map((el) => {
              if (el.id !== selectedTarget.id) return el;
              const curX = typeof el.x === 'number' ? el.x : 100;
              const curY = typeof el.y === 'number' ? el.y : 100;
              if (el.type === 'arrow' || el.type === 'line') {
                const curX2 = typeof el.x2 === 'number' ? el.x2 : curX + 100;
                const curY2 = typeof el.y2 === 'number' ? el.y2 : curY;
                return { ...el, x: curX + dx, y: curY + dy, x2: curX2 + dx, y2: curY2 + dy };
              }
              return { ...el, x: curX + dx, y: curY + dy };
            }),
          },
        }));
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedElement();
      } else if (e.key === 'Escape') {
        setSelectedTarget(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTarget]);

  // ── ELEMENT ACTIONS: DUPLICATE & DELETE ──
  const duplicateSelectedElement = () => {
    if (!selectedTarget) return;

    if (selectedTarget.category === 'visual') {
      const src = spec.visual.elements.find((el) => el.id === selectedTarget.id);
      if (!src) return;
      const dupId = `el_${Date.now()}`;
      const dup: VisualElement = {
        ...src,
        id: dupId,
        x: typeof src.x === 'number' ? src.x + 25 : 150,
        y: typeof src.y === 'number' ? src.y + 25 : 120,
        label: `${src.label || ''} (Salinan)`,
      };
      setSpec((prev) => ({
        ...prev,
        visual: { ...prev.visual, elements: [...prev.visual.elements, dup] },
      }));
      setSelectedTarget({ category: 'visual', type: dup.type, id: dupId });
    } else if (selectedTarget.category === 'interaction') {
      const src = spec.parameters[selectedTarget.id];
      if (!src) return;
      const newKey = `var_${Date.now().toString().slice(-4)}`;
      const dup: SimulatorParameter = {
        ...src,
        key: newKey,
        label: `${src.label} (Salinan)`,
      };
      setSpec((prev) => ({
        ...prev,
        parameters: { ...prev.parameters, [newKey]: dup },
      }));
      setSelectedTarget({ category: 'interaction', type: selectedTarget.type, id: newKey });
    }
  };

  const deleteSelectedElement = () => {
    if (!selectedTarget) return;

    if (selectedTarget.category === 'visual') {
      setSpec((prev) => ({
        ...prev,
        visual: {
          ...prev.visual,
          elements: prev.visual.elements.filter((el) => el.id !== selectedTarget.id),
        },
      }));
    } else if (selectedTarget.category === 'interaction') {
      setSpec((prev) => {
        const copy = { ...prev.parameters };
        delete copy[selectedTarget.id];
        return { ...prev, parameters: copy };
      });
    } else if (selectedTarget.category === 'learning') {
      if (selectedTarget.type === 'formula') {
        setSpec((prev) => {
          const copy = { ...prev.calculations };
          delete copy[selectedTarget.id];
          return { ...prev, calculations: copy };
        });
      } else if (selectedTarget.type === 'result') {
        setSpec((prev) => ({
          ...prev,
          results: prev.results.filter((r) => r.key !== selectedTarget.id),
        }));
      } else if (selectedTarget.type === 'experiment') {
        setSpec((prev) => ({
          ...prev,
          experiments: prev.experiments.filter((exp) => exp.id !== selectedTarget.id),
        }));
      } else if (selectedTarget.type === 'insight') {
        setSpec((prev) => ({
          ...prev,
          insight: { summary: '', causeAndEffect: '', whatIf: '' },
        }));
      }
    }

    setSelectedTarget(null);
  };

  // ── SAVE HANDLER ──
  const handleSaveDraft = async () => {
    try {
      setSaveFeedback(null);
      await onSave(spec, 'draft');
      setSaveFeedback({ type: 'success', message: 'Draft simulasi berhasil disimpan.' });
      setTimeout(() => setSaveFeedback(null), 3000);
    } catch {
      setSaveFeedback({ type: 'error', message: 'Gagal menyimpan draft simulasi.' });
    }
  };

  const handlePublish = async () => {
    try {
      setSaveFeedback(null);
      await onSave(spec, 'published');
      setSaveFeedback({ type: 'success', message: 'Simulasi berhasil diterbitkan!' });
      setTimeout(() => setSaveFeedback(null), 3000);
    } catch {
      setSaveFeedback({ type: 'error', message: 'Gagal menerbitkan simulasi.' });
    }
  };

  const isCanvasEmpty = spec.visual.elements.length === 0 && Object.keys(spec.parameters).length === 0;

  return (
    <div className="flex flex-col h-screen w-full bg-[var(--color-bg)] text-[var(--color-text)] overflow-hidden font-sans select-none">
      {/* ── 1. TOP AUTHORING BAR ── */}
      <header className="h-14 px-3 sm:px-5 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between gap-3 shrink-0 z-20">
        {/* Left: ← Kembali & Simulator Baru Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/admin/modules"
            className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors shrink-0 text-xs font-medium"
            title="Kembali ke Daftar Modul"
          >
            <IconArrowLeft size={16} />
            <span className="hidden sm:inline">Kembali</span>
          </Link>

          <div className="h-4 w-px bg-[var(--color-border)] shrink-0 hidden sm:block" />

          <div className="flex items-center gap-2 min-w-0">
            <input
              type="text"
              value={spec.info.title}
              onChange={(e) =>
                setSpec((prev) => ({
                  ...prev,
                  info: { ...prev.info, title: e.target.value },
                }))
              }
              placeholder="Simulator Baru"
              className="font-heading text-xs sm:text-sm md:text-base font-bold text-[var(--color-text)] bg-transparent outline-none border-b border-transparent hover:border-[var(--color-border)] focus:border-[var(--color-primary)] transition-colors px-1 py-0.5 max-w-[150px] sm:max-w-[240px] md:max-w-[340px] truncate"
            />
            <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-sm bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] text-[10px] font-mono text-[var(--color-text-secondary)]">
              {spec.info.discipline}
            </span>
          </div>
        </div>

        {/* Center: Simulator Status / Draft Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)]">
          <span className="font-medium text-[var(--color-text)]">
            {spec.info.status === 'published' ? 'Published' : 'Draft'}
          </span>
          <span className="text-[var(--color-text-tertiary)]">/</span>
          <span className="font-medium text-[var(--color-text)] truncate max-w-[200px]">
            {spec.info.title || 'Simulator Baru'}
          </span>
        </div>

        {/* Right: Actions (Simpan Draft, Preview, Terbitkan) */}
        <div className="flex items-center gap-2">
          {/* Honest AI Entry Point (Buat dengan AI / Edit dengan AI) */}
          <button
            type="button"
            onClick={() => {
              const hasContent = Object.keys(spec.parameters).length > 0;
              setAiMode(hasContent ? 'patch' : 'create');
              setAiError(null);
              setPendingPatchResult(null);
              setShowAiModal(true);
            }}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)] hover:bg-[var(--color-primary)]/15 text-[var(--color-primary-text)] text-xs font-semibold transition-colors cursor-pointer"
            title={Object.keys(spec.parameters).length > 0 ? 'Edit Simulator dengan Gemini AI' : 'Buat Simulator dengan Gemini AI'}
          >
            <IconSparkles size={14} />
            <span>{Object.keys(spec.parameters).length > 0 ? 'Edit dengan AI' : 'Buat dengan AI'}</span>
          </button>

          {/* Simulator Metadata Settings */}
          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            className="p-1.5 sm:p-2 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
            title="Pengaturan Informasi Simulator"
          >
            <IconSettings size={15} />
          </button>

          {/* Preview Toggle */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'editor' ? 'preview' : 'editor')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold transition-colors cursor-pointer min-h-[34px] ${
              viewMode === 'preview'
                ? 'bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary-text)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-text)]'
            }`}
          >
            <IconEye size={13} />
            <span>{viewMode === 'preview' ? 'Kembali' : 'Preview'}</span>
          </button>

          {/* Save Draft */}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] text-xs font-semibold text-[var(--color-text)] transition-colors cursor-pointer disabled:opacity-50 min-h-[34px]"
          >
            <IconSave size={13} />
            <span className="hidden sm:inline">Simpan Draft</span>
          </button>

          {/* Terbitkan */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50 min-h-[34px]"
          >
            <IconSend size={13} />
            <span>Terbitkan</span>
          </button>
        </div>
      </header>

      {/* Save Notification Toast */}
      {saveFeedback && (
        <div
          className={`px-4 py-2 text-xs font-medium flex items-center justify-between transition-all ${
            saveFeedback.type === 'success'
              ? 'bg-emerald-950/70 text-emerald-200 border-b border-emerald-800/40'
              : 'bg-rose-950/70 text-rose-200 border-b border-rose-800/40'
          }`}
        >
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            {saveFeedback.type === 'success' ? <IconCheckCircle size={14} /> : <IconAlertCircle size={14} />}
            <span>{saveFeedback.message}</span>
          </div>
        </div>
      )}

      {/* ── 2. PREVIEW MODE VIEWPORT (FULL CONTAINER) ── */}
      {viewMode === 'preview' ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[var(--color-bg)] flex flex-col items-center">
          <div className="w-full max-w-[1040px] space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <IconEye size={14} className="text-[var(--color-text-secondary)] shrink-0" />
                <span className="text-xs font-medium text-[var(--color-text)]">
                  Mode Pratinjau Pengguna aktif. Super Canvas beroperasi dalam kondisi live runtime.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('editor')}
                className="px-3 py-1 rounded-md bg-[var(--color-surface-subtle)] hover:bg-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] transition-colors cursor-pointer"
              >
                Kembali ke Editor
              </button>
            </div>

            {/* Same Super Canvas Engine in Student Mode */}
            <SuperCanvas spec={spec} mode="student" />
          </div>
        </div>
      ) : (
        /* ── 3. 3-AREA AUTHORING WORKSPACE (EDITOR MODE) ── */
        <div className="flex-1 flex overflow-hidden relative">
          {/* ── 3.A LEFT: ELEMENT LIBRARY (220px) ── */}
          <aside
            className={`w-[220px] max-w-[85vw] border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col shrink-0 overflow-y-auto no-scrollbar transition-all duration-200 select-none ${
              mobileDrawer === 'elements'
                ? 'fixed inset-y-0 left-0 z-40 shadow-2xl flex md:static md:shadow-none'
                : 'hidden md:flex'
            }`}
          >
            <div className="p-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-secondary)] font-bold">
                Pustaka Elemen
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawer('none')}
                className="md:hidden p-1 rounded-md hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] cursor-pointer"
                title="Tutup Pustaka Elemen"
              >
                <IconClose size={15} />
              </button>
            </div>

            <div className="p-2.5 space-y-4 flex-1">
              {/* GROUP 1: VISUAL */}
              <div className="space-y-1">
                <div className="px-1 py-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold">
                    Visual
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'visual', 'text')}
                    onClick={() => addVisualElement('text')}
                    className="p-2 rounded-md border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)] text-left transition-colors flex items-center gap-2 cursor-grab active:cursor-grabbing min-h-[34px]"
                    title="Teks visual"
                  >
                    <IconType size={14} className="text-[var(--color-primary)] shrink-0" />
                    <span className="text-xs font-medium text-[var(--color-text)]">Text</span>
                  </button>

                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'visual', 'shape')}
                    onClick={() => addVisualElement('shape')}
                    className="p-2 rounded-md border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)] text-left transition-colors flex items-center gap-2 cursor-grab active:cursor-grabbing min-h-[34px]"
                    title="Bentuk balok/lingkaran"
                  >
                    <IconSquare size={14} className="text-[var(--color-secondary)] shrink-0" />
                    <span className="text-xs font-medium text-[var(--color-text)]">Shape</span>
                  </button>

                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'visual', 'arrow')}
                    onClick={() => addVisualElement('arrow')}
                    className="p-2 rounded-md border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)] text-left transition-colors flex items-center gap-2 cursor-grab active:cursor-grabbing min-h-[34px]"
                    title="Panah arah atau vektor gaya"
                  >
                    <IconArrowUpRight size={14} className="text-[var(--color-accent)] shrink-0" />
                    <span className="text-xs font-medium text-[var(--color-text)]">Arrow</span>
                  </button>

                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'visual', 'chart')}
                    onClick={() => addVisualElement('chart')}
                    className="p-2 rounded-md border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)] text-left transition-colors flex items-center gap-2 cursor-grab active:cursor-grabbing min-h-[34px]"
                    title="Grafik plot"
                  >
                    <IconLineChart size={14} className="text-[var(--color-primary)] shrink-0" />
                    <span className="text-xs font-medium text-[var(--color-text)]">Chart</span>
                  </button>

                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'visual', 'image')}
                    onClick={() => addVisualElement('image')}
                    className="col-span-2 p-2 rounded-md border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)] text-left transition-colors flex items-center gap-2 cursor-grab active:cursor-grabbing min-h-[34px]"
                    title="Gambar atau ilustrasi skema"
                  >
                    <ImageIcon size={14} className="text-[var(--color-text-secondary)] shrink-0" />
                    <span className="text-xs font-medium text-[var(--color-text)]">Image</span>
                  </button>
                </div>
              </div>

              {/* GROUP 2: INTERACTION */}
              <div className="space-y-1 pt-2 border-t border-[var(--color-border-subtle)]">
                <div className="px-1 py-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold">
                    Interaction
                  </span>
                </div>
                <div className="space-y-1">
                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'interaction', 'slider')}
                    onClick={() => addInteractionElement('slider')}
                    className="w-full p-2 rounded-md border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)] text-left transition-colors flex items-center gap-2 cursor-grab active:cursor-grabbing min-h-[34px]"
                  >
                    <IconSliders size={14} className="text-[var(--color-primary)] shrink-0" />
                    <span className="text-xs font-medium text-[var(--color-text)]">Slider</span>
                  </button>

                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'interaction', 'input')}
                    onClick={() => addInteractionElement('input')}
                    className="w-full p-2 rounded-md border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)] text-left transition-colors flex items-center gap-2 cursor-grab active:cursor-grabbing min-h-[34px]"
                  >
                    <IconHash size={14} className="text-[var(--color-secondary)] shrink-0" />
                    <span className="text-xs font-medium text-[var(--color-text)]">Input</span>
                  </button>

                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'interaction', 'choice')}
                    onClick={() => addInteractionElement('choice')}
                    className="w-full p-2 rounded-md border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)] text-left transition-colors flex items-center gap-2 cursor-grab active:cursor-grabbing min-h-[34px]"
                  >
                    <IconFilter size={14} className="text-[var(--color-secondary)] shrink-0" />
                    <span className="text-xs font-medium text-[var(--color-text)]">Choice</span>
                  </button>

                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'interaction', 'toggle')}
                    onClick={() => addInteractionElement('toggle')}
                    className="w-full p-2 rounded-md border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)] text-left transition-colors flex items-center gap-2 cursor-grab active:cursor-grabbing min-h-[34px]"
                  >
                    <IconToggleLeft size={14} className="text-[var(--color-accent)] shrink-0" />
                    <span className="text-xs font-medium text-[var(--color-text)]">Toggle</span>
                  </button>

                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'interaction', 'button')}
                    onClick={() => addInteractionElement('button')}
                    className="w-full p-2 rounded-md border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)] text-left transition-colors flex items-center gap-2 cursor-grab active:cursor-grabbing min-h-[34px]"
                  >
                    <IconPointer size={14} className="text-[var(--color-primary)] shrink-0" />
                    <span className="text-xs font-medium text-[var(--color-text)]">Button</span>
                  </button>
                </div>
              </div>

              {/* GROUP 3: LEARNING */}
              <div className="space-y-1 pt-2 border-t border-[var(--color-border-subtle)]">
                <div className="px-1 py-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold">
                    Learning
                  </span>
                </div>
                <div className="space-y-1">
                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'learning', 'formula')}
                    onClick={() => addLearningElement('formula')}
                    className="w-full p-2 rounded-md border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)] text-left transition-colors flex items-center gap-2 cursor-grab active:cursor-grabbing min-h-[34px]"
                  >
                    <IconDisciplineMath size={14} className="text-[var(--color-accent)] shrink-0" />
                    <span className="text-xs font-medium text-[var(--color-text)]">Formula</span>
                  </button>

                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'learning', 'result')}
                    onClick={() => addLearningElement('result')}
                    className="w-full p-2 rounded-md border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)] text-left transition-colors flex items-center gap-2 cursor-grab active:cursor-grabbing min-h-[34px]"
                  >
                    <IconGauge size={14} className="text-[var(--color-primary)] shrink-0" />
                    <span className="text-xs font-medium text-[var(--color-text)]">Result</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addLearningElement('insight')}
                    className="w-full p-2 rounded-md border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)] text-left transition-colors flex items-center gap-2 cursor-pointer min-h-[34px]"
                  >
                    <IconLightbulb size={14} className="text-amber-500 shrink-0" />
                    <span className="text-xs font-medium text-[var(--color-text)]">Insight</span>
                  </button>

                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'learning', 'experiment')}
                    onClick={() => addLearningElement('experiment')}
                    className="w-full p-2 rounded-md border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)] text-left transition-colors flex items-center gap-2 cursor-grab active:cursor-grabbing min-h-[34px]"
                  >
                    <IconTarget size={14} className="text-[var(--color-secondary)] shrink-0" />
                    <span className="text-xs font-medium text-[var(--color-text)]">Experiment</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* ── 3.B CENTER: SUPER CANVAS WORKSPACE (DOMINANT HERO) ── */}
          <main
            className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 flex flex-col items-center justify-start bg-[var(--color-bg)]"
            onClick={() => setSelectedTarget(null)}
          >
            <div className="w-full max-w-[1140px] xl:max-w-[1280px] space-y-6">
              {/* Canvas Header Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Area Kanvas Simulasi
                  </span>
                  <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">
                    (720 × 360 px)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={spec.visual.gridLines}
                      onChange={(e) =>
                        setSpec((prev) => ({
                          ...prev,
                          visual: { ...prev.visual, gridLines: e.target.checked },
                        }))
                      }
                      className="rounded cursor-pointer"
                    />
                    <span>Garis Grid</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={spec.visual.groundPlane}
                      onChange={(e) =>
                        setSpec((prev) => ({
                          ...prev,
                          visual: { ...prev.visual, groundPlane: e.target.checked },
                        }))
                      }
                      className="rounded cursor-pointer"
                    />
                    <span>Lantai Dasar</span>
                  </label>
                </div>
              </div>

              {/* ── THE VISUAL CANVAS CONTAINER (DROP ZONE & ELEMENT DISPLAY) ── */}
              <div
                onDragOver={handleCanvasDragOver}
                onDragLeave={handleCanvasDragLeave}
                onDrop={handleCanvasDrop}
                className={`relative w-full rounded-lg bg-[var(--color-surface)] border shadow-xs overflow-hidden transition-all ${
                  isDragOverCanvas
                    ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20'
                    : 'border-[var(--color-border)]'
                }`}
              >
                {/* EMPTY STATE (CLEAN, INTENTIONAL, NO SLOP, DISAPPEARS WHEN ELEMENT ADDED) */}
                {isCanvasEmpty ? (
                  <div className="w-full min-h-[380px] sm:min-h-[440px] md:min-h-[480px] flex flex-col items-center justify-center p-8 text-center select-none relative">
                    {/* Subtle grid background */}
                    <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="empty-editor-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeWidth="0.8" strokeDasharray="3 3" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#empty-editor-grid)" />
                    </svg>

                    <div className="relative z-10 max-w-sm flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary-text)] shadow-2xs">
                        <IconLayers size={22} strokeWidth={1.5} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-heading text-sm sm:text-base font-bold text-[var(--color-text)] tracking-tight">
                          Mulai membangun simulasi
                        </h3>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                          Tarik elemen dari panel kiri ke area ini, atau klik salah satu elemen untuk menambahkannya langsung ke kanvas.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addVisualElement('shape')}
                        className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-xs font-semibold text-[var(--color-text)] transition-colors shadow-2xs cursor-pointer"
                      >
                        <IconPlus size={14} />
                        <span>Tambahkan elemen pertama</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── SVG CANVAS WITH PLACED ELEMENTS & SELECTION HANDLES ── */
                  <div className="relative w-full aspect-[2/1] min-h-[380px] sm:min-h-[440px] md:min-h-[480px]">
                    <svg
                      ref={canvasSvgRef}
                      viewBox="0 0 720 360"
                      className="w-full h-full select-none"
                      onClick={() => setSelectedTarget(null)}
                    >
                      <defs>
                        <marker id="editor-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--color-primary)" />
                        </marker>
                      </defs>

                      {/* Optional Grid Lines */}
                      {spec.visual.gridLines && (
                        <g opacity={0.4}>
                          {Array.from({ length: 15 }, (_, i) => (
                            <line key={`gx-${i}`} x1={i * 48} y1={0} x2={i * 48} y2={360} stroke="var(--color-canvas-grid)" strokeWidth={0.8} strokeDasharray="3 3" />
                          ))}
                          {Array.from({ length: 8 }, (_, i) => (
                            <line key={`gy-${i}`} x1={0} y1={i * 45} x2={720} y2={i * 45} stroke="var(--color-canvas-grid)" strokeWidth={0.8} strokeDasharray="3 3" />
                          ))}
                        </g>
                      )}

                      {/* Optional Ground Plane */}
                      {spec.visual.groundPlane && (
                        <g>
                          <rect x={0} y={260} width={720} height={100} fill="var(--color-canvas-ground)" />
                          <line x1={0} y1={260} x2={720} y2={260} stroke="var(--color-canvas-seam)" strokeWidth={2} />
                        </g>
                      )}

                      {/* Elements Display & Manipulation */}
                      {spec.visual.elements.map((elem) => {
                        const fontSize = elem.fontSize || 14;
                        const textLabel = elem.label || 'Teks Visual';
                        const defaultTextW = Math.max(50, Math.round(textLabel.length * fontSize * 0.62));
                        const defaultTextH = Math.round(fontSize * 1.3);

                        const elX = evalGeometryInEditor(elem.x, 100);
                        const elY = evalGeometryInEditor(elem.y, 100);
                        const elW = evalGeometryInEditor(
                          elem.width,
                          elem.type === 'text' ? defaultTextW : elem.radius ? elem.radius * 2 : 90
                        );
                        const elH = evalGeometryInEditor(
                          elem.height,
                          elem.type === 'text' ? defaultTextH : elem.radius ? elem.radius * 2 : 60
                        );

                        const elX2 = evalGeometryInEditor(elem.x2, elX + elW);
                        const elY2 = evalGeometryInEditor(elem.y2, elY);
                        const isSelected = selectedTarget?.category === 'visual' && selectedTarget.id === elem.id;

                        const boxX = elem.type === 'shape' && elem.radius ? elX - elem.radius : elX;
                        const boxY = elem.type === 'shape' && elem.radius ? elY - elem.radius : elY;
                        const boxW = elem.type === 'shape' && elem.radius ? elem.radius * 2 : elW;
                        const boxH = elem.type === 'shape' && elem.radius ? elem.radius * 2 : elH;

                        let elementContent: React.ReactNode = null;

                        if (elem.type === 'shape') {
                          elementContent = elem.radius ? (
                            <g>
                              <circle
                                cx={elX}
                                cy={elY}
                                r={elem.radius}
                                fill={elem.fill || 'var(--color-canvas-object)'}
                                stroke={elem.stroke || 'var(--color-secondary)'}
                                strokeWidth={elem.strokeWidth || 2}
                              />
                              {elem.label && (
                                <text
                                  x={elX}
                                  y={elY + 4}
                                  textAnchor="middle"
                                  fill="var(--color-text)"
                                  fontSize={11}
                                  fontFamily="Space Mono"
                                  fontWeight="bold"
                                  pointerEvents="none"
                                >
                                  {elem.label}
                                </text>
                              )}
                            </g>
                          ) : (
                            <g>
                              <rect
                                x={elX}
                                y={elY}
                                width={elW}
                                height={elH}
                                rx={4}
                                fill={elem.fill || 'var(--color-canvas-object)'}
                                stroke={elem.stroke || 'var(--color-secondary)'}
                                strokeWidth={elem.strokeWidth || 2}
                              />
                              {elem.label && (
                                <text
                                  x={elX + elW / 2}
                                  y={elY + elH / 2 + 4}
                                  textAnchor="middle"
                                  fill="var(--color-text)"
                                  fontSize={11}
                                  fontFamily="Space Mono"
                                  fontWeight="bold"
                                  pointerEvents="none"
                                >
                                  {elem.label}
                                </text>
                              )}
                            </g>
                          );
                        } else if (elem.type === 'arrow' || elem.type === 'line') {
                          elementContent = (
                            <g>
                              <line
                                x1={elX}
                                y1={elY}
                                x2={elX2}
                                y2={elY2}
                                stroke={elem.stroke || 'var(--color-primary)'}
                                strokeWidth={elem.strokeWidth || 2.5}
                                markerEnd="url(#editor-arrow)"
                              />
                              {elem.label && (
                                <text
                                  x={(elX + elX2) / 2}
                                  y={(elY + elY2) / 2 - 8}
                                  textAnchor="middle"
                                  fill="var(--color-text)"
                                  fontSize={10}
                                  fontFamily="Space Mono"
                                  fontWeight="bold"
                                >
                                  {elem.label}
                                </text>
                              )}
                            </g>
                          );
                        } else if (elem.type === 'text') {
                          elementContent = (
                            <text
                              x={elX}
                              y={elY}
                              dominantBaseline="hanging"
                              fill={elem.color || 'var(--color-text)'}
                              fontSize={fontSize}
                              fontFamily="Space Mono"
                              fontWeight={elem.fontWeight || 'bold'}
                            >
                              {textLabel}
                            </text>
                          );
                        } else if (elem.type === 'image') {
                          elementContent = (
                            <g>
                              <rect x={elX} y={elY} width={elW} height={elH} fill="var(--color-surface-subtle)" stroke="var(--color-border)" rx={4} />
                              {elem.url ? (
                                <image href={elem.url} x={elX} y={elY} width={elW} height={elH} preserveAspectRatio="xMidYMid meet" />
                              ) : (
                                <text x={elX + elW / 2} y={elY + elH / 2} textAnchor="middle" dominantBaseline="middle" fill="var(--color-text-secondary)" fontSize={10} fontFamily="Space Mono">
                                  {elem.label || 'Media Gambar'}
                                </text>
                              )}
                            </g>
                          );
                        } else if (elem.type === 'chart') {
                          elementContent = (
                            <g>
                              <rect x={elX} y={elY} width={elW} height={elH} fill="var(--color-surface-subtle)" stroke="var(--color-border)" rx={4} />
                              <path d={`M ${elX + 8} ${elY + elH - 8} Q ${elX + elW * 0.4} ${elY + 12}, ${elX + elW - 8} ${elY + elH * 0.3}`} fill="none" stroke="var(--color-primary)" strokeWidth={2} />
                              <text x={elX + 8} y={elY + 14} fill="var(--color-text-secondary)" fontSize={10} fontFamily="Space Mono" fontWeight="bold">
                                {elem.label || 'Grafik'}
                              </text>
                            </g>
                          );
                        }

                        return (
                          <g
                            key={elem.id}
                            onMouseDown={(e) => startMoveElement(e, elem)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTarget({ category: 'visual', type: elem.type, id: elem.id });
                              setMobileDrawer('properties');
                            }}
                            className="cursor-move"
                          >
                            {elementContent}

                            {/* Selection Outline & Corner/Edge Handles */}
                            {isSelected && (
                              <g>
                                {/* Dashed Bounding Box */}
                                <rect
                                  x={boxX - 4}
                                  y={boxY - 4}
                                  width={boxW + 8}
                                  height={boxH + 8}
                                  fill="none"
                                  stroke="var(--color-primary)"
                                  strokeWidth={1.5}
                                  strokeDasharray="4 3"
                                  rx={2}
                                  pointerEvents="none"
                                />

                                {/* 4 Corner Resize Handles */}
                                <g
                                  transform={`translate(${boxX - 4}, ${boxY - 4})`}
                                  className="cursor-nwse-resize"
                                  onMouseDown={(e) => startResizeElement(e, elem, 'nw')}
                                >
                                  <rect x={-8} y={-8} width={16} height={16} fill="transparent" />
                                  <rect x={-3.5} y={-3.5} width={7} height={7} fill="#ffffff" stroke="var(--color-primary)" strokeWidth={1.5} rx={1} />
                                </g>

                                <g
                                  transform={`translate(${boxX + boxW + 4}, ${boxY - 4})`}
                                  className="cursor-nesw-resize"
                                  onMouseDown={(e) => startResizeElement(e, elem, 'ne')}
                                >
                                  <rect x={-8} y={-8} width={16} height={16} fill="transparent" />
                                  <rect x={-3.5} y={-3.5} width={7} height={7} fill="#ffffff" stroke="var(--color-primary)" strokeWidth={1.5} rx={1} />
                                </g>

                                <g
                                  transform={`translate(${boxX + boxW + 4}, ${boxY + boxH + 4})`}
                                  className="cursor-nwse-resize"
                                  onMouseDown={(e) => startResizeElement(e, elem, 'se')}
                                >
                                  <rect x={-8} y={-8} width={16} height={16} fill="transparent" />
                                  <rect x={-3.5} y={-3.5} width={7} height={7} fill="#ffffff" stroke="var(--color-primary)" strokeWidth={1.5} rx={1} />
                                </g>

                                <g
                                  transform={`translate(${boxX - 4}, ${boxY + boxH + 4})`}
                                  className="cursor-nesw-resize"
                                  onMouseDown={(e) => startResizeElement(e, elem, 'sw')}
                                >
                                  <rect x={-8} y={-8} width={16} height={16} fill="transparent" />
                                  <rect x={-3.5} y={-3.5} width={7} height={7} fill="#ffffff" stroke="var(--color-primary)" strokeWidth={1.5} rx={1} />
                                </g>

                                {/* 4 Edge Handles */}
                                <g
                                  transform={`translate(${boxX + boxW / 2}, ${boxY - 4})`}
                                  className="cursor-ns-resize"
                                  onMouseDown={(e) => startResizeElement(e, elem, 'n')}
                                >
                                  <rect x={-8} y={-8} width={16} height={16} fill="transparent" />
                                  <rect x={-4} y={-2.5} width={8} height={5} fill="#ffffff" stroke="var(--color-primary)" strokeWidth={1.2} rx={1} />
                                </g>

                                <g
                                  transform={`translate(${boxX + boxW / 2}, ${boxY + boxH + 4})`}
                                  className="cursor-ns-resize"
                                  onMouseDown={(e) => startResizeElement(e, elem, 's')}
                                >
                                  <rect x={-8} y={-8} width={16} height={16} fill="transparent" />
                                  <rect x={-4} y={-2.5} width={8} height={5} fill="#ffffff" stroke="var(--color-primary)" strokeWidth={1.2} rx={1} />
                                </g>

                                <g
                                  transform={`translate(${boxX + boxW + 4}, ${boxY + boxH / 2})`}
                                  className="cursor-ew-resize"
                                  onMouseDown={(e) => startResizeElement(e, elem, 'e')}
                                >
                                  <rect x={-8} y={-8} width={16} height={16} fill="transparent" />
                                  <rect x={-2.5} y={-4} width={5} height={8} fill="#ffffff" stroke="var(--color-primary)" strokeWidth={1.2} rx={1} />
                                </g>

                                <g
                                  transform={`translate(${boxX - 4}, ${boxY + boxH / 2})`}
                                  className="cursor-ew-resize"
                                  onMouseDown={(e) => startResizeElement(e, elem, 'w')}
                                >
                                  <rect x={-8} y={-8} width={16} height={16} fill="transparent" />
                                  <rect x={-2.5} y={-4} width={5} height={8} fill="#ffffff" stroke="var(--color-primary)" strokeWidth={1.2} rx={1} />
                                </g>
                              </g>
                            )}

                            {/* Vector Endpoint Handles for arrow/line */}
                            {isSelected && (elem.type === 'arrow' || elem.type === 'line') && (
                              <g>
                                <g
                                  transform={`translate(${elX}, ${elY})`}
                                  className="cursor-crosshair"
                                  onMouseDown={(e) => startResizeElement(e, elem, 'arrow-start')}
                                >
                                  <rect x={-8} y={-8} width={16} height={16} fill="transparent" />
                                  <circle cx={0} cy={0} r={4.5} fill="#ffffff" stroke="var(--color-primary)" strokeWidth={1.8} />
                                </g>
                                <g
                                  transform={`translate(${elX2}, ${elY2})`}
                                  className="cursor-crosshair"
                                  onMouseDown={(e) => startResizeElement(e, elem, 'arrow-end')}
                                >
                                  <rect x={-8} y={-8} width={16} height={16} fill="transparent" />
                                  <circle cx={0} cy={0} r={4.5} fill="#ffffff" stroke="var(--color-primary)" strokeWidth={1.8} />
                                </g>
                              </g>
                            )}

                            {/* Live Tooltip HUD when resizing */}
                            {resizingState && resizingState.id === elem.id && (
                              <g transform={`translate(${boxX + boxW / 2}, ${boxY - 14})`} pointerEvents="none">
                                <rect
                                  x={-35}
                                  y={-10}
                                  width={70}
                                  height={18}
                                  rx={4}
                                  fill="rgba(24, 30, 27, 0.95)"
                                  stroke="var(--color-primary)"
                                  strokeWidth={1}
                                />
                                <text
                                  x={0}
                                  y={3}
                                  textAnchor="middle"
                                  fill="#ffffff"
                                  fontSize={9.5}
                                  fontFamily="Space Mono"
                                  fontWeight="bold"
                                >
                                  {elem.type === 'text' ? `${elem.fontSize || 14}px` : `${Math.round(boxW)} × ${Math.round(boxH)}`}
                                </text>
                              </g>
                            )}

                            {/* Live Tooltip HUD when moving */}
                            {draggingElementId === elem.id && (
                              <g transform={`translate(${boxX + boxW / 2}, ${boxY - 14})`} pointerEvents="none">
                                <rect
                                  x={-42}
                                  y={-10}
                                  width={84}
                                  height={18}
                                  rx={4}
                                  fill="rgba(24, 30, 27, 0.95)"
                                  stroke="var(--color-primary)"
                                  strokeWidth={1}
                                />
                                <text
                                  x={0}
                                  y={3}
                                  textAnchor="middle"
                                  fill="#ffffff"
                                  fontSize={9.5}
                                  fontFamily="Space Mono"
                                  fontWeight="bold"
                                >
                                  X:{Math.round(elX)} Y:{Math.round(elY)}
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      })}
                    </svg>

                    {/* Floating mini toolbar when a visual element is selected */}
                    {selectedTarget?.category === 'visual' && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 p-1 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateSelectedElement();
                          }}
                          className="p-1.5 rounded-sm hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] text-xs transition-colors"
                          title="Duplikasi Elemen"
                        >
                          <IconCopy size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSelectedElement();
                          }}
                          className="p-1.5 rounded-sm hover:bg-rose-500/10 text-rose-500 text-xs transition-colors"
                          title="Hapus Elemen"
                        >
                          <IconTrash size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── 3.C INTEGRATED SIMULATION CONTROLS & LEARNING BAR ── */}
              {/* Parameter Controls (Student Interactive Area Preview) */}
              {Object.keys(spec.parameters).length > 0 && (
                <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-primary-text)] flex items-center gap-1.5">
                      <IconSliders size={14} />
                      <span>Kontrol Parameter Pengguna</span>
                    </span>
                    <span className="text-[10px] text-[var(--color-text-secondary)]">Klik slider untuk mengedit konfigurasi</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {Object.entries(spec.parameters).map(([key, p]) => (
                      <div
                        key={key}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTarget({ category: 'interaction', type: 'slider', id: key });
                          setMobileDrawer('properties');
                        }}
                        className={`p-3 rounded-md border transition-all cursor-pointer ${
                          selectedTarget?.id === key
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
                            : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50 bg-[var(--color-surface-subtle)]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-medium text-[var(--color-text)] mb-1.5">
                          <span>{p.label}</span>
                          <span className="font-mono text-[11px] text-[var(--color-primary-text)] font-bold">
                            {p.defaultVal} {p.unit}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--color-border)] rounded-sm overflow-hidden">
                          <div
                            className="h-full bg-[var(--color-primary)] rounded-sm"
                            style={{
                              width: `${Math.max(5, Math.min(100, ((p.defaultVal - p.min) / (p.max - p.min || 1)) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Outputs (Calculations & Results Preview) */}
              {(spec.results.length > 0 || Object.keys(spec.calculations).length > 0) && (
                <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-secondary)] flex items-center gap-1.5">
                      <IconGauge size={14} />
                      <span>Data Pengukuran &amp; Perhitungan</span>
                    </span>
                    <span className="text-[10px] text-[var(--color-text-secondary)]">Keluaran terukur</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {spec.results.map((res) => (
                      <div
                        key={res.key}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTarget({ category: 'learning', type: 'result', id: res.key });
                          setMobileDrawer('properties');
                        }}
                        className={`p-3 rounded-md border transition-all cursor-pointer ${
                          selectedTarget?.id === res.key
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
                            : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50 bg-[var(--color-surface-subtle)]'
                        }`}
                      >
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-secondary)] truncate">
                          {res.label}
                        </div>
                        <div className="text-base sm:text-lg font-mono font-bold text-[var(--color-text)] mt-1">
                          {currentTelemetry.computed[res.calculationKey] ?? 0} {res.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Experiment Challenge Preview */}
              {spec.experiments.length > 0 && (
                <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-secondary)] flex items-center gap-1.5">
                      <IconTarget size={14} />
                      <span>Tantangan Eksperimen Pengguna</span>
                    </span>
                  </div>

                  <div className="space-y-2">
                    {spec.experiments.map((exp) => (
                      <div
                        key={exp.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTarget({ category: 'learning', type: 'experiment', id: exp.id });
                          setMobileDrawer('properties');
                        }}
                        className={`p-3 rounded-md border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          selectedTarget?.id === exp.id
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
                            : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50 bg-[var(--color-surface-subtle)]'
                        }`}
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[var(--color-text)] truncate">{exp.title}</h4>
                          <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-1">{exp.objective}</p>
                        </div>
                        <div className="shrink-0 font-mono text-xs font-bold text-[var(--color-secondary)] px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)]">
                          Target: {exp.targetValue} {exp.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* Mobile Backdrop Overlay */}
          {mobileDrawer !== 'none' && (
            <div
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-30 transition-opacity"
              onClick={() => setMobileDrawer('none')}
            />
          )}

          {/* ── 3.D RIGHT: CONTEXTUAL PROPERTIES PANEL (280px) ── */}
          <aside
            className={`w-[280px] max-w-[85vw] border-l border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col shrink-0 overflow-y-auto no-scrollbar transition-all duration-200 select-none ${
              mobileDrawer === 'properties'
                ? 'fixed inset-y-0 right-0 z-40 shadow-2xl flex lg:static lg:shadow-none'
                : 'hidden lg:flex'
            }`}
          >
            <div className="p-3.5 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-secondary)] font-bold">
                Inspektor Properti
              </span>
              <div className="flex items-center gap-2">
                {selectedTarget && (
                  <button
                    type="button"
                    onClick={() => setSelectedTarget(null)}
                    className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] cursor-pointer"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileDrawer('none')}
                  className="lg:hidden p-1 rounded-sm hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] cursor-pointer"
                  title="Tutup Panel Properti"
                >
                  <IconClose size={16} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4 flex-1">
              {!selectedTarget ? (
                /* No Selection State */
                <div className="py-12 px-2 text-center space-y-3">
                  <div className="w-10 h-10 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] mx-auto">
                    <IconSliders size={18} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[var(--color-text)]">Belum ada elemen dipilih</h4>
                    <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                      Pilih salah satu elemen pada kanvas atau tambahkan elemen dari panel kiri untuk mengatur parameter dan relasinya.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInfoModal(true)}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--color-border)] text-xs text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] transition-colors cursor-pointer"
                  >
                    <IconSettings size={13} />
                    <span>Info Dasar Simulator</span>
                  </button>
                </div>
              ) : selectedTarget.category === 'visual' ? (
                /* Visual Element Properties */
                (() => {
                  const elem = spec.visual.elements.find((el) => el.id === selectedTarget.id);
                  if (!elem) return null;
                  return (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
                        <span className="font-mono font-bold uppercase text-[var(--color-primary-text)]">
                          {elem.type}
                        </span>
                        <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">{elem.id}</span>
                      </div>

                      {/* Label */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Label Tampilan</label>
                        <input
                          type="text"
                          value={elem.label || ''}
                          onChange={(e) =>
                            setSpec((prev) => ({
                              ...prev,
                              visual: {
                                ...prev.visual,
                                elements: prev.visual.elements.map((el) =>
                                  el.id === elem.id ? { ...el, label: e.target.value } : el
                                ),
                              },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                        />
                      </div>

                      {/* Coordinates (X, Y) */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Posisi X (px)</label>
                          <input
                            type="number"
                            value={typeof elem.x === 'number' ? elem.x : 0}
                            onChange={(e) =>
                              setSpec((prev) => ({
                                ...prev,
                                visual: {
                                  ...prev.visual,
                                  elements: prev.visual.elements.map((el) =>
                                    el.id === elem.id ? { ...el, x: Number(e.target.value) } : el
                                  ),
                                },
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Posisi Y (px)</label>
                          <input
                            type="number"
                            value={typeof elem.y === 'number' ? elem.y : 0}
                            onChange={(e) =>
                              setSpec((prev) => ({
                                ...prev,
                                visual: {
                                  ...prev.visual,
                                  elements: prev.visual.elements.map((el) =>
                                    el.id === elem.id ? { ...el, y: Number(e.target.value) } : el
                                  ),
                                },
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>
                      </div>

                      {/* Text Specific Properties: Font Size & Weight */}
                      {elem.type === 'text' && (
                        <div className="space-y-3 pt-1 border-t border-[var(--color-border-subtle)]">
                          {/* Font Size */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Ukuran Teks (Font Size)</label>
                              <span className="font-mono text-[11px] font-bold text-[var(--color-primary-text)]">
                                {elem.fontSize || 14}px
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={10}
                                max={48}
                                value={elem.fontSize || 14}
                                onChange={(e) => {
                                  const newSize = Number(e.target.value);
                                  setSpec((prev) => ({
                                    ...prev,
                                    visual: {
                                      ...prev.visual,
                                      elements: prev.visual.elements.map((el) =>
                                        el.id === elem.id
                                          ? { ...el, fontSize: newSize, height: Math.round(newSize * 1.3) }
                                          : el
                                      ),
                                    },
                                  }));
                                }}
                                className="flex-1 cursor-pointer"
                              />
                              <input
                                type="number"
                                min={10}
                                max={72}
                                value={elem.fontSize || 14}
                                onChange={(e) => {
                                  const newSize = Number(e.target.value);
                                  setSpec((prev) => ({
                                    ...prev,
                                    visual: {
                                      ...prev.visual,
                                      elements: prev.visual.elements.map((el) =>
                                        el.id === elem.id
                                          ? { ...el, fontSize: newSize, height: Math.round(newSize * 1.3) }
                                          : el
                                      ),
                                    },
                                  }));
                                }}
                                className="w-14 px-2 py-1 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-center font-mono text-[var(--color-text)] outline-none"
                              />
                            </div>

                            {/* Preset Buttons */}
                            <div className="flex items-center gap-1 pt-0.5">
                              {[
                                { label: 'Kecil', size: 12 },
                                { label: 'Sedang', size: 16 },
                                { label: 'Besar', size: 22 },
                                { label: 'Judul', size: 28 },
                              ].map((p) => (
                                <button
                                  key={p.size}
                                  type="button"
                                  onClick={() => {
                                    setSpec((prev) => ({
                                      ...prev,
                                      visual: {
                                        ...prev.visual,
                                        elements: prev.visual.elements.map((el) =>
                                          el.id === elem.id
                                            ? { ...el, fontSize: p.size, height: Math.round(p.size * 1.3) }
                                            : el
                                        ),
                                      },
                                    }));
                                  }}
                                  className={`flex-1 py-1 rounded-sm border text-[10px] font-medium transition-colors cursor-pointer ${
                                    (elem.fontSize || 14) === p.size
                                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-bold'
                                      : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                                  }`}
                                >
                                  {p.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Font Weight */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Ketebalan Font</label>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setSpec((prev) => ({
                                    ...prev,
                                    visual: {
                                      ...prev.visual,
                                      elements: prev.visual.elements.map((el) =>
                                        el.id === elem.id ? { ...el, fontWeight: 'normal' } : el
                                      ),
                                    },
                                  }))
                                }
                                className={`py-1.5 px-2 rounded-md border text-xs font-normal transition-colors cursor-pointer ${
                                  elem.fontWeight === 'normal'
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-semibold'
                                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
                                }`}
                              >
                                Normal (400)
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setSpec((prev) => ({
                                    ...prev,
                                    visual: {
                                      ...prev.visual,
                                      elements: prev.visual.elements.map((el) =>
                                        el.id === elem.id ? { ...el, fontWeight: 'bold' } : el
                                      ),
                                    },
                                  }))
                                }
                                className={`py-1.5 px-2 rounded-md border text-xs font-bold transition-colors cursor-pointer ${
                                  elem.fontWeight !== 'normal'
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-text)]'
                                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
                                }`}
                              >
                                Tebal (700)
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Element Dimensions (Lebar & Tinggi) for shape, image, chart, and text */}
                      {elem.type !== 'arrow' && elem.type !== 'line' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Lebar (px)</label>
                            <input
                              type="number"
                              value={
                                typeof elem.width === 'number'
                                  ? elem.width
                                  : elem.type === 'text'
                                  ? Math.max(50, Math.round((elem.label || 'Teks Visual').length * (elem.fontSize || 14) * 0.62))
                                  : elem.radius
                                  ? elem.radius * 2
                                  : 90
                              }
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setSpec((prev) => ({
                                  ...prev,
                                  visual: {
                                    ...prev.visual,
                                    elements: prev.visual.elements.map((el) =>
                                      el.id === elem.id
                                        ? el.radius
                                          ? { ...el, width: val, radius: Math.round(val / 2) }
                                          : { ...el, width: val }
                                        : el
                                    ),
                                  },
                                }));
                              }}
                              className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Tinggi (px)</label>
                            <input
                              type="number"
                              value={
                                typeof elem.height === 'number'
                                  ? elem.height
                                  : elem.type === 'text'
                                  ? Math.round((elem.fontSize || 14) * 1.3)
                                  : elem.radius
                                  ? elem.radius * 2
                                  : 60
                              }
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setSpec((prev) => ({
                                  ...prev,
                                  visual: {
                                    ...prev.visual,
                                    elements: prev.visual.elements.map((el) =>
                                      el.id === elem.id
                                        ? el.type === 'text'
                                          ? {
                                              ...el,
                                              height: val,
                                              fontSize: Math.max(10, Math.round(val / 1.3)),
                                            }
                                          : el.radius
                                          ? { ...el, height: val, radius: Math.round(val / 2) }
                                          : { ...el, height: val }
                                        : el
                                    ),
                                  },
                                }));
                              }}
                              className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                            />
                          </div>
                        </div>
                      )}

                      {/* Shape Specific: Rect vs Circle Toggle & Stroke Width */}
                      {elem.type === 'shape' && (
                        <div className="space-y-2 pt-1 border-t border-[var(--color-border-subtle)]">
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Bentuk Geometri</label>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setSpec((prev) => ({
                                    ...prev,
                                    visual: {
                                      ...prev.visual,
                                      elements: prev.visual.elements.map((el) =>
                                        el.id === elem.id ? { ...el, radius: undefined } : el
                                      ),
                                    },
                                  }))
                                }
                                className={`py-1.5 px-2 rounded-md border text-xs transition-colors cursor-pointer ${
                                  !elem.radius
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-semibold'
                                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
                                }`}
                              >
                                Persegi / Kotak
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setSpec((prev) => ({
                                    ...prev,
                                    visual: {
                                      ...prev.visual,
                                      elements: prev.visual.elements.map((el) =>
                                        el.id === elem.id
                                          ? {
                                              ...el,
                                              radius: Math.round(Math.min(typeof el.width === 'number' ? el.width : 90, typeof el.height === 'number' ? el.height : 60) / 2),
                                            }
                                          : el
                                      ),
                                    },
                                  }))
                                }
                                className={`py-1.5 px-2 rounded-md border text-xs transition-colors cursor-pointer ${
                                  !!elem.radius
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-semibold'
                                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
                                }`}
                              >
                                Lingkaran / Bulat
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Tebal Garis Batas</label>
                            <div className="flex items-center gap-1.5">
                              {[1, 2, 3, 5].map((sw) => (
                                <button
                                  key={sw}
                                  type="button"
                                  onClick={() =>
                                    setSpec((prev) => ({
                                      ...prev,
                                      visual: {
                                        ...prev.visual,
                                        elements: prev.visual.elements.map((el) =>
                                          el.id === elem.id ? { ...el, strokeWidth: sw } : el
                                        ),
                                      },
                                    }))
                                  }
                                  className={`flex-1 py-1 rounded-sm border text-xs font-mono transition-colors cursor-pointer ${
                                    (elem.strokeWidth || 2) === sw
                                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-bold'
                                      : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
                                  }`}
                                >
                                  {sw}px
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Arrow / Line Specific: Endpoints X2, Y2 */}
                      {(elem.type === 'arrow' || elem.type === 'line') && (
                        <div className="space-y-2 pt-1 border-t border-[var(--color-border-subtle)]">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Ujung X2 (px)</label>
                              <input
                                type="number"
                                value={typeof elem.x2 === 'number' ? elem.x2 : (typeof elem.x === 'number' ? elem.x + 100 : 200)}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setSpec((prev) => ({
                                    ...prev,
                                    visual: {
                                      ...prev.visual,
                                      elements: prev.visual.elements.map((el) =>
                                        el.id === elem.id ? { ...el, x2: val } : el
                                      ),
                                    },
                                  }));
                                }}
                                className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Ujung Y2 (px)</label>
                              <input
                                type="number"
                                value={typeof elem.y2 === 'number' ? elem.y2 : (typeof elem.y === 'number' ? elem.y : 100)}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setSpec((prev) => ({
                                    ...prev,
                                    visual: {
                                      ...prev.visual,
                                      elements: prev.visual.elements.map((el) =>
                                        el.id === elem.id ? { ...el, y2: val } : el
                                      ),
                                    },
                                  }));
                                }}
                                className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Tebal Vektor</label>
                            <div className="flex items-center gap-1.5">
                              {[1.5, 2.5, 4, 6].map((sw) => (
                                <button
                                  key={sw}
                                  type="button"
                                  onClick={() =>
                                    setSpec((prev) => ({
                                      ...prev,
                                      visual: {
                                        ...prev.visual,
                                        elements: prev.visual.elements.map((el) =>
                                          el.id === elem.id ? { ...el, strokeWidth: sw } : el
                                        ),
                                      },
                                    }))
                                  }
                                  className={`flex-1 py-1 rounded-sm border text-xs font-mono transition-colors cursor-pointer ${
                                    (elem.strokeWidth || 2.5) === sw
                                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-bold'
                                      : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
                                  }`}
                                >
                                  {sw}px
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Image Specific: URL */}
                      {elem.type === 'image' && (
                        <div className="space-y-1 pt-1 border-t border-[var(--color-border-subtle)]">
                          <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">URL Gambar / Sumber</label>
                          <input
                            type="text"
                            value={elem.url || ''}
                            placeholder="https://... atau /assets/..."
                            onChange={(e) =>
                              setSpec((prev) => ({
                                ...prev,
                                visual: {
                                  ...prev.visual,
                                  elements: prev.visual.elements.map((el) =>
                                    el.id === elem.id ? { ...el, url: e.target.value } : el
                                  ),
                                },
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>
                      )}

                      {/* Color Fill / Text Color */}
                      <div className="space-y-1.5 pt-1 border-t border-[var(--color-border-subtle)]">
                        <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">
                          {elem.type === 'text' ? 'Warna Teks' : elem.type === 'arrow' || elem.type === 'line' ? 'Warna Vektor' : 'Warna Objek'}
                        </label>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {['#2E6B55', '#438987', '#C38B3C', '#243029', '#E6ECE8', '#E15554', '#3B82F6', '#8B5CF6'].map((col) => (
                            <button
                              key={col}
                              type="button"
                              onClick={() =>
                                setSpec((prev) => ({
                                  ...prev,
                                  visual: {
                                    ...prev.visual,
                                    elements: prev.visual.elements.map((el) =>
                                      el.id === elem.id ? { ...el, fill: col, color: col, stroke: col } : el
                                    ),
                                  },
                                }))
                              }
                              style={{ backgroundColor: col }}
                              className="w-6 h-6 rounded-sm border border-[var(--color-border)] cursor-pointer hover:scale-110 transition-transform shadow-2xs"
                            />
                          ))}
                          <label
                            className="relative inline-flex items-center justify-center w-6 h-6 rounded-sm border border-[var(--color-border)] bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface)] cursor-pointer text-[10px] font-mono text-[var(--color-text-secondary)]"
                            title="Pilih Warna Kustom"
                          >
                            <input
                              type="color"
                              value={elem.color || elem.fill || '#2E6B55'}
                              onChange={(e) => {
                                const col = e.target.value;
                                setSpec((prev) => ({
                                  ...prev,
                                  visual: {
                                    ...prev.visual,
                                    elements: prev.visual.elements.map((el) =>
                                      el.id === elem.id ? { ...el, fill: col, color: col, stroke: col } : el
                                    ),
                                  },
                                }));
                              }}
                              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                            />
                            +
                          </label>
                        </div>
                      </div>

                      {/* Actions: Duplicate & Delete */}
                      <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                        <button
                          type="button"
                          onClick={duplicateSelectedElement}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] text-[11px] font-medium text-[var(--color-text)] transition-colors cursor-pointer"
                        >
                          <IconCopy size={12} />
                          <span>Duplikasi</span>
                        </button>
                        <button
                          type="button"
                          onClick={deleteSelectedElement}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-rose-500 hover:bg-rose-500/10 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          <IconTrash size={12} />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : selectedTarget.category === 'interaction' ? (
                /* Interaction / Parameter Properties */
                (() => {
                  const param = spec.parameters[selectedTarget.id];
                  if (!param) return null;
                  return (
                    <div className="space-y-3.5 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
                        <span className="font-mono font-bold uppercase text-[var(--color-primary-text)]">
                          Parameter Kontrol
                        </span>
                        <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">{param.key}</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Nama Label</label>
                        <input
                          type="text"
                          value={param.label}
                          onChange={(e) =>
                            setSpec((prev) => ({
                              ...prev,
                              parameters: {
                                ...prev.parameters,
                                [param.key]: { ...param, label: e.target.value },
                              },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Satuan (Unit)</label>
                        <input
                          type="text"
                          value={param.unit || ''}
                          onChange={(e) =>
                            setSpec((prev) => ({
                              ...prev,
                              parameters: {
                                ...prev.parameters,
                                [param.key]: { ...param, unit: e.target.value },
                              },
                            }))
                          }
                          placeholder="kg, N, m/s², %, Rp"
                          className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Nilai Minimum</label>
                          <input
                            type="number"
                            value={param.min}
                            onChange={(e) =>
                              setSpec((prev) => ({
                                ...prev,
                                parameters: {
                                  ...prev.parameters,
                                  [param.key]: { ...param, min: Number(e.target.value) },
                                },
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Nilai Maksimum</label>
                          <input
                            type="number"
                            value={param.max}
                            onChange={(e) =>
                              setSpec((prev) => ({
                                ...prev,
                                parameters: {
                                  ...prev.parameters,
                                  [param.key]: { ...param, max: Number(e.target.value) },
                                },
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Nilai Awal</label>
                          <input
                            type="number"
                            value={param.defaultVal}
                            onChange={(e) =>
                              setSpec((prev) => ({
                                ...prev,
                                parameters: {
                                  ...prev.parameters,
                                  [param.key]: { ...param, defaultVal: Number(e.target.value) },
                                },
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Kelipatan (Step)</label>
                          <input
                            type="number"
                            value={param.step || 1}
                            onChange={(e) =>
                              setSpec((prev) => ({
                                ...prev,
                                parameters: {
                                  ...prev.parameters,
                                  [param.key]: { ...param, step: Number(e.target.value) },
                                },
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-end">
                        <button
                          type="button"
                          onClick={deleteSelectedElement}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-rose-500 hover:bg-rose-500/10 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          <IconTrash size={12} />
                          <span>Hapus Parameter</span>
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* Learning Properties (Formula / Result / Experiment / Insight) */
                (() => {
                  if (selectedTarget.type === 'formula') {
                    const calc = spec.calculations[selectedTarget.id];
                    if (!calc) return null;
                    return (
                      <div className="space-y-3.5 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
                          <span className="font-mono font-bold uppercase text-[var(--color-accent)]">Rumus &amp; Relasi</span>
                          <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">{calc.key}</span>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Label Relasi</label>
                          <input
                            type="text"
                            value={calc.label}
                            onChange={(e) =>
                              setSpec((prev) => ({
                                ...prev,
                                calculations: {
                                  ...prev.calculations,
                                  [calc.key]: { ...calc, label: e.target.value },
                                },
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Formula Matematika</label>
                          <input
                            type="text"
                            value={calc.formula}
                            onChange={(e) =>
                              setSpec((prev) => ({
                                ...prev,
                                calculations: {
                                  ...prev.calculations,
                                  [calc.key]: { ...calc, formula: e.target.value },
                                },
                              }))
                            }
                            placeholder="contoh: var_1 / var_2"
                            className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-mono text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                          />
                          <p className="text-[10px] text-[var(--color-text-secondary)]">Gunakan nama variabel kontrol sebagai operand.</p>
                        </div>
                        <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-end">
                          <button
                            type="button"
                            onClick={deleteSelectedElement}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-rose-500 hover:bg-rose-500/10 text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            <IconTrash size={12} />
                            <span>Hapus Rumus</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (selectedTarget.type === 'result') {
                    const res = spec.results.find((r) => r.key === selectedTarget.id);
                    if (!res) return null;
                    return (
                      <div className="space-y-3.5 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
                          <span className="font-mono font-bold uppercase text-[var(--color-primary-text)]">Hasil Simulasi</span>
                          <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">{res.key}</span>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Label Tampilan</label>
                          <input
                            type="text"
                            value={res.label}
                            onChange={(e) =>
                              setSpec((prev) => ({
                                ...prev,
                                results: prev.results.map((r) => (r.key === res.key ? { ...r, label: e.target.value } : r)),
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Simbol Singkat</label>
                          <input
                            type="text"
                            value={res.symbol || ''}
                            onChange={(e) =>
                              setSpec((prev) => ({
                                ...prev,
                                results: prev.results.map((r) => (r.key === res.key ? { ...r, symbol: e.target.value } : r)),
                              }))
                            }
                            placeholder="a, F_net, v, T"
                            className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-mono text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Kunci Kalkulasi Terkait</label>
                          <input
                            type="text"
                            value={res.calculationKey}
                            onChange={(e) =>
                              setSpec((prev) => ({
                                ...prev,
                                results: prev.results.map((r) => (r.key === res.key ? { ...r, calculationKey: e.target.value } : r)),
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-mono text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>
                        <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-end">
                          <button
                            type="button"
                            onClick={deleteSelectedElement}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-rose-500 hover:bg-rose-500/10 text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            <IconTrash size={12} />
                            <span>Hapus Hasil</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (selectedTarget.type === 'experiment') {
                    const exp = spec.experiments.find((e) => e.id === selectedTarget.id);
                    if (!exp) return null;
                    return (
                      <div className="space-y-3.5 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
                          <span className="font-mono font-bold uppercase text-[var(--color-secondary)]">Tantangan Eksperimen</span>
                          <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">{exp.id}</span>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Judul Tantangan</label>
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) =>
                              setSpec((prev) => ({
                                ...prev,
                                experiments: prev.experiments.map((item) =>
                                  item.id === exp.id ? { ...item, title: e.target.value } : item
                                ),
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Instruksi Sasaran</label>
                          <textarea
                            rows={2}
                            value={exp.objective}
                            onChange={(e) =>
                              setSpec((prev) => ({
                                ...prev,
                                experiments: prev.experiments.map((item) =>
                                  item.id === exp.id ? { ...item, objective: e.target.value } : item
                                ),
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Nilai Target</label>
                            <input
                              type="number"
                              value={exp.targetValue}
                              onChange={(e) =>
                                setSpec((prev) => ({
                                  ...prev,
                                  experiments: prev.experiments.map((item) =>
                                    item.id === exp.id ? { ...item, targetValue: Number(e.target.value) } : item
                                  ),
                                }))
                              }
                              className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Toleransi (±)</label>
                            <input
                              type="number"
                              value={exp.tolerance ?? 1}
                              onChange={(e) =>
                                setSpec((prev) => ({
                                  ...prev,
                                  experiments: prev.experiments.map((item) =>
                                    item.id === exp.id ? { ...item, tolerance: Number(e.target.value) } : item
                                  ),
                                }))
                              }
                              className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                            />
                          </div>
                        </div>
                        <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-end">
                          <button
                            type="button"
                            onClick={deleteSelectedElement}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-rose-500 hover:bg-rose-500/10 text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            <IconTrash size={12} />
                            <span>Hapus Tantangan</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (selectedTarget.type === 'insight') {
                    return (
                      <div className="space-y-3 text-xs">
                        <div className="pb-2 border-b border-[var(--color-border-subtle)] font-mono font-bold uppercase text-amber-500">
                          Wawasan Sebab-Akibat
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Ringkasan Konseptual</label>
                          <textarea
                            rows={3}
                            value={spec.insight.summary}
                            onChange={(e) =>
                              setSpec((prev) => ({
                                ...prev,
                                insight: { ...prev.insight, summary: e.target.value },
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Analisis Sebab-Akibat</label>
                          <textarea
                            rows={3}
                            value={spec.insight.causeAndEffect}
                            onChange={(e) =>
                              setSpec((prev) => ({
                                ...prev,
                                insight: { ...prev.insight, causeAndEffect: e.target.value },
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>
                      </div>
                    );
                  }

                  return null;
                })()
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ── 4. HONEST AI DIALOG (NO FAKE LOADING, NO TIMEOUTS) ── */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="max-w-md w-full p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] flex items-center justify-center">
                  <IconSparkles size={16} />
                </div>
                <h3 className="font-heading text-base font-bold text-[var(--color-text)]">
                  Asisten Simulator AI
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="p-1 rounded-sm hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]"
              >
                <IconClose size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs text-[var(--color-text-secondary)] leading-relaxed">
              <p>
                Fitur perancangan otomatis berbasis AI sedang disiapkan untuk fase rilis berikutnya.
              </p>
              <p>
                Pada versi saat ini, Anda dapat merancang simulasi laboratorium secara mandiri menggunakan kanvas visual, menambahkan variabel kontrol, rumus kausal, dan tantangan eksperimen melalui panel instrumen.
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--color-border-subtle)] flex justify-end">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Mengerti &amp; Lanjutkan Merancang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. SIMULATOR METADATA MODAL ── */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="max-w-lg w-full p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <h3 className="font-heading text-base font-bold text-[var(--color-text)]">
                Pengaturan Informasi Simulator
              </h3>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="p-1 rounded-sm hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]"
              >
                <IconClose size={16} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--color-text)]">Judul Simulasi</label>
                <input
                  type="text"
                  value={spec.info.title}
                  onChange={(e) =>
                    setSpec((prev) => ({
                      ...prev,
                      info: { ...prev.info, title: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--color-text)]">Deskripsi Simulasi</label>
                <textarea
                  rows={3}
                  value={spec.info.description}
                  onChange={(e) =>
                    setSpec((prev) => ({
                      ...prev,
                      info: { ...prev.info, description: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--color-text)]">Bidang</label>
                  <select
                    value={spec.info.discipline}
                    onChange={(e) =>
                      setSpec((prev) => ({
                        ...prev,
                        info: { ...prev.info, discipline: e.target.value },
                      }))
                    }
                    className="w-full px-2.5 py-2 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] cursor-pointer"
                  >
                    {GEN_LABS_DISCIPLINES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--color-text)]">Topik</label>
                  <input
                    type="text"
                    value={spec.info.topic}
                    onChange={(e) =>
                      setSpec((prev) => ({
                        ...prev,
                        info: { ...prev.info, topic: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--color-text)]">Tingkat</label>
                  <select
                    value={spec.info.difficulty}
                    onChange={(e) =>
                      setSpec((prev) => ({
                        ...prev,
                        info: { ...prev.info, difficulty: e.target.value as any },
                      }))
                    }
                    className="w-full px-2.5 py-2 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] cursor-pointer"
                  >
                    <option value="basic">Dasar (Basic)</option>
                    <option value="intermediate">Menengah (Intermediate)</option>
                    <option value="advanced">Lanjutan (Advanced)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--color-text)]">Estimasi Waktu</label>
                  <input
                    type="text"
                    value={spec.info.estimatedTime || '10–15 menit'}
                    onChange={(e) =>
                      setSpec((prev) => ({
                        ...prev,
                        info: { ...prev.info, estimatedTime: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--color-border-subtle)] flex justify-end">
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Simpan &amp; Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5.B REAL GEMINI AI AUTHORING & REVISION MODAL ── */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl w-full ${pendingPatchResult ? 'max-w-4xl max-h-[92vh]' : 'max-w-lg max-h-[90vh]'} overflow-hidden flex flex-col transition-all duration-200`}>
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconSparkles size={16} className="text-[var(--color-primary-text)]" />
                <h3 className="font-heading font-bold text-sm text-[var(--color-text)]">
                  {pendingPatchResult ? 'Tinjau Hasil Revisi Simulator' : aiMode === 'create' ? 'Buat Simulator dengan AI' : 'Edit Simulator dengan AI'}
                </h3>
                {pendingPatchResult && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Revisi Siap Diuji
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!aiIsLoading) {
                    setShowAiModal(false);
                    setPendingPatchResult(null);
                  }
                }}
                disabled={aiIsLoading}
                className="p-1.5 rounded-sm hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer disabled:opacity-50"
              >
                <IconClose size={16} />
              </button>
            </div>

            {/* Mode Switcher if simulator has content */}
            {Object.keys(spec.parameters).length > 0 && !pendingPatchResult && (
              <div className="flex border-b border-[var(--color-border-subtle)] px-5 pt-2 gap-4 bg-[var(--color-surface-subtle)]/40">
                <button
                  type="button"
                  onClick={() => {
                    setAiMode('patch');
                    setAiError(null);
                  }}
                  className={`pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                    aiMode === 'patch'
                      ? 'border-[var(--color-primary)] text-[var(--color-primary-text)]'
                      : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                  }`}
                >
                  Revisi / Edit (Patch)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAiMode('create');
                    setAiError(null);
                  }}
                  className={`pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                    aiMode === 'create'
                      ? 'border-[var(--color-primary)] text-[var(--color-primary-text)]'
                      : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                  }`}
                >
                  Buat Ulang dari Awal
                </button>
              </div>
            )}

            {/* Error notification */}
            {aiError && (
              <div className="mx-5 mt-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                <IconAlertCircle size={15} className="shrink-0 mt-0.5" />
                <div className="flex-1">{aiError}</div>
              </div>
            )}

            {/* Content Body */}
            <div className={`p-5 overflow-y-auto space-y-4 ${pendingPatchResult ? 'flex-1 flex flex-col min-h-0' : ''}`}>
              {aiIsLoading ? (
                /* ── GEN LABS AI PROFESSIONAL SYNTHESIS PROGRESS ── */
                <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-5 select-none">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] flex items-center justify-center relative border border-[var(--color-primary)]/20">
                        <IconSparkles size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-[var(--color-text)] font-heading">
                          GEN LABS AI Assistant
                        </h3>
                        <p className="text-[11px] text-[var(--color-text-secondary)]">
                          Merancang simulator edukasi secara otomatis
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="px-2 py-0.5 rounded-sm bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]">
                        Gemini AI
                      </span>
                      <span className="tabular-nums font-semibold text-[var(--color-primary-text)] bg-[var(--color-primary-soft)] px-2 py-0.5 rounded-sm border border-[var(--color-primary)]/20">
                        {aiElapsedSeconds.toFixed(1)}s
                      </span>
                    </div>
                  </div>

                  {/* Active Concept Card */}
                  <div className="p-3 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] text-xs space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-tertiary)] font-semibold">
                      Konsep yang diminta:
                    </span>
                    <p className="font-medium text-[var(--color-text)] line-clamp-2 italic">
                      &ldquo;{aiMode === 'create' ? aiPrompt : aiPatchInstruction}&rdquo;
                    </p>
                  </div>

                  {/* Active Stage Indicator with sleek spinner & progress */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-[var(--color-text)] truncate">
                          {GEN_LABS_AI_PHASES[aiStep]?.label}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-secondary)] truncate">
                          {GEN_LABS_AI_PHASES[aiStep]?.detail}
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[var(--color-primary-text)] shrink-0 tabular-nums">
                        {Math.min(95, Math.round((aiStep + 1) * 20))}%
                      </span>
                    </div>

                    {/* Sleek Progress Bar */}
                    <div className="w-full h-1.5 bg-[var(--color-surface-subtle)] rounded-sm overflow-hidden border border-[var(--color-border-subtle)]">
                      <div
                        className="h-full bg-[var(--color-primary)] transition-all duration-300 ease-out rounded-sm"
                        style={{ width: `${Math.min(95, (aiStep + 1) * 20)}%` }}
                      />
                    </div>
                  </div>

                  {/* Clean Phase Checklist */}
                  <div className="space-y-1.5 pt-1 text-[11px]">
                    {GEN_LABS_AI_PHASES.map((phase, idx) => {
                      const isDone = aiStep > idx;
                      const isCurrent = aiStep === idx;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 px-2.5 py-1 rounded-sm transition-colors ${
                            isCurrent
                              ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-medium'
                              : isDone
                              ? 'text-[var(--color-text-secondary)]'
                              : 'text-[var(--color-text-tertiary)] opacity-60'
                          }`}
                        >
                          <span className="w-4 text-center font-bold">
                            {isDone ? '✓' : isCurrent ? '•' : '○'}
                          </span>
                          <span className="truncate">{phase.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : pendingPatchResult ? (
                /* ── INTERACTIVE VISUAL REVIEW & HUMAN-READABLE CHANGES (NO RAW JSON) ── */
                <div className="space-y-4 flex-1 flex flex-col min-h-0">
                  {/* Tab Navigation: Pratinjau Simulator vs Rincian Perubahan */}
                  <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2.5 shrink-0">
                    <div className="flex items-center gap-1.5 p-1 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)]">
                      <button
                        type="button"
                        onClick={() => setPatchReviewTab('visual')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
                          patchReviewTab === 'visual'
                            ? 'bg-[var(--color-surface)] text-[var(--color-primary-text)] shadow-xs font-bold'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        <IconEye size={13} />
                        <span>Pratinjau Simulator (Live View)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPatchReviewTab('summary')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
                          patchReviewTab === 'summary'
                            ? 'bg-[var(--color-surface)] text-[var(--color-primary-text)] shadow-xs font-bold'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        <IconLayers size={13} />
                        <span>Rincian Perubahan</span>
                        <span className="ml-0.5 px-1.5 py-0.2 rounded-sm text-[10px] bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-mono">
                          {pendingPatchResult.patches.length}
                        </span>
                      </button>
                    </div>

                    <div className="text-[11px] text-[var(--color-text-secondary)] hidden sm:flex items-center gap-1.5">
                      <IconCheckCircle size={13} className="text-emerald-500" />
                      <span>Revisi AI siap diterapkan</span>
                    </div>
                  </div>

                  {/* Tab 1: Interactive Live Simulator Preview (Default) */}
                  {patchReviewTab === 'visual' ? (
                    <div className="space-y-3 flex-1 flex flex-col min-h-0">
                      <div className="flex items-center justify-between px-3 py-2 rounded-md bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/20 text-xs text-[var(--color-primary-text)] shrink-0">
                        <div className="flex items-center gap-2">
                          <IconEye size={14} className="shrink-0" />
                          <span>
                            <strong>Pratinjau Interaktif:</strong> Uji slider kontrol dan amati visualisasi hasil revisi AI di bawah ini sebelum diterapkan ke editor.
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] p-3 sm:p-4 shadow-inner max-h-[58vh]">
                        <SuperCanvas spec={pendingPatchResult.patched} mode="student" />
                      </div>
                    </div>
                  ) : (
                    /* Tab 2: Human-Friendly Change Summary Cards (No Raw JSON) */
                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[56vh] pr-1">
                      <div className="p-2.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)]">
                        AI telah merevisi <strong>{pendingPatchResult.patches.length} bagian spesifikasi</strong> pada simulator ini:
                      </div>

                      <div className="space-y-2">
                        {pendingPatchResult.patches.map((p, idx) => {
                          const info = getFriendlyPatchDescription(p);
                          return (
                            <div
                              key={idx}
                              className="p-3 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors shadow-2xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-tertiary)] font-bold">
                                  {info.category}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border ${info.opColor}`}>
                                  {info.opLabel}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-[var(--color-text)]">
                                {info.title}
                              </h4>
                              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                                {info.detail}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Footer Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-subtle)] shrink-0">
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">
                      Perubahan belum disimpan permanen ke kanvas hingga Anda menekan tombol terapkan.
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPendingPatchResult(null)}
                        className="px-3.5 py-1.5 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] text-xs font-semibold text-[var(--color-text)] transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyPendingPatch}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <IconCheckCircle size={14} />
                        <span>Terapkan Perubahan</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : aiMode === 'create' ? (
                /* Create Simulator Form (Requirement #22) */
                <form onSubmit={handleAiGenerate} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--color-text)]">
                      Jelaskan simulator yang ingin dibuat <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Contoh: Buatlah simulator Hukum Archimedes tentang gaya apung benda dalam air dengan variabel massa jenis dan volume."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      disabled={aiIsLoading}
                      className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] resize-none disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Topik Disiplin</label>
                      <input
                        type="text"
                        placeholder="Contoh: Mekanika Fluida"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        disabled={aiIsLoading}
                        className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Tingkat Kesulitan</label>
                      <select
                        value={aiDifficulty}
                        onChange={(e) => setAiDifficulty(e.target.value as any)}
                        disabled={aiIsLoading}
                        className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] cursor-pointer disabled:opacity-50"
                      >
                        <option value="basic">Dasar (Basic)</option>
                        <option value="intermediate">Menengah (Intermediate)</option>
                        <option value="advanced">Lanjutan (Advanced)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Tujuan Pembelajaran</label>
                    <input
                      type="text"
                      placeholder="Contoh: Memahami syarat benda terapung, melayang, dan tenggelam"
                      value={aiLearningObjective}
                      onChange={(e) => setAiLearningObjective(e.target.value)}
                      disabled={aiIsLoading}
                      className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] disabled:opacity-50"
                    />
                  </div>

                  <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">
                      Mesin: Google Gemini AI (Anti-Slop Strict)
                    </span>
                    <button
                      type="submit"
                      disabled={aiIsLoading || !aiPrompt.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <IconSparkles size={14} />
                      <span>{aiIsLoading ? 'Generating simulator…' : 'Generate Simulator'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Patch Simulator Form (Requirement #23) */
                <form onSubmit={handleAiPatch} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--color-text)]">
                      Instruksi Perubahan Simulator
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Contoh: Ubah nilai maksimum massa beban menjadi 50 kg dan tambahkan tantangan eksperimen baru."
                      value={aiPatchInstruction}
                      onChange={(e) => setAiPatchInstruction(e.target.value)}
                      disabled={aiIsLoading}
                      className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] resize-none disabled:opacity-50"
                    />
                  </div>

                  <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">
                      Revisi parsial berbasis RFC 6902 JSON Patch
                    </span>
                    <button
                      type="submit"
                      disabled={aiIsLoading || !aiPatchInstruction.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <IconSparkles size={14} />
                      <span>{aiIsLoading ? 'Menganalisis perubahan…' : 'Tinjau Perubahan'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 6. RESPONSIVE MOBILE BAR (TABS TO OPEN DRAWERS) ── */}
      <div className="h-12 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex lg:hidden items-center justify-around px-2 shrink-0 z-30">
        <button
          type="button"
          onClick={() => {
            setMobileDrawer((prev) => (prev === 'elements' ? 'none' : 'elements'));
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            mobileDrawer === 'elements'
              ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)]'
              : 'text-[var(--color-text-secondary)]'
          }`}
        >
          <IconPlus size={14} />
          <span>Elemen</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode((prev) => (prev === 'editor' ? 'preview' : 'editor'))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-[var(--color-text)]"
        >
          <IconEye size={14} />
          <span>{viewMode === 'editor' ? 'Pratinjau' : 'Editor'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMobileDrawer((prev) => (prev === 'properties' ? 'none' : 'properties'));
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            mobileDrawer === 'properties'
              ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)]'
              : 'text-[var(--color-text-secondary)]'
          }`}
        >
          <IconSliders size={14} />
          <span>Properti</span>
        </button>
      </div>
    </div>
  );
}
