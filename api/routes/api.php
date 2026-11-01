<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\AdminModuleController;
use App\Http\Controllers\SimulationController;
use App\Http\Controllers\LearningSessionController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AdminMasterDataController;
use App\Http\Controllers\AdminActivityController;
use App\Http\Controllers\AdminSettingsController;
use App\Http\Controllers\AiUsageController;

/*
|--------------------------------------------------------------------------
| GEN LABS REST API Routes (Module-Based Architecture - Section 15)
|--------------------------------------------------------------------------
*/

// 1. Authentication (Real Sanctum Auth with Brute-Force Rate Limiting)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1')->name('login');
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');

// 2. Student Modules (Section 15)
Route::get('/modules', [ModuleController::class, 'index']);
Route::get('/curriculum/options', [ModuleController::class, 'curriculumOptions']);
Route::get('/modules/{id}', [ModuleController::class, 'show']);

// 3. Student AI Tutor & Experiment Attempt on Module (Section 10, 13, 15)
Route::get('/ai/usage', [AiUsageController::class, 'usage'])->middleware('auth:sanctum');
Route::post('/modules/{module}/ask', [ModuleController::class, 'ask'])->middleware('auth:sanctum');
Route::post('/ai/tutor', [ModuleController::class, 'askTutorDirect'])->middleware('auth:sanctum');
Route::get('/experiments/history', [ModuleController::class, 'experimentHistory'])->middleware('auth:sanctum');
Route::post('/modules/{module}/experiments/{experiment}/attempts', [ModuleController::class, 'submitExperimentAttempt'])->middleware('auth:sanctum');

Route::prefix('admin')->middleware([\App\Http\Middleware\EnsureIsAdmin::class])->group(function () {
    // Admin AI Monitoring & Emergency Budget
    Route::get('/ai/usage', [AdminController::class, 'aiUsage']);
    // Admin AI Authoring Draft Generator (never auto-publishes)
    Route::post('/ai/generate-module', [AdminModuleController::class, 'generateDraft']);
    Route::post('/simulations/generate', [AdminModuleController::class, 'generateSimulationDraft']);

    // Admin Module Management
    Route::get('/modules', [AdminModuleController::class, 'index']);
    Route::post('/modules', [AdminModuleController::class, 'store']);
    Route::patch('/modules/{id}', [AdminModuleController::class, 'update']);
    Route::delete('/modules/{id}', [AdminModuleController::class, 'destroy']);

    // Admin Media Management & AI Thumbnails (Section 3, 4, 5)
    Route::post('/media/upload', [MediaController::class, 'upload']);
    Route::post('/media/generate-ai-thumbnail', [MediaController::class, 'generateAiThumbnail']);
    Route::delete('/media', [MediaController::class, 'delete']);

    // Admin Simulation Management (PRD Section 45 & 60)
    Route::get('/simulations', [AdminController::class, 'simulations']);
    Route::post('/simulations', [AdminController::class, 'store']);
    Route::patch('/simulations/{id}', [AdminController::class, 'update']);
    Route::delete('/simulations/{id}', [AdminController::class, 'destroy']);
    Route::get('/metrics', [AdminController::class, 'metrics']);

    // User Management (PRD Section R, S, T, U)
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::post('/users', [AdminUserController::class, 'store']);
    Route::get('/users/{id}', [AdminUserController::class, 'show']);
    Route::patch('/users/{id}', [AdminUserController::class, 'update']);
    Route::patch('/users/{id}/toggle-status', [AdminUserController::class, 'toggleStatus']);
    Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

    // Master Data (PRD Section V, W, X, Y)
    Route::get('/master-data/study-programs', [AdminMasterDataController::class, 'studyPrograms']);
    Route::post('/master-data/study-programs', [AdminMasterDataController::class, 'storeStudyProgram']);
    Route::patch('/master-data/study-programs/{id}', [AdminMasterDataController::class, 'updateStudyProgram']);
    Route::patch('/master-data/study-programs/{id}/toggle-status', [AdminMasterDataController::class, 'toggleStudyProgramStatus']);

    Route::get('/master-data/topics', [AdminMasterDataController::class, 'topics']);
    Route::post('/master-data/topics', [AdminMasterDataController::class, 'storeTopic']);
    Route::patch('/master-data/topics/{id}', [AdminMasterDataController::class, 'updateTopic']);
    Route::patch('/master-data/topics/{id}/toggle-status', [AdminMasterDataController::class, 'toggleTopicStatus']);

    Route::get('/master-data/difficulties', [AdminMasterDataController::class, 'difficulties']);
    Route::patch('/master-data/difficulties/{id}/toggle-status', [AdminMasterDataController::class, 'toggleDifficultyStatus']);

    // System Activity Log & Settings (PRD Section AD, AE)
    Route::get('/activities', [AdminActivityController::class, 'index']);
    Route::get('/settings', [AdminSettingsController::class, 'index']);
});

// 5. Simulations Catalog & Search
Route::get('/simulations/search', [SimulationController::class, 'search']);
Route::get('/simulations', [SimulationController::class, 'index']);
Route::get('/simulations/{id}', [SimulationController::class, 'show']);

// 6. Learning Sessions (Progress tracking & IDOR Protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/sessions', [LearningSessionController::class, 'store']);
    Route::get('/sessions', [LearningSessionController::class, 'index']);
    Route::get('/sessions/{id}', [LearningSessionController::class, 'show']);
    Route::patch('/sessions/{id}', [LearningSessionController::class, 'update']);
    Route::get('/sessions/{id}/insights', [LearningSessionController::class, 'insights']);
});
