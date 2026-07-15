import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminAuthenticated } from "@/lib/admin-auth";

// POST /api/admin/import-run — admin-only proxy that triggers one bulk-import
// pass right now. Calls the cron worker via a Cloudflare Service Binding
// (IMPORT_CRON, see wrangler.jsonc) rather than a plain fetch() to its public
// *.workers.dev URL — Cloudflare blocks Worker-to-Worker fetches across the
// shared workers.dev zone (error 1042), so a service binding is the only way
// for one Worker to call another directly. It's also inherently private (not
// internet-reachable), though the worker's own IMPORT_TRIGGER_SECRET check
// stays in place as defense in depth.
//
// { maxChunks } lets the dashboard process one chunk per call (looping
// client-side) so it can show live per-chunk progress instead of one
// silent multi-thousand-book batch.
export async function POST(request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { env } = await getCloudflareContext({ async: true });
  if (!env.IMPORT_CRON) return NextResponse.json({ error: "IMPORT_CRON service binding not configured" }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const url = new URL("https://bookqubit-import-cron/run");
  if (body.maxChunks) url.searchParams.set("maxChunks", String(body.maxChunks));
  if (body.burst) url.searchParams.set("burst", String(body.burst));

  const res = await env.IMPORT_CRON.fetch(url, {
    method: "POST",
    headers: { "X-Import-Secret": env.IMPORT_TRIGGER_SECRET || "" },
  });
  if (!res.ok) {
    // Surface the worker's own response body (e.g. "unauthorized" on a secret
    // mismatch) so a bad deploy is diagnosable from the browser console
    // instead of requiring a direct curl test against the cron worker.
    const detail = await res.text().catch(() => "");
    return NextResponse.json({ error: `worker returned ${res.status}`, detail }, { status: 502 });
  }

  return NextResponse.json(await res.json());
}
