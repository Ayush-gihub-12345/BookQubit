import { NextResponse } from "next/server";
import { listDiscussions, createDiscussion } from "@/lib/repo";
import { getDb } from "@/lib/db";
import { verifyUser } from "@/lib/auth-server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || undefined;
  return NextResponse.json({ discussions: await listDiscussions(50, { q }) });
}

// POST /api/discussions — { idToken, title, body, bookSlug?, authorSlug?, tags? }
// Requires a book OR an author to be picked first; no attachments supported.
export async function POST(request) {
  const body = await request.json();
  const user = await verifyUser(body.idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const title = (body.title || "").trim();
  const text = (body.body || "").trim();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  if (!body.bookSlug && !body.authorSlug) {
    return NextResponse.json({ error: "pick a book or author to start a discussion" }, { status: 400 });
  }

  const db = await getDb();
  await db.prepare(
    "INSERT INTO users (id, name, photo_url) VALUES (?1, ?2, ?3) ON CONFLICT(id) DO UPDATE SET name=?2, photo_url=?3"
  ).bind(user.uid, user.name, user.photo).run();

  const tags = Array.isArray(body.tags) ? body.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 8) : [];
  const id = await createDiscussion(user.uid, {
    title, body: text, bookSlug: body.bookSlug, authorSlug: body.authorSlug, tags,
  });
  return NextResponse.json({ ok: true, id });
}
