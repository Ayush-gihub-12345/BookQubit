import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { createList, addToList, removeFromList, deleteList, toggleListVote, getList, browseLists, myLists, listsForBook } from "@/lib/lists";
import { reviewSocial, toggleHelpful, addReply, deleteReply } from "@/lib/review-social";

function d1(sqlite) {
  const stmt = (sql, args = []) => ({
    sql, args, bind: (...a) => stmt(sql, a),
    all: async () => ({ results: sqlite.prepare(sql).all(...args) }),
    first: async () => sqlite.prepare(sql).get(...args) ?? null,
    run: async () => { const r = sqlite.prepare(sql).run(...args); return { meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } }; },
  });
  return {
    prepare: (sql) => stmt(sql),
    batch: async (stmts) => { sqlite.exec("BEGIN"); try { const out = stmts.map((s) => ({ results: sqlite.prepare(s.sql).all(...s.args) })); sqlite.exec("COMMIT"); return out; } catch (e) { sqlite.exec("ROLLBACK"); throw e; } },
  };
}

let sqlite, db;
const plan = (sql, ...a) => sqlite.prepare("EXPLAIN QUERY PLAN " + sql).all(...a).map((r) => r.detail).join(" | ");
const ann = { uid: "ann", name: "Ann" };
const bo = { uid: "bo", name: "Bo" };

beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  for (const m of ["0001_engagement", "0002_lists_votes_challenges"]) sqlite.exec(fs.readFileSync(new URL(`../migrations/engagement/${m}.sql`, import.meta.url), "utf8"));
  db = d1(sqlite);
});

describe("reader-made lists", () => {
  it("creates, adds, removes and keeps counts in step", async () => {
    const { id } = await createList(db, ann, { title: "Best space operas", books: ["dune", "foundation", "dune"] });
    let l = await getList(db, id);
    expect(l.list.item_count).toBe(2);
    expect(l.items.map((i) => i.book_slug)).toEqual(["dune", "foundation"]);
    expect((await addToList(db, ann, id, "hyperion", "wow")).item_count).toBe(3);
    expect((await addToList(db, ann, id, "hyperion")).added).toBe(false);
    await removeFromList(db, ann, id, "dune");
    l = await getList(db, id);
    expect(l.list.item_count).toBe(2);
    expect(l.items.map((i) => i.book_slug)).toEqual(["foundation", "hyperion"]);
  });
  it("only the owner can change a list, and short titles are refused", async () => {
    const { id } = await createList(db, ann, { title: "Mine", books: ["a"] });
    await expect(addToList(db, bo, id, "b")).rejects.toThrow(/owner/);
    await expect(deleteList(db, bo, id)).rejects.toThrow(/owner/);
    await expect(createList(db, ann, { title: "ab" })).rejects.toThrow(/title/);
  });
  it("votes toggle, one per reader, never on your own list, and drive the popular order", async () => {
    const a = (await createList(db, ann, { title: "Ann's list", books: ["a"] })).id;
    const b = (await createList(db, bo, { title: "Bo's list", books: ["b"] })).id;
    await expect(toggleListVote(db, ann, a)).rejects.toThrow(/own list/);
    expect((await toggleListVote(db, bo, a)).vote_count).toBe(1);
    expect((await toggleListVote(db, bo, a)).vote_count).toBe(0);
    await toggleListVote(db, bo, a);
    const idx = await browseLists(db, { sort: "popular" });
    expect(idx.lists.map((x) => x.id)).toEqual([a, b]);
    expect((await getList(db, a, "bo")).voted).toBe(true);
    expect((await myLists(db, "ann")).map((x) => x.id)).toEqual([a]);
    expect((await listsForBook(db, "a")).map((x) => x.id)).toEqual([a]);
    await deleteList(db, ann, a);
    expect(await getList(db, a)).toBeNull();
  });
  it("reads through indexes", () => {
    expect(plan("SELECT id FROM lists WHERE item_count > 0 ORDER BY vote_count DESC, created_at DESC LIMIT 25")).toMatch(/idx_lists_popular/);
    expect(plan("SELECT l.id FROM list_items i JOIN lists l ON l.id = i.list_id WHERE i.book_slug = 'x' ORDER BY l.vote_count DESC LIMIT 6")).toMatch(/idx_list_items_book|PRIMARY KEY/);
    expect(plan("SELECT book_slug FROM list_items WHERE list_id = 'x' ORDER BY position LIMIT 200")).toMatch(/idx_list_items_order|PRIMARY KEY/);
  });
});

describe("review helpful votes and replies", () => {
  it("counts helpful votes once per reader and not on your own review", async () => {
    await expect(toggleHelpful(db, ann, "dune", "ann")).rejects.toThrow(/own review/);
    expect((await toggleHelpful(db, bo, "dune", "ann")).helpful).toBe(1);
    expect((await toggleHelpful(db, { uid: "cy" }, "dune", "ann")).helpful).toBe(2);
    const off = await toggleHelpful(db, bo, "dune", "ann");
    expect(off).toEqual({ voted: false, helpful: 1 });
    const s = await reviewSocial(db, "dune", "cy");
    expect(s.helpful).toEqual({ ann: 1 });
    expect(s.voted).toEqual(["ann"]);
  });
  it("adds replies, groups them per review, rate limits, and allows removal by writer or review author", async () => {
    const r1 = await addReply(db, bo, "dune", "ann", "  Agree!  ");
    await addReply(db, bo, "dune", "cy", "Hmm");
    const s = await reviewSocial(db, "dune");
    expect(s.replies.ann).toHaveLength(1);
    expect(s.replies.ann[0].body).toBe("Agree!");
    await expect(addReply(db, bo, "dune", "ann", " ")).rejects.toThrow(/Write a reply/);
    await expect(deleteReply(db, { uid: "zed" }, r1.id)).rejects.toThrow(/Not allowed/);
    expect((await deleteReply(db, ann, r1.id)).deleted).toBe(true);
    for (let i = 0; i < 19; i++) await addReply(db, bo, "dune", "ann", "reply " + i);
    await expect(addReply(db, bo, "dune", "ann", "one too many")).rejects.toThrow(/very fast/);
  });
  it("reads a book's votes and replies through the primary-key / reply index", () => {
    expect(plan("SELECT author_id, COUNT(*) FROM review_votes WHERE book_slug = 'x' GROUP BY author_id")).toMatch(/PRIMARY KEY|COVERING/);
    expect(plan("SELECT id FROM review_replies WHERE book_slug = 'x' ORDER BY created_at LIMIT 150")).toMatch(/idx_review_replies_review/);
  });
});
