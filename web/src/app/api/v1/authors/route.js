import {
  getAuthorBySlugFromDb,
  listAuthorsFromDb,
} from "../../../../../v1/db/content";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const limit = searchParams.get("limit") || 50;
    const offset = searchParams.get("offset") || 0;

    if (slug) {
      const author = await getAuthorBySlugFromDb(request, slug);
      return Response.json(
        { success: true, count: author ? 1 : 0, data: author },
        { headers: { "Cache-Control": "public, max-age=3600" } },
      );
    }

    const authors = await listAuthorsFromDb(request, { limit, offset });
    return Response.json(
      { success: true, count: authors.length, data: authors },
      { headers: { "Cache-Control": "public, max-age=3600" } },
    );
  } catch (error) {
    console.error("Authors API Error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
