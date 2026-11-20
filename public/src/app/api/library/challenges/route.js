import { NextResponse } from "next/server";
import { requireUser, unauthorized } from "@/lib/auth-request";
import { getCf } from "@/lib/cf/env";
import { logError } from "@/lib/cf/logger";
import { challengeStatus, joinChallenge, leaveChallenge } from "@/lib/challenges";
import { getBooksBySlug } from "@/lib/repo";

// Private to the signed-in reader.
//   GET    ?year=2026                   joined challenges with progress, and the ones still available
//   POST   { kind, target, year? }      join a challenge (or change its target)
//   DELETE { kind, year? }              leave one
const yearOf = (v) => { const y = Number(v); return y >= 2000 && y <= 2100 ? y : new Date().getUTCFullYear(); };

async function ctx(request) {
  const user = await requireUser(request);
  if (!user) return { res: unauthorized() };
  const { env } = await getCf();
  if (!env.ENGAGEMENT_DB) return { res: NextResponse.json({ error: "feature_unavailable" }, { status: 503 }) };
  return { user, env };
}
const fail = (e, tag) => {
  if (e.status) return NextResponse.json({ error: e.message }, { status: e.status });
  logError(tag, e);
  return NextResponse.json({ error: "failed" }, { status: 500 });
};

export async function GET(request) {
  const c = await ctx(request);
  if (c.res) return c.res;
  try {
    const year = yearOf(new URL(request.url).searchParams.get("year"));
    const out = await challengeStatus(
      { accounts: c.env.DB, engagement: c.env.ENGAGEMENT_DB, loadBooks: (slugs) => getBooksBySlug(slugs, "en", "slug, category, country, page_count") },
      c.user.uid, year);
    return NextResponse.json(out, { headers: { "Cache-Control": "private, max-age=60" } });
  } catch (e) { return fail(e, "challenges.get"); }
}

export async function POST(request) {
  const c = await ctx(request);
  if (c.res) return c.res;
  const b = await request.json().catch(() => ({}));
  try { return NextResponse.json(await joinChallenge(c.env.ENGAGEMENT_DB, c.user.uid, yearOf(b.year), b.kind, b.target)); } catch (e) { return fail(e, "challenges.join"); }
}

export async function DELETE(request) {
  const c = await ctx(request);
  if (c.res) return c.res;
  const b = await request.json().catch(() => ({}));
  try { return NextResponse.json(await leaveChallenge(c.env.ENGAGEMENT_DB, c.user.uid, yearOf(b.year), String(b.kind || ""))); } catch (e) { return fail(e, "challenges.leave"); }
}
