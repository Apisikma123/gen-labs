'use client';

/**
 * GEN LABS — Precision Motion System Tokens
 * Calibrated easing curves, duration scales, and hardware-accelerated transform variants.
 * Strictly adheres to AGENTS.md and zero-motion-slop principles.
 */

export const MOTION_EASE = {
  // Signature high-end editorial curve: crisp initial acceleration with natural gentle settling
  precision: [0.16, 1, 0.3, 1] as const,
  // Mechanical telemetry / apparatus curve for gauges, sliders, and instrument dials
  telemetry: [0.25, 0.1, 0.25, 1] as const,
  // Snappy UI micro-interactions for buttons, tabs, and toggles
  snappy: [0.2, 0, 0, 1] as const,
  // Gentle ambient drift curve
  ambient: [0.4, 0, 0.2, 1] as const,
};

export const MOTION_DURATION = {
  instant: 0.15,
  fast: 0.25,
  standard: 0.45,
  flow: 0.65,
  scene: 0.9,
};

export const MOTION_SPRING = {
  tight: { type: 'spring', damping: 28, stiffness: 320 } as const,
  gentle: { type: 'spring', damping: 24, stiffness: 190 } as const,
  interactive: { type: 'spring', damping: 20, stiffness: 240 } as const,
};

/**
 * Coordinated Hero Entrance Variants (Starts visible for immediate LCP paint & zero layout shift)
 */
export const heroContainerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.02,
    },
  },
};

export const heroItemVariants = {
  hidden: { opacity: 1, y: 0 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATION.fast,
      ease: MOTION_EASE.precision,
    },
  },
};

/**
 * Staged Section Reveal Variants
 */
export const stagedContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

export const stagedItemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATION.standard,
      ease: MOTION_EASE.precision,
    },
  },
};

/**
 * Reduced Motion Fallback Variants (instantly visible, zero transforms)
 */
export const reducedMotionVariants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0, transition: { duration: 0 } },
};
