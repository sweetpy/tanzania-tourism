import assert from 'node:assert/strict';
import test from 'node:test';
import { handleBokerRequest } from '../src/lib/bokerGateway.ts';

const request = (operation = 'preview', body = { request: { days: 5 } }, headers = {}) => new Request(`https://www.bokeradventure.com/api/boker/${operation}`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
});

test('only exposes known public operations with their allowed methods', async () => {
  const never = () => { throw new Error('Must not reach upstream'); };
  assert.equal((await handleBokerRequest(request(), 'admin', never)).status, 404);
  const response = await handleBokerRequest(request('config'), 'config', never);
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET');
});

test('forwards planner JSON, preserves request id and reference without browser credentials', async () => {
  const body = { requestId: 'same-id-on-retry', contact: { name: 'Test' }, selectionId: 'route-1' };
  const response = await handleBokerRequest(request('enquiries', body, {
    origin: 'https://www.bokeradventure.com', cookie: 'staff=private', authorization: 'Bearer private',
  }), 'enquiries', async (url, options) => {
    assert.equal(String(url), 'https://pin-destinations-production.up.railway.app/api/boker/enquiries');
    assert.deepEqual(JSON.parse(options.body), body);
    assert.equal(options.headers.cookie, undefined);
    assert.equal(options.headers.authorization, undefined);
    assert.equal(options.redirect, 'error');
    assert.equal(options.cache, 'no-store');
    return Response.json({ saved: true, reference: 'BOK-123', emailSent: false }, { headers: { 'set-cookie': 'upstream=secret' } });
  });
  assert.deepEqual(await response.json(), { saved: true, reference: 'BOK-123', emailSent: false });
  assert.equal(response.headers.get('set-cookie'), null);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('config remains available without sign-in', async () => {
  const response = await handleBokerRequest(new Request('https://www.bokeradventure.com/api/boker/config'), 'config', async (_url, options) => {
    assert.equal(options.method, 'GET');
    return Response.json({ destinations: [], enquiriesAvailable: false });
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).enquiriesAvailable, false);
});

test('accepts the public browser host when Next uses an internal bound hostname', async () => {
  const incoming = new Request('http://0.0.0.0:3100/api/boker/preview', {
    method: 'POST', headers: { Host: 'localhost:3100', Origin: 'http://localhost:3100', 'Content-Type': 'application/json' }, body: '{}',
  });
  const response = await handleBokerRequest(incoming, 'preview', async () => Response.json({ options: [] }));
  assert.equal(response.status, 200);
});

test('config preserves the travel date for date-dependent managed destinations', async () => {
  const response = await handleBokerRequest(new Request('https://www.bokeradventure.com/api/boker/config?date=2026-11-05&private=ignored'), 'config', async url => {
    assert.equal(String(url), 'https://pin-destinations-production.up.railway.app/api/boker/config?date=2026-11-05');
    return Response.json({ destinations: [], enquiriesAvailable: true });
  });
  assert.equal(response.status, 200);
});

test('rejects foreign origins, non-JSON bodies, malformed JSON and oversized streaming bodies', async () => {
  const never = () => { throw new Error('Must not reach upstream'); };
  assert.equal((await handleBokerRequest(request('preview', {}, { origin: 'https://another-site.example' }), 'preview', never)).status, 403);
  assert.equal((await handleBokerRequest(request('preview', {}, { 'Content-Type': 'text/plain' }), 'preview', never)).status, 415);
  assert.equal((await handleBokerRequest(request('preview', []), 'preview', never)).status, 400);
  const invalid = new Request('https://www.bokeradventure.com/api/boker/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal((await handleBokerRequest(invalid, 'preview', never)).status, 400);
  assert.equal((await handleBokerRequest(request('preview', { notes: 'x'.repeat(65_536) }), 'preview', never)).status, 413);
});

test('preserves validation/rate-limit errors and retry timing', async () => {
  const response = await handleBokerRequest(request(), 'preview', async () => Response.json({ error: 'Please try again shortly.' }, { status: 429, headers: { 'retry-after': '60' } }));
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('retry-after'), '60');
});

test('upstream failures and HTML never masquerade as a saved enquiry', async () => {
  for (const fetcher of [async () => { throw new Error('private internal failure'); }, async () => new Response('<html>login</html>')]) {
    const response = await handleBokerRequest(request('enquiries'), 'enquiries', fetcher);
    assert.equal(response.status, 502);
    const payload = await response.json();
    assert.equal(payload.saved, undefined);
    assert.doesNotMatch(payload.error, /private internal/);
  }
});
