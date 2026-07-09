import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
  const perPage = 20;

  const db = await getDb();
  const where = q ? "WHERE u.name LIKE ?1" : "";
  const binds = q ? [`%${q}%`] : [];

  const [count, rows] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS n FROM users u ${where}`).bind(...binds).first(),
    db.prepare(
      `SELECT u.*, (SELECT COUNT(*) FROM shelf s WHERE s.user_id=u.id) AS shelf_count
       FROM users u ${where} ORDER BY u.created_at DESC LIMIT ?${binds.length + 1} OFFSET ?${binds.length + 2}`
    ).bind(...binds, perPage, (page - 1) * perPage).all(),
  ]);
  return NextResponse.json({ rows: rows.results, total: count.n, page, pages: Math.max(1, Math.ceil(count.n / perPage)) });
}

export async function DELETE(request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await request.json();
  const db = await getDb();
  await db.batch([
    db.prepare("DELETE FROM shelf WHERE user_id=?1").bind(id),
    db.prepare("DELETE FROM follows WHERE user_id=?1").bind(id),
    db.prepare("DELETE FROM discussions WHERE user_id=?1").bind(id),
    db.prepare("DELETE FROM discussion_posts WHERE user_id=?1").bind(id),
    db.prepare("DELETE FROM users WHERE id=?1").bind(id),
  ]);
  return NextResponse.json({ ok: true });
}
