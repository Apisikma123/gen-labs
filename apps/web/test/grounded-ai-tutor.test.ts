import test from 'node:test';
import assert from 'node:assert/strict';
import { isSafeUrl, sanitizeExternalUrl } from '../src/lib/utils/url';
import { SourceItem, TutorState } from '../src/lib/api/ai';

test('AI Grounding: isSafeUrl allows valid HTTPS DOI and internal paths', () => {
  assert.equal(isSafeUrl('https://doi.org/10.1000/182'), true);
  assert.equal(isSafeUrl('http://example.com/paper'), true);
  assert.equal(isSafeUrl('/modules/hukum-ii-newton'), true);
  assert.equal(isSafeUrl('/simulation/vector-math'), true);
  assert.equal(isSafeUrl('#general-science'), true);
});

test('AI Grounding: isSafeUrl blocks XSS and dangerous schemes', () => {
  assert.equal(isSafeUrl('javascript:alert(1)'), false);
  assert.equal(isSafeUrl('JAVASCRIPT:alert(document.cookie)'), false);
  assert.equal(isSafeUrl('data:text/html,<script>alert(1)</script>'), false);
  assert.equal(isSafeUrl('vbscript:msgbox(1)'), false);
  assert.equal(isSafeUrl('file:///etc/passwd'), false);
  assert.equal(isSafeUrl('//evil.com/xss'), false);
  assert.equal(isSafeUrl(''), false);
  assert.equal(isSafeUrl(null as any), false);
  assert.equal(isSafeUrl(undefined as any), false);
});

test('AI Grounding: sanitizeExternalUrl normalizes unsafe URLs to safe fallback', () => {
  assert.equal(sanitizeExternalUrl('javascript:evil()'), '#');
  assert.equal(sanitizeExternalUrl('https://doi.org/10.1234/test'), 'https://doi.org/10.1234/test');
});

test('AI Grounding: Structured SourceItem adheres to provenance schema', () => {
  const verifiedInternal: SourceItem = {
    type: 'internal',
    id: 'hukum-ii-newton',
    title: 'Hukum II Newton — Dinamika Gerak',
    publisher: 'GEN LABS WBI Kurikulum',
    url: '/modules/hukum-ii-newton',
    status: 'verified',
    excerpt: 'Simulasi interaktif percepatan dan gaya.',
  };

  const verifiedExternal: SourceItem = {
    type: 'external',
    id: '10.26599/phys.2025.9320242',
    title: 'Newton Second Law is the Root of Classic Mechanics',
    publisher: 'Journal of Applied Physical Sciences',
    year: 2025,
    url: 'https://doi.org/10.26599/phys.2025.9320242',
    status: 'supporting',
    snippet: 'Derivation of classical momentum.',
  };

  assert.equal(verifiedInternal.status, 'verified');
  assert.equal(verifiedExternal.status, 'supporting');
  assert.equal(isSafeUrl(verifiedInternal.url), true);
  assert.equal(isSafeUrl(verifiedExternal.url), true);
});
