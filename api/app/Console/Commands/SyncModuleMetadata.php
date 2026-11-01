<?php

namespace App\Console\Commands;

use App\Models\Module;
use App\Services\Media\ImageOptimizationService;
use Illuminate\Console\Command;

class SyncModuleMetadata extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'genlabs:sync-metadata';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync topic, estimated_time, and generate AI concept thumbnails for all modules';

    /**
     * Execute the console command.
     */
    public function handle(ImageOptimizationService $imageService)
    {
        $this->info('Starting GEN LABS module metadata and thumbnail synchronization...');

        $modules = Module::with('simulations')->get();
        $count = 0;

        foreach ($modules as $module) {
            $discipline = $module->discipline ?: 'Sains';
            $sim = $module->simulations->first();
            $simConfig = $sim ? ($sim->configuration ?? []) : [];

            // 1. Resolve Topic
            $topic = $module->topic;
            if (!$topic) {
                if (!empty($simConfig['category'])) {
                    $topic = $simConfig['category'];
                } else {
                    $topic = $this->inferTopic($discipline, $module->title);
                }
            }

            // 2. Resolve Estimated Time
            $estTime = $module->estimated_time ?: ($module->difficulty === 'basic' ? '10–15 menit' : '15–20 menit');

            // 3. Generate Thumbnail if empty
            $thumbUrl = $module->thumbnail_image;
            $isAi = $module->ai_thumbnail;

            if (empty($thumbUrl) || !file_exists(public_path($thumbUrl))) {
                $generated = $imageService->generateAiThumbnail($module->title, $discipline, $topic);
                $thumbUrl = $generated['url'];
                $isAi = true;
            }

            $module->update([
                'topic' => $topic,
                'estimated_time' => $estTime,
                'thumbnail_image' => $thumbUrl,
                'cover_image' => $module->cover_image ?: $thumbUrl,
                'ai_thumbnail' => $isAi,
            ]);

            $count++;
            $this->line("  ✓ [{$module->id}] {$module->title} | Topik: {$topic} | Waktu: {$estTime}");
        }

        \Illuminate\Support\Facades\Cache::forget('genlabs_curriculum_options_cache');
        $this->info("Successfully synchronized {$count} modules with complete campus metadata and optimized thumbnails!");
        return 0;
    }

    protected function inferTopic(string $discipline, string $title): string
    {
        $d = strtolower($discipline);
        $t = strtolower($title);

        if (str_contains($d, 'perangkat lunak') || str_contains($d, 'trpl') || str_contains($d, 'informatika')) {
            if (str_contains($t, 'sort') || str_contains($t, 'search') || str_contains($t, 'binary') || str_contains($t, 'tree') || str_contains($t, 'graph')) {
                return 'Struktur Data & Algoritma';
            }
            return 'Rekayasa Perangkat Lunak';
        }

        if (str_contains($d, 'akuntansi') || str_contains($d, 'perpajakan')) {
            if (str_contains($t, 'pajak') || str_contains($t, 'pph') || str_contains($t, 'ppn')) {
                return 'Perpajakan Bisnis';
            }
            if (str_contains($t, 'bep') || str_contains($t, 'break') || str_contains($t, 'biaya') || str_contains($t, 'cfo')) {
                return 'Analisis Biaya & Laba';
            }
            return 'Akuntansi Keuangan';
        }

        if (str_contains($d, 'pemasaran') || str_contains($d, 'bisnis')) {
            if (str_contains($t, 'demand') || str_contains($t, 'price') || str_contains($t, 'harga') || str_contains($t, 'elastis')) {
                return 'Penetapan Harga & Permintaan';
            }
            if (str_contains($t, 'cac') || str_contains($t, 'akuisisi') || str_contains($t, 'campaign')) {
                return 'Riset Pemasaran';
            }
            return 'Perencanaan Bisnis';
        }

        if (str_contains($d, 'hortikultura') || str_contains($d, 'agribisnis')) {
            if (str_contains($t, 'fertigasi') || str_contains($t, 'nutrisi') || str_contains($t, 'pupuk')) {
                return 'Fertigasi & Nutrisi Presisi';
            }
            if (str_contains($t, 'panen') || str_contains($t, 'yield') || str_contains($t, 'brix')) {
                return 'Fisiologi & Mutu Hasil';
            }
            return 'Budidaya Hortikultura';
        }

        if (str_contains($d, 'konvensi') || str_contains($d, 'acara') || str_contains($d, 'event')) {
            if (str_contains($t, 'tiket') || str_contains($t, 'ticket') || str_contains($t, 'revenue')) {
                return 'Diferensiasi Harga Acara';
            }
            if (str_contains($t, 'risiko') || str_contains($t, 'risk') || str_contains($t, 'kontinjensi')) {
                return 'Manajemen Risiko Acara';
            }
            return 'Pengelolaan Event & Acara';
        }

        if (str_contains($d, 'fisika')) {
            return 'Dinamika & Kinematika';
        }

        if (str_contains($d, 'matematika')) {
            return 'Aljabar & Fungsi';
        }

        if (str_contains($d, 'kimia')) {
            return 'Keseimbangan Asam & Basa';
        }

        if (str_contains($d, 'statistika')) {
            return 'Distribusi & Regresi';
        }

        return 'Konsep Dasar';
    }
}
