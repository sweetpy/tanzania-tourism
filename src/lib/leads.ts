import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";

export type LeadKind = "enquire" | "partner";

export type LeadRecord = {
  kind: LeadKind;
  id: string;
  receivedAt: string;
  payload: Record<string, unknown>;
};

export type AppendLeadResult =
  | { ok: true; path: string; backend: "postgres" | "jsonl" }
  | { ok: false; error: string };

let pool: Pool | null = null;
let schemaReady: Promise<void> | null = null;

function getPool(): Pool | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: url,
      ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
      max: 3,
    });
  }
  return pool;
}

async function ensureSchema(p: Pool): Promise<void> {
  if (!schemaReady) {
    schemaReady = p
      .query(`
        CREATE TABLE IF NOT EXISTS leads (
          id TEXT PRIMARY KEY,
          kind TEXT NOT NULL,
          received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          payload JSONB NOT NULL
        );
        CREATE INDEX IF NOT EXISTS leads_kind_received_idx
          ON leads (kind, received_at DESC);
      `)
      .then(() => undefined)
      .catch((err) => {
        schemaReady = null;
        throw err;
      });
  }
  await schemaReady;
}

async function appendLeadPostgres(
  kind: LeadKind,
  id: string,
  payload: Record<string, unknown>,
): Promise<AppendLeadResult | null> {
  const p = getPool();
  if (!p) return null;
  try {
    await ensureSchema(p);
    await p.query(
      `INSERT INTO leads (id, kind, received_at, payload)
       VALUES ($1, $2, $3, $4::jsonb)
       ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload`,
      [id, kind, new Date().toISOString(), JSON.stringify(payload)],
    );
    return { ok: true, path: "postgres:leads", backend: "postgres" };
  } catch (err) {
    console.error("[leads] postgres insert failed:", err);
    return null;
  }
}

async function appendLeadJsonl(
  kind: LeadKind,
  id: string,
  payload: Record<string, unknown>,
): Promise<AppendLeadResult> {
  const record: LeadRecord = {
    kind,
    id,
    receivedAt: new Date().toISOString(),
    payload,
  };
  const line = `${JSON.stringify(record)}\n`;

  const candidates = [
    process.env.LEADS_LOG_PATH,
    "/data/leads.jsonl",
    path.join(process.cwd(), "data", "leads.jsonl"),
    path.join("/tmp", "wazi-leads.jsonl"),
  ].filter((p): p is string => Boolean(p && p.trim()));

  let lastError = "No writable lead log path.";
  for (const filePath of candidates) {
    try {
      await mkdir(path.dirname(filePath), { recursive: true });
      await appendFile(filePath, line, "utf8");
      return { ok: true, path: filePath, backend: "jsonl" };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  return { ok: false, error: lastError };
}

/**
 * Persist a lead. Prefer Postgres (DATABASE_URL); fall back to durable JSONL.
 * No CRM — one row / one line per submission.
 */
export async function appendLead(
  kind: LeadKind,
  id: string,
  payload: Record<string, unknown>,
): Promise<AppendLeadResult> {
  const pg = await appendLeadPostgres(kind, id, payload);
  if (pg?.ok) return pg;

  const file = await appendLeadJsonl(kind, id, payload);
  if (file.ok) return file;

  return {
    ok: false,
    error: pg
      ? `postgres failed; jsonl failed: ${file.ok === false ? file.error : "unknown"}`
      : file.ok === false
        ? file.error
        : "No persistence backend available",
  };
}
