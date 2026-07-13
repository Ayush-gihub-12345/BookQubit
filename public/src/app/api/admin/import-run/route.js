import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const CRON_WORKER_URL = "https://bookqubit-import-cron.webpagewale.workers.dev/run";

// POST /api/admin/import-run — admin-only proxy that triggers one bulk-import
// pass right now. The cron worker's /run route is itself locked behind
// IMPORT_TRIGGER_SECRET, which only ever lives server-side here — the
// browser never sees it, so the raw worker URL isn't usable by anyone else.
//
// { maxChunks } lets the dashboard process one chunk per call (looping
// client-side) so it can show live per-chunk progress instead of one
// silent multi-thousand-book batch.
export async function POST(request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const secret = process.env.IMPORT_TRIGGER_SECRET;
  if (!secret) return NextResponse.json({ error: "IMPORT_TRIGGER_SECRET not configured" }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const url = new URL(CRON_WORKER_URL);
  if (body.maxChunks) url.searchParams.set("maxChunks", String(body.maxChunks));

  const res = await fetch(url, { method: "POST", headers: { "X-Import-Secret": secret } });
  if (!res.ok) {
    // Surface the worker's own response body (e.g. "unauthorized" on a secret
    // mismatch) so a bad deploy is diagnosable from the browser console
    // instead of requiring a direct curl test against the cron worker.
    const detail = await res.text().catch(() => "");
    return NextResponse.json({ error: `worker returned ${res.status}`, detail }, { status: 502 });
  }

  return NextResponse.json(await res.json());
}
