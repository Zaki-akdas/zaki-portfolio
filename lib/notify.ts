// Owner email notification on new contact messages (Phase 2 of
// docs/durable-contact-delivery.md). Best-effort by contract: Redis is the
// record of truth — a failed or skipped notification must never break or
// delay the contact flow, so nothing here ever throws.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_BASE_URL = process.env.RESEND_BASE_URL || "https://api.resend.com";
const NOTIFY_FROM = process.env.NOTIFY_FROM_EMAIL || "Portfolio <onboarding@resend.dev>";
const NOTIFY_TO = process.env.NOTIFY_TO_EMAIL || "zakiakdas703@gmail.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zaki-portfolio-omega.vercel.app";

export type NotificationResult = "skipped" | "sent" | "failed";

export async function notifyNewMessage(m: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<NotificationResult> {
  if (!RESEND_API_KEY) return "skipped"; // not configured: silent no-op

  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#64748b;font-size:13px">${label}</td><td style="font-size:14px">${esc(value)}</td></tr>`;

  try {
    const res = await fetch(`${RESEND_BASE_URL}/emails`, {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: [NOTIFY_TO],
        subject: `New message from ${m.name}${m.subject ? ` — ${m.subject}` : ""}`,
        html: `<div style="font-family:system-ui,sans-serif;max-width:560px">
  <h2 style="font-size:16px;margin:0 0 12px">New contact message</h2>
  <table style="border-collapse:collapse">
    ${row("Name", m.name)}
    ${row("Email", m.email)}
    ${row("Subject", m.subject || "—")}
  </table>
  <p style="white-space:pre-wrap;font-size:14px;line-height:1.5;margin:16px 0">${esc(m.message)}</p>
  <p style="font-size:13px;color:#64748b">Reply directly, or manage in the
    <a href="${SITE_URL}/admin/messages">admin inbox</a>.</p>
</div>`,
        // Nudges deliverability: direct replies reach the visitor's real address.
        reply_to: m.email,
      }),
    });
    return res.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}
