"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { renderMarkdown } from "@/lib/markdown";
import { authFetch } from "@/lib/authFetch";
import { KIND_STYLE, nodeLabel } from "./GraphView";

const youtubeId = (u) => {
  try {
    const x = new URL(u);
    if (x.hostname === "youtu.be") return x.pathname.slice(1);
    if (x.hostname.endsWith("youtube.com")) return x.searchParams.get("v");
  } catch { /* not a URL */ }
  return null;
};

// Side panel for the selected node. Viewers get a read-only card; the owner can edit, connect,
// delete, and ask for related books (semantic search on the node's text).
export default function NodeInspector({ space, node, nodes, edges, isOwner, lang, onChanged, onClose }) {
  const [title, setTitle] = useState(node.title || "");
  const [body, setBody] = useState(node.body || "");
  const [target, setTarget] = useState("");
  const [rel, setRel] = useState("related");
  const [suggest, setSuggest] = useState(null);
  const [msg, setMsg] = useState("");
  useEffect(() => { setTitle(node.title || ""); setBody(node.body || ""); setSuggest(null); setMsg(""); }, [node.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const api = (method, payload) => authFetch(`/api/mindspace/${space.id}/items`, { method, body: JSON.stringify(payload) });
  const linked = edges.filter((e) => e.source_node_id === node.id || e.target_node_id === node.id);
  const style = KIND_STYLE[node.kind] || KIND_STYLE.note;
  const yt = node.url && youtubeId(node.url);
  const host = node.url ? new URL(node.url).hostname.replace(/^www\./, "") : null;

  async function save() {
    const r = await api("PATCH", { entity: "node", nodeId: node.id, title, body });
    setMsg(r && r.ok ? "Saved" : "Couldn't save. Try again."); if (r && r.ok) onChanged();
  }
  async function connect() {
    if (!target) return;
    const r = await api("POST", { entity: "edge", source: node.id, target, relation: rel });
    if (r && r.ok) { setTarget(""); onChanged(); } else setMsg("Couldn't connect those.");
  }
  async function findBooks() {
    setMsg("");
    const r = await authFetch(`/api/mindspace/${space.id}/suggest`, { method: "POST", body: JSON.stringify({ text: [title, body].filter(Boolean).join(". "), lang }) });
    if (!r) return;
    if (r.status === 429) return setMsg("You've reached the hourly limit for suggestions.");
    setSuggest(r.ok ? (await r.json()).books : []);
  }
  async function attach(book) {
    const created = await api("POST", { entity: "node", kind: "book", bookSlug: book.slug, title: book.title });
    if (!created || !created.ok) return setMsg("Couldn't add that book.");
    const n = await created.json();
    await api("POST", { entity: "edge", source: node.id, target: n.id, relation: "suggests" });
    setSuggest((s) => s.filter((b) => b.slug !== book.slug)); onChanged();
  }

  return (
    <aside className="border-line bg-surface rounded-2xl border p-4" aria-label="Selected idea">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium"><span className="h-2.5 w-2.5 rounded-full" style={{ background: style.fill }} />{style.label}</span>
        <button type="button" onClick={onClose} className="text-muted text-xs underline">Close</button>
      </div>

      {isOwner ? (
        <div className="mt-3 space-y-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} aria-label="Title" placeholder="Title" className="border-line bg-surface font-editorial w-full rounded-lg border px-3 py-2 text-lg font-semibold" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={20000} rows={6} aria-label="Notes (Markdown supported)" placeholder="Notes — Markdown supported" className="border-line bg-surface w-full rounded-lg border px-3 py-2 text-sm" />
          <button type="button" onClick={save} className="btn-primary !px-4 !py-1.5 !text-sm">Save</button>
        </div>
      ) : (
        <div className="mt-3">
          <h3 className="font-editorial text-lg font-semibold">{nodeLabel(node)}</h3>
          {node.body && <div className="font-editorial mt-2 space-y-2 text-sm leading-relaxed [&_a]:text-brand-700 [&_a]:underline [&_blockquote]:border-s-2 [&_blockquote]:ps-3 [&_ul]:list-disc [&_ul]:ps-5" dangerouslySetInnerHTML={{ __html: renderMarkdown(node.body) }} />}
        </div>
      )}

      {node.book_slug && <Link href={`/${lang}/books/${encodeURIComponent(node.book_slug)}`} className="text-brand-700 mt-3 inline-block text-sm underline">Open the book</Link>}
      {node.url && (
        <a href={node.url} target="_blank" rel="noopener noreferrer nofollow ugc" className="border-line mt-3 block overflow-hidden rounded-xl border text-sm">
          {yt && /* eslint-disable-next-line @next/next/no-img-element */ <img src={`https://img.youtube.com/vi/${encodeURIComponent(yt)}/hqdefault.jpg`} alt="" loading="lazy" className="aspect-video w-full object-cover" />}
          <span className="block px-3 py-2"><span className="block truncate font-medium">{nodeLabel(node)}</span><span className="text-muted text-xs">{host} · External link</span></span>
        </a>
      )}

      {linked.length > 0 && (
        <p className="text-muted mt-3 text-xs">Connected to {linked.length} other {linked.length === 1 ? "idea" : "ideas"}</p>
      )}

      {isOwner && (
        <div className="border-line mt-4 space-y-3 border-t pt-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <select value={target} onChange={(e) => setTarget(e.target.value)} aria-label="Connect to another idea" className="border-line bg-surface min-w-0 flex-1 rounded-lg border px-2 py-1.5">
              <option value="">Connect to…</option>
              {nodes.filter((n) => n.id !== node.id).map((n) => <option key={n.id} value={n.id}>{nodeLabel(n).slice(0, 40)}</option>)}
            </select>
            <input value={rel} onChange={(e) => setRel(e.target.value)} maxLength={40} aria-label="Relationship" className="border-line bg-surface w-24 rounded-lg border px-2 py-1.5" />
            <button type="button" onClick={connect} disabled={!target} className="border-line rounded-full border px-3 py-1.5 disabled:opacity-50">Connect</button>
          </div>
          <button type="button" onClick={findBooks} className="text-brand-700 font-medium underline">Suggest related books</button>
          {suggest && (suggest.length ? (
            <ul className="space-y-1.5">
              {suggest.map((b) => (
                <li key={b.slug} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate">{b.title} <span className="text-muted">· {b.author}</span></span>
                  <button type="button" onClick={() => attach(b)} className="text-brand-700 shrink-0 text-xs underline">Add</button>
                </li>
              ))}
            </ul>
          ) : <p className="text-muted">No related books found yet.</p>)}
          <button type="button" className="text-xs text-red-600 underline"
            onClick={async () => { if (confirm("Delete this idea? Its connections are removed too.")) { const r = await api("DELETE", { entity: "node", nodeId: node.id }); if (r && r.ok) { onClose(); onChanged(); } } }}>
            Delete idea
          </button>
        </div>
      )}
      <p role="status" className="text-muted mt-2 text-xs">{msg}</p>
    </aside>
  );
}
