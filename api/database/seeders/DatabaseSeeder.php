<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Concept;
use App\Models\Simulation;
use App\Models\Module;
use App\Models\Experiment;
use App\Models\LearningSession;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with Module-Based curriculum.
     */
    public function run(): void
    {
        // 1. Seed Demo Users
        $student = User::updateOrCreate(
            ['email' => 'user@genlabs.app'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make('secret123'),
                'role' => 'student',
                'avatar' => 'B',
                'preferences' => ['theme' => 'system', 'language' => 'id'],
            ]
        );

        User::updateOrCreate(
            ['email' => 'mahasiswa@genlabs.id'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make('secret123'),
                'role' => 'student',
                'avatar' => 'B',
                'preferences' => ['theme' => 'system', 'language' => 'id'],
            ]
        );

        User::updateOrCreate(
            ['email' => 'mahasiswa@simula.ac.id'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make('secret123'),
                'role' => 'student',
                'avatar' => 'B',
                'preferences' => ['theme' => 'system', 'language' => 'id'],
            ]
        );

        $admin = User::updateOrCreate(
            ['email' => 'admin@genlabs.app'],
            [
                'name' => 'Dr. Hendra Wijaya (Admin Lab)',
                'password' => Hash::make('secret123'),
                'role' => 'admin',
                'avatar' => 'A',
                'preferences' => ['theme' => 'dark', 'language' => 'id'],
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@genlabs.id'],
            [
                'name' => 'Dr. Hendra Wijaya (Admin Lab)',
                'password' => Hash::make('secret123'),
                'role' => 'admin',
                'avatar' => 'A',
                'preferences' => ['theme' => 'dark', 'language' => 'id'],
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@simula.ac.id'],
            [
                'name' => 'Dr. Hendra Wijaya (Admin Lab)',
                'password' => Hash::make('secret123'),
                'role' => 'admin',
                'avatar' => 'A',
                'preferences' => ['theme' => 'dark', 'language' => 'id'],
            ]
        );

        // 2. Core Concepts
        $conceptsData = [
            ['slug' => 'hukum-newton', 'name' => 'Hukum Dinamika Newton', 'category' => 'Fisika'],
            ['slug' => 'fungsi-kuadratik', 'name' => 'Karakteristik Fungsi Kuadratik', 'category' => 'Matematika'],
            ['slug' => 'permintaan-penawaran', 'name' => 'Ekuilibrium Pasar', 'category' => 'Ekonomi'],
            ['slug' => 'algoritma-sorting', 'name' => 'Komparasi Kompleksitas Pengurutan', 'category' => 'Informatika'],
            ['slug' => 'kinematika-peluru', 'name' => 'Kinematika Gerak Parabola', 'category' => 'Fisika'],
            ['slug' => 'skala-ph', 'name' => 'Keseimbangan Asam-Basa', 'category' => 'Kimia'],
        ];

        $concepts = [];
        foreach ($conceptsData as $c) {
            $concepts[$c['slug']] = Concept::updateOrCreate(['slug' => $c['slug']], $c);
        }

        // 3. Institutional Simulations (Controlled Schemas)
        $simulationsData = [
            [
                'slug' => 'newtons-second-law',
                'concept_slug' => 'hukum-newton',
                'title' => 'Hukum II Newton — Dinamika Gerak',
                'type' => 'physics',
                'formula' => 'a = F_net / m',
                'difficulty' => 'basic',
                'configuration' => [
                    'type' => 'physics',
                    'concept' => 'newtons-second-law',
                    'title' => 'Hukum II Newton',
                    'formula' => 'a = F_net / m',
                    'variables' => [
                        ['id' => 'force', 'label' => 'Gaya Dorong (F)', 'unit' => 'N', 'min' => 0, 'max' => 100, 'default' => 20, 'step' => 1],
                        ['id' => 'mass', 'label' => 'Massa Benda (m)', 'unit' => 'kg', 'min' => 1, 'max' => 20, 'default' => 5, 'step' => 0.5],
                        ['id' => 'friction', 'label' => 'Koefisien Gesek (μ)', 'unit' => '', 'min' => 0, 'max' => 0.5, 'default' => 0, 'step' => 0.05],
                    ],
                    'interactions' => ['slider', 'direct_drag'],
                ],
                'usage_count' => 184,
            ],
            [
                'slug' => 'function-explorer',
                'concept_slug' => 'fungsi-kuadratik',
                'title' => 'Eksplorasi Kurva Fungsi Kuadratik',
                'type' => 'math',
                'formula' => 'f(x) = ax² + bx + c',
                'difficulty' => 'basic',
                'configuration' => [
                    'type' => 'math',
                    'concept' => 'function-explorer',
                    'title' => 'Eksplorasi Parabola',
                    'formula' => 'f(x) = ax² + bx + c',
                    'variables' => [
                        ['id' => 'a', 'label' => 'Koefisien Kuadratik (a)', 'unit' => '', 'min' => -5, 'max' => 5, 'default' => 1, 'step' => 0.5],
                        ['id' => 'b', 'label' => 'Koefisien Linier (b)', 'unit' => '', 'min' => -10, 'max' => 10, 'default' => 0, 'step' => 0.5],
                        ['id' => 'c', 'label' => 'Konstanta Intersep (c)', 'unit' => '', 'min' => -10, 'max' => 10, 'default' => 0, 'step' => 0.5],
                    ],
                    'interactions' => ['slider'],
                ],
                'usage_count' => 110,
            ],
            [
                'slug' => 'supply-demand',
                'concept_slug' => 'permintaan-penawaran',
                'title' => 'Ekuilibrium Pasar — Permintaan & Penawaran',
                'type' => 'economics',
                'formula' => 'Q_d(P) = Q_s(P)',
                'difficulty' => 'basic',
                'configuration' => [
                    'type' => 'economics',
                    'concept' => 'supply-demand',
                    'title' => 'Keseimbangan Pasar Mikroekonomi',
                    'formula' => 'Q_d(P) = Q_s(P)',
                    'variables' => [
                        ['id' => 'demandBase', 'label' => 'Konstanta Permintaan', 'unit' => '', 'min' => 50, 'max' => 200, 'default' => 120, 'step' => 5],
                        ['id' => 'demandSlope', 'label' => 'Elastisitas Permintaan', 'unit' => '', 'min' => 0.5, 'max' => 3, 'default' => 1.2, 'step' => 0.1],
                        ['id' => 'supplyBase', 'label' => 'Konstanta Penawaran', 'unit' => '', 'min' => 10, 'max' => 80, 'default' => 20, 'step' => 5],
                        ['id' => 'supplySlope', 'label' => 'Elastisitas Penawaran', 'unit' => '', 'min' => 0.5, 'max' => 3, 'default' => 1, 'step' => 0.1],
                    ],
                    'interactions' => ['slider'],
                ],
                'usage_count' => 125,
            ],
            [
                'slug' => 'sorting-algorithms',
                'concept_slug' => 'algoritma-sorting',
                'title' => 'Visualisasi Komparatif Algoritma Pengurutan Data',
                'type' => 'computer-science',
                'formula' => 'T(n) = O(n²) vs O(n log n)',
                'difficulty' => 'intermediate',
                'configuration' => [
                    'type' => 'computer-science',
                    'concept' => 'sorting-algorithms',
                    'title' => 'Komparasi Algoritma Pengurutan',
                    'formula' => 'T(n) = O(n²) vs O(n log n)',
                    'variables' => [
                        ['id' => 'arraySize', 'label' => 'Ukuran Array Data', 'unit' => 'elemen', 'min' => 8, 'max' => 40, 'default' => 20, 'step' => 2],
                        ['id' => 'speed', 'label' => 'Kecepatan Animasi', 'unit' => 'ms', 'min' => 20, 'max' => 300, 'default' => 80, 'step' => 10],
                    ],
                    'interactions' => ['slider', 'step_control'],
                ],
                'usage_count' => 160,
            ],
            [
                'slug' => 'projectile-motion',
                'concept_slug' => 'kinematika-peluru',
                'title' => 'Kinematika Gerak Peluru Parabola',
                'type' => 'physics',
                'formula' => 'y = v₀·sin(θ)·t - ½·g·t²',
                'difficulty' => 'intermediate',
                'configuration' => [
                    'type' => 'physics',
                    'concept' => 'projectile-motion',
                    'title' => 'Gerak Peluru 2D',
                    'formula' => 'y = v₀·sin(θ)·t - ½·g·t²',
                    'variables' => [
                        ['id' => 'velocity', 'label' => 'Kecepatan Awal (v₀)', 'unit' => 'm/s', 'min' => 5, 'max' => 50, 'default' => 25, 'step' => 1],
                        ['id' => 'angle', 'label' => 'Sudut Elevasi (θ)', 'unit' => '°', 'min' => 0, 'max' => 90, 'default' => 45, 'step' => 1],
                        ['id' => 'gravity', 'label' => 'Percepatan Gravitasi (g)', 'unit' => 'm/s²', 'min' => 1, 'max' => 25, 'default' => 9.8, 'step' => 0.1],
                    ],
                    'interactions' => ['slider'],
                ],
                'usage_count' => 95,
            ],
            [
                'slug' => 'ph-scale',
                'concept_slug' => 'skala-ph',
                'title' => 'Keseimbangan Asam-Basa Skala pH',
                'type' => 'chemistry',
                'formula' => 'pH = -log₁₀[H⁺]',
                'difficulty' => 'basic',
                'configuration' => [
                    'type' => 'chemistry',
                    'concept' => 'ph-scale',
                    'title' => 'Indikator Skala pH',
                    'formula' => 'pH = -log₁₀[H⁺]',
                    'variables' => [
                        ['id' => 'concentrationExponent', 'label' => 'Eksponen Konsentrasi (-log[H+])', 'unit' => '', 'min' => 1, 'max' => 14, 'default' => 7, 'step' => 1],
                    ],
                    'interactions' => ['slider'],
                ],
                'usage_count' => 55,
            ],
        ];

        $simulations = [];
        foreach ($simulationsData as $s) {
            $concept = $concepts[$s['concept_slug']] ?? null;
            $slug = $s['slug'];
            unset($s['concept_slug']);

            $simulations[$slug] = Simulation::updateOrCreate(
                ['slug' => $slug],
                array_merge($s, ['concept_id' => $concept?->id])
            );
        }

        // 4. Seed Modules (The Main Learning Entities)
        $newtonModule = Module::updateOrCreate(
            ['slug' => 'hukum-ii-newton'],
            [
                'title' => 'Hukum II Newton — Dinamika Gerak & Kelembaman',
                'description' => 'Pelajari bagaimana resultan gaya menggerakkan benda bermassa dan menentukan percepatan linier seketika.',
                'content' => <<<'EOT'
## 1. Pengantar Dinamika Gerak

Dalam kehidupan sehari-hari, kita sering mendorong benda yang berat dan menyadari bahwa semakin berat benda tersebut, semakin sulit kita membuatnya bergerak cepat. Sebaliknya, semakin kuat kita mendorong, semakin cepat benda melesat.

Isaac Newton merumuskan pengamatan fundamental ini dalam **Hukum II Newton**: *Percepatan suatu benda berbanding lurus dengan resultan gaya yang bekerja padanya dan berbanding terbalik dengan massa kelembaman benda tersebut*.

### 2. Rumusan Matematis
$$\vec{F}_{net} = m \cdot \vec{a} \implies \vec{a} = \frac{\vec{F}_{net}}{m}$$

- **F (Gaya)**: Besaran vektor dalam satuan Newton ($1\text{ N} = 1\text{ kg}\cdot\text{m/s}^2$).
- **m (Massa)**: Ukuran kuantitatif inersia benda dalam kilogram (kg).
- **a (Percepatan)**: Laju perubahan kecepatan terhadap waktu (m/s²).

### 3. Contoh Penerapan di Dunia Nyata
- **Pengereman Kendaraan**: Mobil bermassa 1.500 kg membutuhkan gaya rem yang jauh lebih besar daripada sepeda motor 150 kg untuk berhenti pada jarak yang sama.
- **Roket Luar Angkasa**: Saat bahan bakar roket habis terbakar, massa total roket berkurang drastis sehingga percepatan roket meningkat tajam meskipun dorongan mesin tetap konstan.
EOT,
                'learning_objectives' => [
                    'Memahami hubungan proporsional antara gaya dorong net dan percepatan gerak.',
                    'Membuktikan bahwa massa berlaku sebagai resistansi kelembaman terhadap perubahan gerak.',
                    'Menghitung percepatan teoretis dan membandingkannya dengan output instrumen simulasi.',
                ],
                'discipline' => 'Fisika',
                'difficulty' => 'basic',
                'target_audience' => 'Mahasiswa Fisika Dasar & Teknik Semester 1',
                'status' => 'published',
                'created_by' => $admin->id,
                'published_at' => now()->subDays(5),
            ]
        );

        $newtonModule->simulations()->syncWithoutDetaching([
            $simulations['newtons-second-law']->id => ['order' => 1],
        ]);

        // Experiment for Newton Module
        Experiment::updateOrCreate(
            ['module_id' => $newtonModule->id, 'title' => 'Mencapai Percepatan Target a = 8.00 m/s²'],
            [
                'simulation_id' => $simulations['newtons-second-law']->id,
                'objective' => 'Dengan massa balok dipertahankan tepat 5 kg, tentukan besaran gaya dorong (F) agar percepatan mencapai tepat 8.00 m/s².',
                'target' => [
                    'parameter' => 'acceleration',
                    'targetValue' => 8.0,
                    'tolerance' => 0.05,
                    'unit' => 'm/s²',
                ],
                'rules' => [
                    'heldConstant' => ['mass'],
                    'expectedValue' => ['mass' => 5],
                ],
                'status' => 'in_progress',
            ]
        );

        // Module 2: Function Explorer
        $functionModule = Module::updateOrCreate(
            ['slug' => 'eksplorasi-fungsi-kuadratik'],
            [
                'title' => 'Eksplorasi Kurva Fungsi Kuadratik & Nilai Ekstrim',
                'description' => 'Eksplorasi bentuk parabola kuadratik f(x) = ax² + bx + c, diskriminan, sumbu simetri, dan titik puncak.',
                'content' => <<<'EOT'
## Fungsi Kuadratik & Transformasi Geometris

Fungsi kuadratik adalah salah satu fondasi kalkulus dan optimisasi. Koefisien $a$ menentukan keterbukaan parabola (ke atas jika $a > 0$, ke bawah jika $a < 0$).

Titik puncak (ekstrim) terletak pada absis $x = -\frac{b}{2a}$, dan determinan $D = b^2 - 4ac$ menentukan perpotongan dengan sumbu x.
EOT,
                'learning_objectives' => [
                    'Mengidentifikasi pengaruh tanda koefisien kuadratik a terhadap orientasi kurva.',
                    'Menentukan posisi titik balik (vertex) secara grafis dan aljabar.',
                ],
                'discipline' => 'Matematika',
                'difficulty' => 'basic',
                'target_audience' => 'Mahasiswa Kalkulus & Aljabar Linier',
                'status' => 'published',
                'created_by' => $admin->id,
                'published_at' => now()->subDays(3),
            ]
        );

        $functionModule->simulations()->syncWithoutDetaching([
            $simulations['function-explorer']->id => ['order' => 1],
        ]);

        // Experiment for Function Module
        Experiment::updateOrCreate(
            ['module_id' => $functionModule->id, 'title' => 'Menentukan Titik Puncak Parabola x = 2.00'],
            [
                'simulation_id' => $simulations['function-explorer']->id,
                'objective' => 'Atur koefisien a dan b agar absis titik puncak (vertex) berada tepat di x = 2.00 (x_puncak = -b / (2a)).',
                'target' => [
                    'parameter' => 'vertexX',
                    'targetValue' => 2.0,
                    'tolerance' => 0.05,
                    'unit' => '',
                ],
                'rules' => [
                    'heldConstant' => ['a'],
                    'expectedValue' => ['a' => 1],
                ],
                'status' => 'in_progress',
            ]
        );

        // Module 3: Supply & Demand
        $econModule = Module::updateOrCreate(
            ['slug' => 'ekuilibrium-pasar-mikroekonomi'],
            [
                'title' => 'Keseimbangan Pasar & Elastisitas Mikroekonomi',
                'description' => 'Pahami mekanisme pembentukan harga pasar bebas saat kurva permintaan bertemu dengan kurva penawaran.',
                'content' => <<<'EOT'
## Hukum Permintaan dan Penawaran

Dalam pasar kompetitif, harga barang ditentukan oleh perpotongan jumlah yang diminta oleh konsumen dan jumlah yang ditawarkan oleh produsen ($Q_d = Q_s$). Jika harga berada di atas titik keseimbangan, terjadi surplus pasokan (kelebihan barang); jika di bawahnya, terjadi kelangkaan pasokan (shortage).
EOT,
                'learning_objectives' => [
                    'Menghitung harga dan kuantitas ekuilibrium pasar.',
                    'Menganalisis dampak pergeseran kurva biaya produksi terhadap harga pasar.',
                ],
                'discipline' => 'Ekonomi',
                'difficulty' => 'basic',
                'target_audience' => 'Mahasiswa Pengantar Ilmu Ekonomi & Bisnis',
                'status' => 'published',
                'created_by' => $admin->id,
                'published_at' => now()->subDays(2),
            ]
        );

        $econModule->simulations()->syncWithoutDetaching([
            $simulations['supply-demand']->id => ['order' => 1],
        ]);

        // Experiment for Econ Module
        Experiment::updateOrCreate(
            ['module_id' => $econModule->id, 'title' => 'Mencapai Keseimbangan Harga Pasar P = 50.00'],
            [
                'simulation_id' => $simulations['supply-demand']->id,
                'objective' => 'Sesuaikan pergeseran kurva penawaran dan permintaan hingga harga ekuilibrium pasar mencapai tepat 50.',
                'target' => [
                    'parameter' => 'equilibriumPrice',
                    'targetValue' => 50.0,
                    'tolerance' => 1.0,
                    'unit' => '',
                ],
                'status' => 'in_progress',
            ]
        );

        // Module 4: Sorting Algorithm
        $csModule = Module::updateOrCreate(
            ['slug' => 'komparasi-algoritma-pengurutan'],
            [
                'title' => 'Analisis Kompleksitas Algoritma Pengurutan Data',
                'description' => 'Komparasi interaktif antara algoritma kuadratik O(n²) dan logaritmik O(n log n) dalam mengurutkan elemen data.',
                'content' => <<<'EOT'
## Mengapa Efisiensi Algoritma Penting?

Pengurutan data (sorting) merupakan operasi komputasi yang paling sering dieksekusi dalam sistem informasi. Algoritma seperti Bubble Sort membutuhkan perbandingan $O(n^2)$, yang sangat tidak efisien untuk dataset besar, sementara algoritma berbasis divide-and-conquer dapat menyelesaikannya dalam waktu $O(n \log n)$.
EOT,
                'learning_objectives' => [
                    'Mengamati jumlah perbandingan dan pertukaran elemen pada array acak.',
                    'Memahami perbedaan kompleksitas waktu antara Bubble Sort, Selection Sort, dan Insertion Sort.',
                ],
                'discipline' => 'Informatika',
                'difficulty' => 'intermediate',
                'target_audience' => 'Mahasiswa Teknik Informatika & Ilmu Komputer',
                'status' => 'published',
                'created_by' => $admin->id,
                'published_at' => now()->subDay(),
            ]
        );

        $csModule->simulations()->syncWithoutDetaching([
            $simulations['sorting-algorithms']->id => ['order' => 1],
        ]);

        // Experiment for CS Module
        Experiment::updateOrCreate(
            ['module_id' => $csModule->id, 'title' => 'Uji Kompleksitas Array N = 30 Elemen'],
            [
                'simulation_id' => $simulations['sorting-algorithms']->id,
                'objective' => 'Tingkatkan ukuran array ke 30 elemen untuk mengamati lonjakan komparasi Bubble Sort O(n²).',
                'target' => [
                    'parameter' => 'arraySize',
                    'targetValue' => 30,
                    'tolerance' => 0,
                    'unit' => 'elemen',
                ],
                'status' => 'in_progress',
            ]
        );

        // Module 5: Draft Module (for Admin review & testing)
        $draftModule = Module::updateOrCreate(
            ['slug' => 'kinematika-gerak-peluru-draft'],
            [
                'title' => 'Kinematika Gerak Peluru 2D (Draft Evaluasi)',
                'description' => 'Modul konsep lintasan parabola, jangkauan horizontal maksimum, dan waktu terbang peluru.',
                'content' => "## Draft Materi Gerak Peluru\n\nMeneliti lintasan gerak peluru dengan sudut tembak optimal 45°.",
                'learning_objectives' => [
                    'Menemukan sudut elevasi yang menghasilkan jangkauan terjauh.',
                ],
                'discipline' => 'Fisika',
                'difficulty' => 'intermediate',
                'target_audience' => 'Mahasiswa Semester 1',
                'status' => 'draft',
                'created_by' => $admin->id,
            ]
        );

        $draftModule->simulations()->syncWithoutDetaching([
            $simulations['projectile-motion']->id => ['order' => 1],
        ]);

        // Initial student learning session on Newton's Module
        $session = LearningSession::create([
            'user_id' => $student->id,
            'module_id' => $newtonModule->id,
            'current_state' => ['force' => 40, 'mass' => 5, 'acceleration' => 8.0],
            'progress' => 80,
            'started_at' => now()->subMinutes(45),
            'last_active_at' => now()->subMinutes(10),
        ]);

        // 6. Seed 34 Academic Simulations for Gen Labs
        $this->call(WbiSimulationsSeeder::class);

        // 7. Seed Admin Management Master Data & Curriculum Foundation
        $this->call(AdminManagementSeeder::class);
        $this->call(CurriculumFoundationSeeder::class);
    }
}


