'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  IconBot,
  IconArrowRight,
} from '@/components/icons';

export function AnimejsTutorStage() {
  const [selectedPrompt, setSelectedPrompt] = useState<number>(0);

  const dialogs = [
    {
      q: 'Kenapa saat beban bertambah dari 4 kg jadi 8 kg, laju balok jadi lebih lambat padahal dorongannya sama?',
      a: 'Perhatikan hubungan a = F / m. Dorongan F tetap 40 N, namun angka pembagi m membesar menjadi 8 kg. Jika pembagi membesar, nilai percepatannya berkurang menjadi separuh (5 m/s²). Itulah kenapa benda yang lebih berat lebih sulit dipercepat!',
      concept: 'Inersia & Massa (Hukum II Newton)',
    },
    {
      q: 'Mengapa kurva parabola selalu simetris dan memiliki titik puncak?',
      a: 'Bentuk parabola f(x) = ax² + bx + c simetris karena nilai kuadrat x² bernilai sama untuk nilai positif dan negatif yang berjarak sama dari sumbu simetri x = -b / (2a). Titik puncak adalah nilai ekstremum saat kemiringan garis singgung sama dengan nol!',
      concept: 'Sumbu Simetri & Nilai Ekstremum',
    },
    {
      q: 'Apa yang terjadi pada harga pasar jika pajak penjualan dinaikkan?',
      a: 'Pajak menggeser kurva penawaran ke atas sebesar nilai pajak per unit. Akibatnya, titik potong keseimbangan bergeser ke harga jual yang lebih tinggi dan jumlah transaksi barang yang lebih sedikit. Beban pajak tersebut terbagi antara pembeli dan penjual!',
      concept: 'Keseimbangan Pasar & Efek Pajak',
    },
  ];

  return (
    <section
      id="ai-tutor"
      className="relative w-full py-16 sm:py-24 border-b border-[#222733] bg-[#0C0E12] select-none"
    >
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (5 Cols): Anime.js Header Style */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <div className="inline-block px-3 py-1 rounded-md bg-[#14171E] border border-[#222733] text-[#4B8F8C] font-mono text-[11px] font-bold tracking-wider uppercase">
              Pendamping Belajar
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#4B8F8C] leading-[1.15]">
              Tanya AI<br />Laboratorium
            </h2>

            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed font-sans max-w-md">
              Bimbingan cerdas yang menuntunmu memahami konsep melalui pertanyaan pemantik nalar, bukan membocorkan jawaban secara pasif.
            </p>

            <div className="w-full h-px bg-[#222733]" />

            {/* Monospaced Arrow Checklist */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-[#4B8F8C]">
                <span>→</span>
                <span>01 MEMBACA VARIABEL SIMULASI SECARA LANGSUNG</span>
              </div>
              <div className="flex items-center gap-2 text-[#BA8230]">
                <span>→</span>
                <span>02 MENGAJUKAN PERTANYAAN PEMANTIK LOGIKA</span>
              </div>
              <div className="flex items-center gap-2 text-[#F1F5F9]">
                <span>→</span>
                <span>03 DIALOG RAMAH MAHASISWA &amp; PENELITI</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold text-[#F1F5F9] bg-[#1C332A] border border-[#4B8F8C] hover:bg-[#245544] transition-colors"
              >
                <span>COBA TANYA AI SEKARANG</span>
                <IconArrowRight size={13} className="text-[#BA8230]" />
              </Link>
            </div>
          </div>

          {/* Center & Right Column (7 Cols): Sleek Terminal Dialog Stage */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Terminal Card */}
            <div className="w-full max-w-lg rounded-2xl border border-[#222733] bg-[#14171E] p-5 sm:p-6 shadow-xl space-y-4">
              {/* Header Reticle */}
              <div className="flex items-center justify-between border-b border-[#222733] pb-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-[#F1F5F9] font-bold">GEN LABS AI</span>
                </div>
                <span className="text-[#BA8230] text-[11px] font-bold">
                  {dialogs[selectedPrompt].concept}
                </span>
              </div>

              {/* Student Question */}
              <div className="p-3.5 rounded-xl bg-[#0C0E12] border border-[#222733] space-y-1">
                <div className="flex items-center gap-2 font-mono text-[11px] text-[#94A3B8]">
                  <span>Pertanyaan Siswa:</span>
                </div>
                <p className="text-xs sm:text-sm text-[#F1F5F9] font-sans font-medium leading-relaxed">
                  &ldquo;{dialogs[selectedPrompt].q}&rdquo;
                </p>
              </div>

              {/* GEN LABS AI Response */}
              <div className="p-3.5 rounded-xl bg-[#1C332A]/20 border border-[#4B8F8C]/40 space-y-1">
                <div className="flex items-center gap-2 font-mono text-[11px] text-[#4B8F8C]">
                  <IconBot size={12} className="text-[#BA8230]" />
                  <span className="font-bold">Panduan AI Tutor:</span>
                </div>
                <p className="text-xs sm:text-sm text-[#F1F5F9] font-sans leading-relaxed">
                  {dialogs[selectedPrompt].a}
                </p>
              </div>

              {/* Interactive Prompt Chips */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {dialogs.map((d, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPrompt(idx)}
                    className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono transition-colors cursor-pointer min-h-[34px] ${
                      selectedPrompt === idx
                        ? 'border-[#4B8F8C] bg-[#4B8F8C]/20 text-[#F1F5F9] font-bold'
                        : 'border-[#222733] bg-[#0C0E12] text-[#94A3B8] hover:text-[#F1F5F9]'
                    }`}
                  >
                    Tanya #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Signature Anime.js Scrubber Pill */}
            <div className="w-full max-w-lg mt-3 flex items-center justify-between px-3 py-1.5 rounded-full border border-[#222733] bg-[#14171E]/90 backdrop-blur-sm text-[10px] font-mono">
              <span className="text-[#94A3B8] text-[10px]">TUTOR RUNTIME</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 28 }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`inline-block w-[1.5px] rounded-full ${
                      idx === selectedPrompt * 9 + 4
                        ? 'h-3.5 bg-[#4B8F8C] shadow-[0_0_6px_#4B8F8C]'
                        : idx % 4 === 0
                        ? 'h-2 bg-[#BA8230]'
                        : 'h-1.5 bg-[#222733]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[#4B8F8C] font-bold">READY</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
