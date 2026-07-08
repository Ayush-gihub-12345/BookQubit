import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyUser } from "@/lib/auth-server";

// GET /api/goal?uid=...
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });
  const year = new Date().getFullYear();
  const db = await getDb();
  const [goal, done, days] = await Promise.all([
    db.prepare("SELECT target FROM goals WHERE user_id=?1 AND year=?2").bind(uid, year).first(),
    db.prepare(
      "SELECT COUNT(*) AS n FROM shelf WHERE user_id=?1 AND status='read' AND substr(COALESCE(finished_at, updated_at),1,4)=?2"
    ).bind(uid, String(year)).first(),
    db.prepare(
      "SELECT DISTINCT substr(updated_at,1,10) AS d FROM shelf WHERE user_id=?1 ORDER BY d DESC LIMIT 90"
    ).bind(uid).all(),
  ]);

  // Consecutive-day activity streak ending today or yesterday
  let streak = 0;
  const dates = new Set(days.results.map((r) => r.d));
  const cursor = new Date();
  if (!dates.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return NextResponse.json({ year, target: goal?.target || null, done: done?.n || 0, streak });
}

// POST /api/goal — { idToken, target }
export async function POST(request) {
  const body = await request.json();
  const user = await verifyUser(body.idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const target = Math.max(1, Math.min(1000, Number(body.target) || 12));
  const db = await getDb();
  await db.prepare(
    `INSERT INTO goals (user_id, year, target) VALUES (?1, ?2, ?3)
     ON CONFLICT(user_id, year) DO UPDATE SET target=?3`
  ).bind(user.uid, new Date().getFullYear(), target).run();
  return NextResponse.json({ ok: true, target });
}
