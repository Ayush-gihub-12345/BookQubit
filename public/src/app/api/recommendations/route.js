import { NextResponse } from "next/server";
import { getRecommendations } from "@/lib/repo";

// GET /api/recommendations?uid=...&lang=en&limit=12 — real personalization
// computed server-side from a reader's actual shelf history + onboarding
// genre picks (see getRecommendations in repo.js), not a single random
// "seed" book against whatever page of the catalog happened to load client-side.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });
  const lang = searchParams.get("lang") || "en";
  const limit = Math.min(Math.max(1, Number(searchParams.get("limit")) || 12), 30);
  const result = await getRecommendations(uid, lang, limit);
  return NextResponse.json(result);
}
