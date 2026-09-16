import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type LeadKind = "enquire" | "partner";

export type LeadRecord = {
  kind: LeadKind;
  id: string;
  receivedAt: string;
  payload: Record<string, unknown>;
};

/**
 * Durable append-only lead log (JSONL). No CRM — one line per submission.
 * Path order: LEADS_LOG_PATH → /data/leads.jsonl → ./data/leads.jsonl → /tmp.
 */
export async function appendLead(
  kind: LeadKind,
  id: string,
  payload: Record<string, unknown>,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
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
      return { ok: true, path: filePath };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  return { ok: false, error: lastError };
}
