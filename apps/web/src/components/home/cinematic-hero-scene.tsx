'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { animate } from 'animejs';
import {
  IconPlay,
  IconSearch,
} from '@/components/icons';
import { newtonsSecondLaw } from '@genlab/simulation-core';

export function CinematicHeroScene() {
  const router = useRouter();
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // ── INTERACTIVE EXPERIMENT PARAMETERS (HUKUM II NEWTON) ──
  const [force, setForce] = useState<number>(40); // 20N, 40N, 80N
  const [mass, setMass] = useState<number>(4); // 2kg, 4kg, 8kg
  const [isSimRunning, setIsSimRunning] = useState<boolean>(false);
  const [nlQuery, setNlQuery] = useState<string>('');
  const [telemetry, setTelemetry] = useState({
    accel: 10,
    vel: 0,
    dist: 0,
    time: 0,
  });

  const accel = Number(newtonsSecondLaw.compute({ mass, force, friction: 0 }).acceleration);

  // ── SEARCH BAR NAVIGATION (PRD §14 & §15) ──
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = nlQuery.trim().toLowerCase();
    if (!q) {
      router.push('/simulation/newtons-second-law');
      return;
    }
    if (q.includes('newton') || q.includes('gaya') || q.includes('percepatan')) {
      router.push('/simulation/newtons-second-law');
    } else if (q.includes('parabola') || q.includes('kuadrat') || q.includes('fungsi')) {
      router.push('/simulation/function-explorer');
    } else if (q.includes('pasar') || q.includes('supply') || q.includes('demand')) {
      router.push('/simulation/supply-demand');
    } else {
      router.push(`/tanya-ai?q=${encodeURIComponent(q)}`);
    }
  };

  // Launch function reference
  const launchRef = useRef<((a: number) => void) | null>(null);

  const handleLaunch = () => {
    if (isSimRunning || !launchRef.current) return;
    setIsSimRunning(true);
    launchRef.current(accel);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = mountRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 760;

    // ── 1. SCENE & CAMERA ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1410);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0.5, 14.8);

    // ── 2. RENDERER ──
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;

    // ── 3. CINEMATIC DIRECTIONAL & RIM LIGHTING ──
    const ambientLight = new THREE.AmbientLight(0x0b110c, 2.0);
    scene.add(ambientLight);

    // Key Light: Phosphor Sage Cyan (#4B8F8C) from top-right
    const keyLight = new THREE.DirectionalLight(0x4b8f8c, 5.0);
    keyLight.position.set(10, 14, 8);
    scene.add(keyLight);

    // Rim Light: Warm Ochre Gold (#BA8230) from bottom-left
    const rimLight = new THREE.DirectionalLight(0xba8230, 3.8);
    rimLight.position.set(-10, -8, 6);
    scene.add(rimLight);

    // Dynamic Glider Point Light
    const simLight = new THREE.PointLight(0x4b8f8c, 3.5, 16);
    scene.add(simLight);

    // ── 4. LAYER A: PLANETARY / GRAVITATIONAL HORIZON CURVATURE ──
    const horizonGeo = new THREE.SphereGeometry(38, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.28);
    const horizonMat = new THREE.MeshStandardMaterial({
      color: 0x090e0b,
      roughness: 0.92,
      metalness: 0.15,
      flatShading: false,
    });
    const horizon = new THREE.Mesh(horizonGeo, horizonMat);
    horizon.position.set(0, -38.6, -4.8);
    horizon.rotation.x = Math.PI * 0.95;
    scene.add(horizon);

    // Atmospheric Glowing Rim Curve (Phosphor Sage Cyan emission along horizon apex)
    const atmosArcPoints = [];
    for (let i = -14; i <= 14; i += 1) {
      const arcY = -1.2 - (i * i) * 0.016;
      atmosArcPoints.push(new THREE.Vector3(i, arcY, -4.2));
    }
    const atmosCurve = new THREE.CatmullRomCurve3(atmosArcPoints);
    const atmosGeo = new THREE.TubeGeometry(atmosCurve, 64, 0.22, 8, false);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x4b8f8c,
      transparent: true,
      opacity: 0.42,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosMesh);

    // ── 5. LAYER C: VOLUMETRIC VECTOR TRAJECTORY RIBBONS (3D CATMULL-ROM) ──
    // Swoops under the center typography, then accelerates upward to the right
    const splinePoints = [
      new THREE.Vector3(-13, -1.8, -2.5),
      new THREE.Vector3(-6.5, -1.6, 0.5),
      new THREE.Vector3(0, -1.5, 2.4),
      new THREE.Vector3(6.5, 0.4, 0.8),
      new THREE.Vector3(12.5, 3.0, -3.0),
    ];
    const trajectoryCurve = new THREE.CatmullRomCurve3(splinePoints);

    // Primary Volumetric Trajectory Ribbon (Phosphor Sage Cyan)
    const tubeGeo = new THREE.TubeGeometry(trajectoryCurve, 120, 0.22, 16, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x4b8f8c,
      emissive: 0x1d4838,
      emissiveIntensity: 1.6,
      roughness: 0.15,
      metalness: 0.85,
      transparent: true,
      opacity: 0.92,
    });
    const trajectoryTube = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(trajectoryTube);

    // Secondary Energetic Flux Stream (Warm Ochre Gold)
    const fluxPoints = [
      new THREE.Vector3(-12.5, -2.2, -2.2),
      new THREE.Vector3(-6.0, -2.0, 0.7),
      new THREE.Vector3(0.5, -1.8, 2.6),
      new THREE.Vector3(7.0, 0.1, 0.5),
      new THREE.Vector3(13.0, 2.6, -3.2),
    ];
    const fluxCurve = new THREE.CatmullRomCurve3(fluxPoints);
    const fluxGeo = new THREE.TubeGeometry(fluxCurve, 100, 0.11, 12, false);
    const fluxMat = new THREE.MeshStandardMaterial({
      color: 0xba8230,
      emissive: 0x5a3810,
      emissiveIntensity: 1.4,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.82,
    });
    const fluxTube = new THREE.Mesh(fluxGeo, fluxMat);
    scene.add(fluxTube);

    // Precision Vector Streamline
    const lineGeo = new THREE.TubeGeometry(trajectoryCurve, 100, 0.035, 8, false);
    const lineMat = new THREE.MeshBasicMaterial({
      color: 0xe6ece8,
      transparent: true,
      opacity: 0.4,
    });
    const centerStreamline = new THREE.Mesh(lineGeo, lineMat);
    scene.add(centerStreamline);

    // ── 6. LAYER B: 3D FACETED BODIES IN MULTI-PLANE PARALLAX ──
    const createAsteroidGeo = (radius: number, detail: number) => {
      const geo = new THREE.IcosahedronGeometry(radius, detail);
      const pos = geo.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        // Realistic chiseled rock displacement
        const factor = 1 + 0.32 * Math.sin(v.x * 2.2 + v.y * 1.7 + v.z * 2.8) + 0.14 * Math.cos(v.x * 4.1 - v.z * 3.5);
        v.multiplyScalar(factor);
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      geo.computeVertexNormals();
      return geo;
    };

    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x141a12,
      roughness: 0.65,
      metalness: 0.45,
      flatShading: true,
    });

    // Layer 1: Extreme Foreground Chiseled Body (Bottom-Left close to lens, clear of controls)
    const fgAsteroidGeo = createAsteroidGeo(2.8, 1);
    const fgAsteroid = new THREE.Mesh(fgAsteroidGeo, rockMaterial);
    fgAsteroid.position.set(-7.8, -3.8, 5.8);
    scene.add(fgAsteroid);

    // Layer 2: Midground Floating Body (Right flank)
    const mgAsteroidGeo = createAsteroidGeo(1.8, 1);
    const mgAsteroid = new THREE.Mesh(mgAsteroidGeo, rockMaterial);
    mgAsteroid.position.set(7.8, -0.6, 2.0);
    scene.add(mgAsteroid);

    // Layer 3: Distant Floating Body (Top-Left)
    const bgAsteroidGeo = createAsteroidGeo(1.1, 1);
    const bgAsteroid = new THREE.Mesh(bgAsteroidGeo, rockMaterial);
    bgAsteroid.position.set(-6.2, 4.0, -3.5);
    scene.add(bgAsteroid);

    // Layer 4: Distant Floating Body (Top-Right)
    const trAsteroidGeo = createAsteroidGeo(0.9, 1);
    const trAsteroid = new THREE.Mesh(trAsteroidGeo, rockMaterial);
    trAsteroid.position.set(6.5, 3.8, -2.5);
    scene.add(trAsteroid);

    // ── 7. ACTIVE SIMULATION GLIDER / ORBITAL SATELLITE BODY ──
    const simGroup = new THREE.Group();
    scene.add(simGroup);

    // Central faceted test cell
    const coreGeo = new THREE.OctahedronGeometry(0.75, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x1d4838,
      emissive: 0x0c3d2e,
      roughness: 0.25,
      metalness: 0.85,
      flatShading: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    simGroup.add(coreMesh);

    // Sensor perimeter ring
    const ringGeo = new THREE.TorusGeometry(1.05, 0.04, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x4b8f8c });
    const sensorRing = new THREE.Mesh(ringGeo, ringMat);
    sensorRing.rotation.x = Math.PI * 0.5;
    simGroup.add(sensorRing);

    // Dynamic Force Vector Arrow F (Warm Ochre)
    const forceArrowGroup = new THREE.Group();
    simGroup.add(forceArrowGroup);

    const fShaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8);
    const fMat = new THREE.MeshBasicMaterial({ color: 0xba8230 });
    const fShaft = new THREE.Mesh(fShaftGeo, fMat);
    fShaft.position.set(0, 0.6, 0);
    forceArrowGroup.add(fShaft);

    const fConeGeo = new THREE.ConeGeometry(0.12, 0.35, 8);
    const fCone = new THREE.Mesh(fConeGeo, fMat);
    fCone.position.set(0, 1.35, 0);
    forceArrowGroup.add(fCone);

    // Dynamic Velocity Vector Arrow v (Phosphor Sage)
    const velArrowGroup = new THREE.Group();
    simGroup.add(velArrowGroup);

    const vShaftGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.0, 8);
    const vMat = new THREE.MeshBasicMaterial({ color: 0x4b8f8c });
    const vShaft = new THREE.Mesh(vShaftGeo, vMat);
    vShaft.position.set(0, 0.5, 0);
    velArrowGroup.add(vShaft);

    const vConeGeo = new THREE.ConeGeometry(0.11, 0.3, 8);
    const vCone = new THREE.Mesh(vConeGeo, vMat);
    vCone.position.set(0, 1.15, 0);
    velArrowGroup.add(vCone);

    velArrowGroup.rotation.z = -Math.PI * 0.5;
    forceArrowGroup.rotation.z = -Math.PI * 0.35;

    // Initial position on trajectory (at curve t = 0.16)
    const initialPos = trajectoryCurve.getPointAt(0.16);
    simGroup.position.copy(initialPos);
    simLight.position.copy(initialPos);

    // ── 8. MOUSE & POINTER PARALLAX ──
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePos.current.targetX = normX;
      mousePos.current.targetY = normY;
    };
    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    // ── 9. RESIZE HANDLING ──
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 760;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // ── 10. ANIMATION TICK & RENDER LOOP (60 FPS GPU) ──
    let animId: number;
    let clock = new THREE.Clock();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      animId = requestAnimationFrame(render);
      const delta = clock.getDelta();

      // Smooth mouse parallax interpolation
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;

      const px = mousePos.current.x;
      const py = mousePos.current.y;

      if (!reducedMotion) {
        // Foreground asteroid: strong parallax displacement + gentle tumble
        fgAsteroid.position.x = -7.8 + px * 1.4;
        fgAsteroid.position.y = -3.8 + py * 1.1;
        fgAsteroid.rotation.x += delta * 0.12;
        fgAsteroid.rotation.y += delta * 0.15;

        // Midground asteroid
        mgAsteroid.position.x = 7.8 + px * 0.6;
        mgAsteroid.position.y = -0.6 + py * 0.5;
        mgAsteroid.rotation.x -= delta * 0.1;
        mgAsteroid.rotation.z += delta * 0.13;

        // Background asteroids
        bgAsteroid.position.x = -6.2 + px * 0.25;
        bgAsteroid.position.y = 4.0 + py * 0.2;
        bgAsteroid.rotation.y += delta * 0.07;

        trAsteroid.position.x = 6.5 + px * 0.2;
        trAsteroid.position.y = 3.8 + py * 0.18;
        trAsteroid.rotation.z += delta * 0.06;

        // Satellite rotation
        coreMesh.rotation.y += delta * 0.35;
        coreMesh.rotation.x += delta * 0.18;
        sensorRing.rotation.z += delta * 0.55;

        // Camera gentle drift
        camera.position.x = px * 0.45;
        camera.position.y = 0.5 + py * 0.3;
        camera.lookAt(0, 0, 0);
      }

      // Update force arrow scale based on active state
      const fScale = Math.max(0.6, force / 40);
      forceArrowGroup.scale.set(1, fScale, 1);

      renderer.render(scene, camera);
    };

    render();

    // ── 11. ANIME.JS KINETICS LAUNCH TRIGGER (F = m · a) ──
    launchRef.current = (computedAccel: number) => {
      const launchObj = { t: 0.16, vel: 0 };
      const maxVelocity = Math.sqrt(2 * computedAccel * 10);
      const duration = Math.max(1400, Math.min(2800, 3400 / Math.sqrt(computedAccel)));

      animate(launchObj, {
        t: 0.94,
        vel: maxVelocity,
        duration,
        ease: 'inQuad',
        onUpdate: () => {
          const point = trajectoryCurve.getPointAt(launchObj.t);
          simGroup.position.copy(point);
          simLight.position.copy(point);

          // Align velocity vector with curve tangent & scale dynamically
          const vScale = Math.max(0.2, (launchObj.vel / maxVelocity) * 2.2);
          velArrowGroup.scale.set(1, vScale, 1);

          setTelemetry({
            accel: computedAccel,
            vel: launchObj.vel,
            dist: launchObj.t * 10,
            time: Math.sqrt((2 * launchObj.t * 10) / computedAccel),
          });
        },
        onComplete: () => {
          setTimeout(() => {
            animate(launchObj, {
              t: 0.16,
              duration: 800,
              ease: 'outQuad',
              onUpdate: () => {
                const point = trajectoryCurve.getPointAt(launchObj.t);
                simGroup.position.copy(point);
                simLight.position.copy(point);
                velArrowGroup.scale.set(1, 0.4, 1);
                setTelemetry({
                  accel: computedAccel,
                  vel: 0,
                  dist: 0,
                  time: 0,
                });
              },
              onComplete: () => {
                setIsSimRunning(false);
              },
            });
          }, 700);
        },
      });
    };

    // ── CLEANUP ON UNMOUNT ──
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      horizonGeo.dispose();
      horizonMat.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
      tubeGeo.dispose();
      tubeMat.dispose();
      fluxGeo.dispose();
      fluxMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      fgAsteroidGeo.dispose();
      mgAsteroidGeo.dispose();
      bgAsteroidGeo.dispose();
      trAsteroidGeo.dispose();
      rockMaterial.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    };
  }, [force]);

  return (
    <section
      ref={mountRef}
      className="relative w-full min-h-[660px] sm:min-h-[720px] lg:min-h-[780px] overflow-hidden bg-[#0C0E12] border-b border-[#222733] flex flex-col justify-between select-none"
    >
      {/* Layer A, B, C: Hardware-accelerated 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-grab active:cursor-grabbing z-0"
        aria-label="Simulasi Kinematika Orbital 3D GEN LABS"
      />

      {/* Hairline Orthogonal Graticule Overlay (Zero AI Dot Matrix) */}
      <svg
        viewBox="0 0 1200 800"
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20 z-[1]"
        preserveAspectRatio="none"
      >
        <line x1="200" y1="0" x2="200" y2="800" stroke="#222733" strokeWidth="0.8" strokeDasharray="4 4" />
        <line x1="600" y1="0" x2="600" y2="800" stroke="#222733" strokeWidth="0.8" strokeDasharray="4 4" />
        <line x1="1000" y1="0" x2="1000" y2="800" stroke="#222733" strokeWidth="0.8" strokeDasharray="4 4" />
        <line x1="0" y1="400" x2="1200" y2="400" stroke="#222733" strokeWidth="0.8" strokeDasharray="4 4" />
      </svg>

      {/* Layer D: Typography, Concept Search & Quick Navigation */}
      <div className="relative z-10 max-w-[1000px] mx-auto px-4 sm:px-6 md:px-8 pt-10 sm:pt-14 md:pt-16 text-center space-y-4 pointer-events-auto">
        <div className="font-mono text-[11px] sm:text-xs text-[#4B8F8C] uppercase tracking-wider font-semibold">
          Laboratorium Komputasi & Pembelajaran Sains Interaktif
        </div>

        <h1 className="font-heading text-4xl sm:text-5xl md:text-[56px] font-extrabold tracking-tight text-[#F1F5F9] leading-[1.08] max-w-3xl mx-auto">
          Belajar sains & matematika <br className="hidden sm:inline" />
          dengan <span className="text-[#BA8230]">mencoba</span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-[#94A3B8] font-sans leading-relaxed max-w-xl mx-auto">
          Platform simulasi interaktif untuk membuktikan hukum fisika dan matematika lewat manipulasi variabel secara langsung pada 60 FPS.
        </p>

        {/* Concept Search Input Bar (PRD §14 & §15) */}
        <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto w-full pt-1">
          <div className="flex items-center gap-2 p-1.5 rounded-xl border border-[#222733] bg-[#14171E]/90 backdrop-blur-md focus-within:border-[#4B8F8C] transition-colors shadow-lg">
            <IconSearch size={15} className="text-[#4B8F8C] ml-2 shrink-0" />
            <input
              id="hero-search"
              type="text"
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              placeholder="Cari konsep (misal: Hukum Newton, Parabola)..."
              className="w-full bg-transparent border-none text-[#F1F5F9] placeholder-[#94A3B8]/60 text-xs font-mono focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#1C332A] hover:bg-[#245544] text-[#F1F5F9] border border-[#4B8F8C] text-xs font-heading font-semibold shrink-0 transition-colors cursor-pointer"
            >
              Mulai
            </button>
          </div>
        </form>

        {/* Validated Topic Quick Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 font-mono text-xs">
          <span className="text-[#94A3B8] text-[11px]">Topik Unggulan:</span>
          {[
            { label: 'Hukum II Newton', path: '/simulation/newtons-second-law' },
            { label: 'Fungsi Kuadrat', path: '/simulation/function-explorer' },
            { label: 'Keseimbangan Pasar', path: '/simulation/supply-demand' },
            { label: 'Sorting Algorithm', path: '/simulation/sorting-algorithms' },
          ].map((chip) => (
            <Link
              key={chip.label}
              href={chip.path}
              className="px-2.5 py-1 rounded-md border border-[#222733] hover:border-[#4B8F8C] bg-[#14171E]/80 backdrop-blur-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors cursor-pointer"
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Layer D (Bottom): Scientific Telemetry & Interactive Variable Control Dock */}
      <div className="relative z-10 w-full max-w-[1000px] mx-auto px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 pointer-events-auto">
        <div className="p-3 sm:p-4 rounded-2xl bg-[#14171E]/95 backdrop-blur-md border border-[#222733] shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
          {/* Parameter Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[#94A3B8] text-[11px] font-semibold">Gaya F:</span>
              <div className="flex gap-1">
                {[20, 40, 80].map((fVal) => (
                  <button
                    key={fVal}
                    type="button"
                    onClick={() => setForce(fVal)}
                    disabled={isSimRunning}
                    className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                      force === fVal
                        ? 'bg-[#BA8230]/25 text-[#BA8230] border border-[#BA8230] font-bold'
                        : 'border border-[#222733] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#4B8F8C]'
                    }`}
                  >
                    {fVal}N
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#94A3B8] text-[11px] font-semibold">Massa m:</span>
              <div className="flex gap-1">
                {[2, 4, 8].map((mVal) => (
                  <button
                    key={mVal}
                    type="button"
                    onClick={() => setMass(mVal)}
                    disabled={isSimRunning}
                    className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                      mass === mVal
                        ? 'bg-[#4B8F8C]/25 text-[#4B8F8C] border border-[#4B8F8C] font-bold'
                        : 'border border-[#222733] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#4B8F8C]'
                    }`}
                  >
                    {mVal}kg
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mathematical Readout & Dynamic Telemetry */}
          <div className="flex items-center gap-3 sm:gap-5 text-[11px]">
            <div className="hidden sm:block px-2.5 py-1 rounded-lg bg-[#0C0E12] border border-[#222733] text-[#BA8230] font-bold">
              F = m × a ⟹ a = {accel.toFixed(1)} m/s²
            </div>
            <div className="flex items-center gap-3 text-[#94A3B8]">
              <span>v: <strong className="text-[#4B8F8C] tabular-nums font-mono">{telemetry.vel.toFixed(1)} m/s</strong></span>
              <span>s: <strong className="text-[#F1F5F9] tabular-nums font-mono">{telemetry.dist.toFixed(1)} m</strong></span>
            </div>
          </div>

          {/* Launch Trigger Button */}
          <button
            type="button"
            onClick={handleLaunch}
            disabled={isSimRunning}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1C332A] hover:bg-[#245544] border border-[#4B8F8C] text-[#F1F5F9] text-xs font-heading font-bold transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50 min-h-[40px]"
          >
            <IconPlay size={13} className="text-[#BA8230]" />
            <span>{isSimRunning ? 'Mengakselerasi...' : 'Luncurkan Objek'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
