import { NextResponse } from "next/server";
import { requireUser, unauthorized } from "@/lib/auth-request";
import { getCf } from "@/lib/cf/env";
import { logError } from "@/lib/cf/logger";
import { getBook, getSimilarBooks } from "@/lib/repo";

// GET /api/recommendations/because?lang=en — "Because you liked X".
// The seed is the reader's most recent book they rated 4+ (or, failing that, their latest finished book); the picks are
// that book's tag-weighted similar books minus anything already on their shelf. Cost: one indexed shelf read, then the
// cached similar-books lookup (shared by every reader of that book), so it stays cheap at any catalog size.
export async function GET(request) {
  const user = await requireUser(request);
  if (!user) return unauthorized();
  const lang = new URL(request.url).searchParams.get("lang") || "en";
  try {
    const { env } = await getCf();
    if (!env.DB) return NextResponse.json({ picks: [] });
    const [{ results: liked }, { results: onShelf }] = await Promise.all([
      env.DB.prepare(
        `SELECT book_slug FROM shelf WHERE user_id = ?1 AND (rating >= 4 OR status = 'read')
         ORDER BY (rating >= 4) DESC, COALESCE(finished_at, updated_at) DESC LIMIT 1`).bind(user.uid).all(),
      env.DB.prepare("SELECT book_slug FROM shelf WHERE user_id = ?1 LIMIT 500").bind(user.uid).all(),
    ]);
    const seedSlug = liked[0]?.book_slug;
    const seed = seedSlug ? await getBook(seedSlug, lang) : null;
    if (!seed) return NextResponse.json({ picks: [] });
    const have = new Set(onShelf.map((r) => r.book_slug));
    const picks = (await getSimilarBooks(seed, lang, 16)).filter((b) => !have.has(b.slug)).slice(0, 12);
    return NextResponse.json(
      { seed: { slug: seed.slug, title: seed.title }, picks },
      { headers: { "Cache-Control": "private, max-age=300" } },
    );
  } catch (e) {
    logError("recommendations.because", e);
    return NextResponse.json({ picks: [] });
  }
}
