import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyUser } from "@/lib/auth-server";
import { requireUser } from "@/lib/api-auth";
import { upsertUser } from "@/lib/repo";

// GET /api/requests — the signed-in reader's own submitted requests, so they
// can see what's still pending vs. added/declined. Subject comes from the
// bearer token, not a `?uid=` parameter; see src/lib/api-auth.js.
export async function GET(request) {
  const auth = await requireUser(request);
  if (auth.response) return auth.response;
  const db = await getDb();
  const { results } = await db.prepare(
    "SELECT * FROM book_requests WHERE user_id=?1 ORDER BY created_at DESC"
  ).bind(auth.user.uid).all();
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
