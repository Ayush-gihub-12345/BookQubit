import { NextResponse } from "next/server";
import { getBookBySlugFromD1 } from "@/lib/server/booksRepository";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);

  try {
    const book = await getBookBySlugFromD1(slug, searchParams.get("lang") || "en");

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json({ book });
  } catch (error) {
    console.error("Book details API failed:", error);
    return NextResponse.json(
      { error: "Unable to load book" },
      { status: 500 },
    );
  }
}
