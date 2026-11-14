import { NextResponse } from "next/server";
import { requireUser, unauthorized } from "@/lib/auth-request";
import { getCf } from "@/lib/cf/env";
import { logError } from "@/lib/cf/logger";
import { getBooksBySlug } from "@/lib/repo";

const MAX_SHELVES = 50;
const MAX_ITEMS = 2000;
const vis = (v) => (v === "public" ? "public" : "private");

async function context(request) {
  const user = await requireUser(request);
  if (!user) return { res: unauthorized() };
  const { env } = await getCf();
  if (!env.ENGAGEMENT_DB) return { res: NextResponse.json({ error: "feature_unavailable" }, { status: 503 }) };
  return { user, db: env.ENGAGEMENT_DB };
}

// GET → the reader's custom shelves (with item counts). Pass ?id=… for one shelf's books.
export async function GET(request) {
  const c = await context(request);
  if (c.res) return c.res;
  const id = new URL(request.url).searchParams.get("id");
  try {
    if (id) {
      const shelf = await c.db.prepare("SELECT id, name, visibility FROM custom_shelves WHERE id=?1 AND user_id=?2").bind(id, c.user.uid).first();
      if (!shelf) return NextResponse.json({ error: "not found" }, { status: 404 });
      const { results } = await c.db.prepare("SELECT book_slug, added_at FROM custom_shelf_items WHERE shelf_id=?1 ORDER BY added_at DESC LIMIT 200").bind(id).all();
      const info = results.length ? await getBooksBySlug(results.map((r) => r.book_slug), "en", "slug, title, author, cover_url") : new Map();
      const items = results.map((r) => ({ ...r, title: info.get(r.book_slug)?.title || r.book_slug, author: info.get(r.book_slug)?.author || "", cover_url: info.get(r.book_slug)?.cover_url || null }));
      return NextResponse.json({ shelf, items });
    }
    const { results } = await c.db.prepare(
      `SELECT s.id, s.name, s.visibility, (SELECT COUNT(*) FROM custom_shelf_items i WHERE i.shelf_id = s.id) AS n
       FROM custom_shelves s WHERE s.user_id=?1 ORDER BY s.created_at DESC LIMIT ?2`
    ).bind(c.user.uid, MAX_SHELVES).all();
    return NextResponse.json({ shelves: results });
  } catch (e) {
    logError("shelves.get", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

// POST { action: "create", name, visibility } | { action: "add"|"remove", shelfId, slug }
export async function POST(request) {
  const c = await context(request);
  if (c.res) return c.res;
  const b = await request.json().catch(() => ({}));
  try {
    if (b.action === "create") {
      const name = String(b.name || "").trim().slice(0, 60);
      if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
      const count = await c.db.prepare("SELECT COUNT(*) n FROM custom_shelves WHERE user_id=?1").bind(c.user.uid).first();
      if (count.n >= MAX_SHELVES) return NextResponse.json({ error: "shelf limit reached" }, { status: 409 });
      const id = crypto.randomUUID();
      await c.db.prepare("INSERT INTO custom_shelves (id, user_id, name, visibility) VALUES (?1,?2,?3,?4)").bind(id, c.user.uid, name, vis(b.visibility)).run();
      return NextResponse.json({ id, name, visibility: vis(b.visibility), n: 0 });
    }
    if (b.action === "add" || b.action === "remove") {
      const slug = String(b.slug || "").slice(0, 300);
      const owned = await c.db.prepare("SELECT id FROM custom_shelves WHERE id=?1 AND user_id=?2").bind(b.shelfId, c.user.uid).first();
      if (!owned || !slug) return NextResponse.json({ error: "not found" }, { status: 404 });
      if (b.action === "add") {
        const count = await c.db.prepare("SELECT COUNT(*) n FROM custom_shelf_items WHERE shelf_id=?1").bind(b.shelfId).first();
        if (count.n >= MAX_ITEMS) return NextResponse.json({ error: "shelf is full" }, { status: 409 });
        await c.db.prepare("INSERT INTO custom_shelf_items (shelf_id, book_slug) VALUES (?1,?2) ON CONFLICT DO NOTHING").bind(b.shelfId, slug).run();
      } else {
        await c.db.prepare("DELETE FROM custom_shelf_items WHERE shelf_id=?1 AND book_slug=?2").bind(b.shelfId, slug).run();
      }
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e) {
    logError("shelves.post", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

// PATCH { id, name?, visibility? }
export async function PATCH(request) {
  const c = await context(request);
  if (c.res) return c.res;
  const b = await request.json().catch(() => ({}));
  const name = b.name == null ? null : String(b.name).trim().slice(0, 60) || null;
  const visibility = b.visibility == null ? null : vis(b.visibility);
  try {
    const r = await c.db.prepare(
      "UPDATE custom_shelves SET name = COALESCE(?3, name), visibility = COALESCE(?4, visibility) WHERE id=?1 AND user_id=?2"
    ).bind(b.id, c.user.uid, name, visibility).run();
    return r.meta?.changes === 0 ? NextResponse.json({ error: "not found" }, { status: 404 }) : NextResponse.json({ ok: true });
  } catch (e) {
    logError("shelves.patch", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

// DELETE { id } — removes the shelf and its items.
export async function DELETE(request) {
  const c = await context(request);
  if (c.res) return c.res;
  const b = await request.json().catch(() => ({}));
  try {
    const owned = await c.db.prepare("SELECT id FROM custom_shelves WHERE id=?1 AND user_id=?2").bind(b.id, c.user.uid).first();
    if (!owned) return NextResponse.json({ error: "not found" }, { status: 404 });
    await c.db.batch([
      c.db.prepare("DELETE FROM custom_shelf_items WHERE shelf_id=?1").bind(b.id),
      c.db.prepare("DELETE FROM custom_shelves WHERE id=?1 AND user_id=?2").bind(b.id, c.user.uid),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    logError("shelves.delete", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
