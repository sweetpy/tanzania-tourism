import http from 'node:http';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { pathToFileURL } from 'node:url';

const WEBSITE = 'https://tanzania-tourism-production.up.railway.app';
const PLANNER = 'https://pin-destinations-production.up.railway.app';
const PUBLIC_ORIGIN = 'https://www.bokeradventure.com';
const POST_PATHS = new Set(['/api/boker/preview', '/api/boker/enquiries', '/api/enquire', '/api/partner']);
const PAGES = new Set(['/', '/plan', '/about', '/partners', '/enquire', '/privacy', '/terms', '/operators', '/operators/catalog', '/operators/apply', '/destinations', '/experiences', '/packages']);
const ALLOWED_ORIGINS = new Set([PUBLIC_ORIGIN, 'https://bokeradventure.com', 'https://boker-adventure-production.up.railway.app']);
if (process.env.RAILWAY_PUBLIC_DOMAIN) ALLOWED_ORIGINS.add(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);

export function permitted(method, path) {
  if (method === 'POST') return POST_PATHS.has(path);
  if (method !== 'GET' && method !== 'HEAD') return false;
  return PAGES.has(path) || /^\/(destinations|experiences|packages)\/[a-z0-9-]+$/.test(path) ||
    /^\/boker(?:\/(?:destinations(?:\/[a-z0-9-]+)?|privacy|terms))?$/.test(path) ||
    path.startsWith('/_next/static/') || path === '/_next/image' ||
    path === '/api/boker/config' || path === '/favicon.ico' || path === '/icon.svg' || path === '/icon.png' || path === '/opengraph-image';
}

export function createServer(fetchUpstream = fetch) {
  return http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    let url;
    try { url = new URL(req.url, PUBLIC_ORIGIN); } catch { res.writeHead(400).end(); return; }
    if (url.origin !== PUBLIC_ORIGIN || !req.url.startsWith('/') || req.url.startsWith('//') || /\\|%2f|%5c/i.test(url.pathname)) {
      res.writeHead(400).end(); return;
    }
    if (url.pathname === '/health' && ['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }).end('{"status":"ok","service":"boker-unified-edge","version":2}'); return;
    }
    if (url.pathname === '/admin' && ['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(302, { Location: `${PLANNER}/admin` }).end(); return;
    }
    if (url.pathname === '/robots.txt' && ['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(200, { 'Content-Type': 'text/plain' }).end('User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\n'); return;
    }
    if (!permitted(req.method, url.pathname)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Page not found. Visit / to explore Boker.'); return;
    }
    if (req.method === 'POST' && req.headers.origin && !ALLOWED_ORIGINS.has(req.headers.origin)) {
      res.writeHead(403, { 'Content-Type': 'application/json' }).end('{"error":"Unrecognized request origin"}'); return;
    }
    if (req.method === 'POST' && req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      res.writeHead(415, { 'Content-Type': 'application/json' }).end('{"error":"A JSON request is required"}'); return;
    }
    try {
      let body;
      if (req.method === 'POST') {
        let size = 0; const chunks = [];
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 65_536) { res.writeHead(413).end(); return; }
          chunks.push(chunk);
        }
        body = Buffer.concat(chunks);
      }
      const upstream = url.pathname.startsWith('/api/boker/') ? PLANNER : WEBSITE;
      const requestHeaders = { Accept: req.headers.accept || '*/*', ...(body ? { 'Content-Type': 'application/json' } : {}) };
      // Next.js navigation needs its public RSC headers, but never staff cookies,
      // authorization, arbitrary forwarding headers or private session state.
      if (req.method === 'GET' || req.method === 'HEAD') {
        for (const name of ['rsc', 'next-router-state-tree', 'next-router-prefetch', 'next-router-segment-prefetch', 'next-url', 'if-none-match']) {
          if (typeof req.headers[name] === 'string') requestHeaders[name] = req.headers[name];
        }
      }
      const response = await fetchUpstream(`${upstream}${url.pathname}${url.search}`, {
        method: req.method, headers: requestHeaders, body,
        redirect: 'manual', signal: AbortSignal.timeout(30_000),
      });
      const headers = {};
      for (const name of ['content-type', 'cache-control', 'content-security-policy', 'x-frame-options', 'retry-after', 'referrer-policy', 'vary', 'etag']) {
        if (response.headers.has(name)) headers[name] = response.headers.get(name);
      }
      if (url.pathname.startsWith('/api/')) headers['cache-control'] = 'no-store';
      const location = response.headers.get('location');
      if (location) {
        const destination = new URL(location, upstream);
        if (destination.origin !== upstream || !permitted('GET', destination.pathname)) {
          res.writeHead(502).end('Unexpected upstream redirect'); return;
        }
        headers.location = destination.pathname + destination.search + destination.hash;
      }
      res.writeHead(response.status, headers);
      if (req.method === 'HEAD' || !response.body) { res.end(); return; }
      await pipeline(Readable.fromWeb(response.body), res);
    } catch {
      if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }).end('{"error":"The Boker service is temporarily unavailable. Please try again."}');
      else res.destroy();
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createServer().listen(Number(process.env.PORT || 8080), '0.0.0.0', () => console.log('Boker unified website ready'));
}
