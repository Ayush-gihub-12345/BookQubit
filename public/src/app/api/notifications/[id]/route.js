import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";
import { respondNotification } from "@/lib/repo";

// POST /api/notifications/[id] — { idToken, action: "join"|"pass" }
export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const user = await verifyUser(body.idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!["join", "pass"].includes(body.action)) {
    return NextResponse.json({ error: "action must be join or pass" }, { status: 400 });
  }
  const result = await respondNotification(user.uid, id, body.action);
  if (!result.ok) return NextResponse.json(result, { status: 403 });
  return NextResponse.json(result);
}
