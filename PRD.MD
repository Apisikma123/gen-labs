# PRODUCT REQUIREMENTS DOCUMENT (PRD)

# GEN LABS

### AI-Powered Interactive Learning Platform

**Versi:** 2.0
**Status:** Unified Product Definition & Multi-Context Interactive Platform
**Target:** Pelajar Sekolah (SMP, SMA, SMK), Mahasiswa Perguruan Tinggi, dan Pendidik (Guru/Dosen)
**Platform:** Web Application
**Bahasa utama:** Bahasa Indonesia

---

# 1. RINGKASAN PRODUK

## 1.1 Nama Produk

**GEN LABS**

GEN LABS adalah platform pembelajaran interaktif berbasis AI yang membantu pelajar (SMP/SMA/SMK) hingga mahasiswa memahami konsep sulit melalui **simulasi, eksperimen virtual, visualisasi, dan dialog sokratik dengan AI Tutor**.

GEN LABS tidak berfokus pada pemberian jawaban teks instan.

Fokus utamanya adalah:

> **Belajar dengan mencoba (Learn by Doing).**

Pengguna dapat memasukkan konsep yang ingin dipelajari menggunakan bahasa alami. Sistem kemudian mencari simulasi tervalidasi yang sesuai (Reuse-First), atau mengusulkan konfigurasi simulasi terstruktur yang aman.

Contoh:

> "Saya mau belajar Hukum Newton."

GEN LABS menggunakan simulasi Hukum Newton yang sudah tersedia dan tervalidasi.

Pengguna kemudian dapat:

* mengubah variabel kontrol,
* menjalankan eksperimen dinamis,
* mengamati respon grafik dan visual,
* berdialog dengan AI Tutor yang memahami kondisi eksperimen nyata,
* menyelesaikan tantangan terarah,
* dan memperoleh insight pedagogis yang dapat ditelusuri.

---

# 2. MASALAH YANG INGIN DISELESAIKAN

Pelajar dan mahasiswa sering memahami teori secara hafalan abstrak tetapi kesulitan menghubungkannya dengan fenomena dan variabel nyata.

Contoh:

Pelajar membaca:

> F = ma

Mereka mengetahui rumusnya, tetapi belum tentu memahami secara intuitif bagaimana perubahan gaya atau massa memengaruhi percepatan dan jarak tempuh.

Masalah lainnya:

### 2.1 Materi terlalu abstrak
Konsep dalam sains, matematika, informatika, statistika, dan ekonomi membutuhkan manipulasi langsung agar terbentuk intuisi mendalam.

### 2.2 Simulator tersebar dan terisolasi
Alat simulasi pembelajaran saat ini tersebar di berbagai situs terpisah, memiliki antarmuka tidak konsisten, dan tidak memiliki pendampingan belajar adaptif.

### 2.3 AI generatif saat ini hanya memberi teks pasif
Chatbot umum hanya memberikan narasi teks panjang yang membuat siswa pasif membaca, tanpa kemampuan membuktikan sendiri hipotesis mereka.

### 2.4 Akses laboratorium dan alat peraga terbatas
Banyak sekolah dan kampus memiliki keterbatasan fasilitas fisik untuk melaksanakan praktikum berkala bagi seluruh siswa.

---

# 3. SOLUSI

GEN LABS menyatukan:

**AI + Visualisasi + Simulasi + Eksperimen + Tutor Sokrates**

menjadi satu alur pembelajaran terintegrasi:

```text
Pengguna (Siswa / Mahasiswa / Guru)
    ↓
Menentukan konsep (Bahasa Alami / Pencarian)
    ↓
GEN LABS mengidentifikasi kebutuhan
    ↓
Pencarian Pustaka Simulasi (Reuse-First)
    ↓
Buka Simulasi Tervalidasi (atau Schema Fallback)
    ↓
Manipulasi Variabel & Eksperimen Langsung
    ↓
Canvas & Telemetri Berubah Real-Time
    ↓
AI Tutor Merespon Berdasarkan State Nyata
    ↓
Tantangan (Challenge) & Evaluasi Percobaan
    ↓
Insight Pedagogis & Penyimpanan Sesi
```

---

# 4. VISI PRODUK

> **Membuat konsep abstrak menjadi sesuatu yang dapat dilihat, dimanipulasi, dan dibuktikan secara mandiri.**

GEN LABS mengubah paradigma:

```text
Baca → Hafal → Kerjakan Soal
```

menjadi:

```text
Tanya → Coba → Amati → Eksperimen → Pahami
```

---

# 5. TARGET USER & KONTEKS PENGGUNAAN

## 5.1 Kelompok Pengguna Utama

1. **Pelajar Sekolah Menengah (SMP, SMA, SMK):**
   * Fokus pada penguasaan konsep Kurikulum Merdeka (Fisika, Matematika, Kimia, Biologi, Informatika, dan Kejuruan).
   * Kebutuhan: Kontrol visual intuitif, panduan langkah demi langkah, bahasa Indonesia yang ramah, dan tantangan bertingkat.

2. **Mahasiswa Perguruan Tinggi:**
   * Fokus pada mata kuliah dasar umum dan keahlian (Kalkulus, Fisika Dasar, Algoritma, Statistika, Ekonometrika).
   * Kebutuhan: Presisi numerik, pembuktian formula analitik, fleksibilitas pengujian batas ekstrem.

