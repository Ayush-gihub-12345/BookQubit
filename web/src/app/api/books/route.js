import { NextResponse } from "next/server";
import {
  getBooksByLanguage,
  getBooksByCategory,
  getBooksByCollection,
  getBooksByTag,
  searchBooks,
  getFeaturedBooks,
  getTopRatedBooks,
  getNewReleaseBooks,
  getBestsellerBooks,
} from "@/lib/server/booksRepository";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "en";
  const filter = searchParams.get("filter");
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")) : undefined;

  let books;
  switch (filter) {
    case "featured":
      books = await getFeaturedBooks(lang, limit);
      break;
    case "toprated":
      books = await getTopRatedBooks(lang, limit);
      break;
    case "newreleases":
      books = await getNewReleaseBooks(lang, limit);
      break;
    case "bestsellers":
      books = await getBestsellerBooks(lang, limit);
      break;
    default:
      if (searchParams.get("category")) {
        books = await getBooksByCategory(searchParams.get("category"), lang);
      } else if (searchParams.get("collection")) {
        books = await getBooksByCollection(searchParams.get("collection"), lang);
      } else if (searchParams.get("tag")) {
        books = await getBooksByTag(searchParams.get("tag"), lang);
      } else if (searchParams.get("q")) {
        books = await searchBooks(searchParams.get("q"), lang);
      } else {
        books = await getBooksByLanguage(lang);
      }
  }

  return NextResponse.json({ books });
}
