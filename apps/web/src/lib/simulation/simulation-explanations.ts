export interface LearningExplanation {
  whatHappens: string;
  howItWorks: string;
  tryThis: string[];
  keyConcepts: {
    term: string;
    definition: string;
    formula?: string;
  }[];
}

export const SIMULATION_EXPLANATIONS: Record<string, LearningExplanation> = {
  'projectile-motion': {
    whatHappens:
      'Lintasan parabola terbentuk akibat perpaduan dua gerak independen yang berlangsung simultan: gerak lurus beraturan (GLB) pada sumbu horizontal dan gerak lurus berubah beraturan (GLBB) pada sumbu vertikal di bawah pengaruh percepatan gravitasi konstan.',
    howItWorks:
      'Kecepatan awal v₀ diuraikan ke sumbu Cartesius menjadi v_0x = v₀·cos(θ) dan v_0y = v₀·sin(θ). Karena gesekan udara diabaikan (atau diatur), tidak ada gaya horizontal (ax = 0), sehingga kecepatan horizontal vx tetap konstan sepanjang lintasan. Pada sumbu vertikal, gaya gravitasi menarik ke bawah dengan percepatan konstan g (ay = -g), memperlambat peluru hingga berhenti sejenak di puncak (vy = 0), lalu mempercepatnya kembali ke arah tanah.',
    tryThis: [
      'Atur sudut elevasi ke 45° dengan kecepatan tetap 25 m/s, amati bahwa jangkauan tembak horizontal mencapai jarak paling jauh.',
      'Bandingkan sudut 30° dan 60°: keduanya menghasilkan jangkauan horizontal identik, namun sudut 60° menghasilkan ketinggian maksimum lebih tinggi dan waktu terbang lebih lama.',
      'Ubah gravitasi ke nilai gravitasi Bulan (1.6 m/s²) dan amati bagaimana lintasan peluru melambung sangat tinggi dan jauh.',
    ],
    keyConcepts: [
      {
        term: 'Jangkauan Horizontal Maksimum (R)',
        definition: 'Jarak total terjauh yang dicapai peluru saat mendarat kembali pada ketinggian tanah awal.',
        formula: 'R = \\frac{v_0^2 \\sin(2\\theta)}{g}',
      },
      {
        term: 'Ketinggian Maksimum (H_max)',
        definition: 'Ketinggian puncak vertikal saat komponen kecepatan vertikal peluru mencapai nol tepat sebelum berbalik arah.',
        formula: 'H_{\\max} = \\frac{v_0^2 \\sin^2(\\theta)}{2g} + y_0',
      },
      {
        term: 'Waktu Terbang (t_flight)',
        definition: 'Total durasi peluru berada di udara sejak ditembakkan hingga menyentuh permukaan tanah.',
        formula: 't_{\\text{terbang}} = \\frac{2 v_0 \\sin(\\theta)}{g}',
      },
      {
        term: 'Vektor Kecepatan Sesaat',
        definition: 'Magnitudo kelajuan sesaat peluru di setiap titik waktu lintasan hasil resultan Pythagoras kecepatan sumbu x dan sumbu y.',
        formula: 'v(t) = \\sqrt{v_x^2 + v_y(t)^2}',
      },
    ],
  },

  'newtons-second-law': {
    whatHappens:
      'Sebuah benda bermassa m yang ditarik oleh gaya luar F akan mengalami perubahan kecepatan (percepatan a) yang sebanding dengan resultan gaya total dan berlawanan dengan inersia massa benda.',
    howItWorks:
      'Hukum II Newton menyatakan bahwa laju perubahan momentum suatu benda berbanding lurus dengan resultan gaya total yang bekerja pada benda tersebut (ΣF = m·a). Pada lintasan bermassa, gaya gesek kinetik fk = μk·N bekerja berlawanan arah dengan arah gerak balok, mengurangi gaya dorong efektif menjadi gaya bersih F_net = F - fk.',
    tryThis: [
      'Gandakan nilai massa balok menjadi dua kali lipat tanpa mengubah gaya dorong. Amati percepatan balok turun tepat menjadi separuhnya.',
      'Naikkan koefisien gesek μk hingga gaya gesek menyamai gaya tarik: perhatikan percepatan menjadi 0 m/s² dan balok bergerak dengan kecepatan konstan (Hukum I Newton).',
      'Atur gaya dorong ke 0 saat balok sedang bergerak: amati balok mengalami perlambatan murni akibat gaya gesek permukaan hingga berhenti.',
    ],
    keyConcepts: [
      {
        term: 'Hukum II Newton (Dinamika)',
        definition: 'Percepatan yang dialami suatu benda berbanding lurus dengan resultan gaya total dan berbanding terbalik dengan massa.',
        formula: 'a = \\frac{\\sum F}{m} = \\frac{F - f_k}{m}',
      },
      {
        term: 'Gaya Gesek Kinetik (f_k)',
        definition: 'Gaya resistif permukaan kontak yang menghambat luncuran benda bergerak, sebanding dengan gaya normal permukaan.',
        formula: 'f_k = \\mu_k \\cdot N = \\mu_k \\cdot m \\cdot g',
      },
      {
        term: 'Inersia / Kelembaman Massa',
        definition: 'Kecenderungan alami suatu objek fisis untuk mempertahankan keadaan diam atau gerak lurus beraturannya.',
      },
    ],
  },

  'momentum-collision': {
    whatHappens:
      'Dua benda yang saling bertumbukan bertukar momentum linier. Total momentum sistem sebelum tumbukan selalu identik dengan total momentum setelah tumbukan pada sistem terisolasi.',
    howItWorks:
      'Berdasarkan Hukum III Newton (Aksi-Reaksi), gaya impulsif yang diberikan benda 1 ke benda 2 sama besar dan berlawanan arah dengan gaya yang diberikan benda 2 ke benda 1. Akibatnya, perubahan momentum total sistem adalah nol. Koefisien elastisitas (e) menentukan berapa fraksi energi kinetik yang dikonversi menjadi panas atau deformasi.',
    tryThis: [
      'Atur koefisien elastisitas e = 1 (lenting sempurna) dengan massa m1 = m2 dan v2 = 0. Perhatikan benda 1 berhenti total dan mentransfer 100% kecepatannya ke benda 2.',
      'Ubah koefisien e = 0 (tumbukan tidak lenting sama sekali): kedua benda akan menempel dan bergerak bersama dengan kecepatan akhir yang sama.',
    ],
    keyConcepts: [
      {
        term: 'Hukum Kekekalan Momentum Linier',
        definition: 'Total kuantitas momentum kedua benda sebelum interaksi sama dengan total kuantitas setelah interaksi.',
        formula: 'm_1 v_1 + m_2 v_2 = m_1 v_1\' + m_2 v_2\'',
      },
      {
        term: 'Koefisien Restitusi (e)',
        definition: 'Rasio negatif perbedaan kecepatan relatif kedua benda sesudah dan sebelum tumbukan (rentang 0 hingga 1).',
        formula: 'e = -\\frac{v_2\' - v_1\'}{v_2 - v_1}',
      },
    ],
  },

  'function-explorer': {
    whatHappens:
      'Eksplorasi kurva aljabar kuadratik f(x) = ax² + bx + c yang memvisualisasikan bagaimana perubahan koefisien mengubah kelengkungan, sumbu simetri, dan perpotongan sumbu.',
    howItWorks:
      'Koefisien a menentukan arah bukaan kurva (a > 0 membuka ke atas, a < 0 membuka ke bawah) dan ketajaman lengkungan. Koefisien b menggeser posisi horizontal sumbu simetri x_s = -b/(2a). Koefisien c menentukan posisi perpotongan kurva dengan sumbu vertikal Y pada koordinat (0, c).',
    tryThis: [
      'Ubah koefisien a mendekati 0 untuk mengamati kurva parabola melandai dan bertransisi menjadi garis lurus linear.',
      'Geser koefisien c naik dan turun: perhatikan kurva bergeser translasi vertikal murni tanpa mengubah lebar kelengkungan.',
      'Amati nilai Diskriminan D: saat D > 0 terdapat 2 perpotongan sumbu-x, saat D = 0 puncak menyentuh sumbu-x, dan saat D < 0 kurva melayang.',
    ],
    keyConcepts: [
      {
        term: 'Titik Puncak Ekstrim (Xp, Yp)',
        definition: 'Koordinat nilai minimum (jika a > 0) atau maksimum (jika a < 0) dari kurva kuadrat.',
        formula: 'x_p = -\\frac{b}{2a}, \\quad y_p = -\\frac{b^2 - 4ac}{4a}',
      },
      {
        term: 'Diskriminan (D)',
        definition: 'Penentu karakteristik akar-akar riil perpotongan kurva dengan sumbu absis x.',
        formula: 'D = b^2 - 4ac',
      },
    ],
  },

  'vector-math': {
    whatHappens:
      'Penjumlahan dua vektor geometris 2D menghasilkan satu vektor resultan tunggal yang merepresentasikan efek gabungan perpindahan atau gaya.',
    howItWorks:
      'Setiap vektor diuraikan menjadi komponen horizontal x dan vertikal y. Penjumlahan dilakukan secara komponen analitik: Rx = Ax + Bx dan Ry = Ay + By. Panjang resultan dihitung dengan teorema Pythagoras pada kedua komponen.',
    tryThis: [
      'Atur vektor A dan B membentuk sudut 90° (saling tegak lurus), amati nilai perkalian titik (dot product) bernilai tepat 0.',
      'Sejajarkan kedua vektor ke arah yang sama (sudut 0°) untuk melihat resultan mencapai panjang maksimum gabungan |A| + |B|.',
    ],
    keyConcepts: [
      {
        term: 'Magnitudo Vektor Resultan',
        definition: 'Panjang skalar resultan perpaduan kedua vektor dalam bidang Euclidean.',
        formula: '|\\vec{R}| = \\sqrt{(A_x + B_x)^2 + (A_y + B_y)^2}',
      },
      {
        term: 'Perkalian Titik (Dot Product)',
        definition: 'Ukuran sejauh mana dua vektor menunjuk ke arah yang sama, menghasilkan besaran skalar.',
        formula: '\\vec{A} \\cdot \\vec{B} = A_x B_x + A_y B_y = |A||B|\\cos(\\phi)',
      },
    ],
  },

  'probability-coin': {
    whatHappens:
      'Simulasi lemparan koin berulang-ulang membuktikan konvergensi frekuensi empiris menuju peluang teoritis 50.0% sesuai Hukum Bilangan Besar.',
    howItWorks:
      'Pada jumlah pelemparan kecil (N < 20), fluktuasi acak menghasilkan deviasi relatif yang tampak besar. Namun seiring pertambahan jumlah sampel N menuju ratusan dan ribuan, rata-rata empiris k/N secara deterministik merapat ke nilai ekspektasi teoritis p = 0.50.',
    tryThis: [
      'Lakukan 10 lemparan: perhatikan rasio gambar sering kali jauh dari 50% (misalnya 70% atau 30%).',
      'Tingkatkan ke 500 dan 1000 lemparan: amati kurva frekuensi stabil merapat sangat tipis di sekitar garis putus-putus 50.0%.',
    ],
    keyConcepts: [
      {
        term: 'Hukum Bilangan Besar (LLN)',
        definition: 'Teorema probabilitas bahwa rata-rata hasil dari sejumlah besar percobaan independen akan mendekati nilai harapan matematis.',
        formula: '\\lim_{N \\to \\infty} P\\left(\\left|\\frac{k}{N} - p\\right| < \\epsilon\\right) = 1',
      },
      {
        term: 'Distribusi Binomial',
        definition: 'Distribusi probabilitas diskrit dari jumlah keberhasilan dalam n percobaan Bernoulli mandiri.',
      },
    ],
  },

  'sorting-algorithms': {
    whatHappens:
      'Visualisasi langkah komputasional algoritma pengurutan dalam menata ulang deretan data acak menjadi berurutan secara teratur.',
    howItWorks:
      'Algoritma seperti Bubble Sort berulang kali membandingkan pasangan bertetangga dan menukarnya jika urutan salah (O(n²)). Algoritma pemecah rekursif seperti Quick Sort atau Merge Sort mempartisi data menjadi subset lebih kecil untuk memangkas jumlah perbandingan secara asimtotik menjadi O(n log n).',
    tryThis: [
      'Pilih Bubble Sort dan hitung berapa banyak langkah komparasi yang dibutuhkan untuk 8 batang data.',
      'Bandingkan waktu eksekusi dan jumlah penukaran antara metode kuadratik dan metode logaritmik.',
    ],
    keyConcepts: [
      {
        term: 'Kompleksitas Waktu Asimtotik (Big-O)',
        definition: 'Notasi matematika yang mendeskripsikan batas atas laju pertumbuhan kebutuhan komputasi terhadap ukuran input N.',
        formula: 'T(n) = O(n^2) \\quad \\text{vs} \\quad O(n \\log n)',
      },
      {
        term: 'Invarian Pengurutan',
        definition: 'Kondisi kebenaran logis yang selalu terpelihara pada setiap akhir iterasi algoritma.',
      },
    ],
  },

  'binary-search': {
    whatHappens:
      'Algoritma pencarian biner menemukan posisi elemen target pada data terurut dengan membagi interval ruang pencarian menjadi separuh pada setiap langkah komparasi.',
    howItWorks:
      'Target dibandingkan dengan elemen median interval. Jika nilai target lebih kecil dari median, ruang pencarian sebelah kanan dieliminasi seketika. Jika lebih besar, ruang sebelah kiri dibuang. Proses ini diulang hingga elemen ditemukan atau interval menyusut menjadi nol.',
    tryThis: [
      'Tentukan target yang berada di ujung array: amati bahwa pencarian tetap hanya memerlukan maksimal 4 langkah untuk 16 elemen.',
      'Perhatikan bagaimana rentang indeks [Low, High] menyempit secara eksponensial di setiap langkah perbandingan.',
    ],
    keyConcepts: [
      {
        term: 'Kompleksitas Logaritmik O(log₂ N)',
        definition: 'Jumlah langkah maksimum yang dibutuhkan untuk menemukan target berbanding lurus dengan logaritma basis 2 dari jumlah data.',
        formula: '\\text{Langkah Maksimal} = \\lceil \\log_2(N) \\rceil',
      },
      {
        term: 'Syarat Monotonisitas',
        definition: 'Koleksi data harus terurut menaik atau menurun secara sempurna sebelum pencarian biner dapat diaplikasikan.',
      },
    ],
  },

  'graph-traversal': {
    whatHappens:
      'Penelusuran sistematis struktur jejaring graf yang menghubungkan simpul (node/vertices) melalui sisi penghubung (edges).',
    howItWorks:
      'Breadth-First Search (BFS) menggunakan struktur antrean (Queue FIFO) untuk mengunjungi seluruh tetangga langsung lapis demi lapis, menjamin penemuan lintasan terpendek pada graf tak berbobot. Depth-First Search (DFS) menggunakan tumpukan (Stack LIFO) untuk menelusuri satu cabang sedalam mungkin sebelum mundur (backtracking).',
    tryThis: [
      'Jalankan BFS dari Simpul A ke Simpul F untuk melihat rute dengan jumlah lompatan sisi paling sedikit.',
      'Ganti ke metode DFS dan perhatikan bagaimana algoritma menyusuri rute spiral sebelum memeriksa cabang lain.',
    ],
    keyConcepts: [
      {
        term: 'BFS (Breadth-First Search)',
        definition: 'Algoritma penelusuran graf berbasis antrean FIFO yang menjelajah simpul bertahap berdasarkan jarak lapis dari simpul awal.',
        formula: 'T(V, E) = O(V + E)',
      },
      {
        term: 'DFS (Depth-First Search)',
        definition: 'Algoritma penelusuran graf berbasis tumpukan LIFO yang mengeksplorasi cabang hingga simpul daun sebelum melakukan penelusuran balik.',
        formula: 'T(V, E) = O(V + E)',
      },
    ],
  },

  'linear-regression': {
    whatHappens:
      'Pemodelan hubungan linear antara variabel bebas X dan variabel terikat Y untuk memprediksi tren dan pola data empiris.',
    howItWorks:
      'Metode Ordinary Least Squares (OLS) menghitung garis lurus y = β₁x + β₀ yang meminimalkan jumlah kuadrat residual (selisih vertikal antara titik data riil dan titik pada garis prediksi).',
    tryThis: [
      'Naikkan tingkat derau (noise) acak: perhatikan bagaimana titik-titik data menyebar menjauhi garis namun kemiringan garis tetap menangkap tren umum.',
      'Amati nilai R² (Koefisien Determinasi): nilai mendekati 1.0 mengindikasikan variasi data dijelaskan dengan sangat baik oleh model linear.',
    ],
    keyConcepts: [
      {
        term: 'Ordinary Least Squares (OLS)',
        definition: 'Metode optimasi statistik untuk meminimalkan jumlah kuadrat selisih antara nilai aktual dan nilai estimasi.',
        formula: '\\min \\sum_{i=1}^n (y_i - \\hat{y}_i)^2',
      },
      {
        term: 'Koefisien Determinasi (R²)',
        definition: 'Proporsi varians dalam variabel terikat yang dapat diprediksi dari variabel bebas.',
        formula: 'R^2 = 1 - \\frac{SS_{\\text{res}}}{SS_{\\text{tot}}}',
      },
    ],
  },

  'normal-distribution': {
    whatHappens:
      'Kurva lonceng simetris Gaussian yang mendeskripsikan probabilitas sebaran variabel acak kontinu di sekitar nilai rata-rata (mean).',
    howItWorks:
      'Distribusi normal ditentukan secara lengkap oleh dua parameter statistik: rata-rata μ (lokasi puncak tengah) dan standar deviasi σ (lebar sebaran kurva). Total luas area di bawah kurva probabilitas selalu tepat sama dengan 1.0 (100%).',
    tryThis: [
      'Perkecil standar deviasi σ: amati kurva menjadi semakin ramping, tinggi, dan terkonsentrasi rapat di sekitar mean.',
      'Perhatikan aturan empiris: tepat 68.27% populasi data berada dalam rentang [μ - σ, μ + σ].',
    ],
    keyConcepts: [
      {
        term: 'Fungsi Kepadatan Probabilitas (PDF)',
        definition: 'Persamaan matematis kurva lonceng Gauss kontinu.',
        formula: 'f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}',
      },
      {
        term: 'Skor Standar Z (Z-Score)',
        definition: 'Jumlah standar deviasi suatu titik observasi relatif terhadap nilai rata-rata populasi.',
        formula: 'z = \\frac{x - \\mu}{\\sigma}',
      },
    ],
  },

  'supply-demand': {
    whatHappens:
      'Interaksi kurva permintaan konsumen dan kurva penawaran produsen mencapai titik ekuilibrium pasar yang menentukan harga dan kuantitas transaksi wajar.',
    howItWorks:
      'Kurva permintaan memiliki kemiringan negatif (hukum permintaan: harga naik, kuantitas diminta turun). Kurva penawaran memiliki kemiringan positif (hukum penawaran: harga naik, kuantitas ditawarkan naik). Perpotongan kedua kurva menghasilkan harga keseimbangan P* di mana Qd = Qs.',
    tryThis: [
      'Geser kurva permintaan ke kanan (peningkatan preferensi pembeli): amati harga dan kuantitas ekuilibrium naik bersamaan.',
      'Terapkan batas harga tertinggi di bawah harga ekuilibrium dan amati terciptanya defisit pasokan (shortage).',
    ],
    keyConcepts: [
      {
        term: 'Harga Ekuilibrium Pasar (P*)',
        definition: 'Tingkat harga pasar di mana kuantitas barang yang ingin dibeli konsumen seimbang sempurna dengan yang ingin dijual produsen.',
        formula: 'Q_d(P^*) = Q_s(P^*)',
      },
      {
        term: 'Elastisitas Permintaan',
        definition: 'Derajat kepekaan perubahan persentase kuantitas yang diminta terhadap perubahan persentase harga.',
      },
    ],
  },

  'compound-interest': {
    whatHappens:
      'Pertumbuhan eksponensial nilai investasi keuangan di mana imbal hasil bunga pada suatu periode diakumulasikan kembali ke modal pokok untuk menghasilkan bunga berikutnya.',
    howItWorks:
      'Tidak seperti bunga tunggal (simple interest) yang bertumbuh secara linear tetap, bunga majemuk mempercepat akumulasi aset seiring berjalannya waktu melalui efek compounding bertingkat.',
    tryThis: [
      'Bandingkan pertumbuhan saldo modal antara tahun ke-5 dan tahun ke-20 pada suku bunga 8% per tahun.',
      'Gunakan aturan praktis Rule of 72: bagi angka 72 dengan suku bunga tahunan untuk mengetahui estimasi waktu penggandaan modal.',
    ],
    keyConcepts: [
      {
        term: 'Formula Bunga Majemuk',
        definition: 'Perhitungan nilai akumulasi masa depan dari modal pokok awal dengan frekuensi majemuk n kali per tahun.',
        formula: 'A = P \\left(1 + \\frac{r}{n}\\right)^{nt}',
      },
      {
        term: 'Aturan 72 (Rule of 72)',
        definition: 'Pendekatan matematis cepat untuk mengestimasi tahun yang dibutuhkan agar investasi berlipat ganda.',
        formula: 'T_{\\text{ganda}} \\approx \\frac{72}{r}',
      },
    ],
  },

  'ph-scale': {
    whatHappens:
      'Pengukuran logaritmik derajat konsentrasi ion hidrogen hidronium [H⁺] dalam larutan akuatik untuk menentukan sifat asam, netral, atau basa.',
    howItWorks:
      'Karena konsentrasi ion hidrogen berkisar dari 1 M hingga 10⁻¹⁴ M, skala logaritmik digunakan untuk memampatkan rentang eksponensial tersebut menjadi angka 0 hingga 14. Setiap penurunan 1 unit pH mengindikasikan kenaikan konsentrasi ion H⁺ sebesar 10 kali lipat.',
    tryThis: [
      'Turunkan pH dari 7 (air murni) ke 4: amati bahwa konsentrasi keasaman meningkat 1.000 kali lipat (10³).',
      'Naikkan pH di atas 7 untuk mengamati dominasi ion hidroksida [OH⁻] pada larutan bersifat basa.',
    ],
    keyConcepts: [
      {
        term: 'Definisi Skala pH',
        definition: 'Logaritma negatif basis 10 dari konsentrasi ion hidrogen aktif dalam satuan molaritas.',
        formula: '\\text{pH} = -\\log_{10}[\\text{H}^+]',
      },
      {
        term: 'Hasil Kali Ion Air (Kw)',
        definition: 'Konstanta kesetimbangan disosiasi autoionisasi air murni pada suhu standar 25°C.',
        formula: 'K_w = [\\text{H}^+][\\text{OH}^-] = 1.0 \\times 10^{-14}',
      },
    ],
  },
};

