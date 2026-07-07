import { NextResponse } from "next/server";
import { getComicsByLanguage, getComicBySlug } from "@/lib/server/comicsRepository";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "en";
  const slug = searchParams.get("slug");

  if (slug) {
    const comic = await getComicBySlug(slug, lang);
    if (!comic) return NextResponse.json({ error: "Comic not found" }, { status: 404 });
    return NextResponse.json({ comic });
  }

  const comics = await getComicsByLanguage(lang);
  return NextResponse.json({ comics });
}
