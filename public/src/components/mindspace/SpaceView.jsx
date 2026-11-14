"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { authFetch, whenSignedIn } from "@/lib/authFetch";
import { useLang } from "@/lib/useLang";
import GraphView, { KIND_STYLE, nodeLabel } from "./GraphView";
import NodeInspector from "./NodeInspector";
import AddNodeForm from "./AddNodeForm";

// One space. `initial` = server-rendered public data (SEO + instant paint) or null for private spaces,
// which are only ever fetched client-side with the owner's token. Owners get editing; everyone gets
// List and Graph views.
export default function SpaceView({ slug, initial }) {
  const lang = useLang();
  const [data, setData] = useState(initial ? { ...initial, isOwner: false } : null);
  const [status, setStatus] = useState(initial ? "ready" : "loading"); // loading | ready | missing | unavailable
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    const user = await whenSignedIn();
    const res = user ? await authFetch(`/api/mindspace/${encodeURIComponent(slug)}`) : await fetch(`/api/mindspace/${encodeURIComponent(slug)}`);
    if (res.status === 503) return setStatus("unavailable");
    if (!res.ok) return initial ? undefined : setStatus("missing");
    setData(await res.json()); setStatus("ready");
  }, [slug, initial]);
  useEffect(() => { load(); }, [load]);

  if (status === "loading") return <div className="skeleton mx-auto mt-8 h-64 max-w-4xl" aria-hidden />;
  if (status === "unavailable") return <p className="text-muted mx-auto max-w-xl p-10 text-center">MindSpace isn&apos;t available yet.</p>;
  if (status === "missing" || !data) return (
    <div className="mx-auto max-w-xl p-10 text-center">
      <h1 className="font-editorial text-2xl">Space not found</h1>
      <p className="text-muted mt-2 text-sm">It may be private, or it may have been deleted. If it&apos;s yours, sign in to open it.</p>
      <Link href={`/${lang}/mindspace`} className="btn-primary mt-4 inline-flex">Go to MindSpace</Link>
    </div>
  );

  const { space, graph, isOwner } = data;
  const { nodes, edges } = graph;
  const sel = nodes.find((n) => n.id === selected) || null;
  const roots = nodes.filter((n) => !n.parent_id || !nodes.some((p) => p.id === n.parent_id));
  const kids = (id) => nodes.filter((n) => n.parent_id === id);

  async function patchSpace(p) {
    const r = await authFetch(`/api/mindspace/${space.id}`, { method: "PATCH", body: JSON.stringify(p) });
    if (r && r.ok) load();
  }

  const renderRow = (n, depth = 0) => {
    const s = KIND_STYLE[n.kind] || KIND_STYLE.note;
    return (
      <li key={n.id}>
        <button type="button" onClick={() => setSelected(n.id)} aria-pressed={selected === n.id} style={{ paddingInlineStart: 12 + depth * 20 }}
          className={`flex w-full items-center gap-2 rounded-xl py-2 pe-3 text-start text-sm ${selected === n.id ? "bg-brand-50" : "hover:bg-brand-50"}`}>
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.fill }} aria-hidden />
          <span className="min-w-0 flex-1 truncate">{nodeLabel(n)}</span>
          <span className="text-muted text-xs">{s.label}</span>
        </button>
        {kids(n.id).length > 0 && <ul>{kids(n.id).map((c) => renderRow(c, depth + 1))}</ul>}
      </li>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header>
        <h1 className="font-editorial text-3xl font-semibold">{space.title}</h1>
        {space.description && <p className="text-muted mt-1 max-w-2xl">{space.description}</p>}
        <p className="text-muted mt-2 flex flex-wrap items-center gap-x-3 text-sm">
          {space.owner_name && <span>By {space.owner_name}</span>}
          <span>{nodes.length} {nodes.length === 1 ? "idea" : "ideas"}</span>
          {isOwner && (
            <>
              <span>{space.visibility === "public" ? "Public" : "Private"}</span>
              <button type="button" className="text-brand-700 underline" onClick={() => patchSpace({ visibility: space.visibility === "public" ? "private" : "public" })}>
                Make {space.visibility === "public" ? "private" : "public"}
              </button>
            </>
          )}
        </p>
      </header>

      <div role="tablist" aria-label="View" className="border-line mt-5 flex gap-5 border-b">
        {[["list", "List"], ["graph", "Graph"]].map(([v, l]) => (
          <button key={v} role="tab" type="button" aria-selected={view === v} onClick={() => setView(v)}
            className={`-mb-px border-b-2 pb-2 text-sm font-medium ${view === v ? "border-brand-600 text-brand-700" : "text-muted border-transparent"}`}>{l}</button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-4">
          {view === "graph" ? (
            <GraphView nodes={nodes} edges={edges} selectedId={selected} onSelect={setSelected} editable={isOwner}
              onMove={(id, x, y) => authFetch(`/api/mindspace/${space.id}/items`, { method: "PATCH", body: JSON.stringify({ entity: "node", nodeId: id, x, y }) })} />
          ) : roots.length ? (
            <ul className="border-line bg-surface rounded-2xl border p-2">{roots.map((n) => renderRow(n))}</ul>
          ) : (
            <p className="text-muted border-line rounded-2xl border border-dashed p-10 text-center text-sm">{isOwner ? "Nothing here yet. Add your first idea below." : "No ideas have been added yet."}</p>
          )}
          {isOwner && <AddNodeForm space={space} lang={lang} onAdded={(n) => { load(); setSelected(n.id); }} />}
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          {sel ? (
            <NodeInspector key={sel.id} space={space} node={sel} nodes={nodes} edges={edges} isOwner={isOwner} lang={lang} onChanged={load} onClose={() => setSelected(null)} />
          ) : (
            <p className="text-muted border-line rounded-2xl border border-dashed p-6 text-sm">Select an idea to read it{isOwner ? ", edit it, or connect it to others" : ""}.</p>
          )}
        </div>
      </div>
    </div>
  );
}
