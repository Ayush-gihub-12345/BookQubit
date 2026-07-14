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
  const { entity, id } = await params;
  const denied = await guard(entity);
  if (denied) return denied;
  const config = ENTITIES[entity];
  const db = await getCatalogDb();
  const row = await db.prepare(`SELECT * FROM ${config.table} WHERE id = ?1`).bind(id).first();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ row });
}

export async function PATCH(request, { params }) {
  const { entity, id } = await params;
  const denied = await guard(entity);
  if (denied) return denied;
  const config = ENTITIES[entity];
  const body = await request.json();

  const cols = config.fields.map((f) => f.name);
  const sets = cols.map((c, i) => `${c} = ?${i + 1}`).join(", ");
  const values = cols.map((c) => {
    const f = config.fields.find((x) => x.name === c);
    if (f.type === "checkbox") return body[c] ? 1 : 0;
    return body[c] ?? null;
  });

  const db = await getCatalogDb();
  await db.prepare(`UPDATE ${config.table} SET ${sets} WHERE id = ?${cols.length + 1}`)
    .bind(...values, id).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const { entity, id } = await params;
  const denied = await guard(entity);
  if (denied) return denied;
  const config = ENTITIES[entity];
  const db = await getCatalogDb();
  await db.prepare(`DELETE FROM ${config.table} WHERE id = ?1`).bind(id).run();
  return NextResponse.json({ ok: true });
}
