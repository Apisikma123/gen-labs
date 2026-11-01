<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Insight extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'session_id',
        'title',
        'content',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function session()
    {
        return $this->belongsTo(LearningSession::class, 'session_id');
    }
}
