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
        // 1. Per-User Daily AI Quota tracking
        Schema::create('ai_usage_daily', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->date('usage_date');
            $table->unsignedInteger('tutor_requests')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'usage_date'], 'user_daily_usage_unique');
        });

        // 2. Global AI System Usage & Emergency Budget tracking
        Schema::create('ai_system_usage_daily', function (Blueprint $table) {
            $table->id();
            $table->date('usage_date')->unique();
            $table->unsignedInteger('total_requests')->default(0);
            $table->unsignedInteger('successful_requests')->default(0);
            $table->unsignedInteger('rejected_scope')->default(0);
            $table->unsignedInteger('rejected_quota')->default(0);
            $table->unsignedInteger('rejected_rate')->default(0);
            $table->unsignedInteger('gemini_failures')->default(0);
            $table->unsignedBigInteger('total_latency_ms')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_system_usage_daily');
        Schema::dropIfExists('ai_usage_daily');
    }
};
