// Small force-directed layout (no dependencies). Deterministic for a given input so the graph
// doesn't reshuffle between renders: initial positions come from a seeded spiral, not Math.random.
// O(n^2) repulsion is fine for the 500-node space limit (run once, ~250 iterations, off the render path).

/**
 * @param {{id:string, x?:number, y?:number}[]} nodes   nodes with a saved position keep it (pinned)
 * @param {{source:string, target:string, weight?:number}[]} edges
 * @returns {Map<string,{x:number,y:number}>} positions inside [pad, width-pad] x [pad, height-pad]
 */
export function layout(nodes, edges, { width = 800, height = 560, iterations, pad = 30 } = {}) {
  const n = nodes.length;
  // O(n^2) per iteration: fewer iterations for big graphs keeps a 500-node space fast on a phone.
  iterations = iterations ?? Math.max(80, Math.min(250, Math.round(60000 / Math.max(n, 1))));
  const pos = new Map();
  if (!n) return pos;
  const cx = width / 2, cy = height / 2;
  const P = nodes.map((node, i) => {
    const pinned = Number.isFinite(node.x) && Number.isFinite(node.y);
    const a = i * 2.399963; // golden angle
    const r = 12 * Math.sqrt(i + 1) * 4;
    return { id: node.id, x: pinned ? node.x : cx + r * Math.cos(a), y: pinned ? node.y : cy + r * Math.sin(a), vx: 0, vy: 0, pinned };
  });
  const index = new Map(P.map((p, i) => [p.id, i]));
  const links = edges
    .map((e) => [index.get(e.source), index.get(e.target), e.weight || 1])
    .filter(([a, b]) => a !== undefined && b !== undefined && a !== b);

  const area = (width - 2 * pad) * (height - 2 * pad);
  const k = Math.sqrt(area / n) * 0.8; // ideal edge length
  let temp = Math.min(width, height) / 8;
  for (let it = 0; it < iterations; it++) {
    for (const p of P) { p.vx = 0; p.vy = 0; }
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let dx = P[i].x - P[j].x, dy = P[i].y - P[j].y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 0.01) { dx = (i % 2 ? 1 : -1) * 0.1; dy = (j % 2 ? 1 : -1) * 0.1; d2 = 0.02; }
        const d = Math.sqrt(d2);
        const f = (k * k) / d;
        const fx = (dx / d) * f, fy = (dy / d) * f;
        P[i].vx += fx; P[i].vy += fy; P[j].vx -= fx; P[j].vy -= fy;
      }
    }
    for (const [a, b, w] of links) {
      const dx = P[a].x - P[b].x, dy = P[a].y - P[b].y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const f = (d * d) / k * Math.min(2, w);
      const fx = (dx / d) * f, fy = (dy / d) * f;
      P[a].vx -= fx; P[a].vy -= fy; P[b].vx += fx; P[b].vy += fy;
    }
    for (const p of P) {
      p.vx += (cx - p.x) * 0.02; p.vy += (cy - p.y) * 0.02; // gentle gravity keeps components together
      if (p.pinned) continue;
      const d = Math.sqrt(p.vx * p.vx + p.vy * p.vy) || 0.01;
      const step = Math.min(d, temp);
      p.x += (p.vx / d) * step; p.y += (p.vy / d) * step;
      p.x = Math.min(width - pad, Math.max(pad, p.x));
      p.y = Math.min(height - pad, Math.max(pad, p.y));
    }
    temp *= 0.97;
  }
  for (const p of P) pos.set(p.id, { x: p.x, y: p.y });
  return pos;
}

/** Ids connected to `id` (for highlighting the neighbourhood of a selected node). */
export function neighbours(id, edges) {
  const s = new Set([id]);
  for (const e of edges) { if (e.source === id) s.add(e.target); if (e.target === id) s.add(e.source); }
  return s;
}
