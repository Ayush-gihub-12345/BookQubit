import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { pickSurprise, toSurprise } from "@/lib/surprise";

// Real SQL schemas, in-memory: the same queries that run in D1 run here.
function d1(sqlite) {
  return {
    prepare(sql) {
      return {
        bind(...a) {
          const st = () => sqlite.prepare(sql);
          return { all: async () => ({ results: st().all(...a) }), first: async () => st().get(...a) ?? null };
        },
      };
    },
  };
}

let env;
beforeAll(() => {
  const cat = new DatabaseSync(":memory:");
  cat.exec(fs.readFileSync(new URL("../sql/catalog_schema.sql", import.meta.url), "utf8"));
  const ins = cat.prepare("INSERT INTO books (slug,lang,title,author,category,page_count,rating,published,description,key_points) VALUES (?,?,?,?,?,?,?,?,?,?)");
  [
    ["s1", "en", "Short Fiction", "A", "Fiction", 120, 4.5, "2001", "A tiny story. More.", '["Take small steps"]'],
    ["m1", "en", "Mid Fiction", "B", "Fiction", 300, 4.2, "2010", "Medium tale.", null],
    ["l1", "en", "Long Fiction", "C", "Fiction", 700, 4.8, "1999", "Epic. Long.", null],
    ["h1", "en", "History Book", "D", "History", 320, 4.0, "2015", "Past things.", null],
    ["bad", "en", "Low Rated", "E", "Fiction", 200, 2.0, "2012", "Meh.", null],
    ["hi1", "hi", "हिंदी किताब", "F", "Fiction", 150, 4.5, "2012", "कहानी।", null],
  ].forEach((r) => ins.run(...r));
  const main = new DatabaseSync(":memory:");
  main.exec(fs.readFileSync(new URL("../sql/main_schema.sql", import.meta.url), "utf8"));
  main.prepare(
    `INSERT INTO shelf (user_id,book_slug,status,moods) VALUES
     ('u','m1','want','["Hopeful"]'),('u','h1','want',NULL),('u','s1','read','["Hopeful","Funny"]'),('v','l1','read','["Dark"]')`
  ).run();
  env = { CATALOG_DB: d1(cat), DB: d1(main) };
});

// Random: sample many times and look at the set of answers.
const sample = async (q, n = 80) => {
  const seen = new Set();
  for (let i = 0; i < n; i++) seen.add((await pickSurprise(env, q))?.slug ?? null);
  return seen;
};

describe("pickSurprise", () => {
  it("only returns well-rated books in the right language, and varies", async () => {
    const s = await sample({ lang: "en" });
    expect(s.has("bad")).toBe(false);
    expect(s.has("hi1")).toBe(false);
    expect(s.has(null)).toBe(false);
    expect(s.size).toBeGreaterThanOrEqual(3);
    expect([...(await sample({ lang: "hi" }))]).toEqual(["hi1"]);
  });

  it("honours genre and length filters", async () => {
    expect([...(await sample({ lang: "en", genre: "History" }))]).toEqual(["h1"]);
    expect([...(await sample({ lang: "en", length: "short" }))]).toEqual(["s1"]);
    expect([...(await sample({ lang: "en", length: "long" }))]).toEqual(["l1"]);
    expect([...(await sample({ lang: "en", genre: "Fiction", length: "medium" }))]).toEqual(["m1"]);
  });

  it("never repeats what was already shown, and says so when nothing is left", async () => {
    expect([...(await sample({ lang: "en", exclude: ["s1", "m1", "l1"] }))]).toEqual(["h1"]);
    expect(await pickSurprise(env, { lang: "en", exclude: ["s1", "m1", "l1", "h1"] })).toBeNull();
    expect(await pickSurprise(env, { lang: "en", genre: "Poetry" })).toBeNull();
  });

  it("filters by reader-tagged mood", async () => {
    expect([...(await sample({ lang: "en", mood: "Hopeful" }))].sort()).toEqual(["m1", "s1"]);
    expect([...(await sample({ lang: "en", mood: "Dark" }))]).toEqual(["l1"]);
    expect(await pickSurprise(env, { lang: "en", mood: "Mysterious" })).toBeNull();
  });

  it("'my want-to-read' needs a signed-in reader and only uses that reader's list", async () => {
    expect(await pickSurprise(env, { lang: "en", source: "shelf" })).toEqual({ needsSignIn: true });
    expect([...(await sample({ lang: "en", source: "shelf", userId: "u" }))].sort()).toEqual(["h1", "m1"]);
    expect([...(await sample({ lang: "en", source: "shelf", userId: "u", genre: "History" }))]).toEqual(["h1"]);
    expect(await pickSurprise(env, { lang: "en", source: "shelf", userId: "nobody" })).toBeNull();
  });

  it("treats hostile input as plain data", async () => {
    expect(await pickSurprise(env, { lang: "en", genre: "x' OR '1'='1", mood: 'a"%_' })).toBeNull();
  });

  it("degrades quietly without a database, or when the database throws", async () => {
    expect(await pickSurprise({}, { lang: "en" })).toBeNull();
    expect(await pickSurprise({ CATALOG_DB: { prepare: () => { throw new Error("x"); } } }, { lang: "en" })).toBeNull();
  });
});

describe("toSurprise", () => {
  it("shapes the row for the modal and survives malformed key points", () => {
    const b = toSurprise({ slug: "a", title: "T", author: "A", cover_url: "c", rating: 4.4, page_count: 300, published: "2010-05", category: "Fiction", description: "First. Second.", key_points: "{bad json" });
    expect(b).toMatchObject({ slug: "a", coverUrl: "c", pages: 300, year: 2010, genre: "Fiction", hook: "First.", readingMinutes: 360 });
  });
});
