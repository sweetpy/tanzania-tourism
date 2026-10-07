import test from "node:test";
import assert from "node:assert/strict";
import { createServer, permitted } from "./server.mjs";
import { createHmac } from "node:crypto";

async function start(t, handler) {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  return `http://127.0.0.1:${server.address().port}`;
}

test("only permits public website paths and exact enquiry APIs", () => {
  for (const path of [
    "/",
    "/plan",
    "/destinations/serengeti",
    "/operators/catalog",
    "/_next/static/test.js",
    "/_next/image",
    "/opengraph-image",
    "/boker/destinations/serengeti",
  ])
    assert.equal(permitted("GET", path), true, path);
  for (const path of [
    "/admin",
    "/api/auth/login",
    "/api/customers",
    "/api/boker/enquiries/123",
    "/api/partner",
  ])
    assert.equal(permitted("GET", path), false, path);
  assert.equal(permitted("POST", "/api/boker/enquiries"), true);
  assert.equal(permitted("POST", "/api/partner"), true);
  assert.equal(permitted("DELETE", "/api/boker/enquiries"), false);
});

test("serves home and Next navigation from unified website with RSC headers", async (t) => {
  const requests = [];
  const base = await start(t, async (url, options) => {
    requests.push({ url, options });
    return new Response("Boker", {
      headers: {
        "content-type": "text/x-component",
        vary: "RSC",
        "set-cookie": "private=1",
      },
    });
  });
  const response = await fetch(`${base}/?_rsc=abc`, {
    headers: {
      rsc: "1",
      "next-router-state-tree": "tree",
      Cookie: "secret=x",
      Authorization: "Bearer secret",
    },
  });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "Boker");
  assert.equal(
    requests[0].url,
    "https://tanzania-tourism-production.up.railway.app/?_rsc=abc",
  );
  assert.equal(requests[0].options.headers.rsc, "1");
  assert.equal(requests[0].options.headers["next-router-state-tree"], "tree");
  assert.equal(requests[0].options.headers.Cookie, undefined);
  assert.equal(requests[0].options.headers.Authorization, undefined);
  assert.equal(response.headers.get("set-cookie"), null);
  assert.equal(response.headers.get("vary"), "RSC");
});

