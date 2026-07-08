import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-line bg-surface mt-16 border-t">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo size={32} />
          <p className="mt-2 text-sm text-slate-500">
            Discover great books, read summaries and key insights, and buy through trusted stores.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Explore</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/books" className="hover:text-brand-600">All Books</Link></li>
            <li><Link href="/books?sort=rating" className="hover:text-brand-600">Top Rated</Link></li>
            <li><Link href="/books?sort=new" className="hover:text-brand-600">New Releases</Link></li>
            <li><Link href="/collections" className="hover:text-brand-600">Collections</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Browse</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/authors" className="hover:text-brand-600">Authors</Link></li>
            <li><Link href="/publications" className="hover:text-brand-600">Publishers</Link></li>
            <li><Link href="/comics" className="hover:text-brand-600">Comics</Link></li>
            <li><Link href="/tags" className="hover:text-brand-600">Tags</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Disclosure</p>
          <p className="text-sm text-slate-500">
            As an Amazon Associate, BookQubit earns from qualifying purchases made through links on this site.
          </p>
        </div>
      </div>
      <div className="border-line text-muted border-t py-4 text-center text-xs">
        © {new Date().getFullYear()} BookQubit. All rights reserved.
      </div>
    </footer>
  );
}
