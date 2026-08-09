import { NextResponse } from "next/server";
import { getDb, getCatalogDb } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

// Deliberately small. This used to run 19 queries per dashboard load,
// including four COUNT(*) scans over the catalog plus GROUP BYs for
// top-countries / by-language / six-month signup and read histograms —
// analytics nobody was acting on, recomputed every time the page opened.
//
// Now: catalog totals come from the single maintained `catalog_counts` row
// (the import worker increments it on write, so nothing counts on read),
// and the rest are small indexed lookups against the user database, which
// only grows when a real person does something.
export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [db, catalogDb] = await Promise.all([getDb(), getCatalogDb()]);

  const [catalog, comics, users, reviews, discussions, pendingReports, pendingContact, pendingRequests] =
    await Promise.all([
      catalogDb.prepare("SELECT books, authors, publications FROM catalog_counts WHERE id = 1").first(),
      // Comics is a tiny, hand-curated table — not worth a maintained counter.
      catalogDb.prepare("SELECT COUNT(*) AS n FROM comics").first(),
      db.prepare("SELECT COUNT(*) AS n FROM users").first(),
      db.prepare("SELECT COUNT(*) AS n FROM shelf WHERE review IS NOT NULL AND review != ''").first(),
      db.prepare("SELECT COUNT(*) AS n FROM discussions").first(),
      db.prepare("SELECT COUNT(*) AS n FROM reports WHERE resolved=0").first(),
      db.prepare("SELECT COUNT(*) AS n FROM contact_messages WHERE resolved=0").first(),
      db.prepare("SELECT COUNT(*) AS n FROM book_requests WHERE status='pending'").first(),
    ]);

  return NextResponse.json({
    counts: {
      books: catalog?.books ?? 0,
      authors: catalog?.authors ?? 0,
      publications: catalog?.publications ?? 0,
      comics: comics?.n ?? 0,
      users: users.n,
      reviews: reviews.n,
      discussions: discussions.n,
    },
    pending: { reports: pendingReports.n, contact: pendingContact.n, requests: pendingRequests.n },
  });
}
