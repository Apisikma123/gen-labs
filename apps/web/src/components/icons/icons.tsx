import React from 'react';
import { createGenIcon, IconProps } from './icon-base';

/* =========================================================================
 * 1. CORE NAVIGATION & WORKSPACE
 * ========================================================================= */

/**
 * Laboratory habitat / workstation (clean geometric pavilion with reticle aperture)
 */
export const IconHome = createGenIcon(
  'IconHome',
  <>
    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5z" />
    <path d="M10 21v-6h4v6" />
  </>
);

/**
 * Modular instrument telemetry rack (calibrated asymmetric panels)
 */
export const IconDashboard = createGenIcon(
  'IconDashboard',
  <>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </>
);

/**
 * Directional navigational dial with 45° azimuth needle
 */
export const IconCompass = createGenIcon(
  'IconCompass',
  <>
    <circle cx="12" cy="12" r="9" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.15" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </>
);

/**
 * Open laboratory curriculum folio / experimental codex
 */
export const IconBookOpen = createGenIcon(
  'IconBookOpen',
  <>
    <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H11v18H4.5A2.5 2.5 0 0 0 2 22.5V4.5z" />
    <path d="M22 4.5A2.5 2.5 0 0 0 19.5 2H13v18h6.5A2.5 2.5 0 0 1 22 22.5V4.5z" />
    <path d="M6 7h3" />
    <path d="M6 11h3" />
    <path d="M15 7h3" />
    <path d="M15 11h3" />
  </>
);

/**
 * Stacked experimental planes / simulation strata
 */
export const IconLayers = createGenIcon(
  'IconLayers',
  <>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 12 12 17 22 12" />
    <polyline points="2 17 12 22 22 17" />
  </>
);

/** Calibrated horizontal rightward vector */
export const IconArrowRight = createGenIcon(
  'IconArrowRight',
  <>
    <line x1="4" y1="12" x2="20" y2="12" />
    <polyline points="14 6 20 12 14 18" />
  </>
);

/** Calibrated horizontal leftward vector */
export const IconArrowLeft = createGenIcon(
  'IconArrowLeft',
  <>
    <line x1="20" y1="12" x2="4" y2="12" />
    <polyline points="10 18 4 12 10 6" />
  </>
);

/** Calibrated vertical upward vector */
export const IconArrowUp = createGenIcon(
  'IconArrowUp',
  <>
    <line x1="12" y1="20" x2="12" y2="4" />
    <polyline points="6 10 12 4 18 10" />
  </>
);

/** Calibrated vertical downward vector */
export const IconArrowDown = createGenIcon(
  'IconArrowDown',
  <>
    <line x1="12" y1="4" x2="12" y2="20" />
    <polyline points="6 14 12 20 18 14" />
  </>
);

/** 45-degree diagonal outbound telemetry vector */
export const IconArrowUpRight = createGenIcon(
  'IconArrowUpRight',
  <>
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </>
);

/** Angular chevron indicators */
export const IconChevronRight = createGenIcon('IconChevronRight', <polyline points="9 6 15 12 9 18" />);
export const IconChevronLeft = createGenIcon('IconChevronLeft', <polyline points="15 18 9 12 15 6" />);
export const IconChevronDown = createGenIcon('IconChevronDown', <polyline points="6 9 12 15 18 9" />);
export const IconChevronUp = createGenIcon('IconChevronUp', <polyline points="18 15 12 9 6 15" />);

/** Balanced 3-tier instrument rack rail lines */
export const IconMenu = createGenIcon(
  'IconMenu',
  <>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </>
);

/** Orthogonal cross reticle */
export const IconClose = createGenIcon(
  'IconClose',
  <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>
);

/** Scientific validation check */
export const IconCheck = createGenIcon('IconCheck', <polyline points="20 6 9 17 4 12" />);

/** Node addition reticle */
export const IconPlus = createGenIcon(
  'IconPlus',
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </>
);

/** Datum subtraction line */
export const IconMinus = createGenIcon('IconMinus', <line x1="5" y1="12" x2="19" y2="12" />);

/** Laboratory sidebar toggle controls */
export const IconPanelLeftClose = createGenIcon(
  'IconPanelLeftClose',
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
    <path d="M15 15l-3-3 3-3" />
  </>
);

export const IconPanelLeftOpen = createGenIcon(
  'IconPanelLeftOpen',
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
    <path d="M13 9l3 3-3 3" />
  </>
);

/** External observation port */
export const IconExternalLink = createGenIcon(
  'IconExternalLink',
  <>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </>
);

/* =========================================================================
 * 2. GEN LABS SIMULATION & LABORATORY APPARATUS
 * ========================================================================= */

/** Rightward directional trigger (clean equilateral triangle) */
export const IconPlay = createGenIcon(
  'IconPlay',
  <polygon points="6 4 19 12 6 20 6 4" fill="currentColor" fillOpacity="0.2" />
);

/** Parallel dual brake dampers */
export const IconPause = createGenIcon(
  'IconPause',
  <>
    <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" fillOpacity="0.2" />
    <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" fillOpacity="0.2" />
  </>
);

/** Cyclic calibration loop with directional arrowhead */
export const IconRotateCcw = createGenIcon(
  'IconRotateCcw',
  <>
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </>
);

/** Calibrated horizontal parameter tracks with precision slide pips */
export const IconSliders = createGenIcon(
  'IconSliders',
  <>
    <line x1="4" y1="6" x2="20" y2="6" />
    <circle cx="8" cy="6" r="2.5" fill="currentColor" fillOpacity="0.25" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <circle cx="16" cy="12" r="2.5" fill="currentColor" fillOpacity="0.25" />
    <line x1="4" y1="18" x2="20" y2="18" />
    <circle cx="11" cy="18" r="2.5" fill="currentColor" fillOpacity="0.25" />
  </>
);

