import Link from "next/link";

// A titled block of content. The "view all" link is a real 44px tap target
// (it was a bare text link) and carries no trailing arrow glyph: the label
// already says where it goes, and an arrow appended to the end of a string
// reads as the wrong way round in right-to-left languages.
export default function Section({ id, title, subtitle, href, viewAllLabel = "View all", eyebrow, children }) {
  return (
    <section id={id} className="container-bq scroll-mt-24 py-8 sm:py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
          <h2 className="text-2xl font-bold sm:text-[1.75rem]">{title}</h2>
          {subtitle && <p className="text-muted mt-1 text-sm">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href} className="inline-flex min-h-11 shrink-0 items-center text-sm font-semibold text-brand-700 hover:underline">
            {viewAllLabel}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
