import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";
import { requireUser } from "@/lib/api-auth";
import { getDiscussionMessagesSince, addDiscussionPost, isActiveDiscussionMember, upsertUser } from "@/lib/repo";

// GET /api/discussions/[id]/messages?since=123 — polled by the open chat
// panel every few seconds; returns only messages newer than `since`.
//
// Active members only, matching the POST below. This used to take no
// credentials at all, and discussion ids are sequential integers, so every
// conversation on the site was downloadable by looping over ids. 401 when
// there is no usable credential, 403 for a signed-in non-member.
export async function GET(request, { params }) {
  const { id } = await params;
  const auth = await requireUser(request);
  if (auth.response) return auth.response;
  if (!(await isActiveDiscussionMember(auth.user.uid, id))) {
    return NextResponse.json({ error: "join this discussion to read messages" }, { status: 403 });
  }
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

  await upsertUser(user.uid, user.name, user.photo);

  if (!(await isActiveDiscussionMember(user.uid, id))) {
    return NextResponse.json({ error: "join this discussion to send messages" }, { status: 403 });
  }

  await addDiscussionPost(id, user.uid, text);
  return NextResponse.json({ ok: true });
}
