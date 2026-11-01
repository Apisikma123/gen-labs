<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'module_id',
        'question',
        'answer',
        'simulation_state',
        'follow_ups',
    ];

    protected $casts = [
        'simulation_state' => 'array',
        'follow_ups' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }
}
