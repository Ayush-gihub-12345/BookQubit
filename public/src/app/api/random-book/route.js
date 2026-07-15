import { NextResponse } from "next/server";
import { getRandomBook } from "@/lib/repo";

// GET /api/random-book?lang=en — powers the navbar's "Surprise me" button,
// which needs a fresh random pick on every click (unlike the homepage's own
// "Surprise me" link, which is fine reusing whatever getRandomBook()
// returned once at that page's server render).
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "en";
  const book = await getRandomBook(lang);
  if (!book) return NextResponse.json({ error: "no books" }, { status: 404 });
  return NextResponse.json({ slug: book.slug });
}
