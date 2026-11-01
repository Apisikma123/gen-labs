<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Concept;
use App\Models\Simulation;
use App\Models\Module;
use App\Models\Experiment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class WbiSimulationsSeeder extends Seeder

{
    /**
     * Seed 34 Academic Simulations for Gen Labs.
     * Fully idempotent with updateOrCreate.
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

        $simulations = [
            [
                'slug' => 'sorting-algorithms',
                'title' => 'Sorting Algorithm Visualizer',
                'discipline' => 'Teknologi Rekayasa Perangkat Lunak',
                'category' => 'Struktur Data & Algoritma',
                'type' => 'trpl',
                'description' => 'Simulasi interaktif konsep Sorting Algorithm Visualizer untuk mahasiswa Teknologi Rekayasa Perangkat Lunak Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'binary-search',
                'title' => 'Binary Search Playground',
                'discipline' => 'Teknologi Rekayasa Perangkat Lunak',
                'category' => 'Algoritma Pencarian',
                'type' => 'trpl',
                'description' => 'Simulasi interaktif konsep Binary Search Playground untuk mahasiswa Teknologi Rekayasa Perangkat Lunak Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'stack-queue',
                'title' => 'Stack & Queue Simulator',
                'discipline' => 'Teknologi Rekayasa Perangkat Lunak',
                'category' => 'Struktur Data Linear',
                'type' => 'trpl',
                'description' => 'Simulasi interaktif konsep Stack & Queue Simulator untuk mahasiswa Teknologi Rekayasa Perangkat Lunak Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'algorithm-complexity',
                'title' => 'Algorithm Complexity Explorer',
                'discipline' => 'Teknologi Rekayasa Perangkat Lunak',
                'category' => 'Analisis Algoritma (Big-O)',
                'type' => 'trpl',
                'description' => 'Simulasi interaktif konsep Algorithm Complexity Explorer untuk mahasiswa Teknologi Rekayasa Perangkat Lunak Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'database-query',
                'title' => 'Database Query Simulator',
                'discipline' => 'Teknologi Rekayasa Perangkat Lunak',
                'category' => 'Basis Data & Pengindeksan',
                'type' => 'trpl',
                'description' => 'Simulasi interaktif konsep Database Query Simulator untuk mahasiswa Teknologi Rekayasa Perangkat Lunak Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'ip-subnet',
                'title' => 'IP Address & Subnet Simulator',
                'discipline' => 'Teknologi Rekayasa Perangkat Lunak',
                'category' => 'Jaringan Komputer',
                'type' => 'trpl',
                'description' => 'Simulasi interaktif konsep IP Address & Subnet Simulator untuk mahasiswa Teknologi Rekayasa Perangkat Lunak Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'logic-gates',
                'title' => 'Logic Gate Playground',
                'discipline' => 'Teknologi Rekayasa Perangkat Lunak',
                'category' => 'Sistem Digital',
                'type' => 'trpl',
                'description' => 'Simulasi interaktif konsep Logic Gate Playground untuk mahasiswa Teknologi Rekayasa Perangkat Lunak Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'accounting-equation',
                'title' => 'Persamaan Akuntansi',
                'discipline' => 'Akuntansi Perpajakan',
                'category' => 'Prinsip Dasar Akuntansi',
                'type' => 'accounting',
                'description' => 'Simulasi interaktif konsep Persamaan Akuntansi untuk mahasiswa Akuntansi Perpajakan Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'journal-entries',
                'title' => 'Jurnal Transaksi (Debit & Kredit)',
                'discipline' => 'Akuntansi Perpajakan',
                'category' => 'Siklus Akuntansi Keuangan',
                'type' => 'accounting',
                'description' => 'Simulasi interaktif konsep Jurnal Transaksi (Debit & Kredit) untuk mahasiswa Akuntansi Perpajakan Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'break-even-point',
                'title' => 'Break-Even Point (BEP)',
                'discipline' => 'Akuntansi Perpajakan',
                'category' => 'Akuntansi Manajemen & Biaya',
                'type' => 'accounting',
                'description' => 'Simulasi interaktif konsep Break-Even Point (BEP) untuk mahasiswa Akuntansi Perpajakan Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'cash-flow',
                'title' => 'Cash Flow Simulator',
                'discipline' => 'Akuntansi Perpajakan',
                'category' => 'Manajemen Kas & Likuiditas',
                'type' => 'accounting',
                'description' => 'Simulasi interaktif konsep Cash Flow Simulator untuk mahasiswa Akuntansi Perpajakan Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'tax-calculation',
                'title' => 'Tax Calculation Playground (PPh 21 TER)',
                'discipline' => 'Akuntansi Perpajakan',
                'category' => 'Perpajakan Indonesia',
                'type' => 'accounting',
                'description' => 'Simulasi interaktif konsep Tax Calculation Playground (PPh 21 TER) untuk mahasiswa Akuntansi Perpajakan Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'financial-ratios',
                'title' => 'Financial Ratio Analyzer',
                'discipline' => 'Akuntansi Perpajakan',
                'category' => 'Analisis Laporan Keuangan',
                'type' => 'accounting',
                'description' => 'Simulasi interaktif konsep Financial Ratio Analyzer untuk mahasiswa Akuntansi Perpajakan Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'budgeting-simulator',
                'title' => 'Budgeting & Variance Simulator',
                'discipline' => 'Akuntansi Perpajakan',
                'category' => 'Penganggaran Perusahaan',
                'type' => 'accounting',
                'description' => 'Simulasi interaktif konsep Budgeting & Variance Simulator untuk mahasiswa Akuntansi Perpajakan Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'marketing-funnel',
                'title' => 'Marketing Funnel Conversion',
                'discipline' => 'Manajemen Pemasaran Internasional',
                'category' => 'Pemasaran Digital',
                'type' => 'marketing',
                'description' => 'Simulasi interaktif konsep Marketing Funnel Conversion untuk mahasiswa Manajemen Pemasaran Internasional Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'pricing-strategy',
                'title' => 'Pricing Strategy & Elasticity',
                'discipline' => 'Manajemen Pemasaran Internasional',
                'category' => 'Strategi Penetapan Harga',
                'type' => 'marketing',
                'description' => 'Simulasi interaktif konsep Pricing Strategy & Elasticity untuk mahasiswa Manajemen Pemasaran Internasional Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'market-segmentation',
                'title' => 'Market Segmentation (TAM-SAM-SOM)',
                'discipline' => 'Manajemen Pemasaran Internasional',
                'category' => 'Riset Pasar Global',
                'type' => 'marketing',
                'description' => 'Simulasi interaktif konsep Market Segmentation (TAM-SAM-SOM) untuk mahasiswa Manajemen Pemasaran Internasional Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'exchange-rate-business',
                'title' => 'Exchange Rate & Forex Hedging',
                'discipline' => 'Manajemen Pemasaran Internasional',
                'category' => 'Keuangan Perdagangan Internasional',
                'type' => 'marketing',
                'description' => 'Simulasi interaktif konsep Exchange Rate & Forex Hedging untuk mahasiswa Manajemen Pemasaran Internasional Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'demand-vs-price',
                'title' => 'Demand vs Price Curve',
                'discipline' => 'Manajemen Pemasaran Internasional',
                'category' => 'Ekonomi Mikro Manajerial',
                'type' => 'marketing',
                'description' => 'Simulasi interaktif konsep Demand vs Price Curve untuk mahasiswa Manajemen Pemasaran Internasional Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'marketing-campaign',
                'title' => 'Marketing Campaign ROI & ROAS',
                'discipline' => 'Manajemen Pemasaran Internasional',
                'category' => 'Manajemen Kampanye Global',
                'type' => 'marketing',
                'description' => 'Simulasi interaktif konsep Marketing Campaign ROI & ROAS untuk mahasiswa Manajemen Pemasaran Internasional Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'precision-farming',
                'title' => 'Precision Farming & Soil Fertility',
                'discipline' => 'Agribisnis Hortikultura',
                'category' => 'Smart Agriculture & Nutrisi',
                'type' => 'agriculture',
                'description' => 'Simulasi interaktif konsep Precision Farming & Soil Fertility untuk mahasiswa Agribisnis Hortikultura Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'irrigation-simulator',
                'title' => 'Drip Irrigation & Water Balance',
                'discipline' => 'Agribisnis Hortikultura',
                'category' => 'Manajemen Sumberdaya Air',
                'type' => 'agriculture',
                'description' => 'Simulasi interaktif konsep Drip Irrigation & Water Balance untuk mahasiswa Agribisnis Hortikultura Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'greenhouse-climate',
                'title' => 'Greenhouse Climate & VPD Controller',
                'discipline' => 'Agribisnis Hortikultura',
                'category' => 'Klimatologi & Lingkungan Terkendali',
                'type' => 'agriculture',
                'description' => 'Simulasi interaktif konsep Greenhouse Climate & VPD Controller untuk mahasiswa Agribisnis Hortikultura Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'hydroponic-simulator',
                'title' => 'Hydroponic Nutrition (EC, pH, DO)',
                'discipline' => 'Agribisnis Hortikultura',
                'category' => 'Sistem Hidroponik Komersial',
                'type' => 'agriculture',
                'description' => 'Simulasi interaktif konsep Hydroponic Nutrition (EC, pH, DO) untuk mahasiswa Agribisnis Hortikultura Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'plant-density',
                'title' => 'Plant Density & Spatial Spacing',
                'discipline' => 'Agribisnis Hortikultura',
                'category' => 'Agronomi & Populasi Tanaman',
                'type' => 'agriculture',
                'description' => 'Simulasi interaktif konsep Plant Density & Spatial Spacing untuk mahasiswa Agribisnis Hortikultura Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'crop-yield-estimator',
                'title' => 'Crop Yield & Harvest Estimator',
                'discipline' => 'Agribisnis Hortikultura',
                'category' => 'Perencanaan Produksi Hortikultura',
                'type' => 'agriculture',
                'description' => 'Simulasi interaktif konsep Crop Yield & Harvest Estimator untuk mahasiswa Agribisnis Hortikultura Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'agri-supply-chain',
                'title' => 'Cold Chain & Post-Harvest Loss',
                'discipline' => 'Agribisnis Hortikultura',
                'category' => 'Rantai Pasok Agribisnis',
                'type' => 'agriculture',
                'description' => 'Simulasi interaktif konsep Cold Chain & Post-Harvest Loss untuk mahasiswa Agribisnis Hortikultura Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'event-budget',
                'title' => 'Event Budget & Cost Breakdown',
                'discipline' => 'Pengelolaan Konvensi dan Acara',
                'category' => 'Manajemen Keuangan Acara',
                'type' => 'event',
                'description' => 'Simulasi interaktif konsep Event Budget & Cost Breakdown untuk mahasiswa Pengelolaan Konvensi dan Acara Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'event-capacity-planner',
                'title' => 'Event Capacity & Crowd Density',
                'discipline' => 'Pengelolaan Konvensi dan Acara',
                'category' => 'Operasional Venue MICE',
                'type' => 'event',
                'description' => 'Simulasi interaktif konsep Event Capacity & Crowd Density untuk mahasiswa Pengelolaan Konvensi dan Acara Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'ticket-pricing',
                'title' => 'Tiered Ticket Pricing Strategy',
                'discipline' => 'Pengelolaan Konvensi dan Acara',
                'category' => 'Pemasaran & Penjualan Tiket',
                'type' => 'event',
                'description' => 'Simulasi interaktif konsep Tiered Ticket Pricing Strategy untuk mahasiswa Pengelolaan Konvensi dan Acara Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'event-break-even',
                'title' => 'Event Break-Even & Attendance Target',
                'discipline' => 'Pengelolaan Konvensi dan Acara',
                'category' => 'Kelayakan Finansial Acara',
                'type' => 'event',
                'description' => 'Simulasi interaktif konsep Event Break-Even & Attendance Target untuk mahasiswa Pengelolaan Konvensi dan Acara Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'event-timeline',
                'title' => 'Event Timeline & Critical Path (CPM)',
                'discipline' => 'Pengelolaan Konvensi dan Acara',
                'category' => 'Manajemen Proyek Acara',
                'type' => 'event',
                'description' => 'Simulasi interaktif konsep Event Timeline & Critical Path (CPM) untuk mahasiswa Pengelolaan Konvensi dan Acara Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'venue-layout',
                'title' => 'Venue Floor Plan & Booth Allocation',
                'discipline' => 'Pengelolaan Konvensi dan Acara',
                'category' => 'Tata Letak Pameran & Expo',
                'type' => 'event',
                'description' => 'Simulasi interaktif konsep Venue Floor Plan & Booth Allocation untuk mahasiswa Pengelolaan Konvensi dan Acara Politeknik Wilmar Bisnis Indonesia.',
            ],
            [
                'slug' => 'event-risk-simulator',
                'title' => 'Event Risk Assessment & Contingency',
                'discipline' => 'Pengelolaan Konvensi dan Acara',
                'category' => 'Keselamatan & Manajemen Risiko',
                'type' => 'event',
                'description' => 'Simulasi interaktif konsep Event Risk Assessment & Contingency untuk mahasiswa Pengelolaan Konvensi dan Acara Politeknik Wilmar Bisnis Indonesia.',
            ],
        ];

        foreach ($simulations as $data) {
            // 1. Ensure Concept exists
            $conceptSlug = Str::slug($data['category']);
            $concept = Concept::updateOrCreate(
                ['slug' => $conceptSlug],
                [
                    'name' => $data['category'],
                    'category' => $data['discipline'],
                    'description' => 'Konsep akademik ' . $data['category'] . ' di program studi ' . $data['discipline'],
                ]
            );

            // 2. Ensure Simulation exists
            $sim = Simulation::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'title' => $data['title'],
                    'concept_id' => $concept->id,
                    'type' => $data['type'],
                    'formula' => 'f(P) \to \text{Respons Sistem}',
                    'difficulty' => 'intermediate',
                    'configuration' => [
                        'type' => $data['type'],
                        'concept' => $data['slug'],
                        'title' => $data['title'],
                        'discipline' => $data['discipline'],
                        'category' => $data['category'],
                    ],
                    'usage_count' => rand(40, 150),
                ]
            );

            // 3. Ensure Module exists
            $moduleSlug = 'wbi-' . $data['slug'];
            $module = Module::updateOrCreate(
                ['slug' => $moduleSlug],
                [
                    'title' => $data['title'] . ' — Laboratorium Interaktif Gen Labs',
                    'description' => $data['description'],
                    'content' => "## Pengantar Praktikum\n\nModul eksperimen digital untuk menguji pemahaman konsep **" . $data['title'] . "** pada program studi " . $data['discipline'] . ". Ubah kontrol parameter untuk mengamati respon deterministik sistem.",
                    'learning_objectives' => [
                        'Memahami hubungan kausal antar parameter dalam ' . $data['title'],
                        'Menguji kondisi batas dan stabilitas sistem secara empiris',
                        'Menyelesaikan target tantangan eksperimen dengan tepat',
                    ],
                    'discipline' => $data['discipline'],
                    'difficulty' => 'intermediate',
                    'target_audience' => 'Mahasiswa & Praktisi ' . $data['discipline'] . ' Gen Labs',
                    'status' => 'published',
                    'created_by' => $admin->id,
                    'published_at' => now(),
                ]
            );

            $module->simulations()->syncWithoutDetaching([
                $sim->id => ['order' => 1],
            ]);

            // 4. Ensure Playable Experiment exists
            Experiment::updateOrCreate(
                [
                    'module_id' => $module->id,
                    'title' => 'Eksperimen ' . $data['title'] . ' #1',
                ],
                [
                    'simulation_id' => $sim->id,
                    'objective' => 'Sesuaikan variabel kontrol hingga indikator sistem mencapai status optimal.',
                    'target' => [
                        'parameter' => 'targetMetric',
                        'targetValue' => 100,
                        'tolerance' => 5,
                        'unit' => '',
                    ],
                    'rules' => [
                        'description' => 'Pertahankan parameter utama dalam batas aman operasional.',
                    ],
                    'status' => 'in_progress',
                ]
            );
        }

        $this->command->info('Successfully seeded 34 Gen Labs Academic Simulations, Modules, and Experiments!');
    }
}
