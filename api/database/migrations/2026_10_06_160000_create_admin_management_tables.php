<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add status to users table if not exists
        if (!Schema::hasColumn('users', 'status')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('status')->default('active')->index()->after('role');
            });
        }

        // 2. Study Programs / Program Studi Master Data
        if (!Schema::hasTable('study_programs')) {
            Schema::create('study_programs', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('code')->nullable();
                $table->text('description')->nullable();
                $table->string('status')->default('active')->index(); // 'active', 'inactive'
                $table->timestamps();
            });
        }

        // 3. Topics Master Data
        if (!Schema::hasTable('topics')) {
            Schema::create('topics', function (Blueprint $table) {
                $table->id();
                $table->foreignId('study_program_id')->nullable()->constrained('study_programs')->nullOnDelete();
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('status')->default('active')->index(); // 'active', 'inactive'
                $table->timestamps();
            });
        }

        // 4. Difficulties Master Data
        if (!Schema::hasTable('difficulties')) {
            Schema::create('difficulties', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique(); // 'basic', 'intermediate', 'advanced'
                $table->string('status')->default('active')->index(); // 'active', 'inactive'
                $table->timestamps();
            });
        }

        // 5. Activity Log Table
        if (!Schema::hasTable('activities')) {
            Schema::create('activities', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('user_name')->nullable();
                $table->string('role')->nullable();
                $table->string('action'); // 'create', 'update', 'publish', 'archive', 'deactivate', etc.
                $table->string('target'); // e.g. "Simulator: Break Even Point"
                $table->string('ip_address', 45)->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
        Schema::dropIfExists('difficulties');
        Schema::dropIfExists('topics');
        Schema::dropIfExists('study_programs');
        if (Schema::hasColumn('users', 'status')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('status');
            });
        }
    }
};
