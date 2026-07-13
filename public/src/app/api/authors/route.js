import { NextResponse } from "next/server";
import { listAuthors } from "@/lib/repo";

// GET /api/authors — used by the onboarding "follow authors" step
export async function GET() {
  const authors = await listAuthors("en");
  return NextResponse.json({ authors: authors.slice(0, 200) });
}
