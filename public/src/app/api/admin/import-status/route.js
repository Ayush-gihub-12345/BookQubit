import { NextResponse } from "next/server";
import { getCatalogDb } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

// GET /api/admin/import-status — progress of the bulk-import cron worker
// (a separate deployed Worker; this just reads the shared D1 rows it updates,
// which live in the catalog database alongside `books`).
export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = await getCatalogDb();
  const [progress, chunks] = await Promise.all([
    db.prepare("SELECT * FROM import_progress WHERE id=1").first(),
    db.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN consumed=1 THEN 1 ELSE 0 END) AS done FROM import_chunks").first(),
  ]);
  return NextResponse.json({
    progress: progress || null,
    chunks: { total: chunks?.total || 0, done: chunks?.done || 0 },
  });
}