## 5.2 Pengguna Pendukung (Pendidik: Guru & Dosen)

* Menggunakan simulasi sebagai alat demonstrasi interaktif di kelas (pengganti proyektor statis).
* Menugaskan skenario tantangan eksperimen mandiri bagi siswa.
* Menilai kemajuan pemahaman siswa melalui histori eksperimen dan parameter yang dicoba.

## 5.3 Satu Produk, Berbagai Konteks Penggunaan

GEN LABS dikembangkan sebagai **satu platform inti universal**. Platform ini tidak dipecah menjadi basis kode terpisah untuk tiap pemangku kepentingan:

* **Konteks Pilot Vokasi WBI (World Bank / SMK):**
  Menggunakan platform inti dengan kurasi modul kejuruan dan sains terapan (Fisika mekanika, optimasi ekonomi pasar, algoritma pemrosesan data).
* **Konteks Pameran GTK (Guru dan Tenaga Kependidikan):**
  Menggunakan platform inti dengan fokus demonstrasi alat bantu ajar guru, integrasi Kurikulum Merdeka, dan kemudahan akses mobile siswa.

Kedua konteks ini diwujudkan melalui koleksi modul dan skenario demonstrasi yang dapat dipilih (presets), **bukan arsitektur atau aplikasi berbeda**.

---

# 6. PERSONA UTAMA

## Persona 1: Siswa SMA / SMK (Rian, 16 tahun)
* **Kondisi:** Bingung membedakan gerak lurus beraturan dan gerak lurus berubah beraturan saat membaca grafik.
* **Kebutuhan:** Mengubah gaya dorong dan melihat balok bergerak makin cepat serta grafik kemiringan kecepatannya berubah seketika.
* **Tujuan:** *"Oh, percepatan itu kemiringan grafik kecepatan terhadap waktu!"*

## Persona 2: Mahasiswa Semester Awal (Nadia, 19 tahun)
* **Kondisi:** Sulit membayangkan perbedaan kompleksitas waktu $O(n^2)$ vs $O(n \log n)$ pada algoritma pengurutan.
* **Kebutuhan:** Menjalankan sorting visualizer dengan data acak dan membandingkan jumlah operasi perbandingan secara langsung.
* **Tujuan:** Memahami efisiensi algoritma secara visual dan empiris.

## Persona 3: Guru Fisika / Pengajar (Pak Budi, 38 tahun)
* **Kondisi:** Membutuhkan media ajar visual yang cepat dibuka di kelas tanpa instalasi software rumit.
* **Kebutuhan:** Membuka simulasi gerak peluru di proyektor, mengubah sudut elevasi di depan siswa, dan meminta siswa memprediksi titik jatuh sebelum tombol dijalankan.
* **Tujuan:** Pembelajaran kelas menjadi partisipatif dan interaktif.

---

# 7. CORE VALUE PROPOSITION

GEN LABS menawarkan:

### "Tanyakan konsepnya. Coba simulasinya. Temukan sendiri."

Perbedaan GEN LABS dengan chatbot:

| Chatbot                                | GEN LABS                            |
| -------------------------------------- | --------------------------------- |
| Memberikan penjelasan                  | Memberikan pengalaman             |
| User membaca                           | User mencoba                      |
| Jawaban berbentuk teks                 | Visual + simulasi                 |
| Pasif                                  | Interaktif                        |
| Tidak selalu memahami state eksperimen | AI memahami kondisi simulasi      |
| Satu pertanyaan → satu jawaban         | Pertanyaan → eksperimen → insight |

---

# 8. CORE USER LOOP

Ini merupakan loop utama seluruh produk.

```text
ASK
 ↓
GEN LABSTE
 ↓
INTERACT
 ↓
EXPERIMENT
 ↓
UNDERSTAND
```

### 8.1 Ask

Mahasiswa memasukkan:

> "Saya ingin belajar hukum Newton."

### 8.2 Simulate

GEN LABS mencari simulasi yang relevan.

### 8.3 Interact

Mahasiswa mengubah:

* gaya,
* massa,
* parameter,
* atau variabel lain.

### 8.4 Experiment

GEN LABS memberikan tantangan.

Contoh:

> Buat percepatan menjadi 8 m/s² tanpa mengubah massa.

### 8.5 Understand

GEN LABS memberikan insight berdasarkan apa yang dilakukan mahasiswa.

---

# 9. AI SIMULATION GENERATION

## 9.1 Tujuan dan Prinsip Keamanan

AI dapat menyusun pengalaman simulasi terstruktur berdasarkan konsep pembelajaran yang diminta pengguna.

**Standar Arsitektur AI:**
* **Bebas Eksekusi Kode Arbitrer:** AI dilarang keras menghasilkan source code (JS/React/HTML) mentah yang langsung dieksekusi di browser (menghindari celah XSS, sandbox escape, dan ketidakstabilan runtime).
* **Schema-Driven Architecture:** AI hanya menghasilkan spesifikasi deklaratif terstruktur (`UnifiedSimulatorSpec` format JSON) yang mendefinisikan parameter, rentang nilai, formula relasi domain, dan konfigurasi elemen visual.
* **Universal Super Canvas:** Seluruh visualisasi dirender oleh satu mesin render kanvas universal yang aman, terisolasi, dan teruji performanya.

