import Icon from "./Icon";

// Shared "nothing here" block — the same icon/title/subtitle/actions shape
// was previously duplicated near-identically in BooksBrowser, ComicsBrowser,
// CollectionsBrowser, and FilterableBookGrid. `compact` matches
// FilterableBookGrid's smaller single-line variant (no bold title, smaller
// icon, tighter padding) rather than forcing every caller into one size.
export default function EmptyState({ icon = "search", title, subtitle, compact = false, children }) {
  return (
    <div className={compact ? "py-16 text-center" : "py-24 text-center"}>
      <Icon name={icon} size={compact ? 32 : 40} className="text-muted mx-auto" />
      {title && (
        <p className={compact ? "text-muted mt-3 text-sm" : "mt-4 text-lg font-semibold"}>{title}</p>
      )}
      {subtitle && <p className="text-muted mt-1 text-sm">{subtitle}</p>}
      {children && <div className="mt-5 flex flex-wrap justify-center gap-2.5">{children}</div>}
    </div>
  );
}
