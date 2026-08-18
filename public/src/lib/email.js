import { getCloudflareContext } from "@opennextjs/cloudflare";

// Thin wrapper around Resend's HTTP API (a single fetch call — no SMTP, no
// extra package). Needs two things set on the Worker before it can actually
// send anything:
//   wrangler secret put RESEND_API_KEY      (from resend.com, free tier)
//   wrangler secret put RESEND_FROM_EMAIL   (e.g. "verify@bookqubit.shop" —
//     the domain must be verified in Resend's dashboard via DNS records
//     added wherever bookqubit.shop's DNS lives; no mailbox purchase
//     needed, this is send-only)
// Until both are set, sendEmail() returns { ok: false } instead of
// throwing, so the calling flow can degrade (e.g. show the code was
// generated but couldn't be delivered) rather than crash.
export async function sendEmail({ to, subject, html }) {
  const { env } = await getCloudflareContext({ async: true });
  const apiKey = env.RESEND_API_KEY;
  const from = env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    return { ok: false, error: "Email sending not configured (RESEND_API_KEY / RESEND_FROM_EMAIL missing)" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) return { ok: false, error: `Resend API returned ${res.status}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export function verificationEmailHtml(code) {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:420px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 8px">Verify your BookQubit account</h2>
      <p style="color:#555;margin:0 0 20px">Enter this code to finish creating your account:</p>
      <div style="font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;
                  background:#f4f4f8;border-radius:12px;padding:16px;margin-bottom:20px">
        ${code}
      </div>
      <p style="color:#888;font-size:13px;margin:0">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    </div>`;
}
