import test from "node:test";
import assert from "node:assert/strict";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import Module from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url),
  ts = require("typescript");
Module._extensions[".ts"] = (module, file) =>
  module._compile(
    ts.transpileModule(readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    file,
  );
const {
  verifyBackofficeRequest,
} = require("../src/lib/groupBackofficeAuth.ts");
const key = "isolated-test-only-key-for-pin-backoffice";
const staff = {
  id: "staff-123",
  email: "operator@example.test",
  role: "operator",
  department: "sales",
  capabilities: {
    read: true,
    registrations: true,
    publish: false,
    offer: true,
    confirm: false,
    cancel: true,
    recoverLink: true,
    export: true,
  },
};
function signed(
  method = "POST",
  path = "/api/groups/backoffice/registration/BG-123456789ABC",
  raw = { action: "offer" },
  actor = staff,
  now = Date.now(),
) {
  const timestamp = String(Math.floor(now / 1000)),
    nonce = randomBytes(16).toString("hex"),
    encoded = Buffer.from(JSON.stringify(actor)).toString("base64url"),
    digest = createHash("sha256")
      .update(raw ? JSON.stringify(raw) : "")
      .digest("hex");
  const signature = createHmac("sha256", key)
    .update([method, path, timestamp, nonce, encoded, digest].join("\n"))
    .digest("hex");
  return new Request("https://boker.test" + path, {
    method,
    headers: {
      "x-boker-backoffice": [timestamp, nonce, encoded, signature].join("."),
    },
  });
}
test("Pin staff signatures authorize the specific permitted action and preserve staff attribution", () => {
  const result = verifyBackofficeRequest(
    signed(),
    { action: "offer" },
    "offer",
    key,
  );
  assert.deepEqual(result.actor, staff);
  assert.match(result.nonce, /^[a-f0-9]{32}$/);
  assert.throws(
    () =>
      verifyBackofficeRequest(signed(), { action: "offer" }, "confirm", key),
    (error) => error.status === 403,
  );
});
test("Signed staff requests cannot change the body, URL, method, actor or expiry", () => {
  const request = signed();
  assert.throws(
    () => verifyBackofficeRequest(request, { action: "confirm" }, "offer", key),
    (error) => error.status === 401,
  );
  for (const changed of [
    new Request("https://boker.test/api/groups/backoffice/departure", {
      method: "POST",
      headers: request.headers,
    }),
    new Request(request.url, { method: "GET", headers: request.headers }),
  ])
    assert.throws(
      () => verifyBackofficeRequest(changed, { action: "offer" }, "offer", key),
      (error) => error.status === 401,
    );
  assert.throws(
    () =>
      verifyBackofficeRequest(
        signed(
          "POST",
          new URL(request.url).pathname,
          { action: "offer" },
          staff,
          Date.now() - 120000,
        ),
        { action: "offer" },
        "offer",
        key,
      ),
    (error) => error.status === 401,
  );
  assert.throws(
    () =>
      verifyBackofficeRequest(
        request,
        { action: "offer" },
        "offer",
        "wrong-key-with-enough-length-to-validate",
      ),
    (error) => error.status === 401,
  );
  const fields = request.headers.get("x-boker-backoffice").split(".");
  fields[2] = Buffer.from(JSON.stringify({ ...staff, role: "admin" })).toString(
    "base64url",
  );
  assert.throws(
    () =>
      verifyBackofficeRequest(
        new Request(request.url, {
          method: "POST",
          headers: { "x-boker-backoffice": fields.join(".") },
        }),
        { action: "offer" },
        "offer",
        key,
      ),
    (error) => error.status === 401,
  );
});
test("Legacy passwords/cookies and malformed signatures cannot authenticate the staff bridge", () => {
  for (const headers of [
    { Cookie: "boker_group_team=old-session" },
    { Authorization: "Bearer old-code" },
    { "x-boker-backoffice": "a.b.c.d" },
    { "x-boker-backoffice": "x".repeat(3100) },
  ])
    assert.throws(
      () =>
        verifyBackofficeRequest(
          new Request("https://boker.test/api/groups/backoffice", { headers }),
          undefined,
          "read",
          key,
        ),
      (error) => error.status === 401,
    );
  assert.throws(
    () => verifyBackofficeRequest(signed(), { action: "offer" }, "offer", ""),
    (error) => error.status === 401,
  );
});
