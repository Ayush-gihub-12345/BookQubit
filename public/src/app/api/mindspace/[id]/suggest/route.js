import { NextResponse } from "next/server";
import { withMindspace, readJson } from "@/lib/mindspace-route";
import { getSpace } from "@/lib/mindspace";
import { rateLimit } from "@/lib/cf/cache";
import { hybridBookSlugs } from "@/lib/search";
import { getBooksBySlug } from "@/lib/repo";

// POST /api/mindspace/:id/suggest { text }  → books related to a node's text.
// Uses the same semantic + keyword search as the site search (Vectorize when bound, FTS otherwise).
export const POST = (request, { params }) =>
  withMindspace(request, async ({ db, user, env }) => {
    const { id } = await params;
    const found = await getSpace(db, id, user.uid);
    if (!found || !found.isOwner) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const rl = await rateLimit(env, `ms-suggest:${user.uid}`, { limit: 60, windowSeconds: 3600 });
    if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    const { text, lang = "en" } = await readJson(request);
    const q = String(text || "").trim().slice(0, 300);
    if (q.length < 3) return NextResponse.json({ books: [] });
    const { slugs } = await hybridBookSlugs(env, q, lang, 6);
    const rows = slugs.length ? await getBooksBySlug(slugs, lang, "slug, title, author, cover_url") : new Map();
    return NextResponse.json({ books: slugs.map((s) => rows.get(s)).filter(Boolean) });
  });
