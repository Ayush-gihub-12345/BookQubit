// MindSpace server logic. Every function takes the D1 binding (`db` = MINDSPACE_DB) so it can be
// unit-tested against real SQLite. All writes verify ownership with one indexed lookup; user input
// is only ever bound as a parameter. Errors are MsError(code, status) and map to HTTP in the routes.

export class MsError extends Error {
  constructor(code, status = 400) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

export const LIMITS = { spaces: 30, nodes: 500, edges: 1500, title: 200, body: 20000, description: 500 };
const KINDS = new Set(["note", "book", "quote", "link", "question", "audio"]);
const clip = (v, n) => (v == null ? null : String(v).trim().slice(0, n) || null);

/** http(s) only. Rejects javascript:, data:, file: etc. (we never fetch it server-side: no SSRF surface). */
export function safeUrl(u) {
  try {
    const url = new URL(String(u).trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString().slice(0, 2000) : null;
  } catch {
    return null;
  }
}

export function slugify(title) {
  const base = String(title || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "space";
}

const newId = () => crypto.randomUUID();

async function ownedSpace(db, spaceId, uid) {
  const s = await db.prepare("SELECT * FROM mindspace_spaces WHERE id=?1").bind(spaceId).first();
  if (!s) throw new MsError("not_found", 404);
  if (s.user_id !== uid) throw new MsError("forbidden", 403);
  return s;
}

export async function createSpace(db, user, { title, description, visibility }) {
  const t = clip(title, LIMITS.title);
  if (!t) throw new MsError("title_required");
  const { n } = await db.prepare("SELECT COUNT(*) n FROM mindspace_spaces WHERE user_id=?1").bind(user.uid).first();
  if (n >= LIMITS.spaces) throw new MsError("space_limit", 409);
  const id = newId();
  const slug = `${slugify(t)}-${id.slice(0, 6)}`;
  const vis = visibility === "public" ? "public" : "private";
  await db.prepare(
    "INSERT INTO mindspace_spaces (id, user_id, owner_name, title, slug, description, visibility) VALUES (?1,?2,?3,?4,?5,?6,?7)"
  ).bind(id, user.uid, clip(user.name, 80), t, slug, clip(description, LIMITS.description), vis).run();
  return { id, slug, title: t, visibility: vis, node_count: 0 };
}

export async function listSpaces(db, uid) {
  const { results } = await db.prepare(
    "SELECT id, slug, title, description, visibility, node_count, updated_at FROM mindspace_spaces WHERE user_id=?1 ORDER BY updated_at DESC LIMIT 100"
  ).bind(uid).all();
  return results;
}

/** Resolve by id OR slug. Returns { space, isOwner } for the owner or when public; otherwise null (never leak existence). */
export async function getSpace(db, idOrSlug, uid = null) {
  const s = await db.prepare("SELECT * FROM mindspace_spaces WHERE id=?1 OR slug=?1 LIMIT 1").bind(idOrSlug).first();
  if (!s) return null;
  const isOwner = !!uid && s.user_id === uid;
  if (!isOwner && s.visibility !== "public") return null;
  return { space: s, isOwner };
}

export async function getGraph(db, spaceId) {
  const [nodes, edges] = await Promise.all([
    db.prepare(
      "SELECT id, parent_id, kind, title, body, book_slug, url, meta, pos_x, pos_y FROM mindspace_nodes WHERE space_id=?1 ORDER BY created_at LIMIT ?2"
    ).bind(spaceId, LIMITS.nodes).all(),
    db.prepare("SELECT id, source_node_id, target_node_id, relation_type, weight FROM mindspace_edges WHERE space_id=?1 LIMIT ?2").bind(spaceId, LIMITS.edges).all(),
  ]);
  return { nodes: nodes.results, edges: edges.results };
}

export async function updateSpace(db, user, id, patch) {
  await ownedSpace(db, id, user.uid);
  const title = patch.title == null ? null : clip(patch.title, LIMITS.title);
  const vis = patch.visibility == null ? null : patch.visibility === "public" ? "public" : "private";
  await db.prepare(
    `UPDATE mindspace_spaces SET title = COALESCE(?2, title), description = COALESCE(?3, description),
       visibility = COALESCE(?4, visibility), updated_at = CURRENT_TIMESTAMP WHERE id=?1`
  ).bind(id, title, patch.description == null ? null : clip(patch.description, LIMITS.description) ?? "", vis).run();
}

export async function deleteSpace(db, user, id) {
  await ownedSpace(db, id, user.uid);
  await db.batch([
    db.prepare("DELETE FROM mindspace_edges WHERE space_id=?1").bind(id),
    db.prepare("DELETE FROM mindspace_nodes WHERE space_id=?1").bind(id),
    db.prepare("DELETE FROM mindspace_spaces WHERE id=?1").bind(id),
  ]);
}

function cleanNode(input) {
  const kind = KINDS.has(input.kind) ? input.kind : "note";
  const url = input.url ? safeUrl(input.url) : null;
  if (input.url && !url) throw new MsError("invalid_url");
  const node = {
    kind,
    title: clip(input.title, LIMITS.title),
    body: clip(input.body, LIMITS.body),
    book_slug: clip(input.bookSlug, 300),
    url,
    meta: input.meta ? JSON.stringify(input.meta).slice(0, 2000) : null,
  };
  if (kind === "book" && !node.book_slug) throw new MsError("book_required");
  if (kind === "link" && !node.url) throw new MsError("url_required");
  if (!node.title && !node.body && !node.book_slug && !node.url) throw new MsError("empty_node");
  return node;
}

export async function addNode(db, user, spaceId, input) {
  const space = await ownedSpace(db, spaceId, user.uid);
  if (space.node_count >= LIMITS.nodes) throw new MsError("node_limit", 409);
  const n = cleanNode(input);
  if (input.parentId) {
    const parent = await db.prepare("SELECT id FROM mindspace_nodes WHERE id=?1 AND space_id=?2").bind(input.parentId, spaceId).first();
    if (!parent) throw new MsError("bad_parent");
  }
  const id = newId();
  await db.batch([
    db.prepare(
      `INSERT INTO mindspace_nodes (id, space_id, parent_id, user_id, kind, title, body, book_slug, url, meta, pos_x, pos_y)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12)`
    ).bind(id, spaceId, input.parentId || null, user.uid, n.kind, n.title, n.body, n.book_slug, n.url, n.meta,
      Number.isFinite(input.x) ? input.x : null, Number.isFinite(input.y) ? input.y : null),
    db.prepare("UPDATE mindspace_spaces SET node_count = node_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id=?1").bind(spaceId),
  ]);
  return { id, ...n, parent_id: input.parentId || null };
}

export async function updateNode(db, user, spaceId, nodeId, patch) {
  await ownedSpace(db, spaceId, user.uid);
  const title = patch.title === undefined ? null : clip(patch.title, LIMITS.title) ?? "";
  const body = patch.body === undefined ? null : clip(patch.body, LIMITS.body) ?? "";
  const url = patch.url ? safeUrl(patch.url) : null;
  if (patch.url && !url) throw new MsError("invalid_url");
  const r = await db.prepare(
    `UPDATE mindspace_nodes SET title = COALESCE(?3, title), body = COALESCE(?4, body), url = COALESCE(?5, url),
       pos_x = COALESCE(?6, pos_x), pos_y = COALESCE(?7, pos_y), updated_at = CURRENT_TIMESTAMP
     WHERE id=?1 AND space_id=?2`
  ).bind(nodeId, spaceId, title, body, url, Number.isFinite(patch.x) ? patch.x : null, Number.isFinite(patch.y) ? patch.y : null).run();
  if (r.meta && r.meta.changes === 0) throw new MsError("not_found", 404);
}

export async function deleteNode(db, user, spaceId, nodeId) {
  await ownedSpace(db, spaceId, user.uid);
  const found = await db.prepare("SELECT id FROM mindspace_nodes WHERE id=?1 AND space_id=?2").bind(nodeId, spaceId).first();
  if (!found) throw new MsError("not_found", 404);
  await db.batch([
    db.prepare("DELETE FROM mindspace_edges WHERE space_id=?1 AND (source_node_id=?2 OR target_node_id=?2)").bind(spaceId, nodeId),
    db.prepare("UPDATE mindspace_nodes SET parent_id = NULL WHERE space_id=?1 AND parent_id=?2").bind(spaceId, nodeId), // children survive
    db.prepare("DELETE FROM mindspace_nodes WHERE id=?1 AND space_id=?2").bind(nodeId, spaceId),
    db.prepare("UPDATE mindspace_spaces SET node_count = MAX(0, node_count - 1), updated_at = CURRENT_TIMESTAMP WHERE id=?1").bind(spaceId),
  ]);
}

export async function addEdge(db, user, spaceId, { source, target, relation, weight }) {
  await ownedSpace(db, spaceId, user.uid);
  if (!source || !target || source === target) throw new MsError("bad_edge");
  const { n } = await db.prepare("SELECT COUNT(*) n FROM mindspace_edges WHERE space_id=?1").bind(spaceId).first();
  if (n >= LIMITS.edges) throw new MsError("edge_limit", 409);
  const ends = await db.prepare("SELECT COUNT(*) n FROM mindspace_nodes WHERE space_id=?1 AND id IN (?2, ?3)").bind(spaceId, source, target).first();
  if (ends.n !== 2) throw new MsError("bad_edge"); // both nodes must belong to THIS space
  await db.prepare(
    `INSERT INTO mindspace_edges (space_id, source_node_id, target_node_id, relation_type, weight) VALUES (?1,?2,?3,?4,?5)
     ON CONFLICT(source_node_id, target_node_id, relation_type) DO UPDATE SET weight = excluded.weight`
  ).bind(spaceId, source, target, clip(relation, 40) || "related", Math.min(10, Math.max(0.1, Number(weight) || 1))).run();
}

export async function deleteEdge(db, user, spaceId, edgeId) {
  await ownedSpace(db, spaceId, user.uid);
  await db.prepare("DELETE FROM mindspace_edges WHERE id=?1 AND space_id=?2").bind(edgeId, spaceId).run();
}

/** One-tap "Save to MindSpace": add a node to an existing space, or create the space first. */
export async function saveToSpace(db, user, { spaceId, newSpaceTitle, node }) {
  let id = spaceId;
  if (!id) {
    if (!newSpaceTitle) throw new MsError("space_required");
    id = (await createSpace(db, user, { title: newSpaceTitle, visibility: "private" })).id;
  }
  const saved = await addNode(db, user, id, node);
  return { spaceId: id, node: saved };
}
