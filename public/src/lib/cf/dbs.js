import { getCf } from "./env.js";

// Data layout (see ARCHITECTURE_PLAN.md):
//   DB            accounts, social graph, discussions, moderation   (existing)
//   CATALOG_DB    books, authors, publications, comics, summaries    (existing)
//   ENGAGEMENT_DB reading log, daily activity, shelves, audio state  (new, write-heavy)
//   MINDSPACE_DB  spaces, nodes, edges (user knowledge)              (new)
// The two new ones are optional: when a binding is absent the matching feature reports
// "unavailable" instead of crashing the site.

export async function getEngagementDb() {
  const { env } = await getCf();
  return env.ENGAGEMENT_DB || null;
}

export async function getMindspaceDb() {
  const { env } = await getCf();
  return env.MINDSPACE_DB || null;
}

/** JSON response for a feature whose database binding isn't provisioned yet. */
export function unavailable(feature) {
  return Response.json({ error: "feature_unavailable", feature }, { status: 503 });
}