/** 270° radial dial gauge with center hub and indicator needle */
export const IconGauge = createGenIcon(
  'IconGauge',
  <>
    <path d="M12 21a9 9 0 1 1 9-9c0 1.25-.26 2.45-.73 3.53" />
    <line x1="12" y1="12" x2="16" y2="8" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </>
);

/** Real-time oscilloscopic waveform telemetry pulse */
export const IconActivity = createGenIcon(
  'IconActivity',
  <polyline points="22 12 18 12 15 4 9 20 6 12 2 12" />
);

/** 2-axis Cartesian graph with plotted experimental trend line and nodes */
export const IconLineChart = createGenIcon(
  'IconLineChart',
  <>
    <path d="M3 3v18h18" />
    <path d="M7 16l4-5 4 3 5-7" />
    <circle cx="7" cy="16" r="1.5" fill="currentColor" />
    <circle cx="11" cy="11" r="1.5" fill="currentColor" />
    <circle cx="15" cy="14" r="1.5" fill="currentColor" />
    <circle cx="20" cy="7" r="1.5" fill="currentColor" />
  </>
);

/** Graduated conical Erlenmeyer laboratory vessel with measurement notches */
export const IconFlask = createGenIcon(
  'IconFlask',
  <>
    <path d="M10 2v5.5L4.5 19A2 2 0 0 0 6.2 22h11.6a2 2 0 0 0 1.7-3L14 7.5V2" />
    <line x1="8.5" y1="2" x2="15.5" y2="2" />
    <line x1="7" y1="15" x2="11" y2="15" />
    <line x1="8" y1="11" x2="10.5" y2="11" />
  </>
);

/** Central nucleus with dual tilted elliptical orbital shells */
export const IconAtom = createGenIcon(
  'IconAtom',
  <>
    <ellipse cx="12" cy="12" rx="4" ry="10" transform="rotate(45 12 12)" />
    <ellipse cx="12" cy="12" rx="4" ry="10" transform="rotate(-45 12 12)" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </>
);

/** Laboratory analytical balance with central pivot and level pans */
export const IconScale = createGenIcon(
  'IconScale',
  <>
    <path d="M12 3v18" />
    <path d="M6 7l6-2 6 2" />
    <path d="M3 13l3-6 3 6a3 3 0 0 1-6 0z" />
    <path d="M15 13l3-6 3 6a3 3 0 0 1-6 0z" />
    <line x1="8" y1="21" x2="16" y2="21" />
  </>
);

/** Microprocessor die with orthogonal contact pins and internal logic core */
export const IconCpu = createGenIcon(
  'IconCpu',
  <>
    <rect x="5" y="5" width="14" height="14" rx="2" />
    <rect x="9" y="9" width="6" height="6" fill="currentColor" fillOpacity="0.2" />
    <line x1="9" y1="1" x2="9" y2="5" />
    <line x1="15" y1="1" x2="15" y2="5" />
    <line x1="9" y1="19" x2="9" y2="23" />
    <line x1="15" y1="19" x2="15" y2="23" />
    <line x1="1" y1="9" x2="5" y2="9" />
    <line x1="1" y1="15" x2="5" y2="15" />
    <line x1="19" y1="9" x2="23" y2="9" />
    <line x1="19" y1="15" x2="23" y2="15" />
  </>
);

/** Multi-tier cylindrical memory store with telemetry status line */
export const IconDatabase = createGenIcon(
  'IconDatabase',
  <>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v7c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12v7c0 1.66 4.03 3 9 3s9-1.34 9-3v-7" />
  </>
);

/** Precision concentric optical reticle / collimator */
export const IconTarget = createGenIcon(
  'IconTarget',
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <line x1="12" y1="1" x2="12" y2="4" />
    <line x1="12" y1="20" x2="12" y2="23" />
    <line x1="1" y1="12" x2="4" y2="12" />
    <line x1="20" y1="12" x2="23" y2="12" />
  </>
);

/** 4-corner viewport expansion calipers */
export const IconMaximize = createGenIcon(
  'IconMaximize',
  <>
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M16 3h3a2 2 0 0 1 2 2v3" />
    <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
  </>
);

/** 4-corner viewport contraction calipers */
export const IconMinimize = createGenIcon(
  'IconMinimize',
  <>
    <path d="M4 14h6v6" />
    <path d="M20 10h-6V4" />
    <path d="M14 10l7-7" />
    <path d="M10 14L3 21" />
  </>
);

/** Optical magnifier with plus reticle */
export const IconZoomIn = createGenIcon(
  'IconZoomIn',
  <>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </>
);

/** Optical magnifier with minus reticle */
export const IconZoomOut = createGenIcon(
  'IconZoomOut',
  <>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </>
);

/* =========================================================================
 * 3. SUBJECT-SPECIFIC PRECISION ICONS (AUTHENTIC SCIENTIFIC CONCEPTS)
 * ========================================================================= */

/**
 * Fisika Terapan: Mass block on horizontal rail with applied force vector (F = ma)
 */
export const IconDisciplinePhysics = createGenIcon(
  'IconDisciplinePhysics',
  <>
    {/* Base reference rail */}
    <line x1="3" y1="19" x2="21" y2="19" />
    {/* Block m with center mass pip */}
    <rect x="5" y="11" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.15" />
    <circle cx="9" cy="15" r="1" fill="currentColor" />
    {/* Applied force vector arrow F */}
    <path d="M13 15h7" />
    <polyline points="17 12 20 15 17 18" />
    {/* Velocity ripple marker */}
    <path d="M5 8c2-1 4-1 6 0" strokeDasharray="1.5 1.5" />
  </>
);

