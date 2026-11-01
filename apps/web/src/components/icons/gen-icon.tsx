import React from 'react';
import { IconProps } from './icon-base';
import * as Icons from './icons';

export type GenIconName =
  // Core Navigation & Layout
  | 'home'
  | 'dashboard'
  | 'compass'
  | 'explore'
  | 'book-open'
  | 'library'
  | 'layers'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up'
  | 'arrow-down'
  | 'arrow-up-right'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'chevron-up'
  | 'menu'
  | 'close'
  | 'x'
  | 'check'
  | 'plus'
  | 'minus'
  | 'panel-left-close'
  | 'panel-left-open'
  | 'external-link'
  | 'grid'
  | 'list'
  | 'columns'
  | 'sidebar'
  // Simulation Controls & Metrology
  | 'play'
  | 'pause'
  | 'reset'
  | 'rotate-ccw'
  | 'step-forward'
  | 'step-backward'
  | 'speed'
  | 'sliders'
  | 'gauge'
  | 'activity'
  | 'line-chart'
  | 'bar-chart'
  | 'chart'
  | 'plus-circle'
  | 'crosshair'
  | 'ruler'
  | 'thermometer'
  | 'scale'
  | 'target'
  | 'maximize'
  | 'minimize'
  | 'zoom-in'
  | 'zoom-out'
  // Scientific Disciplines & Concepts
  | 'physics'
  | 'fisika'
  | 'vector'
  | 'pendulum'
  | 'magnet'
  | 'projectile'
  | 'math'
  | 'matematika'
  | 'function'
  | 'integral'
  | 'matrix'
  | 'informatics'
  | 'trpl'
  | 'code'
  | 'terminal'
  | 'git-branch'
  | 'cpu'
  | 'database'
  | 'chemistry'
  | 'kimia'
  | 'flask'
  | 'molecule'
  | 'test-tube'
  | 'atom'
  | 'agribusiness'
  | 'agribisnis'
  | 'dna'
  | 'cell'
  | 'economics'
  | 'ekonomi'
  | 'candlestick'
  | 'coins'
  | 'coin'
  | 'percent'
  | 'accounting'
  | 'akuntansi'
  | 'event'
  | 'mice'
  | 'statistics'
  | 'statistika'
  | 'scatter-plot'
  | 'dice'
  // GEN LABS AI Conversation
  | 'ai-tutor'
  | 'tutor'
  | 'sparkles'
  | 'brain'
  | 'hypothesis'
  | 'command'
  | 'message-square'
  | 'message'
  | 'send'
  | 'bot'
  | 'thinking'
  | 'loader'
  | 'mic'
  | 'mic-off'
  | 'refresh-cw'
  | 'regenerate'
  | 'copy'
  | 'trash'
  | 'edit'
  | 'search'
  | 'lightbulb'
  | 'help-circle'
  | 'help'
  // Documents & Curriculum
  | 'file-text'
  | 'folder'
  | 'folder-open'
  | 'bookmark'
  | 'award'
  | 'graduation-cap'
  | 'clipboard-check'
  | 'tag'
  // Account & Utilities
  | 'user'
  | 'users'
  | 'shield'
  | 'shield-check'
  | 'shield-alert'
  | 'lock'
  | 'unlock'
  | 'key'
  | 'settings'
  | 'bell'
  | 'sun'
  | 'moon'
  | 'logout'
  | 'log-out'
  | 'share'
  | 'download'
  | 'upload'
  | 'save'
  | 'filter'
  | 'calendar'
  | 'eye'
  | 'eye-off'
  // Telemetry, Signals & States
  | 'check-circle'
  | 'alert-circle'
  | 'alert-triangle'
  | 'info'
  | 'clock'
  | 'zap'
  | 'energy'
  | 'signal'
  | 'volume'
  | 'volume-x'
  | 'more-horizontal'
  | 'more-vertical'
  | 'calculator'
  | 'type'
  | 'square'
  | 'circle'
  | 'image'
  | 'hash'
  | 'toggle-left'
  | 'toggle-right'
  | 'gamepad'
  | 'trending-up'
  | 'pointer'
  | 'laptop'
  | 'x-circle';

