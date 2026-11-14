import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { getMyDiscussions } from "@/lib/repo";

// GET /api/discussions/mine — the signed-in reader's chat list (left panel).
// Subject comes from the bearer token, not a `?uid=` parameter; see
// src/lib/api-auth.js. This leaked which discussions a reader belongs to,
// plus their unread counts, to anyone holding a UID.
export async function GET(request) {
  const auth = await requireUser(request);
  if (auth.response) return auth.response;
  return NextResponse.json({ discussions: await getMyDiscussions(auth.user.uid) });
}
