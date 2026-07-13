import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

// GET /api/admin/import-status — progress of the bulk-import cron worker
// (a separate deployed Worker; this just reads the shared D1 row it updates).
export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = await getDb();
  const row = await db.prepare("SELECT * FROM import_progress WHERE id=1").first();
  return NextResponse.json({ progress: row || null });
}
