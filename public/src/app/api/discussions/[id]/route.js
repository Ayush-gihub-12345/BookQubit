import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/api-auth";
import { getDiscussion, isActiveDiscussionMember } from "@/lib/repo";

// GET /api/discussions/[id] — a discussion's header (always) and its
// messages (active members only).
//
// The header is public on purpose: the community page lists every
// discussion so readers can find one to join. The messages are not — posting
// already requires `isActiveDiscussionMember`, and discussion ids are
// sequential integers, so with reads open anyone could walk /1, /2, /3… and
// download every conversation.
//
// The caller is identified by the optional bearer token, never by `?uid=`
// (UIDs are public; see src/lib/api-auth.js). No token, an invalid token, or
// a Google-side verification failure all degrade to "anonymous": the header
// still loads, and `membership` is null so the UI shows its join prompt.
export async function GET(request, { params }) {
  const { id } = await params;
  const user = await getRequestUser(request).catch(() => null);
  const isMember = user ? await isActiveDiscussionMember(user.uid, id) : false;
  const thread = await getDiscussion(id, user?.uid, { includePosts: isMember });
  if (!thread) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(thread);
}
