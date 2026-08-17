import { NextResponse } from "next/server";
import { queryAuthors, getAuthorCountries } from "@/lib/repo";

// Powers /authors' search/filter/sort/Load-More. Split out from the initial
// server render precisely so the browser never receives the whole ~3,900-row
// list at once — see the comment on queryAuthors() in repo.js for why that
// broke the page outright.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "en";
  const opts = {
    q: searchParams.get("q") || undefined,
    country: searchParams.get("country") || undefined,
    sort: searchParams.get("sort") || undefined,
    page: parseInt(searchParams.get("page")) || 1,
    perPage: parseInt(searchParams.get("perPage")) || 60,
  };
  const [result, countries] = await Promise.all([
    queryAuthors(lang, opts),
    getAuthorCountries(lang),
  ]);
  return NextResponse.json({ ...result, countries });
}
