import { NextResponse } from "next/server";
import { listDiscussions, createDiscussion } from "@/lib/repo";
import { getDb } from "@/lib/db";
import { verifyUser } from "@/lib/auth-server";

export async function GET() {
  return NextResponse.json({ discussions: await listDiscussions(50) });
}

// POST /api/discussions — { idToken, title, body, bookSlug? }
export async function POST(request) {
  const body = await request.json();
  const user = await verifyUser(body.idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const title = (body.title || "").trim();
  const text = (body.body || "").trim();
  if (!title || !text) return NextResponse.json({ error: "title and body required" }, { status: 400 });

  const db = await getDb();
  await db.prepare(
    "INSERT INTO users (id, name, photo_url) VALUES (?1, ?2, ?3) ON CONFLICT(id) DO UPDATE SET name=?2, photo_url=?3"
  ).bind(user.uid, user.name, user.photo).run();

  const id = await createDiscussion(user.uid, { title, body: text, bookSlug: body.bookSlug });
  return NextResponse.json({ ok: true, id });
}
