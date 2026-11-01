<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CurriculumAlignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'simulation_id',
        'curriculum_version',
        'education_level',
        'curriculum_phase',
        'grade_level',
        'semester',
        'subject_or_course',
        'chapter_or_unit',
        'topic',
        'learning_objective_code',
        'learning_objective_desc',
        'official_source_title',
        'official_source_code',
        'official_source_url',
        'verification_status',
        'verification_notes',
        'is_primary',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'semester' => 'integer',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function simulation()
    {
        return $this->belongsTo(Simulation::class);
    }
}
