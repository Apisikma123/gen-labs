<?php

namespace App\Http\Controllers;

use App\Models\StudyProgram;
use App\Models\Topic;
use App\Models\Difficulty;
use App\Models\Activity;
use Illuminate\Http\Request;

class AdminMasterDataController extends Controller
{
    // ==========================================
    // 1. PROGRAM STUDI / STUDY AREA (PRD Section W)
    // ==========================================

    public function studyPrograms(Request $request)
    {
        $query = StudyProgram::withCount('topics');

        if ($request->has('search') && !empty($request->search)) {
            $s = strtolower($request->search);
            $query->where(function ($q) use ($s) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$s}%"])
                  ->orWhereRaw('LOWER(code) LIKE ?', ["%{$s}%"]);
            });
        }

        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $programs = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $programs,
        ]);
    }

    public function storeStudyProgram(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:1000',
        ]);

        $program = StudyProgram::create([
            'name' => $validated['name'],
            'code' => $validated['code'] ?? strtoupper(substr($validated['name'], 0, 4)),
            'description' => $validated['description'] ?? null,
            'status' => 'active',
        ]);

        Activity::record('Dibuat program studi', "{$program->name} ({$program->code})");

        return response()->json([
            'success' => true,
            'message' => 'Program studi berhasil ditambahkan.',
            'data' => $program,
        ], 201);
    }

    public function updateStudyProgram(Request $request, $id)
    {
        $program = StudyProgram::find($id);
        if (!$program) {
            return response()->json(['success' => false, 'message' => 'Program studi tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:1000',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        $program->update(array_filter($validated));

        Activity::record('Diperbarui program studi', "{$program->name} ({$program->code})");

        return response()->json([
            'success' => true,
            'message' => 'Program studi berhasil diperbarui.',
            'data' => $program,
        ]);
    }

    public function toggleStudyProgramStatus($id)
    {
        $program = StudyProgram::find($id);
        if (!$program) {
            return response()->json(['success' => false, 'message' => 'Program studi tidak ditemukan.'], 404);
        }

        $program->status = ($program->status === 'inactive') ? 'active' : 'inactive';
        $program->save();

        Activity::record("Diubah status program studi", "{$program->name} [Status: {$program->status}]");

        return response()->json([
            'success' => true,
            'message' => "Status program studi berhasil diubah menjadi {$program->status}.",
            'data' => $program,
        ]);
    }

    // ==========================================
    // 2. TOPICS / TOPIK SIMULATOR (PRD Section X)
    // ==========================================

    public function topics(Request $request)
    {
        $query = Topic::with('studyProgram');

        if ($request->has('search') && !empty($request->search)) {
            $s = strtolower($request->search);
            $query->whereRaw('LOWER(name) LIKE ?', ["%{$s}%"]);
        }

        if ($request->has('study_program_id') && !empty($request->study_program_id)) {
            $query->where('study_program_id', $request->study_program_id);
        }

        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $topics = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $topics,
        ]);
    }

    public function storeTopic(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'study_program_id' => 'nullable|exists:study_programs,id',
            'description' => 'nullable|string|max:1000',
        ]);

        $topic = Topic::create([
            'name' => $validated['name'],
            'study_program_id' => $validated['study_program_id'] ?? null,
            'description' => $validated['description'] ?? null,
            'status' => 'active',
        ]);

        Activity::record('Dibuat topik baru', "{$topic->name}");

        return response()->json([
            'success' => true,
            'message' => 'Topik berhasil ditambahkan.',
            'data' => $topic->load('studyProgram'),
        ], 201);
    }

    public function updateTopic(Request $request, $id)
    {
        $topic = Topic::find($id);
        if (!$topic) {
            return response()->json(['success' => false, 'message' => 'Topik tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'study_program_id' => 'nullable|exists:study_programs,id',
            'description' => 'nullable|string|max:1000',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        $topic->update($validated);

        Activity::record('Diperbarui topik', "{$topic->name}");

        return response()->json([
            'success' => true,
            'message' => 'Topik berhasil diperbarui.',
            'data' => $topic->load('studyProgram'),
        ]);
    }

    public function toggleTopicStatus($id)
    {
        $topic = Topic::find($id);
        if (!$topic) {
            return response()->json(['success' => false, 'message' => 'Topik tidak ditemukan.'], 404);
        }

        $topic->status = ($topic->status === 'inactive') ? 'active' : 'inactive';
        $topic->save();

        Activity::record("Diubah status topik", "{$topic->name} [Status: {$topic->status}]");

        return response()->json([
            'success' => true,
            'message' => "Status topik berhasil diubah menjadi {$topic->status}.",
            'data' => $topic,
        ]);
    }

    // ==========================================
    // 3. DIFFICULTIES / TINGKAT KESULITAN (PRD Section Y)
    // ==========================================

    public function difficulties(Request $request)
    {
        $difficulties = Difficulty::orderBy('id', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $difficulties,
        ]);
    }

    public function toggleDifficultyStatus($id)
    {
        $diff = Difficulty::find($id);
        if (!$diff) {
            return response()->json(['success' => false, 'message' => 'Tingkat kesulitan tidak ditemukan.'], 404);
        }

        $diff->status = ($diff->status === 'inactive') ? 'active' : 'inactive';
        $diff->save();

        Activity::record("Diubah status tingkat kesulitan", "{$diff->name} [Status: {$diff->status}]");

        return response()->json([
            'success' => true,
            'message' => "Status tingkat kesulitan berhasil diubah menjadi {$diff->status}.",
            'data' => $diff,
        ]);
    }
}
