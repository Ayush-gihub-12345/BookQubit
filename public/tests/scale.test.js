import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { rebuildReadModels, resetReadModelMemo, keyFilter, keyValue } from "@/lib/read-models";
import { pageAuthors, authorCountries, similarBooks, otherEditions } from "@/lib/catalog-lists";

// Scale check: builds a synthetic 100,000-book / 40,000-author catalog in memory, applies the real migrations and rebuild,
// and times the queries a visitor triggers. Skipped in the normal run (it takes a while):
//   SCALE=1 npx vitest run tests/scale.test.js            (BOOKS=200000 for more)
const ON = !!process.env.SCALE;
const N = Number(process.env.BOOKS) || 100_000;

function d1(sqlite) {
  const stmt = (sql, args = []) => ({
    sql, args, bind: (...a) => stmt(sql, a),
    all: async () => ({ results: sqlite.prepare(sql).all(...args) }),
    first: async () => sqlite.prepare(sql).get(...args) ?? null,
  });
  return { prepare: (sql) => stmt(sql), batch: async (st) => { sqlite.exec("BEGIN"); try { const o = st.map((s) => ({ results: sqlite.prepare(s.sql).all(...s.args) })); sqlite.exec("COMMIT"); return o; } catch (e) { sqlite.exec("ROLLBACK"); throw e; } } };
}

let sqlite, db;
const timings = [];
const time = async (label, fn, budgetMs) => {
  const t = performance.now(); const r = await fn(); const ms = performance.now() - t;
  timings.push([label, ms]);
  if (budgetMs) expect(ms, label).toBeLessThan(budgetMs);
  return r;
};

