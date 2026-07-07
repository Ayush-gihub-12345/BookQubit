import { NextResponse } from "next/server";
import { getPublicationsByLanguage, getPublicationBySlug } from "@/lib/server/publicationsRepository";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "en";
  const slug = searchParams.get("slug");

  if (slug) {
    const publication = await getPublicationBySlug(slug, lang);
    if (!publication) return NextResponse.json({ error: "Publication not found" }, { status: 404 });
    return NextResponse.json({ publication });
  }

  const publications = await getPublicationsByLanguage(lang);
  return NextResponse.json({ publications });
}
