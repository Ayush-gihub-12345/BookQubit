import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getBooksBySlug } from "@/lib/repo";

export async function GET(request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
  const perPage = 20;

  const db = await getDb();
  const [count, rows] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS n FROM reports").first(),
    db.prepare(
      `SELECT * FROM reports ORDER BY resolved ASC, created_at DESC LIMIT ?1 OFFSET ?2`
    ).bind(perPage, (page - 1) * perPage).all(),
  ]);
  const books = await getBooksBySlug(rows.results.map((r) => r.book_slug), "en", "slug, title");
  const withTitles = rows.results.map((r) => ({ ...r, book_title: books.get(r.book_slug)?.title || null }));
  return NextResponse.json({ rows: withTitles, total: count.n, page, pages: Math.max(1, Math.ceil(count.n / perPage)) });
}

export async function PATCH(request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id, resolved } = await request.json();
  const db = await getDb();
  await db.prepare("UPDATE reports SET resolved=?1 WHERE id=?2").bind(resolved ? 1 : 0, id).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await request.json();
  const db = await getDb();
  await db.prepare("DELETE FROM reports WHERE id=?1").bind(id).run();
  return NextResponse.json({ ok: true });
}
