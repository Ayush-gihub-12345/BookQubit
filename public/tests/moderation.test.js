import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { createList, getList, browseLists, listsForBook } from "@/lib/lists";
import { addReply, reviewSocial } from "@/lib/review-social";
import { setHidden, describeTargets } from "@/lib/moderation";

function d1(sqlite) {
  const stmt = (sql, args = []) => ({
    sql, args, bind: (...a) => stmt(sql, a),
    all: async () => ({ results: sqlite.prepare(sql).all(...args) }),
    first: async () => sqlite.prepare(sql).get(...args) ?? null,
    run: async () => { const r = sqlite.prepare(sql).run(...args); return { meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } }; },
  });
  return { prepare: (sql) => stmt(sql), batch: async (st) => st.map((s) => ({ results: sqlite.prepare(s.sql).all(...s.args) })) };
}
let sqlite, db;
beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  for (const m of ["0001_engagement", "0002_lists_votes_challenges", "0003_moderation"]) sqlite.exec(fs.readFileSync(new URL(`../migrations/engagement/${m}.sql`, import.meta.url), "utf8"));
  db = d1(sqlite);
});

describe("hiding reported content", () => {
  it("a hidden list disappears from the index, the book page list and its own page, and comes back when restored", async () => {
    const { id } = await createList(db, { uid: "ann", name: "Ann" }, { title: "Spammy list", books: ["dune"] });
    expect((await browseLists(db)).lists).toHaveLength(1);
    await setHidden(db, "list", id, true);
    expect((await browseLists(db)).lists).toHaveLength(0);
    expect(await listsForBook(db, "dune")).toHaveLength(0);
    expect(await getList(db, id)).toBeNull();
    expect((await getList(db, id, null, { includeHidden: true })).list.id).toBe(id);
    const d = await describeTargets(db, [{ kind: "list", id }]);
    expect(d.get(`list:${id}`)).toMatchObject({ hidden: true, title: "Spammy list" });
    await setHidden(db, "list", id, false);
    expect((await browseLists(db)).lists).toHaveLength(1);
    expect((await describeTargets(db, [{ kind: "list", id }])).get(`list:${id}`).hidden).toBe(false);
  });
  it("a hidden reply is left out of a book's replies", async () => {
    const a = await addReply(db, { uid: "bo", name: "Bo" }, "dune", "ann", "rude reply");
    await addReply(db, { uid: "cy", name: "Cy" }, "dune", "ann", "kind reply");
    await setHidden(db, "review_reply", a.id, true);
    const s = await reviewSocial(db, "dune");
    expect(s.replies.ann.map((r) => r.body)).toEqual(["kind reply"]);
    expect((await describeTargets(db, [{ kind: "review_reply", id: a.id }])).get(`review_reply:${a.id}`)).toMatchObject({ hidden: true, body: "rude reply" });
  });
  it("only lists and replies can be hidden", async () => {
    await expect(setHidden(db, "user", "x", true)).rejects.toThrow(/Unknown/);
  });
});
