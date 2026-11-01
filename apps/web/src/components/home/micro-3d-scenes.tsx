'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/components/theme-provider';
import {
  IconActivity,
  IconDatabase,
  IconCheckCircle,
  IconCpu,
} from '@/components/icons';

/**
 * 1. Concept Matrix Scope (Replaces CoreSphere3D)
 * Used in Section C Card 1: "Tentukan Konsep"
 * Authentic circular polar coordinate scope mapping curriculum simulation nodes.
 */
export function CoreSphere3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== 'light';

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth || 240;
      height = container.clientHeight || 190;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const nodes = [
      { label: 'FISIKA', angle: Math.PI * 0.25, r: 58, code: 'F-01' },
      { label: 'MATEMATIKA', angle: Math.PI * 0.75, r: 66, code: 'M-02' },
      { label: 'EKONOMI', angle: Math.PI * 1.25, r: 52, code: 'E-03' },
      { label: 'INFORMATIKA', angle: Math.PI * 1.75, r: 62, code: 'CS-04' },
    ];

    let angle = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isVisible = false;

    const render = () => {
      if (!isVisible || width === 0 || height === 0) return;
      animId = requestAnimationFrame(render);

      if (!reducedMotion) angle += 0.025;

      const cx = width / 2;
      const cy = height / 2;

      const isCurrentlyDark =
        document.documentElement.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark';

      const ringColor = isCurrentlyDark ? 'rgba(43, 48, 37, 0.7)' : 'rgba(221, 226, 219, 0.9)';
      const sweepColor = isCurrentlyDark ? 'rgba(75, 143, 140, 0.15)' : 'rgba(29, 72, 56, 0.12)';
      const sweepBeam = isCurrentlyDark ? '#4B8F8C' : '#1C332A';
      const textColor = isCurrentlyDark ? '#94A3B8' : '#69736B';

      ctx.clearRect(0, 0, width, height);

      // Concentric Range Rings
      [28, 50, 72].forEach((r) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - 78, cy);
      ctx.lineTo(cx + 78, cy);
      ctx.moveTo(cx, cy - 78);
      ctx.lineTo(cx, cy + 78);
      ctx.strokeStyle = ringColor;
      ctx.stroke();

      // Rotating Radar Sweep
      const beamX = cx + Math.cos(angle) * 76;
      const beamY = cy + Math.sin(angle) * 76;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, 76, angle - 0.45, angle);
      ctx.closePath();
      ctx.fillStyle = sweepColor;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(beamX, beamY);
      ctx.strokeStyle = sweepBeam;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Nodes on the Scope (Precision Crosshair Reticles, No Slop Dots)
      nodes.forEach((n) => {
        const nx = cx + Math.cos(n.angle) * n.r;
        const ny = cy + Math.sin(n.angle) * n.r;

        // Angle difference to sweep beam
        let diff = Math.abs((angle % (Math.PI * 2)) - n.angle);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;
        const isLit = diff < 0.35;

        // Precision crosshair tick
        ctx.strokeStyle = isLit ? (isCurrentlyDark ? '#4B8F8C' : '#1C332A') : (isCurrentlyDark ? '#222733' : '#DDE2DB');
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(nx - 4, ny);
        ctx.lineTo(nx + 4, ny);
        ctx.moveTo(nx, ny - 4);
        ctx.lineTo(nx, ny + 4);
        ctx.stroke();

        ctx.fillStyle = isLit ? (isCurrentlyDark ? '#F1F5F9' : '#18201B') : textColor;
        ctx.font = '8px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, nx, ny - 6);
      });

      // Center Coordinate Reticle
      ctx.strokeStyle = isCurrentlyDark ? '#4B8F8C' : '#1C332A';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy);
      ctx.lineTo(cx + 3, cy);
      ctx.moveTo(cx, cy - 3);
      ctx.lineTo(cx, cy + 3);
      ctx.stroke();
    };

    const io = new IntersectionObserver((entries) => {
      const nowVisible = entries[0]?.isIntersecting ?? false;
      if (nowVisible && !isVisible) {
        isVisible = true;
        animId = requestAnimationFrame(render);
      } else if (!nowVisible && isVisible) {
        isVisible = false;
        if (animId) cancelAnimationFrame(animId);
      }
    }, { threshold: 0.05 });
    io.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      io.disconnect();
    };
  }, [resolvedTheme]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center relative">
      <canvas ref={canvasRef} className="block pointer-events-none" />
      <div className="absolute top-2 left-2 text-[9px] font-mono text-[var(--color-text-tertiary)] flex items-center gap-1.5">
        <IconActivity size={11} className="text-[var(--color-secondary)]" />
        <span>RADAR MATRIKS KURIKULUM</span>
      </div>
    </div>
  );
}

