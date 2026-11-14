import { NextResponse } from "next/server";
import { withMindspace, readJson } from "@/lib/mindspace-route";
import { addNode, updateNode, deleteNode, addEdge, deleteEdge, MsError } from "@/lib/mindspace";

// Nodes and edges of one space. `entity` selects which.
// POST   { entity: "node", kind, title?, body?, bookSlug?, url?, parentId?, x?, y? } | { entity: "edge", source, target, relation?, weight? }
// PATCH  { entity: "node", nodeId, title?, body?, url?, x?, y? }
// DELETE { entity: "node", nodeId } | { entity: "edge", edgeId }
export const POST = (request, { params }) =>
  withMindspace(request, async ({ db, user }) => {
    const { id } = await params;
    const b = await readJson(request);
    if (b.entity === "edge") { await addEdge(db, user, id, b); return NextResponse.json({ ok: true }); }
    if (b.entity === "node") return NextResponse.json(await addNode(db, user, id, b));
    throw new MsError("bad_entity");
  });

export const PATCH = (request, { params }) =>
  withMindspace(request, async ({ db, user }) => {
    const { id } = await params;
    const b = await readJson(request);
    if (b.entity !== "node") throw new MsError("bad_entity");
    await updateNode(db, user, id, b.nodeId, b);
    return NextResponse.json({ ok: true });
  });

export const DELETE = (request, { params }) =>
  withMindspace(request, async ({ db, user }) => {
    const { id } = await params;
    const b = await readJson(request);
    if (b.entity === "edge") await deleteEdge(db, user, id, b.edgeId);
    else if (b.entity === "node") await deleteNode(db, user, id, b.nodeId);
    else throw new MsError("bad_entity");
    return NextResponse.json({ ok: true });
  });
