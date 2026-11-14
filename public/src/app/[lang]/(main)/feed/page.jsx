import FeedClient from "@/components/feed/FeedClient";
import { getFeed } from "@/lib/feed-server";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Feed",
  description: "Books, 1-minute summaries, quotes, authors and comics — all connected.",
};

export default async function FeedPage({ params }) {
  const { lang } = await params;
  // Page 1 is rendered on the server from the shared cache; a failure just shows the empty state.
  const initial = await getFeed(lang, "for-you", 1).catch(() => ({ cards: [], nextPage: null }));
  return (
    <>
      <h1 className="sr-only">Feed</h1>
      <FeedClient initial={initial} />
    </>
  );
}
