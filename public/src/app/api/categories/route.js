import { NextResponse } from "next/server";
import { facets } from "@/lib/repo";

// GET /api/categories — canonical (English) category names, used wherever a
// client component needs the genre list (onboarding, preference editor).
// Deliberately always English — categories are filter/URL keys, never translated.
export async function GET() {
  const f = await facets("en");
  return NextResponse.json({ categories: f.categories });
}
