import Link from "next/link";

// A titled block of content. The "view all" link is a real 44px tap target
// (it was a bare text link) and carries no trailing arrow glyph: the label
// already says where it goes, and an arrow appended to the end of a string
// reads as the wrong way round in right-to-left languages.
export default function Section({ id, title, subtitle, href, viewAllLabel = "View all", children }) {
  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-24 px-4 py-8 sm:py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
          {subtitle && <p className="text-muted mt-1 text-sm">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href} className="inline-flex min-h-11 shrink-0 items-center text-sm font-semibold text-brand-600 hover:underline">
            {viewAllLabel}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
