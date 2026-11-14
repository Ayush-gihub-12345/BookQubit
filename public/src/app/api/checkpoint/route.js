import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";
import { requireUser } from "@/lib/auth-request";
import { getCf } from "@/lib/cf/env";
import { logError } from "@/lib/cf/logger";

// Cross-device audio resume (stored in the `engagement` database).
// GET  /api/checkpoint?slug=...&kind=summary → { position, speed }   (the caller is taken from the Bearer token)
// POST /api/checkpoint { idToken, slug, kind, position, speed }
//   → buffered in the book's ReadingRoom Durable Object (flushed to D1 at most every 30 s)
//     when bound, otherwise written straight to D1. The client already debounces to ~30 s.
// With no engagement DB bound this quietly returns position 0 (local resume still works).
export async function GET(request) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ position: 0 });
  const uid = user.uid;
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const kind = searchParams.get("kind") || "summary";
  if (!uid || !slug) return NextResponse.json({ position: 0 });
  try {
    const { env } = await getCf();
    if (!env.ENGAGEMENT_DB) return NextResponse.json({ position: 0 });
    const row = await env.ENGAGEMENT_DB
      .prepare("SELECT position_seconds, speed FROM audio_checkpoints WHERE user_id=?1 AND book_slug=?2 AND kind=?3")
      .bind(uid, slug, kind).first();
    return NextResponse.json({ position: row?.position_seconds || 0, speed: row?.speed || null });
  } catch (e) {
    logError("checkpoint.get", e);
    return NextResponse.json({ position: 0 });
  }
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const user = await verifyUser(body.idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!body.slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const cp = {
    userId: user.uid,
    bookSlug: String(body.slug).slice(0, 300),
    kind: body.kind || "summary",
    position: Math.max(0, Number(body.position) || 0),
    speed: body.speed == null ? null : Number(body.speed),
  };

  const { env } = await getCf();
  if (!env.ENGAGEMENT_DB) return NextResponse.json({ ok: false, reason: "unavailable" }, { status: 202 });
  try {
    if (env.READING_ROOM_DO) {
      const stub = env.READING_ROOM_DO.get(env.READING_ROOM_DO.idFromName(cp.bookSlug));
      await stub.fetch("https://room/checkpoint", { method: "POST", body: JSON.stringify(cp) });
    } else {
      await env.ENGAGEMENT_DB
        .prepare(
          `INSERT INTO audio_checkpoints (user_id, book_slug, kind, position_seconds, speed, updated_at)
           VALUES (?1, ?2, ?3, ?4, ?5, CURRENT_TIMESTAMP)
           ON CONFLICT(user_id, book_slug, kind) DO UPDATE SET position_seconds=?4, speed=?5, updated_at=CURRENT_TIMESTAMP`
        )
        .bind(cp.userId, cp.bookSlug, cp.kind, cp.position, cp.speed).run();
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    logError("checkpoint.post", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
