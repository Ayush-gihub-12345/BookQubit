import LibraryShell from "@/components/library/LibraryShell";
import LibraryView from "@/components/library/LibraryView";

export const metadata = { title: "Your library", robots: { index: false } };

export default function LibraryPage() {
  return <LibraryShell>{(user) => <LibraryView user={user} />}</LibraryShell>;
}
