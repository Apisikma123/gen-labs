<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SimulationVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'simulation_id',
        'version_number',
        'definition',
        'changelog',
    ];

    protected function casts(): array
    {
        return [
            'version_number' => 'integer',
            'definition' => 'array',
        ];
    }

    public function simulation()
    {
        return $this->belongsTo(Simulation::class);
    }
}
