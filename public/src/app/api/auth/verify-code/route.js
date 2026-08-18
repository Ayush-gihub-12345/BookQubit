import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";
import { verifyEmailCode } from "@/lib/repo";

// POST /api/auth/verify-code — { idToken, code }
export async function POST(request) {
  const { idToken, code } = await request.json();
  const user = await verifyUser(idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!code) return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });

  const result = await verifyEmailCode(user.uid, code);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
