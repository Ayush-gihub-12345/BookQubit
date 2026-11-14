import { NextResponse } from "next/server";
import { listBooks, listAuthors, listPublications, facets, getBooksBySlug } from "@/lib/repo";
import { getCf } from "@/lib/cf/env";
import { hybridBookSlugs } from "@/lib/search";

// GET /api/suggest?q=...&lang=en — live search suggestions for the Ctrl+K
// search bar: books, authors, publishers, categories, and tags in one call.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const lang = searchParams.get("lang") || "en";
  // Enforced here too, not just in SearchBar — this endpoint is public, and
  // the query behind it is an unindexable 5-column LIKE '%term%' that scans
  // the books table. A short term is both the least useful and the most
  // expensive, so it must be refused server-side regardless of caller.
  const MIN_QUERY_CHARS = 4;
  if (q.length < MIN_QUERY_CHARS) {
    return NextResponse.json({ books: [], authors: [], publishers: [], categories: [], tags: [] });
  }

  const s = q.toLowerCase();
  // Prefer the indexed hybrid search (FTS5 + semantic). Only when the FTS table doesn't
  // exist yet do we fall back to the old unindexable LIKE scan.
  const searchBooks = async () => {
    try {
      const { env } = await getCf();
      const h = await hybridBookSlugs(env, q, lang, 5);
      if (h.keywordOk) {
        const rows = await getBooksBySlug(h.slugs, lang, "slug, title, author, cover_url, rating");
        return h.slugs.map((slug) => rows.get(slug)).filter(Boolean);
      }
    } catch { /* fall through to LIKE search */ }
    return listBooks(lang, { q, limit: 5 });
  };
  const [books, authors, pubs, f] = await Promise.all([
    searchBooks(),
    listAuthors(lang),
    listPublications(lang),
    facets(lang),
  ]);

  return NextResponse.json({
    books: books.map((b) => ({ slug: b.slug, title: b.title, author: b.author, cover_url: b.cover_url, rating: b.rating })),
    authors: authors.filter((a) => a.name.toLowerCase().includes(s)).slice(0, 3)
      .map((a) => ({ slug: a.slug, name: a.name, image_url: a.image_url })),
    publishers: pubs.filter((p) => p.name.toLowerCase().includes(s)).slice(0, 3)
      .map((p) => ({ slug: p.slug, name: p.name, logo_url: p.logo_url })),
    categories: f.categories.filter((c) => c.name.toLowerCase().includes(s)).slice(0, 4),
    tags: f.tags.filter((t) => t.name.toLowerCase().includes(s)).slice(0, 5),
  });
}
