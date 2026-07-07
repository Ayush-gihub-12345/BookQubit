import { NextResponse } from "next/server";
import { getCatalogFacets } from "@/lib/server/booksRepository";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "en";

  const facets = await getCatalogFacets(lang);
  return NextResponse.json(facets);
}
