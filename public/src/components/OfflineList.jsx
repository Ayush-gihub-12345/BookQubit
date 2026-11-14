"use client";

import { useEffect, useState } from "react";
import { listOffline, removeOffline } from "@/lib/offline";

export default function OfflineList() {
  const [items, setItems] = useState(null);
  useEffect(() => setItems(listOffline()), []);

  if (items === null) return <div className="skeleton mx-auto mt-8 h-16 max-w-md" aria-hidden />;
  if (!items.length) return <p className="text-muted mt-8 text-sm">Nothing saved yet — use “Save for offline” on any summary.</p>;

  return (
    <ul className="mt-8 space-y-2 text-left">
      {items.map((i) => (
        <li key={i.url} className="border-line bg-surface flex items-center justify-between gap-3 rounded-xl border px-4 py-3">
          <a href={i.url} className="min-w-0 truncate font-medium hover:underline">{i.title}</a>
          <button
            type="button"
            className="text-muted hover:text-fg shrink-0 text-xs"
            onClick={async () => {
              await removeOffline(i.url);
              setItems(listOffline());
            }}
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
