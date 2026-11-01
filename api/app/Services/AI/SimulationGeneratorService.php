<?php

namespace App\Services\AI;

use App\Models\Simulation;
use App\Models\Concept;
use Illuminate\Support\Str;

class SimulationGeneratorService
{
    /**
     * Generate structured simulation schema from natural language prompt (PRD Section 9 & 16)
     */
    public function generate(string $prompt): Simulation
    {
        $cleaned = trim($prompt);
        $slug = Str::slug($cleaned);
        if (strlen($slug) > 80) {
            $slug = substr($slug, 0, 80);
        }

        // Domain & Discipline Detection
        $domain = 'Fisika';
        $disciplineSlug = 'physics';
        $engine = 'physics';
        $formula = 'y = f(x)';

        $lower = strtolower($cleaned);
        if (str_contains($lower, 'pasar') || str_contains($lower, 'uang') || str_contains($lower, 'bunga') || str_contains($lower, 'ekonomi')) {
            $domain = 'Ekonomi';
            $disciplineSlug = 'economics';
            $engine = 'economics';
            $formula = 'Ekuilibrium Q_d = Q_s';
        } else if (str_contains($lower, 'graf') || str_contains($lower, 'sort') || str_contains($lower, 'biner') || str_contains($lower, 'algoritma')) {
            $domain = 'Informatika';
            $disciplineSlug = 'computer-science';
            $engine = 'computer-science';
            $formula = 'T(n) = O(log n)';
        } else if (str_contains($lower, 'regresi') || str_contains($lower, 'distribusi') || str_contains($lower, 'statistik')) {
            $domain = 'Statistika';
            $disciplineSlug = 'statistics';
            $engine = 'statistics';
            $formula = 'ŷ = β₀ + β₁x';
        } else if (str_contains($lower, 'vektor') || str_contains($lower, 'fungsi') || str_contains($lower, 'matematika')) {
            $domain = 'Matematika';
            $disciplineSlug = 'mathematics';
            $engine = 'mathematics';
            $formula = 'f(x) = ax + b';
        } else if (str_contains($lower, 'ph') || str_contains($lower, 'asam') || str_contains($lower, 'basa') || str_contains($lower, 'kimia')) {
            $domain = 'Kimia';
            $disciplineSlug = 'chemistry';
            $engine = 'chemistry';
            $formula = 'pH = -log[H+]';
        }

        // Standardized variables
        $variables = [
            [
                'id' => 'var_primary',
                'label' => 'Parameter Utama (X₁)',
                'unit' => 'satuan',
                'min' => 1,
                'max' => 100,
                'default' => 25,
                'step' => 1,
            ],
            [
                'id' => 'var_secondary',
                'label' => 'Parameter Kontrol (X₂)',
                'unit' => 'satuan',
                'min' => 0,
                'max' => 50,
                'default' => 10,
                'step' => 0.5,
            ],
        ];

        // Ensure slug uniqueness
        $uniqueSlug = $slug . '-' . substr(md5(uniqid()), 0, 6);

        // Create or find concept
        $concept = Concept::firstOrCreate(
            ['slug' => Str::slug($domain . '-' . substr($cleaned, 0, 30))],
            [
                'name' => ucwords($cleaned),
                'domain' => $domain,
                'description' => "Eksplorasi fenomena {$cleaned} dalam lingkup {$domain}.",
            ]
        );

        // Save generated simulation draft
        return Simulation::create([
            'concept_id' => $concept->id,
            'slug' => $uniqueSlug,
            'title' => ucwords($cleaned),
            'description' => "Modul simulasi interaktif untuk memahami {$cleaned} dengan manipulasi variabel langsung.",
            'discipline' => $domain,
            'discipline_slug' => $disciplineSlug,
            'engine' => $engine,
            'category' => 'AI Generated',
            'formula' => $formula,
            'difficulty' => 'Menengah',
            'status' => 'published',
            'is_ai_generated' => true,
            'prompt' => $cleaned,
            'variables' => $variables,
            'definition' => [
                'simulation' => $uniqueSlug,
                'title' => ucwords($cleaned),
                'parameters' => $variables,
            ],
            'usage_count' => 1,
            'version' => 1,
        ]);
    }
}
