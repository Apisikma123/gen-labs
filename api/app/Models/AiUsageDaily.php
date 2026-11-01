<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiUsageDaily extends Model
{
    use HasFactory;

    protected $table = 'ai_usage_daily';

    protected $fillable = [
        'user_id',
        'usage_date',
        'tutor_requests',
    ];

    protected $casts = [
        'usage_date' => 'date',
        'tutor_requests' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
