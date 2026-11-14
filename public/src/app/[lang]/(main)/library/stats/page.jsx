import LibraryShell from "@/components/library/LibraryShell";
import StatsView from "@/components/library/StatsView";

export const metadata = { title: "Reading stats", robots: { index: false } };

export default function LibraryStatsPage() {
  return <LibraryShell>{() => <StatsView />}</LibraryShell>;
}
