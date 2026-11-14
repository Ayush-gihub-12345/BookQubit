import { NextResponse } from "next/server";
import { getCf } from "@/lib/cf/env";
import { rateLimit } from "@/lib/cf/cache";
import { logEvent } from "@/lib/cf/logger";
import { cached } from "@/lib/db";
import { getBooksBySlug, listBooks } from "@/lib/repo";
import { hybridBookSlugs, keywordQuotes, keywordAuthors } from "@/lib/search";

const COLS = "slug, title, author, cover_url, rating, category, lang";

// GET /api/search?q=...&lang=en
// → { books: [...], quotes: [...], q, mode: "hybrid"|"keyword"|"fallback" }
// Keyword (FTS5) + semantic (Vectorize) fused with RRF. Cached through the shared
// cache tiers (memory → edge → KV → D1) so repeat queries cost nothing. Fails soft:
// if FTS or AI is missing it degrades to the older LIKE search, never an error page.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().slice(0, 120);
  const lang = searchParams.get("lang") || "en";
  if (q.length < 2) return NextResponse.json({ books: [], quotes: [], q, mode: "keyword" });

  const { env } = await getCf();
  const ip = request.headers.get("cf-connecting-ip") || "anon";
  const rl = await rateLimit(env, `search:${ip}`, { limit: 90, windowSeconds: 60 });
  if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": "30" } });

  const key = `search:${lang}:${q.toLowerCase()}`;
  const payload = await cached(
    key,
    async () => {
      const { slugs, keywordOk, semantic } = await hybridBookSlugs(env, q, lang, 12);
      let books = [];
      let mode = semantic ? "hybrid" : "keyword";
      if (slugs.length) {
        const rows = await getBooksBySlug(slugs, lang, COLS);
        books = slugs.map((s) => rows.get(s)).filter(Boolean);
      } else if (!keywordOk && q.length >= 4) {
        // FTS table not available — the existing LIKE search keeps search working.
        books = (await listBooks(lang, { q, limit: 12 })).map((b) => ({
          slug: b.slug, title: b.title, author: b.author, cover_url: b.cover_url, rating: b.rating, category: b.category, lang: b.lang,
        }));
        mode = "fallback";
      }
      const [quotes, authors] = await Promise.all([keywordQuotes(env, q, 4), keywordAuthors(env, q, lang, 4)]);
      return { books, quotes, authors, mode };
    },
    600
  );

  if (!payload.books.length && !payload.quotes.length && !(payload.authors || []).length) logEvent("search_zero", { q: q.slice(0, 100), lang });
  return NextResponse.json({ q, ...payload }, { headers: { "Cache-Control": "public, max-age=60" } });
}
