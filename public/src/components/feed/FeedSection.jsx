"use client";

import Link from "next/link";
import Icon from "../Icon";

export default function FeedSection({ title, subtitle, href, children }) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight sm:text-xl">
            {title}
          </h2>
          {subtitle && <p className="text-muted mt-0.5 text-sm">{subtitle}</p>}
        </div>
        {href && (
          <Link
            href={href}
            prefetch={false}
            className="text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 text-sm font-semibold"
          >
            See all <Icon name="arrowRight" size={14} />
          </Link>
        )}
      </div>

      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-0 sm:px-0">
        {children}
      </div>
    </section>
  );
}
