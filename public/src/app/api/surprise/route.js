import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-request";
import { getCf } from "@/lib/cf/env";
import { rateLimit } from "@/lib/cf/cache";
import { pickSurprise } from "@/lib/surprise";

// GET /api/surprise?locale=en&mood=Hopeful&genre=Fiction&length=short&source=all|shelf&exclude=slug1,slug2
//   → 200 { slug, title, author, coverUrl, rating, pages, year, genre, hook, readingMinutes }
//   → 404 when nothing matches, 401 when source=shelf and the reader isn't signed in.
// Random by nature, so never cached; protected by a per-IP rate limit instead.
export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  const { env } = await getCf();

  const ip = request.headers.get("cf-connecting-ip") || "anon";
  const rl = await rateLimit(env, `surprise:${ip}`, { limit: 90, windowSeconds: 60 });
  if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": "20" } });

  const source = sp.get("source") === "shelf" ? "shelf" : "all";
  const user = source === "shelf" ? await requireUser(request) : null;
  const q = {
    lang: sp.get("locale") || sp.get("lang") || "en",
    mood: sp.get("mood") || "",
    genre: sp.get("genre") || "",
    length: sp.get("length") || "",
    source,
    exclude: (sp.get("exclude") || "").split(",").filter(Boolean),
    userId: user?.uid || null,
  };

  let book = await pickSurprise(env, q);
  if (book?.needsSignIn) return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
  // A language with no matching books yet falls back to English (same convention as the rest of the site).
  if (!book && q.lang !== "en" && source === "all") book = await pickSurprise(env, { ...q, lang: "en" });
  if (!book) return NextResponse.json({ error: "no_match" }, { status: 404 });
  return NextResponse.json(book, { headers: { "Cache-Control": "no-store" } });
}
