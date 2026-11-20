import { NextResponse } from "next/server";
import { requireUser, unauthorized } from "@/lib/auth-request";
import { getCf } from "@/lib/cf/env";
import { logError } from "@/lib/cf/logger";
import { browseLists, createList, myLists, listsForBook } from "@/lib/lists";

// GET  /api/lists?sort=popular|recent&page=1   the public index (shared-cached for a minute)
// GET  /api/lists?book=slug                    lists that contain a book
// GET  /api/lists?mine=1                       the signed-in reader's own lists
// POST /api/lists { title, description?, books? }   create a list (signed in)
const PUBLIC = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" };

export async function GET(request) {
  const q = new URL(request.url).searchParams;
  try {
    const { env } = await getCf();
    if (!env.ENGAGEMENT_DB) return NextResponse.json({ lists: [], hasMore: false, unavailable: true });
    if (q.get("mine")) {
      const user = await requireUser(request);
      if (!user) return unauthorized();
      return NextResponse.json({ lists: await myLists(env.ENGAGEMENT_DB, user.uid) }, { headers: { "Cache-Control": "private, no-store" } });
    }
    const book = q.get("book");
    if (book) {
      if (!/^[\w.%~-]{1,200}$/.test(book)) return NextResponse.json({ error: "bad slug" }, { status: 400 });
      return NextResponse.json({ lists: await listsForBook(env.ENGAGEMENT_DB, book) }, { headers: PUBLIC });
    }
    const out = await browseLists(env.ENGAGEMENT_DB, { sort: q.get("sort") === "recent" ? "recent" : "popular", page: q.get("page") });
    return NextResponse.json(out, { headers: PUBLIC });
  } catch (e) {
    logError("lists.get", e);
    return NextResponse.json({ lists: [], hasMore: false });
  }
}

export async function POST(request) {
  const user = await requireUser(request);
  if (!user) return unauthorized();
  const body = await request.json().catch(() => ({}));
  try {
    const { env } = await getCf();
    if (!env.ENGAGEMENT_DB) return NextResponse.json({ error: "feature_unavailable" }, { status: 503 });
    return NextResponse.json(await createList(env.ENGAGEMENT_DB, user, { title: body.title, description: body.description, books: Array.isArray(body.books) ? body.books : [] }));
  } catch (e) {
    if (e.status) return NextResponse.json({ error: e.message }, { status: e.status });
    if (/title|limit/.test(e.message)) return NextResponse.json({ error: e.message }, { status: 400 });
    logError("lists.create", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
