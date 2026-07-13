import { NextResponse } from "next/server";
import { getAchievements } from "@/lib/repo";

// GET /api/achievements?uid=...
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });
  return NextResponse.json({ achievements: await getAchievements(uid) });
}
