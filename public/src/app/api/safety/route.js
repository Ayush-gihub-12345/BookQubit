import { NextResponse } from "next/server";
import { requireUser, unauthorized } from "@/lib/auth-request";
import { getCf } from "@/lib/cf/env";
import { rateLimit } from "@/lib/cf/cache";
import { logError } from "@/lib/cf/logger";
import { enqueue, JOBS } from "@/lib/cf/queue";
import { listSafety, listPeople, setRelation, report, getPrivacy, setPrivacy, SafetyError } from "@/lib/safety";

async function ctx(request) {
  const user = await requireUser(request);
  if (!user) return { res: unauthorized() };
  const { env } = await getCf();
  if (!env.DB) return { res: NextResponse.json({ error: "feature_unavailable" }, { status: 503 }) };
  return { user, env, db: env.DB };
}
const fail = (e, where) => {
  if (e instanceof SafetyError) return NextResponse.json({ error: e.code }, { status: e.status });
  logError(where, e);
  return NextResponse.json({ error: "failed" }, { status: 500 });
};

// GET /api/safety → { blocked: [ids], muted: [ids], people: [{id,kind,name,slug}], privacy: { hideActivity, discoverable, bio } }
export async function GET(request) {
  const c = await ctx(request);
  if (c.res) return c.res;
  try {
    return NextResponse.json({ ...(await listSafety(c.db, c.user.uid)), people: await listPeople(c.db, c.user.uid), privacy: await getPrivacy(c.db, c.user.uid) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) { return fail(e, "safety.get"); }
}

// POST { action: "block"|"mute"|"unblock"|"unmute", targetUserId } | { action: "report", targetType, targetId, reason? }
export async function POST(request) {
  const c = await ctx(request);
  if (c.res) return c.res;
  const b = await request.json().catch(() => ({}));
  try {
    if (b.action === "report") {
      const rl = await rateLimit(c.env, `report:${c.user.uid}`, { limit: 20, windowSeconds: 3600 });
      if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
      return NextResponse.json({ ok: true, ...(await report(c.db, c.user.uid, b)) });
    }
    const kind = { block: "block", mute: "mute", unblock: null, unmute: null }[b.action];
    if (kind === undefined) return NextResponse.json({ error: "unknown action" }, { status: 400 });
    await setRelation(c.db, c.user.uid, String(b.targetUserId || ""), kind);
    return NextResponse.json({ ok: true });
  } catch (e) { return fail(e, "safety.post"); }
}

// PATCH { hideActivity?, discoverable?, bio? } — also re-syncs the reader's taste vector (removed when opted out).
export async function PATCH(request) {
  const c = await ctx(request);
  if (c.res) return c.res;
  const b = await request.json().catch(() => ({}));
  try {
    await setPrivacy(c.db, c.user.uid, b);
    await enqueue(c.env, JOBS.RECOMPUTE_TASTE, { uid: c.user.uid });
    return NextResponse.json({ ok: true, privacy: await getPrivacy(c.db, c.user.uid) });
  } catch (e) { return fail(e, "safety.patch"); }
}
