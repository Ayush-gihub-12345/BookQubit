"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { deriveFullPalette, paletteToCssVars, encodeCustomTheme, decodeCustomTheme } from "@/lib/customTheme";
import { useLang } from "@/lib/useLang";
import { t } from "@/lib/i18n";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// If the reader already has a custom theme saved, re-opening this modal
// should show THEIR colors, not reset to the defaults — reads and decodes
// the same cookie app/layout.jsx reads server-side.
function readSavedCustomTheme() {
  try {
    const match = document.cookie.match(/(?:^|;\s*)customTheme=([^;]+)/);
    return match ? decodeCustomTheme(match[1]) : null;
  } catch {
    return null;
  }
}

// Reader picks 3 colors; the rest of the 12-variable palette every theme
// needs (see globals.css) is derived automatically — see lib/customTheme.js
// for the actual color math. Saved the same way every preset theme already
// is (a plain cookie, read server-side in app/layout.jsx), so there's no
// flash of the wrong colors and no new backend/database work.
export default function CustomThemeModal({ onClose }) {
  const router = useRouter();
  const tr = t(useLang());
  const [saved] = useState(readSavedCustomTheme);
  const [bg, setBg] = useState(saved?.bg || "#0d1322");
  const [fg, setFg] = useState(saved?.fg || "#e4e8f4");
  const [accent, setAccent] = useState(saved?.brand500 || "#6366f1");
  const [saving, setSaving] = useState(false);

  const palette = useMemo(() => deriveFullPalette({ bg, fg, accent }), [bg, fg, accent]);
  const previewStyle = useMemo(() => paletteToCssVars(palette), [palette]);

  const save = () => {
    setSaving(true);
    const encoded = encodeCustomTheme(palette);
    document.cookie = `theme=custom;path=/;max-age=${COOKIE_MAX_AGE}`;
    document.cookie = `customTheme=${encoded};path=/;max-age=${COOKIE_MAX_AGE}`;
    router.refresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-6 hover:!translate-y-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{tr("customThemeModalTitle")}</h2>
          <button onClick={onClose} className="text-muted hover:text-brand-600"><Icon name="x" size={18} /></button>
        </div>
        <p className="text-muted mt-1.5 text-sm">{tr("customThemeModalDesc")}</p>

        <div className="mt-5 space-y-3">
          {[
            [tr("backgroundColorLabel"), bg, setBg],
            [tr("textColorLabel"), fg, setFg],
            [tr("accentColorLabel"), accent, setAccent],
          ].map(([label, value, setter]) => (
            <label key={label} className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{label}</span>
              <span className="flex items-center gap-2">
                <span className="text-muted font-mono text-xs uppercase">{value}</span>
                <input
                  type="color" value={value} onChange={(e) => setter(e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded-lg border border-line p-0.5"
                  aria-label={label}
                />
              </span>
            </label>
          ))}
        </div>

        {/* Live preview — an isolated swatch styled with the derived palette
            via inline CSS variables, so the reader sees the real result
            before committing to it (rather than the whole page flashing
            while they're still adjusting colors). */}
        <div className="mt-5 rounded-2xl border p-4" style={{ ...previewStyle, background: "var(--bg)", borderColor: "var(--line)" }}>
          <p className="text-muted mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{tr("previewLabel")}</p>
          <div className="rounded-xl p-3" style={{ background: "var(--surface)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>BookQubit</p>
            <span className="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium" style={{ background: "var(--pill-bg)", color: "var(--pill-fg)" }}>
              {tr("customThemeLabel")}
            </span>
            <button
              className="mt-3 block rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background: "var(--color-brand-600)" }}
            >
              {tr("sampleButtonLabel")}
            </button>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost text-sm">{tr("cancel")}</button>
          <button onClick={save} disabled={saving} className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-40">
            {tr("saveThemeLabel")}
          </button>
        </div>
      </div>
    </div>
  );
}
