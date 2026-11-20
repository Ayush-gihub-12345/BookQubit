import { NextResponse } from "next/server";
import { listBooks, facets, getBooksBySlug } from "@/lib/repo";
import { getCatalogDb, cached } from "@/lib/db";
import { keywordAuthors } from "@/lib/search";
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
  // Authors through the full-text index, publishers by name prefix (indexed); neither reads a whole table.
  const searchAuthors = async () => {
    try { const { env } = await getCf(); return await keywordAuthors(env, q, lang, 3); } catch { return []; }
  };
  const searchPublishers = () => cached(`suggest-pubs:${lang}:${s}`, async () => {
    const db = await getCatalogDb();
    const esc = s.replace(/[\\%_]/g, (c) => "\\" + c);
    const { results } = await db.prepare("SELECT slug, name, logo_url FROM publications WHERE lang = ?1 AND name LIKE ?2 ESCAPE '\\' LIMIT 3").bind(lang, esc + "%").all();
    return results;
  }, 3600).catch(() => []);
  const [books, authors, pubs, f] = await Promise.all([searchBooks(), searchAuthors(), searchPublishers(), facets(lang)]);

  return NextResponse.json({
    books: books.map((b) => ({ slug: b.slug, title: b.title, author: b.author, cover_url: b.cover_url, rating: b.rating })),
    authors: authors.slice(0, 3).map((a) => ({ slug: a.slug, name: a.name, image_url: a.image_url })),
    publishers: pubs.map((p) => ({ slug: p.slug, name: p.name, logo_url: p.logo_url })),
    categories: f.categories.filter((c) => c.name.toLowerCase().includes(s)).slice(0, 4),
    tags: f.tags.filter((t) => t.name.toLowerCase().includes(s)).slice(0, 5),
  });
}