Contoh:

> "Saya mau belajar Hukum Newton."

AI memahami:

* domain: Physics
* concept: Newton's Second Law
* variables: force, mass, acceleration
* relationship: F = ma
* visual: dynamic track, block body, vector arrows

Kemudian memilih modul tervalidasi yang ada (Reuse) atau menghasilkan konfigurasi skema simulasi yang aman.

---

# 10. SIMULATION REUSE SYSTEM

GEN LABS **tidak boleh selalu membuat simulasi baru dari nol**.

Jika konsep yang diminta sudah tersedia dalam katalog tervalidasi, sistem wajib menggunakan simulasi yang telah ada.

Prinsip Operasional:
1. **Semantic Matching:** Pertanyaan bahasa alami dianalisis untuk mengekstraksi konsep inti dan sinonim domain (Bahasa Indonesia & Inggris).
2. **Reuse-First Threshold:** Jika tingkat kemiripan semantik melampaui batas ambang ($Score \ge 0.65$), sistem langsung membuka modul simulasi resmi tersebut.
3. **Pencarian Katalog Bertingkat:** Jika kemiripan berada pada rentang menengah ($0.45 \le Score < 0.65$), sistem menampilkan daftar modul tervalidasi yang relevan kepada pengguna.
4. **Fallback Transparan:** Jika konsep belum didukung oleh mesin yang tersedia, sistem memberikan penjelasan jujur dan mengarahkan ke topik dasar terdekat, tanpa memalsukan simulasi atau mengarang model matematis.

```text
Input Pengguna ("saya ingin paham gaya dan percepatan")
                  ↓
          Semantic Matcher
                  ↓
       [Cocok dengan FIS-01?]
       ├── YA (Score >= 0.65) ──→ Buka "newtons-second-law" (REUSE)
       └── BELUM ───────────────→ Katalog Jelajah / Fallback Jujur
```

---

# 11. SIMULATION KNOWLEDGE LIBRARY

Semua simulasi yang telah divalidasi masuk ke dalam pustaka terstruktur lintas jenjang dan mata pelajaran:

```text
Fisika
├── Hukum II Newton (Dinamika & Gesekan)
├── Gerak Peluru (Kinematika Parabola 2D)
└── Momentum & Tumbukan 1D (Kelentingan)

Matematika
├── Eksplorasi Fungsi Kuadrat & Titik Puncak
├── Operasi Vektor 2D & Perkalian Titik
└── Peluang Koin & Hukum Bilangan Besar (LLN)

Informatika
├── Algoritma Pengurutan (Bubble, Selection, Insertion)
├── Pencarian Biner (Divide and Conquer)
└── Penelusuran Graf (BFS & DFS)

Statistika
├── Regresi Linear Sederhana (Metode OLS)
└── Distribusi Normal Gauss & Z-Score

Ekonomi
├── Keseimbangan Pasar (Permintaan & Penawaran)
└── Bunga Majemuk & Nilai Waktu dari Uang

Kimia
└── Skala pH & Konsentrasi Ion Hidrogen
```

Library berkembang secara terkontrol melalui proses rilis dan verifikasi akademik.

---

# 12. SIMULATION QUALITY CONTROL

AI tidak boleh menghasilkan simulasi lalu langsung dianggap valid tanpa pemeriksaan sistematis.

Setiap modul dan generated spec harus melewati 4 lapis validasi:

### 12.1 Structural Validation
* Apakah skema JSON `UnifiedSimulatorSpec` valid sesuai kontrak TypeScript?
* Apakah tipe parameter, batas nilai ($min < max$), dan nilai bawaan ($defaultVal$) konsisten?
* Apakah elemen visual yang diminta tersedia dalam registry kapabilitas Super Canvas?

### 12.2 Model & Domain Logic Validation
* Apakah rumus matematis atau aturan algoritmik benar secara sains/akademik?
* Apakah satuan fisika dan dimensi besaran konsisten?
* Apakah respon parameter terhadap output logis (misal: massa naik $\to$ percepatan turun)?

### 12.3 Runtime Stability Validation
* Apakah simulasi dapat dirender pada 60fps tanpa memori bocor?
* Apakah fungsi Play, Pause, Resume, dan Reset bekerja deterministik tanpa state snapping?
* Apakah kanvas bebas dari error console dan visual horizontal overflow pada mobile 320px?

### 12.4 Educational & Safety Validation
* Apakah konten bebas dari halusinasi angka atau instruksi berbahaya?
* Apakah teks insight memberikan pemahaman pedagogis yang dapat dipertanggungjawabkan?

---

# 13. MODE SIMULASI

GEN LABS beroperasi dengan dua mode penyediaan simulasi:

## Mode 1 — Verified Simulation (Standar Utama & Pilot)
Simulasi inti yang telah melewati pengujian menyeluruh (14 modul aktif terverifikasi).
* Keuntungan: 100% stabil, rumus matematis terbukti, visual presisi, siap untuk kelas dan demonstrasi resmi (WBI & GTK).

