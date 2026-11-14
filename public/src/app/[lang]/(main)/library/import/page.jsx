import LibraryShell from "@/components/library/LibraryShell";
import ImportView from "@/components/library/ImportView";

export const metadata = { title: "Import from Goodreads", robots: { index: false } };

export default function LibraryImportPage() {
  return <LibraryShell>{() => <ImportView />}</LibraryShell>;
}
