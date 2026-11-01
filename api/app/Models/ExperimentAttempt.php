<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExperimentAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'experiment_id',
        'user_id',
        'state',
        'prediction',
        'result',
        'delta',
        'passed',
        'simulation_version',
    ];

    protected $casts = [
        'state' => 'array',
        'result' => 'array',
        'delta' => 'decimal:4',
        'passed' => 'boolean',
    ];

    public function experiment()
    {
        return $this->belongsTo(Experiment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
