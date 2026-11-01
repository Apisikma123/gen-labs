<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    /**
     * List users with search, role filter, status filter, and server-side pagination (PRD Section R)
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Search by name or email
        if ($request->has('search') && !empty($request->search)) {
            $s = strtolower($request->search);
            $query->where(function ($q) use ($s) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$s}%"])
                  ->orWhereRaw('LOWER(email) LIKE ?', ["%{$s}%"]);
            });
        }

        // Filter by role (admin, student)
        if ($request->has('role') && !empty($request->role) && $request->role !== 'all') {
            $role = $request->role === 'mahasiswa' ? 'student' : $request->role;
            $query->where('role', $role);
        }

        // Filter by status (active, inactive)
        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $perPage = min((int) ($request->get('per_page', 10)), 50);
        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Show single user profile (PRD Section S: never show password/hash/secrets)
     */
    public function show($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 404);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role === 'student' ? 'User' : 'Admin',
                'raw_role' => $user->role,
                'status' => $user->status ?? 'active',
                'created_at' => $user->created_at?->toIso8601String(),
                'updated_at' => $user->updated_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Create user (PRD Section U: whitelist role ADMIN, MAHASISWA)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:admin,student,mahasiswa,Admin,Mahasiswa',
        ]);

        $normalizedRole = in_array(strtolower($validated['role']), ['mahasiswa', 'student']) ? 'student' : 'admin';

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $normalizedRole,
            'status' => 'active',
            'avatar' => strtoupper(substr($validated['name'], 0, 1)),
            'preferences' => ['theme' => 'system', 'language' => 'id'],
        ]);

        Activity::record('Dibuat user baru', "{$user->name} ({$user->email}) [Role: {$user->role}]");

        return response()->json([
            'success' => true,
            'message' => 'Pengguna berhasil dibuat.',
            'user' => $user,
        ], 201);
    }

    /**
     * Update user details
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => 'nullable|string|in:admin,student,mahasiswa,Admin,Mahasiswa',
            'password' => 'nullable|string|min:6',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        $roleChanged = false;
        if (!empty($validated['role'])) {
            $newRole = in_array(strtolower($validated['role']), ['mahasiswa', 'student']) ? 'student' : 'admin';
            if ($user->role !== $newRole) {
                $user->role = $newRole;
                $roleChanged = true;
            }
        }

        $passwordChanged = false;
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
            $passwordChanged = true;
            // Revoke all existing sessions on password reset
            $user->tokens()->delete();
        }

        $user->save();

        if ($passwordChanged) {
            Activity::record('Pemulihan kata sandi pengguna oleh Administrator', "{$user->name} ({$user->email}) [IP: {$request->ip()}]");
        }
        if ($roleChanged) {
            Activity::record('Perubahan role pengguna oleh Administrator', "{$user->name} ({$user->email}) [Role baru: {$user->role}]");
        }
        if (!$passwordChanged && !$roleChanged) {
            Activity::record('Diperbarui data user', "{$user->name} ({$user->email})");
        }

        return response()->json([
            'success' => true,
            'message' => 'Data pengguna berhasil diperbarui.',
            'user' => $user,
        ]);
    }

    /**
     * Toggle user status (PRD Section T: ACTIVE / INACTIVE, invalidate tokens if inactive)
     */
    public function toggleStatus(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 404);
        }

        // Prevent admin from deactivating self
        $currentAuth = auth('sanctum')->user() ?? $request->user();
        if ($currentAuth && $currentAuth->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menonaktifkan akun Anda sendiri.',
            ], 400);
        }

        $newStatus = ($user->status === 'inactive') ? 'active' : 'inactive';
        $user->status = $newStatus;
        $user->save();

        // If deactivated, revoke all active sessions and personal access tokens
        if ($newStatus === 'inactive') {
            $user->tokens()->delete();
        }

        $actionText = $newStatus === 'active' ? 'Diaktifkan user' : 'Dinonaktifkan user';
        Activity::record($actionText, "{$user->name} ({$user->email}) [Status: {$newStatus}]");

        return response()->json([
            'success' => true,
            'message' => "Pengguna berhasil di-{$newStatus}kan.",
            'user' => $user,
        ]);
    }

    /**
     * Delete user
     */
    public function destroy(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 404);
        }

        // Prevent admin from deleting self
        $currentAuth = auth('sanctum')->user() ?? $request->user();
        if ($currentAuth && $currentAuth->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri.',
            ], 400);
        }

        $userName = $user->name;
        $userEmail = $user->email;
        $user->tokens()->delete();
        $user->delete();

        Activity::record('Dihapus user', "{$userName} ({$userEmail})");

        return response()->json([
            'success' => true,
            'message' => 'Pengguna berhasil dihapus.',
        ]);
    }
}
