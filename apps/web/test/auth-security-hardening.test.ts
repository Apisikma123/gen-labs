import { test } from 'node:test';
import assert from 'node:assert/strict';

const WEB_BASE = process.env.TEST_WEB_URL || 'http://127.0.0.1:3000';
const BACKEND_BASE = process.env.TEST_API_URL || 'http://127.0.0.1:8000';

test('Security P0 Matrix 1: Anonymous request to private page /app redirects to /login', async () => {
  const res = await fetch(`${WEB_BASE}/app`, { redirect: 'manual' });
  assert.equal(res.status, 307);
  const location = res.headers.get('location') || '';
  assert.match(location, /\/login\?redirect=%2Fapp/);
  assert.equal(res.headers.get('cache-control'), 'no-store, no-cache, must-revalidate, max-age=0');
});

test('Security P0 Matrix 2: Anonymous request to private page /admin redirects to /login', async () => {
  const res = await fetch(`${WEB_BASE}/admin`, { redirect: 'manual' });
  assert.equal(res.status, 307);
  const location = res.headers.get('location') || '';
  assert.match(location, /\/login\?redirect=%2Fadmin/);
});

test('Security P0 Matrix 3: Anonymous request to /analytics redirects to /login', async () => {
  const res = await fetch(`${WEB_BASE}/analytics`, { redirect: 'manual' });
  assert.equal(res.status, 307);
  const location = res.headers.get('location') || '';
  assert.match(location, /\/login\?redirect=%2Fanalytics/);
});

test('Security P0 Matrix 4: Anonymous request to /history redirects to /login', async () => {
  const res = await fetch(`${WEB_BASE}/history`, { redirect: 'manual' });
  assert.equal(res.status, 307);
  const location = res.headers.get('location') || '';
  assert.match(location, /\/login\?redirect=%2Fhistory/);
});

test('Security P0 Matrix 5: Anonymous request to /profile redirects to /login', async () => {
  const res = await fetch(`${WEB_BASE}/profile`, { redirect: 'manual' });
  assert.equal(res.status, 307);
  const location = res.headers.get('location') || '';
  assert.match(location, /\/login\?redirect=%2Fprofile/);
});

test('Security P0 Matrix 6: Anonymous request to /simulation/[id] redirects to /login', async () => {
  const res = await fetch(`${WEB_BASE}/simulation/newtons-second-law`, { redirect: 'manual' });
  assert.equal(res.status, 307);
  const location = res.headers.get('location') || '';
  assert.match(location, /\/login\?redirect=%2Fsimulation%2Fnewtons-second-law/);
});

test('Security P0 Matrix 7: Forged / fake cookie token is rejected with session_expired redirect', async () => {
  const res = await fetch(`${WEB_BASE}/app`, {
    headers: {
      Cookie: 'genlabs_auth_token=fake_hostile_attacker_token_xyz; genlabs_role=admin',
    },
    redirect: 'manual',
  });
  assert.equal(res.status, 307);
  const location = res.headers.get('location') || '';
  assert.match(location, /error=session_expired/);
});

test('Security P0 Matrix 8: Tampered role cookie genlabs_role=admin is rejected on /admin with student token', async () => {
  // Login as student to get legitimate student Sanctum token
  const loginRes = await fetch(`${BACKEND_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@genlabs.app', password: 'secret123' }),
  });
  const loginData = await loginRes.json();
  const studentToken = loginData.token;
  assert.ok(studentToken, 'Failed to acquire student token');

  // Attempt to access /admin with student token and tampered role cookie
  const adminRes = await fetch(`${WEB_BASE}/admin`, {
    headers: {
      Cookie: `genlabs_auth_token=${studentToken}; genlabs_role=admin`,
    },
    redirect: 'manual',
  });
  assert.equal(adminRes.status, 307);
  const location = adminRes.headers.get('location') || '';
  assert.match(location, /\/app\?error=unauthorized_admin/);
});

test('Security P0 Matrix 9: Anonymous API requests to /api/ai/tutor return 401', async () => {
  const res = await fetch(`${WEB_BASE}/api/ai/tutor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'Test question' }),
  });
  assert.equal(res.status, 401);
});

test('Security P0 Matrix 10: Anonymous API requests to /api/ai/usage return 401', async () => {
  const res = await fetch(`${WEB_BASE}/api/ai/usage`);
  assert.equal(res.status, 401);
});

test('Security P0 Matrix 11: Anonymous API requests to /api/sessions return 401', async () => {
  const res = await fetch(`${WEB_BASE}/api/sessions`);
  assert.equal(res.status, 401);
});

test('Security P0 Matrix 12: Anonymous API requests to /api/admin/metrics return 401', async () => {
  const res = await fetch(`${WEB_BASE}/api/admin/metrics`);
  assert.equal(res.status, 401);
});

test('Security P0 Matrix 13: Mock admin token bypass is completely blocked with 401', async () => {
  const res = await fetch(`${WEB_BASE}/api/v1/admin/simulations/generate`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer mock_admin_token',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: 'Simulasi Kecepatan' }),
  });
  assert.equal(res.status, 401);
});

test('Security P0 Matrix 14: Public routes remain accessible (200 OK) without authentication', async () => {
  const publicRoutes = ['/', '/login', '/register', '/prototype/3d-icons'];
  for (const route of publicRoutes) {
    const res = await fetch(`${WEB_BASE}${route}`);
    assert.equal(res.status, 200, `Expected 200 OK for public route ${route}, got ${res.status}`);
  }
});

test('Security P0 Matrix 14B: Tanya AI requires authentication (anonymous redirected to /login)', async () => {
  const res = await fetch(`${WEB_BASE}/tanya-ai`, { redirect: 'manual' });
  // Unauthenticated requests are redirected with 307 to /login
  assert.ok(res.status === 307 || res.status === 302 || res.status === 401, `Expected redirect/unauthorized, got ${res.status}`);
  if (res.status === 307 || res.status === 302) {
    assert.ok(res.headers.get('location')?.includes('/login'), 'Redirect should point to /login');
  }
});

test('Security P0 Matrix 15: Direct backend access to /api/admin/* requires authentication (401 without token)', async () => {
  const directRes = await fetch(`${BACKEND_BASE}/api/admin/metrics`);
  assert.equal(directRes.status, 401);
});
