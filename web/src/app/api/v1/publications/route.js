import {
  getPublicationBySlugFromDb,
  listPublicationsFromDb,
} from "../../../../../v1/db/content";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const limit = searchParams.get("limit") || 50;
    const offset = searchParams.get("offset") || 0;

    if (slug) {
      const publication = await getPublicationBySlugFromDb(request, slug);
      return Response.json(
        { success: true, count: publication ? 1 : 0, data: publication },
        { headers: { "Cache-Control": "public, max-age=3600" } },
      );
    }

    const publications = await listPublicationsFromDb(request, { limit, offset });
    return Response.json(
      { success: true, count: publications.length, data: publications },
      { headers: { "Cache-Control": "public, max-age=3600" } },
    );
  } catch (error) {
    console.error("Publications API Error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
