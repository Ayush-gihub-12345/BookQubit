import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  const { name, email, message } = await request.json();
  const text = (message || "").trim();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!text) return NextResponse.json({ error: "Message is required." }, { status: 400 });

  const db = await getDb();
  await db.prepare("INSERT INTO contact_messages (name, email, message) VALUES (?1, ?2, ?3)")
    .bind((name || "").trim().slice(0, 100) || null, email.trim().toLowerCase(), text.slice(0, 2000)).run();
  return NextResponse.json({ ok: true });
}
