import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";
import { markDiscussionRead } from "@/lib/repo";

// POST /api/discussions/[id]/read — { idToken } — resets the unread counter
export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const user = await verifyUser(body.idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await markDiscussionRead(user.uid, id);
  return NextResponse.json({ ok: true });
}
