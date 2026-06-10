import { NextResponse } from "next/server";
import { getBooksFromD1 } from "@/lib/server/booksRepository";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  try {
    const result = await getBooksFromD1({
      lang: searchParams.get("lang") || "en",
      search: searchParams.get("search") || searchParams.get("q") || "",
      category: searchParams.get("category") || "",
      author: searchParams.get("author") || "",
      collection: searchParams.get("collection") || "",
      sort: searchParams.get("sort") || "title-asc",
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "100",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Books API failed:", error);
    return NextResponse.json(
      { error: "Unable to load books" },
      { status: 500 },
    );
  }
}