## Mode 2 — Guided AI Generated Specification
Penyusunan skema simulasi baru secara terstruktur melalui panel kurasi/authoring berbasis template dan registry kapabilitas Super Canvas.
* Penerapan: Digunakan untuk memperluas katalog secara bertahap dengan review pendidik/admin sebelum dipublikasikan ke siswa umum.

---

# 14. HOME

Home harus sangat sederhana.

Tujuan:

**Membuat mahasiswa mulai belajar secepat mungkin.**

Struktur:

```text
GEN LABS

Belajar dengan mencoba.

Apa yang ingin kamu pahami?

[ Saya ingin memahami...                 ]

[ Mulai ]

Coba langsung

Hukum Newton
Supply & Demand
Linear Regression
Sorting Algorithm
```

Tidak perlu dashboard statistik yang memenuhi halaman.

---

# 15. NATURAL LANGUAGE INPUT

Mahasiswa tidak harus mengetahui nama simulator.

Mereka cukup menjelaskan tujuan belajar.

Contoh:

> "Aku mau ngerti kenapa benda makin cepat kalau gaya diperbesar."

GEN LABS memahami konsep yang mendasarinya.

Contoh lain:

> "Saya masih bingung cara kerja binary search."

GEN LABS mencari atau membuat pengalaman yang sesuai.

---

# 16. GENERATION FLOW

Setelah user menekan Mulai:

```text
Input
 ↓
Intent Detection
 ↓
Concept Extraction
 ↓
Semantic Search
 ↓
Existing Simulation?
 ├── YES → Load
 └── NO → Generate
 ↓
Validate
 ↓
Open simulasi
```

Loading tidak perlu dibuat panjang.

Gunakan pesan sederhana:

> **Menyiapkan simulasi...**

---

# 17. EXPLORE

Explore merupakan katalog simulasi.

Header:

> **Jelajahi konsep**

Subheadline:

> Temukan sesuatu untuk dicoba.

Kategori:

* Matematika
* Fisika
* Ekonomi
* Computer Science
* Sains
* Lainnya

---

# 18. GEN LABSTION CARD

Card hanya berisi informasi yang diperlukan.

Contoh:

### Newton's Second Law

Visual simulasi.

> Ubah gaya dan massa untuk melihat pengaruhnya terhadap percepatan.

**Coba**

Tidak perlu:

* rating,
* jumlah pengguna,
* 10 badge,
* metadata teknis,
* statistik tidak relevan.

---

# 19. GEN LABSTION WORKSPACE

simulasi merupakan pusat pengalaman GEN LABS.

Contoh:

```text
← Kembali

Newton's Second Law

Ubah gaya atau massa dan lihat apa yang terjadi.


             GEN LABSTION

          ┌───────────────┐
          │               │
          │       ■ →     │
          │               │
          └───────────────┘


Force
────────●────────
20 N

Mass
────────●────────
5 kg

Acceleration
4 m/s²
```

---

# 20. DIRECT MANIPULATION

User harus dapat memanipulasi simulasi.

Contoh:

### Physics

Drag object.

### Mathematics

Drag point pada graph.

### Economics

Geser price.

### Statistics

Drag data point.

### Computer Science

Klik / step algoritma.

Interaction harus menghasilkan perubahan secara langsung.

---

# 21. AI TUTOR

AI bukan chatbot utama.

AI adalah **contextual learning assistant**.

AI mengetahui:

* konsep,
* simulasi,
* current variables,
* experiment,
* perubahan yang dilakukan user.

Contoh:

Current state:

```text
Mass = 5 kg
Force = 40 N
Acceleration = 8 m/s²
```

User:

> "Kenapa percepatannya jadi 8?"

AI:

> Karena massa tetap 5 kg, sedangkan gaya naik menjadi 40 N. Berdasarkan F = ma, percepatan menjadi 8 m/s².

---

# 22. AI ACTION

AI tidak hanya menjelaskan.

AI dapat menawarkan aksi.

Contoh:

> Coba naikkan gaya menjadi 40 N.

**[ Terapkan ]**

Ketika ditekan:

```text
Force:
20 N → 40 N
```

simulasi berubah.

Ini membuat AI menjadi bagian dari experience.

---

# 23. EXPERIMENT MODE

Setiap simulasi yang mendukungnya dapat memiliki experiment.

Contoh:

### Coba ini

> Buat percepatan menjadi 8 m/s².

Constraint:

> Massa tetap 5 kg.

Button:

**Mulai eksperimen**

User harus menemukan sendiri parameter yang tepat.

---

# 24. EXPERIMENT FEEDBACK

Jika benar:

> **Berhasil!**

Kemudian:

```text
40 N → 8 m/s²
```

GEN LABS menunjukkan hubungan yang ditemukan.

Jika salah:

jangan langsung memberikan jawaban.

Contoh:

> Belum tepat. Coba perhatikan apa yang terjadi ketika gaya dinaikkan.

Tujuannya mendorong eksplorasi.

---

# 25. INSIGHT

Setelah eksperimen selesai:

## Yang kamu temukan

> **Dengan massa tetap, semakin besar gaya maka semakin besar percepatan.**

Insight harus berasal dari kondisi eksperimen.

Bukan sekadar artikel teori yang sudah ditulis sebelumnya.

---

# 26. LEARNING SESSION

Setiap aktivitas belajar dapat dianggap sebagai session.

Contoh:

