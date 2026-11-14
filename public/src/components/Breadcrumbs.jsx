import Link from "next/link";
import Icon from "./Icon";

// The trail back up from wherever a reader landed. `items` is the path from
// the top down; every entry with an `href` is a link and the last entry is
// the current page (no link, aria-current). Home is added automatically.
//
//   <Breadcrumbs lang={lang} homeLabel="Home" items={[
//     { label: "Authors", href: "/authors" },
//     { label: "Franz Kafka" },
//   ]} />
//
// hrefs are written without the language prefix; it is added here. The
// separator is a rotated chevron icon, so it mirrors correctly in
// right-to-left languages (a typed "/" or ">" would not).
export default function Breadcrumbs({ lang, items, homeLabel = "Home", label = "Breadcrumb", className = "" }) {
  const trail = [{ label: homeLabel, href: "/" }, ...items];
  return (
    <nav aria-label={label} className={className}>
      <ol className="crumbs">
        {trail.map((c, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={i} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && <Icon name="chevronDown" size={12} className="-rotate-90 opacity-50 rtl:rotate-90" />}
              {c.href && !last ? (
                <Link href={`/${lang}${c.href === "/" ? "" : c.href}`} prefetch={false}>{c.label}</Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="truncate">{c.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
