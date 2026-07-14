import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getBooksBySlug } from "@/lib/repo";

// GET /api/liked?uid=...&lang=en — books a user has liked (book_like follows)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  const lang = searchParams.get("lang") || "en";
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });

  const db = await getDb();
  const { results } = await db.prepare(
    `SELECT target_id AS slug FROM follows WHERE user_id = ?1 AND target_type = 'book_like' ORDER BY created_at DESC`
  ).bind(uid).all();

  const bookInfo = await getBooksBySlug(results.map((r) => r.slug), lang);
  const books = results.map((r) => bookInfo.get(r.slug)).filter(Boolean);

  return NextResponse.json({ books });
}
