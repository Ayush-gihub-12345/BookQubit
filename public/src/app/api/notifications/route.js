import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { getNotifications } from "@/lib/repo";

// GET /api/notifications — the signed-in reader's own notifications.
//
// Requires `Authorization: Bearer <firebase id token>`. The subject comes
// from that token, never from a `?uid=` parameter: UIDs are visible in
// public markup (see src/lib/api-auth.js), so a uid-addressed version of
// this endpoint let anyone read anyone's notifications.
export async function GET(request) {
  const auth = await requireUser(request);
  if (auth.response) return auth.response;
  return NextResponse.json({ notifications: await getNotifications(auth.user.uid) });
}
