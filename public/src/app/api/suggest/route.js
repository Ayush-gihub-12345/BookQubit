import { NextResponse } from "next/server";
import { listBooks, listAuthors, facets } from "@/lib/repo";

// GET /api/suggest?q=...&lang=en — live search suggestions
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const lang = searchParams.get("lang") || "en";
  if (q.length < 2) return NextResponse.json({ books: [], authors: [], tags: [] });

  const s = q.toLowerCase();
  const [books, authors, f] = await Promise.all([
    listBooks(lang, { q, limit: 5 }),
    listAuthors(lang),
    facets(lang),
  ]);

  return NextResponse.json({
    books: books.map((b) => ({ slug: b.slug, title: b.title, author: b.author, cover_url: b.cover_url, rating: b.rating })),
    authors: authors.filter((a) => a.name.toLowerCase().includes(s)).slice(0, 3)
      .map((a) => ({ slug: a.slug, name: a.name, image_url: a.image_url })),
    tags: f.tags.filter((t) => t.name.toLowerCase().includes(s)).slice(0, 5),
  });
}
