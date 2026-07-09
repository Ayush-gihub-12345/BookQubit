"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

const FIELDS = [
  { key: "social_twitter", label: "X / Twitter URL", placeholder: "https://x.com/bookqubit" },
  { key: "social_instagram", label: "Instagram URL", placeholder: "https://instagram.com/bookqubit" },
  { key: "social_facebook", label: "Facebook URL", placeholder: "https://facebook.com/bookqubit" },
  { key: "social_youtube", label: "YouTube URL", placeholder: "https://youtube.com/@bookqubit" },
];

export default function AdminSettingsPage() {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => { setValues(d.settings || {}); setLoading(false); });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setSaved(false);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      setSaved(true);
    } finally { setSaving(false); }
  };

  if (loading) return <p className="text-muted text-sm">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
        <Icon name="grid" size={20} /> Site Settings
      </h1>
      <p className="text-muted mt-1 text-sm">
        Social links shown in the footer. Leave a field blank to hide that icon on the live site.
      </p>

      <form onSubmit={save} className="mt-6 space-y-4">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="text-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">{f.label}</label>
            <input
              value={values[f.key] || ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="w-full rounded-lg border border-white/10 bg-[#131c31] px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
            />
          </div>
        ))}
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          <Icon name="check" size={14} /> {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
