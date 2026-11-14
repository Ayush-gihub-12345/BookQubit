import { NextResponse } from "next/server";
import { requireUser, unauthorized } from "@/lib/auth-request";
import { getCf } from "@/lib/cf/env";
import { rateLimit } from "@/lib/cf/cache";
import { logError } from "@/lib/cf/logger";
import { recordProgress } from "@/lib/library-server";
import { upsertUser } from "@/lib/repo";

// POST /api/library/progress { slug, pages?, percent?, audioSeconds?, finished? }
// Debounced by the client; each call is one engagement batch + one shelf upsert.
export async function POST(request) {
  const user = await requireUser(request);
  if (!user) return unauthorized();
  const body = await request.json().catch(() => ({}));
  if (!body.slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const { env } = await getCf();
  const rl = await rateLimit(env, `progress:${user.uid}`, { limit: 240, windowSeconds: 3600 });
  if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  try {
    await upsertUser(user.uid, user.name, user.photo);
    return NextResponse.json(await recordProgress(env, user.uid, body));
  } catch (e) {
    logError("library.progress", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
