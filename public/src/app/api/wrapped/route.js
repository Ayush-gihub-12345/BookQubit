import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { getYearInBooks } from "@/lib/repo";

// GET /api/wrapped?year=2026 — the signed-in reader's own year in books.
// Subject comes from the bearer token, not a `?uid=` parameter; see
// src/lib/api-auth.js.
export async function GET(request) {
  const auth = await requireUser(request);
  if (auth.response) return auth.response;
  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year")) || new Date().getFullYear();
  return NextResponse.json(await getYearInBooks(auth.user.uid, year));
}
