import ComparePicker from "@/components/ComparePicker";
import { getComparisonSuggestions } from "@/lib/repo";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Compare Books — Which Should You Read Next?",
  description: "Pick two or more books and compare them side by side: ratings, page count, format, and key takeaways.",
  alternates: { canonical: "/compare" },
};

export default async function ComparePage() {
  const lang = await getLang();
  const _ = t(lang);
  const suggested = await getComparisonSuggestions(lang);
  const suggestions = suggested.map((s) => ({ href: `/compare/${s.slug}`, label: s.title }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold sm:text-4xl">{_("compareBooksTitle")}</h1>
      <p className="text-muted mt-2 max-w-xl">
        {_("compareBooksSub")}
      </p>

      <div className="mt-8">
        <ComparePicker lang={lang} suggestions={suggestions} />
      </div>
    </div>
  );
}
