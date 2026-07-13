import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyUser } from "@/lib/auth-server";
import { getDiscussionMessagesSince, addDiscussionPost, isActiveDiscussionMember } from "@/lib/repo";

// GET /api/discussions/[id]/messages?since=123 — polled by the open chat
// panel every few seconds; returns only messages newer than `since`.
export async function GET(request, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const since = Number(searchParams.get("since")) || 0;
  return NextResponse.json({ messages: await getDiscussionMessagesSince(id, since) });
}

// POST /api/discussions/[id]/messages — { idToken, body } — text only, no attachments
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

  if (!(await isActiveDiscussionMember(user.uid, id))) {
    return NextResponse.json({ error: "join this discussion to send messages" }, { status: 403 });
  }

  await addDiscussionPost(id, user.uid, text);
  return NextResponse.json({ ok: true });
}
