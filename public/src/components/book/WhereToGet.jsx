import Icon from "@/components/Icon";

// "Where to get it" (UI v2.1 store card). Every outbound link is honest about what it is:
//  - Amazon and Audible go through /api/go, which picks the storefront for the reader's country and logs the click;
//  - Open Library is a free borrowing link when the book has an ISBN.
// Prices are not shown: we don't hold live prices, and an invented number would be worse than none.
export default function WhereToGet({ book, goBuy, goAudible }) {
  const stores = [
    { name: "Amazon", href: goBuy, icon: "cart", note: "Affiliate link", rel: "noopener noreferrer sponsored" },
    { name: "Audible", href: goAudible, icon: "headphones", note: "External provider", rel: "noopener noreferrer sponsored" },
    book.isbn && { name: "Open Library", href: `https://openlibrary.org/isbn/${encodeURIComponent(book.isbn)}`, icon: "bookOpen", note: "Borrow for free", rel: "noopener noreferrer" },
  ].filter(Boolean);

  return (
    <section aria-labelledby="where-h" className="card mt-5 p-4">
      <h2 id="where-h" className="text-base font-bold">Where to get it</h2>
      <ul className="mt-2">
        {stores.map((s) => (
          <li key={s.name}>
            <a href={s.href} target="_blank" rel={s.rel} className="menu-item group">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--surface-2)] text-brand-700 transition-colors group-hover:bg-brand-400 group-hover:text-[var(--on-brand)]"><Icon name={s.icon} size={17} /></span>
              <span className="min-w-0"><span className="block font-semibold">{s.name}</span><span className="text-muted block text-xs">{s.note}</span></span>
              <Icon name="external" size={14} className="text-muted ms-auto" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
