<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * User registration (PRD Section 29)
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'student', // PRD Section A/R: public registration strictly grants student role
            'avatar' => strtoupper(substr($validated['name'], 0, 1)),
            'preferences' => ['theme' => 'system', 'language' => 'id'],
        ]);

        $token = $user->createToken('simula_auth_token')->plainTextToken;

        $isSecure = config('session.secure', false) || $request->isSecure();
        $cookie = cookie('genlabs_auth_token', $token, 60 * 24 * 7, '/', config('session.domain'), $isSecure, true, false, config('session.same_site', 'lax'));
        $simulaCookie = cookie('simula_auth_token', $token, 60 * 24 * 7, '/', config('session.domain'), $isSecure, true, false, config('session.same_site', 'lax'));

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil.',
            'user' => $user,
            'token' => $token,
        ], 201)->withCookie($cookie)->withCookie($simulaCookie);
    }

    /**
     * User login with standard email/password or role switcher (PRD Section 29 & 42)
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        // Graceful alias resolution for standard demo accounts
        if (!$user) {
            $studentAliases = ['user@genlabs.app', 'student@genlabs.app', 'mahasiswa@genlabs.app', 'mahasiswa@simula.ac.id'];
            $adminAliases = ['admin@genlabs.app', 'admin@simula.ac.id'];

            if (in_array(strtolower($validated['email']), $studentAliases)) {
                $user = User::whereIn('email', $studentAliases)->first();
            } elseif (in_array(strtolower($validated['email']), $adminAliases)) {
                $user = User::whereIn('email', $adminAliases)->first();
            }
        }

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau kata sandi tidak sesuai.',
            ], 401);
        }

        if ($user->status === 'inactive') {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda berstatus nonaktif. Silakan hubungi Administrator untuk mengaktifkan kembali.',
            ], 403);
        }

        // Revoke old tokens if any
        $user->tokens()->delete();
        $token = $user->createToken('simula_auth_token')->plainTextToken;

        $returnUser = clone $user;
        $returnUser->email = $validated['email'];

        $isSecure = config('session.secure', false) || $request->isSecure();
        $cookie = cookie('genlabs_auth_token', $token, 60 * 24 * 7, '/', config('session.domain'), $isSecure, true, false, config('session.same_site', 'lax'));
        $simulaCookie = cookie('simula_auth_token', $token, 60 * 24 * 7, '/', config('session.domain'), $isSecure, true, false, config('session.same_site', 'lax'));

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'user' => $returnUser,
            'token' => $token,
        ])->withCookie($cookie)->withCookie($simulaCookie);
    }

    /**
     * User logout (Section 16: Invalidate token in MySQL, clear session)
     */
    public function logout(Request $request)
    {
        $user = auth('sanctum')->user() ?? $request->user();
        if ($user) {
            if (method_exists($user, 'currentAccessToken') && $user->currentAccessToken()) {
                $user->currentAccessToken()->delete();
            } else {
                $user->tokens()->delete();
            }
        } else {
            $bearer = $request->bearerToken();
            if ($bearer && class_exists(\Laravel\Sanctum\PersonalAccessToken::class)) {
                $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($bearer);
                if ($tokenModel) {
                    $tokenModel->delete();
                }
            }
        }

        $cookie = cookie()->forget('genlabs_auth_token');
        $simulaCookie = cookie()->forget('simula_auth_token');

        return response()->json([
            'success' => true,
            'message' => 'Berhasil keluar sesi.',
        ])->withCookie($cookie)->withCookie($simulaCookie);
    }

    /**
     * Authenticated user profile (Section 16: Verify active Sanctum token)
     */
    public function user(Request $request)
    {
        $user = auth('sanctum')->user() ?? $request->user();

        if (!$user) {
            $bearer = $request->bearerToken();
            if ($bearer && class_exists(\Laravel\Sanctum\PersonalAccessToken::class)) {
                $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($bearer);
                if ($tokenModel) {
                    $user = $tokenModel->tokenable;
                }
            }
        }

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak ditemukan atau telah kedaluwarsa.',
                'user' => null,
            ], 401);
        }

        if ($user->status === 'inactive') {
            if (method_exists($user, 'currentAccessToken') && $user->currentAccessToken()) {
                $user->currentAccessToken()->delete();
            } else {
                $user->tokens()->delete();
            }
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda berstatus nonaktif. Silakan hubungi Administrator.',
                'user' => null,
            ], 403);
        }

        return response()->json([
            'success' => true,
            'user' => $user,
        ]);
    }
}