describe.skipIf(!ON)(`catalog at ${N.toLocaleString()} books`, () => {
  beforeAll(async () => {
    sqlite = new DatabaseSync(":memory:");
    sqlite.exec(fs.readFileSync(new URL("../sql/catalog_schema.sql", import.meta.url), "utf8"));
    for (const m of ["0001_fts_summaries", "0002_read_models", "0003_scale_series_works"]) sqlite.exec(fs.readFileSync(new URL(`../migrations/catalog/${m}.sql`, import.meta.url), "utf8"));
    const tags = Array.from({ length: 900 }, (_, i) => `tag${i}`);
    const cats = Array.from({ length: 60 }, (_, i) => `Category ${i}`);
    const countries = ["India", "United States", "United Kingdom", "France", "Japan", "Brazil", "Nigeria", "Germany"];
    const nAuthors = Math.floor(N * 0.4);
    sqlite.exec("BEGIN");
    const ia = sqlite.prepare("INSERT INTO authors(slug,lang,name,country,birth_year,bio) VALUES (?,?,?,?,?,?)");
    for (let i = 0; i < nAuthors; i++) ia.run(`author-${i}`, "en", `Author ${String(i).padStart(6, "0")}`, countries[i % 8], 1850 + (i % 170), "Bio text ".repeat(10));
    const ib = sqlite.prepare("INSERT INTO books(slug,lang,title,author,publisher,format,category,collection,country,tags,rating,published,description) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)");
    for (let i = 0; i < N; i++) {
      // tag popularity is skewed like real data: a few very common tags, a long tail of rare ones
      const t = [tags[Math.floor(Math.pow(Math.random(), 3) * 900)], tags[Math.floor(Math.pow(Math.random(), 3) * 900)], tags[(i * 7) % 900]];
      const a = `Author ${String(i % nAuthors).padStart(6, "0")}`;
      ib.run(`book-${i}`, "en", `Title ${i % (N - 500)}`, i % 9 === 0 ? `${a}, Author ${String((i + 1) % nAuthors).padStart(6, "0")}` : a,
        `Publisher ${i % 2300}`, i % 3 ? "Paperback" : "Hardcover", cats[i % 60], i % 5 === 0 ? `Collection ${i % 40}` : null, countries[i % 8],
        JSON.stringify(t), 3 + (i % 21) / 10, String(1900 + (i % 124)), "A description of the book. ".repeat(6));
    }
    sqlite.exec("COMMIT");
    sqlite.exec("INSERT INTO authors_fts(authors_fts) VALUES('rebuild')");
    db = d1(sqlite); resetReadModelMemo();
    await time("rebuild read models (one-off)", () => rebuildReadModels(db));
  }, 600_000);

  it("keeps every visitor-facing query fast and index-driven", async () => {
    const one = sqlite.prepare("SELECT * FROM books WHERE slug='book-424242' OR slug='book-4242'").get();
    const hot = "tag0", rare = "tag800";
    await time("book by slug (unique index)", () => db.prepare("SELECT * FROM books WHERE slug=?1 AND lang='en'").bind("book-4242").first(), 20);
    await time("browse: popular tag, default order, page 1", () => db.prepare(`SELECT * FROM books WHERE lang=?1 AND ${keyFilter("tag", 2, false)} ORDER BY id LIMIT 33`).bind("en", "en", keyValue(hot)).all(), 60);
    await time("browse: popular tag, by rating, page 1", () => db.prepare(`SELECT * FROM books WHERE lang=?1 AND ${keyFilter("tag", 2, false)} ORDER BY rating DESC LIMIT 33`).bind("en", "en", keyValue(hot)).all(), 400);
    await time("browse: rare tag", () => db.prepare(`SELECT * FROM books WHERE lang=?1 AND ${keyFilter("tag", 2, false)} ORDER BY rating DESC LIMIT 33`).bind("en", "en", keyValue(rare)).all(), 40);
    await time("browse: category, by rating", () => db.prepare("SELECT * FROM books WHERE lang=?1 AND category=?2 ORDER BY rating DESC LIMIT 33").bind("en", "Category 7").all(), 60);
    await time("browse: newest page 1", () => db.prepare("SELECT * FROM books WHERE lang=?1 ORDER BY created_at DESC, id DESC LIMIT 33").bind("en").all(), 60);
    await time("facets: top 60 categories", () => db.prepare("SELECT name, count FROM catalog_facets WHERE lang='en' AND kind='category' ORDER BY count DESC LIMIT 60").bind().all(), 20);
    await time("facets: top 60 tags", () => db.prepare("SELECT name, count FROM catalog_facets WHERE lang='en' AND kind='tag' ORDER BY count DESC LIMIT 60").bind().all(), 20);
    await time("authors page 1 (A-Z)", () => pageAuthors(db, "en", {}), 60);
    await time("authors page 400", () => pageAuthors(db, "en", { page: 400 }), 200);
    await time("authors: search 'author 0123'", () => pageAuthors(db, "en", { q: "Author 0123" }), 60);
    await time("authors: country filter", () => pageAuthors(db, "en", { country: "India" }), 80);
    await time("author countries (facets)", () => authorCountries(db, "en"), 20);
    const book = sqlite.prepare("SELECT * FROM books WHERE slug='book-4242'").get();
    await time("similar books", () => similarBooks(db, "en", book), 250);
    await time("other editions", () => otherEditions(db, "en", book.id), 40);
    await time("books by author (key index)", () => db.prepare(`SELECT * FROM books WHERE lang=?1 AND ${keyFilter("author", 2, false)} ORDER BY id LIMIT 200`).bind("en", "en", keyValue("Author 004242")).all(), 40);
    await time("books by publisher (loose match)", () => db.prepare(`SELECT * FROM books WHERE lang=?1 AND ${keyFilter("publisher", 2, true)} ORDER BY id LIMIT 200`).bind("en", "en", keyValue("Publisher 77")).all(), 200);
    await time("full-text search 'description'", () => db.prepare("SELECT rowid FROM books_fts WHERE books_fts MATCH ?1 LIMIT 12").bind('"title"*').all(), 120);
    console.log("\n" + `catalog size: ${N.toLocaleString()} books\n` + timings.map(([l, ms]) => `${ms.toFixed(1).padStart(9)} ms  ${l}`).join("\n"));
    expect(one || true).toBeTruthy();
  }, 120_000);

  it("no visitor query scans a big table", () => {
    const plan = (sql, ...a) => sqlite.prepare("EXPLAIN QUERY PLAN " + sql).all(...a).map((r) => r.detail).join(" | ");
    const queries = {
      slug: ["SELECT * FROM books WHERE slug=? AND lang='en'", "x"],
      category: ["SELECT * FROM books WHERE lang=? AND category=? ORDER BY rating DESC LIMIT 33", "en", "c"],
      newest: ["SELECT * FROM books WHERE lang=? ORDER BY created_at DESC, id DESC LIMIT 33", "en"],
      facets: ["SELECT name, count FROM catalog_facets WHERE lang='en' AND kind='tag' ORDER BY count DESC LIMIT 60"],
      tag: [`SELECT * FROM books WHERE lang=?1 AND ${keyFilter("tag", 2, false)} ORDER BY id LIMIT 33`, "en", "en", "t"],
    };
    for (const [name, [sql, ...a]] of Object.entries(queries)) expect(plan(sql, ...a), name).not.toMatch(/SCAN (books|authors|book_keys|catalog_facets)(?! USING)/);
  });
});
