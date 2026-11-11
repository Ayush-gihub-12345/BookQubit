import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";
import { requireUser } from "@/lib/api-auth";
import { getUserPreferences, upsertUserPreferences, upsertUser } from "@/lib/repo";

// GET /api/preferences — the signed-in reader's saved genre picks and
// onboarding state. Subject comes from the bearer token, not a `?uid=`
// parameter; see src/lib/api-auth.js.
export async function GET(request) {
  const auth = await requireUser(request);
  if (auth.response) return auth.response;
  return NextResponse.json(await getUserPreferences(auth.user.uid));
}

// POST /api/preferences — { idToken, genres?, onboarded? }
export async function POST(request) {
  const body = await request.json();
  const user = await verifyUser(body.idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await upsertUser(user.uid, user.name, user.photo);

  await upsertUserPreferences(user.uid, { genres: body.genres, onboarded: body.onboarded });
  return NextResponse.json({ ok: true });
}
