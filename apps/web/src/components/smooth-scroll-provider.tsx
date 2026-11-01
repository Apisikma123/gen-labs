'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Only enable Lenis smooth scroll on landing page ('/') for desktop devices with fine pointer.
    // Touch devices, mobile, and users with prefers-reduced-motion use native hardware-accelerated momentum scrolling.
    const isTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0);
    const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    if (pathname !== '/' || isTouch || isReduced || isMobile) {
      if (typeof window !== 'undefined' && (window as unknown as { __lenis?: { destroy: () => void } }).__lenis) {
        try {
          (window as unknown as { __lenis?: { destroy: () => void } }).__lenis?.destroy();
          delete (window as unknown as { __lenis?: unknown }).__lenis;
        } catch {
          // ignore cleanup errors
        }
      }
      return;
    }

    let isDestroyed = false;
    let lenisInstance: { destroy: () => void; raf: (time: number) => void } | null = null;
    let animationFrameId: number;

    import('lenis').then(({ default: Lenis }) => {
      if (isDestroyed) return;

      const lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        touchMultiplier: 1.0,
      });
      lenisInstance = lenis;

      if (typeof window !== 'undefined') {
        (window as unknown as { __lenis?: unknown }).__lenis = lenis;
      }

      let isHidden = typeof document !== 'undefined' ? document.hidden : false;

      const onVisibilityChange = () => {
        const currentlyHidden = document.hidden;
        if (isHidden && !currentlyHidden) {
          isHidden = false;
          animationFrameId = requestAnimationFrame(raf);
        } else {
          isHidden = currentlyHidden;
        }
      };
      document.addEventListener('visibilitychange', onVisibilityChange);

      function raf(time: number) {
        if (isHidden || !lenisInstance) return;
        lenisInstance.raf(time);
        animationFrameId = requestAnimationFrame(raf);
      }

      animationFrameId = requestAnimationFrame(raf);
    });

    return () => {
      isDestroyed = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (lenisInstance) {
        lenisInstance.destroy();
        if (typeof window !== 'undefined' && (window as unknown as { __lenis?: unknown }).__lenis === lenisInstance) {
          delete (window as unknown as { __lenis?: unknown }).__lenis;
        }
      }
    };
  }, [pathname]);

  return <>{children}</>;
}
