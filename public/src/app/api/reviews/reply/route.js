import { NextResponse } from "next/server";
import { requireUser, unauthorized } from "@/lib/auth-request";
import { getCf } from "@/lib/cf/env";
import { logError } from "@/lib/cf/logger";
import { addReply, deleteReply } from "@/lib/review-social";

// POST { slug, authorId, body }: reply to a review.   DELETE { id }: remove a reply (its writer or the review's author).
async function ctx(request) {
  const user = await requireUser(request);
  if (!user) return { res: unauthorized() };
  const { env } = await getCf();
  if (!env.ENGAGEMENT_DB || !env.DB) return { res: NextResponse.json({ error: "feature_unavailable" }, { status: 503 }) };
  return { user, env };
}
const fail = (e, tag) => {
  if (e.status) return NextResponse.json({ error: e.message }, { status: e.status });
  logError(tag, e);
  return NextResponse.json({ error: "failed" }, { status: 500 });
};

export async function POST(request) {
  const c = await ctx(request);
  if (c.res) return c.res;
  const { slug, authorId, body } = await request.json().catch(() => ({}));
  if (!slug || !authorId) return NextResponse.json({ error: "bad request" }, { status: 400 });
  try {
    const exists = await c.env.DB.prepare("SELECT 1 AS x FROM shelf WHERE book_slug = ?1 AND user_id = ?2 AND review IS NOT NULL AND review != ''").bind(slug, authorId).first();
    if (!exists) return NextResponse.json({ error: "review not found" }, { status: 404 });
    return NextResponse.json(await addReply(c.env.ENGAGEMENT_DB, c.user, slug, authorId, body));
  } catch (e) { return fail(e, "reviews.reply"); }
}

export async function DELETE(request) {
  const c = await ctx(request);
  if (c.res) return c.res;
  const { id } = await request.json().catch(() => ({}));
  if (!Number(id)) return NextResponse.json({ error: "bad request" }, { status: 400 });
  try { return NextResponse.json(await deleteReply(c.env.ENGAGEMENT_DB, c.user, Number(id))); } catch (e) { return fail(e, "reviews.reply.delete"); }
}
