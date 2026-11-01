<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('modules') && !Schema::hasColumn('modules', 'version')) {
            Schema::table('modules', function (Blueprint $table) {
                $table->unsignedInteger('version')->default(1);
            });
        }

        if (Schema::hasTable('simulations') && !Schema::hasColumn('simulations', 'version')) {
            Schema::table('simulations', function (Blueprint $table) {
                $table->unsignedInteger('version')->default(1);
            });
        }

        if (Schema::hasTable('experiment_attempts')) {
            Schema::table('experiment_attempts', function (Blueprint $table) {
                if (!Schema::hasColumn('experiment_attempts', 'prediction')) {
                    $table->string('prediction')->nullable();
                }
                if (!Schema::hasColumn('experiment_attempts', 'simulation_version')) {
                    $table->unsignedInteger('simulation_version')->default(1);
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('modules') && Schema::hasColumn('modules', 'version')) {
            Schema::table('modules', function (Blueprint $table) {
                $table->dropColumn('version');
            });
        }

        if (Schema::hasTable('simulations') && Schema::hasColumn('simulations', 'version')) {
            Schema::table('simulations', function (Blueprint $table) {
                $table->dropColumn('version');
            });
        }

        if (Schema::hasTable('experiment_attempts')) {
            Schema::table('experiment_attempts', function (Blueprint $table) {
                if (Schema::hasColumn('experiment_attempts', 'prediction')) {
                    $table->dropColumn('prediction');
                }
                if (Schema::hasColumn('experiment_attempts', 'simulation_version')) {
                    $table->dropColumn('simulation_version');
                }
            });
        }
    }
};
