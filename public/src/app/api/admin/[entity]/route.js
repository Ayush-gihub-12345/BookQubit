import { NextResponse } from "next/server";
import { getCatalogDb } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ENTITIES, isKnownEntity } from "@/lib/admin-entities";

async function guard(entity) {
  if (!isKnownEntity(entity)) return NextResponse.json({ error: "unknown entity" }, { status: 404 });
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return null;
}

export async function GET(request, { params }) {
  const { entity } = await params;
  const denied = await guard(entity);
  if (denied) return denied;
  const config = ENTITIES[entity];

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const lang = searchParams.get("lang");
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
  const perPage = 20;

  const where = [];
  const binds = [];
  if (q) {
    where.push(`(${config.searchCols.map((c) => `${c} LIKE ?`).join(" OR ")})`);
    config.searchCols.forEach(() => binds.push(`%${q}%`));
  }
  if (lang) { where.push("lang = ?"); binds.push(lang); }
  const wsql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const db = await getCatalogDb();
  const [count, rows] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS n FROM ${config.table} ${wsql}`).bind(...binds).first(),
    db.prepare(`SELECT * FROM ${config.table} ${wsql} ORDER BY id DESC LIMIT ? OFFSET ?`)
      .bind(...binds, perPage, (page - 1) * perPage).all(),
  ]);

  return NextResponse.json({
    rows: rows.results,
    total: count.n,
    page,
    pages: Math.max(1, Math.ceil(count.n / perPage)),
  });
}

export async function POST(request, { params }) {
  const { entity } = await params;
  const denied = await guard(entity);
  if (denied) return denied;
  const config = ENTITIES[entity];
  const body = await request.json();

  const cols = config.fields.map((f) => f.name);
  const values = cols.map((c) => {
    const f = config.fields.find((x) => x.name === c);
    if (f.type === "checkbox") return body[c] ? 1 : 0;
    return body[c] ?? f.default ?? null;
  });

  const db = await getCatalogDb();
  const placeholders = cols.map((_, i) => `?${i + 1}`).join(", ");
  const res = await db.prepare(`INSERT INTO ${config.table} (${cols.join(", ")}) VALUES (${placeholders})`)
    .bind(...values).run();
  return NextResponse.json({ ok: true, id: res.meta.last_row_id });
}
