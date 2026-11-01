<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'title',
        'description',
        'cover_image',
        'thumbnail_image',
        'ai_thumbnail',
        'content',
        'learning_objectives',
        'discipline',
        'topic',
        'difficulty',
        'estimated_time',
        'target_audience',
        'education_level',
        'grade_level',
        'curriculum_phase',
        'subject_name',
        'curriculum_source',
        'verification_status',
        'status',
        'version',
        'created_by',
        'published_at',
    ];

    protected $casts = [
        'learning_objectives' => 'array',
        'published_at' => 'datetime',
        'ai_thumbnail' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function curriculumAlignments()
    {
        return $this->hasMany(CurriculumAlignment::class);
    }

    public function simulations()
    {
        return $this->belongsToMany(Simulation::class, 'module_simulations')
            ->withPivot('order')
            ->orderBy('module_simulations.order');
    }

    public function experiments()
    {
        return $this->hasMany(Experiment::class);
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function insights()
    {
        return $this->hasMany(Insight::class);
    }

    public function learningSessions()
    {
        return $this->hasMany(LearningSession::class);
    }

    protected static function booted(): void
    {
        static::saved(function () {
            static::bumpCatalogCache();
        });

        static::deleted(function () {
            static::bumpCatalogCache();
        });
    }

    public static function bumpCatalogCache(): int
    {
        \Illuminate\Support\Facades\Cache::forget('genlabs_curriculum_options_cache');

        $microTime = (int) (microtime(true) * 1000000);

        try {
            return \Illuminate\Support\Facades\Cache::lock('catalog_version_bump_lock', 5)->block(2, function () use ($microTime) {
                $curr = (int) \Illuminate\Support\Facades\Cache::get('modules_catalog_ver', 0);
                $next = max($curr + 1, $microTime);
                \Illuminate\Support\Facades\Cache::forever('modules_catalog_ver', $next);
                return $next;
            });
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Cache::forever('modules_catalog_ver', $microTime);
            return $microTime;
        }
    }
}
