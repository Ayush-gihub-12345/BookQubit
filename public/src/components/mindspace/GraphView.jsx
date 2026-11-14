"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { layout, neighbours } from "@/lib/graph-layout";

const W = 800, H = 560;
export const KIND_STYLE = {
  note: { fill: "var(--color-brand-500)", label: "Note" },
  book: { fill: "var(--gold)", label: "Book" },
  quote: { fill: "#8b5cf6", label: "Quote" },
  link: { fill: "#0ea5e9", label: "Link" },
  question: { fill: "#ef4444", label: "Question" },
  audio: { fill: "#14b8a6", label: "Audio" },
};
const short = (s, n = 22) => (s && s.length > n ? s.slice(0, n - 1) + "…" : s || "");
export const nodeLabel = (n) => n.title || n.book_slug || n.body?.slice(0, 40) || n.url || "Untitled";

// SVG force graph: click to select (highlights the neighbourhood), drag to rearrange (owner only).
// Layout runs once per graph shape, deferred so the page stays responsive, then settles.
export default function GraphView({ nodes, edges, selectedId, onSelect, editable, onMove }) {
  const [pos, setPos] = useState(null);
  const drag = useRef(null);
  const svg = useRef(null);

  const shape = useMemo(() => nodes.map((n) => n.id).join("|") + "#" + edges.map((e) => e.id).join("|"), [nodes, edges]);
  useEffect(() => {
    const id = setTimeout(() => {
      const p = layout(
        nodes.map((n) => ({ id: n.id, x: n.pos_x, y: n.pos_y })),
        edges.map((e) => ({ source: e.source_node_id, target: e.target_node_id, weight: e.weight })),
        { width: W, height: H }
      );
      setPos(p);
    }, 0);
    return () => clearTimeout(id);
  }, [shape]); // eslint-disable-line react-hooks/exhaustive-deps

  const near = useMemo(() => (selectedId ? neighbours(selectedId, edges.map((e) => ({ source: e.source_node_id, target: e.target_node_id }))) : null), [selectedId, edges]);

  function toSvg(e) {
    const pt = svg.current.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.current.getScreenCTM().inverse());
    return { x: Math.min(W - 20, Math.max(20, p.x)), y: Math.min(H - 20, Math.max(20, p.y)) };
  }

  if (!pos) return <div className="skeleton h-[420px] w-full" aria-hidden />;
  if (!nodes.length) return <p className="text-muted py-16 text-center text-sm">No ideas here yet.</p>;

  return (
    <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="border-line bg-surface h-auto w-full touch-none rounded-2xl border" role="group" aria-label="Knowledge graph"
      onPointerMove={(e) => {
        if (!drag.current) return;
        const p = toSvg(e);
        drag.current.moved = true;
        setPos((m) => new Map(m).set(drag.current.id, p));
      }}
      onPointerUp={() => {
        const d = drag.current; drag.current = null;
        if (d?.moved && editable) { const p = pos.get(d.id); onMove?.(d.id, Math.round(p.x), Math.round(p.y)); }
      }}
      onPointerLeave={() => { drag.current = null; }}>
      {edges.map((e) => {
        const a = pos.get(e.source_node_id), b = pos.get(e.target_node_id);
        if (!a || !b) return null;
        const dim = near && !(near.has(e.source_node_id) && near.has(e.target_node_id));
        return <line key={e.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--muted)" strokeWidth={Math.min(3, 0.8 + e.weight * 0.4)} opacity={dim ? 0.12 : 0.5}><title>{e.relation_type}</title></line>;
      })}
      {nodes.map((n) => {
        const p = pos.get(n.id); if (!p) return null;
        const selected = n.id === selectedId, dim = near && !near.has(n.id);
        const style = KIND_STYLE[n.kind] || KIND_STYLE.note;
        return (
          <g key={n.id} transform={`translate(${p.x} ${p.y})`} opacity={dim ? 0.25 : 1} style={{ cursor: editable ? "grab" : "pointer" }}
            tabIndex={0} role="button" aria-label={`${style.label}: ${nodeLabel(n)}`} aria-pressed={selected}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); drag.current = editable ? { id: n.id, moved: false } : null; }}
            onClick={() => onSelect(n.id)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(n.id); } }}>
            <circle r={selected ? 13 : 10} fill={style.fill} stroke={selected ? "var(--fg)" : "var(--surface)"} strokeWidth={selected ? 3 : 2} />
            <text y={24} textAnchor="middle" fontSize="11" fill="var(--fg)" style={{ paintOrder: "stroke", stroke: "var(--surface)", strokeWidth: 3 }}>{short(nodeLabel(n))}</text>
          </g>
        );
      })}
    </svg>
  );
}
