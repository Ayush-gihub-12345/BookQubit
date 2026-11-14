import { cached } from "@/lib/db";
import { getCf } from "@/lib/cf/env";
import { logError } from "@/lib/cf/logger";
import { getBooksBySlug } from "@/lib/repo";
import { buildFeedPage, FILTERS } from "@/lib/feed";

const BOOK_COLS = "b.slug, b.lang, b.title, b.author, b.cover_url, b.rating, b.category, b.key_points, b.summary, b.description";

async function all(db, sql, ...binds) {
  if (!db) return [];
  try {
    return (await db.prepare(sql).bind(...binds).all()).results;
  } catch (e) {
    logError("feed.sql", e); // e.g. optional table not migrated: that card type just disappears
    return [];
  }
}

/** SQL loaders. Every query is LIMIT-bounded and index-friendly; none scans the catalog. */
export function feedLoaders(env, lang) {
  const catalog = env.CATALOG_DB, main = env.DB;
  return {
    async books(limit, offset, filter) {
      let rows = [];
      if (filter === "audio") {
        rows = await all(catalog,
          `SELECT ${BOOK_COLS} FROM book_summaries s JOIN books b ON b.slug = s.book_slug AND b.lang = s.lang
           WHERE s.lang = ?1 AND s.intent = 'general' ORDER BY s.created_at DESC LIMIT ?2 OFFSET ?3`, lang, limit, offset);
        if (!rows.length && offset === 0) {
          // No generated summaries yet: books with key points are still listenable (device voice).
          rows = await all(catalog, `SELECT ${BOOK_COLS} FROM books b WHERE b.lang = ?1 AND b.key_points IS NOT NULL ORDER BY b.rating DESC, b.id DESC LIMIT ?2 OFFSET ?3`, lang, limit, offset);
        }
      } else {
        rows = await all(catalog, `SELECT ${BOOK_COLS} FROM books b WHERE b.lang = ?1 ORDER BY b.rating DESC, b.id DESC LIMIT ?2 OFFSET ?3`, lang, limit, offset);
      }
      return rows;
    },
    async quotes(limit, offset) {
      const rows = await all(main, "SELECT id, user_id, text, book_slug FROM quotes ORDER BY id DESC LIMIT ?1 OFFSET ?2", limit, offset);
      if (!rows.length) return [];
      const info = await getBooksBySlug([...new Set(rows.map((r) => r.book_slug))], "en", "slug, title, author").catch(() => new Map());
      return rows.map((r) => ({ id: r.id, userId: r.user_id, text: String(r.text).slice(0, 400), book: info.get(r.book_slug) || { slug: r.book_slug, title: r.book_slug, author: "" } }));
    },
    authors: (limit, offset) => all(catalog, "SELECT slug, name, image_url, famous_work, country FROM authors WHERE lang = ?1 ORDER BY id DESC LIMIT ?2 OFFSET ?3", lang, limit, offset),
    comics: (limit, offset) => all(catalog, "SELECT slug, title, cover_url, publisher, rating FROM comics WHERE lang = ?1 ORDER BY id DESC LIMIT ?2 OFFSET ?3", lang, limit, offset),
  };
}

/** One feed page, cached for 10 minutes through the shared tiers (anonymous, so safe to share). */
export async function getFeed(lang, filter, page) {
  const f = FILTERS.some(([id]) => id === filter) ? filter : "for-you";
  const p = Math.max(1, Math.min(20, Number(page) || 1));
  return cached(`feed:${lang}:${f}:${p}`, async () => {
    const { env } = await getCf();
    const build = (l) => buildFeedPage({ filter: f, page: p, loaders: feedLoaders(env, l), lang: l });
    const page1 = await build(lang);
    // A language with no content yet falls back to English once (same convention as the rest of the site).
    return !page1.cards.length && p === 1 && lang !== "en" ? build("en") : page1;
  }, 600);
}
