import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request) {
  const { bookSlug, message, userId } = await request.json();
  const text = (message || "").trim();
  if (!text) return NextResponse.json({ error: "message required" }, { status: 400 });

  const db = await getDb();
  await db.prepare("INSERT INTO reports (book_slug, user_id, message) VALUES (?1, ?2, ?3)")
    .bind(bookSlug || null, userId || null, text.slice(0, 1000)).run();
  return NextResponse.json({ ok: true });
}
