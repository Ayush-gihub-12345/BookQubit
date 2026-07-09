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
    db.prepare("SELECT COUNT(*) AS n FROM shelf WHERE review IS NOT NULL AND review != ''").first(),
    db.prepare(
      `SELECT s.user_id, s.book_slug, s.rating, s.review, s.spoiler, s.updated_at, u.name, b.title
       FROM shelf s JOIN users u ON u.id = s.user_id
       LEFT JOIN books b ON b.slug = s.book_slug AND b.lang='en'
       WHERE s.review IS NOT NULL AND s.review != ''
       ORDER BY s.updated_at DESC LIMIT ?1 OFFSET ?2`
    ).bind(perPage, (page - 1) * perPage).all(),
  ]);
  return NextResponse.json({ rows: rows.results, total: count.n, page, pages: Math.max(1, Math.ceil(count.n / perPage)) });
}

// DELETE — { userId, bookSlug } removes a review (clears the text, keeps the shelf entry)
export async function DELETE(request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { userId, bookSlug } = await request.json();
  const db = await getDb();
  await db.prepare("UPDATE shelf SET review = NULL WHERE user_id=?1 AND book_slug=?2").bind(userId, bookSlug).run();
  return NextResponse.json({ ok: true });
}
