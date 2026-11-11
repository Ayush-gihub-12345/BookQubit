import { describe, it, expect } from "vitest";
import { GENRES, resolveGenres } from "@/lib/genres";
import { onBrandColor, deriveFullPalette, paletteToCssVars } from "@/lib/customTheme";

describe("resolveGenres", () => {
  const facets = [
    { name: "Fiction", count: 1051 },
    { name: "Fantasy", count: 113 },
    { name: "History", count: 81 },
    { name: "Poetry", count: 3 }, // below minCount
    { name: "Cats", count: 53 }, // not a curated genre
    { name: "New York Times bestseller", count: 160 }, // not a curated genre
  ];

  it("keeps only curated genres that exist, with their real counts", () => {
    const out = resolveGenres(facets);
    expect(out.map((g) => g.category)).toEqual(["Fiction", "Fantasy", "History"]);
    expect(out.map((g) => g.count)).toEqual([1051, 113, 81]);
  });

  it("never emits a genre with no books, whatever the catalog contains", () => {
    expect(resolveGenres([])).toEqual([]);
    expect(resolveGenres([{ name: "Unrelated", count: 500 }])).toEqual([]);
    for (const g of resolveGenres(facets)) expect(g.count).toBeGreaterThan(0);
  });

  it("excludes junk buckets that exist in the raw data", () => {
    const names = resolveGenres(facets).map((g) => g.category);
    expect(names).not.toContain("Cats");
    expect(names).not.toContain("New York Times bestseller");
  });

  it("honours limit and minCount", () => {
    expect(resolveGenres(facets, { limit: 2 })).toHaveLength(2);
    expect(resolveGenres(facets, { minCount: 1 }).map((g) => g.category)).toContain("Poetry");
  });

  it("curated list has unique categories", () => {
    const cats = GENRES.map((g) => g.category);
    expect(new Set(cats).size).toBe(cats.length);
  });
});

describe("onBrandColor", () => {
  it("uses white on dark fills and near-black on light fills", () => {
    expect(onBrandColor("#0f5b57")).toBe("#ffffff"); // brand teal
    expect(onBrandColor("#000000")).toBe("#ffffff");
    expect(onBrandColor("#f2c230")).toBe("#0b1110"); // marker yellow
    expect(onBrandColor("#ffffff")).toBe("#0b1110");
  });

  it("is part of the generated custom-theme CSS variables", () => {
    const palette = deriveFullPalette({ bg: "#101010", fg: "#f0f0f0", accent: "#ffe066" });
    const vars = paletteToCssVars(palette);
    expect(vars["--on-brand"]).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
