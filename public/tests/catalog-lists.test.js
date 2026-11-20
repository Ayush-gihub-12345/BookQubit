import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { rebuildReadModels, resetReadModelMemo } from "@/lib/read-models";
import { pageAuthors, authorCountries, similarBooks, otherEditions, seriesOf } from "@/lib/catalog-lists";

function d1(sqlite) {
  const stmt = (sql, args = []) => ({
    sql, args, bind: (...a) => stmt(sql, a),
    all: async () => ({ results: sqlite.prepare(sql).all(...args) }),
    first: async () => sqlite.prepare(sql).get(...args) ?? null,
    run: async () => sqlite.prepare(sql).run(...args),
  });
  return {
    prepare: (sql) => stmt(sql),
    batch: async (stmts) => { sqlite.exec("BEGIN"); try { const out = stmts.map((s) => ({ results: sqlite.prepare(s.sql).all(...s.args) })); sqlite.exec("COMMIT"); return out; } catch (e) { sqlite.exec("ROLLBACK"); throw e; } },
  };
}

let sqlite, db;
const plan = (sql, ...a) => sqlite.prepare("EXPLAIN QUERY PLAN " + sql).all(...a).map((r) => r.detail).join(" | ");

beforeAll(async () => {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(fs.readFileSync(new URL("../sql/catalog_schema.sql", import.meta.url), "utf8"));
  for (const m of ["0001_fts_summaries", "0002_read_models", "0003_scale_series_works"]) sqlite.exec(fs.readFileSync(new URL(`../migrations/catalog/${m}.sql`, import.meta.url), "utf8"));
  sqlite.exec(`INSERT INTO books(slug,lang,title,author,publisher,category,tags,rating,published) VALUES
    ('a1','en','Dune','Frank Herbert','Ace','SciFi','["space","politics","desert"]',4.8,'1965'),
    ('a2','en','Dune Messiah','Frank Herbert','Ace','SciFi','["space","politics"]',4.2,'1969'),
    ('a3','en','Foundation','Isaac Asimov','Gnome','SciFi','["space","empire"]',4.6,'1951'),
    ('a4','en','Dune','Frank Herbert','Penguin','SciFi','["space","politics","desert"]',4.7,'1990'),
    ('a5','en','Cookbook','Jane Cook','Food Co','Food','["recipes"]',3.9,'2001'),
    ('a6','en','Pair','Ann Lee, Bo Chan','Duo','Fiction','["pair"]',4.0,'2010')`);
  sqlite.exec(`INSERT INTO authors(slug,lang,name,country,birth_year,bio) VALUES
    ('frank-herbert','en','Frank Herbert','United States',1920,'Wrote Dune'),
    ('isaac-asimov','en','Isaac Asimov','Russia',1920,'Foundation'),
    ('jane-cook','en','Jane Cook','United Kingdom',1970,'Cooks'),
    ('nobody','en','Nobody Writes','France',1900,'No books'),
    ('ann-lee','en','Ann Lee','United States',1980,'Pair author')`);
  sqlite.exec("INSERT INTO books_fts(books_fts) VALUES('rebuild'); INSERT INTO authors_fts(authors_fts) VALUES('rebuild');");
  db = d1(sqlite);
  resetReadModelMemo();
  await rebuildReadModels(db);
});

