import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/api-auth";
import { searchDiscussions } from "@/lib/repo";

// GET /api/discussions/search?q=... — discovery list for the "join a
// discussion" search, annotated with the viewer's own membership state.
//
// The viewer is identified by the optional bearer token, not `?uid=`: a
// uid parameter let anyone ask "which discussions is reader X in" by
// reading the membership annotations. Anonymous callers still get the list,
// just without any membership flags.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const user = await getRequestUser(request).catch(() => null);
  return NextResponse.json({ discussions: await searchDiscussions(q, user?.uid || "") });
}
