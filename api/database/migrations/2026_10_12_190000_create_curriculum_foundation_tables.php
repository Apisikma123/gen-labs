<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Non-destructive curriculum foundation schema.
     */
    public function up(): void
    {
        // 1. Create dedicated curriculum_alignments table for multi-tier curriculum cross-mappings
        if (!Schema::hasTable('curriculum_alignments')) {
            Schema::create('curriculum_alignments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
                $table->foreignId('simulation_id')->nullable()->constrained('simulations')->nullOnDelete();

                // Standard Curriculum Identifiers
                $table->string('curriculum_version', 150)->index(); // e.g. "BSKAP 046/H/KR/2025", "Spektrum SMK 27/D/KPT/2022", "SN-Dikti CPL WBI 2024"
                $table->string('education_level', 50)->index();     // "smp", "sma", "smk", "higher_education"
                $table->string('curriculum_phase', 20)->nullable()->index(); // "D", "E", "F", "PT"
                $table->string('grade_level', 30)->nullable();       // "7", "8", "9", "10", "11", "12", "semester_1", etc.
                $table->unsignedTinyInteger('semester')->nullable();

                // Academic Subject & Topic Structure
                $table->string('subject_or_course', 150)->index();   // "IPA", "Fisika", "Matematika", "Informatika", "Algoritma & Pemrograman", etc.
                $table->string('chapter_or_unit', 200)->nullable();  // "Bab: Gerak dan Gaya", etc.
                $table->string('topic', 200)->nullable();
                $table->string('learning_objective_code', 100)->nullable(); // "CP-IPA-D.2", etc.
                $table->text('learning_objective_desc')->nullable();

                // Official Legal / Institutional Source
                $table->string('official_source_title', 255);       // "Keputusan Kepala BSKAP Nomor 046/H/KR/2025", etc.
                $table->string('official_source_code', 100);        // "BSKAP-046-2025", etc.
                $table->string('official_source_url', 255)->nullable();

                // Pedagogical Verification State
                $table->string('verification_status', 50)->default('unverified')->index(); // "verified", "proposed", "unverified"
                $table->text('verification_notes')->nullable();
                $table->boolean('is_primary')->default(false)->index();

                $table->timestamps();

                // Composite Index for efficient discovery queries
                $table->index(['education_level', 'curriculum_phase'], 'idx_edu_phase');
                $table->index(['education_level', 'subject_or_course'], 'idx_edu_subject');
            });
        }

        // 2. Add nullable curriculum convenience columns to modules table for high-performance direct filtering
        Schema::table('modules', function (Blueprint $table) {
            if (!Schema::hasColumn('modules', 'education_level')) {
                $table->string('education_level', 50)->nullable()->index()->after('target_audience');
            }
            if (!Schema::hasColumn('modules', 'grade_level')) {
                $table->string('grade_level', 30)->nullable()->after('education_level');
            }
            if (!Schema::hasColumn('modules', 'curriculum_phase')) {
                $table->string('curriculum_phase', 20)->nullable()->index()->after('grade_level');
            }
            if (!Schema::hasColumn('modules', 'subject_name')) {
                $table->string('subject_name', 150)->nullable()->index()->after('curriculum_phase');
            }
            if (!Schema::hasColumn('modules', 'curriculum_source')) {
                $table->string('curriculum_source', 255)->nullable()->after('subject_name');
            }
            if (!Schema::hasColumn('modules', 'verification_status')) {
                $table->string('verification_status', 50)->default('unverified')->index()->after('curriculum_source');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('curriculum_alignments');

        // SQLite index cleanup before column drop
        Schema::table('modules', function (Blueprint $table) {
            foreach (['education_level', 'curriculum_phase', 'subject_name', 'verification_status'] as $indexCol) {
                if (Schema::hasColumn('modules', $indexCol)) {
                    try {
                        $table->dropIndex([$indexCol]);
                    } catch (\Throwable $e) {
                        // ignore if index already dropped
                    }
                }
            }
        });

        Schema::table('modules', function (Blueprint $table) {
            $columnsToDrop = [];
            foreach (['education_level', 'grade_level', 'curriculum_phase', 'subject_name', 'curriculum_source', 'verification_status'] as $col) {
                if (Schema::hasColumn('modules', $col)) {
                    $columnsToDrop[] = $col;
                }
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
