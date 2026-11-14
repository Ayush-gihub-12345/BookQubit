"use client";

import { Children, useEffect, useRef, useState } from "react";

// Book page tabs (UI v2.1): Summary · Details · Quotes · Reviews. The panels are rendered by the server page and passed
// in as children (same order as `tabs`); inactive ones are `hidden`, not removed, so their content stays in the page
// (indexable, and in-page links such as #summary, #reviews and #write-review keep working). The URL hash selects a tab.
const ALIAS = { "write-review": "reviews", takeaways: "summary" };

export default function BookTabs({ tabs, label, children }) {
  const panels = Children.toArray(children);
  const [active, setActive] = useState(tabs[0].id);
  const list = useRef(null);

  useEffect(() => {
    const fromHash = () => {
      const raw = decodeURIComponent(location.hash.replace("#", ""));
      const id = ALIAS[raw] || raw;
      if (tabs.some((t) => t.id === id)) {
        setActive(id);
        // let the panel show, then bring the exact target into view
        requestAnimationFrame(() => document.getElementById(raw)?.scrollIntoView({ block: "start" }));
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKey = (e) => {
    const i = tabs.findIndex((t) => t.id === active);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
    if (next == null) return;
    e.preventDefault();
    const t = tabs[(next + tabs.length) % tabs.length];
    setActive(t.id);
    list.current?.querySelector(`#tab-${t.id}`)?.focus();
  };

  return (
    <div className="mt-6">
      <div ref={list} role="tablist" aria-label={label} onKeyDown={onKey} className="tabs sticky top-16 z-20 bg-[var(--bg)]">
        {tabs.map((t) => (
          <button key={t.id} id={`tab-${t.id}`} type="button" role="tab" aria-selected={active === t.id} aria-controls={`panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1} onClick={() => setActive(t.id)} className="tab">
            {t.label}{t.count != null && t.count > 0 && <span className="tab-count ms-1.5">{t.count}</span>}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.id} id={`panel-${t.id}`} role="tabpanel" aria-labelledby={`tab-${t.id}`} hidden={active !== t.id} className="pt-2">
          {panels[i]}
        </div>
      ))}
    </div>
  );
}
