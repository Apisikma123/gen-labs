'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { newtonsSecondLaw, functionExplorer, supplyDemand } from '@genlab/simulation-core';

export type DisciplineTab = 'fisika' | 'matematika' | 'informatika' | 'ekonomi';

export function AnimejsSplitStage() {
  const [activeTab, setActiveTab] = useState<DisciplineTab>('fisika');

  // Interactive local states for each discipline
  const [fForce, setFForce] = useState<number>(50);
  const [fMass, setFMass] = useState<number>(5);

  const [mCoeffA, setMCoeffA] = useState<number>(1);
  const [mCoeffC, setMCoeffC] = useState<number>(-4);

  const [eTax, setETax] = useState<number>(0);

  // Compute live physics
  const fSim = newtonsSecondLaw.compute({ mass: fMass, force: fForce, friction: 0 });
  const fAccel = Number(fSim.acceleration);

  // Compute live math parabola
  const mSim = functionExplorer.compute({ a: mCoeffA, b: 0, c: mCoeffC, xMin: -5, xMax: 5 });

  // Compute live economics
  const eSim = supplyDemand.compute({
    demandIntercept: 100,
    demandSlope: 2,
    supplyIntercept: 20,
    supplySlope: 2,
    tax: eTax,
  });

  return (
    <section
      id="eksplorasi-modul"
      className="relative w-full py-16 sm:py-24 border-b border-[#222733] bg-[#0C0E12] select-none"
    >
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (5 Cols): Anime.js Intuitive API Style Content */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#FF4757] leading-[1.15]">
              Eksplorasi Konsep
            </h2>

            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed font-sans max-w-md">
              Buktikan teori di buku cetak secara langsung. Ubah variabel sesukamu dan amati bagaimana hukum alam merespons seketika.
            </p>

            <div className="w-full h-px bg-[#222733]" />

            {/* Monospaced Arrow Checklist (Exact Anime.js style) */}
            <div className="space-y-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('fisika')}
                className={`w-full text-left flex items-center gap-2 transition-colors cursor-pointer min-h-[36px] ${
                  activeTab === 'fisika' ? 'text-[#FF4757] font-bold' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                <span className="text-[#FF4757]">→</span>
                <span>01 FISIKA: HUKUM NEWTON (F = m × a)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('matematika')}
                className={`w-full text-left flex items-center gap-2 transition-colors cursor-pointer min-h-[36px] ${
                  activeTab === 'matematika' ? 'text-[#BA8230] font-bold' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                <span className="text-[#BA8230]">→</span>
                <span>02 MATEMATIKA: FUNGSI KUADRAT PARABOLA</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('informatika')}
                className={`w-full text-left flex items-center gap-2 transition-colors cursor-pointer min-h-[36px] ${
                  activeTab === 'informatika' ? 'text-[#4B8F8C] font-bold' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                <span className="text-[#4B8F8C]">→</span>
                <span>03 INFORMATIKA: VISUALISASI ALGORITMA</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ekonomi')}
                className={`w-full text-left flex items-center gap-2 transition-colors cursor-pointer min-h-[36px] ${
                  activeTab === 'ekonomi' ? 'text-[#3B82F6] font-bold' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                <span className="text-[#3B82F6]">→</span>
                <span>04 EKONOMI: KESEIMBANGAN HARGA PASAR</span>
              </button>
            </div>

            {/* Quick Interactive Slider for Active Discipline */}
            <div className="pt-2 p-3.5 rounded-xl border border-[#222733] bg-[#14171E] text-xs font-mono space-y-2">
              {activeTab === 'fisika' && (
                <div>
                  <div className="flex justify-between text-[#94A3B8] mb-1">
                    <span>Dorongan Gaya (F):</span>
                    <span className="font-bold text-[#FF4757]">{fForce} N</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={fForce}
                    onChange={(e) => setFForce(Number(e.target.value))}
                    className="w-full accent-[#FF4757] cursor-pointer min-h-[32px]"
                  />
                </div>
              )}

              {activeTab === 'matematika' && (
                <div>
                  <div className="flex justify-between text-[#94A3B8] mb-1">
                    <span>Lebar Parabola (a):</span>
                    <span className="font-bold text-[#BA8230]">{mCoeffA}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.5"
                    value={mCoeffA}
                    onChange={(e) => setMCoeffA(Number(e.target.value))}
                    className="w-full accent-[#BA8230] cursor-pointer min-h-[32px]"
                  />
                </div>
              )}

              {activeTab === 'informatika' && (
                <div className="text-center text-[#94A3B8] text-[11px] py-1">
                  Urutan angka otomatis teranimasi dengan efisiensi perbandingan langkah.
                </div>
              )}

              {activeTab === 'ekonomi' && (
                <div>
                  <div className="flex justify-between text-[#94A3B8] mb-1">
                    <span>Pajak Pasar:</span>
                    <span className="font-bold text-[#3B82F6]">Rp {eTax}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="5"
                    value={eTax}
                    onChange={(e) => setETax(Number(e.target.value))}
                    className="w-full accent-[#3B82F6] cursor-pointer min-h-[32px]"
                  />
                </div>
              )}
            </div>

            <div>
              <Link
                href={`/simulation/${
                  activeTab === 'fisika'
                    ? 'newtons-second-law'
                    : activeTab === 'matematika'
                    ? 'function-explorer'
                    : activeTab === 'informatika'
                    ? 'sorting-algorithms'
                    : 'supply-demand'
                }`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold text-[#F1F5F9] bg-[#1C332A] border border-[#4B8F8C] hover:bg-[#245544] transition-colors"
              >
                <span>BUKA SIMULATOR PENUH</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Center & Right Column (7 Cols): The Circular Visual Stage + Formula Readout */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* The Visual Circle Stage */}
            <div className="relative w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] md:w-[400px] md:h-[400px] flex items-center justify-center">
              <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible pointer-events-none">
                {/* Outer Rotating Track */}
                <circle
                  cx="200"
                  cy="200"
                  r="180"
                  fill="none"
                  stroke="#222733"
                  strokeWidth="1.5"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="150"
                  fill="#0C0E12"
                  stroke="#222733"
                  strokeWidth="1"
                />

                {/* Glowing Active Ring Arc */}
                <path
                  d="M 120 45 A 175 175 0 0 1 280 45"
                  fill="none"
                  stroke={
                    activeTab === 'fisika'
                      ? '#FF4757'
                      : activeTab === 'matematika'
                      ? '#BA8230'
                      : activeTab === 'informatika'
                      ? '#4B8F8C'
                      : '#3B82F6'
                  }
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Concentric grid lines */}
                <line x1="80" y1="200" x2="320" y2="200" stroke="#222733" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="200" y1="80" x2="200" y2="320" stroke="#222733" strokeWidth="1" strokeDasharray="3 3" />

                {/* ── CONCEPT VISUALIZATION INSIDE CIRCLE ── */}
                {activeTab === 'fisika' && (
                  <g>
                    {/* Linear Rail */}
                    <line x1="120" y1="200" x2="280" y2="200" stroke="#222733" strokeWidth="3" strokeLinecap="round" />
                    {/* Dynamic Glider */}
                    <rect x="150" y="186" width="30" height="20" rx="5" fill="#1C332A" stroke="#4B8F8C" strokeWidth="1.5" />
                    <text x="165" y="199" fill="#F1F5F9" fontSize="8" fontFamily="Space Mono, monospace" fontWeight="bold" textAnchor="middle">
                      {fMass}kg
                    </text>
                    {/* Force Vector Arrow */}
                    <line x1="180" y1="193" x2={180 + Math.min(60, fForce * 0.7)} y2="193" stroke="#BA8230" strokeWidth="2" />
                    <polygon
                      points={`${180 + Math.min(60, fForce * 0.7)}, 190 ${180 + Math.min(60, fForce * 0.7) + 5}, 193 ${180 + Math.min(60, fForce * 0.7)}, 196`}
                      fill="#BA8230"
                    />
                    <text x="165" y="224" fill="#4B8F8C" fontSize="9" fontFamily="Space Mono, monospace" textAnchor="middle">
                      a = {fAccel} m/s²
                    </text>
                  </g>
                )}

                {activeTab === 'matematika' && (
                  <g>
                    {/* Parabola Curve y = a*x^2 + c */}
                    <path
                      d={`M 130 ${240 - mCoeffA * 20} Q 200 ${200 + mCoeffC * 8} 270 ${240 - mCoeffA * 20}`}
                      fill="none"
                      stroke="#BA8230"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {/* Vertex point */}
                    <circle cx="200" cy={200 + mCoeffC * 8} r="4" fill="#FF4757" />
                    <text x="200" y="240" fill="#F1F5F9" fontSize="9" fontFamily="Space Mono, monospace" textAnchor="middle">
                      f(x) = {mCoeffA}x² {mCoeffC >= 0 ? `+ ${mCoeffC}` : `- ${Math.abs(mCoeffC)}`}
                    </text>
                  </g>
                )}

                {activeTab === 'informatika' && (
                  <g transform="translate(130, 160)">
                    {/* Dynamic Sorting Bar Chart */}
                    {[45, 20, 60, 30, 75, 15].map((val, idx) => (
                      <g key={idx} transform={`translate(${idx * 24}, 0)`}>
                        <rect
                          x="0"
                          y={75 - val}
                          width="16"
                          height={val}
                          rx="3"
                          fill={idx === 2 || idx === 3 ? '#4B8F8C' : '#1C332A'}
                          stroke="#222733"
                          strokeWidth="1"
                        />
                        <text x="8" y="88" fill="#94A3B8" fontSize="7" fontFamily="Space Mono, monospace" textAnchor="middle">
                          {val}
                        </text>
                      </g>
                    ))}
                    <text x="70" y="105" fill="#4B8F8C" fontSize="9" fontFamily="Space Mono, monospace" textAnchor="middle">
                      Algoritma Urut O(n log n)
                    </text>
                  </g>
                )}

                {activeTab === 'ekonomi' && (
                  <g>
                    {/* Demand Curve (Downward sloping) */}
                    <line x1="130" y1="150" x2="270" y2="250" stroke="#FF4757" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Supply Curve (Upward sloping) */}
                    <line x1="130" y1="250" x2="270" y2="150" stroke="#4B8F8C" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Equilibrium intersection point */}
                    <circle cx="200" cy="200" r="4.5" fill="#BA8230" />
                    <text x="200" y="225" fill="#BA8230" fontSize="9" fontFamily="Space Mono, monospace" textAnchor="middle">
                      Harga Pasar: Rp {Math.round(Number(eSim.equilibriumPrice))}
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Code Box & Timeline Scrubber (Bottom-Right like Anime.js) */}
            <div className="w-full max-w-sm mt-3 space-y-2">
              <div className="p-3.5 rounded-xl border border-[#222733] bg-[#14171E] font-mono text-[11px] text-[#94A3B8]">
                {activeTab === 'fisika' && (
                  <>
                    <p className="text-[#FF4757]">{'// Hukum Kedua Newton'}</p>
                    <p className="text-[#F1F5F9]">{`dorongan = ${fForce}; // N`}</p>
                    <p className="text-[#F1F5F9]">{`beban = ${fMass}; // kg`}</p>
                    <p className="text-[#BA8230]">{`percepatan = dorongan / beban; // ${fAccel} m/s²`}</p>
                  </>
                )}
                {activeTab === 'matematika' && (
                  <>
                    <p className="text-[#BA8230]">{'// Persamaan Kuadrat Parabola'}</p>
                    <p className="text-[#F1F5F9]">{`f(x) = ${mCoeffA}x² ${mCoeffC >= 0 ? `+ ${mCoeffC}` : `- ${Math.abs(mCoeffC)}`};`}</p>
                    <p className="text-[#4B8F8C]">{`titik_puncak = (0, ${mCoeffC});`}</p>
                  </>
                )}
                {activeTab === 'informatika' && (
                  <>
                    <p className="text-[#4B8F8C]">{'// Visualisasi Urutan Angka'}</p>
                    <p className="text-[#F1F5F9]">{'array = [15, 20, 30, 45, 60, 75];'}</p>
                    <p className="text-[#BA8230]">{'status = "terurut_sempurna";'}</p>
                  </>
                )}
                {activeTab === 'ekonomi' && (
                  <>
                    <p className="text-[#3B82F6]">{'// Keseimbangan Pasar Permintaan & Penawaran'}</p>
                    <p className="text-[#F1F5F9]">{`harga_seimbang = Rp ${Math.round(Number(eSim.equilibriumPrice))};`}</p>
                    <p className="text-[#BA8230]">{`jumlah_seimbang = ${Math.round(Number(eSim.equilibriumQuantity))} unit;`}</p>
                  </>
                )}
              </div>

              {/* Signature Anime.js Timeline Scrubber Pill */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-full border border-[#222733] bg-[#14171E]/90 backdrop-blur-sm text-[10px] font-mono">
                <span className="text-[#94A3B8] text-[10px]">SCRUBBER</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 24 }).map((_, idx) => (
                    <span
                      key={idx}
                      className={`inline-block w-[1.5px] rounded-full ${
                        idx === 10
                          ? 'h-3.5 bg-[#FF4757] shadow-[0_0_6px_#FF4757]'
                          : idx % 4 === 0
                          ? 'h-2.5 bg-[#4B8F8C]'
                          : 'h-1.5 bg-[#222733]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[#F1F5F9] font-bold">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
