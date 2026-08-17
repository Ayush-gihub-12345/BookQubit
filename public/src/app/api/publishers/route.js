import { NextResponse } from "next/server";
import { queryPublishers, getPublisherTypes } from "@/lib/repo";

// Same reasoning as /api/authors — powers /publications' search/filter/sort/
// Load-More so the browser never receives the whole ~2,300-row list at once.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "en";
  const opts = {
    q: searchParams.get("q") || undefined,
    type: searchParams.get("type") || undefined,
    sort: searchParams.get("sort") || undefined,
    page: parseInt(searchParams.get("page")) || 1,
    perPage: parseInt(searchParams.get("perPage")) || 60,
  };
  const [result, types] = await Promise.all([
    queryPublishers(lang, opts),
    getPublisherTypes(lang),
  ]);
  return NextResponse.json({ ...result, types });
}
