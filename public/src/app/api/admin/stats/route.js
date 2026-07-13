import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

function fillMonths(rows, key = "n") {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    return { month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleDateString(undefined, { month: "short" }), [key]: 0 };
  });
  for (const r of rows) {
    const m = months.find((x) => x.month === r.month);
    if (m) m[key] = r.n;
  }
  return months;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = await getDb();

  const [
    books, authors, publications, comics, users, reviews, discussions, topRated, mostActive, newUsers,
    signupsByMonth, readsByMonth, topCountries, byLanguage, pendingReports, pendingContact, pendingRequests,
    countryCount, langCount,
  ] = await Promise.all([
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
    db.prepare(
      `SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS n FROM users
       WHERE created_at >= datetime('now','-6 months') GROUP BY month`
    ).all(),
    db.prepare(
      `SELECT strftime('%Y-%m', COALESCE(finished_at, updated_at)) AS month, COUNT(*) AS n FROM shelf
       WHERE status='read' AND COALESCE(finished_at, updated_at) >= datetime('now','-6 months') GROUP BY month`
    ).all(),
    db.prepare(
      `SELECT country, COUNT(*) AS n FROM books WHERE lang='en' AND country IS NOT NULL AND country != ''
       GROUP BY country ORDER BY n DESC LIMIT 8`
    ).all(),
    db.prepare("SELECT lang, COUNT(*) AS n FROM books GROUP BY lang ORDER BY n DESC").all(),
    db.prepare("SELECT COUNT(*) AS n FROM reports WHERE resolved=0").first(),
    db.prepare("SELECT COUNT(*) AS n FROM contact_messages WHERE resolved=0").first(),
    db.prepare("SELECT COUNT(*) AS n FROM book_requests WHERE status='pending'").first(),
    db.prepare("SELECT COUNT(DISTINCT country) AS n FROM books WHERE lang='en' AND country IS NOT NULL AND country != ''").first(),
    db.prepare("SELECT COUNT(DISTINCT lang) AS n FROM books").first(),
  ]);

  return NextResponse.json({
    counts: {
      books: books.n, authors: authors.n, publications: publications.n, comics: comics.n,
      users: users.n, reviews: reviews.n, discussions: discussions.n,
    },
    newUsers7d: newUsers.n,
    topRated: topRated.results,
    mostActive: mostActive.results,
    signupsByMonth: fillMonths(signupsByMonth.results),
    readsByMonth: fillMonths(readsByMonth.results),
    topCountries: topCountries.results,
    byLanguage: byLanguage.results,
    globalReach: { countries: countryCount.n, languages: langCount.n },
    pending: { reports: pendingReports.n, contact: pendingContact.n, requests: pendingRequests.n },
  });
}
