<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for SIMULA Module-Based Architecture (Section 14).
     */
    public function up(): void
    {
        // 1. Concepts Table
        Schema::create('concepts', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 100)->unique();
            $table->string('name');
            $table->string('category', 100)->index(); // Fisika, Matematika, Informatika, etc.
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 2. Simulations Table (Controlled schemas, no arbitrary frontend code)
        Schema::create('simulations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('concept_id')->nullable()->constrained('concepts')->nullOnDelete();
            $table->string('slug', 120)->unique();
            $table->string('title');
            $table->string('type', 100)->index(); // physics, math, computer-science, economics, chemistry
            $table->string('formula')->nullable();
            $table->string('difficulty', 50)->default('basic');
            $table->json('configuration')->nullable(); // variables, interactions, defaults
            $table->unsignedInteger('usage_count')->default(0);
            $table->timestamps();
        });

        // 3. Modules Table (The Core Learning Entity)
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->longText('content')->nullable(); // Pengantar, Konsep, Materi, Contoh Nyata
            $table->json('learning_objectives')->nullable();
            $table->string('discipline', 100)->default('Fisika')->index();
            $table->string('difficulty', 50)->default('basic')->index(); // basic, intermediate, advanced
            $table->string('target_audience')->nullable(); // e.g. "Mahasiswa semester 1"
            $table->string('status', 50)->default('draft')->index(); // draft, published, archived
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        // 4. ModuleSimulation (Pivot linking modules to their controlled simulations)
        Schema::create('module_simulations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->foreignId('simulation_id')->constrained('simulations')->cascadeOnDelete();
            $table->unsignedInteger('order')->default(1);
            $table->timestamps();
        });

        // 5. Learning Sessions (Student Session on a specific Module)
        Schema::create('learning_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->json('current_state')->nullable(); // simulation parameters snapshot
            $table->unsignedTinyInteger('progress')->default(0);
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('last_active_at')->useCurrent();
            $table->timestamps();
        });

        // 6. Experiments (Target challenges within a module)
        Schema::create('experiments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->foreignId('simulation_id')->nullable()->constrained('simulations')->nullOnDelete();
            $table->string('title');
            $table->text('objective');
            $table->json('target'); // target parameter, expected value, tolerance
            $table->json('rules')->nullable(); // variables held constant
            $table->string('status', 50)->default('pending')->index();
            $table->timestamps();
        });

        // 7. Experiment Attempts (Student challenge runs)
        Schema::create('experiment_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('experiment_id')->constrained('experiments')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('state'); // parameters and outputs at time of attempt
            $table->json('result'); // passed, delta, feedback message
            $table->decimal('delta', 10, 4)->nullable();
            $table->boolean('passed')->default(false)->index();
            $table->timestamps();
        });

        // 8. Questions & AI Tutor Context Table
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->text('question');
            $table->text('answer');
            $table->json('simulation_state')->nullable();
            $table->json('follow_ups')->nullable();
            $table->timestamps();
        });

        // 9. Insights Table
        Schema::create('insights', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->foreignId('session_id')->nullable()->constrained('learning_sessions')->nullOnDelete();
            $table->string('title');
            $table->text('content');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('insights');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('experiment_attempts');
        Schema::dropIfExists('experiments');
        Schema::dropIfExists('learning_sessions');
        Schema::dropIfExists('module_simulations');
        Schema::dropIfExists('modules');
        Schema::dropIfExists('simulations');
        Schema::dropIfExists('concepts');
    }
};
