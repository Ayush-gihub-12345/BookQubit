// Hide / restore reader-made content (lists, review replies). Hidden rows stay in their tables and are filtered out of public reads
// with a primary-key lookup in hidden_content (see migrations/engagement/0003_moderation.sql).
export const MODERATED = new Set(["list", "review_reply"]);

/** SQL fragment: add to a WHERE clause to leave out hidden rows. `col` is the column holding the target id. */
export const notHidden = (kind, col) => `NOT EXISTS (SELECT 1 FROM hidden_content h WHERE h.kind = '${kind}' AND h.target_id = CAST(${col} AS TEXT))`;

export async function setHidden(db, kind, id, hidden) {
  if (!MODERATED.has(kind)) throw Object.assign(new Error("Unknown content type."), { status: 400 });
  const t = String(id);
  await (hidden
    ? db.prepare("INSERT OR IGNORE INTO hidden_content(kind, target_id) VALUES (?1, ?2)").bind(kind, t).run()
    : db.prepare("DELETE FROM hidden_content WHERE kind = ?1 AND target_id = ?2").bind(kind, t).run());
  return { kind, id: t, hidden: !!hidden };
}

/** What a moderator needs to see for reported items: [{ kind, id, hidden, title?/body?, user_name }]. Bounded to the ids given. */
export async function describeTargets(db, targets) {
  const out = new Map();
  const lists = targets.filter((t) => t.kind === "list").map((t) => String(t.id));
  const replies = targets.filter((t) => t.kind === "review_reply").map((t) => String(t.id));
  const marks = (a) => a.map((_, i) => `?${i + 1}`).join(",");
  if (lists.length) {
    const { results } = await db.prepare(`SELECT id, title, description, user_name, item_count, ${notHidden("list", "id")} AS visible FROM lists WHERE id IN (${marks(lists)})`).bind(...lists).all();
    for (const r of results) out.set(`list:${r.id}`, { kind: "list", id: r.id, hidden: !r.visible, title: r.title, description: r.description, user_name: r.user_name, item_count: r.item_count });
  }
  if (replies.length) {
    const { results } = await db.prepare(`SELECT id, body, user_name, book_slug, ${notHidden("review_reply", "id")} AS visible FROM review_replies WHERE id IN (${marks(replies)})`).bind(...replies.map(Number)).all();
    for (const r of results) out.set(`review_reply:${r.id}`, { kind: "review_reply", id: String(r.id), hidden: !r.visible, body: r.body, user_name: r.user_name, book_slug: r.book_slug });
  }
  return out;
}
