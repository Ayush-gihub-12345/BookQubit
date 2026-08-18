import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";
import { markEmailVerified } from "@/lib/repo";

// POST /api/auth/mark-verified — { idToken }
// Called right after a successful Google sign-in — Google has already
// verified the address, this just syncs our own users.email_verified flag
// to match, so downstream checks don't have to special-case the provider.
export async function POST(request) {
  const { idToken } = await request.json();
  const user = await verifyUser(idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await markEmailVerified(user.uid);
  return NextResponse.json({ ok: true });
}
