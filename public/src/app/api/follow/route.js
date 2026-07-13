import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyUser } from "@/lib/auth-server";
import { upsertUser } from "@/lib/repo";

// GET /api/follow?type=author&id=yuval-noah-harari[&uid=...]
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const uid = searchParams.get("uid");
  if (!type || !id) return NextResponse.json({ error: "type and id required" }, { status: 400 });

  const db = await getDb();
  const [count, mine] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS n FROM follows WHERE target_type=?1 AND target_id=?2").bind(type, id).first(),
    uid
      ? db.prepare("SELECT 1 AS f FROM follows WHERE user_id=?1 AND target_type=?2 AND target_id=?3").bind(uid, type, id).first()
      : null,
  ]);
  return NextResponse.json({ count: count?.n || 0, following: Boolean(mine) });
}

// POST /api/follow — { idToken, type, id, follow: true|false }
export async function POST(request) {
  const body = await request.json();
  const user = await verifyUser(body.idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!body.type || !body.id) return NextResponse.json({ error: "type and id required" }, { status: 400 });

  await upsertUser(user.uid, user.name, user.photo);
  const db = await getDb();

  if (body.follow === false) {
    await db.prepare("DELETE FROM follows WHERE user_id=?1 AND target_type=?2 AND target_id=?3")
      .bind(user.uid, body.type, body.id).run();
  } else {
    await db.prepare("INSERT OR IGNORE INTO follows (user_id, target_type, target_id) VALUES (?1, ?2, ?3)")
      .bind(user.uid, body.type, body.id).run();
  }
  return NextResponse.json({ ok: true });
}