/**
 * 2. 3D Isometric AI State Core / Hypercube Apparatus
 * Used in Section C Card 3: "Amati & Tanya AI"
 * Mathematical 4D Tesseract projected into 3D isometric space.
 * Real 60 FPS animation with hairline edges, vector vertices, and live telemetry flow.
 */
export function Hypercube3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth || 240;
      height = container.clientHeight || 160;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let isVisible = false;

    // 8 base cube vertices (±1, ±1, ±1)
    const baseCube = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1,  1], [1, -1,  1], [1, 1,  1], [-1, 1,  1],
    ];

    // 12 edges of a cube
    const cubeEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // back face
      [4, 5], [5, 6], [6, 7], [7, 4], // front face
      [0, 4], [1, 5], [2, 6], [3, 7], // cross edges
    ];

    let rotX = 0.35;
    let rotY = 0.45;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      if (!isVisible || width === 0 || height === 0) return;
      animId = requestAnimationFrame(render);

      if (!reducedMotion) {
        rotX += 0.008;
        rotY += 0.012;
      }

      const cx = width / 2;
      const cy = height / 2;

      const isCurrentlyDark =
        document.documentElement.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark';

      const outerEdgeColor = isCurrentlyDark ? '#4B8F8C' : '#1C332A'; // Phosphor Sage / Deep Pine
      const innerEdgeColor = isCurrentlyDark ? 'rgba(75, 143, 140, 0.45)' : 'rgba(29, 72, 56, 0.4)';
      const hyperEdgeColor = isCurrentlyDark ? 'rgba(186, 130, 48, 0.55)' : 'rgba(186, 130, 48, 0.5)'; // Ochre
      const reticleColor = isCurrentlyDark ? '#F1F5F9' : '#18201B';

      ctx.clearRect(0, 0, width, height);

      // 3D rotation & projection helper
      const project = (x: number, y: number, z: number, scale: number) => {
        // Rotate around Y
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        // Rotate around X
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        // Perspective projection
        const fov = 160;
        const distance = 220;
        const pz = distance / (distance + z2 * scale);

        return {
          x: cx + x1 * scale * pz,
          y: cy + y2 * scale * pz,
          z: z2,
        };
      };

      const breath = Math.sin(Date.now() * 0.0022) * 2.2;
      const outerScale = 42 + breath;
      const innerScale = 20 + breath * 0.55;

      const outerProjected = baseCube.map(([x, y, z]) => project(x, y, z, outerScale));
      const innerProjected = baseCube.map(([x, y, z]) => project(x, y, z, innerScale));

      // 1. Draw 4D Hypercube Inter-Connecting Edges (Connecting Outer to Inner)
      ctx.strokeStyle = hyperEdgeColor;
      ctx.lineWidth = 0.9;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        ctx.moveTo(outerProjected[i].x, outerProjected[i].y);
        ctx.lineTo(innerProjected[i].x, innerProjected[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Draw Inner Cube Edges
      ctx.strokeStyle = innerEdgeColor;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      cubeEdges.forEach(([i, j]) => {
        ctx.moveTo(innerProjected[i].x, innerProjected[i].y);
        ctx.lineTo(innerProjected[j].x, innerProjected[j].y);
      });
      ctx.stroke();

      // 3. Draw Outer Cube Edges
      ctx.strokeStyle = outerEdgeColor;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      cubeEdges.forEach(([i, j]) => {
        ctx.moveTo(outerProjected[i].x, outerProjected[i].y);
        ctx.lineTo(outerProjected[j].x, outerProjected[j].y);
      });
      ctx.stroke();

      // 4. Draw Precision Vertex Reticles (Crosshairs, NO dots)
      ctx.strokeStyle = reticleColor;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      outerProjected.forEach((p) => {
        ctx.moveTo(p.x - 3, p.y);
        ctx.lineTo(p.x + 3, p.y);
        ctx.moveTo(p.x, p.y - 3);
        ctx.lineTo(p.x, p.y + 3);
      });
      ctx.stroke();

      // 5. Active Telemetry Core Reticle at Center
      ctx.strokeStyle = '#BA8230';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy);
      ctx.lineTo(cx + 4, cy);
      ctx.moveTo(cx, cy - 4);
      ctx.lineTo(cx, cy + 4);
      ctx.stroke();
    };

    const io = new IntersectionObserver(
      (entries) => {
        const nowVisible = entries[0]?.isIntersecting ?? false;
        if (nowVisible && !isVisible) {
          isVisible = true;
          animId = requestAnimationFrame(render);
        } else if (!nowVisible && isVisible) {
          isVisible = false;
          if (animId) cancelAnimationFrame(animId);
        }
      },
      { threshold: 0.05 }
    );
    io.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      io.disconnect();
    };
  }, [resolvedTheme]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center relative">
      <canvas ref={canvasRef} className="block pointer-events-none" />
      <div className="absolute top-2 left-2 text-[9px] font-mono text-[var(--color-text-tertiary)] flex items-center gap-1.5">
        <IconCpu size={11} className="text-[var(--color-secondary)]" />
        <span>3D AI STATE TESSERACT</span>
      </div>
      <div className="absolute bottom-2 right-2 text-[8px] font-mono text-[var(--color-text-tertiary)] border border-[var(--color-border)] px-1.5 py-0.5 rounded-sm bg-[var(--color-surface)]">
        60 FPS CORE
      </div>
    </div>
  );
}

