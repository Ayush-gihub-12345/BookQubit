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
    db.prepare("SELECT COUNT(*) AS n FROM book_requests").first(),
    db.prepare(
      `SELECT r.*, u.name AS user_name FROM book_requests r LEFT JOIN users u ON u.id = r.user_id
       ORDER BY (r.status = 'pending') DESC, r.created_at DESC LIMIT ?1 OFFSET ?2`
    ).bind(perPage, (page - 1) * perPage).all(),
  ]);
  return NextResponse.json({ rows: rows.results, total: count.n, page, pages: Math.max(1, Math.ceil(count.n / perPage)) });
}

export async function PATCH(request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id, status } = await request.json();
  if (!["pending", "added", "declined"].includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }
  const db = await getDb();
  await db.prepare("UPDATE book_requests SET status=?1 WHERE id=?2").bind(status, id).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await request.json();
  const db = await getDb();
  await db.prepare("DELETE FROM book_requests WHERE id=?1").bind(id).run();
  return NextResponse.json({ ok: true });
}
