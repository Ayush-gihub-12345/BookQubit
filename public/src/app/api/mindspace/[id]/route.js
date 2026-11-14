import { NextResponse } from "next/server";
import { withMindspace, readJson } from "@/lib/mindspace-route";
import { getSpace, getGraph, updateSpace, deleteSpace } from "@/lib/mindspace";
import { invalidatePublicSpace } from "@/lib/mindspace-public";

// GET    /api/mindspace/:idOrSlug → { space, isOwner, graph }  (owner, or anyone if public; else 404)
// PATCH  /api/mindspace/:id {title?, description?, visibility?}
// DELETE /api/mindspace/:id
export const GET = (request, { params }) =>
  withMindspace(request, async ({ db, user }) => {
    const { id } = await params;
    const found = await getSpace(db, id, user?.uid);
    if (!found) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const { space, isOwner } = found;
    return NextResponse.json(
      { space: { id: space.id, slug: space.slug, title: space.title, description: space.description, visibility: space.visibility, owner_name: space.owner_name, node_count: space.node_count }, isOwner, graph: await getGraph(db, space.id) },
      { headers: { "Cache-Control": space.visibility === "public" && !isOwner ? "public, max-age=60" : "private, no-store", Vary: "Authorization" } }
    );
  }, { auth: false });

export const PATCH = (request, { params }) =>
  withMindspace(request, async ({ db, user }) => {
    const { id } = await params;
    const found = await getSpace(db, id, user.uid);
    await updateSpace(db, user, id, await readJson(request));
    // Visibility/title changes must never be served from the public cache.
    if (found) await invalidatePublicSpace(found.space.slug);
    return NextResponse.json({ ok: true });
  });

export const DELETE = (request, { params }) =>
  withMindspace(request, async ({ db, user }) => {
    const { id } = await params;
    const found = await getSpace(db, id, user.uid);
    await deleteSpace(db, user, id);
    if (found) await invalidatePublicSpace(found.space.slug);
    return NextResponse.json({ ok: true });
  });