```text
Session
 ├── Concept
 ├── simulasi
 ├── Variables
 ├── Experiments
 ├── Questions
 └── Insights
```

Session dapat disimpan ke Riwayat.

---

# 27. RIWAYAT

Riwayat berisi konsep yang pernah dipelajari.

Contoh:

```text
Terakhir dipelajari

Hukum Newton
5 menit lalu

Sorting Algorithm
Kemarin

Supply & Demand
2 hari lalu
```

User dapat melanjutkan session.

---

# 28. CANVAS INTEGRATION

GEN LABS dapat diakses dari Canvas.

Flow:

```text
Canvas
 ↓
GEN LABS
 ↓
Learning Experience
```

Untuk MVP:

**belum perlu gradebook.**

Fokus integrasi:

* akses aplikasi,
* identitas mahasiswa,
* masuk ke GEN LABS,
* kembali ke Canvas.

GEN LABS bukan menggantikan Canvas.

GEN LABS menjadi **interactive learning layer**.

---

# 29. AUTHENTICATION

User adalah mahasiswa.

Untuk MVP dapat mendukung:

* login,
* session,
* profile dasar.

Jika integrasi Canvas tersedia:

Canvas dapat menjadi sumber identitas.

---

# 30. PROFILE

Profile tidak perlu kompleks.

Minimal:

* nama,
* email,
* aktivitas belajar,
* preferensi tema.

Tidak perlu sistem achievement yang berlebihan pada MVP.

---

# 31. THEME

Support:

* Light
* Dark
* System

Default:

**System**

Tema harus konsisten di seluruh aplikasi.

---

# 32. DESIGN DIRECTION

GEN LABS harus:

* minimalis,
* modern,
* clean,
* sedikit playful,
* profesional,
* interactive,
* visual.

Tidak boleh terasa:

* military,
* cyberpunk,
* futuristic berlebihan,
* SaaS dashboard,
* AI template,
* corporate dashboard.

---

# 33. VISUAL LANGUAGE

Gunakan:

* whitespace,
* typography,
* subtle borders,
* sedikit rounded corners,
* interactive visual,
* meaningful motion.

Jangan menjadikan:

* emoji,
* gradient,
* glow,
* shadow,
* badge,

sebagai dekorasi utama.

---

# 34. MOTION

Motion harus membantu pengguna memahami perubahan.

Gunakan:

* hover,
* press,
* spring,
* layout transition,
* graph animation,
* object movement,
* number transition,
* state transition.

Jangan membuat semua elemen fade-in.

---

# 35. 3D

3D bukan fitur utama yang dipaksakan ke semua halaman.

3D digunakan ketika memberikan manfaat visual.

Contoh:

Physics:

3D object.

Mathematics:

2D graph.

Economics:

2D animated graph.

Computer Science:

2D/3D blocks sesuai kebutuhan.

---

# 36. GEN LABSTION TECHNOLOGY

Untuk simulasi interaktif:

**React + TypeScript**

Untuk visual:

* SVG
* Canvas
* CSS animation
* Three.js / React Three Fiber

Pemilihan teknologi berdasarkan kebutuhan simulasi.

Tidak semua simulasi harus menggunakan WebGL.

---

# 37. RESPONSIVENESS

Target:

```text
320px
375px
390px
430px
768px
1024px
1280px
1440px
```

Mobile bukan sekadar desktop yang diperkecil.

simulasi harus tetap dapat digunakan dengan touch.

Minimum touch target:

**44px**

---

# 38. ACCESSIBILITY

Wajib:

* semantic HTML,
* keyboard navigation,
* visible focus,
* readable text,
* sufficient contrast,
* reduced motion support,
* accessible controls.

---

# 39. PERFORMANCE

GEN LABS harus tetap ringan.

Prioritas:

* lazy load simulasi,
* lazy load 3D,
* code splitting,
* optimized assets,
* limited render loop,
* simple geometry,
* responsive rendering,
* avoid unnecessary animation.

Jangan memuat semua simulator saat membuka Home.

---

# 40. MOBILE PERFORMANCE

Jika device lemah:

3D dapat diturunkan kualitasnya.

Contoh:

```text
High capability
→ full 3D

Medium
→ simplified 3D

Low
→ 2D fallback
```

Interaction tetap tersedia.

---

# 41. DATA MODEL KONSEP

Entitas utama:

```text
User
simulasi
Concept
simulasiVersion
Session
Experiment
ExperimentAttempt
Insight
Question
Interaction
```

---

# 42. USER

Minimal:

```text
id
name
email
role
created_at
updated_at
```

Role MVP:

```text
student
admin
```

Tidak perlu role system yang terlalu kompleks.

---

# 43. CONCEPT

```text
id
name
description
category
keywords
created_at
updated_at
```

Contoh:

```text
Newton's Second Law
Physics
force, mass, acceleration, F=ma
```

---

# 44. GEN LABSTION

```text
id
concept_id
title
description
type
schema
version
status
usage_count
created_at
updated_at
```

`schema` berisi konfigurasi simulasi.

---

# 45. GEN LABSTION STATUS

```text
draft
validating
published
archived
```

Hanya simulasi yang:

```text
published
```

yang dapat digunakan secara umum.

---

# 46. SESSION

