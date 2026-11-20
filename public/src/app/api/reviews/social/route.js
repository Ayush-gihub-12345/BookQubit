import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/api-auth";
import { getCf } from "@/lib/cf/env";
import { logError } from "@/lib/cf/logger";
import { reviewSocial } from "@/lib/review-social";

// GET /api/reviews/social?slug=... : helpful counts and replies for a book's reviews. Public; when the request carries a
// valid sign-in it also says which reviews the viewer has marked helpful (and then must not be shared-cached).
export async function GET(request) {
  const slug = new URL(request.url).searchParams.get("slug") || "";
  if (!/^[\w.%~-]{1,200}$/.test(slug)) return NextResponse.json({ error: "bad slug" }, { status: 400 });
  const authed = /^Bearer /i.test(request.headers.get("authorization") || "");
  try {
    const { env } = await getCf();
    if (!env.ENGAGEMENT_DB) return NextResponse.json({ helpful: {}, replies: {}, voted: [] });
    const user = authed ? await getRequestUser(request).catch(() => null) : null;
    const out = await reviewSocial(env.ENGAGEMENT_DB, slug, user?.uid);
    return NextResponse.json(out, { headers: { "Cache-Control": user ? "private, no-store" : "public, s-maxage=30, stale-while-revalidate=120" } });
  } catch (e) {
    logError("reviews.social", e);
    return NextResponse.json({ helpful: {}, replies: {}, voted: [] });
  }
}
