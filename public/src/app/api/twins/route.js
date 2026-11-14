import { NextResponse } from "next/server";
import { requireUser, unauthorized } from "@/lib/auth-request";
import { getCf } from "@/lib/cf/env";
import { logError } from "@/lib/cf/logger";
import { queryVectors, rrf } from "@/lib/cf/vectorize";
import { twinsByOverlap, filterDiscoverable } from "@/lib/safety";

// GET /api/twins → readers with a similar taste: shared-book overlap (SQL) fused with taste-vector
// similarity (Vectorize, when bound) by rank fusion. Both paths exclude hidden / opted-out readers
// and anyone blocked in either direction. Result is private to the signed-in reader.
export async function GET(request) {
  const user = await requireUser(request);
  if (!user) return unauthorized();
  const { env } = await getCf();
  if (!env.DB) return NextResponse.json({ error: "feature_unavailable" }, { status: 503 });
  try {
    const overlap = await twinsByOverlap(env.DB, user.uid, 20);
    const shared = new Map(overlap.map((r) => [r.id, r.shared]));

    // Taste vector of this reader (stored by the recompute job) → nearest other readers.
    let semantic = [];
    if (env.BOOK_VECTORS) {
      try {
        const [mine] = (await env.BOOK_VECTORS.getByIds([`user:${user.uid}`])) || [];
        if (mine?.values) semantic = (await queryVectors(env, mine.values, { topK: 20, type: "user" })).map((m) => m.metadata?.uid).filter(Boolean);
      } catch (e) { logError("twins.vector", e); }
    }
    const allowedSemantic = await filterDiscoverable(env.DB, user.uid, semantic);
    const ids = rrf([overlap.map((r) => r.id), allowedSemantic]).slice(0, 12);
    if (!ids.length) return NextResponse.json({ twins: [] });

    const { results } = await env.DB.prepare(
      `SELECT id, name, photo_url, slug FROM users WHERE id IN (${ids.map((_, i) => `?${i + 1}`).join(",")})`
    ).bind(...ids).all();
    const byId = new Map(results.map((u) => [u.id, u]));
    return NextResponse.json({
      twins: ids.map((id) => byId.get(id)).filter(Boolean).map((u) => ({ name: u.name, photo_url: u.photo_url, slug: u.slug || u.id, sharedBooks: shared.get(u.id) || 0 })),
    }, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (e) {
    logError("twins", e);
    return NextResponse.json({ twins: [] });
  }
}
