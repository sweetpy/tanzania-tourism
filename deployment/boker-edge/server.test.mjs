import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer, permitted } from './server.mjs';

async function start(t, handler) {
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  return `http://127.0.0.1:${server.address().port}`;
}

test('only permits public website paths and exact enquiry APIs', () => {
  for (const path of ['/', '/plan', '/destinations/serengeti', '/operators/catalog', '/_next/static/test.js', '/_next/image', '/opengraph-image', '/boker/destinations/serengeti']) assert.equal(permitted('GET', path), true, path);
  for (const path of ['/admin', '/api/auth/login', '/api/customers', '/api/boker/enquiries/123', '/api/partner']) assert.equal(permitted('GET', path), false, path);
  assert.equal(permitted('POST', '/api/boker/enquiries'), true);
  assert.equal(permitted('POST', '/api/partner'), true);
  assert.equal(permitted('DELETE', '/api/boker/enquiries'), false);
});

test('serves home and Next navigation from unified website with RSC headers', async t => {
  const requests = [];
  const base = await start(t, async (url, options) => {
    requests.push({ url, options });
    return new Response('Boker', { headers: { 'content-type': 'text/x-component', vary: 'RSC', 'set-cookie': 'private=1' } });
  });
  const response = await fetch(`${base}/?_rsc=abc`, { headers: { rsc: '1', 'next-router-state-tree': 'tree', Cookie: 'secret=x', Authorization: 'Bearer secret' } });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'Boker');
  assert.equal(requests[0].url, 'https://tanzania-tourism-production.up.railway.app/?_rsc=abc');
  assert.equal(requests[0].options.headers.rsc, '1');
  assert.equal(requests[0].options.headers['next-router-state-tree'], 'tree');
  assert.equal(requests[0].options.headers.Cookie, undefined);
  assert.equal(requests[0].options.headers.Authorization, undefined);
  assert.equal(response.headers.get('set-cookie'), null);
  assert.equal(response.headers.get('vary'), 'RSC');
});

test('keeps planner in Pin and traveller/trade leads in their existing backend', async t => {
  const requests = [];
  const base = await start(t, async (url, options) => { requests.push({ url, options }); return Response.json({ saved: true, reference: 'BOK-123' }); });
  for (const endpoint of ['/api/boker/enquiries', '/api/enquire', '/api/partner']) {
    const response = await fetch(base + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://www.bokeradventure.com' }, body: '{"requestId":"keep-me"}' });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
  assert.match(requests[0].url, /^https:\/\/pin-destinations-production/);
  assert.match(requests[1].url, /^https:\/\/tanzania-tourism-production/);
  assert.match(requests[2].url, /^https:\/\/tanzania-tourism-production/);
  assert.equal(requests[0].options.body.toString(), '{"requestId":"keep-me"}');
  const denied = await fetch(`${base}/api/boker/preview`, { method: 'POST', headers: { Origin: 'https://other.example', 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(denied.status, 403);
  assert.equal((await fetch(`${base}/api/partner`, { method: 'POST', body: '{}' })).status, 415);
  assert.equal(requests.length, 3);
});

test('keeps public redirects on Boker and rejects external redirects', async t => {
  const base = await start(t, async url => new Response(null, { status: 308, headers: { location: url.includes('/boker') ? 'https://tanzania-tourism-production.up.railway.app/plan?park=ruaha' : 'https://evil.example/' } }));
  const redirect = await fetch(`${base}/boker`, { redirect: 'manual' });
  assert.equal(redirect.headers.get('location'), '/plan?park=ruaha');
  assert.equal((await fetch(`${base}/plan`, { redirect: 'manual' })).status, 502);
  const admin = await fetch(`${base}/admin`, { redirect: 'manual' });
  assert.equal(admin.headers.get('location'), 'https://pin-destinations-production.up.railway.app/admin');
});

test('rejects oversized requests and reports network failures honestly', async t => {
  let count = 0;
  const base = await start(t, async () => { count++; throw new Error('upstream unavailable'); });
  const large = await fetch(`${base}/api/boker/preview`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'x'.repeat(65_537) });
  assert.equal(large.status, 413);
  assert.equal(count, 0);
  assert.equal((await fetch(`${base}/plan`)).status, 502);
});
