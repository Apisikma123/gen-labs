<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Experiment extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'simulation_id',
        'title',
        'objective',
        'target',
        'rules',
        'status',
    ];

    protected $casts = [
        'target' => 'array',
        'rules' => 'array',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function simulation()
    {
        return $this->belongsTo(Simulation::class);
    }

    public function attempts()
    {
        return $this->hasMany(ExperimentAttempt::class);
    }
}
