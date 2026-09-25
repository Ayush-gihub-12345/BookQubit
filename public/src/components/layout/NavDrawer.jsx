"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Icon from "../Icon";

// Direct links shown at the top of the drawer.
// `labelKey` → translated via t() (needs a key in the JSON files)
// `label`    → hardcoded string, no translation
const LINKS = [
  { href: "/news", icon: "bell", labelKey: "nav.news" },
  { href: "/collections", icon: "layers", labelKey: "discover.collections" },
  { href: "/academic", icon: "book", labelKey: "nav.academicBooks" },
  { href: "/quotes", icon: "hash", label: "Quotes" },
];

export default function NavDrawer({ open, onClose, mega, t }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        aria-hidden={!open}
        className={`bg-surface border-line fixed inset-y-0 left-0 z-[9999] flex h-screen w-80 max-w-[85vw] flex-col overflow-hidden border-r shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="border-line flex shrink-0 items-center justify-between border-b px-5 py-4">
          <p className="text-lg font-extrabold tracking-tight">
            Book<span className="text-brand-600">Qubit</span>
          </p>
          <button
            onClick={onClose}
            aria-label={t("nav.menu")}
            className="text-muted hover:text-brand-600 grid h-8 w-8 place-items-center rounded-full transition"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Direct links */}
          <div className="p-3">
            {LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                onClick={onClose}
                className="hover:bg-brand-50 dark:hover:bg-white/5 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition"
              >
                <Icon name={item.icon} size={15} className="text-muted" />
                {item.labelKey ? t(item.labelKey) : item.label}
              </Link>
            ))}
          </div>

          {/* MEGA collapsible sections */}
          <div className="border-line border-t p-3">
            {mega.map((col) => (
              <details key={col.title} className="group mb-1">
                <summary className="hover:bg-brand-50 dark:hover:bg-white/5 cursor-pointer list-none rounded-xl px-3 py-2.5 text-sm font-semibold transition">
                  <span className="inline-flex w-full items-center justify-between">
                    {col.title}
                    <span className="text-muted text-[10px] transition group-open:rotate-180">
                      ▼
                    </span>
                  </span>
                </summary>
                <div className="border-line ml-3 mt-1 space-y-0.5 border-l pl-3">
                  {col.links.map(([label, href]) => (
                    <Link
                      key={label}
                      href={href}
                      prefetch={false}
                      onClick={onClose}
                      className="text-muted hover:text-brand-600 block rounded-md px-2 py-1.5 text-[13px] transition"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </aside>
    </>,
    document.body,
  );
}
