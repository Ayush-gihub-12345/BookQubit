import { NextResponse } from "next/server";
import { getBook } from "@/lib/repo";
import { getCf } from "@/lib/cf/env";
import { resolveSummary } from "@/lib/summary";

// GET /api/summary?slug=...&lang=en&intent=general
// Returns { intent, source, audioUrl, unavailable?, summary: { thesis, takeaways[], quotes[], script } }
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const lang = searchParams.get("lang") || "en";
  const intent = searchParams.get("intent") || "general";
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const book = await getBook(slug, lang);
  if (!book) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { env } = await getCf();
  const clientId = request.headers.get("cf-connecting-ip") || "anon";
  const out = await resolveSummary(env, book, lang, intent, { clientId });
  return NextResponse.json({ intent, ...out }, { headers: { "Cache-Control": "public, max-age=60" } });
}