```text
id
user_id
simulasi_id
started_at
ended_at
state
```

`state` menyimpan kondisi simulasi yang relevan.

---

# 47. EXPERIMENT

```text
id
simulasi_id
title
description
constraints
target
```

Contoh:

```text
title:
Buat percepatan menjadi 8 m/s²

constraint:
mass = 5kg

target:
acceleration = 8
```

---

# 48. EXPERIMENT ATTEMPT

```text
id
experiment_id
session_id
input_state
result
success
created_at
```

---

# 49. INSIGHT

```text
id
session_id
content
source_state
created_at
```

Insight harus dapat ditelusuri ke eksperimen.

---

# 50. AI ARCHITECTURE

AI memiliki beberapa tugas.

## Intent Layer

Memahami apa yang ingin dipelajari.

## Retrieval Layer

Mencari simulasi yang sudah tersedia.

## Generation Layer

Membuat simulasi baru jika tidak tersedia.

## Validation Layer

Memeriksa simulasi.

## Tutor Layer

Menjawab pertanyaan berdasarkan context.

---

# 51. AI DECISION FLOW

```text
User Input
     ↓
Intent Detection
     ↓
Concept Extraction
     ↓
Embedding
     ↓
Semantic Search
     ↓
Similarity Threshold
     ↓
Existing Simulation?
    / \
  YES  NO
   ↓    ↓
 Load  Generate
       ↓
    Validate
       ↓
     Publish
```

---

# 52. SEMANTIC REUSE

Contoh:

Input A:

> Saya ingin belajar hukum Newton.

Input B:

> Kenapa gaya memengaruhi percepatan?

Input C:

> Jelaskan F = ma secara visual.

Ketiganya dapat diarahkan ke konsep yang sama jika semantic similarity memenuhi threshold.

Tujuannya:

**mengurangi generation yang tidak perlu.**

---

# 53. AI GENERATION OUTPUT

AI tidak boleh menghasilkan source code aplikasi secara bebas lalu langsung mengeksekusinya.

AI sebaiknya menghasilkan **simulasi schema terstruktur**.

Contoh konsep:

```text
simulasi
 ├── objects
 ├── variables
 ├── formulas
 ├── interactions
 ├── visual
 ├── experiments
 └── explanations
```

Frontend kemudian merender schema menggunakan engine yang telah ditentukan.

Ini lebih aman, konsisten, dan mudah divalidasi daripada membiarkan AI membuat aplikasi frontend baru setiap kali.

---

# 54. GEN LABSTION ENGINE

GEN LABS membutuhkan engine yang dapat menangani komponen umum.

Contoh:

```text
Object
Slider
Number
Graph
Button
Drag
Animation
Formula
Text
Experiment
```

AI cukup menentukan:

```text
apa yang digunakan
bagaimana hubungan antarvariabel
bagaimana interaction bekerja
```

Engine yang menentukan bagaimana semuanya dirender.

---

# 55. CONTOH GEN LABSTION SCHEMA

Newton:

```text
Variables:
mass
force
friction

Formula:
acceleration = (force - friction) / mass

Objects:
box

Interactions:
drag_force
change_mass

Outputs:
acceleration
velocity
distance
```

---

# 56. GENERATED GEN LABSTION PRINCIPLE

AI tidak harus selalu menciptakan simulasi yang sepenuhnya baru.

Prioritas:

```text
Existing template
      ↓
Customize
      ↓
Generate missing pieces
```

Contoh:

Newton template sudah tersedia.

AI hanya menyesuaikan:

* tingkat kesulitan,
* variabel,
* experiment,
* penjelasan.

---

# 57. LEARNING DIFFICULTY

MVP dapat memiliki:

* Dasar
* Menengah
* Lanjutan

Tetapi jangan membuat sistem adaptif yang terlalu kompleks terlebih dahulu.

AI dapat menyesuaikan penjelasan berdasarkan percakapan.

---

# 58. LANGUAGE

Bahasa utama:

**Bahasa Indonesia**

AI harus menjawab dalam bahasa Indonesia kecuali user meminta bahasa lain.

Istilah teknis dapat tetap menggunakan istilah aslinya jika lebih umum.

Contoh:

> percepatan (acceleration)

---

# 59. ERROR HANDLING

Jika AI gagal membuat simulasi:

Jangan tampilkan error teknis.

Gunakan:

> **simulasi untuk konsep ini belum tersedia.**

Kemudian tawarkan:

> Coba jelaskan konsep yang ingin kamu pahami dengan cara berbeda.

Jika generation gagal:

sistem dapat mencari simulasi yang paling relevan.

---

# 60. ADMIN

Admin MVP hanya diperlukan untuk:

* melihat simulasi,
* melihat status,
* melakukan review,
* publish,
* archive,
* melihat error.

Tidak perlu dashboard admin besar.

---

# 61. MODERATION / REVIEW

simulasi hasil AI yang akan digunakan banyak mahasiswa harus dapat diperiksa.

Flow:

```text
Generated
 ↓
Validation
 ↓
Review jika diperlukan
 ↓
Published
```

Untuk simulasi yang sudah tervalidasi dan hanya menggunakan template aman, proses dapat lebih otomatis.

---

# 62. ANALYTICS

MVP cukup mengukur:

