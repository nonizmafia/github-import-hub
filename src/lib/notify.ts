/**
 * Sends an internal notification email to the VOX team via Resend.
 * Server-side only. No-op (logged) when RESEND_API_KEY is not configured.
 * Note: without a verified domain in Resend, delivery works only to the
 * Resend account owner's own email address.
 */
const NOTIFY_TO = "voxhealthcaree@gmail.com";

export async function notifyTeam(subject: string, lines: Record<string, string | number | null | undefined>) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.warn("[notify] RESEND_API_KEY not configured; skipping:", subject);
    return { sent: false as const, reason: "not_configured" as const };
  }

  const rows = Object.entries(lines)
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top">${k}</td><td style="padding:6px 0">${String(v).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td></tr>`,
    )
    .join("");

  const html = `<div style="font-family:Arial,sans-serif;max-width:560px"><h2 style="margin:0 0 16px">${subject.replace(/</g, "&lt;")}</h2><table style="border-collapse:collapse">${rows}</table><p style="margin-top:24px;color:#999;font-size:12px">Sent automatically from the VOX Care website.</p></div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "VOX Care <onboarding@resend.dev>",
        to: [NOTIFY_TO],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[notify] resend error [${res.status}]: ${body}`);
      return { sent: false as const, reason: "provider_error" as const };
    }
    return { sent: true as const };
  } catch (err) {
    console.error("[notify] network error:", err);
    return { sent: false as const, reason: "network_error" as const };
  }
}
