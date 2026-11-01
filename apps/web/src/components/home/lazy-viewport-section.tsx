'use client';

import React, { useState, useEffect, useRef } from 'react';

interface LazyViewportSectionProps {
  children: React.ReactNode;
  minHeight?: number;
  id?: string;
  className?: string;
}

export function LazyViewportSection({
  children,
  minHeight = 600,
  id,
  className = '',
}: LazyViewportSectionProps) {
  const [hasEntered, setHasEntered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If crawler/bot or IntersectionObserver is not supported, render immediately for SEO
    const isBot =
      typeof navigator !== 'undefined' &&
      /bot|google|baidu|bing|msn|teoma|slurp|yandex/i.test(navigator.userAgent);

    if (isBot || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setHasEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '120px', // Preload 120px before scrolling into view, keeping initial viewport lean
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      id={id}
      className={className}
      style={{ minHeight: hasEntered ? undefined : `${minHeight}px` }}
    >
      {hasEntered ? children : null}
    </div>
  );
}
