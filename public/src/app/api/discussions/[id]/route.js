import { NextResponse } from "next/server";
import { getDiscussion, addDiscussionPost } from "@/lib/repo";
import { getDb } from "@/lib/db";
import { verifyUser } from "@/lib/auth-server";

export async function GET(request, { params }) {
  const { id } = await params;
  const thread = await getDiscussion(id);
  if (!thread) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(thread);
}

// POST /api/discussions/[id] — { idToken, body } add a reply
export async function POST(request, { params }) {
  const { id } = await params;
  const payload = await request.json();
  const user = await verifyUser(payload.idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const text = (payload.body || "").trim();
  if (!text) return NextResponse.json({ error: "body required" }, { status: 400 });

  const db = await getDb();
  await db.prepare(
    "INSERT INTO users (id, name, photo_url) VALUES (?1, ?2, ?3) ON CONFLICT(id) DO UPDATE SET name=?2, photo_url=?3"
  ).bind(user.uid, user.name, user.photo).run();

  await addDiscussionPost(id, user.uid, text);
  return NextResponse.json({ ok: true });
}
