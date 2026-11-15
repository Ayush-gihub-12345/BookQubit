import { TTL } from "./cache-policy";
import { getCatalogDb, cached } from "./db";

// Who has written together. One bounded read of multi-author lines (a few hundred rows at most), cached for six hours:
// collaborations change only when the catalog does, and this is the only query behind the co-author graph.
export async function getCoauthorPairs(lang) {
  return cached(`coauthors:${lang}`, async () => {
    const db = await getCatalogDb();
    const { results } = await db
      .prepare("SELECT author FROM books WHERE lang = ?1 AND author LIKE '%,%' LIMIT 3000")
      .bind(lang).all();
    const pairs = new Map();
    for (const { author } of results) {
      const names = [...new Set(author.split(",").map((n) => n.trim()).filter(Boolean))].slice(0, 6);
      for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) {
        const [a, b] = [names[i], names[j]].sort();
        const k = `${a}\u0000${b}`;
        pairs.set(k, (pairs.get(k) || 0) + 1);
      }
    }
    return [...pairs.entries()].map(([k, n]) => { const [a, b] = k.split("\u0000"); return [a, b, n]; }).sort((x, y) => y[2] - x[2]).slice(0, 400);
  }, 6 * 3600);
}
