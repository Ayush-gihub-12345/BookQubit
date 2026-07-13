import { NextResponse } from "next/server";
import { searchDiscussions } from "@/lib/repo";

// GET /api/discussions/search?q=...&uid=... — discovery list for the "join a
// discussion" search, annotated with the viewer's own membership state.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const uid = searchParams.get("uid") || "";
  return NextResponse.json({ discussions: await searchDiscussions(q, uid) });
}
