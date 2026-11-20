import { NextResponse } from "next/server";
import { requireUser, unauthorized } from "@/lib/auth-request";
import { getRequestUser } from "@/lib/api-auth";
import { getCf } from "@/lib/cf/env";
import { logError } from "@/lib/cf/logger";
import { getList, addToList, removeFromList, deleteList, toggleListVote } from "@/lib/lists";

// GET    /api/lists/:id                           the list and its book slugs in order
// POST   /api/lists/:id { action: add|remove|vote, slug?, note? }
// DELETE /api/lists/:id                           delete (owner only)
const ID = /^[a-f0-9]{12}$/;

async function engagement() {
  const { env } = await getCf();
  return env.ENGAGEMENT_DB || null;
}
const fail = (e, tag) => {
  if (e.status) return NextResponse.json({ error: e.message }, { status: e.status });
  if (/limit|full|Invalid|own list/.test(e.message)) return NextResponse.json({ error: e.message }, { status: 400 });
  logError(tag, e);
  return NextResponse.json({ error: "failed" }, { status: 500 });
};

export async function GET(request, { params }) {
  const { id } = await params;
  if (!ID.test(id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  try {
    const db = await engagement();
    if (!db) return NextResponse.json({ error: "feature_unavailable" }, { status: 503 });
    const authed = /^Bearer /i.test(request.headers.get("authorization") || "");
    const user = authed ? await getRequestUser(request).catch(() => null) : null;
    const found = await getList(db, id, user?.uid);
    if (!found) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ ...found, mine: user?.uid === found.list.user_id }, { headers: { "Cache-Control": user ? "private, no-store" : "public, s-maxage=30, stale-while-revalidate=120" } });
  } catch (e) { return fail(e, "lists.read"); }
}

export async function POST(request, { params }) {
  const { id } = await params;
  const user = await requireUser(request);
  if (!user) return unauthorized();
  if (!ID.test(id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const { action, slug, note } = await request.json().catch(() => ({}));
  try {
    const db = await engagement();
    if (!db) return NextResponse.json({ error: "feature_unavailable" }, { status: 503 });
    if (action === "add") return NextResponse.json(await addToList(db, user, id, slug, note));
    if (action === "remove") return NextResponse.json(await removeFromList(db, user, id, slug));
    if (action === "vote") return NextResponse.json(await toggleListVote(db, user, id));
    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e) { return fail(e, "lists.write"); }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const user = await requireUser(request);
  if (!user) return unauthorized();
  if (!ID.test(id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  try {
    const db = await engagement();
    if (!db) return NextResponse.json({ error: "feature_unavailable" }, { status: 503 });
    return NextResponse.json(await deleteList(db, user, id));
  } catch (e) { return fail(e, "lists.delete"); }
}
