import { NextResponse } from "next/server";
import { logEvent, track } from "@/lib/cf/logger";
import { getCf } from "@/lib/cf/env";

// POST /api/log — whitelisted client telemetry → structured Workers Logs.
const ALLOWED = new Set(["audio_play", "audio_complete", "search_zero", "client_error"]);

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || !ALLOWED.has(body.event)) return new NextResponse(null, { status: 204 });
  const { event, slug, engine, q, lang } = body;
  const { env } = await getCf();
  track(env, event, { country: lang || "", subject: slug || q || "" });
  logEvent(event, {
    slug: slug ? String(slug).slice(0, 200) : undefined,
    engine: event === "client_error" ? String(engine || "").slice(0, 300) : engine === "file" || engine === "speech" ? engine : undefined,
    q: q ? String(q).slice(0, 100) : undefined,
    lang: lang ? String(lang).slice(0, 5) : undefined,
  });
  return new NextResponse(null, { status: 204 });
}
