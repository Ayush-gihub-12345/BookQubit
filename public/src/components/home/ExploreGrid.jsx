import Link from "next/link";
import Icon from "@/components/Icon";

// A compact "where do you want to go" grid: eight rounded icon tiles with a short label under each, in one card.
// Quiet on purpose: the tiles use the active theme's own tint, no gradients. Every target is a page that always has content.
export default function ExploreGrid({ lang, title = "Explore BookQubit", labels }) {
  const tiles = [
    { href: "/books", icon: "book", label: labels.books },
    { href: "/listen", icon: "headphones", label: labels.listen },
    { href: "/authors", icon: "feather", label: labels.authors },
    { href: "/comics", icon: "layers", label: labels.comics },
    { href: "/collections", icon: "bookmarkPlus", label: labels.collections },
    { href: "/community", icon: "users", label: labels.community },
    { href: "/library", icon: "bookmark", label: labels.shelf },
    { href: "/categories", icon: "grid", label: labels.genres },
  ];
  return (
    <section className="container-bq pt-5 sm:pt-7" aria-labelledby="explore-h">
      <div className="card p-4 sm:p-6 hover:!translate-y-0">
        <h2 id="explore-h" className="font-display text-lg font-bold sm:text-xl">{title}</h2>
        <ul className="mt-4 grid grid-cols-4 gap-x-2 gap-y-5 sm:gap-x-4">
          {tiles.map((t) => (
            <li key={t.href}>
              <Link href={`/${lang}${t.href}`} prefetch={false} className="group flex flex-col items-center gap-2 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--color-brand-500)_12%,var(--surface))] text-brand-700 transition-colors group-hover:bg-[color-mix(in_srgb,var(--color-brand-500)_22%,var(--surface))] group-active:scale-95 sm:h-16 sm:w-16">
                  <Icon name={t.icon} size={24} strokeWidth={1.8} />
                </span>
                <span className="text-[12.5px] font-semibold leading-tight sm:text-sm">{t.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
