import { cached, getCatalogDb } from "@/lib/db";
import { TTL } from "@/lib/cache-policy";

// Small, bounded queries for the home page. Both are cached for an hour in the "catalog" group (so an admin edit clears
// them) and neither scans the books table: publishers come from the publications table (LIMIT), covers use the
// idx_books_collection index with LIMIT 3 per collection.

/** Newest publisher pages, with a language fallback to English. */
export async function getFeaturedPublishers(lang, limit = 8) {
  return cached(`featured-publishers:${lang}:${limit}`, async () => {
    const db = await getCatalogDb();
    const run = async (l) =>
      (await db.prepare("SELECT slug, name, logo_url FROM publications WHERE lang=?1 ORDER BY id DESC LIMIT ?2").bind(l, limit).all()).results;
    let rows = await run(lang);
    if (!rows.length && lang !== "en") rows = await run("en");
    return rows;
  }, TTL.static);
}

/** Up to three cover URLs per collection name -> { [name]: string[] }. */
export async function getCollectionCovers(lang, names) {
  const list = [...new Set(names)].slice(0, 12);
  if (!list.length) return {};
  return cached(`collection-covers:${lang}:${list.join("|").slice(0, 300)}`, async () => {
    const db = await getCatalogDb();
    const rows = await Promise.all(
      list.map((n) =>
        db.prepare("SELECT cover_url FROM books WHERE lang=?1 AND collection=?2 AND cover_url IS NOT NULL AND cover_url != '' LIMIT 3").bind(lang, n).all()
      )
    );
    return Object.fromEntries(list.map((n, i) => [n, rows[i].results.map((r) => r.cover_url)]));
  }, TTL.static);
}
