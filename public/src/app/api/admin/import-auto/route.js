import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminAuthenticated } from "@/lib/admin-auth";

// POST /api/admin/import-auto — toggles the cron worker's "auto-pilot" flag
// (import_progress.auto_run_enabled). While on, the worker's */5 * * * *
// cron does one small ~10-book pass every 5 minutes on its own; while off,
// that same tick is a fast no-op. This just flips the flag — Cloudflare's
// cron keeps firing regardless, the flag decides whether it does anything.
export async function POST(request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { env } = await getCloudflareContext({ async: true });
  if (!env.IMPORT_CRON) return NextResponse.json({ error: "IMPORT_CRON service binding not configured" }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const res = await env.IMPORT_CRON.fetch("https://bookqubit-import-cron/auto", {
    method: "POST",
    headers: { "X-Import-Secret": env.IMPORT_TRIGGER_SECRET || "", "Content-Type": "application/json" },
    body: JSON.stringify({ enabled: !!body.enabled }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json({ error: `worker returned ${res.status}`, detail }, { status: 502 });
  }
  return NextResponse.json(await res.json());
}
