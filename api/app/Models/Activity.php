<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'user_name',
        'role',
        'action',
        'target',
        'ip_address',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function record($action, $target, $user = null)
    {
        $u = $user ?? auth('sanctum')->user() ?? auth()->user();
        return self::create([
            'user_id' => $u?->id,
            'user_name' => $u?->name ?? 'System Admin',
            'role' => $u?->role ?? 'admin',
            'action' => $action,
            'target' => $target,
            'ip_address' => request()->ip() ?? '127.0.0.1',
        ]);
    }
}
