import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminAuthenticated } from "@/lib/admin-auth";

// POST /api/admin/import-stop — sets a stop flag the cron worker's burst
// chain checks before each hop, since the actual import now runs
// server-side (self-chained via ctx.waitUntil), not driven by the admin's
// browser — there's no in-flight client request to simply cancel.
export async function POST() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { env } = await getCloudflareContext({ async: true });
  if (!env.IMPORT_CRON) return NextResponse.json({ error: "IMPORT_CRON service binding not configured" }, { status: 500 });

  const res = await env.IMPORT_CRON.fetch("https://bookqubit-import-cron/stop", {
    method: "POST",
    headers: { "X-Import-Secret": env.IMPORT_TRIGGER_SECRET || "" },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json({ error: `worker returned ${res.status}`, detail }, { status: 502 });
  }
  return NextResponse.json(await res.json());
}
