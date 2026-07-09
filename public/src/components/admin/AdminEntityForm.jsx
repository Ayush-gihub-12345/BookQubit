"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

export default function AdminEntityForm({ entity, label, fields, id }) {
  const isNew = !id;
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f.name, f.default ?? ""])));
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (isNew) return;
    fetch(`/api/admin/${entity}/${id}`).then((r) => r.json()).then((data) => {
      if (data.row) setValues((v) => ({ ...v, ...data.row }));
      setLoading(false);
    });
  }, [entity, id, isNew]);

  const set = (name, val) => setValues((v) => ({ ...v, [name]: val }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/admin/${entity}${isNew ? "" : `/${id}`}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) { setError("Save failed — check required fields."); return; }
      router.push(`/admin/${entity}`);
    } finally { setSaving(false); }
  };

  const remove = async () => {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    await fetch(`/api/admin/${entity}/${id}`, { method: "DELETE" });
    router.push(`/admin/${entity}`);
  };

  if (loading) return <p className="text-muted text-sm">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-white">{isNew ? `New ${label.slice(0, -1)}` : `Edit ${label.slice(0, -1)}`}</h1>
      <form onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
            <label className="text-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">
              {f.label} {f.required && <span className="text-red-400">*</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea rows={4} value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)}
                required={f.required}
                className="w-full rounded-lg border border-white/10 bg-[#131c31] px-3 py-2 text-sm text-white outline-none focus:border-brand-500" />
            ) : f.type === "checkbox" ? (
              <label className="flex items-center gap-2 pt-1.5 text-sm text-slate-300">
                <input type="checkbox" checked={Boolean(values[f.name])} onChange={(e) => set(f.name, e.target.checked)}
                  className="accent-brand-600" /> Enabled
              </label>
            ) : (
              <input type={f.type === "number" ? "number" : "text"} step={f.step} value={values[f.name] ?? ""}
                onChange={(e) => set(f.name, e.target.value)} required={f.required}
                className="w-full rounded-lg border border-white/10 bg-[#131c31] px-3 py-2 text-sm text-white outline-none focus:border-brand-500" />
            )}
          </div>
        ))}
        {error && <p className="text-sm text-red-400 sm:col-span-2">{error}</p>}
        <div className="flex items-center gap-3 sm:col-span-2">
          <button type="submit" disabled={saving} className="btn-primary text-sm">
            <Icon name="check" size={14} /> {saving ? "Saving…" : "Save"}
          </button>
          {!isNew && (
            <button type="button" onClick={remove} className="text-sm text-red-400 hover:underline">Delete record</button>
          )}
        </div>
      </form>
    </div>
  );
}
