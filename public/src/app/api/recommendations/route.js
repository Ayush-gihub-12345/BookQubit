import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { getRecommendations } from "@/lib/repo";

// GET /api/recommendations?lang=en&limit=12 — real personalization computed
// server-side from the reader's actual shelf history + onboarding genre
// picks (see getRecommendations in repo.js), not a single random "seed" book
// against whatever page of the catalog happened to load client-side.
//
// Subject comes from the bearer token, not a `?uid=` parameter; see
// src/lib/api-auth.js. A reader's recommendation set reveals their shelf by
// implication, which is why db.js keeps these cache keys out of the public
// edge tier too.
export async function GET(request) {
  const auth = await requireUser(request);
  if (auth.response) return auth.response;
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "en";
  const limit = Math.min(Math.max(1, Number(searchParams.get("limit")) || 12), 30);
  return NextResponse.json(await getRecommendations(auth.user.uid, lang, limit));
}
