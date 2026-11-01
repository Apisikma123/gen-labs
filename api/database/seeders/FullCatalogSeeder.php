<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Concept;
use App\Models\Simulation;
use App\Models\Module;
use App\Models\Experiment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FullCatalogSeeder extends Seeder
{
    /**
     * Seeds the remaining Master Academic Simulations so all 48 catalog simulations
     * exist as real, published, editable database modules for Admin & Students.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@genlabs.app'],
            [
                'name' => 'Dr. Hendra Wijaya (Admin Lab)',
                'password' => bcrypt('secret123'),
                'role' => 'admin',
            ]
        );

        $coreSimulations = [
            [
                'slug' => 'projectile-motion',
                'module_slug' => 'kinematika-gerak-peluru',
                'title' => 'Kinematika Gerak Peluru Parabola',
                'discipline' => 'Fisika',
                'category' => 'Mekanika Klasik',
                'type' => 'physics',
                'formula' => 'y = v_0 \cdot \sin(\theta) \cdot t - \frac{1}{2} g t^2',
                'difficulty' => 'intermediate',
                'description' => 'Eksplorasi lintasan parabola 2D, hubungan kecepatan awal dan sudut elevasi terhadap jangkauan terjauh dan tinggi maksimum.',
                'target_metric' => 'range',
                'target_val' => 45.0,
                'target_unit' => 'm',
                'objective' => 'Atur kecepatan awal dan sudut tembak agar jarak tembak peluru mencapai tepat 45 meter.',
            ],
            [
                'slug' => 'momentum-collision',
                'module_slug' => 'momentum-dan-tumbukan',
                'title' => 'Hukum Kekekalan Momentum & Tumbukan',
                'discipline' => 'Fisika',
                'category' => 'Dinamika Sistem Partikel',
                'type' => 'physics',
                'formula' => 'm_1 v_1 + m_2 v_2 = m_1 v_1\' + m_2 v_2\'',
                'difficulty' => 'intermediate',
                'description' => 'Simulasi tumbukan lenting sempurna dan tidak lenting antara dua troli bermassa dengan kekekalan momentum linear total.',
                'target_metric' => 'totalMomentum',
                'target_val' => 30.0,
                'target_unit' => 'kg·m/s',
                'objective' => 'Variasikan massa dan kecepatan kedua troli untuk membuktikan momentum total sistem selalu konstan.',
            ],
            [
                'slug' => 'vector-math',
                'module_slug' => 'aljabar-vektor-2d',
                'title' => 'Aljabar Vektor 2D & Resultan Gaya',
                'discipline' => 'Matematika',
                'category' => 'Aljabar Linear',
                'type' => 'math',
                'formula' => '\vec{R} = \vec{A} + \vec{B}',
                'difficulty' => 'basic',
                'description' => 'Visualisasi grafis penjumlahan vektor, sudut komponen trigonometri, dan perkalian titik (dot product).',
                'target_metric' => 'magnitude',
                'target_val' => 10.0,
                'target_unit' => '',
                'objective' => 'Tentukan koordinat komponen vektor A dan B agar besar vektor resultan bernilai tepat 10 satuan.',
            ],
            [
                'slug' => 'probability-coin',
                'module_slug' => 'teori-peluang-koin',
                'title' => 'Teori Peluang & Distribusi Binomial',
                'discipline' => 'Matematika',
                'category' => 'Teori Peluang & Kombinatorika',
                'type' => 'math',
                'formula' => 'P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}',
                'difficulty' => 'basic',
                'description' => 'Eksperimen pelemparan koin berulang (Hukum Bilangan Besar) dan konvergensi frekuensi relatif menuju probabilitas teoretis.',
                'target_metric' => 'headsRatio',
                'target_val' => 0.5,
                'target_unit' => '',
                'objective' => 'Lakukan lemparan hingga frekuensi munculnya sisi angka mendekati nilai probabilitas teoretis 50%.',
            ],
            [
                'slug' => 'graph-traversal',
                'module_slug' => 'penelusuran-graf-bfs-dfs',
                'title' => 'Penelusuran Graf & Pohon (BFS vs DFS)',
                'discipline' => 'Informatika',
                'category' => 'Struktur Data & Graf',
                'type' => 'computer-science',
                'formula' => 'O(V + E)',
                'difficulty' => 'intermediate',
                'description' => 'Visualisasi langkah demi langkah penelusuran graf menggunakan Breadth-First Search (antrian FIFO) dan Depth-First Search (rekursif/tumpukan LIFO).',
                'target_metric' => 'visitedNodes',
                'target_val' => 7.0,
                'target_unit' => 'node',
                'objective' => 'Telusuri seluruh simpul graf terhubung dari simpul awal hingga seluruh 7 simpul berhasil dikunjungi.',
            ],
            [
                'slug' => 'linear-regression',
                'module_slug' => 'regresi-linier-sederhana',
                'title' => 'Regresi Linier & Korelasi Pearson',
                'discipline' => 'Statistika',
                'category' => 'Metode Statistika Terapan',
                'type' => 'statistics',
                'formula' => '\hat{y} = \beta_0 + \beta_1 x',
                'difficulty' => 'intermediate',
                'description' => 'Model estimasi garis regresi kuadrat terkecil (Ordinary Least Squares), koefisien determinasi R², dan analisis residual data sampel.',
                'target_metric' => 'rSquared',
                'target_val' => 0.85,
                'target_unit' => '',
                'objective' => 'Atur slope dan tingkat noise data sampel hingga koefisien determinasi R² bernilai di atas 0.85.',
            ],
            [
                'slug' => 'normal-distribution',
                'module_slug' => 'distribusi-normal-gauss',
                'title' => 'Distribusi Normal Gauss & Skor Standar Z',
                'discipline' => 'Statistika',
                'category' => 'Distribusi Probabilitas Kontinu',
                'type' => 'statistics',
                'formula' => 'f(x) = \frac{1}{\sigma \sqrt{2\pi}} e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^2}',
                'difficulty' => 'intermediate',
                'description' => 'Eksplorasi kurva lonceng Gauss, pengaruh mean (pusat) dan deviasi standar (penyebaran), serta probabilitas kumulatif CDF.',
                'target_metric' => 'zScore',
                'target_val' => 1.5,
                'target_unit' => '',
                'objective' => 'Tentukan nilai mean dan titik uji x agar skor standar z bernilai tepat 1.50.',
            ],
            [
                'slug' => 'compound-interest',
                'module_slug' => 'bunga-majemuk-finansial',
                'title' => 'Bunga Majemuk & Perencanaan Finansial',
                'discipline' => 'Ekonomi',
                'category' => 'Matematika Keuangan',
                'type' => 'economics',
                'formula' => 'A = P \left(1 + \frac{r}{n}\right)^{nt}',
                'difficulty' => 'basic',
                'description' => 'Simulasi pertumbuhan eksponensial modal investasi, frekuensi peracikan bunga, dan aturan penggandaan modal Rule of 72.',
                'target_metric' => 'finalAmount',
                'target_val' => 20000000.0,
                'target_unit' => 'Rp',
                'objective' => 'Sesuaikan tingkat bunga tahunan dan durasi investasi agar akumulasi dana akhir mencapai Rp 20.000.000.',
            ],
            [
                'slug' => 'ph-scale',
                'module_slug' => 'keseimbangan-asam-basa-ph',
                'title' => 'Keseimbangan Asam-Basa Skala pH',
                'discipline' => 'Kimia',
                'category' => 'Larutan & Kesetimbangan Kimia',
                'type' => 'chemistry',
                'formula' => '\text{pH} = -\log_{10}[\text{H}^+]',
                'difficulty' => 'basic',
                'description' => 'Pengukuran keasaman larutan, konsentrasi ion hidrogen [H+] dan hidroksida [OH-], serta perubahan warna indikator universal.',
                'target_metric' => 'pH',
                'target_val' => 7.0,
                'target_unit' => '',
                'objective' => 'Campurkan larutan hingga derajat keasaman mencapai tepat pH 7.00 (larutan netral).',
            ],
        ];

        foreach ($coreSimulations as $data) {
            // 1. Concept
            $conceptSlug = Str::slug($data['category']);
            $concept = Concept::updateOrCreate(
                ['slug' => $conceptSlug],
                [
                    'name' => $data['category'],
                    'category' => $data['discipline'],
                    'description' => 'Konsep akademik ' . $data['category'] . ' bidang studi ' . $data['discipline'],
                ]
            );

            // 2. Simulation
            $sim = Simulation::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'title' => $data['title'],
                    'concept_id' => $concept->id,
                    'type' => $data['type'],
                    'formula' => $data['formula'],
                    'difficulty' => $data['difficulty'],
                    'configuration' => [
                        'type' => $data['type'],
                        'concept' => $data['slug'],
                        'title' => $data['title'],
                        'discipline' => $data['discipline'],
                        'category' => $data['category'],
                    ],
                    'usage_count' => rand(50, 180),
                ]
            );

            // 3. Module (Published)
            $module = Module::updateOrCreate(
                ['slug' => $data['module_slug']],
                [
                    'title' => $data['title'] . ' — Laboratorium Interaktif Gen Labs',
                    'description' => $data['description'],
                    'content' => "## Pengantar Praktikum\n\nModul eksperimen digital untuk menguji pemahaman konsep **" . $data['title'] . "** pada bidang studi " . $data['discipline'] . ". Ubah kontrol parameter untuk mengamati respon matematis dan grafik deterministik secara real-time.",
                    'learning_objectives' => [
                        'Memahami hubungan sebab-akibat antar parameter kunci dalam ' . $data['title'],
                        'Menganalisis data numerik dan output instrumen simulasi',
                        'Menyelesaikan target tantangan eksperimen dengan akurat',
                    ],
                    'discipline' => $data['discipline'],
                    'difficulty' => $data['difficulty'],
                    'target_audience' => 'Mahasiswa & Praktisi ' . $data['discipline'] . ' Gen Labs',
                    'status' => 'published',
                    'created_by' => $admin->id,
                    'published_at' => now(),
                ]
            );

            $module->simulations()->syncWithoutDetaching([
                $sim->id => ['order' => 1],
            ]);

            // 4. Playable Experiment
            Experiment::updateOrCreate(
                [
                    'module_id' => $module->id,
                    'title' => 'Eksperimen ' . $data['title'],
                ],
                [
                    'simulation_id' => $sim->id,
                    'objective' => $data['objective'],
                    'target' => [
                        'parameter' => $data['target_metric'],
                        'targetValue' => $data['target_val'],
                        'tolerance' => 0.05,
                        'unit' => $data['target_unit'],
                    ],
                    'rules' => [
                        'description' => 'Eksplorasi nilai parameter kontrol untuk mencapai target metrik kuantitatif.',
                    ],
                    'status' => 'in_progress',
                ]
            );
        }

        $this->command->info('Successfully seeded all 9 remaining core master simulations into modules!');
    }
}
