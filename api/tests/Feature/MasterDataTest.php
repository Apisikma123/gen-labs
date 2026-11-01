<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterDataTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_guest_cannot_access_master_data(): void
    {
        $response = $this->getJson('/api/admin/master-data/study-programs');
        $response->assertStatus(401);
    }

    public function test_student_cannot_access_master_data(): void
    {
        $student = User::where('role', 'student')->first();
        if (!$student) {
            $student = User::factory()->create(['role' => 'student']);
        }

        $response = $this->actingAs($student)->getJson('/api/admin/master-data/study-programs');
        $response->assertStatus(403);
    }

    public function test_admin_can_access_study_programs(): void
    {
        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            $admin = User::factory()->create(['role' => 'admin']);
        }

        $response = $this->actingAs($admin)->getJson('/api/admin/master-data/study-programs');
        $response->assertStatus(200)
                 ->assertJson(['success' => true])
                 ->assertJsonStructure(['success', 'data']);
    }

    public function test_admin_can_access_topics(): void
    {
        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            $admin = User::factory()->create(['role' => 'admin']);
        }

        $response = $this->actingAs($admin)->getJson('/api/admin/master-data/topics');
        $response->assertStatus(200)
                 ->assertJson(['success' => true]);
    }

    public function test_admin_can_access_difficulties(): void
    {
        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            $admin = User::factory()->create(['role' => 'admin']);
        }

        $response = $this->actingAs($admin)->getJson('/api/admin/master-data/difficulties');
        $response->assertStatus(200)
                 ->assertJson(['success' => true]);
    }
}
