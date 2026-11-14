import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { getAchievements } from "@/lib/repo";

// GET /api/achievements — the signed-in reader's own achievement state.
// Subject comes from the bearer token, not a `?uid=` parameter; see
// src/lib/api-auth.js. (Public profiles render achievements server-side via
// getAchievements() directly, so they do not need this route.)
export async function GET(request) {
  const auth = await requireUser(request);
  if (auth.response) return auth.response;
  return NextResponse.json({ achievements: await getAchievements(auth.user.uid) });
}
