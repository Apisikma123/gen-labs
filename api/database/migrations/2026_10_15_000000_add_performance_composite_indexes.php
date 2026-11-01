<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * High-performance composite indexes for sessions, published catalog ordering, and experiment history.
     */
    public function up(): void
    {
        Schema::table('learning_sessions', function (Blueprint $table) {
            $table->index(['user_id', 'last_active_at'], 'idx_sessions_user_active');
            $table->index(['user_id', 'module_id'], 'idx_sessions_user_module');
        });

        Schema::table('modules', function (Blueprint $table) {
            $table->index(['status', 'published_at'], 'idx_modules_status_published');
        });

        Schema::table('experiment_attempts', function (Blueprint $table) {
            $table->index(['user_id', 'created_at'], 'idx_attempts_user_created');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('learning_sessions', function (Blueprint $table) {
            $table->dropIndex('idx_sessions_user_active');
            $table->dropIndex('idx_sessions_user_module');
        });

        Schema::table('modules', function (Blueprint $table) {
            $table->dropIndex('idx_modules_status_published');
        });

        Schema::table('experiment_attempts', function (Blueprint $table) {
            $table->dropIndex('idx_attempts_user_created');
        });
    }
};
