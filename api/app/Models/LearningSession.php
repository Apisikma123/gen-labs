<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LearningSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'module_id',
        'current_state',
        'progress',
        'started_at',
        'completed_at',
        'last_active_at',
    ];

    protected $casts = [
        'current_state' => 'array',
        'progress' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'last_active_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function insights()
    {
        return $this->hasMany(Insight::class, 'session_id');
    }
}
