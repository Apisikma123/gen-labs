<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiSystemUsageDaily extends Model
{
    use HasFactory;

    protected $table = 'ai_system_usage_daily';

    protected $fillable = [
        'usage_date',
        'total_requests',
        'successful_requests',
        'rejected_scope',
        'rejected_quota',
        'rejected_rate',
        'gemini_failures',
        'total_latency_ms',
    ];

    protected $casts = [
        'usage_date' => 'date',
        'total_requests' => 'integer',
        'successful_requests' => 'integer',
        'rejected_scope' => 'integer',
        'rejected_quota' => 'integer',
        'rejected_rate' => 'integer',
        'gemini_failures' => 'integer',
        'total_latency_ms' => 'integer',
    ];
}
