import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";
import { getUserPreferences, upsertUserPreferences, upsertUser } from "@/lib/repo";

// GET /api/preferences?uid=...
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });
  return NextResponse.json(await getUserPreferences(uid));
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
