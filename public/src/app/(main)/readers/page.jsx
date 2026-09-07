import ReadersBrowser from "@/components/ReadersBrowser";
import { getLeaderboard, getPopularReaders } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Readers",
  description: "Browse the BookQubit community — top readers by activity and the most-followed profiles on the platform.",
  alternates: { canonical: "/readers" },
};

export default async function ReadersIndexPage() {
  // Both already cached 300s and shared with /leaderboard's own queries —
  // this page adds zero new database reads, it just gives them a browsable
  // home instead of forcing every visitor through a straight redirect.
  const [topReaders, popularReaders] = await Promise.all([
    getLeaderboard({ limit: 60 }),
    getPopularReaders(60),
  ]);
  return <ReadersBrowser topReaders={topReaders} popularReaders={popularReaders} />;
}