describe("paged authors", () => {
  it("lists only authors with books, in name order, with country filter and search", async () => {
    const all = await pageAuthors(db, "en", {});
    expect(all.authors.map((a) => a.name)).toEqual(["Ann Lee", "Frank Herbert", "Isaac Asimov", "Jane Cook"]); // 'Nobody Writes' has no book
    expect((await pageAuthors(db, "en", { country: "United States" })).authors.map((a) => a.slug)).toEqual(["ann-lee", "frank-herbert"]);
    expect((await pageAuthors(db, "en", { q: "isa" })).authors.map((a) => a.slug)).toEqual(["isaac-asimov"]);
    expect((await pageAuthors(db, "en", { sort: "recent" })).authors[0].slug).toBe("ann-lee");
  });
  it("pages without totals", async () => {
    const p1 = await pageAuthors(db, "en", { perPage: 2 });
    expect(p1.authors).toHaveLength(2);
    expect(p1.hasMore).toBe(true);
    const p2 = await pageAuthors(db, "en", { perPage: 2, page: 2 });
    expect(p2.authors).toHaveLength(2);
    expect(p2.hasMore).toBe(false);
  });
  it("is index-driven: no scan of authors, and the book check uses the key table", () => {
    const p = plan(`SELECT a.id FROM authors a WHERE a.lang = ?1 AND EXISTS (SELECT 1 FROM book_keys k WHERE k.lang = a.lang AND k.kind = 'author' AND k.key = lower(trim(a.name))) ORDER BY a.name COLLATE NOCASE ASC LIMIT 61`, "en");
    expect(p).toMatch(/idx_authors_lang_name/);
    expect(p).toMatch(/EXISTS USING PRIMARY KEY/);
    expect(p).not.toMatch(/SCAN a(?! USING)/);
  });
  it("returns null (caller falls back) when the models are missing", async () => {
    expect(await pageAuthors({ prepare: () => { throw new Error("no such table"); } }, "en", {})).toBeNull();
  });
});

describe("facets for authors", () => {
  it("counts authors per country from the precomputed rows", async () => {
    const c = await authorCountries(db, "en");
    expect(c[0]).toMatchObject({ name: "United States", count: 2 });
  });
});

describe("similar books", () => {
  it("ranks by shared rare tags, same author and category, and explains why", async () => {
    const dune = sqlite.prepare("SELECT * FROM books WHERE slug='a1'").get();
    const r = await similarBooks(db, "en", dune, { limit: 5 });
    const ids = Object.fromEntries(sqlite.prepare("SELECT id, slug FROM books").all().map((b) => [b.id, b.slug]));
    expect(ids[r[0].id]).toBe("a4"); // same title/author, all three tags
    expect(r.map((x) => ids[x.id])).toContain("a2");
    expect(r.find((x) => ids[x.id] === "a4").shared).toContain("desert");
    expect(r.find((x) => ids[x.id] === "a2").sameAuthor).toBe(true);
    expect(r.map((x) => ids[x.id])).not.toContain("a1"); // never itself
    expect(r.map((x) => ids[x.id])).not.toContain("a5"); // unrelated cookbook
  });
  it("reads tag rows through the key index", () => {
    expect(plan("SELECT book_id FROM book_keys WHERE lang = ?1 AND kind = 'tag' AND key = ?2 LIMIT 300", "en", "space")).toMatch(/PRIMARY KEY|COVERING INDEX|USING INDEX/);
  });
});

describe("editions and series", () => {
  it("groups books of one work (same title and first author)", async () => {
    const dune = sqlite.prepare("SELECT id FROM books WHERE slug='a1'").get();
    const eds = await otherEditions(db, "en", dune.id);
    expect(eds.map((e) => e.slug)).toEqual(["a4"]);
    expect(await otherEditions(db, "en", sqlite.prepare("SELECT id FROM books WHERE slug='a3'").get().id)).toEqual([]);
  });
  it("finds the series, position and neighbours", async () => {
    const id = (slug) => sqlite.prepare("SELECT id FROM books WHERE slug=?").get(slug).id;
    sqlite.exec("INSERT INTO series(slug,lang,name) VALUES ('dune-chronicles','en','Dune Chronicles')");
    const sid = sqlite.prepare("SELECT id FROM series").get().id;
    sqlite.prepare("INSERT INTO book_series(series_id,book_id,position) VALUES (?,?,1),(?,?,2)").run(sid, id("a1"), sid, id("a2"));
    const s = await seriesOf(db, "en", id("a1"));
    expect(s.series.name).toBe("Dune Chronicles");
    expect(s.total).toBe(2);
    expect(s.prev).toBeNull();
    expect(s.next.slug).toBe("a2");
    expect(await seriesOf(db, "en", id("a5"))).toBeNull();
  });
});
