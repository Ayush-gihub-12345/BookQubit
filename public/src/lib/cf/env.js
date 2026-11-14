import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Resolve the Cloudflare env/ctx/cf for the current request.
 * Never throws: outside a Workers runtime (plain `next build`, tests) it returns
 * { env: {}, ctx: null, cf: null } so callers can degrade gracefully.
 * @returns {Promise<{ env: Record<string, any>, ctx: any, cf: any }>}
 */
export async function getCf() {
  try {
    const { env, ctx, cf } = await getCloudflareContext({ async: true });
    return { env: env || {}, ctx: ctx || null, cf: cf || null };
  } catch {
    return { env: {}, ctx: null, cf: null };
  }
}

/** Optional binding accessor — returns null when the binding is absent. */
export function optional(env, name) {
  const b = env && env[name];
  return b || null;
}

/** Run a promise after the response without blocking it (no-op wrapper offline). */
export function defer(ctx, promise) {
  const p = Promise.resolve(promise).catch(() => {});
  if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(p);
  return p;
}
