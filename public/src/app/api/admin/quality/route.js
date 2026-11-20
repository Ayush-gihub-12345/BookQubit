import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCatalogDb, cached, invalidate } from "@/lib/db";
import { computeQuality } from "@/lib/data-quality";

// Catalog data-quality report.
//   GET            the last report (cached for a day), computed on first use
//   POST {refresh} recompute now (one pass over the books table), then cache it
// Admin only. The pass is deliberately on demand: at 100k books it reads each book once, so it is never run per visit.
const KEY = "admin:quality";
const unauthorized = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();
  try {
    const report = await cached(KEY, async () => computeQuality(await getCatalogDb()), 86400);
    return NextResponse.json(report);
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

export async function POST() {
  if (!(await isAdminAuthenticated())) return unauthorized();
  try {
    await invalidate(KEY);
    const report = await cached(KEY, async () => computeQuality(await getCatalogDb()), 86400);
    return NextResponse.json(report);
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
