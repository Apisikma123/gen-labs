'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  IconMessageSquare,
  IconBot,
  IconCheckCircle,
  IconAiTutor,
  IconSparkles,
  Icon3dAiCore,
} from '@/components/icons';
import { GenLabsAiApparatusGraphic } from '@/components/illustrations';

interface TutorCase {
  studentQuestion: string;
  experimentState: string;
  tutorReply: string;
  promptQuestion: string;
}

const CASES: TutorCase[] = [
  {
    studentQuestion: 'Kenapa waktu dorongannya aku naikkan jadi 60 N, lajunya jadi jauh lebih cepat (12 m/s²)?',
    experimentState: 'Dorongan: 60 N / Beban: 5 kg / Percepatan: 12 m/s²',
    tutorReply:
      'Perhatikan perbandingannya: 60 dibagi 5 hasilnya tepat 12! Karena beban balok tetap 5 kg, setiap kali dorongan diperbesar, percepatannya ikut naik dengan kelipatan yang sama persis.',
    promptQuestion: 'Sekarang coba tebak: kalau bebannya kita buat 2 kali lebih berat (10 kg) dengan dorongan yang sama, apa yang akan terjadi?',
  },
  {
    studentQuestion: 'Apa yang terjadi kalau beban balok diperberat tapi dorongannya tetap 40 N?',
    experimentState: 'Dorongan: 40 N / Beban: 8 kg / Percepatan: 5 m/s²',
    tutorReply:
      'Karena beban bertindak sebagai pembagi (percepatan = dorongan / beban), semakin berat beban, gerakannya akan semakin lambat. Menaikkan beban dari 4 kg ke 8 kg (dua kali lipat) membuat percepatannya berkurang tepat menjadi separuhnya: dari 10 m/s² jadi 5 m/s².',
    promptQuestion: 'Coba buktikan langsung di slider beban di atas!',
  },
  {
    studentQuestion: 'Kenapa harga tiket atau barang bisa naik waktu musim liburan?',
    experimentState: 'Minat Pembeli: +50% / Harga Kesepakatan: Rp65.000',
    tutorReply:
      'Saat liburan, orang yang ingin membeli meningkat drastis sementara jumlah barang yang tersedia tetap sama. Pembeli bersaing untuk mendapatkan barang tersebut, sehingga penjual dan pembeli sepakat pada titik harga baru yang lebih tinggi.',
    promptQuestion: 'Geser minat pembeli kembali ke normal dan lihat apakah harganya turun!',
  },
];

export function AiTutorShowcaseSection() {
  const [selectedCase, setSelectedCase] = useState<number>(0);
  const activeCase = CASES[selectedCase];

  return (
    <section
      id="ai-tutor"
      className="relative w-full py-16 sm:py-24 px-4 sm:px-6 md:px-8 border-b border-[var(--color-border)] bg-[var(--color-bg)] transition-colors select-none"
    >
      <div className="max-w-[1160px] mx-auto text-left">
        {/* Section Header */}
        <div className="max-w-2xl mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] font-mono text-xs text-[var(--color-secondary)] font-bold uppercase tracking-wider mb-3">
            <IconSparkles size={14} className="shrink-0" />
            <span>Pendamping Belajar</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--color-text)] leading-tight">
            AI Tutor yang Memahami Angka Percobaanmu
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed font-sans">
            Bukan sekadar chatbot yang memberi jawaban teks panjang. AI Tutor GEN LABS melihat angka yang kamu atur di simulator, lalu membimbingmu menarik kesimpulan sendiri.
          </p>
        </div>

        {/* ── GROUNDED GEN LABS AI DIALOGUE STAGE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left: Example Questions Picker (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-sans font-semibold text-[var(--color-text-secondary)] block uppercase tracking-wider">
              Pilih Contoh Pertanyaan Pelajar:
            </span>

            <div className="space-y-2.5">
              {CASES.map((item, idx) => {
                const isSelected = selectedCase === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedCase(idx)}
                    className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-sans transition-all cursor-pointer min-h-[44px] flex items-start gap-3 ${
                      isSelected
                        ? 'border-[var(--color-secondary)] bg-[var(--color-surface)] text-[var(--color-text)] font-semibold shadow-xs'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)]/60 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                    }`}
                  >
                    <IconMessageSquare
                      size={16}
                      className={`shrink-0 mt-0.5 ${
                        isSelected ? 'text-[var(--color-secondary)]' : 'text-[var(--color-text-tertiary)]'
                      }`}
                    />
                    <span>"{item.studentQuestion}"</span>
                  </button>
                );
              })}
            </div>

            {/* GEN LABS AI Apparatus Telemetry Card */}
            <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--color-border)] text-[11px] font-mono text-[var(--color-secondary)]">
                <span>SPEKTROMETRI PENALARAN</span>
                <span className="text-[10px] text-[var(--color-text-secondary)]">v2.4 // EMPIRIS</span>
              </div>
              <div className="w-full h-28 sm:h-32 rounded-lg bg-[#0C0E12] border border-[var(--color-border)] overflow-hidden flex items-center justify-center">
                <GenLabsAiApparatusGraphic variant="hero" />
              </div>
            </div>
          </div>

          {/* Right: Live Interactive Grounded Dialogue Box (7 Cols) */}
          <div className="lg:col-span-7 p-6 sm:p-7 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs space-y-4">
            {/* Live Experiment Indicator Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-[var(--color-border)] text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[var(--color-secondary)]">
                  {activeCase.experimentState}
                </span>
              </div>
              <span className="font-sans text-[11px] text-[var(--color-text-secondary)]">
                Terhubung ke Simulator
              </span>
            </div>

            {/* Student's Query */}
            <div className="space-y-1">
              <span className="text-[11px] font-sans font-semibold text-[var(--color-text-secondary)] uppercase">
                Pertanyaanmu:
              </span>
              <p className="font-heading font-bold text-sm sm:text-base text-[var(--color-text)]">
                "{activeCase.studentQuestion}"
              </p>
            </div>

            {/* AI Tutor GEN LABS AI Response */}
            <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs font-sans font-bold text-[var(--color-secondary)]">
                <Icon3dAiCore size={26} className="shrink-0" />
                <span>Bimbingan AI Tutor</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--color-text)] leading-relaxed font-sans">
                {activeCase.tutorReply}
              </p>
              <div className="pt-2 border-t border-[var(--color-border)] text-xs font-sans font-medium text-[var(--color-primary)] dark:text-[#F1F5F9] flex items-center gap-1.5">
                <span className="text-[#BA8230] font-bold">Tantangan:</span>
                <span>{activeCase.promptQuestion}</span>
              </div>
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between pt-1 text-xs font-sans text-[var(--color-text-secondary)]">
              <span>Metode: Belajar dengan Mengamati</span>
              <Link
                href="/tanya-ai"
                className="font-semibold text-[var(--color-secondary)] hover:underline flex items-center gap-1 min-h-[40px]"
              >
                <span>Coba di Laboratorium →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
