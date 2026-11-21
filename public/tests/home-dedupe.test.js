import { describe, it, expect } from "vitest";
import { makeTaker } from "@/lib/home-dedupe";

const books = (...slugs) => slugs.map((slug) => ({ slug }));

describe("home page: one book, one row", () => {
  it("never repeats a book across rows, and skips the hero picks", () => {
    const take = makeTaker(["a"]);
    const popular = take(books("a", "b", "c", "d"), 2);
    const fresh = take(books("c", "d", "e", "f"), 2);
    const top = take(books("a", "b", "e", "g", "h"), 5);
    expect(popular.map((b) => b.slug)).toEqual(["b", "c"]);
    expect(fresh.map((b) => b.slug)).toEqual(["d", "e"]);
    expect(top.map((b) => b.slug)).toEqual(["g", "h"]);
    const all = [...popular, ...fresh, ...top].map((b) => b.slug);
    expect(new Set(all).size).toBe(all.length);
  });
  it("copes with empty lists and rows without a slug", () => {
    const take = makeTaker();
    expect(take(undefined, 3)).toEqual([]);
    expect(take([{ title: "no slug" }, { slug: "x" }], 3).map((b) => b.slug)).toEqual(["x"]);
  });
});
