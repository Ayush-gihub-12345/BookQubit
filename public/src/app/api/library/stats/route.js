import { NextResponse } from "next/server";
import { requireUser, unauthorized } from "@/lib/auth-request";
import { getCf } from "@/lib/cf/env";
import { logError } from "@/lib/cf/logger";
import { buildStats } from "@/lib/library-server";
import { getBooksBySlug } from "@/lib/repo";

// GET /api/library/stats?year=2025 — private to the signed-in reader.
export async function GET(request) {
  const user = await requireUser(request);
  if (!user) return unauthorized();
  const year = Number(new URL(request.url).searchParams.get("year")) || new Date().getUTCFullYear();
  const { env } = await getCf();
  try {
    const stats = await buildStats(env, user.uid, {
      year,
      loadBooks: (slugs) => getBooksBySlug(slugs, "en", "slug, category, lang, page_count"),
    });
    return NextResponse.json(stats, { headers: { "Cache-Control": "private, max-age=60" } });
  } catch (e) {
    logError("library.stats", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
