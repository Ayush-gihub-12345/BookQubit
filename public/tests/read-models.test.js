import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { REBUILD_STATEMENTS } from "@/lib/read-models-sql";
import { rebuildReadModels, readModelMeta, modelsCover, keyFilter, keyValue, resetReadModelMemo } from "@/lib/read-models";

// A D1-shaped wrapper over real SQLite, so these run the real migration and the real rebuild SQL.
function d1(sqlite) {
  const stmt = (sql, args = []) => ({
    sql, args,
    bind: (...a) => stmt(sql, a),
    all: async () => ({ results: sqlite.prepare(sql).all(...args) }),
    first: async () => sqlite.prepare(sql).get(...args) ?? null,
    run: async () => sqlite.prepare(sql).run(...args),
  });
  return {
    prepare: (sql) => stmt(sql),
    batch: async (stmts) => {
      sqlite.exec("BEGIN");
      try { const out = stmts.map((s) => ({ results: sqlite.prepare(s.sql).all(...s.args) })); sqlite.exec("COMMIT"); return out; }
      catch (e) { sqlite.exec("ROLLBACK"); throw e; }
    },
  };
}

let sqlite, db;
const ids = async (sql, ...a) => (await db.prepare(sql).bind(...a).all()).results.map((r) => r.id);

beforeAll(() => {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(fs.readFileSync(new URL("../sql/catalog_schema.sql", import.meta.url), "utf8"));
  const mig = fs.readFileSync(new URL("../migrations/catalog/0002_read_models.sql", import.meta.url), "utf8");
  sqlite.exec(mig);
  sqlite.exec(mig); // idempotent
  sqlite.exec(fs.readFileSync(new URL("../migrations/catalog/0003_scale_series_works.sql", import.meta.url), "utf8"));
  db = d1(sqlite);
  sqlite.exec(`INSERT INTO books(slug,lang,title,author,publisher,format,category,collection,country,tags) VALUES
    ('a','en','A','Ken Follett, John Lee','Penguin Books','Paperback','Fiction','Epics','UK','["History","Fiction"]'),
    ('b','en','B','Ken Follett','Penguin Random House','Mass Market Paperback','Fiction',NULL,'UK','["history"]'),
    ('c','en','C','O"Brien \\ Co, Jane','Tor','Hardcover','Fantasy','Epics','US','not json'),
    ('d','en','D',NULL,NULL,NULL,'Fantasy',NULL,'US',NULL),
    ('e','hi','E','हरारी','पेंगुइन','Paperback','इतिहास',NULL,'IN','["मानव"]'),
    ('f','en','F','Jane','100% Pure','Kindle','Fiction',NULL,'UK','["Fiction", 7, ""]')`);
});

beforeEach(() => resetReadModelMemo());

describe("read models: before they are built", () => {
  it("are absent to the application, so the original code paths run", async () => {
    expect(await readModelMeta(db)).toBeNull();
    expect(await modelsCover(db, 1)).toBe(false);
    expect(await readModelMeta(null)).toBeNull();
    expect(await readModelMeta({ prepare: () => { throw new Error("no such table"); } })).toBeNull();
  });
});

