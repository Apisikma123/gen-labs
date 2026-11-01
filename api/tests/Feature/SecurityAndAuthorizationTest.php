<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\LearningSession;
use App\Models\Module;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityAndAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_guest_cannot_access_protected_user_profile(): void
    {
        $response = $this->getJson('/api/user');
        $response->assertStatus(401);
    }

    public function test_student_cannot_access_admin_routes(): void
    {
        $student = User::where('role', 'student')->first();
        if (!$student) {
            $student = User::factory()->create(['role' => 'student']);
        }

        $endpoints = [
            '/api/admin/metrics',
            '/api/admin/users',
            '/api/admin/settings',
            '/api/admin/activities',
            '/api/admin/modules',
            '/api/admin/simulations',
        ];

        foreach ($endpoints as $endpoint) {
            $response = $this->actingAs($student)->getJson($endpoint);
            $response->assertStatus(403);
        }
    }

    public function test_idor_protection_student_cannot_view_another_students_session(): void
    {
        $studentA = User::where('role', 'student')->first();
        if (!$studentA) {
            $studentA = User::factory()->create(['role' => 'student']);
        }

        $studentB = User::factory()->create([
            'role' => 'student',
            'email' => 'student_other_' . uniqid() . '@example.com',
        ]);

        $module = Module::first();

        $sessionA = LearningSession::create([
            'user_id' => $studentA->id,
            'module_id' => $module->id,
            'current_state' => ['acceleration' => 5],
            'progress' => 30,
            'started_at' => now(),
            'last_active_at' => now(),
        ]);

        // Student B attempts to access Student A's session
        $response = $this->actingAs($studentB)->getJson("/api/sessions/{$sessionA->id}");
        $response->assertStatus(403);
    }

    public function test_idor_protection_student_cannot_modify_another_students_session(): void
    {
        $studentA = User::where('role', 'student')->first();
        if (!$studentA) {
            $studentA = User::factory()->create(['role' => 'student']);
        }

        $studentB = User::factory()->create([
            'role' => 'student',
            'email' => 'student_other_2_' . uniqid() . '@example.com',
        ]);

        $module = Module::first();

        $sessionA = LearningSession::create([
            'user_id' => $studentA->id,
            'module_id' => $module->id,
            'current_state' => ['acceleration' => 5],
            'progress' => 30,
            'started_at' => now(),
            'last_active_at' => now(),
        ]);

        // Student B attempts to update Student A's session
        $response = $this->actingAs($studentB)->patchJson("/api/sessions/{$sessionA->id}", [
            'progress' => 100,
        ]);
        $response->assertStatus(403);
    }

    public function test_inactive_user_cannot_login(): void
    {
        $inactiveUser = User::factory()->create([
            'role' => 'student',
            'status' => 'inactive',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $inactiveUser->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(403);
    }

    public function test_auth_route_throttle_is_enforced(): void
    {
        // Fire 12 login attempts rapidly to exceed the 10/min rate limit
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/auth/login', [
                'email' => 'nonexistent_' . $i . '@test.com',
                'password' => 'wrongpass',
            ]);
        }

        $exceededResponse = $this->postJson('/api/auth/login', [
            'email' => 'nonexistent_11@test.com',
            'password' => 'wrongpass',
        ]);

        $this->assertEquals(429, $exceededResponse->status());
    }

    public function test_admin_settings_does_not_leak_raw_api_key(): void
    {
        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            $admin = User::factory()->create(['role' => 'admin']);
        }

        $response = $this->actingAs($admin)->getJson('/api/admin/settings');
        $response->assertStatus(200);

        $content = $response->getContent();
        $rawKey = (string) config('ai.gemini.api_key');
        if (!empty($rawKey)) {
            $this->assertStringNotContainsString($rawKey, $content);
        }
        $this->assertStringNotContainsString('test-secret-api-key-do-not-leak', $content);
        $this->assertStringContainsString('Configured', $content);
    }

    public function test_anonymous_user_cannot_call_ai_tutor(): void
    {
        $response = $this->postJson('/api/ai/tutor', [
            'question' => 'Apa rumus kecepatan?',
        ]);
        $response->assertStatus(401);
    }

    public function test_anonymous_user_cannot_access_ai_usage(): void
    {
        $response = $this->getJson('/api/ai/usage');
        $response->assertStatus(401);
    }

    public function test_logged_out_user_token_is_permanently_rejected(): void
    {
        $user = User::factory()->create([
            'role' => 'student',
            'email' => 'logout_test_' . uniqid() . '@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
        ]);

        $token = $user->createToken('test_logout_token')->plainTextToken;

        // Verify token works
        $okResponse = $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/user');
        $okResponse->assertStatus(200);

        // Logout
        $logoutResponse = $this->withHeader('Authorization', "Bearer {$token}")->postJson('/api/auth/logout');
        $logoutResponse->assertStatus(200);

        // Reset auth guards to simulate a fresh incoming HTTP request
        $this->app['auth']->forgetGuards();

        // Verify old token is rejected
        $rejectedResponse = $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/user');
        $rejectedResponse->assertStatus(401);
    }

    public function test_revoked_role_blocks_admin_access_immediately(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin_demoted_' . uniqid() . '@example.com',
        ]);
        $token = $admin->createToken('admin_test_token')->plainTextToken;

        // Accessible as admin
        $okResponse = $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/admin/metrics');
        $okResponse->assertStatus(200);

        // Demote role to student
        $admin->role = 'student';
        $admin->save();

        // Reset auth guards to simulate a fresh incoming HTTP request
        $this->app['auth']->forgetGuards();

        // Immediately rejected on admin endpoint
        $forbiddenResponse = $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/admin/metrics');
        $forbiddenResponse->assertStatus(403);
    }

    public function test_admin_password_reset_revokes_all_user_active_tokens(): void
    {
        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            $admin = User::factory()->create(['role' => 'admin']);
        }

        $student = User::factory()->create([
            'role' => 'student',
            'email' => 'student_pwd_reset_' . uniqid() . '@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('oldpassword'),
        ]);

        $studentToken = $student->createToken('student_active_token')->plainTextToken;

        // Student token is valid
        $resBefore = $this->withHeader('Authorization', "Bearer {$studentToken}")->getJson('/api/user');
        $resBefore->assertStatus(200);

        // Admin resets student password
        $resetResponse = $this->actingAs($admin)->patchJson("/api/admin/users/{$student->id}", [
            'name' => $student->name,
            'email' => $student->email,
            'password' => 'newpassword123',
        ]);
        $resetResponse->assertStatus(200);

        // Reset auth guards to simulate a fresh incoming HTTP request from student
        $this->app['auth']->forgetGuards();

        // Old token must be rejected
        $resAfter = $this->withHeader('Authorization', "Bearer {$studentToken}")->getJson('/api/user');
        $resAfter->assertStatus(401);
    }
}
