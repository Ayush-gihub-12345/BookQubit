import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCatalogDb, invalidate } from "@/lib/db";
import { saveSeries } from "@/lib/catalog-lists";

// Admin: create or replace a series. Body: { lang?, slug, name, description?, books: [{ id, position }] }.
// Series are curated by hand (the catalog has no reliable series field to infer one from).
export async function POST(request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  const lang = String(body.lang || "en");
  try {
    const out = await saveSeries(await getCatalogDb(), lang, body);
    await Promise.all([invalidate(`series-page:${lang}:${out.slug}`), ...(body.books || []).map((b) => invalidate(`series-of:${lang}:${Number(b.id)}`))]);
    return NextResponse.json(out);
  } catch (e) {
    return NextResponse.json({ error: String(e.message || "failed") }, { status: 400 });
  }
}