/**
 * Matematika Komputasi: Cartesian coordinate axes with smooth parabola polynomial curve
 */
export const IconDisciplineMath = createGenIcon(
  'IconDisciplineMath',
  <>
    {/* Axes with ticks */}
    <line x1="4" y1="20" x2="20" y2="20" />
    <line x1="4" y1="20" x2="4" y2="4" />
    {/* Parabolic polynomial curve f(x) = x^2 */}
    <path d="M4 6c3 10 9 10 16-1" />
    {/* Vertex inflection node */}
    <circle cx="10" cy="16" r="1.5" fill="currentColor" />
    {/* Root intercept indicator */}
    <line x1="4" y1="12" x2="6" y2="12" />
  </>
);

/**
 * TRPL / Informatika: Algorithmic binary tree with interconnected decision nodes and syntax brackets
 */
export const IconDisciplineInformatics = createGenIcon(
  'IconDisciplineInformatics',
  <>
    {/* Root node */}
    <circle cx="12" cy="5" r="2.5" fill="currentColor" fillOpacity="0.2" />
    {/* Left branch & leaf */}
    <line x1="10.5" y1="7" x2="6.5" y2="14" />
    <circle cx="6" cy="16" r="2" />
    {/* Right branch & leaf */}
    <line x1="13.5" y1="7" x2="17.5" y2="14" />
    <circle cx="18" cy="16" r="2" />
    {/* Code logic delimiter < / > */}
    <path d="M9 19l-2 2" />
    <path d="M15 19l2 2" />
  </>
);

/**
 * Ekonomi Bisnis: Marshallian intersecting Supply (S) & Demand (D) curves with equilibrium node
 */
export const IconDisciplineEconomics = createGenIcon(
  'IconDisciplineEconomics',
  <>
    {/* Price & Quantity axes */}
    <line x1="4" y1="4" x2="4" y2="20" />
    <line x1="4" y1="20" x2="20" y2="20" />
    {/* Demand curve (downward sloping) */}
    <line x1="6" y1="7" x2="18" y2="17" />
    {/* Supply curve (upward sloping) */}
    <line x1="6" y1="17" x2="18" y2="7" />
    {/* Equilibrium point E (P*, Q*) */}
    <circle cx="12" cy="12" r="2" fill="#BA8230" stroke="#BA8230" />
  </>
);

/**
 * Kimia Terapan: Volumetric boiling flask with liquid meniscus and active reaction nodes
 */
export const IconDisciplineChemistry = createGenIcon(
  'IconDisciplineChemistry',
  <>
    <path d="M9 3h6" />
    <path d="M10 3v5l-4.5 9.5A2 2 0 0 0 7.3 21h9.4a2 2 0 0 0 1.8-3.5L14 8V3" />
    {/* Meniscus line */}
    <path d="M7 16c2.5 1 7.5 1 10 0" />
    {/* Reactive solute bubbles */}
    <circle cx="10" cy="18" r="0.75" fill="currentColor" />
    <circle cx="14" cy="17" r="0.75" fill="currentColor" />
  </>
);

/**
 * Agribisnis Hortikultura: Precision plant seedling / leaf venation on soil substrate
 */
export const IconDisciplineAgribusiness = createGenIcon(
  'IconDisciplineAgribusiness',
  <>
    {/* Soil horizon */}
    <line x1="3" y1="20" x2="21" y2="20" />
    {/* Main stem */}
    <path d="M12 20V10" />
    {/* Primary foliage leaf */}
    <path d="M12 10c0-4 4-7 7-7 0 4-3 7-7 7z" fill="currentColor" fillOpacity="0.15" />
    {/* Secondary opposite leaf */}
    <path d="M12 13c0-3-3-5-6-5 0 3 3 5 6 5z" fill="currentColor" fillOpacity="0.15" />
  </>
);

/**
 * Akuntansi Perpajakan: Analytical dual-column ledger grid with summative double underline
 */
export const IconDisciplineAccounting = createGenIcon(
  'IconDisciplineAccounting',
  <>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <line x1="4" y1="8" x2="20" y2="8" />
    <line x1="12" y1="8" x2="12" y2="21" />
    {/* Debit/Credit balance rows */}
    <line x1="6.5" y1="12" x2="9.5" y2="12" />
    <line x1="14.5" y1="12" x2="17.5" y2="12" />
    <line x1="6.5" y1="16" x2="9.5" y2="16" />
    <line x1="14.5" y1="16" x2="17.5" y2="16" />
  </>
);

/**
 * Konvensi & Acara (MICE): Staged podium dais with projection aperture rays
 */
export const IconDisciplineEvent = createGenIcon(
  'IconDisciplineEvent',
  <>
    {/* Elevated stage platform */}
    <path d="M3 18l3-3h12l3 3v2H3v-2z" />
    {/* Spotlights / projection rays */}
    <line x1="12" y1="3" x2="12" y2="8" />
    <line x1="6" y1="5" x2="8.5" y2="9" />
    <line x1="18" y1="5" x2="15.5" y2="9" />
    {/* Speaker podium */}
    <rect x="10.5" y="10" width="3" height="5" rx="0.5" fill="currentColor" fillOpacity="0.2" />
  </>
);

/**
 * Statistika Terapan: Gaussian normal probability distribution curve
 */
export const IconDisciplineStatistics = createGenIcon(
  'IconDisciplineStatistics',
  <>
    <line x1="3" y1="20" x2="21" y2="20" />
    {/* Bell curve */}
    <path d="M4 19c3-1 5-2 6-8 1-6 3-6 4 0 1 6 3 7 6 8" />
    {/* Mean mu centerline */}
    <line x1="12" y1="4" x2="12" y2="20" strokeDasharray="1.5 1.5" />
  </>
);

