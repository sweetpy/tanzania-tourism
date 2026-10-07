import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { GroupError } from "./groupPolicy";

export type GroupCapabilities = {
  read: boolean;
  registrations: boolean;
  publish: boolean;
  offer: boolean;
  confirm: boolean;
  cancel: boolean;
  recoverLink: boolean;
  export: boolean;
};
export type BackofficeActor = {
  id: string;
  email: string;
  role: "admin" | "operator";
  department: string | null;
  capabilities: GroupCapabilities;
};
export function verifyBackofficeRequest(
  request: Request,
  raw: Record<string, unknown> | undefined,
  capability: keyof GroupCapabilities,
  key = process.env.BOKER_GROUP_BACKOFFICE_SECRET || "",
  time = Date.now(),
) {
  const header = request.headers.get("x-boker-backoffice") || "";
  const reject = () => {
    throw new GroupError(
      "Sign in through the Pin Destinations back office.",
      401,
    );
  };
  if (key.length < 32 || header.length > 3000) return reject();
  const [timestamp, nonce, encoded, signature, extra] = header.split(".");
  if (
    extra ||
    !/^\d{10}$/.test(timestamp || "") ||
    Math.abs(time / 1000 - Number(timestamp)) > 60 ||
    !/^[a-f0-9]{32}$/.test(nonce || "") ||
    !/^[A-Za-z0-9_-]+$/.test(encoded || "") ||
    !/^[a-f0-9]{64}$/.test(signature || "")
  )
    return reject();
  const digest = createHash("sha256")
    .update(raw ? JSON.stringify(raw) : "")
    .digest("hex");
  const expected = createHmac("sha256", key)
    .update(
      [
        request.method,
        new URL(request.url).pathname,
        timestamp,
        nonce,
        encoded,
        digest,
      ].join("\n"),
    )
    .digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, "hex")))
    return reject();
  let actor: BackofficeActor;
  try {
    actor = JSON.parse(Buffer.from(encoded, "base64url").toString());
  } catch {
    return reject();
  }
  if (
    !actor ||
    typeof actor.id !== "string" ||
    !actor.id ||
    actor.id.length > 150 ||
    typeof actor.email !== "string" ||
    !actor.email ||
    actor.email.length > 200 ||
    !["admin", "operator"].includes(actor.role) ||
    !(actor.department === null || typeof actor.department === "string") ||
    !actor.capabilities ||
    typeof actor.capabilities !== "object" ||
    Object.values(actor.capabilities).some(
      (value) => typeof value !== "boolean",
    )
  )
    return reject();
  if (
    actor.capabilities.read !== true ||
    actor.capabilities[capability] !== true
  )
    throw new GroupError("Your Pin account cannot perform this action.", 403);
  return { actor, nonce };
}
