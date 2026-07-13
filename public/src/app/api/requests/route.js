import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyUser } from "@/lib/auth-server";
import { upsertUser } from "@/lib/repo";

// GET /api/requests?uid=... — a reader's own submitted requests, so they can
// see what's still pending vs. added/declined.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });
  const db = await getDb();
  const { results } = await db.prepare(
    "SELECT * FROM book_requests WHERE user_id=?1 ORDER BY created_at DESC"
  ).bind(uid).all();
  return NextResponse.json({ requests: results });
}

// POST /api/requests — { idToken, title, author?, note? }
export async function POST(request) {
  const body = await request.json();
  const user = await verifyUser(body.idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const title = (body.title || "").trim();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

  await upsertUser(user.uid, user.name, user.photo);
  const db = await getDb();
  await db.prepare(
    "INSERT INTO book_requests (user_id, title, author, note) VALUES (?1, ?2, ?3, ?4)"
  ).bind(user.uid, title, (body.author || "").trim() || null, (body.note || "").trim() || null).run();
  return NextResponse.json({ ok: true });
}
