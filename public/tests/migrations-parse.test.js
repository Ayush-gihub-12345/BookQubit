import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { createdObjects, FOLDER_BINDING } from "../scripts/lib/migrations.mjs";

describe("migration object parser (used by the preflight check)", () => {
  it("finds tables, virtual tables and indexes, ignoring comments", () => {
    const { tables, indexes } = createdObjects(`
      -- CREATE TABLE ignored (x);
      CREATE TABLE IF NOT EXISTS a (id INTEGER);
      CREATE VIRTUAL TABLE IF NOT EXISTS docs USING fts5(t);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_a ON a(id);
      CREATE INDEX idx_b ON a(id);`);
    expect(tables.sort()).toEqual(["a", "docs"]);
    expect(indexes.sort()).toEqual(["idx_a", "idx_b"]);
  });
  it("every migration folder maps to a database binding, and each new table is found", () => {
    for (const f of fs.readdirSync(new URL("../migrations", import.meta.url))) expect(FOLDER_BINDING[f]).toBeTruthy();
    const eng = createdObjects(fs.readFileSync(new URL("../migrations/engagement/0002_lists_votes_challenges.sql", import.meta.url), "utf8"));
    expect(eng.tables).toEqual(expect.arrayContaining(["lists", "list_items", "list_votes", "review_votes", "review_replies", "reading_challenges"]));
    const cat = createdObjects(fs.readFileSync(new URL("../migrations/catalog/0003_scale_series_works.sql", import.meta.url), "utf8"));
    expect(cat.tables).toEqual(expect.arrayContaining(["series", "book_series", "book_works"]));
  });
});
