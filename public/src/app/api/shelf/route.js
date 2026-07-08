import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyUser } from "@/lib/auth-server";

// GET /api/shelf?uid=...[&slug=...] — a user's shelf (joined with book info)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  const slug = searchParams.get("slug");
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });

  const db = await getDb();
  if (slug) {
    const row = await db
      .prepare("SELECT * FROM shelf WHERE user_id=?1 AND book_slug=?2")
      .bind(uid, slug).first();
    return NextResponse.json({ entry: row || null });
  }

  const { results } = await db
    .prepare(
      `SELECT s.*, b.title, b.author, b.cover_url, b.rating AS book_rating, b.page_count
       FROM shelf s LEFT JOIN books b ON b.slug = s.book_slug AND b.lang='en'
       WHERE s.user_id=?1 ORDER BY s.updated_at DESC`
    )
    .bind(uid).all();
  return NextResponse.json({ shelf: results });
}

// POST /api/shelf — upsert { idToken, slug, status?, rating?, review?, progress? }
export async function POST(request) {
  const body = await request.json();
  const user = await verifyUser(body.idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!body.slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const db = await getDb();
  await db.batch([
    db.prepare(
      `INSERT INTO users (id, name, photo_url) VALUES (?1, ?2, ?3)
       ON CONFLICT(id) DO UPDATE SET name=?2, photo_url=?3`
    ).bind(user.uid, user.name, user.photo),
    db.prepare(
      `INSERT INTO shelf (user_id, book_slug, status, rating, review, progress, moods, pace, spoiler, started_at, finished_at, updated_at)
       VALUES (?1, ?2, COALESCE(?3,'want'), ?4, ?5, COALESCE(?6,0), ?7, ?8, COALESCE(?11,0), ?9, ?10, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, book_slug) DO UPDATE SET
         status=COALESCE(?3, status), rating=COALESCE(?4, rating),
         review=COALESCE(?5, review), progress=COALESCE(?6, progress),
         moods=COALESCE(?7, moods), pace=COALESCE(?8, pace),
         spoiler=COALESCE(?11, spoiler),
         started_at=COALESCE(started_at, ?9), finished_at=COALESCE(finished_at, ?10),
         updated_at=CURRENT_TIMESTAMP`
    ).bind(
      user.uid, body.slug, body.status ?? null, body.rating ?? null,
      body.review ?? null, body.progress ?? null,
      body.moods ? JSON.stringify(body.moods) : null, body.pace ?? null,
      ["reading", "read"].includes(body.status) ? new Date().toISOString() : null,
      body.status === "read" ? new Date().toISOString() : null,
      body.spoiler === undefined ? null : body.spoiler ? 1 : 0,
    ),
  ]);
  return NextResponse.json({ ok: true });
}

// DELETE /api/shelf — { idToken, slug }
export async function DELETE(request) {
  const body = await request.json();
  const user = await verifyUser(body.idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = await getDb();
  await db.prepare("DELETE FROM shelf WHERE user_id=?1 AND book_slug=?2")
    .bind(user.uid, body.slug).run();
  return NextResponse.json({ ok: true });
}
