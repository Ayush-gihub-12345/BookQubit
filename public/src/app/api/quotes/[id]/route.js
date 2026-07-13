import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";
import { deleteQuote } from "@/lib/repo";

// DELETE /api/quotes/[id] — { idToken }
export async function DELETE(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const user = await verifyUser(body.idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await deleteQuote(user.uid, id);
  return NextResponse.json({ ok: true });
}
