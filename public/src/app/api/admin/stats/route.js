import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = await getDb();

  const [books, authors, publications, comics, users, reviews, discussions, topRated, mostActive, newUsers] =
    await Promise.all([
      db.prepare("SELECT COUNT(*) AS n FROM books").first(),
      db.prepare("SELECT COUNT(*) AS n FROM authors").first(),
      db.prepare("SELECT COUNT(*) AS n FROM publications").first(),
      db.prepare("SELECT COUNT(*) AS n FROM comics").first(),
      db.prepare("SELECT COUNT(*) AS n FROM users").first(),
      db.prepare("SELECT COUNT(*) AS n FROM shelf WHERE review IS NOT NULL AND review != ''").first(),
      db.prepare("SELECT COUNT(*) AS n FROM discussions").first(),
      db.prepare("SELECT title, author, rating FROM books WHERE lang='en' AND rating IS NOT NULL ORDER BY rating DESC LIMIT 5").all(),
      db.prepare(
        `SELECT u.name, u.photo_url, COUNT(*) AS n FROM shelf s JOIN users u ON u.id=s.user_id
         GROUP BY u.id ORDER BY n DESC LIMIT 5`
      ).all(),
      db.prepare("SELECT COUNT(*) AS n FROM users WHERE created_at >= datetime('now','-7 days')").first(),
    ]);

  return NextResponse.json({
    counts: {
      books: books.n, authors: authors.n, publications: publications.n, comics: comics.n,
      users: users.n, reviews: reviews.n, discussions: discussions.n,
    },
    newUsers7d: newUsers.n,
    topRated: topRated.results,
    mostActive: mostActive.results,
  });
}
