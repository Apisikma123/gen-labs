<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Simulation extends Model
{
    use HasFactory;

    protected $fillable = [
        'concept_id',
        'slug',
        'title',
        'type',
        'formula',
        'difficulty',
        'configuration',
        'usage_count',
    ];

    protected $casts = [
        'configuration' => 'array',
        'usage_count' => 'integer',
    ];

    public function concept()
    {
        return $this->belongsTo(Concept::class);
    }

    public function modules()
    {
        return $this->belongsToMany(Module::class, 'module_simulations')
            ->withPivot('order');
    }

    public function experiments()
    {
        return $this->hasMany(Experiment::class);
    }

    public function curriculumAlignments()
    {
        return $this->hasMany(CurriculumAlignment::class);
    }

    protected static function booted(): void
    {
        static::saved(function () {
            Module::bumpCatalogCache();
        });

        static::deleted(function () {
            Module::bumpCatalogCache();
        });
    }
}
