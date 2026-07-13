import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";
import { leaveDiscussion } from "@/lib/repo";

// POST /api/discussions/[id]/leave — { idToken }
export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const user = await verifyUser(body.idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const result = await leaveDiscussion(user.uid, id);
  if (!result.ok) return NextResponse.json(result, { status: 403 });
  return NextResponse.json(result);
}
