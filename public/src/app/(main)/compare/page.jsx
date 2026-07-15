import ComparePicker from "@/components/ComparePicker";
import { getComparisonSuggestions } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Compare Books — Which Should You Read Next?",
  description: "Pick two or more books and compare them side by side: ratings, page count, format, and key takeaways.",
};

export default async function ComparePage() {
  const lang = await getLang();
  const suggested = await getComparisonSuggestions(lang);
  const suggestions = suggested.map((s) => ({ href: `/compare/${s.slug}`, label: s.title }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold sm:text-4xl">Compare Books</h1>
      <p className="text-muted mt-2 max-w-xl">
        Deciding between two or three books? Pick them below and see ratings, page count, format,
        and key takeaways side by side.
      </p>

      <div className="mt-8">
        <ComparePicker lang={lang} suggestions={suggestions} />
      </div>
    </div>
  );
}