/* =========================================================================
 * 4. AI CONVERSATION & GEN LABS AI
 * ========================================================================= */

/**
 * Official GEN LABS AI Tutor badge: Isometric test cell with central phosphor diamond reticle
 */
export const IconAiTutor = createGenIcon(
  'IconAiTutor',
  <>
    {/* Isometric test cell facets */}
    <polygon points="12 3 19 7 14 10 12 9 10 10 5 7 12 3" fill="currentColor" fillOpacity="0.2" />
    <polygon points="19 16 12 20 12 15 14 14 14 11 19 12 19 16" fill="currentColor" fillOpacity="0.15" />
    <polygon points="5 16 5 8 10 11 10 14 12 15 12 20 5 16" fill="currentColor" fillOpacity="0.1" />
    {/* Central phosphor reaction reticle */}
    <polygon points="12 11 13.5 12.5 12 14 10.5 12.5" fill="#4B8F8C" stroke="#4B8F8C" />
  </>
);

/**
 * Restrained geometric 4-point celestial diamond star with paired satellite reticles
 */
export const IconSparkles = createGenIcon(
  'IconSparkles',
  <>
    {/* Central primary diamond star */}
    <path
      d="M12 3c0 4.5 4.5 9 9 9-4.5 0-9 4.5-9 9 0-4.5-4.5-9-9-9 4.5 0 9-4.5 9-9z"
      fill="currentColor"
      fillOpacity="0.18"
    />
    {/* Top-right satellite pip */}
    <circle cx="19" cy="5" r="1.5" fill="currentColor" />
    {/* Bottom-left satellite pip */}
    <circle cx="5" cy="19" r="1" fill="currentColor" />
  </>
);

/** Dialogue telemetry terminal cell */
export const IconMessageSquare = createGenIcon(
  'IconMessageSquare',
  <>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="8" y1="9" x2="16" y2="9" />
    <line x1="8" y1="13" x2="13" y2="13" />
  </>
);

/** Angled 45-degree telemetry vector shuttle */
export const IconSend = createGenIcon(
  'IconSend',
  <>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" fillOpacity="0.15" />
  </>
);

/** GEN LABS AI automated agent head */
export const IconBot = createGenIcon(
  'IconBot',
  <>
    {/* Head frame */}
    <rect x="3" y="10" width="18" height="11" rx="2" />
    {/* Transceiver antenna */}
    <path d="M12 3v4" />
    <circle cx="12" cy="2.5" r="1.5" fill="currentColor" />
    {/* Bilateral optical lenses */}
    <circle cx="8" cy="15" r="1.5" fill="currentColor" />
    <circle cx="16" cy="15" r="1.5" fill="currentColor" />
    {/* Telemetry ear lugs */}
    <path d="M2 14v3" />
    <path d="M22 14v3" />
  </>
);

/** Rotating quadrant reticle arc */
export const IconLoader = createGenIcon(
  'IconLoader',
  <>
    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M4.93 4.93l2.83 2.83" />
    <path d="M16.24 16.24l2.83 2.83" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <path d="M4.93 19.07l2.83-2.83" />
    <path d="M16.24 7.76l2.83-2.83" />
  </>
);

/** Overlapping analytical specimen folios */
export const IconCopy = createGenIcon(
  'IconCopy',
  <>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </>
);

/** Apparatus disposal container */
export const IconTrash = createGenIcon(
  'IconTrash',
  <>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </>
);

/** Calibrated drafting stylus */
export const IconEdit = createGenIcon(
  'IconEdit',
  <>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </>
);

/** Optical lens with reticle center */
export const IconSearch = createGenIcon(
  'IconSearch',
  <>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.5" y2="16.5" />
    <circle cx="11" cy="11" r="1.5" fill="currentColor" fillOpacity="0.4" />
  </>
);

/** Pedagogical insight beacon */
export const IconLightbulb = createGenIcon(
  'IconLightbulb',
  <>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A6 6 0 1 0 7.5 11.5c.76.76 1.23 1.52 1.41 2.5h6.18z" />
  </>
);

/** Scientific query interrogation mark */
export const IconHelpCircle = createGenIcon(
  'IconHelpCircle',
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </>
);

/* =========================================================================
 * 5. ACCOUNT, SECURITY & UTILITIES
 * ========================================================================= */

/** Student silhouette */
export const IconUser = createGenIcon(
  'IconUser',
  <>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </>
);

/** Student cohort */
export const IconUsers = createGenIcon(
  'IconUsers',
  <>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>
);

/** Academic curriculum mortarboard */
export const IconGraduationCap = createGenIcon(
  'IconGraduationCap',
  <>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </>
);

/** Defensive armature crest */
export const IconShield = createGenIcon(
  'IconShield',
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
);

/** Armature with verified validation check */
export const IconShieldCheck = createGenIcon(
  'IconShieldCheck',
  <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </>
);

/** Armature with warning indicator */
export const IconShieldAlert = createGenIcon(
  'IconShieldAlert',
  <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <circle cx="12" cy="15.5" r="0.75" fill="currentColor" />
  </>
);

/** Locked security shackle */
export const IconLock = createGenIcon(
  'IconLock',
  <>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <circle cx="12" cy="16.5" r="1.5" fill="currentColor" />
  </>
);

/** Displaced security shackle */
export const IconUnlock = createGenIcon(
  'IconUnlock',
  <>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    <circle cx="12" cy="16.5" r="1.5" fill="currentColor" />
  </>
);

/** Bitted mechanical key */
export const IconKey = createGenIcon(
  'IconKey',
  <>
    <path d="M21 2l-2 2m-1.5 1.5L10 13a5 5 0 1 0 4 4l7.5-7.5M16 6l3 3M19 3l2 2" />
    <circle cx="7" cy="17" r="1.5" fill="currentColor" />
  </>
);

