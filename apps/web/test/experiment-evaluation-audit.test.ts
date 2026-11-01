import test from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../src/app/api/v1/experiments/evaluate/route';
import { registerServerSession, type AuthenticatedUser } from '../src/lib/auth/server-guard';

test('POST /api/v1/experiments/evaluate security and validation suite', async (t) => {
  const dummyUser: AuthenticatedUser = {
    id: 'student_audit_99',
    name: 'Audit Student',
    email: 'student.audit@genlabs.app',
    role: 'student',
  };
  const validToken = 'genlabs_token_audit_test_secret_123';
  registerServerSession(validToken, dummyUser);

  await t.test('Rejects unauthenticated requests with HTTP 401', async () => {
    const req = new Request('http://localhost:3000/api/v1/experiments/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ condition: { output: 'acceleration', operator: 'equals', value: 2 }, computed: { acceleration: 2 } }),
    });

    const res = await POST(req);
    assert.equal(res.status, 401, 'Must return 401 Unauthorized for unauthenticated call');
    const data = await res.json();
    assert.equal(data.success, false);
  });

  await t.test('Rejects empty JSON payload with HTTP 400', async () => {
    const req = new Request('http://localhost:3000/api/v1/experiments/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    assert.equal(res.status, 400, 'Must return 400 Bad Request for empty payload');
    const data = await res.json();
    assert.equal(data.success, false);
  });

  await t.test('Rejects payload with missing condition with HTTP 400', async () => {
    const req = new Request('http://localhost:3000/api/v1/experiments/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify({ computed: { acceleration: 2 } }),
    });

    const res = await POST(req);
    assert.equal(res.status, 400, 'Must return 400 Bad Request for missing condition');
    const data = await res.json();
    assert.equal(data.success, false);
  });

  await t.test('Rejects invalid condition without output signal with HTTP 400', async () => {
    const req = new Request('http://localhost:3000/api/v1/experiments/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify({
        condition: { operator: 'equals', value: 5 },
        computed: { acceleration: 5 },
      }),
    });

    const res = await POST(req);
    assert.equal(res.status, 400, 'Must return 400 for condition without output signal');
  });

  await t.test('Rejects NaN / non-finite condition target value with HTTP 400', async () => {
    const req = new Request('http://localhost:3000/api/v1/experiments/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify({
        condition: { output: 'acceleration', operator: 'equals', value: NaN },
        computed: { acceleration: 5 },
      }),
    });

    const res = await POST(req);
    assert.equal(res.status, 400, 'Must return 400 for NaN condition value');
  });

  await t.test('Rejects missing or invalid computed outputs with HTTP 400', async () => {
    const req = new Request('http://localhost:3000/api/v1/experiments/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify({
        condition: { output: 'acceleration', operator: 'equals', value: 2 },
        computed: 'NOT_AN_OBJECT',
      }),
    });

    const res = await POST(req);
    assert.equal(res.status, 400, 'Must return 400 when computed is not an object');
  });

  await t.test('Accepts valid condition and returns correct evaluation (passing)', async () => {
    const req = new Request('http://localhost:3000/api/v1/experiments/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify({
        condition: { output: 'acceleration', operator: 'equals', value: 2.5, tolerance: 0.1 },
        computed: { acceleration: 2.5 },
      }),
    });

    const res = await POST(req);
    assert.equal(res.status, 200, 'Must return 200 OK for valid evaluation');
    const data = await res.json();
    assert.equal(data.success, true, 'Condition satisfied must evaluate to true');
    assert.equal(data.currentValue, 2.5);
  });

  await t.test('Accepts valid condition and returns correct evaluation (failing)', async () => {
    const req = new Request('http://localhost:3000/api/v1/experiments/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify({
        condition: { output: 'acceleration', operator: 'equals', value: 10, tolerance: 0.1 },
        computed: { acceleration: 2.5 },
      }),
    });

    const res = await POST(req);
    assert.equal(res.status, 200, 'Must return 200 OK');
    const data = await res.json();
    assert.equal(data.success, false, 'Condition unsatisfied must evaluate to false');
  });
});
