// Fills the LOCAL dev catalog (public/.local-d1/catalog.sqlite) with a slice
// of the live, PUBLIC catalog so local UI work is judged against real titles,
// real covers, long names and mixed scripts rather than ten hand-written
// dummy books.
//
// What it does: a handful of read-only GET requests to the site's own public
// JSON endpoints (/api/books, /api/authors, /api/publishers) — the same calls
// any browser makes while browsing. No login, no private data, no writes to
// production. It pauses between requests and identifies itself.
//
//   npm run seed:local                  # ~300 books
//   BQ_SEED_ORIGIN=https://example npm run seed:local   # another origin
import { openWithSchema } from "./local-d1.mjs";

const ORIGIN = (process.env.BQ_SEED_ORIGIN || "https://www.bookqubit.com").replace(/\/$/, "");
const UA = { "user-agent": "bookqubit-local-seed/1.0 (read-only, public endpoints)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(path) {
  const res = await fetch(ORIGIN + path, { headers: UA });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  await sleep(350); // be gentle with the live site
  return res.json();
}

const catalog = openWithSchema("catalog", ["catalog_schema.sql"]);
const columns = (table) => catalog.db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);

function upsert(table, rows, conflictKeys = ["slug", "lang"]) {
  const cols = columns(table);
  let n = 0;
  for (const row of rows) {
    const keys = Object.keys(row).filter((k) => cols.includes(k) && k !== "id");
    if (!conflictKeys.every((k) => keys.includes(k))) continue;
    const vals = keys.map((k) => {
      const v = row[k];
      return v !== null && typeof v === "object" ? JSON.stringify(v) : v ?? null;
    });
    catalog.db
      .prepare(`INSERT OR REPLACE INTO ${table} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`)
      .run(...vals);
    n++;
  }
  return n;
}

const seen = new Map();
const addBooks = (list) => list.forEach((b) => b?.slug && seen.set(`${b.slug}|${b.lang}`, b));

console.log(`Seeding local catalog from ${ORIGIN} (public, read-only)…`);
for (const page of [1, 2, 3]) addBooks((await get(`/api/books?lang=en&perPage=60&page=${page}`)).books || []);
addBooks((await get("/api/books?lang=en&perPage=60&sort=rating")).books || []);
addBooks((await get("/api/books?lang=en&perPage=60&sort=new")).books || []);

const books = [...seen.values()];
// The live `featured` flag is unset on most books; mark the best-rated few
// locally so the hero has something to feature, as the live fallback does.
books
  .filter((b) => b.cover_url)
  .sort((a, b) => (b.rating || 0) - (a.rating || 0))
  .slice(0, 5)
  .forEach((b) => (b.featured = 1));
console.log(`  books: ${upsert("books", books)}`);

// Authors: the ones that matter to the UI are the writers with the most books
// in what we just seeded (that is what the homepage's featured-authors row
// ranks by), so look those up by name instead of taking an arbitrary page.
const byAuthor = new Map();
for (const b of books) {
  const name = (b.author || "").trim();
  if (!name || /[,;]/.test(name) || name.startsWith("-")) continue;
  byAuthor.set(name, (byAuthor.get(name) || 0) + 1);
}
const topNames = [...byAuthor.entries()].sort((x, y) => y[1] - x[1]).slice(0, 30).map(([n]) => n);
const authors = [];
for (const name of topNames) {
  try {
    const found = ((await get(`/api/authors?lang=en&perPage=5&q=${encodeURIComponent(name)}`)).authors || [])
      .find((a) => a.name?.trim().toLowerCase() === name.toLowerCase());
    if (found) authors.push({ ...found, lang: "en" });
  } catch { /* an author lookup failing should not abort the seed */ }
}
console.log(`  authors: ${upsert("authors", authors)} (of ${topNames.length} top names looked up)`);

const pubs = [];
for (const page of [1, 2]) pubs.push(...((await get(`/api/publishers?lang=en&perPage=60&page=${page}`)).publications || []).map((p) => ({ ...p, lang: "en" })));
console.log(`  publishers: ${upsert("publications", pubs)}`);

const count = (t) => catalog.db.prepare(`SELECT COUNT(*) n FROM ${t}`).get().n;
catalog.db.exec("DELETE FROM catalog_counts WHERE id=1");
catalog.db
  .prepare("INSERT INTO catalog_counts (id, books, authors, publications) VALUES (1, ?, ?, ?)")
  .run(count("books"), count("authors"), count("publications"));
console.log(`Done. books=${count("books")} authors=${count("authors")} publications=${count("publications")}`);