const ICON_REGISTRY: Record<string, React.FC<IconProps>> = {
  // Navigation & Viewport
  home: Icons.IconHome,
  dashboard: Icons.IconDashboard,
  compass: Icons.IconCompass,
  explore: Icons.IconCompass,
  'book-open': Icons.IconBookOpen,
  library: Icons.IconBookOpen,
  layers: Icons.IconLayers,
  'arrow-right': Icons.IconArrowRight,
  'arrow-left': Icons.IconArrowLeft,
  'arrow-up': Icons.IconArrowUp,
  'arrow-down': Icons.IconArrowDown,
  'arrow-up-right': Icons.IconArrowUpRight,
  'chevron-right': Icons.IconChevronRight,
  'chevron-left': Icons.IconChevronLeft,
  'chevron-down': Icons.IconChevronDown,
  'chevron-up': Icons.IconChevronUp,
  menu: Icons.IconMenu,
  close: Icons.IconClose,
  x: Icons.IconClose,
  check: Icons.IconCheck,
  plus: Icons.IconPlus,
  minus: Icons.IconMinus,
  'panel-left-close': Icons.IconPanelLeftClose,
  'panel-left-open': Icons.IconPanelLeftOpen,
  'external-link': Icons.IconExternalLink,
  grid: Icons.IconGrid,
  list: Icons.IconList,
  columns: Icons.IconColumns,
  sidebar: Icons.IconSidebar,

  // Simulation Controls & Metrology
  play: Icons.IconPlay,
  pause: Icons.IconPause,
  reset: Icons.IconRotateCcw,
  'rotate-ccw': Icons.IconRotateCcw,
  'step-forward': Icons.IconStepForward,
  'step-backward': Icons.IconStepBackward,
  speed: Icons.IconSpeed,
  sliders: Icons.IconSliders,
  gauge: Icons.IconGauge,
  activity: Icons.IconActivity,
  'line-chart': Icons.IconLineChart,
  'bar-chart': Icons.IconBarChart,
  chart: Icons.IconLineChart,
  'plus-circle': Icons.IconPlusCircle,
  crosshair: Icons.IconCrosshair,
  ruler: Icons.IconRuler,
  thermometer: Icons.IconThermometer,
  scale: Icons.IconScale,
  target: Icons.IconTarget,
  maximize: Icons.IconMaximize,
  minimize: Icons.IconMinimize,
  'zoom-in': Icons.IconZoomIn,
  'zoom-out': Icons.IconZoomOut,

  // Scientific Disciplines & Concepts
  physics: Icons.IconDisciplinePhysics,
  fisika: Icons.IconDisciplinePhysics,
  vector: Icons.IconVector,
  pendulum: Icons.IconPendulum,
  magnet: Icons.IconMagnet,
  projectile: Icons.IconProjectile,
  math: Icons.IconDisciplineMath,
  matematika: Icons.IconDisciplineMath,
  function: Icons.IconFunction,
  integral: Icons.IconIntegral,
  matrix: Icons.IconMatrix,
  informatics: Icons.IconDisciplineInformatics,
  trpl: Icons.IconDisciplineInformatics,
  code: Icons.IconCode,
  terminal: Icons.IconTerminal,
  'git-branch': Icons.IconGitBranch,
  cpu: Icons.IconCpu,
  database: Icons.IconDatabase,
  chemistry: Icons.IconDisciplineChemistry,
  kimia: Icons.IconDisciplineChemistry,
  flask: Icons.IconFlask,
  molecule: Icons.IconMolecule,
  'test-tube': Icons.IconTestTube,
  atom: Icons.IconAtom,
  agribusiness: Icons.IconDisciplineAgribusiness,
  agribisnis: Icons.IconDisciplineAgribusiness,
  dna: Icons.IconDna,
  cell: Icons.IconCell,
  economics: Icons.IconDisciplineEconomics,
  ekonomi: Icons.IconDisciplineEconomics,
  candlestick: Icons.IconCandlestick,
  coins: Icons.IconCoins,
  coin: Icons.IconCoins,
  percent: Icons.IconPercent,
  accounting: Icons.IconDisciplineAccounting,
  akuntansi: Icons.IconDisciplineAccounting,
  event: Icons.IconDisciplineEvent,
  mice: Icons.IconDisciplineEvent,
  statistics: Icons.IconDisciplineStatistics,
  statistika: Icons.IconDisciplineStatistics,
  'scatter-plot': Icons.IconScatterPlot,
  dice: Icons.IconDice,

  // GEN LABS AI Conversation
  'ai-tutor': Icons.IconAiTutor,
  tutor: Icons.IconAiTutor,
  sparkles: Icons.IconSparkles,
  brain: Icons.IconBrain,
  hypothesis: Icons.IconBrain,
  command: Icons.IconCommand,
  'message-square': Icons.IconMessageSquare,
  message: Icons.IconMessageSquare,
  send: Icons.IconSend,
  bot: Icons.IconBot,
  thinking: Icons.IconLoader,
  loader: Icons.IconLoader,
  mic: Icons.IconMic,
  'mic-off': Icons.IconMicOff,
  'refresh-cw': Icons.IconRefreshCw,
  regenerate: Icons.IconRefreshCw,
  copy: Icons.IconCopy,
  trash: Icons.IconTrash,
  edit: Icons.IconEdit,
  search: Icons.IconSearch,
  lightbulb: Icons.IconLightbulb,
  'help-circle': Icons.IconHelpCircle,
  help: Icons.IconHelpCircle,

  // Documents & Curriculum
  'file-text': Icons.IconFileText,
  folder: Icons.IconFolder,
  'folder-open': Icons.IconFolderOpen,
  bookmark: Icons.IconBookmark,
  award: Icons.IconAward,
  'graduation-cap': Icons.IconGraduationCap,
  'clipboard-check': Icons.IconClipboardCheck,
  tag: Icons.IconTag,

  // Account & Utilities
  user: Icons.IconUser,
  users: Icons.IconUsers,
  shield: Icons.IconShield,
  'shield-check': Icons.IconShieldCheck,
  'shield-alert': Icons.IconShieldAlert,
  lock: Icons.IconLock,
  unlock: Icons.IconUnlock,
  key: Icons.IconKey,
  settings: Icons.IconSettings,
  bell: Icons.IconBell,
  sun: Icons.IconSun,
  moon: Icons.IconMoon,
  logout: Icons.IconLogOut,
  'log-out': Icons.IconLogOut,
  share: Icons.IconShare,
  download: Icons.IconDownload,
  upload: Icons.IconUpload,
  save: Icons.IconSave,
  filter: Icons.IconFilter,
  calendar: Icons.IconCalendar,
  eye: Icons.IconEye,
  'eye-off': Icons.IconEyeOff,

  // Telemetry, Signals & States
  'check-circle': Icons.IconCheckCircle,
  'alert-circle': Icons.IconAlertCircle,
  'alert-triangle': Icons.IconAlertTriangle,
  info: Icons.IconInfo,
  clock: Icons.IconClock,
  zap: Icons.IconZap,
  energy: Icons.IconZap,
  signal: Icons.IconSignal,
  volume: Icons.IconVolume,
  'volume-x': Icons.IconVolumeX,
  'more-horizontal': Icons.IconMoreHorizontal,
  'more-vertical': Icons.IconMoreVertical,
  calculator: Icons.IconCalculator,
  type: Icons.IconType,
  square: Icons.IconSquare,
  circle: Icons.IconCircle,
  image: Icons.IconImage,
  hash: Icons.IconHash,
  'toggle-left': Icons.IconToggleLeft,
  'toggle-right': Icons.IconToggleRight,
  gamepad: Icons.IconGamepad,
  'trending-up': Icons.IconTrendingUp,
  pointer: Icons.IconPointer,
  laptop: Icons.IconLaptop,
  'x-circle': Icons.IconXCircle,
};

