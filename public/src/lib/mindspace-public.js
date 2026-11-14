import { cached, invalidate } from "@/lib/db";
import { getCf } from "@/lib/cf/env";
import { getSpace, getGraph } from "@/lib/mindspace";

const key = (slug) => `ms-public:${slug}`;

/**
 * Public space for SEO pages: { space, graph } or null (private / missing / DB unavailable).
 * Cached for 5 minutes through the shared tiers, so crawler traffic doesn't hit D1 per request.
 * Privacy-critical writes (visibility change, delete) call invalidatePublicSpace().
 */
export async function getPublicSpace(slug) {
  try {
    return await cached(
      key(slug),
      async () => {
        const { env } = await getCf();
        if (!env.MINDSPACE_DB) return null;
        const found = await getSpace(env.MINDSPACE_DB, slug, null); // uid=null → public only
        if (!found) return null;
        const { space } = found;
        return {
          space: { id: space.id, slug: space.slug, title: space.title, description: space.description, owner_name: space.owner_name, node_count: space.node_count, updated_at: space.updated_at },
          graph: await getGraph(env.MINDSPACE_DB, space.id),
        };
      },
      300
    );
  } catch {
    return null;
  }
}

export const invalidatePublicSpace = (slug) => invalidate(key(slug));
