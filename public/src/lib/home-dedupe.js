// "One book, one row" for the home page. Returns `take(list, n)`: the first n books of `list` that have not been shown
// yet; each one it returns is remembered, so no later row repeats it. `alreadyShown` seeds the set (for example the
// hero picks).
export function makeTaker(alreadyShown = []) {
  const shown = new Set(alreadyShown);
  const take = (list, n) => {
    const out = [];
    for (const b of list || []) {
      if (out.length >= n) break;
      if (!b?.slug || shown.has(b.slug)) continue;
      shown.add(b.slug);
      out.push(b);
    }
    return out;
  };
  take.shown = shown;
  return take;
}
