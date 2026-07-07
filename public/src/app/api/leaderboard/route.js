import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/repo";

export async function GET() {
  return NextResponse.json({ readers: await getLeaderboard() });
}
