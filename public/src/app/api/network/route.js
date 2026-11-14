import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { getReaderNetwork } from "@/lib/repo";

// GET /api/network — who the signed-in reader follows, and who follows them.
// Subject comes from the bearer token, not a `?uid=` parameter; see
// src/lib/api-auth.js.
export async function GET(request) {
  const auth = await requireUser(request);
  if (auth.response) return auth.response;
  return NextResponse.json(await getReaderNetwork(auth.user.uid));
}
