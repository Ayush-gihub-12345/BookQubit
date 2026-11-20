// Reader-made lists. All reads and writes go to ENGAGEMENT_DB (never the catalog). Every query is indexed and bounded:
// the index pages read idx_lists_popular / idx_lists_recent with LIMIT, a list's items read idx_list_items_order, and
// "lists containing this book" reads idx_list_items_book. Counts are denormalised on `lists`, so no page ever counts rows.
import { notHidden } from "./moderation.js";

export const LIMITS = { listsPerUser: 100, itemsPerList: 200, title: 120, description: 600, note: 280, perPage: 24 };

const clip = (v, n) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);
const newId = () => crypto.randomUUID().replace(/-/g, "").slice(0, 12);
const slugOk = (s) => typeof s === "string" && /^[\w.%~-]{1,200}$/.test(s);

export async function createList(db, user, { title, description, books = [] }) {
  const t = clip(title, LIMITS.title);
  if (t.length < 3) throw new Error("A list needs a title of at least 3 characters.");
  const mine = await db.prepare("SELECT COUNT(*) AS n FROM lists WHERE user_id = ?1").bind(user.uid).first();
  if (Number(mine?.n) >= LIMITS.listsPerUser) throw new Error("You have reached the limit of lists.");
  const id = newId();
  const slugs = [...new Set(books.filter(slugOk))].slice(0, LIMITS.itemsPerList);
  const stmts = [db.prepare("INSERT INTO lists(id, user_id, user_name, title, description, item_count) VALUES (?1,?2,?3,?4,?5,?6)")
    .bind(id, user.uid, clip(user.name, 60) || null, t, clip(description, LIMITS.description) || null, slugs.length)];
  slugs.forEach((s, i) => stmts.push(db.prepare("INSERT INTO list_items(list_id, book_slug, position) VALUES (?1,?2,?3)").bind(id, s, i + 1)));
  await db.batch(stmts);
  return { id };
}

async function ownList(db, user, id) {
  const l = await db.prepare("SELECT id, user_id, item_count FROM lists WHERE id = ?1").bind(id).first();
  if (!l) throw Object.assign(new Error("List not found."), { status: 404 });
  if (l.user_id !== user.uid) throw Object.assign(new Error("Only the list's owner can change it."), { status: 403 });
  return l;
}

export async function addToList(db, user, id, slug, note) {
  if (!slugOk(slug)) throw new Error("Invalid book.");
  const l = await ownList(db, user, id);
  if (l.item_count >= LIMITS.itemsPerList) throw new Error("This list is full.");
  const have = await db.prepare("SELECT 1 AS x FROM list_items WHERE list_id = ?1 AND book_slug = ?2").bind(id, slug).first();
  if (have) return { added: false, item_count: l.item_count };
  const top = await db.prepare("SELECT COALESCE(MAX(position), 0) AS p FROM list_items WHERE list_id = ?1").bind(id).first();
  await db.batch([
    db.prepare("INSERT INTO list_items(list_id, book_slug, position, note) VALUES (?1,?2,?3,?4)").bind(id, slug, Number(top.p) + 1, clip(note, LIMITS.note) || null),
    db.prepare("UPDATE lists SET item_count = item_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?1").bind(id),
  ]);
  return { added: true, item_count: l.item_count + 1 };
}

export async function removeFromList(db, user, id, slug) {
  const l = await ownList(db, user, id);
  const r = await db.prepare("DELETE FROM list_items WHERE list_id = ?1 AND book_slug = ?2").bind(id, slug).run();
  if (Number(r.meta?.changes ?? r.changes ?? 0) > 0) await db.prepare("UPDATE lists SET item_count = MAX(0, item_count - 1), updated_at = CURRENT_TIMESTAMP WHERE id = ?1").bind(id).run();
  return { item_count: Math.max(0, l.item_count - 1) };
}

