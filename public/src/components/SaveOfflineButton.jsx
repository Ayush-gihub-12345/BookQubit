"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";
import { canSaveOffline, isSavedOffline, saveOffline, removeOffline } from "@/lib/offline";

// "Save for offline" toggle for a summary / note page. Renders nothing where Cache
// Storage is unavailable, so it is never a dead control.
export default function SaveOfflineButton({ url, title, kind = "summary", className = "" }) {
  const [supported, setSupported] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSupported(canSaveOffline());
    setSaved(isSavedOffline(url));
  }, [url]);

  if (!supported) return null;

  async function toggle() {
    setBusy(true);
    if (saved) {
      await removeOffline(url);
      setSaved(false);
    } else {
      setSaved(await saveOffline(url, { title, kind }));
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      className={`border-line text-fg hover:bg-brand-50 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${className}`}
    >
      <Icon name={saved ? "check" : "bookmark"} size={14} />
      {saved ? "Saved offline" : "Save for offline"}
    </button>
  );
}
