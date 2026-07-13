import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";
import { addQuote, getQuotesForBook, getQuotesByUser, upsertUser } from "@/lib/repo";

// GET /api/quotes?bookSlug=... or ?uid=...
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const bookSlug = searchParams.get("bookSlug");
  const uid = searchParams.get("uid");
  if (bookSlug) return NextResponse.json({ quotes: await getQuotesForBook(bookSlug) });
  if (uid) return NextResponse.json({ quotes: await getQuotesByUser(uid) });
  return NextResponse.json({ error: "bookSlug or uid required" }, { status: 400 });
}

// POST /api/quotes — { idToken, bookSlug, text, page? }
export async function POST(request) {
  const body = await request.json();
  const user = await verifyUser(body.idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const text = (body.text || "").trim();
  if (!text || !body.bookSlug) return NextResponse.json({ error: "bookSlug and text required" }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: "quote is too long" }, { status: 400 });

  await upsertUser(user.uid, user.name, user.photo);
  const id = await addQuote(user.uid, { bookSlug: body.bookSlug, text, page: body.page ? Number(body.page) : undefined });
  return NextResponse.json({ ok: true, id });
}