export interface GenIconProps extends IconProps {
  name: GenIconName | string;
}

/**
 * Universal dynamic icon component for GEN LABS
 * Usage:
 *   <GenIcon name="physics" size={24} className="text-[#4B8F8C]" />
 *   <GenIcon name="play" size={16} />
 */
export function GenIcon({ name, ...props }: GenIconProps) {
  const normalizedKey = name.toLowerCase().replace(/_/g, '-').replace(/^icon-?/, '');
  const IconComponent = ICON_REGISTRY[normalizedKey] || Icons.IconSparkles;
  return <IconComponent {...props} />;
}

export const ICON_CATALOG = [
  {
    category: 'Core Navigation & Viewport',
    icons: [
      { name: 'home', title: 'Home / Beranda' },
      { name: 'dashboard', title: 'Dashboard' },
      { name: 'compass', title: 'Explore / Eksplorasi' },
      { name: 'book-open', title: 'Library / Modul' },
      { name: 'layers', title: 'Layers / Simulasi' },
      { name: 'grid', title: 'Grid View' },
      { name: 'list', title: 'List View' },
      { name: 'columns', title: 'Dual Columns' },
      { name: 'sidebar', title: 'Drawer Sidebar' },
      { name: 'arrow-right', title: 'Vector Right' },
      { name: 'arrow-left', title: 'Vector Left' },
      { name: 'arrow-up', title: 'Vector Up' },
      { name: 'arrow-down', title: 'Vector Down' },
      { name: 'arrow-up-right', title: 'External Vector' },
      { name: 'chevron-right', title: 'Chevron Right' },
      { name: 'chevron-left', title: 'Chevron Left' },
      { name: 'chevron-down', title: 'Chevron Down' },
      { name: 'chevron-up', title: 'Chevron Up' },
      { name: 'menu', title: 'Rack Menu' },
      { name: 'close', title: 'Close / Reticle Cross' },
      { name: 'check', title: 'Check' },
      { name: 'plus', title: 'Plus Node' },
      { name: 'minus', title: 'Minus Datum' },
      { name: 'panel-left-close', title: 'Sidebar Close' },
      { name: 'panel-left-open', title: 'Sidebar Open' },
      { name: 'external-link', title: 'Observation Port' },
    ],
  },
  {
    category: 'Simulation Controls & Metrology',
    icons: [
      { name: 'play', title: 'Trigger Play' },
      { name: 'pause', title: 'Brake Pause' },
      { name: 'rotate-ccw', title: 'Calibrate Reset' },
      { name: 'step-forward', title: 'Step Forward' },
      { name: 'step-backward', title: 'Step Backward' },
      { name: 'speed', title: 'Playback Speed' },
      { name: 'sliders', title: 'Parameter Tracks' },
      { name: 'gauge', title: 'Tachometer Gauge' },
      { name: 'activity', title: 'Oscilloscopic Wave' },
      { name: 'crosshair', title: 'Optical Reticle' },
      { name: 'ruler', title: 'Precision Caliper' },
      { name: 'thermometer', title: 'Thermal Sensor' },
      { name: 'scale', title: 'Analytical Balance' },
      { name: 'target', title: 'Collimator Target' },
      { name: 'maximize', title: 'Expand Calipers' },
      { name: 'minimize', title: 'Contract Calipers' },
      { name: 'zoom-in', title: 'Optical Zoom In' },
      { name: 'zoom-out', title: 'Optical Zoom Out' },
      { name: 'gamepad', title: 'Direct Controller' },
    ],
  },
  {
    category: 'Scientific Disciplines & Principles',
    icons: [
      { name: 'physics', title: 'Fisika Terapan (F = ma)' },
      { name: 'vector', title: 'Vektor Koordinat' },
      { name: 'pendulum', title: 'Osilasi Harmonik' },
      { name: 'magnet', title: 'Medan Magnetik' },
      { name: 'projectile', title: 'Gerak Parabola' },
      { name: 'math', title: 'Matematika Komputasi' },
      { name: 'function', title: 'Kurva Fungsi f(x)' },
      { name: 'integral', title: 'Kalkulus Integral' },
      { name: 'matrix', title: 'Tensor Matriks' },
      { name: 'informatics', title: 'TRPL / Informatika' },
      { name: 'code', title: 'Sintaks Kode' },
      { name: 'terminal', title: 'Command Terminal' },
      { name: 'git-branch', title: 'Branch Versi' },
      { name: 'cpu', title: 'Mikroprosesor Die' },
      { name: 'database', title: 'Memory Store' },
      { name: 'chemistry', title: 'Kimia Terapan' },
      { name: 'flask', title: 'Lab Erlenmeyer' },
      { name: 'molecule', title: 'Cincin Benzena' },
      { name: 'test-tube', title: 'Tabung Reaksi' },
      { name: 'atom', title: 'Orbital Nukleus' },
      { name: 'agribusiness', title: 'Agribisnis / Biologi' },
      { name: 'dna', title: 'Heliks Ganda DNA' },
      { name: 'cell', title: 'Membran Sel' },
      { name: 'accounting', title: 'Akuntansi Analitis' },
      { name: 'event', title: 'MICE / Konvensi' },
    ],
  },
  {
    category: 'Economics & Quantitative Analytics',
    icons: [
      { name: 'economics', title: 'Ekonomi Bisnis (S-D)' },
      { name: 'candlestick', title: 'Grafik Candlestick' },
      { name: 'coins', title: 'Token / Kredit Simulasi' },
      { name: 'percent', title: 'Suku Bunga Majemuk' },
      { name: 'statistics', title: 'Statistika (Gaussian)' },
      { name: 'line-chart', title: 'Plot Kartesius' },
      { name: 'bar-chart', title: 'Diagram Batang' },
      { name: 'scatter-plot', title: 'Scatter Regresi' },
      { name: 'dice', title: 'Probabilitas Dadu' },
      { name: 'trending-up', title: 'Tren Pertumbuhan' },
    ],
  },
  {
    category: 'Tanya AI & GEN LABS AI',
    icons: [
      { name: 'ai-tutor', title: 'Tanya AI Nexus Cell' },
      { name: 'brain', title: 'Jaringan Hipotesis' },
      { name: 'sparkles', title: 'Bintang Celik Berlian' },
      { name: 'command', title: 'Command Launcher' },
      { name: 'mic', title: 'Input Suara Transduser' },
      { name: 'mic-off', title: 'Mikrofon Nonaktif' },
      { name: 'message-square', title: 'Matriks Dialog' },
      { name: 'send', title: 'Vektor Shuttle' },
      { name: 'bot', title: 'Automaton Agent' },
      { name: 'thinking', title: 'Retikel Kuadran' },
      { name: 'refresh-cw', title: 'Regenerasi Respon' },
      { name: 'copy', title: 'Salin Spesimen' },
      { name: 'trash', title: 'Disposal Wadah' },
      { name: 'edit', title: 'Stylus Kalibrasi' },
      { name: 'search', title: 'Lensa Inspeksi' },
      { name: 'lightbulb', title: 'Sinyal Wawasan' },
      { name: 'help-circle', title: 'Interogasi Ilmiah' },
    ],
  },
  {
    category: 'Documents, Modules & Curriculum',
    icons: [
      { name: 'file-text', title: 'Lembar Catatan Lab' },
      { name: 'folder', title: 'Folder Arsip' },
      { name: 'folder-open', title: 'Folder Terbuka' },
      { name: 'bookmark', title: 'Simpan Eksperimen' },
      { name: 'award', title: 'Medali CPL / Capaian' },
      { name: 'graduation-cap', title: 'Kurikulum Akademik' },
      { name: 'clipboard-check', title: 'Rubrik Evaluasi' },
      { name: 'tag', title: 'Taksonomi Bidang' },
      { name: 'share', title: 'Jaringan Distribusi' },
      { name: 'save', title: 'Disket Magnetik' },
      { name: 'download', title: 'Unduh Berkas' },
      { name: 'upload', title: 'Unggah Berkas' },
    ],
  },
  {
    category: 'System Telemetry, Audio & Security',
    icons: [
      { name: 'check-circle', title: 'Verifikasi Sukses' },
      { name: 'alert-circle', title: 'Batas Parameter Error' },
      { name: 'alert-triangle', title: 'Peringatan Kondisi' },
      { name: 'info', title: 'Catatan Observasi' },
      { name: 'clock', title: 'Interval Waktu Lab' },
      { name: 'zap', title: 'Fluks Energi / Kuota' },
      { name: 'signal', title: 'Kekuatan Sinyal' },
      { name: 'volume', title: 'Emisi Akustik' },
      { name: 'volume-x', title: 'Audio Nonaktif' },
      { name: 'user', title: 'Profil Peneliti' },
      { name: 'users', title: 'Kohort Praktikan' },
      { name: 'shield', title: 'Armatur Proteksi' },
      { name: 'shield-check', title: 'Keamanan Terverifikasi' },
      { name: 'shield-alert', title: 'Peringatan Keamanan' },
      { name: 'lock', title: 'Kunci Brankas' },
      { name: 'unlock', title: 'Kunci Terbuka' },
      { name: 'key', title: 'Kunci Mekanis' },
      { name: 'settings', title: 'Roda Penyetel' },
      { name: 'bell', title: 'Alarm Akustik' },
      { name: 'sun', title: 'Mode Terang Solar' },
      { name: 'moon', title: 'Mode Obsidian Gelap' },
      { name: 'logout', title: 'Keluar Portal' },
      { name: 'filter', title: 'Corong Filter' },
      { name: 'calendar', title: 'Kalender Lab' },
      { name: 'eye', title: 'Lensa Pengamatan' },
      { name: 'eye-off', title: 'Pengamatan Tersembunyi' },
      { name: 'calculator', title: 'Simpul Kalkulasi' },
    ],
  },
];