/** 6-toothed circular machine adjustment gear */
export const IconSettings = createGenIcon(
  'IconSettings',
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </>
);

/** Telemetry acoustic alarm bell */
export const IconBell = createGenIcon(
  'IconBell',
  <>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </>
);

/** Light laboratory solar mode */
export const IconSun = createGenIcon(
  'IconSun',
  <>
    <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.15" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </>
);

/** Deep obsidian dark mode */
export const IconMoon = createGenIcon(
  'IconMoon',
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" fillOpacity="0.15" />
);

/** Session exit doorway portal */
export const IconLogOut = createGenIcon(
  'IconLogOut',
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </>
);

/** 3-node network share distributor */
export const IconShare = createGenIcon(
  'IconShare',
  <>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </>
);

/** Downward vector to tray */
export const IconDownload = createGenIcon(
  'IconDownload',
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </>
);

/** Upward vector from tray */
export const IconUpload = createGenIcon(
  'IconUpload',
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </>
);

/** 3.5-inch magnetic diskette record */
export const IconSave = createGenIcon(
  'IconSave',
  <>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </>
);

/** Volumetric funnel filter */
export const IconFilter = createGenIcon(
  'IconFilter',
  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
);

/** Monthly grid tablet */
export const IconCalendar = createGenIcon(
  'IconCalendar',
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </>
);

/** Ocular lens aperture */
export const IconEye = createGenIcon(
  'IconEye',
  <>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2" />
  </>
);

export const IconEyeOff = createGenIcon(
  'IconEyeOff',
  <>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </>
);

/* =========================================================================
 * 6. SYSTEM STATES & TELEMETRY
 * ========================================================================= */

/** Verified experimental success */
export const IconCheckCircle = createGenIcon(
  'IconCheckCircle',
  <>
    <circle cx="12" cy="12" r="9" />
    <polyline points="9 12 11 14 15 10" />
  </>
);

/** Parameter boundary error */
export const IconAlertCircle = createGenIcon(
  'IconAlertCircle',
  <>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <circle cx="12" cy="16" r="0.75" fill="currentColor" />
  </>
);

/** Laboratory condition warning */
export const IconAlertTriangle = createGenIcon(
  'IconAlertTriangle',
  <>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <circle cx="12" cy="17" r="0.75" fill="currentColor" />
  </>
);

/** Observation note / information */
export const IconInfo = createGenIcon(
  'IconInfo',
  <>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <circle cx="12" cy="8" r="0.75" fill="currentColor" />
  </>
);

/** Temporal interval / timer */
export const IconClock = createGenIcon(
  'IconClock',
  <>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 6 12 12 16 14" />
  </>
);

/** Energy flux / quota unit */
export const IconZap = createGenIcon(
  'IconZap',
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fillOpacity="0.2" />
);

/** Inline horizontal telemetry nodes */
export const IconMoreHorizontal = createGenIcon(
  'IconMoreHorizontal',
  <>
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <circle cx="19" cy="12" r="1.5" fill="currentColor" />
    <circle cx="5" cy="12" r="1.5" fill="currentColor" />
  </>
);

/** Inline vertical telemetry nodes */
export const IconMoreVertical = createGenIcon(
  'IconMoreVertical',
  <>
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <circle cx="12" cy="5" r="1.5" fill="currentColor" />
    <circle cx="12" cy="19" r="1.5" fill="currentColor" />
  </>
);

/** File record folio */
export const IconFileText = createGenIcon(
  'IconFileText',
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </>
);

/** Calculation node */
export const IconCalculator = createGenIcon(
  'IconCalculator',
  <>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="16" y1="14" x2="16" y2="18" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </>
);

/** Statistical discrete vertical bar chart */
export const IconBarChart = createGenIcon(
  'IconBarChart',
  <>
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </>
);

/** Encapsulated scalar addition node */
export const IconPlusCircle = createGenIcon(
  'IconPlusCircle',
  <>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </>
);

/** Interactive simulation controller apparatus */
export const IconGamepad = createGenIcon(
  'IconGamepad',
  <>
    <line x1="6" y1="12" x2="10" y2="12" />
    <line x1="8" y1="10" x2="8" y2="14" />
    <line x1="15" y1="13" x2="15.01" y2="13" />
    <line x1="18" y1="11" x2="18.01" y2="11" />
    <rect x="2" y="6" width="20" height="12" rx="4" />
  </>
);

/** Upward trending experimental trajectory vector */
export const IconTrendingUp = createGenIcon(
  'IconTrendingUp',
  <>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </>
);

/** Interactive direct manipulation reticle / cursor */
export const IconPointer = createGenIcon(
  'IconPointer',
  <>
    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
    <path d="M13 13l6 6" />
  </>
);

/** Portable computation station / laptop */
export const IconLaptop = createGenIcon(
  'IconLaptop',
  <>
    <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55A1 1 0 0 1 20.38 20H3.62a1 1 0 0 1-.9-1.45L4 16" />
  </>
);

/** Parameter exception error node */
export const IconXCircle = createGenIcon(
  'IconXCircle',
  <>
    <circle cx="12" cy="12" r="9" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </>
);

/** Typographic text visual datum element */
export const IconType = createGenIcon(
  'IconType',
  <>
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </>
);

/** Geometric square visual element */
export const IconSquare = createGenIcon(
  'IconSquare',
  <rect x="3" y="3" width="18" height="18" rx="2" />
);

/** Geometric circle visual element */
export const IconCircle = createGenIcon(
  'IconCircle',
  <circle cx="12" cy="12" r="9" />
);