test("keeps planner in Pin and traveller/trade leads in their existing backend", async (t) => {
  const requests = [];
  const base = await start(t, async (url, options) => {
    requests.push({ url, options });
    return Response.json({ saved: true, reference: "BOK-123" });
  });
  for (const endpoint of [
    "/api/boker/enquiries",
    "/api/enquire",
    "/api/partner",
  ]) {
    const response = await fetch(base + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://www.bokeradventure.com",
      },
      body: '{"requestId":"keep-me"}',
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
  assert.match(requests[0].url, /^https:\/\/pin-destinations-production/);
  assert.match(requests[1].url, /^https:\/\/tanzania-tourism-production/);
  assert.match(requests[2].url, /^https:\/\/tanzania-tourism-production/);
  assert.equal(requests[0].options.body.toString(), '{"requestId":"keep-me"}');
  const denied = await fetch(`${base}/api/boker/preview`, {
    method: "POST",
    headers: {
      Origin: "https://other.example",
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  assert.equal(denied.status, 403);
  assert.equal(
    (await fetch(`${base}/api/partner`, { method: "POST", body: "{}" })).status,
    415,
  );
  assert.equal(requests.length, 3);
});

test("keeps public redirects on Boker and rejects external redirects", async (t) => {
  const base = await start(
    t,
    async (url) =>
      new Response(null, {
        status: 308,
        headers: {
          location: url.includes("/boker")
            ? "https://tanzania-tourism-production.up.railway.app/plan?park=ruaha"
            : "https://evil.example/",
        },
      }),
  );
  const redirect = await fetch(`${base}/boker`, { redirect: "manual" });
  assert.equal(redirect.headers.get("location"), "/plan?park=ruaha");
  assert.equal(
    (await fetch(`${base}/plan`, { redirect: "manual" })).status,
    502,
  );
  const admin = await fetch(`${base}/admin`, { redirect: "manual" });
  assert.equal(
    admin.headers.get("location"),
    "https://pin-destinations-production.up.railway.app/admin",
  );
});

test("rejects oversized requests and reports network failures honestly", async (t) => {
  let count = 0;
  const base = await start(t, async () => {
    count++;
    throw new Error("upstream unavailable");
  });
  const large = await fetch(`${base}/api/boker/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "x".repeat(65_537),
  });
  assert.equal(large.status, 413);
  assert.equal(count, 0);
  assert.equal((await fetch(`${base}/plan`)).status, 502);
});

test("permits the calendar, exact group operations and licensed assets without exposing unrelated APIs", () => {
  for (const path of [
    "/groups",
    "/groups/desk",
    "/groups/credits",
    "/groups/my/BG-ABCDEF123456",
    "/groups/machame-2027-01-03",
    "/api/groups",
    "/api/groups/team",
    "/api/groups/session",
    "/api/groups/calendar",
    "/api/groups/calendar/machame-2027-01-03",
    "/api/groups/registration/BG-ABCDEF123456",
    "/api/groups/export",
    "/images/groups/meru.jpg",
    "/sitemap.xml",
    "/robots.txt",
  ])
    assert.equal(permitted("GET", path), true, path);
  for (const path of [
    "/api/groups/login",
    "/api/groups/logout",
    "/api/groups/register",
    "/api/groups/registration/BG-ABCDEF123456",
    "/api/groups/team/departure",
    "/api/groups/team/registration/BG-ABCDEF123456",
    "/api/groups/team/link/BG-ABCDEF123456",
  ])
    assert.equal(permitted("POST", path), true, path);
  for (const path of [
    "/api/groups/team/secrets",
    "/api/groups/admin",
    "/api/auth/login",
    "/images/groups/private.jpg",
    "/api/groups/registration/../../admin",
  ]) {
    assert.equal(permitted("GET", path), false, path);
    assert.equal(permitted("POST", path), false, path);
  }
});

test("forwards only the group session and private capability, verifies public origins, and keeps private responses uncached", async (t) => {
  const secret = "TestGroupProxySigningKeyForLocalVerificationOnly";
  const previous = process.env.BOKER_GROUP_PROXY_SECRET;
  process.env.BOKER_GROUP_PROXY_SECRET = secret;
  t.after(() => {
    if (previous === undefined) delete process.env.BOKER_GROUP_PROXY_SECRET;
    else process.env.BOKER_GROUP_PROXY_SECRET = previous;
  });
  const requests = [];
  const session = `boker_group_team=${Date.now() + 60000}.${"a".repeat(32)}.${"b".repeat(64)}`;
  const base = await start(t, async (url, options) => {
    requests.push({ url, options });
    return Response.json(
      { ok: true },
      {
        headers: {
          "set-cookie": session + "; Path=/; HttpOnly; Secure; SameSite=Strict",
          "content-disposition": "attachment; filename=groups.csv",
        },
      },
    );
  });
  const login = await fetch(base + "/api/groups/login", {
    method: "POST",
    headers: {
      Origin: "https://www.bokeradventure.com",
      "Content-Type": "application/json",
      Cookie: `PinSession=secret; ${session}`,
      "x-boker-group-visitor": "forged",
      "x-forwarded-for": "forged, 203.0.113.10",
    },
    body: '{"password":"test"}',
  });
  assert.equal(login.status, 200);
  assert.equal(
    requests[0].options.headers.origin,
    "https://tanzania-tourism-production.up.railway.app",
  );
  assert.equal(requests[0].options.headers.cookie, session);
  assert.equal(
    login.headers.get("set-cookie"),
    session + "; Path=/; HttpOnly; Secure; SameSite=Strict",
  );
  assert.equal(login.headers.get("cache-control"), "no-store");
  const proof = requests[0].options.headers["x-boker-group-visitor"];
  assert.match(proof, /^\d{13}\.[a-f0-9]{64}\.[a-f0-9]{64}$/);
  const [expires, visitor, signature] = proof.split(".");
  assert.equal(
    signature,
    createHmac("sha256", secret).update(`${expires}.${visitor}`).digest("hex"),
  );
  assert.ok(Number(expires) > Date.now());
  const token = "A".repeat(43);
  await fetch(base + "/api/groups/registration/BG-ABCDEF123456", {
    headers: {
      Authorization: "Bearer " + token,
      Cookie: `PinSession=secret; ${session}`,
    },
  });
  assert.equal(requests[1].options.headers.authorization, "Bearer " + token);
  assert.equal(requests[1].options.headers.cookie, session);
  await fetch(base + "/api/groups/team", {
    headers: {
      Authorization: "Bearer PinSessionSecret",
      Cookie: "PinSession=secret",
    },
  });
  assert.equal(requests[2].options.headers.authorization, undefined);
  assert.equal(requests[2].options.headers.cookie, undefined);
  assert.equal(
    (
      await fetch(base + "/api/groups/login", {
        method: "POST",
        headers: {
          Origin: "https://foreign.example",
          "Content-Type": "application/json",
        },
        body: "{}",
      })
    ).status,
    403,
  );
  await fetch(base + "/api/groups/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  assert.equal(
    requests[3].options.headers.origin,
    undefined,
    "No missing origin is invented for private mutations",
  );
});
