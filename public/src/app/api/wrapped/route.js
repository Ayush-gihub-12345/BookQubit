import { NextResponse } from "next/server";
import { getYearInBooks } from "@/lib/repo";

// GET /api/wrapped?uid=...&year=2026
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  const year = Number(searchParams.get("year")) || new Date().getFullYear();
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });
  return NextResponse.json(await getYearInBooks(uid, year));
}
