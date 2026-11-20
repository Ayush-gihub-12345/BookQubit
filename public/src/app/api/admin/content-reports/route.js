import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCf } from "@/lib/cf/env";
import { logError } from "@/lib/cf/logger";
import { invalidate } from "@/lib/db";
import { describeTargets, setHidden, MODERATED } from "@/lib/moderation";

// Reader reports about community content (chat messages, users, quotes, reviews, MindSpaces).
// Distinct from /api/admin/reports, which holds book-data corrections.
//   GET    ?page=1                       → { rows, total, pages } (open first, newest first)
//   PATCH  { id, resolved }              → mark resolved/unresolved
//   POST   { action: "remove", id }      → delete the reported chat message and resolve its reports
//   POST   { action: "hide"|"unhide", id } → hide / restore a reported reader list or review reply (kept, not deleted); hiding resolves its reports
const unauthorized = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });

async function db() {
  const { env } = await getCf();
  return env.DB || null;
}

export async function GET(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const d = await db();
  if (!d) return NextResponse.json({ rows: [], total: 0, pages: 1, unavailable: true });
  const page = Math.max(1, parseInt(new URL(request.url).searchParams.get("page")) || 1);
  const perPage = 20;
  try {
    const [count, rows] = await Promise.all([
      d.prepare("SELECT COUNT(*) n FROM content_reports").first(),
      d.prepare(
        `SELECT r.id, r.reporter_id, r.target_type, r.target_id, r.reason, r.resolved, r.created_at,
                (SELECT COUNT(*) FROM content_reports x WHERE x.target_type = r.target_type AND x.target_id = r.target_id) AS times_reported,
                p.body AS post_body, p.user_id AS post_user_id, u.name AS post_user_name
         FROM content_reports r
         LEFT JOIN discussion_posts p ON r.target_type = 'discussion_post' AND p.id = CAST(r.target_id AS INTEGER)
         LEFT JOIN users u ON u.id = p.user_id
         ORDER BY r.resolved ASC, r.created_at DESC LIMIT ?1 OFFSET ?2`
      ).bind(perPage, (page - 1) * perPage).all(),
    ]);
    // Lists and review replies live in the engagement database: describe the (at most 20) reported ones from there.
    let rowsOut = rows.results;
    const moderated = rowsOut.filter((r) => MODERATED.has(r.target_type)).map((r) => ({ kind: r.target_type, id: r.target_id }));
    if (moderated.length) {
      const { env } = await getCf();
      const info = env.ENGAGEMENT_DB ? await describeTargets(env.ENGAGEMENT_DB, moderated).catch(() => new Map()) : new Map();
      rowsOut = rowsOut.map((r) => (MODERATED.has(r.target_type) ? { ...r, content: info.get(`${r.target_type}:${r.target_id}`) || null } : r));
    }
    return NextResponse.json({ rows: rowsOut, total: count.n, page, pages: Math.max(1, Math.ceil(count.n / perPage)) });
  } catch (e) {
    logError("admin.contentReports", e); // table not migrated yet
    return NextResponse.json({ rows: [], total: 0, pages: 1, unavailable: true });
  }
}

export async function PATCH(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const d = await db();
  if (!d) return NextResponse.json({ error: "feature_unavailable" }, { status: 503 });
  const { id, resolved } = await request.json().catch(() => ({}));
  await d.prepare("UPDATE content_reports SET resolved = ?2 WHERE id = ?1").bind(id, resolved ? 1 : 0).run();
  return NextResponse.json({ ok: true });
}

export async function POST(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const d = await db();
  if (!d) return NextResponse.json({ error: "feature_unavailable" }, { status: 503 });
  const { action, id } = await request.json().catch(() => ({}));
  if (action === "hide" || action === "unhide") {
    const r = await d.prepare("SELECT target_type, target_id FROM content_reports WHERE id = ?1").bind(id).first();
    if (!r || !MODERATED.has(r.target_type)) return NextResponse.json({ error: "only lists and review replies can be hidden" }, { status: 400 });
    const { env } = await getCf();
    if (!env.ENGAGEMENT_DB) return NextResponse.json({ error: "feature_unavailable" }, { status: 503 });
    await setHidden(env.ENGAGEMENT_DB, r.target_type, r.target_id, action === "hide");
    if (r.target_type === "list") await invalidate(`list-page:${r.target_id}`).catch(() => {}); // index pages and book pages catch up within their 60 s TTL
    if (action === "hide") await d.prepare("UPDATE content_reports SET resolved = 1 WHERE target_type = ?1 AND target_id = ?2").bind(r.target_type, r.target_id).run();
    return NextResponse.json({ ok: true });
  }
  if (action !== "remove") return NextResponse.json({ error: "unknown action" }, { status: 400 });
  const r = await d.prepare("SELECT target_type, target_id FROM content_reports WHERE id = ?1").bind(id).first();
  if (!r || r.target_type !== "discussion_post") return NextResponse.json({ error: "only chat messages can be removed here" }, { status: 400 });
  await d.batch([
    d.prepare("DELETE FROM discussion_posts WHERE id = CAST(?1 AS INTEGER)").bind(r.target_id),
    d.prepare("UPDATE content_reports SET resolved = 1 WHERE target_type = 'discussion_post' AND target_id = ?1").bind(r.target_id),
  ]);
  return NextResponse.json({ ok: true });
}
