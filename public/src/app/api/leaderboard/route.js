import { NextResponse } from "next/server";
import { getLeaderboard, getPopularReaders } from "@/lib/repo";

// GET /api/leaderboard[?year=2026&minBooks=100&genre=Fiction&mode=popular]
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  if (mode === "popular") {
    return NextResponse.json({ readers: await getPopularReaders(50) });
  }
  const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;
  const minBooks = searchParams.get("minBooks") || undefined;
  const genre = searchParams.get("genre") || undefined;
  return NextResponse.json({ readers: await getLeaderboard({ limit: 50, year, minBooks, genre }) });
}
