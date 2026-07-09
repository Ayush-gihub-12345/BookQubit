import { NextResponse } from "next/server";
import { queryBooks } from "@/lib/repo";

// Powers instant client-side filtering on /books and collection pages —
// same query shape as the server-rendered page, called on every filter change.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "en";
  const opts = {
    q: searchParams.get("q") || undefined,
    category: searchParams.get("category") || undefined,
    collection: searchParams.get("collection") || undefined,
    tag: searchParams.get("tag") || undefined,
    format: searchParams.get("format") || undefined,
    country: searchParams.get("country") || undefined,
    minRating: searchParams.get("rating") || undefined,
    sort: searchParams.get("sort") || undefined,
    page: parseInt(searchParams.get("page")) || 1,
    perPage: parseInt(searchParams.get("perPage")) || 32,
  };
  const result = await queryBooks(lang, opts);
  return NextResponse.json(result);
}