/** Graphic image specimen element */
export const IconImage = createGenIcon(
  'IconImage',
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <polyline points="21 15 16 10 5 21" />
  </>
);

/** Numerical telemetry parameter tag */
export const IconHash = createGenIcon(
  'IconHash',
  <>
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </>
);

/** Two-position slider toggle in off state */
export const IconToggleLeft = createGenIcon(
  'IconToggleLeft',
  <>
    <rect x="1" y="5" width="22" height="14" rx="7" />
    <circle cx="8" cy="12" r="3" fill="currentColor" />
  </>
);

/** Two-position slider toggle in on state */
export const IconToggleRight = createGenIcon(
  'IconToggleRight',
  <>
    <rect x="1" y="5" width="22" height="14" rx="7" fill="currentColor" fillOpacity="0.2" />
    <circle cx="16" cy="12" r="3" fill="currentColor" />
  </>
);

/* =========================================================================
 * 7. EXTENDED NAVIGATION & VIEWPORT GRIDS
 * ========================================================================= */

/** 4-quadrant laboratory matrix / grid layout */
export const IconGrid = createGenIcon(
  'IconGrid',
  <>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </>
);

/** Tabular multi-item list view with alignment pips */
export const IconList = createGenIcon(
  'IconList',
  <>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <circle cx="4" cy="6" r="1.25" fill="currentColor" />
    <circle cx="4" cy="12" r="1.25" fill="currentColor" />
    <circle cx="4" cy="18" r="1.25" fill="currentColor" />
  </>
);

/** Dual-column comparative viewport */
export const IconColumns = createGenIcon(
  'IconColumns',
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </>
);

/** Laboratory workspace drawer sidebar */
export const IconSidebar = createGenIcon(
  'IconSidebar',
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="9" y1="4" x2="9" y2="20" />
  </>
);

/* =========================================================================
 * 8. ADVANCED TANYA AI & GEN LABS AI CONTROLS
 * ========================================================================= */

/** GEN LABS AI neural hypothesis network (genuine cognitive nodes, not generic sparkles) */
export const IconBrain = createGenIcon(
  'IconBrain',
  <>
    <path d="M9.5 3A4.5 4.5 0 0 0 5 7.5c0 .76.19 1.48.52 2.11A5 5 0 0 0 4 14a5 5 0 0 0 3 4.58V20a1 1 0 0 0 1 1h2" />
    <path d="M14.5 3A4.5 4.5 0 0 1 19 7.5c0 .76-.19 1.48-.52 2.11A5 5 0 0 1 20 14a5 5 0 0 1-3 4.58V20a1 1 0 0 1-1 1h-2" />
    <line x1="12" y1="4" x2="12" y2="21" />
    <circle cx="12" cy="8" r="1.5" fill="#4B8F8C" stroke="#4B8F8C" />
    <circle cx="12" cy="14" r="1.5" fill="#4B8F8C" stroke="#4B8F8C" />
  </>
);

/** GEN LABS AI command launcher / palette */
export const IconCommand = createGenIcon(
  'IconCommand',
  <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
);

/** Audio acoustic transducer / voice input */
export const IconMic = createGenIcon(
  'IconMic',
  <>
    <rect x="9" y="2" width="6" height="11" rx="3" fill="currentColor" fillOpacity="0.2" />
    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </>
);

/** Muted audio acoustic transducer */
export const IconMicOff = createGenIcon(
  'IconMicOff',
  <>
    <line x1="2" y1="2" x2="22" y2="22" />
    <path d="M18.89 13.23A7.12 7.12 0 0 0 19 11v-1" />
    <path d="M5 10v1a7 7 0 0 0 12 5" />
    <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
    <path d="M9 9v2a3 3 0 0 0 5.12 2.12" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </>
);

/** Cyclic telemetry regeneration */
export const IconRefreshCw = createGenIcon(
  'IconRefreshCw',
  <>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </>
);

/* =========================================================================
 * 9. PHYSICAL & MATHEMATICAL INSTRUMENTS
 * ========================================================================= */

/** Calibrated coordinate vector with scalar components */
export const IconVector = createGenIcon(
  'IconVector',
  <>
    <line x1="4" y1="20" x2="19" y2="5" />
    <polyline points="12 5 19 5 19 12" />
    <line x1="4" y1="20" x2="19" y2="20" strokeDasharray="2 2" strokeOpacity={0.6} />
    <line x1="19" y1="20" x2="19" y2="5" strokeDasharray="2 2" strokeOpacity={0.6} />
    <circle cx="4" cy="20" r="1.5" fill="currentColor" />
  </>
);

/** Harmonic pendulum oscillator apparatus */
export const IconPendulum = createGenIcon(
  'IconPendulum',
  <>
    <line x1="4" y1="3" x2="20" y2="3" />
    <line x1="12" y1="3" x2="17" y2="15" />
    <circle cx="17" cy="17" r="3" fill="currentColor" fillOpacity="0.2" />
    <path d="M8 18c2 2 6 2 8 0" strokeDasharray="1.5 1.5" strokeOpacity={0.6} />
  </>
);

/** Magnetic dipole field apparatus */
export const IconMagnet = createGenIcon(
  'IconMagnet',
  <>
    <path d="M5 4v7a7 7 0 0 0 14 0V4" />
    <line x1="5" y1="9" x2="9" y2="9" />
    <line x1="15" y1="9" x2="19" y2="9" />
    <rect x="3" y="4" width="4" height="4" fill="currentColor" fillOpacity="0.25" />
    <rect x="17" y="4" width="4" height="4" fill="currentColor" fillOpacity="0.25" />
  </>
);

