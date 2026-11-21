import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { progressFor, clampTarget, challengeStatus, joinChallenge, leaveChallenge } from "@/lib/challenges";

const wrap = (sqlite) => {
  const stmt = (sql, args = []) => ({
    bind: (...a) => stmt(sql, a),
    all: async () => ({ results: sqlite.prepare(sql).all(...args) }),
    first: async () => sqlite.prepare(sql).get(...args) ?? null,
    run: async () => { sqlite.prepare(sql).run(...args); return {}; },
  });
  return { prepare: (sql) => stmt(sql) };
};

describe("reading challenges", () => {
  const books = [
    { slug: "a", category: "SciFi", country: "United States", page_count: 300 },
    { slug: "b", category: "scifi", country: "France", page_count: 150 },
    { slug: "c", category: "Food", country: "united states", page_count: null },
  ];
  it("computes progress per kind from finished books, case-insensitively", () => {
    expect(progressFor("books", books).done).toBe(3);
    expect(progressFor("pages", books).done).toBe(450);
    expect(progressFor("genres", books).done).toBe(2);
    expect(progressFor("countries", books)).toEqual({ done: 2, items: ["France", "United States"] });
  });
  it("clamps targets to a sane range", () => {
    expect(clampTarget("books", 0)).toBe(24);
    expect(clampTarget("books", 99999)).toBe(365);
    expect(clampTarget("genres", 1)).toBe(2);
  });
  it("joins, reports progress from the shelf and leaves", async () => {
    const eng = new DatabaseSync(":memory:");
    eng.exec(fs.readFileSync(new URL("../migrations/engagement/0002_lists_votes_challenges.sql", import.meta.url), "utf8"));
    const acc = new DatabaseSync(":memory:");
    acc.exec("CREATE TABLE shelf (user_id TEXT, book_slug TEXT, status TEXT, finished_at TEXT, updated_at TEXT)");
    acc.exec(`INSERT INTO shelf VALUES ('u','a','read','2026-03-01',NULL),('u','b','read','2026-05-01',NULL),('u','old','read','2025-12-31',NULL),('u','w','want',NULL,'2026-01-01')`);
    const deps = { accounts: wrap(acc), engagement: wrap(eng), loadBooks: async (slugs) => new Map(books.filter((b) => slugs.includes(b.slug)).map((b) => [b.slug, b])) };
    await expect(joinChallenge(deps.engagement, "u", 2026, "bogus", 5)).rejects.toThrow(/Unknown/);
    await joinChallenge(deps.engagement, "u", 2026, "books", 3);
    await joinChallenge(deps.engagement, "u", 2026, "countries", 2);
    await joinChallenge(deps.engagement, "u", 2026, "books", 4);
    const s = await challengeStatus(deps, "u", 2026);
    expect(s.finishedCount).toBe(2);
    const b = s.challenges.find((c) => c.kind === "books");
    expect(b).toMatchObject({ target: 4, done: 2, pct: 50, complete: false });
    expect(s.challenges.find((c) => c.kind === "countries")).toMatchObject({ done: 2, complete: true });
    expect(s.available.map((a) => a.kind).sort()).toEqual(["genres", "pages"]);
    await leaveChallenge(deps.engagement, "u", 2026, "books");
    expect((await challengeStatus(deps, "u", 2026)).challenges.map((c) => c.kind)).toEqual(["countries"]);
  });
});
