import { NextResponse } from "next/server";
import { getReaderNetwork } from "@/lib/repo";

// GET /api/network?uid=... — who a reader follows and who follows them
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });
  return NextResponse.json(await getReaderNetwork(uid));
}
