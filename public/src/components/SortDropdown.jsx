"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

// A real dropdown (button + popover menu), distinct from the pill/chip
// filter rows used elsewhere — for "sort by" style single-choice pickers.
// Closes on outside click or Escape, same pattern as AuthButton's account menu.
export default function SortDropdown({ value, options, onChange, label = "Sort" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKeyDown = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="border-line bg-surface flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold hover:border-brand-500/50"
        aria-haspopup="listbox" aria-expanded={open}
      >
        <Icon name="barChart" size={13} className="text-muted" />
        <span className="text-muted">{label}:</span> {current?.label}
        <Icon name="chevronDown" size={12} className={`text-muted transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-line bg-surface absolute right-0 top-full z-50 mt-1.5 w-48 overflow-hidden rounded-xl border shadow-xl" role="listbox">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              role="option" aria-selected={o.value === value}
              className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm hover:bg-brand-50 dark:hover:bg-white/5 ${
                o.value === value ? "font-semibold text-brand-600" : ""
              }`}
            >
              {o.label}
              {o.value === value && <Icon name="check" size={13} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
