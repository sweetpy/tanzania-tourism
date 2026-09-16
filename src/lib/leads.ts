import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { ensureSchema, getPool, query } from "@/lib/db";

export type LeadKind = "enquire" | "partner";

export type LeadRecord = {
  kind: LeadKind;
  id: string;
  receivedAt: string;
  payload: Record<string, unknown>;
};

const TABLE_BY_KIND: Record<LeadKind, string> = {
  enquire: "enquiries",
  partner: "partner_applications",
};

/**
 * Persist a lead. Prefer Postgres when DATABASE_URL is set; always attempt
 * JSONL append as a secondary durability path (volume / local /tmp).
 */
export async function appendLead(
  kind: LeadKind,
  id: string,
  payload: Record<string, unknown>,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const receivedAt =
    typeof payload.receivedAt === "string"
      ? payload.receivedAt
      : new Date().toISOString();

  const record: LeadRecord = {
    kind,
    id,
    receivedAt,
    payload,
  };

  let dbOk = false;
  let dbError = "";
  const pool = getPool();
  if (pool) {
    try {
      await ensureSchema();
      const table = TABLE_BY_KIND[kind];
      await query(
        `INSERT INTO ${table} (id, created_at, payload, status)
         VALUES ($1, $2::timestamptz, $3::jsonb, 'new')
         ON CONFLICT (id) DO NOTHING`,
        [id, receivedAt, JSON.stringify(payload)],
      );
      dbOk = true;
    } catch (err) {
      dbError = err instanceof Error ? err.message : String(err);
      console.error(`[leads] postgres insert failed (${kind}/${id}):`, dbError);
    }
  }

  const line = `${JSON.stringify(record)}\n`;
  const candidates = [
    process.env.LEADS_LOG_PATH,
    "/data/leads.jsonl",
    path.join(process.cwd(), "data", "leads.jsonl"),
    path.join("/tmp", "wazi-leads.jsonl"),
  ].filter((p): p is string => Boolean(p && p.trim()));

  let jsonlPath: string | null = null;
  let lastError = dbError || "No writable lead log path.";
  for (const filePath of candidates) {
    try {
      await mkdir(path.dirname(filePath), { recursive: true });
      await appendFile(filePath, line, "utf8");
      jsonlPath = filePath;
      break;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  if (dbOk) {
    return { ok: true, path: jsonlPath ? `postgres+${jsonlPath}` : "postgres" };
  }
  if (jsonlPath) {
    return { ok: true, path: jsonlPath };
  }
  return { ok: false, error: lastError };
}
