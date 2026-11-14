import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCf } from "@/lib/cf/env";
import { cacheStats } from "@/lib/db";
import { bumpGroup, readVersions } from "@/lib/cache-versions";
import { getCatalogDb } from "@/lib/db";
import { rebuildReadModels, readModelMeta } from "@/lib/read-models";
import { CACHE_GROUPS, TTL, STALE_IF_ERROR_SECONDS } from "@/lib/cache-policy";

// Cache management for admins.
//   GET  → { stats, versions, groups, ttl, kvBound }   what is answering requests, and group versions
//   POST { group: "catalog"|"community"|"feed"|"search"|"settings"|"spaces"|"all" }
//        → bumps that group's version: every cached copy of it becomes unreachable everywhere at once
//          (old copies simply expire). Gentle by design: it never deletes anything, so the next requests
//          rebuild entries one by one instead of stampeding the database.
// Needs the CACHE_KV binding; without it entries just expire by TTL and POST reports that.
const unauthorized = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const { env } = await getCf();
  return NextResponse.json({
    stats: cacheStats(),
    versions: await readVersions(env),
    groups: CACHE_GROUPS,
    ttl: { ...TTL, staleIfErrorSeconds: STALE_IF_ERROR_SECONDS },
    kvBound: !!env.CACHE_KV,
    readModels: await readModelMeta(await getCatalogDb()).catch(() => null),
  });
}

export async function POST(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const { group, action } = await request.json().catch(() => ({}));
  // Rebuild the catalog read models (tag / author / publisher / format lookups and facet counts) after an import or a
  // bulk edit, then clear the catalog cache group so pages pick them up. One atomic batch; readers never see half.
  if (action === "rebuild-read-models") {
    try {
      const meta = await rebuildReadModels(await getCatalogDb());
      const { env } = await getCf();
      await bumpGroup(env, "catalog");
      return NextResponse.json({ ok: true, readModels: meta });
    } catch (e) {
      return NextResponse.json({ ok: false, message: "Couldn't rebuild: apply migrations/catalog/0002_read_models.sql first." }, { status: 500 });
    }
  }
  if (group !== "all" && !CACHE_GROUPS.includes(group)) return NextResponse.json({ error: "unknown group" }, { status: 400 });
  const { env } = await getCf();
  const versions = await bumpGroup(env, group);
  if (!versions) {
    return NextResponse.json({ ok: false, reason: env.CACHE_KV ? "failed" : "no_kv", message: env.CACHE_KV ? "Couldn't update the cache version." : "KV isn't bound here, so caches simply expire on their own within their lifetime." }, { status: env.CACHE_KV ? 500 : 200 });
  }
  return NextResponse.json({ ok: true, versions });
}
