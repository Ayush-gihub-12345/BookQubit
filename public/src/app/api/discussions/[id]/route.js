import { NextResponse } from "next/server";
import { getDiscussion } from "@/lib/repo";

export async function GET(request, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid") || undefined;
  const thread = await getDiscussion(id, uid);
  if (!thread) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(thread);
}
