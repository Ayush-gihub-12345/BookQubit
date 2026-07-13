import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";
import { setDiscussionArchived } from "@/lib/repo";

// POST /api/discussions/[id]/archive — { idToken, archived: true|false }
export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const user = await verifyUser(body.idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await setDiscussionArchived(user.uid, id, Boolean(body.archived));
  return NextResponse.json({ ok: true });
}