describe("read models: rebuild", () => {
  beforeAll(async () => { await rebuildReadModels(db); });

  it("records how far they reach and only covers books up to that id", async () => {
    resetReadModelMemo();
    const meta = await readModelMeta(db);
    expect(meta.books).toBe(6);
    expect(meta.max_id).toBe(6);
    expect(await modelsCover(db, 6)).toBe(true);
    expect(await modelsCover(db, 7)).toBe(false); // a newer book than the model has seen: do not trust it
  });

  it("is idempotent and atomic", async () => {
    await rebuildReadModels(db);
    await rebuildReadModels(db);
    const n = sqlite.prepare("SELECT COUNT(*) c FROM book_keys").get().c;
    await rebuildReadModels(db);
    expect(sqlite.prepare("SELECT COUNT(*) c FROM book_keys").get().c).toBe(n);
    expect(REBUILD_STATEMENTS.length).toBeGreaterThan(8);
  });

  it("tag filter matches case-insensitively, per language, ignoring junk values and bad JSON", async () => {
    expect(await ids(`SELECT id FROM books WHERE lang=?1 AND ${keyFilter("tag", 2, false)} ORDER BY id`, "en", "en", keyValue("History", false))).toEqual([1, 2]);
    expect(await ids(`SELECT id FROM books WHERE ${keyFilter("tag", 1, false)} ORDER BY id`, "en", keyValue("fiction", false))).toEqual([1, 6]);
    expect(await ids(`SELECT id FROM books WHERE ${keyFilter("tag", 1, false)}`, "hi", keyValue("मानव", false))).toEqual([5]);
    expect(await ids(`SELECT id FROM books WHERE ${keyFilter("tag", 1, false)}`, "en", keyValue("", false))).toEqual([]);
  });

  it("author filter splits co-authors and survives quotes and backslashes in names", async () => {
    const byAuthor = (name) => ids(`SELECT id FROM books WHERE ${keyFilter("author", 1, false)} ORDER BY id`, "en", keyValue(name, false));
    expect(await byAuthor("Ken Follett")).toEqual([1, 2]);
    expect(await byAuthor("john lee")).toEqual([1]);
    expect(await byAuthor("Jane")).toEqual([3, 6]);
    expect(await byAuthor("OBrien  Co")).toEqual([3]); // quote and backslash stripped, not an error
  });

  it("publisher and format keep the old loose 'contains' matching, and wildcards are literal", async () => {
    const pub = (t) => ids(`SELECT id FROM books WHERE ${keyFilter("publisher", 1, true)} ORDER BY id`, "en", keyValue(t, true));
    expect(await pub("penguin")).toEqual([1, 2]);
    expect(await pub("Random House")).toEqual([2]);
    expect(await pub("100%")).toEqual([6]);
    expect(await pub("%")).toEqual([6]); // a bare % is the character, not "match everything"
    expect(await pub("_")).toEqual([]);
    const fmt = (t) => ids(`SELECT id FROM books WHERE ${keyFilter("format", 1, true)} ORDER BY id`, "en", keyValue(t, true));
    expect(await fmt("paperback")).toEqual([1, 2]);
  });

  it("facet counts equal the live GROUP BY queries they replace", async () => {
    const model = (kind) => sqlite.prepare("SELECT name, count FROM catalog_facets WHERE lang='en' AND kind=? ORDER BY count DESC, name").all(kind).map((r) => [r.name, r.count]);
    const live = (sql) => sqlite.prepare(sql).all().map((r) => [r.name, r.count]);
    expect(model("category")).toEqual(live("SELECT category name, COUNT(*) count FROM books WHERE lang='en' AND category IS NOT NULL AND category!='' GROUP BY category ORDER BY count DESC, name"));
    expect(model("country")).toEqual(live("SELECT country name, COUNT(*) count FROM books WHERE lang='en' AND country IS NOT NULL AND country!='' GROUP BY country ORDER BY count DESC, name"));
    expect(model("collection")).toEqual(live("SELECT collection name, COUNT(*) count FROM books WHERE lang='en' AND collection IS NOT NULL AND collection!='' GROUP BY collection ORDER BY count DESC, name"));
    expect(model("tag")).toEqual(live("SELECT value name, COUNT(*) count FROM books, json_each(CASE WHEN tags IS NOT NULL AND json_valid(tags) THEN tags ELSE '[]' END) WHERE lang='en' AND type='text' AND value!='' GROUP BY value ORDER BY count DESC, name"));
  });

  it("author profile lookup by name is indexed (it runs on every book page)", () => {
    sqlite.exec("INSERT INTO authors(slug,lang,name) VALUES ('ken-follett','en',' Ken Follett ')");
    const sql = "SELECT id, slug FROM authors WHERE lang = ?1 AND lower(trim(name)) IN (?2,?3)";
    expect(sqlite.prepare(sql).all("en", "ken follett", "nobody").map((r) => r.slug)).toEqual(["ken-follett"]);
    const plan = sqlite.prepare("EXPLAIN QUERY PLAN " + sql).all("en", "a", "b").map((r) => r.detail).join(" ");
    expect(plan).toMatch(/idx_authors_lang_lname/);
  });

  it("the top-N facet read is served by the covering index, not a table scan", () => {
    const plan = sqlite.prepare("EXPLAIN QUERY PLAN SELECT name, count FROM catalog_facets WHERE lang='en' AND kind='category' ORDER BY count DESC LIMIT 60").all().map((r) => r.detail).join(" ");
    expect(plan).toMatch(/idx_catalog_facets_top|PRIMARY KEY/);
    expect(plan).not.toMatch(/SCAN catalog_facets(?! USING)/);
    const tagPlan = sqlite.prepare("EXPLAIN QUERY PLAN SELECT book_id FROM book_keys WHERE lang='en' AND kind='tag' AND key='history'").all().map((r) => r.detail).join(" ");
    expect(tagPlan).toMatch(/PRIMARY KEY|USING (COVERING )?INDEX/);
  });
});

describe("read models: chunked rebuild equals the single-batch rebuild", () => {
  it("produces identical keys, works and facet counts", async () => {
    const make = () => {
      const q = new DatabaseSync(":memory:");
      q.exec(fs.readFileSync(new URL("../sql/catalog_schema.sql", import.meta.url), "utf8"));
      for (const m of ["0002_read_models", "0003_scale_series_works"]) q.exec(fs.readFileSync(new URL(`../migrations/catalog/${m}.sql`, import.meta.url), "utf8"));
      const ins = q.prepare("INSERT INTO books(slug,lang,title,author,publisher,format,category,country,tags) VALUES (?,?,?,?,?,?,?,?,?)");
      for (let i = 0; i < 53; i++) ins.run(`b${i}`, i % 7 ? "en" : "hi", `Title ${i % 40}`, i % 3 ? `Au ${i % 9}` : `Au ${i % 9}, Co ${i % 4}`, `Pub ${i % 5}`, i % 2 ? "Paperback" : "Hardcover", `Cat ${i % 6}`, "UK", JSON.stringify([`Tag${i % 8}`, `tag${i % 8}`, `Rare${i}`]));
      return q;
    };
    const dump = (q) => ({
      keys: q.prepare("SELECT lang,kind,key,book_id FROM book_keys ORDER BY 1,2,3,4").all().map((r) => Object.values(r).join("|")),
      works: q.prepare("SELECT lang,work_key,book_id FROM book_works ORDER BY 1,2,3").all().map((r) => Object.values(r).join("|")),
      facets: q.prepare("SELECT lang,kind,name,count FROM catalog_facets ORDER BY 1,2,3").all().map((r) => Object.values(r).join("|")),
    });
    const a = make(), b = make();
    await rebuildReadModels(d1(a), { chunk: 1_000_000 }); // single batch
    await rebuildReadModels(d1(b), { chunk: 5 });          // many chunks
    expect(dump(b)).toEqual(dump(a));
    expect(dump(a).keys.length).toBeGreaterThan(100);
    resetReadModelMemo();
    expect((await readModelMeta(d1(b))).books).toBe(53);
  });
});
