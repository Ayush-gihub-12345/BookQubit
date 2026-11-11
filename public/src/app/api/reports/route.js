import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getRequestUser } from "@/lib/api-auth";

// POST /api/reports — { bookSlug, message }. Anonymous reports are allowed.
//
// Attribution comes only from a verified bearer token. This used to store a
// `userId` taken straight from the request body, so anyone could file a
// report "from" any reader — and since UIDs are public that included
// framing a named reader in the moderation queue. A missing, invalid, or
// unverifiable token simply files the report anonymously: reporting a data
// error should never fail because of a sign-in hiccup.
export async function POST(request) {
  const { bookSlug, message } = await request.json().catch(() => ({}));
  const text = (message || "").trim();
  if (!text) return NextResponse.json({ error: "message required" }, { status: 400 });

  const user = await getRequestUser(request).catch(() => null);

  const db = await getDb();
  await db.prepare("INSERT INTO reports (book_slug, user_id, message) VALUES (?1, ?2, ?3)")
    .bind(bookSlug || null, user?.uid || null, text.slice(0, 1000)).run();
  return NextResponse.json({ ok: true });
}
