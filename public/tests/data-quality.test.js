import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { computeQuality } from "@/lib/data-quality";

function d1(sqlite) {
  const stmt = (sql, args = []) => ({
    bind: (...a) => stmt(sql, a),
    all: async () => ({ results: sqlite.prepare(sql).all(...args) }),
    first: async () => sqlite.prepare(sql).get(...args) ?? null,
  });
  return { prepare: (sql) => stmt(sql) };
}

describe("data quality report", () => {
  it("counts incomplete books, bad ISBNs, duplicate works and orphan authors", async () => {
    const sqlite = new DatabaseSync(":memory:");
    sqlite.exec(fs.readFileSync(new URL("../sql/catalog_schema.sql", import.meta.url), "utf8"));
    for (const m of ["0001_fts_summaries", "0002_read_models", "0003_scale_series_works"]) sqlite.exec(fs.readFileSync(new URL(`../migrations/catalog/${m}.sql`, import.meta.url), "utf8"));
    const long = "A long enough description that clearly passes the forty character minimum.";
    sqlite.exec(`INSERT INTO books(slug,lang,title,author,publisher,isbn,page_count,description,category,tags,cover_url) VALUES
      ('good','en','Good','A One','Pub','9780306406157',300,'${long}','Fiction','["x"]','http://c/1.jpg'),
      ('bare','en','Bare',NULL,NULL,'12345',NULL,NULL,NULL,'[]',NULL),
      ('other','en','Other','B Two','Pub','978-0-306-40615-7',100,'${long}','Fiction','["x"]','http://c/2.jpg')`);
    sqlite.exec("INSERT INTO authors(slug,lang,name) VALUES ('a-one','en','A One'),('ghost','en','Ghost')");
    sqlite.exec("INSERT INTO book_works(lang,work_key,book_id) VALUES ('en','w1',1),('en','w1',3),('en','w2',2)");
    sqlite.exec("INSERT INTO book_keys(lang,kind,key,book_id) VALUES ('en','author','a one',1)");
    const r = await computeQuality(d1(sqlite), "en");
    const c = Object.fromEntries(r.checks.map((x) => [x.key, x.count]));
    expect(r.books).toBe(3);
    expect(c.no_cover).toBe(1);
    expect(c.thin_description).toBe(1);
    expect(c.no_author).toBe(1);
    expect(c.bad_isbn).toBe(1);
    expect(c.duplicates).toBe(1);
    expect(c.orphan_authors).toBe(1);
    expect(r.samples.no_cover[0].slug).toBe("bare");
    expect(r.score).toBeGreaterThan(0);
    expect(r.score).toBeLessThan(100);
  });
});
