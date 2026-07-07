import { NextResponse } from "next/server";
import { getAuthorsByLanguage, getAuthorBySlug } from "@/lib/server/authorsRepository";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "en";
  const slug = searchParams.get("slug");

  if (slug) {
    const author = await getAuthorBySlug(slug, lang);
    if (!author) return NextResponse.json({ error: "Author not found" }, { status: 404 });
    return NextResponse.json({ author });
  }

  const authors = await getAuthorsByLanguage(lang);
  return NextResponse.json({ authors });
}
