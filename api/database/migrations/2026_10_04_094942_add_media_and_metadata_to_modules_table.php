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
        Schema::table('modules', function (Blueprint $table) {
            $table->string('cover_image', 500)->nullable()->after('description');
            $table->string('thumbnail_image', 500)->nullable()->after('cover_image');
            $table->string('topic', 150)->nullable()->after('discipline');
            $table->string('estimated_time', 50)->default('10–15 menit')->after('difficulty');
            $table->boolean('ai_thumbnail')->default(false)->after('thumbnail_image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->dropColumn(['cover_image', 'thumbnail_image', 'topic', 'estimated_time', 'ai_thumbnail']);
        });
    }
};
