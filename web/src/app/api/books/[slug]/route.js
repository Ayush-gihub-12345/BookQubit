import { NextResponse } from "next/server";
import { getBookBySlug } from "@/lib/server/booksRepository";

export async function GET(request, { params }) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "en";

  const book = await getBookBySlug(slug, lang);
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  return NextResponse.json({ book });
}
