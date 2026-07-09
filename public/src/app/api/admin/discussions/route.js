import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
  const perPage = 20;

  const db = await getDb();
  const [count, rows] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS n FROM discussions").first(),
    db.prepare(
      `SELECT d.*, u.name, (SELECT COUNT(*) FROM discussion_posts p WHERE p.discussion_id=d.id) AS replies
       FROM discussions d JOIN users u ON u.id=d.user_id
       ORDER BY d.created_at DESC LIMIT ?1 OFFSET ?2`
    ).bind(perPage, (page - 1) * perPage).all(),
  ]);
  return NextResponse.json({ rows: rows.results, total: count.n, page, pages: Math.max(1, Math.ceil(count.n / perPage)) });
}

export async function DELETE(request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await request.json();
  const db = await getDb();
  await db.batch([
    db.prepare("DELETE FROM discussion_posts WHERE discussion_id=?1").bind(id),
    db.prepare("DELETE FROM discussions WHERE id=?1").bind(id),
  ]);
  return NextResponse.json({ ok: true });
}
