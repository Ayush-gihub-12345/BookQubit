import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/liked?uid=...&lang=en — books a user has liked (book_like follows)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  const lang = searchParams.get("lang") || "en";
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });

  const db = await getDb();
  const { results } = await db.prepare(
    `SELECT b.* FROM follows f
     JOIN books b ON b.slug = f.target_id AND b.lang = ?2
     WHERE f.user_id = ?1 AND f.target_type = 'book_like'
     ORDER BY f.created_at DESC`
  ).bind(uid, lang).all();

  return NextResponse.json({ books: results });
}
