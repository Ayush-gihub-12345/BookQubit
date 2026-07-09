import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  const { email, lang } = await request.json();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const db = await getDb();
  await db.prepare(
    "INSERT INTO newsletter_subscribers (email, lang) VALUES (?1, ?2) ON CONFLICT(email) DO NOTHING"
  ).bind(email.trim().toLowerCase(), lang || "en").run();
  return NextResponse.json({ ok: true });
}
