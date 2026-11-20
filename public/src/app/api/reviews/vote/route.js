import { NextResponse } from "next/server";
import { requireUser, unauthorized } from "@/lib/auth-request";
import { getCf } from "@/lib/cf/env";
import { logError } from "@/lib/cf/logger";
import { toggleHelpful } from "@/lib/review-social";

// POST { slug, authorId }: toggle "helpful" on a review. The review must exist (a shelf row with text).
export async function POST(request) {
  const user = await requireUser(request);
  if (!user) return unauthorized();
  const { slug, authorId } = await request.json().catch(() => ({}));
  if (!slug || !authorId) return NextResponse.json({ error: "bad request" }, { status: 400 });
  try {
    const { env } = await getCf();
    if (!env.ENGAGEMENT_DB || !env.DB) return NextResponse.json({ error: "feature_unavailable" }, { status: 503 });
    const exists = await env.DB.prepare("SELECT 1 AS x FROM shelf WHERE book_slug = ?1 AND user_id = ?2 AND review IS NOT NULL AND review != ''").bind(slug, authorId).first();
    if (!exists) return NextResponse.json({ error: "review not found" }, { status: 404 });
    return NextResponse.json(await toggleHelpful(env.ENGAGEMENT_DB, user, slug, authorId));
  } catch (e) {
    if (e.status) return NextResponse.json({ error: e.message }, { status: e.status });
    logError("reviews.vote", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
