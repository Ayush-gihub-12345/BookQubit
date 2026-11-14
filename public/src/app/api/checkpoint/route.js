import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyUser } from "@/lib/auth-server";
import { getCf } from "@/lib/cf/env";
import { logError } from "@/lib/cf/logger";

// Cross-device audio resume.
// GET  /api/checkpoint?uid=...&slug=...&kind=summary → { position, speed } | { position: 0 }
// POST /api/checkpoint { idToken, slug, kind, position, speed }
//   → buffered in the book's ReadingRoom Durable Object (flushed to D1 every 30s) when
//     bound, otherwise written straight to D1. The client already debounces to ~30s.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  const slug = searchParams.get("slug");
  const kind = searchParams.get("kind") || "summary";
  if (!uid || !slug) return NextResponse.json({ position: 0 });
  try {
    const db = await getDb();
    const row = await db
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
    bookSlug: String(body.slug),
    kind: body.kind || "summary",
    position: Math.max(0, Number(body.position) || 0),
    speed: body.speed == null ? null : Number(body.speed),
  };

  const { env } = await getCf();
  try {
    if (env.READING_ROOM_DO) {
      const stub = env.READING_ROOM_DO.get(env.READING_ROOM_DO.idFromName(cp.bookSlug));
      await stub.fetch("https://room/checkpoint", { method: "POST", body: JSON.stringify(cp) });
    } else {
      const db = await getDb();
      await db
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