/** Kinematic projectile trajectory with velocity tangent */
export const IconProjectile = createGenIcon(
  'IconProjectile',
  <>
    <line x1="3" y1="20" x2="21" y2="20" />
    <path d="M4 20c2-12 11-15 16-1" strokeDasharray="2 2" />
    <circle cx="12" cy="7" r="2" fill="#BA8230" stroke="#BA8230" />
    <path d="M12 7l4-2" />
    <polyline points="14 4 16 5 15 7" />
  </>
);

/** Mathematical function mapping curve f(x) with inflection node */
export const IconFunction = createGenIcon(
  'IconFunction',
  <>
    <line x1="4" y1="20" x2="20" y2="20" />
    <line x1="4" y1="20" x2="4" y2="4" />
    <path d="M4 17c5-1 7-10 11-10 3 0 4 4 5 7" />
    <circle cx="15" cy="7" r="1.5" fill="currentColor" />
  </>
);

/** Calculus definite integral with differential bounds */
export const IconIntegral = createGenIcon(
  'IconIntegral',
  <>
    <path d="M15 4c-2.5 0-4 1.5-4 4v8c0 2.5-1.5 4-4 4" />
    <line x1="7" y1="12" x2="15" y2="12" />
  </>
);

/** 2x2 Bracketed matrix tensor */
export const IconMatrix = createGenIcon(
  'IconMatrix',
  <>
    <path d="M6 4H4v16h2" />
    <path d="M18 4h2v16h-2" />
    <circle cx="9" cy="8" r="1.5" fill="currentColor" />
    <circle cx="15" cy="8" r="1.5" fill="currentColor" />
    <circle cx="9" cy="16" r="1.5" fill="currentColor" />
    <circle cx="15" cy="16" r="1.5" fill="currentColor" />
  </>
);

/* =========================================================================
 * 10. COMPUTER SCIENCE & ALGORITHMS
 * ========================================================================= */

/** Code delimiter syntax brackets */
export const IconCode = createGenIcon(
  'IconCode',
  <>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
    <line x1="14" y1="4" x2="10" y2="20" />
  </>
);

/** Laboratory command shell terminal */
export const IconTerminal = createGenIcon(
  'IconTerminal',
  <>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </>
);

/** Git revision commit branch */
export const IconGitBranch = createGenIcon(
  'IconGitBranch',
  <>
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="18" cy="6" r="3" fill="currentColor" fillOpacity="0.2" />
    <circle cx="6" cy="18" r="3" fill="currentColor" fillOpacity="0.2" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </>
);

/* =========================================================================
 * 11. CHEMISTRY & BIOLOGICAL SCIENCE
 * ========================================================================= */

/** Covalent aromatic benzene ring */
export const IconMolecule = createGenIcon(
  'IconMolecule',
  <>
    <polygon points="12 3 19.8 7.5 19.8 16.5 12 21 4.2 16.5 4.2 7.5 12 3" />
    <polygon points="12 6.5 17 9.4 17 14.6 12 17.5 7 14.6 7 9.4 12 6.5" strokeDasharray="2 2" strokeOpacity={0.6} />
    <circle cx="12" cy="12" r="1.5" fill="#4B8F8C" stroke="#4B8F8C" />
  </>
);

/** Graduated specimen test tube */
export const IconTestTube = createGenIcon(
  'IconTestTube',
  <>
    <path d="M14.5 2v14.5a3.5 3.5 0 0 1-7 0V2" />
    <line x1="6" y1="2" x2="16" y2="2" />
    <line x1="7.5" y1="12" x2="14.5" y2="12" />
    <line x1="8" y1="8" x2="11" y2="8" />
  </>
);

/** Nucleic acid double helix */
export const IconDna = createGenIcon(
  'IconDna',
  <>
    <path d="M4 3c6 4 10 4 16 0" />
    <path d="M4 21c6-4 10-4 16 0" />
    <path d="M4 9c6 4 10 4 16 0" />
    <path d="M4 15c6-4 10-4 16 0" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </>
);

/** Cellular membrane with nucleus organelle */
export const IconCell = createGenIcon(
  'IconCell',
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
    <circle cx="12" cy="12" r="1.5" fill="#4B8F8C" stroke="#4B8F8C" />
    <path d="M8 8a6 6 0 0 1 8 0" strokeDasharray="1.5 1.5" />
  </>
);

/* =========================================================================
 * 12. ECONOMICS, FINANCE & STATISTICS
 * ========================================================================= */

/** Financial market candlestick series */
export const IconCandlestick = createGenIcon(
  'IconCandlestick',
  <>
    <line x1="9" y1="3" x2="9" y2="6" />
    <rect x="6.5" y="6" width="5" height="10" rx="1" fill="currentColor" fillOpacity="0.2" />
    <line x1="9" y1="16" x2="9" y2="21" />
    <line x1="17" y1="5" x2="17" y2="9" />
    <rect x="14.5" y="9" width="5" height="7" rx="1" fill="#BA8230" stroke="#BA8230" fillOpacity={0.3} />
    <line x1="17" y1="16" x2="17" y2="19" />
  </>
);

/** Stacked simulation currency / credit quota tokens */
export const IconCoins = createGenIcon(
  'IconCoins',
  <>
    <ellipse cx="12" cy="6" rx="8" ry="3" fill="currentColor" fillOpacity="0.2" />
    <path d="M4 6v5c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
    <path d="M4 11v5c0 1.66 3.58 3 8 3s8-1.34 8-3v-5" />
    <circle cx="12" cy="6" r="1.25" fill="#BA8230" stroke="#BA8230" />
  </>
);

/** Interest / percentage rate */
export const IconPercent = createGenIcon(
  'IconPercent',
  <>
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="7" cy="7" r="2.5" fill="currentColor" fillOpacity="0.2" />
    <circle cx="17" cy="17" r="2.5" fill="currentColor" fillOpacity="0.2" />
  </>
);