* jumlah simulasi dibuat,
* jumlah simulasi digunakan,
* jumlah session,
* experiment completion,
* reuse rate,
* generation rate,
* error rate.

Tidak perlu membuat dashboard analytics kompleks untuk mahasiswa.

---

# 63. METRIK PRODUK

Metric utama:

### simulasi Reuse Rate

Berapa banyak request menggunakan simulasi yang sudah ada.

### Experiment Completion

Berapa banyak experiment yang diselesaikan.

### Session Completion

Berapa banyak session yang mencapai insight.

### Interaction Rate

Berapa banyak user yang benar-benar mengubah variabel.

### AI Question Rate

Berapa banyak user bertanya setelah mencoba simulasi.

---

# 64. NORTH STAR METRIC

Untuk tahap awal:

> **Jumlah sesi belajar yang menghasilkan eksperimen dan insight.**

Karena tujuan GEN LABS bukan sekadar membuat simulasi.

Tujuannya adalah:

**mahasiswa benar-benar belajar melalui eksperimen.**

---

# 65. MVP SCOPE

MVP wajib memiliki:

### User

* login
* profile sederhana

### Home

* natural language input
* example concepts

### AI

* concept detection
* semantic search
* simulasi reuse
* AI generation
* contextual tutor

### simulasi

* interactive simulasi
* variables
* real-time feedback
* basic 2D/3D

### Experiment

* challenge
* attempt
* success state
* insight

### Explore

* categories
* simulasi library

### History

* previous learning sessions

### Theme

* light
* dark
* system

### Responsive

* mobile
* tablet
* desktop

---

# 66. OUT OF SCOPE MVP

Tidak dibuat dulu:

* gradebook
* LMS lengkap
* assignment management
* attendance
* complicated lecturer dashboard
* social network
* marketplace
* achievement system kompleks
* native mobile application
* payment
* institution billing
* complicated recommendation engine
* fully autonomous AI coding agent

---

# 67. MVP GEN LABSTION SET

Untuk membuktikan platform bersifat all-rounder, gunakan beberapa konsep dari bidang berbeda.

Minimal:

### Physics

Newton's Second Law

### Mathematics

Function Explorer

### Economics

Supply & Demand

### Computer Science

Sorting Algorithm

Empat simulator ini cukup untuk menunjukkan bahwa engine GEN LABS bukan khusus satu bidang.

---

# 68. CONTOH USER JOURNEY

## Journey A — User baru

User membuka GEN LABS.

Melihat:

> Belajar dengan mencoba.

User mengetik:

> Saya mau belajar hukum Newton.

Klik:

**Mulai**

GEN LABS menemukan simulasi yang sesuai.

simulasi terbuka.

User mengubah force.

Object bergerak.

User bertanya:

> Kenapa jadi lebih cepat?

AI menjelaskan berdasarkan state.

AI memberikan experiment.

User berhasil.

GEN LABS menampilkan insight.

Session tersimpan.

---

# 69. JOURNEY B — SIMULASI SUDAH ADA (REUSE)

User:

> "Saya ingin memahami hubungan gaya dan percepatan."

Sistem melakukan semantic matching dengan katalog resmi:

**Hukum II Newton (FIS-01)**

Sistem:

```text
Existing Simulation Found (Score >= 0.65)
        ↓
Direct Reuse (Buka Workspace Modul)
```

Tidak memicu proses generate ulang yang memboroskan token dan waktu.

---

# 70. JOURNEY C — SIMULASI BELUM ADA (FALLBACK TRANSPARAN)

User:

> "Saya ingin memahami cara kerja reaktor fusi nuklir tokamak."

Hasil semantic search tidak menemukan kecocokan yang memadai pada katalog aktif (Score < 0.45).

Sistem:

```text
No Safe Validated Match
        ↓
Fallback Penjelasan Jujur (Coming Soon / Topik Belum Tersedia)
        ↓
Rekomendasikan Topik Terkait yang Sudah Terkalibrasi (Fisika Mekanika)
```

Sistem tidak mengarang kalkulasi palsu atau menghasilkan kanvas yang tidak dapat dibuktikan akurasinya.

---

# 71. JOURNEY D — MELANJUTKAN BELAJAR

User membuka:

**Riwayat Belajar / Dashboard Sesi**

Memilih sesi sebelumnya:

Hukum II Newton (FIS-01)

GEN LABS memulihkan state parameter terakhir ($m = 10\text{ kg}, F = 20\text{ N}$) dan riwayat eksperimen yang tersimpan di sesi lokal / database.

---

# 72. SUCCESS CRITERIA & KRITERIA KESIAPAN

## 72.1 Kriteria Penerimaan Kemampuan Utama (Acceptance Criteria)

1. **Natural Language Input & Semantic Reuse:**
   * Pengguna dapat memasukkan kalimat santai bahasa Indonesia.
   * Pertanyaan yang relevan dengan 14 modul aktif langsung membuka simulasi yang tepat tanpa mengharuskan pengguna tahu kode modul.
2. **Kebenaran Model Fisika/Matematis:**
   * Respon parameter terhadap nilai terhitung ($computed$) mematuhi rumus analitik 100%.
   * Tidak ada batasan artifisial buatan yang melanggar hukum alam (misal: akselerasi tidak dibatasi paksa).