export async function deleteList(db, user, id) {
  await ownList(db, user, id);
  await db.batch([
    db.prepare("DELETE FROM list_items WHERE list_id = ?1").bind(id),
    db.prepare("DELETE FROM list_votes WHERE list_id = ?1").bind(id),
    db.prepare("DELETE FROM lists WHERE id = ?1").bind(id),
  ]);
  return { deleted: true };
}

/** One vote per reader per list (toggle). The owner cannot vote for their own list. */
export async function toggleListVote(db, user, id) {
  const l = await db.prepare("SELECT user_id, vote_count FROM lists WHERE id = ?1").bind(id).first();
  if (!l) throw Object.assign(new Error("List not found."), { status: 404 });
  if (l.user_id === user.uid) throw new Error("You can't vote for your own list.");
  const had = await db.prepare("SELECT 1 AS x FROM list_votes WHERE list_id = ?1 AND user_id = ?2").bind(id, user.uid).first();
  await db.batch([
    had ? db.prepare("DELETE FROM list_votes WHERE list_id = ?1 AND user_id = ?2").bind(id, user.uid) : db.prepare("INSERT INTO list_votes(list_id, user_id) VALUES (?1,?2)").bind(id, user.uid),
    db.prepare(`UPDATE lists SET vote_count = MAX(0, vote_count + ${had ? -1 : 1}) WHERE id = ?1`).bind(id),
  ]);
  return { voted: !had, vote_count: Math.max(0, l.vote_count + (had ? -1 : 1)) };
}

/** A list with its books in order. `viewerId` adds `voted`. Returns null when it does not exist. */
export async function getList(db, id, viewerId, { includeHidden = false } = {}) {
  const list = await db.prepare(`SELECT * FROM lists WHERE id = ?1${includeHidden ? "" : ` AND ${notHidden("list", "lists.id")}`}`).bind(id).first();
  if (!list) return null;
  const [items, vote] = await Promise.all([
    db.prepare("SELECT book_slug, position, note FROM list_items WHERE list_id = ?1 ORDER BY position LIMIT ?2").bind(id, LIMITS.itemsPerList).all(),
    viewerId ? db.prepare("SELECT 1 AS x FROM list_votes WHERE list_id = ?1 AND user_id = ?2").bind(id, viewerId).first() : null,
  ]);
  return { list, items: items.results, voted: !!vote };
}

/** The index: sort "popular" (most votes) or "recent". Limit+1 paging, no COUNT(*). */
export async function browseLists(db, { sort = "popular", page = 1, perPage = LIMITS.perPage } = {}) {
  const p = Math.min(50, Math.max(1, Number(page) || 1));
  const order = sort === "recent" ? "created_at DESC" : "vote_count DESC, created_at DESC";
  const { results } = await db.prepare(`SELECT id, user_name, title, description, item_count, vote_count, created_at FROM lists WHERE item_count > 0 AND ${notHidden("list", "lists.id")} ORDER BY ${order} LIMIT ?1 OFFSET ?2`)
    .bind(perPage + 1, (p - 1) * perPage).all();
  return { lists: results.slice(0, perPage), hasMore: results.length > perPage, page: p };
}

export async function myLists(db, uid) {
  const { results } = await db.prepare("SELECT id, title, item_count, vote_count FROM lists WHERE user_id = ?1 ORDER BY created_at DESC LIMIT ?2").bind(uid, LIMITS.listsPerUser).all();
  return results;
}

/** Lists that contain a book, best first (for the book page). */
export async function listsForBook(db, slug, limit = 6) {
  const { results } = await db.prepare(
    `SELECT l.id, l.title, l.user_name, l.item_count, l.vote_count FROM list_items i JOIN lists l ON l.id = i.list_id
     WHERE i.book_slug = ?1 AND ${notHidden("list", "l.id")} ORDER BY l.vote_count DESC LIMIT ?2`).bind(slug, limit).all();
  return results;
}
