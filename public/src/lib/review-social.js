// Helpful votes and replies on reviews, in ENGAGEMENT_DB. A review is the (book_slug, author_id) pair (the accounts database's
// shelf row); nothing here copies review text. Reads use the book_slug prefix of the primary keys / idx_review_replies_review,
// so one book page costs two small indexed queries however many reviews the catalog holds overall.
import { notHidden } from "./moderation.js";

export const REVIEW_LIMITS = { reply: 1000, repliesPerBook: 150, repliesPerHour: 20 };

const clip = (v, n) => String(v ?? "").trim().slice(0, n);

/** { helpful: {authorId: n}, replies: {authorId: [...]}, voted: [authorId] } for one book. */
export async function reviewSocial(db, slug, viewerId) {
  const [votes, replies, mine] = await Promise.all([
    db.prepare("SELECT author_id, COUNT(*) AS n FROM review_votes WHERE book_slug = ?1 GROUP BY author_id").bind(slug).all(),
    db.prepare("SELECT id, author_id, user_id, user_name, body, created_at FROM review_replies WHERE book_slug = ?1 AND " + notHidden("review_reply", "review_replies.id") + " ORDER BY created_at LIMIT ?2").bind(slug, REVIEW_LIMITS.repliesPerBook).all(),
    viewerId ? db.prepare("SELECT author_id FROM review_votes WHERE book_slug = ?1 AND voter_id = ?2").bind(slug, viewerId).all() : { results: [] },
  ]);
  const out = { helpful: {}, replies: {}, voted: mine.results.map((r) => r.author_id) };
  for (const v of votes.results) out.helpful[v.author_id] = Number(v.n);
  for (const r of replies.results) (out.replies[r.author_id] ||= []).push(r);
  return out;
}

/** Toggle "helpful" on someone else's review. */
export async function toggleHelpful(db, user, slug, authorId) {
  if (authorId === user.uid) throw Object.assign(new Error("You can't mark your own review helpful."), { status: 400 });
  const had = await db.prepare("SELECT 1 AS x FROM review_votes WHERE book_slug = ?1 AND author_id = ?2 AND voter_id = ?3").bind(slug, authorId, user.uid).first();
  await (had
    ? db.prepare("DELETE FROM review_votes WHERE book_slug = ?1 AND author_id = ?2 AND voter_id = ?3").bind(slug, authorId, user.uid).run()
    : db.prepare("INSERT OR IGNORE INTO review_votes(book_slug, author_id, voter_id) VALUES (?1,?2,?3)").bind(slug, authorId, user.uid).run());
  const n = await db.prepare("SELECT COUNT(*) AS n FROM review_votes WHERE book_slug = ?1 AND author_id = ?2").bind(slug, authorId).first();
  return { voted: !had, helpful: Number(n.n) };
}

export async function addReply(db, user, slug, authorId, body) {
  const text = clip(body, REVIEW_LIMITS.reply);
  if (text.length < 2) throw Object.assign(new Error("Write a reply first."), { status: 400 });
  const recent = await db.prepare("SELECT COUNT(*) AS n FROM review_replies WHERE user_id = ?1 AND created_at > datetime('now','-1 hour')").bind(user.uid).first();
  if (Number(recent.n) >= REVIEW_LIMITS.repliesPerHour) throw Object.assign(new Error("You're replying very fast. Try again in a little while."), { status: 429 });
  const r = await db.prepare("INSERT INTO review_replies(book_slug, author_id, user_id, user_name, body) VALUES (?1,?2,?3,?4,?5)")
    .bind(slug, authorId, user.uid, clip(user.name, 60) || null, text).run();
  return { id: Number(r.meta?.last_row_id ?? 0), body: text };
}

/** A reply can be removed by who wrote it or by the review's author. */
export async function deleteReply(db, user, id) {
  const row = await db.prepare("SELECT user_id, author_id FROM review_replies WHERE id = ?1").bind(id).first();
  if (!row) return { deleted: false };
  if (row.user_id !== user.uid && row.author_id !== user.uid) throw Object.assign(new Error("Not allowed."), { status: 403 });
  await db.prepare("DELETE FROM review_replies WHERE id = ?1").bind(id).run();
  return { deleted: true };
}
