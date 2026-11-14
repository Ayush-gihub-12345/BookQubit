import { NextResponse } from "next/server";
import { withMindspace, readJson } from "@/lib/mindspace-route";
import { saveToSpace } from "@/lib/mindspace";
import { upsertUser } from "@/lib/repo";

// POST /api/mindspace/save { spaceId? | newSpaceTitle?, node: { kind, title?, body?, bookSlug?, url? } }
// One-tap "Save to MindSpace" from book pages, quote cards and audio.
export const POST = (request) =>
  withMindspace(request, async ({ db, user }) => {
    const b = await readJson(request);
    await upsertUser(user.uid, user.name, user.photo);
    return NextResponse.json(await saveToSpace(db, user, { spaceId: b.spaceId, newSpaceTitle: b.newSpaceTitle, node: b.node || {} }));
  });
