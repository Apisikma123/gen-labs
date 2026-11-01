<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Concept extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'domain',
        'description',
    ];

    public function simulations()
    {
        return $this->hasMany(Simulation::class);
    }
}
