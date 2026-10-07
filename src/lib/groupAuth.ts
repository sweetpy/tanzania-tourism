import { createHmac, timingSafeEqual } from "node:crypto";
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