/**
 * 3. Phase Space Orbit Visualizer (Replaces CrystalPrism3D)
 * Used in Section E Bento Card 1: "Simulation Engine"
 * Continuous harmonic phase portrait (dx/dt vs x) demonstrating physical determinism.
 */
export function CrystalPrism3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== 'light';

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth || 280;
      height = container.clientHeight || 150;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let isVisible = false;
    let t = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      if (!isVisible || width === 0 || height === 0) return;
      animId = requestAnimationFrame(render);

      if (!reducedMotion) t += 0.035;

      const cx = width / 2;
      const cy = height / 2;

      const isCurrentlyDark =
        document.documentElement.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark';

      const gridColor = isCurrentlyDark ? 'rgba(43, 48, 37, 0.5)' : 'rgba(221, 226, 219, 0.7)';
      const orbitColor = isCurrentlyDark ? '#4B8F8C' : '#1C332A';
      const pointerColor = '#BA8230';

      ctx.clearRect(0, 0, width, height);

      // Hairline Grid
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(cx - 70, cy);
      ctx.lineTo(cx + 70, cy);
      ctx.moveTo(cx, cy - 50);
      ctx.lineTo(cx, cy + 50);
      ctx.stroke();

      // Phase Orbit (Closed-form harmonic ellipse in phase space)
      const a = 54;
      const b = 36;
      ctx.strokeStyle = orbitColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(cx, cy, a, b, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Current Phase State Vector Particle
      const px = cx + Math.cos(t) * a;
      const py = cy + Math.sin(t) * b;

      // Trajectory dash vector from origin
      ctx.strokeStyle = isCurrentlyDark ? 'rgba(186, 130, 48, 0.5)' : 'rgba(186, 130, 48, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.stroke();

      // Phase state indicator: precision diamond reticle (No Slop Dots)
      ctx.strokeStyle = pointerColor;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(px, py - 4);
      ctx.lineTo(px + 4, py);
      ctx.lineTo(px, py + 4);
      ctx.lineTo(px - 4, py);
      ctx.closePath();
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = isCurrentlyDark ? '#94A3B8' : '#69736B';
      ctx.font = '8px "Space Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('v = ẋ', cx - 6, cy - 42);
      ctx.textAlign = 'left';
      ctx.fillText('x (pos)', cx + 62, cy - 4);
    };

    const io = new IntersectionObserver((entries) => {
      const nowVisible = entries[0]?.isIntersecting ?? false;
      if (nowVisible && !isVisible) {
        isVisible = true;
        animId = requestAnimationFrame(render);
      } else if (!nowVisible && isVisible) {
        isVisible = false;
        if (animId) cancelAnimationFrame(animId);
      }
    }, { threshold: 0.05 });
    io.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      io.disconnect();
    };
  }, [resolvedTheme]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center relative">
      <canvas ref={canvasRef} className="block pointer-events-none" />
      <div className="absolute bottom-1 right-2 text-[8px] font-mono text-[var(--color-text-tertiary)]">
        PHASE PORTRAIT: dx/dt vs x
      </div>
    </div>
  );
}
