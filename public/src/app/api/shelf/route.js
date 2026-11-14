import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyUser } from "@/lib/auth-server";
import { requireUser } from "@/lib/api-auth";
import { upsertUser, getBooksBySlug } from "@/lib/repo";

// GET /api/shelf[?slug=...] — the signed-in reader's own shelf, joined with
// book info. With `slug`, just that one entry.
//
// Subject comes from the bearer token, never a `?uid=` parameter. This was
// the most sensitive of the uid-addressed endpoints: a shelf row carries the
// reader's rating, their review text (including drafts never meant to be
// public), reading progress, mood/pace tags and the spoiler flag.
// src/lib/db.js already refuses to put `shelf:` cache keys in the public
// edge tier for this reason; the route now matches that stance.
//
// Public reader profiles do not use this route — readers/[id]/page.jsx reads
// what it displays through repo.js on the server.
export async function GET(request) {
  const auth = await requireUser(request);
  if (auth.response) return auth.response;
  const uid = auth.user.uid;
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  const db = await getDb();
  if (slug) {
    const row = await db
      .prepare("SELECT * FROM shelf WHERE user_id=?1 AND book_slug=?2")
      .bind(uid, slug).first();
    return NextResponse.json({ entry: row || null });
  }

  const { results } = await db
    .prepare(`SELECT * FROM shelf WHERE user_id=?1 ORDER BY updated_at DESC`)
    .bind(uid).all();

  const bookInfo = await getBooksBySlug(results.map((r) => r.book_slug), "en", "slug, title, author, cover_url, rating, page_count, category");
  const shelf = results.map((r) => {
    const b = bookInfo.get(r.book_slug);
    return { ...r, title: b?.title, author: b?.author, cover_url: b?.cover_url, book_rating: b?.rating, page_count: b?.page_count, category: b?.category };
  });
  return NextResponse.json({ shelf });
}

// POST /api/shelf — upsert { idToken, slug, status?, rating?, review?, progress? }
export async function POST(request) {
  const body = await request.json();
  const user = await verifyUser(body.idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!body.slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  await upsertUser(user.uid, user.name, user.photo);
  const db = await getDb();
  await db.batch([
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
