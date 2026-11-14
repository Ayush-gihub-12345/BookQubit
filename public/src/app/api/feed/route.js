import { NextResponse } from "next/server";
import { getFeed } from "@/lib/feed-server";
import { logError } from "@/lib/cf/logger";

// GET /api/feed?lang=en&filter=for-you&page=1 → { cards, nextPage }
// Anonymous and shared: one cached build per (lang, filter, page) serves every visitor, so
// feed traffic costs almost no database reads. Per-reader filtering (blocks) happens client-side.
export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  try {
    const data = await getFeed(sp.get("lang") || "en", sp.get("filter") || "for-you", sp.get("page"));
    return NextResponse.json(data, { headers: { "Cache-Control": "public, max-age=120, stale-while-revalidate=600" } });
  } catch (e) {
    logError("feed", e);
    return NextResponse.json({ cards: [], nextPage: null, error: true }, { status: 200 });
  }
}