3. **Kontrak Parameter Deterministik:**
   * Pengubahan parameter dinamis tidak menyebabkan lonjakan posisi tiba-tiba ($t=0$ reset untuk kondisi awal).
4. **AI Tutor Grounding:**
   * AI Tutor menjawab berdasarkan state parameter dan output angka riil, bukan mengarang data fiktif.
5. **Responsivitas & Aksesibilitas:**
   * Tampilan kanvas dan kontrol bebas dari horizontal scrollbar pada layar mobile (lebar minimum 320px).
   * Seluruh slider dan tombol memiliki label aksesibilitas (`aria-label`).

## 72.2 Kriteria Kesiapan Demonstrasi Terkendali (Controlled Demo: WBI & Pameran GTK)

* **14 Modul Inti Terverifikasi Penuh:** 14 simulasi sains, matematika, informatika, dan ekonomi lolos audit browser otomatis tanpa console error.
* **Presisi Pengalaman Pengguna:** Skenario preset (misal: demonstrasi gaya-massa untuk guru, atau efisiensi pencarian biner untuk vokasi) dapat dijalankan dalam 3 klik dari halaman muka.
* **Fail-Safe Offline/Local Fallback:** Sesi belajar dan manipulasi kanvas dapat berjalan lancar pada jaringan lokal bahkan jika koneksi API AI luar mengalami latensi.

## 72.3 Kriteria Kesiapan Rilis Publik (Public Release)

* Seluruh regression test suite lulus 100% tanpa flakiness.
* Audit keamanan sanitasi input dan validasi sesi database terselesaikan.
* Mekanisme moderasi kurasi modul baru melalui admin panel berjalan terkontrol.

---

# 73. NON-GOALS

GEN LABS bukan:

> ChatGPT dengan tema pendidikan yang hanya memuntahkan teks pasif.

Bukan:

> Website kumpulan video atau animasi pemutar pasif.

Bukan:

> Game edukasi dengan skor dan gamifikasi dekoratif yang mengaburkan substansi sains.

Bukan:

> LMS berat pengganti Moodle atau Canvas.

Bukan:

> AI generator kode arbitrer yang mengeksekusi script mentah tanpa validasi keamanan.

GEN LABS adalah:

> **Interactive simulation platform yang mengubah konsep akademik menjadi laboratorium virtual yang dapat dimanipulasi, diuji, dan dibuktikan secara mandiri.**

---

# 74. PRODUCT PRINCIPLES

## Principle 1
**Learn by doing.** Interaksi langsung membangun pemahaman intuitif mendalam.

## Principle 2
**AI assists, student explores.** AI memandu dengan pertanyaan sokratik, bukan memberi contekan instan.

## Principle 3
**Reuse before generate.** Gunakan modul teruji yang ada sebelum menyusun hal baru.

## Principle 4
**Interaction before explanation.** Biarkan siswa memanipulasi variabel sebelum membaca teori panjang.

## Principle 5
**Visual when visual helps.** Visualisasi harus melayani konsep, bukan sekadar dekorasi visual yang membingungkan.

## Principle 6
**Simple UI, powerful engine.** Antarmuka minimalis dan bersih, namun ditopang mesin komputasi matematis yang kokoh.

## Principle 7
**Performance is part of the product.** Kanvas 60 FPS, beban memori ringan, dan adaptif hingga perangkat mobile 320px.

---

# 75. FINAL PRODUCT LOOP

```text
                  ┌────────────────────────┐
                  │ SISWA / MAHASISWA / GURU │
                  └───────────┬────────────┘
                              │
                              ▼
                        ┌───────────┐
                        │   TANYA   │
                        └─────┬─────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │ SEMANTIC ENGINE │
                     └────────┬────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │ SEARCH LIBRARY  │
                     └───────┬─────────┘
                             │
                      ┌──────┴──────┐
                      │             │
                     ADA          BELUM
                      │             │
                      ▼             ▼
                    REUSE        FALLBACK
                      │             │
                      │          EXPLAIN
                      │             │
                      └──────┬──────┘
                             ▼
                      ┌──────────────┐
                      │  SIMULATION  │
                      └──────┬───────┘
                             │
                             ▼
                      ┌──────────────┐
                      │   INTERACT   │
                      └──────┬───────┘
                             │
                             ▼
                      ┌──────────────┐
                      │  EXPERIMENT  │
                      └──────┬───────┘
                             │
                             ▼
                      ┌──────────────┐
                      │   AI TUTOR   │
                      └──────┬───────┘
                             │
                             ▼
                      ┌──────────────┐
                      │    INSIGHT   │
                      └──────┬───────┘
                             │
                             ▼
                      ┌──────────────┐
                      │    HISTORY   │
                      └──────────────┘
```

---

# 76. ONE-LINE PRODUCT DEFINITION

> **GEN LABS adalah platform belajar interaktif berbasis AI yang membantu pelajar dan mahasiswa memahami konsep melalui simulasi dan eksperimen virtual terstandar.**

---

# 77. PRODUCT TAGLINE

### Primary
**Belajar dengan mencoba.**

### Alternative
**Pahami dengan eksperimen.**

### Product description
**Ubah konsep abstrak menjadi pengalaman laboratorium interaktif yang dapat diuji sendiri.**
