// Safety + privacy logic (main `database`). db-injected for testing; all input bound as parameters.

export class SafetyError extends Error {
  constructor(code, status = 400) { super(code); this.code = code; this.status = status; }
}

const TARGETS = new Set(["discussion_post", "user", "quote", "review", "mindspace"]);
const clip = (v, n) => (v == null ? null : String(v).trim().slice(0, n) || null);

export async function listSafety(db, uid) {
  const { results } = await db.prepare("SELECT target_user_id, kind FROM user_blocks WHERE user_id=?1 LIMIT 1000").bind(uid).all();
  return {
    blocked: results.filter((r) => r.kind === "block").map((r) => r.target_user_id),
    muted: results.filter((r) => r.kind === "mute").map((r) => r.target_user_id),
  };
}

/** kind: "block" | "mute" | null (null removes any relation). */
export async function setRelation(db, uid, target, kind) {
  if (!target || target === uid) throw new SafetyError("bad_target");
  if (kind === null) {
    await db.prepare("DELETE FROM user_blocks WHERE user_id=?1 AND target_user_id=?2").bind(uid, target).run();
    return;
  }
  if (kind !== "block" && kind !== "mute") throw new SafetyError("bad_kind");
  const { n } = await db.prepare("SELECT COUNT(*) n FROM user_blocks WHERE user_id=?1").bind(uid).first();
  if (n >= 1000) throw new SafetyError("limit", 409);
  await db.prepare(
    "INSERT INTO user_blocks (user_id, target_user_id, kind) VALUES (?1,?2,?3) ON CONFLICT(user_id, target_user_id) DO UPDATE SET kind = excluded.kind"
  ).bind(uid, target, kind).run();
}

export async function report(db, uid, { targetType, targetId, reason }) {
  if (!TARGETS.has(targetType) || !targetId) throw new SafetyError("bad_target");
  const id = String(targetId).slice(0, 200);
  const dup = await db.prepare("SELECT id FROM content_reports WHERE reporter_id=?1 AND target_type=?2 AND target_id=?3 AND resolved=0").bind(uid, targetType, id).first();
  if (dup) return { duplicate: true };
  await db.prepare("INSERT INTO content_reports (reporter_id, target_type, target_id, reason) VALUES (?1,?2,?3,?4)").bind(uid, targetType, id, clip(reason, 500)).run();
  return { duplicate: false };
}

export async function getPrivacy(db, uid) {
  const r = await db.prepare("SELECT hide_activity, discoverable, bio FROM user_privacy WHERE user_id=?1").bind(uid).first();
  return { hideActivity: !!r?.hide_activity, discoverable: r ? !!r.discoverable : true, bio: r?.bio || "" };
}

export async function setPrivacy(db, uid, { hideActivity, discoverable, bio }) {
  await db.prepare(
    `INSERT INTO user_privacy (user_id, hide_activity, discoverable, bio) VALUES (?1, COALESCE(?2,0), COALESCE(?3,1), ?4)
     ON CONFLICT(user_id) DO UPDATE SET hide_activity = COALESCE(?2, hide_activity), discoverable = COALESCE(?3, discoverable),
       bio = COALESCE(?4, bio), updated_at = CURRENT_TIMESTAMP`
  ).bind(uid, hideActivity == null ? null : hideActivity ? 1 : 0, discoverable == null ? null : discoverable ? 1 : 0, bio == null ? null : clip(bio, 280) ?? "").run();
}

/** Has `owner` blocked `viewer`? (A blocked reader sees an ordinary "not found" for the owner's profile.) */
export async function isBlockedBy(db, ownerUid, viewerUid) {
  if (!viewerUid) return false;
  const r = await db.prepare("SELECT 1 AS x FROM user_blocks WHERE user_id=?1 AND target_user_id=?2 AND kind='block'").bind(ownerUid, viewerUid).first();
  return !!r;
}

/**
 * "Reading twins": readers who share the most books with you. One query, bounded by your 50 most
 * recent books and by LIMIT. Excludes yourself, anyone who hid their activity or opted out of
 * discovery, and anyone blocked in EITHER direction. Needs idx_shelf_book (migration 0001).
 */
export async function twinsByOverlap(db, uid, limit = 12) {
  const { results } = await db.prepare(
    `WITH mine AS (
       SELECT book_slug FROM shelf WHERE user_id = ?1 AND status IN ('read','reading') ORDER BY updated_at DESC LIMIT 50
     )
     SELECT s.user_id AS id, COUNT(*) AS shared
     FROM shelf s JOIN mine ON mine.book_slug = s.book_slug
     WHERE s.user_id != ?1 AND s.status IN ('read','reading')
       AND s.user_id NOT IN (SELECT user_id FROM user_privacy WHERE hide_activity = 1 OR discoverable = 0)
       AND s.user_id NOT IN (SELECT target_user_id FROM user_blocks WHERE user_id = ?1 AND kind = 'block')
       AND s.user_id NOT IN (SELECT user_id FROM user_blocks WHERE target_user_id = ?1 AND kind = 'block')
     GROUP BY s.user_id ORDER BY shared DESC, s.user_id LIMIT ?2`
  ).bind(uid, limit).all();
  return results;
}

/** Keep only ids that may be shown to `uid` as suggestions (not hidden/opted-out, no block either way). */
export async function filterDiscoverable(db, uid, ids) {
  const list = [...new Set(ids)].filter((x) => x && x !== uid).slice(0, 60);
  if (!list.length) return [];
  const ph = list.map((_, i) => `?${i + 2}`).join(",");
  const { results } = await db.prepare(
    `SELECT id FROM users u WHERE u.id IN (${ph})
       AND u.id NOT IN (SELECT user_id FROM user_privacy WHERE hide_activity = 1 OR discoverable = 0)
       AND u.id NOT IN (SELECT target_user_id FROM user_blocks WHERE user_id = ?1 AND kind = 'block')
       AND u.id NOT IN (SELECT user_id FROM user_blocks WHERE target_user_id = ?1 AND kind = 'block')`
  ).bind(uid, ...list).all();
  const allowed = new Set(results.map((r) => r.id));
  return list.filter((x) => allowed.has(x));
}

/** Names for the reader's blocked/muted list (so the settings page can show people, not ids). */
export async function listPeople(db, uid) {
  const { results } = await db.prepare(
    `SELECT b.target_user_id AS id, b.kind, u.name, u.slug FROM user_blocks b LEFT JOIN users u ON u.id = b.target_user_id
     WHERE b.user_id = ?1 ORDER BY b.created_at DESC LIMIT 200`
  ).bind(uid).all();
  return results.map((r) => ({ id: r.id, kind: r.kind, name: r.name || "Reader", slug: r.slug || r.id }));
}