export function getSimulationExplanation(
  slug: string,
  fallbackTitle?: string,
  fallbackDesc?: string
): LearningExplanation {
  const clean = slug.toLowerCase().replace(/^wbi-/, '').replace(/_/g, '-');
  
  if (SIMULATION_EXPLANATIONS[clean]) {
    return SIMULATION_EXPLANATIONS[clean];
  }

  // Alias lookup
  const ALIASES: Record<string, string> = {
    'gerak-peluru': 'projectile-motion',
    'kinematika-gerak-peluru': 'projectile-motion',
    'gerak-parabola': 'projectile-motion',
    'hukum-newton': 'newtons-second-law',
    'hukum-newton-2': 'newtons-second-law',
    'hukum-ii-newton': 'newtons-second-law',
    'newton': 'newtons-second-law',
    'tumbukan': 'momentum-collision',
    'momentum': 'momentum-collision',
    'momentum-dan-tumbukan': 'momentum-collision',
    'fungsi-kuadrat': 'function-explorer',
    'kuadrat': 'function-explorer',
    'vektor': 'vector-math',
    'vektor-2d': 'vector-math',
    'peluang': 'probability-coin',
    'koin': 'probability-coin',
    'peluang-koin': 'probability-coin',
    'sorting': 'sorting-algorithms',
    'pengurutan': 'sorting-algorithms',
    'pencarian-biner': 'binary-search',
    'graf': 'graph-traversal',
    'bfs-dfs': 'graph-traversal',
    'regresi': 'linear-regression',
    'regresi-linear': 'linear-regression',
    'distribusi-normal': 'normal-distribution',
    'gauss': 'normal-distribution',
    'permintaan-penawaran': 'supply-demand',
    'pasar': 'supply-demand',
    'bunga-majemuk': 'compound-interest',
    'investasi': 'compound-interest',
    'ph': 'ph-scale',
    'skala-ph': 'ph-scale',
  };

  if (ALIASES[clean] && SIMULATION_EXPLANATIONS[ALIASES[clean]]) {
    return SIMULATION_EXPLANATIONS[ALIASES[clean]];
  }

  // Generic fallback if new module
  return {
    whatHappens: fallbackDesc || 'Sistem laboratorium interaktif ini mensimulasikan respon fisis dan matematis secara deterministik pada 60 FPS.',
    howItWorks: 'Perhitungan numerik dijalankan secara real-time berdasarkan formulasi sains presisi untuk menghubungkan variabel input dengan respon output visual.',
    tryThis: [
      'Ubah parameter kontrol pada panel di bawah kanvas untuk melihat respon perubahan sistem secara langsung.',
      'Bandingkan kondisi awal dengan kondisi setelah modifikasi menggunakan fitur komparasi State.',
    ],
    keyConcepts: [
      {
        term: fallbackTitle || 'Prinsip Dasar',
        definition: 'Hubungan kausalitas matematis dan empiris antara variabel bebas dan respon sistem teramati.',
      },
    ],
  };
}
