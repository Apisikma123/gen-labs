'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function AnimejsExplodedToolbox() {
  const [activeFeature, setActiveFeature] = useState<number>(0);

  const features = [
    { id: 0, label: '01. BEBAS HAMBATAN 60 FPS', side: 'right', desc: 'Simulasi mulus tanpa patah di semua tipe HP, memanfaatkan akselerasi GPU murni.' },
    { id: 1, label: '02. VEKTOR GAYA & KECEPATAN NYATA', side: 'right', desc: 'Arah dan panjang anak panah gaya F dan kecepatan v otomatis terhitung secara presisi.' },
    { id: 2, label: '03. TANYA AI LABORATORIUM', side: 'right', desc: 'Bimbingan berbasis dialog terarah yang memantik pemahaman mandiri tanpa membocorkan kunci jawaban.' },
    { id: 3, label: '04. GRAFIK SINKRON (v vs t)', side: 'left', desc: 'Grafik hubungan kecepatan dan waktu terbentuk seketika seiring gerak benda berlangsung.' },
    { id: 4, label: '05. KURIKULUM SAINS TERAPAN', side: 'left', desc: 'Materi terstruktur selaras standar kurikulum sains komputasi dan vokasi terapan.' },
    { id: 5, label: '06. RINGAN TANPA INSTALASI', side: 'left', desc: 'Buka langsung di Google Chrome, Safari, atau Firefox tanpa perlu unduh aplikasi berat.' },
  ];

  return (
    <section
      id="cara-belajar"
      className="relative w-full py-16 sm:py-24 border-b border-[#222733] bg-[#0C0E12] overflow-hidden select-none"
    >
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column (5 Cols): Editorial Stacked Title */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <div className="inline-block px-3 py-1 rounded-md bg-[#14171E] border border-[#222733] text-[#4B8F8C] font-mono text-[11px] font-bold tracking-wider uppercase">
              Alur Eksplorasi Mandiri
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#F1F5F9] leading-[1.15]">
              Alat lengkap<br />
              laboratorium<br />
              virtual
            </h2>

            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed font-sans max-w-md">
              Lepas dari batasan hafalan rumus di papan tulis. Eksplorasi konsep sains dan matematika langsung dari perambanmu dengan presisi tinggi.
            </p>

            {/* Feature detail highlight box */}
            <div className="pt-2">
              <div className="p-4 rounded-xl border border-[#222733] bg-[#14171E]/80 text-xs font-sans">
                <span className="text-[#4B8F8C] font-mono font-bold block mb-1">
                  {features[activeFeature].label}
                </span>
                <p className="text-[#F1F5F9]/90 leading-relaxed">
                  {features[activeFeature].desc}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold text-[#F1F5F9] bg-[#14171E] border border-[#222733] hover:border-[#4B8F8C] transition-colors"
              >
                <span>LIHAT SEMUA MODUL</span>
                <span className="text-[#BA8230]">→</span>
              </Link>
            </div>
          </div>

          {/* Center / Right Column (7 Cols): Exploded Schematic Vector Apparatus */}
          <div className="lg:col-span-7 relative w-full flex flex-col items-center justify-center">
            {/* The Exploded Schematic SVG Diagram */}
            <div className="relative w-full max-w-[500px] h-[340px] sm:h-[400px]">
              <svg
                viewBox="0 0 500 400"
                className="w-full h-full overflow-visible"
              >
                {/* ── ISOMETRIC EXPLODED APPARATUS ── */}
                {/* Stage 1: Front Focusing Lens Collimator */}
                <g transform="translate(140, 110) rotate(-35)" className="transition-transform duration-300">
                  <ellipse cx="60" cy="50" rx="35" ry="50" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
                  <ellipse cx="68" cy="50" rx="32" ry="46" fill="none" stroke="#4B8F8C" strokeWidth="1.5" />
                  <ellipse cx="80" cy="50" rx="28" ry="40" fill="#14171E" stroke="#BA8230" strokeWidth="1.5" />
                </g>

                {/* Stage 2: Central Cylindrical Chamber (With Sensor Fins) */}
                <g transform="translate(200, 170) rotate(-35)">
                  {/* Outer Cylinder Body */}
                  <rect x="20" y="25" width="80" height="50" rx="6" fill="#14171E" stroke="#4B8F8C" strokeWidth="1.5" />
                  {/* Sensor Ribs */}
                  <line x1="35" y1="25" x2="35" y2="75" stroke="#222733" strokeWidth="2" />
                  <line x1="50" y1="25" x2="50" y2="75" stroke="#222733" strokeWidth="2" />
                  <line x1="65" y1="25" x2="65" y2="75" stroke="#222733" strokeWidth="2" />
                  <line x1="80" y1="25" x2="80" y2="75" stroke="#222733" strokeWidth="2" />
                  {/* Glowing Core Aperture */}
                  <circle cx="60" cy="50" r="14" fill="#0C0E12" stroke="#BA8230" strokeWidth="2" />
                  <circle cx="60" cy="50" r="6" fill="#BA8230" />
                </g>

                {/* Stage 3: Rear Magnet Coil & Acceleration Base */}
                <g transform="translate(280, 240) rotate(-35)">
                  <ellipse cx="40" cy="50" rx="30" ry="45" fill="none" stroke="#4B8F8C" strokeWidth="1.5" />
                  <ellipse cx="55" cy="50" rx="32" ry="48" fill="#14171E" stroke="#94A3B8" strokeWidth="1.5" />
                  <ellipse cx="70" cy="50" rx="35" ry="52" fill="none" stroke="#222733" strokeWidth="1.5" />
                </g>

                {/* ── CALLOUT LEADER LINES & LABELS (MATCHING ANIMEJS TOOLBOX) ── */}
                {/* Leader 0: 60 FPS (Top Right) */}
                <g onClick={() => setActiveFeature(0)} className="cursor-pointer group">
                  <polyline points="230,120 340,70 480,70" fill="none" stroke={activeFeature === 0 ? "#BA8230" : "#4B8F8C"} strokeWidth="1.2" strokeDasharray="3 2" />
                  <circle cx="230" cy="120" r="3" fill="#BA8230" />
                  <text x="480" y="65" fill={activeFeature === 0 ? "#BA8230" : "#94A3B8"} fontSize="9" fontFamily="Space Mono, monospace" textAnchor="end" className="font-bold">
                    waapi / 60 FPS
                  </text>
                </g>

                {/* Leader 1: Vektor Gaya (Mid Right) */}
                <g onClick={() => setActiveFeature(1)} className="cursor-pointer group">
                  <polyline points="270,180 360,130 480,130" fill="none" stroke={activeFeature === 1 ? "#BA8230" : "#4B8F8C"} strokeWidth="1.2" strokeDasharray="3 2" />
                  <circle cx="270" cy="180" r="3" fill="#4B8F8C" />
                  <text x="480" y="125" fill={activeFeature === 1 ? "#BA8230" : "#94A3B8"} fontSize="9" fontFamily="Space Mono, monospace" textAnchor="end" className="font-bold">
                    vektor gaya F & v
                  </text>
                </g>

                {/* Leader 2: AI Tutor (Low Right) */}
                <g onClick={() => setActiveFeature(2)} className="cursor-pointer group">
                  <polyline points="340,240 400,190 480,190" fill="none" stroke={activeFeature === 2 ? "#BA8230" : "#4B8F8C"} strokeWidth="1.2" strokeDasharray="3 2" />
                  <circle cx="340" cy="240" r="3" fill="#4B8F8C" />
                  <text x="480" y="185" fill={activeFeature === 2 ? "#BA8230" : "#94A3B8"} fontSize="9" fontFamily="Space Mono, monospace" textAnchor="end" className="font-bold">
                    tanya ai
                  </text>
                </g>

                {/* Leader 3: Grafik (Mid Left) */}
                <g onClick={() => setActiveFeature(3)} className="cursor-pointer group">
                  <polyline points="190,200 120,290 20,290" fill="none" stroke={activeFeature === 3 ? "#BA8230" : "#4B8F8C"} strokeWidth="1.2" strokeDasharray="3 2" />
                  <circle cx="190" cy="200" r="3" fill="#BA8230" />
                  <text x="20" y="285" fill={activeFeature === 3 ? "#BA8230" : "#94A3B8"} fontSize="9" fontFamily="Space Mono, monospace" textAnchor="start" className="font-bold">
                    grafik v vs t
                  </text>
                </g>

                {/* Leader 4: Kurikulum (Low Left) */}
                <g onClick={() => setActiveFeature(4)} className="cursor-pointer group">
                  <polyline points="280,280 200,340 20,340" fill="none" stroke={activeFeature === 4 ? "#BA8230" : "#4B8F8C"} strokeWidth="1.2" strokeDasharray="3 2" />
                  <circle cx="280" cy="280" r="3" fill="#4B8F8C" />
                  <text x="20" y="335" fill={activeFeature === 4 ? "#BA8230" : "#94A3B8"} fontSize="9" fontFamily="Space Mono, monospace" textAnchor="start" className="font-bold">
                    kurikulum vokasi stem
                  </text>
                </g>

                {/* Leader 5: Mobile (Top Left) */}
                <g onClick={() => setActiveFeature(5)} className="cursor-pointer group">
                  <polyline points="150,150 90,90 20,90" fill="none" stroke={activeFeature === 5 ? "#BA8230" : "#4B8F8C"} strokeWidth="1.2" strokeDasharray="3 2" />
                  <circle cx="150" cy="150" r="3" fill="#4B8F8C" />
                  <text x="20" y="85" fill={activeFeature === 5 ? "#BA8230" : "#94A3B8"} fontSize="9" fontFamily="Space Mono, monospace" textAnchor="start" className="font-bold">
                    lancar di mobile
                  </text>
                </g>
              </svg>
            </div>

            {/* ── TIMELINE SCRUBBER PILL (BOTTOM RIGHT LIKE ANIMEJS TOOLBOX) ── */}
            <div className="w-full flex items-center justify-end mt-4">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#222733] bg-[#14171E]/90 backdrop-blur-sm text-[10px] font-mono">
                <span className="text-[#94A3B8] text-[10px] mr-1">MODUL:</span>
                {Array.from({ length: 24 }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`inline-block w-[1.5px] rounded-full transition-all ${
                      idx === activeFeature * 4
                        ? 'h-3.5 bg-[#FF4757] shadow-[0_0_6px_#FF4757]'
                        : idx % 4 === 0
                        ? 'h-2.5 bg-[#4B8F8C]'
                        : 'h-1.5 bg-[#222733]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
