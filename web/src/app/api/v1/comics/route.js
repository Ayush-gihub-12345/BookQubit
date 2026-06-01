import {
  getBookBySlugFromDb,
  getTopBooksFromDb,
  listBooksFromDb,
  searchBooksFromDb,
} from "../../../../../v1/db/content";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "list";
    const limit = searchParams.get("limit") || 50;
    const offset = searchParams.get("offset") || 0;
    const query = searchParams.get("search") || searchParams.get("q");
    const slug = searchParams.get("slug");
    const language = searchParams.get("lang") || searchParams.get("language") || "en";

    if (slug) {
      const comic = await getBookBySlugFromDb(request, slug, language);
      return Response.json(
        { success: true, count: comic ? 1 : 0, data: comic },
        { headers: { "Cache-Control": "public, max-age=3600" } },
      );
    }

    const comics = query
      ? await searchBooksFromDb(request, { query, limit, language, bookType: "comic" })
      : action === "top" || action === "trending"
        ? await getTopBooksFromDb(request, { limit, language, bookType: "comic" })
        : await listBooksFromDb(request, { limit, offset, language, bookType: "comic" });

    return Response.json(
      { success: true, count: comics.length, data: comics },
      { headers: { "Cache-Control": "public, max-age=3600" } },
    );
  } catch (error) {
    console.error("Comics API Error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
