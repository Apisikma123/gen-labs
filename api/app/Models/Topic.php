<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Topic extends Model
{
    use HasFactory;

    protected $fillable = [
        'study_program_id',
        'name',
        'description',
        'status',
    ];

    public function studyProgram()
    {
        return $this->belongsTo(StudyProgram::class);
    }
}
