<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ModuleSimulation extends Pivot
{
    protected $table = 'module_simulations';

    protected $fillable = [
        'module_id',
        'simulation_id',
        'order',
    ];
}
