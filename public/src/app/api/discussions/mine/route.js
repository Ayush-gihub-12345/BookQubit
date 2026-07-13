import { NextResponse } from "next/server";
import { getMyDiscussions } from "@/lib/repo";

// GET /api/discussions/mine?uid=... — the reader's chat list (left panel)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });
  return NextResponse.json({ discussions: await getMyDiscussions(uid) });
}
