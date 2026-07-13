import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";
import { joinDiscussion, upsertUser } from "@/lib/repo";

// POST /api/discussions/[id]/join — { idToken }
export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const user = await verifyUser(body.idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await upsertUser(user.uid, user.name, user.photo);

  const result = await joinDiscussion(user.uid, id);
  if (!result.ok) return NextResponse.json(result, { status: 403 });
  return NextResponse.json(result);
}
