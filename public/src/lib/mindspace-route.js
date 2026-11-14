import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-request";
import { getCf } from "@/lib/cf/env";
import { logError } from "@/lib/cf/logger";
import { MsError } from "@/lib/mindspace";

/**
 * Shared wrapper for MindSpace routes: resolves the optional MINDSPACE_DB binding (503 when it
 * isn't provisioned), authenticates (401 unless `auth:false`), and maps MsError → HTTP status.
 * Handler gets { db, user, env, request }.
 */
export async function withMindspace(request, handler, { auth = true } = {}) {
  const { env } = await getCf();
  const db = env.MINDSPACE_DB;
  if (!db) return NextResponse.json({ error: "feature_unavailable" }, { status: 503 });
  const user = await requireUser(request);
  if (auth && !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    return await handler({ db, user, env, request });
  } catch (e) {
    if (e instanceof MsError) return NextResponse.json({ error: e.code }, { status: e.status });
    logError("mindspace", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export const readJson = (request) => request.json().catch(() => ({}));
