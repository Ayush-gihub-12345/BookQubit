import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyUser } from "@/lib/auth-server";
import { joinDiscussion } from "@/lib/repo";

// POST /api/discussions/[id]/join — { idToken }
export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const user = await verifyUser(body.idToken);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = await getDb();
  await db.prepare(
    "INSERT INTO users (id, name, photo_url) VALUES (?1, ?2, ?3) ON CONFLICT(id) DO UPDATE SET name=?2, photo_url=?3"
  ).bind(user.uid, user.name, user.photo).run();

  const result = await joinDiscussion(user.uid, id);
  if (!result.ok) return NextResponse.json(result, { status: 403 });
  return NextResponse.json(result);
}
