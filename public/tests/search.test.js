import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { buildFtsQuery, keywordBooks, keywordAuthors, hybridBookSlugs } from "@/lib/search";

function d1(sqlite) {
  return { prepare: (sql) => ({ bind: (...a) => ({ all: async () => ({ results: sqlite.prepare(sql).all(...a) }) }) }) };
}

let env;
beforeAll(() => {
  const db = new DatabaseSync(":memory:");
  db.exec(fs.readFileSync(new URL("../sql/catalog_schema.sql", import.meta.url), "utf8"));
  const mig = fs.readFileSync(new URL("../migrations/catalog/0001_fts_summaries.sql", import.meta.url), "utf8");
  db.exec(mig);
  db.exec(mig); // idempotent
  db.exec(`INSERT INTO books(slug,lang,title,author,description) VALUES
    ('atomic-habits','en','Atomic Habits','James Clear','Tiny habits compound'),
    ('deep-work','en','Deep Work','Cal Newport','Focus without distraction'),
    ('sapiens','hi','सेपियन्स','Harari','मानव इतिहास')`);
  db.exec(`INSERT INTO authors(slug,lang,name) VALUES ('james-clear','en','James Clear'),('cal-newport','en','Cal Newport'),('harari','hi','युवाल नोआ हरारी')`);
  env = { CATALOG_DB: d1(db) };
});

describe("buildFtsQuery", () => {
  it("quotes every term, prefixes the last, and neutralises operators", () => {
    expect(buildFtsQuery("atomic habits")).toBe('"atomic" "habits"*');
    expect(buildFtsQuery("atomic habits", { mode: "or" })).toBe('"atomic" OR "habits"*');
    expect(buildFtsQuery('foo" OR "bar')).toBe('"foo" "OR" "bar"*');
    expect(buildFtsQuery("  ***  ")).toBe("");
  });
  it("keeps Indic and Arabic words whole (combining marks are part of the word)", () => {
    expect(buildFtsQuery("हिंदी किताब")).toBe('"हिंदी" "किताब"*');
    expect(buildFtsQuery("தமிழ் புத்தகம்")).toBe('"தமிழ்" "புத்தகம்"*');
    expect(buildFtsQuery("كتاب العادات")).toBe('"كتاب" "العادات"*');
  });
});

describe("book and author search against the real migration", () => {
  it("finds books by prefix, by language, and with an OR fallback for natural language", async () => {
    expect((await keywordBooks(env, "habi", "en")).slugs).toEqual(["atomic-habits"]);
    expect((await keywordBooks(env, "habits", "hi")).slugs).toEqual([]);
    expect((await keywordBooks(env, "मानव इतिहास", "hi")).slugs).toEqual(["sapiens"]);
    expect((await keywordBooks(env, "how to build habits", "en")).slugs).toEqual(["atomic-habits"]);
  });

  it("finds authors from two characters, in the right language", async () => {
    expect((await keywordAuthors(env, "ja", "en")).map((a) => a.slug)).toEqual(["james-clear"]);
    expect((await keywordAuthors(env, "cal", "en")).map((a) => a.slug)).toEqual(["cal-newport"]);
    expect((await keywordAuthors(env, "हरारी", "hi")).map((a) => a.slug)).toEqual(["harari"]);
    expect(await keywordAuthors(env, "ja", "hi")).toEqual([]);
  });

  it("treats hostile input as plain terms and degrades without the tables", async () => {
    expect((await keywordAuthors(env, 'x" OR 1=1 --', "en"))).toEqual([]);
    expect(await keywordAuthors({}, "ja", "en")).toEqual([]);
    expect(await keywordAuthors({ CATALOG_DB: { prepare: () => { throw new Error("no such table"); } } }, "ja", "en")).toEqual([]);
  });

  it("hybrid falls back to keyword-only without AI or Vectorize", async () => {
    const h = await hybridBookSlugs(env, "habits", "en");
    expect(h.slugs).toEqual(["atomic-habits"]);
    expect(h.semantic).toBe(0);
  });
});
