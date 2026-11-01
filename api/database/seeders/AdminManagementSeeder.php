<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Difficulty;
use App\Models\StudyProgram;
use App\Models\Topic;
use App\Models\Activity;

class AdminManagementSeeder extends Seeder
{
    public function run(): void
    {
        Difficulty::firstOrCreate(['slug' => 'basic'], ['name' => 'Beginner', 'status' => 'active']);
        Difficulty::firstOrCreate(['slug' => 'intermediate'], ['name' => 'Intermediate', 'status' => 'active']);
        Difficulty::firstOrCreate(['slug' => 'advanced'], ['name' => 'Advanced', 'status' => 'active']);

        $sp1 = StudyProgram::firstOrCreate(['code' => 'PHYS'], ['name' => 'Fisika & Sains Terapan', 'description' => 'Mekanika, termodinamika, gelombang dan optika', 'status' => 'active']);
        $sp2 = StudyProgram::firstOrCreate(['code' => 'MATH'], ['name' => 'Matematika & Komputasi', 'description' => 'Kalkulus, aljabar linier, analisis fungsi dan probabilitas', 'status' => 'active']);
        $sp3 = StudyProgram::firstOrCreate(['code' => 'CS'], ['name' => 'Ilmu Komputer & Algoritma', 'description' => 'Struktur data, komputasi visual, dan rekayasa perangkat lunak', 'status' => 'active']);
        $sp4 = StudyProgram::firstOrCreate(['code' => 'ECON'], ['name' => 'Ekonomi & Manajemen Bisnis', 'description' => 'Mikroekonomi, makroekonomi, titik impas, pasar dan ekonometrika', 'status' => 'active']);

        Topic::firstOrCreate(['name' => 'Hukum Gerak Newton'], ['study_program_id' => $sp1->id, 'description' => 'Hukum I, II, dan III Newton tentang gerak dan gaya', 'status' => 'active']);
        Topic::firstOrCreate(['name' => 'Gerak Parabola & Gravitasi'], ['study_program_id' => $sp1->id, 'description' => 'Lintasan gerak peluru di bawah medan gravitasi', 'status' => 'active']);
        Topic::firstOrCreate(['name' => 'Analisis Fungsi & Kurva'], ['study_program_id' => $sp2->id, 'description' => 'Karakteristik fungsi kuadrat dan titik ekstrim', 'status' => 'active']);
        Topic::firstOrCreate(['name' => 'Algoritma Pencarian & Pengurutan'], ['study_program_id' => $sp3->id, 'description' => 'Binary search, sorting, dan kompleksitas Big-O', 'status' => 'active']);
        Topic::firstOrCreate(['name' => 'Titik Impas & Analisis Biaya'], ['study_program_id' => $sp4->id, 'description' => 'Break Even Point, fixed cost, dan variabel laba', 'status' => 'active']);

        if (Activity::count() === 0) {
            Activity::create(['user_name' => 'Dr. Hendra Wijaya', 'role' => 'admin', 'action' => 'Dibuat simulator', 'target' => 'Hukum II Newton', 'ip_address' => '127.0.0.1']);
            Activity::create(['user_name' => 'Dr. Hendra Wijaya', 'role' => 'admin', 'action' => 'Dipublikasikan simulator', 'target' => 'Break Even Point (BEP)', 'ip_address' => '127.0.0.1']);
            Activity::create(['user_name' => 'Dr. Hendra Wijaya', 'role' => 'admin', 'action' => 'Dibuat simulator', 'target' => 'Pencarian Biner (Binary Search)', 'ip_address' => '127.0.0.1']);
            Activity::create(['user_name' => 'Budi Santoso', 'role' => 'student', 'action' => 'Eksperimen selesai', 'target' => 'Eksperimen Percepatan Newton', 'ip_address' => '127.0.0.1']);
        }
    }
}