/** Statistical regression scatter plot */
export const IconScatterPlot = createGenIcon(
  'IconScatterPlot',
  <>
    <path d="M3 3v18h18" />
    <circle cx="7" cy="15" r="1.5" fill="currentColor" />
    <circle cx="10" cy="11" r="1.5" fill="currentColor" />
    <circle cx="12" cy="13" r="1.5" fill="currentColor" />
    <circle cx="16" cy="8" r="1.5" fill="currentColor" />
    <circle cx="19" cy="6" r="1.5" fill="currentColor" />
    <line x1="6" y1="16" x2="20" y2="5" strokeDasharray="2 2" strokeOpacity={0.6} />
  </>
);

/** Probability state die with calibrated pips */
export const IconDice = createGenIcon(
  'IconDice',
  <>
    <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" fillOpacity="0.1" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    <circle cx="16" cy="8" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12" r="1.5" fill="#BA8230" stroke="#BA8230" />
    <circle cx="8" cy="16" r="1.5" fill="currentColor" />
    <circle cx="16" cy="16" r="1.5" fill="currentColor" />
  </>
);

/* =========================================================================
 * 13. SIMULATION PLAYBACK & METROLOGY
 * ========================================================================= */

/** Discrete single-frame step forward */
export const IconStepForward = createGenIcon(
  'IconStepForward',
  <>
    <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" fillOpacity="0.2" />
    <line x1="19" y1="5" x2="19" y2="19" />
  </>
);

/** Discrete single-frame step backward */
export const IconStepBackward = createGenIcon(
  'IconStepBackward',
  <>
    <polygon points="19 20 9 12 19 4 19 20" fill="currentColor" fillOpacity="0.2" />
    <line x1="5" y1="5" x2="5" y2="19" />
  </>
);

/** Simulation playback multiplier */
export const IconSpeed = createGenIcon(
  'IconSpeed',
  <>
    <polygon points="13 19 22 12 13 5 13 19" fill="currentColor" fillOpacity="0.2" />
    <polygon points="2 19 11 12 2 5 2 19" fill="currentColor" fillOpacity="0.2" />
  </>
);

/** Laboratory optical crosshair target reticle */
export const IconCrosshair = createGenIcon(
  'IconCrosshair',
  <>
    <circle cx="12" cy="12" r="8" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="17" y1="12" x2="22" y2="12" />
  </>
);

/** Precision metrology caliper / ruler */
export const IconRuler = createGenIcon(
  'IconRuler',
  <>
    <rect x="3" y="7" width="18" height="10" rx="1.5" fill="currentColor" fillOpacity="0.1" />
    <line x1="7" y1="7" x2="7" y2="11" />
    <line x1="11" y1="7" x2="11" y2="13" />
    <line x1="15" y1="7" x2="15" y2="11" />
  </>
);

/** Calibrated thermal laboratory sensor */
export const IconThermometer = createGenIcon(
  'IconThermometer',
  <>
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    <circle cx="11.5" cy="17.5" r="2" fill="#BA8230" stroke="#BA8230" />
    <line x1="11.5" y1="9" x2="11.5" y2="15.5" />
  </>
);

/* =========================================================================
 * 14. DOCUMENTS, CURRICULUM & MODULES
 * ========================================================================= */

/** Closed laboratory folder */
export const IconFolder = createGenIcon(
  'IconFolder',
  <path d="M2 7a2 2 0 0 1 2-2h4l2 2h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" />
);

/** Open laboratory folder with specimen contents */
export const IconFolderOpen = createGenIcon(
  'IconFolderOpen',
  <>
    <path d="M2 7a2 2 0 0 1 2-2h4l2 2h10a2 2 0 0 1 2 2v1H2V7z" />
    <path d="M2 10h20l-2 10H4L2 10z" fill="currentColor" fillOpacity="0.15" />
  </>
);

/** Saved experiment state ribbon bookmark */
export const IconBookmark = createGenIcon(
  'IconBookmark',
  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
);

/** Competency achievement / CPL medallion */
export const IconAward = createGenIcon(
  'IconAward',
  <>
    <circle cx="12" cy="8" r="6" fill="currentColor" fillOpacity="0.15" />
    <polyline points="8.21 13.89 7 22 12 19 17 22 15.79 13.88" />
    <circle cx="12" cy="8" r="2" fill="#BA8230" stroke="#BA8230" />
  </>
);

/** Scientific evaluation checklist / rubric */
export const IconClipboardCheck = createGenIcon(
  'IconClipboardCheck',
  <>
    <rect x="4" y="5" width="16" height="16" rx="2" />
    <path d="M9 3h6a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1z" />
    <polyline points="9 13 11 15 15 11" />
  </>
);

/** Taxonomy parameter tag */
export const IconTag = createGenIcon(
  'IconTag',
  <>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <circle cx="7" cy="7" r="1.5" fill="currentColor" />
  </>
);

/* =========================================================================
 * 15. AUDIO, TELEMETRY SIGNALS & SENSORS
 * ========================================================================= */

/** Laboratory acoustic emission transducer */
export const IconVolume = createGenIcon(
  'IconVolume',
  <>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity="0.15" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </>
);

/** Muted acoustic emission transducer */
export const IconVolumeX = createGenIcon(
  'IconVolumeX',
  <>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity="0.15" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </>
);

/** Telemetry wireless signal strength */
export const IconSignal = createGenIcon(
  'IconSignal',
  <>
    <line x1="4" y1="18" x2="4" y2="18.01" strokeWidth={3} />
    <line x1="9" y1="18" x2="9" y2="14" />
    <line x1="14" y1="18" x2="14" y2="10" />
    <line x1="19" y1="18" x2="19" y2="6" />
  </>
);





