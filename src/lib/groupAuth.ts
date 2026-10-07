import {
  createHmac,
  createHash,
  timingSafeEqual,
  randomBytes,
} from "node:crypto";
import { GroupError } from "@/lib/groupPolicy";
export const groupCookie = "boker_group_team";
export function groupVisitorIdentity(
  request: Request,
  now = Date.now(),
): string | null {
  const value = request.headers.get("x-boker-group-visitor");
  const proxySecret = process.env.BOKER_GROUP_PROXY_SECRET;
  if (
    !value ||
    !proxySecret ||
    proxySecret.length < 32 ||
    !/^\d{13}\.[a-f0-9]{64}\.[a-f0-9]{64}$/.test(value)
  )
    return null;
  const [expires, visitor, signature] = value.split(".");
  if (Number(expires) <= now || Number(expires) > now + 120_000) return null;
  const expected = createHmac("sha256", proxySecret)
    .update(`${expires}.${visitor}`)
    .digest("hex");
  return timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex"),
  )
    ? visitor
    : null;
}
function secret() {
  const value = process.env.BOKER_GROUP_ADMIN_SECRET?.trim();
  if (!value || value.length < 32)
    throw new GroupError("Team access is not configured.", 503);
  return value;
}
export function verifyGroupPassword(password: unknown) {
  const expected = secret();
  return (
    typeof password === "string" &&
    password.length <= 200 &&
    timingSafeEqual(
      createHash("sha256").update(password).digest(),
      createHash("sha256").update(expected).digest(),
    )
  );
}
export function issueGroupSession(now = Date.now()) {
  const payload = `${now + 12 * 3600_000}.${randomBytes(16).toString("hex")}`;
  return `${payload}.${createHmac("sha256", secret()).update(payload).digest("hex")}`;
}
export function authenticatedGroupRequest(request: Request, now = Date.now()) {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(groupCookie + "="))
    ?.slice(groupCookie.length + 1);
  if (!cookie || !/^\d{13}\.[a-f0-9]{32}\.[a-f0-9]{64}$/.test(cookie))
    return false;
  const [expires, nonce, signature] = cookie.split(".");
  if (Number(expires) <= now || Number(expires) > now + 13 * 3600_000)
    return false;
  const expected = createHmac("sha256", secret())
    .update(`${expires}.${nonce}`)
    .digest("hex");
  return timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex"),
  );
}
export function assertTeam(request: Request) {
  if (!authenticatedGroupRequest(request))
    throw new GroupError("Sign in to the departure desk.", 401);
}
export function assertSameOrigin(request: Request, required = false) {
  const origin = request.headers.get("origin");
  if (!origin) {
    if (required)
      throw new GroupError(
        "Use the Boker departure desk to make this change.",
        403,
      );
    return;
  }
  const host = request.headers.get("host") || new URL(request.url).host;
  let valid = false;
  try {
    const url = new URL(origin);
    valid = url.host === host && ["http:", "https:"].includes(url.protocol);
  } catch {}
  if (!valid)
    throw new GroupError("This request must come from the Boker website.", 403);
}
