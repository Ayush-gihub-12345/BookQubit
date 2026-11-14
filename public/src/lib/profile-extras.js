import { getPrivacy } from "@/lib/safety";
import { streaks, dayKey } from "@/lib/library";
import { logError } from "@/lib/cf/logger";

/**
 * Everything the public reader profile shows beyond the existing shelf/reviews, with the reader's
 * privacy applied here (server-side) so hidden data never reaches the page at all:
 *   hideActivity  → no streak, no public shelves, and the page itself hides shelves/stats
 * Each part fails independently: a missing optional database just omits that section.
 * @returns {{ privacy, streak: {current, longest}|null, shelves: {id,name,n,slugs:string[]}[], spaces: {slug,title,node_count}[] }}
 */
export async function getProfileExtras(env, uid, now = new Date()) {
  const out = { privacy: { hideActivity: false, discoverable: true, bio: "" }, streak: null, shelves: [], spaces: [] };
  try { if (env.DB) out.privacy = await getPrivacy(env.DB, uid); } catch (e) { logError("profile.privacy", e); }

  // Public MindSpaces are public by the owner's explicit choice, independent of activity privacy.
  try {
    if (env.MINDSPACE_DB) {
      const { results } = await env.MINDSPACE_DB.prepare(
        "SELECT slug, title, node_count FROM mindspace_spaces WHERE user_id=?1 AND visibility='public' ORDER BY updated_at DESC LIMIT 12"
      ).bind(uid).all();
      out.spaces = results;
    }
  } catch (e) { logError("profile.spaces", e); }

  if (out.privacy.hideActivity || !env.ENGAGEMENT_DB) return out;

  try {
    const since = dayKey(now.getTime() - 400 * 86400000);
    const { results } = await env.ENGAGEMENT_DB.prepare(
      "SELECT day FROM daily_activity WHERE user_id=?1 AND day>=?2 AND (pages>0 OR audio_seconds>0 OR books_finished>0)"
    ).bind(uid, since).all();
    const s = streaks(results.map((r) => r.day), dayKey(now));
    out.streak = s.current > 0 || s.longest > 0 ? s : null;
  } catch (e) { logError("profile.streak", e); }

  try {
    const { results: shelves } = await env.ENGAGEMENT_DB.prepare(
      "SELECT id, name FROM custom_shelves WHERE user_id=?1 AND visibility='public' ORDER BY created_at DESC LIMIT 8"
    ).bind(uid).all();
    for (const sh of shelves) {
      const { results: items } = await env.ENGAGEMENT_DB.prepare(
        "SELECT book_slug FROM custom_shelf_items WHERE shelf_id=?1 ORDER BY added_at DESC, rowid DESC LIMIT 6"
      ).bind(sh.id).all();
      out.shelves.push({ id: sh.id, name: sh.name, slugs: items.map((i) => i.book_slug) });
    }
  } catch (e) { logError("profile.shelves", e); }
  return out;
}
