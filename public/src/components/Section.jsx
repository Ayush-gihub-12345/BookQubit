import Link from "next/link";

export default function Section({ id, title, subtitle, href, children }) {
  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href} className="text-sm font-semibold text-brand-600 hover:underline">
            View all →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
