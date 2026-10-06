/** Public planner gateway. Only the three existing Boker operations are exposed. */
const defaultOrigin = "https://pin-destinations-production.up.railway.app";
const bodyLimit = 65_536;
const responseLimit = 2_000_000;

function json(value: unknown, status: number, extraHeaders: Record<string, string> = {}) {
  return Response.json(value, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...extraHeaders },
  });
}

async function readLimited(stream: ReadableStream<Uint8Array> | null, limit: number) {
  if (!stream) return "";
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new RangeError("Payload too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(bytes);
}

export async function handleBokerRequest(
  request: Request,
  operation: string,
  fetchUpstream: typeof fetch = fetch,
) {
  const expectedMethod = operation === "config" ? "GET"
    : operation === "preview" || operation === "enquiries" ? "POST" : null;
  if (!expectedMethod) return json({ error: "Planner endpoint not found." }, 404);
  if (request.method !== expectedMethod) {
    return json({ error: "Method not allowed." }, 405, { Allow: expectedMethod });
  }

  let body: string | undefined;
  if (expectedMethod === "POST") {
    const origin = request.headers.get("origin");
    if (origin) {
      // Next's bound URL may use 0.0.0.0 behind Railway. The browser's Host
      // header identifies the public request; arbitrary forwarded hosts do not.
      let allowed = false;
      try {
        const originUrl = new URL(origin);
        const publicHost = request.headers.get("host") || new URL(request.url).host;
        allowed = ["http:", "https:"].includes(originUrl.protocol)
          && originUrl.host === publicHost.toLowerCase();
      } catch { /* Invalid origins are rejected. */ }
      if (!allowed) return json({ error: "Please submit your plan from this website." }, 403);
    }
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
      return json({ error: "A JSON request is required." }, 415);
    }
    if (Number(request.headers.get("content-length")) > bodyLimit) {
      return json({ error: "Your request is too large." }, 413);
    }
    try {
      body = await readLimited(request.body, bodyLimit);
      const payload: unknown = JSON.parse(body);
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return json({ error: "Please provide a valid planner request." }, 400);
      }
    } catch (error) {
      return json({ error: error instanceof RangeError ? "Your request is too large." : "Invalid JSON request." }, error instanceof RangeError ? 413 : 400);
    }
  }

  let upstream: URL;
  try {
    upstream = new URL(process.env.BOKER_API_ORIGIN || defaultOrigin);
    if (upstream.protocol !== "https:" || upstream.username || upstream.password || upstream.search || upstream.hash || upstream.pathname !== "/") {
      throw new Error("Invalid origin");
    }
  } catch {
    return json({ error: "The itinerary service is not configured. Please contact the Boker team." }, 503);
  }

  try {
    const target = new URL(`/api/boker/${operation}`, upstream);
    const date = new URL(request.url).searchParams.get("date");
    if (operation === "config" && date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: "Please provide a valid travel date." }, 400);
      target.searchParams.set("date", date);
    }
    const response = await fetchUpstream(target, {
      method: expectedMethod,
      headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
      body,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(25_000)]),
    });
    if (!response.headers.get("content-type")?.includes("application/json")) {
      throw new Error("Invalid planner response");
    }
    const payload: unknown = JSON.parse(await readLimited(response.body, responseLimit));
    const retryAfter = response.headers.get("retry-after");
    return json(payload, response.status, retryAfter ? { "Retry-After": retryAfter } : {});
  } catch {
    return json({ error: "The itinerary service is temporarily unavailable. Please try again, or contact the Boker team." }, 502);
  }
}
