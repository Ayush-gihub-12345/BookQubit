import { NextResponse } from "next/server";
import { withMindspace, readJson } from "@/lib/mindspace-route";
import { createSpace, listSpaces } from "@/lib/mindspace";
import { upsertUser } from "@/lib/repo";

// GET  /api/mindspace          → the reader's spaces
// POST /api/mindspace {title, description?, visibility?} → create a space
export const GET = (request) => withMindspace(request, async ({ db, user }) => NextResponse.json({ spaces: await listSpaces(db, user.uid) }));

export const POST = (request) =>
  withMindspace(request, async ({ db, user }) => {
    await upsertUser(user.uid, user.name, user.photo);
    return NextResponse.json(await createSpace(db, user, await readJson(request)));
  });
