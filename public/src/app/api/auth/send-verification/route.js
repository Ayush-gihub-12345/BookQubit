import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";
import { createEmailVerification } from "@/lib/repo";

// POST /api/auth/send-verification — { idToken }
// Fired right after email/password sign-up (and by the "resend code" button
// on /verify-email). The email address comes from the verified Firebase
// token, never from the request body.
export async function POST(request) {
  const { idToken } = await request.json();
  const user = await verifyUser(idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!user.email) return NextResponse.json({ error: "Account has no email address." }, { status: 400 });

  const result = await createEmailVerification(user.uid, user.email);
  if (!result.ok) return NextResponse.json({ error: result.error || "Could not send email." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
