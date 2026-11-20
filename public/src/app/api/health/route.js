import { NextResponse } from "next/server";
import { getCf } from "@/lib/cf/env";

// GET /api/health: for an uptime monitor (and a human after a deploy). One tiny query per binding, each timed, with a hard
// per-check limit so a stuck database can never hang the monitor. It reports booleans and milliseconds only: no counts, no
// names of rows, nothing a stranger could use. 200 when the accounts and catalog databases answer, 503 when either does not.
//   critical:  DB (accounts), CATALOG_DB
//   optional:  ENGAGEMENT_DB, MINDSPACE_DB, CACHE_KV (the site degrades gracefully without them, so they never fail the check)
const LIMIT_MS = 3000;

async function timed(fn) {
  const t0 = Date.now();
  try {
    await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), LIMIT_MS))]);
    return { ok: true, ms: Date.now() - t0 };
  } catch (e) {
    return { ok: false, ms: Date.now() - t0, error: e.message === "timeout" ? "timeout" : "error" };
  }
}

export async function GET() {
  let env;
  try { ({ env } = await getCf()); } catch { return NextResponse.json({ ok: false, error: "no runtime context" }, { status: 503, headers: { "Cache-Control": "no-store" } }); }

  const d1 = (db) => (db ? timed(() => db.prepare("SELECT 1").first()) : Promise.resolve({ ok: false, ms: 0, error: "not bound" }));
  const [accounts, catalog, engagement, mindspace, kv, models] = await Promise.all([
    d1(env.DB), d1(env.CATALOG_DB), d1(env.ENGAGEMENT_DB), d1(env.MINDSPACE_DB),
    env.CACHE_KV ? timed(() => env.CACHE_KV.get("health-probe")) : Promise.resolve({ ok: false, ms: 0, error: "not bound" }),
    env.CATALOG_DB ? timed(() => env.CATALOG_DB.prepare("SELECT max_id FROM read_model_meta WHERE name = 'catalog' LIMIT 1").first().then((r) => { if (!r) throw new Error("empty"); })) : Promise.resolve({ ok: false, ms: 0, error: "not bound" }),
  ]);

  const ok = accounts.ok && catalog.ok;
  return NextResponse.json(
    { ok, checks: { accounts, catalog, engagement, mindspace, cacheKv: kv, readModels: models }, at: new Date().toISOString() },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
