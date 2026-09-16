/**
 * Optional founder notify for new leads.
 * Prefer Resend (RESEND_API_KEY) or a webhook (LEADS_WEBHOOK_URL).
 * Gmail MCP is agent-side only — not available from the Railway runtime.
 */

export type NotifyResult =
  | { sent: true; channel: "resend" | "webhook" }
  | { sent: false; reason: string };

function founderEmail(): string {
  return (
    process.env.FOUNDER_EMAIL?.trim() ||
    process.env.NOTIFY_EMAIL?.trim() ||
    "agubouy@gmail.com"
  );
}

function formatBody(
  kind: "enquire" | "partner",
  id: string,
  payload: Record<string, unknown>,
): { subject: string; text: string } {
  const label = kind === "enquire" ? "Traveller enquiry" : "Trade partner application";
  const subject = `[Wazi] ${label} ${id}`;
  const lines = Object.entries(payload).map(
    ([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`,
  );
  const text = [
    `${label} received.`,
    "",
    `Reference: ${id}`,
    `Time (UTC): ${new Date().toISOString()}`,
    "",
    ...lines,
    "",
    "— Wazi lead notify (MVP). Also stored in Postgres (and JSONL backup when available).",
  ].join("\n");
  return { subject, text };
}

async function sendResend(
  to: string,
  subject: string,
  text: string,
): Promise<NotifyResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { sent: false, reason: "RESEND_API_KEY not set" };

  const from =
    process.env.LEADS_FROM_EMAIL?.trim() || "Wazi <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, text }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        sent: false,
        reason: `Resend HTTP ${res.status}${body ? `: ${body.slice(0, 200)}` : ""}`,
      };
    }
    return { sent: true, channel: "resend" };
  } catch (err) {
    return {
      sent: false,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}

async function sendWebhook(
  kind: "enquire" | "partner",
  id: string,
  payload: Record<string, unknown>,
  subject: string,
  text: string,
): Promise<NotifyResult> {
  const url = process.env.LEADS_WEBHOOK_URL?.trim();
  if (!url) return { sent: false, reason: "LEADS_WEBHOOK_URL not set" };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "wazi",
        kind,
        id,
        subject,
        text,
        founderEmail: founderEmail(),
        payload,
      }),
    });
    if (!res.ok) {
      return { sent: false, reason: `Webhook HTTP ${res.status}` };
    }
    return { sent: true, channel: "webhook" };
  } catch (err) {
    return {
      sent: false,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Best-effort notify. Never throws — callers still succeed if DB/JSONL persisted. */
export async function notifyFounder(
  kind: "enquire" | "partner",
  id: string,
  payload: Record<string, unknown>,
): Promise<NotifyResult> {
  const { subject, text } = formatBody(kind, id, payload);
  const to = founderEmail();

  const resend = await sendResend(to, subject, text);
  if (resend.sent) return resend;

  const webhook = await sendWebhook(kind, id, payload, subject, text);
  if (webhook.sent) return webhook;

  const reasons = [resend.reason, webhook.reason].filter(Boolean).join("; ");
  return { sent: false, reason: reasons || "No email transport configured" };
}
