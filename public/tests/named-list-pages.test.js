import { describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/lib/repo", () => ({
  facets: vi.fn(async () => ({
    categories: [{ name: "Fiction, Romance", count: 3 }],
    collections: [{ name: "Test Collection", count: 2 }],
    tags: [{ name: "Cats & Dogs", count: 1 }],
  })),
}));
vi.mock("@/lib/lang", () => ({ getLang: vi.fn(async () => "en") }));

const PAGES = {
  categories: () => import("@/app/[lang]/(main)/categories/page.jsx"),
  collections: () => import("@/app/[lang]/(main)/collections/page.jsx"),
  tags: () => import("@/app/[lang]/(main)/tags/page.jsx"),
};

describe("categories / collections / tags pages", () => {
  // These are Server Components rendering a Client Component. React cannot send
  // a function across that boundary, and it made every request to these pages
  // throw. Anything that crosses must be plain data.
  it.each(Object.keys(PAGES))("%s: passes only serializable props to the client component", async (name) => {
    const { default: Page } = await PAGES[name]();
    const element = await Page();
    for (const [key, value] of Object.entries(element.props)) {
      expect(typeof value, `${name} prop "${key}"`).not.toBe("function");
    }
  });
});

describe("NamedListBrowser links", () => {
  it("builds hrefs from the prefix plus the URL-encoded name", async () => {
    const { default: NamedListBrowser } = await import("@/components/NamedListBrowser.jsx");
    const html = renderToStaticMarkup(
      createElement(NamedListBrowser, {
        items: [{ name: "Fiction, Romance", count: 3 }, { name: "Cats & Dogs", count: 1 }],
        hrefPrefix: "/en/books?category=",
        title: "Categories",
      })
    );
    expect(html).toContain('href="/en/books?category=Fiction%2C%20Romance"');
    expect(html).toContain('href="/en/books?category=Cats%20%26%20Dogs"');
    // plural and singular noun handling is unchanged
    expect(html).toMatch(/3 books/);
    expect(html).toMatch(/1 book(?!s)/);
  });

  it("supports a path-style prefix (collections)", async () => {
    const { default: NamedListBrowser } = await import("@/components/NamedListBrowser.jsx");
    const html = renderToStaticMarkup(
      createElement(NamedListBrowser, { items: [{ name: "Test Collection", count: 2 }], hrefPrefix: "/en/collections/", title: "Collections" })
    );
    expect(html).toContain('href="/en/collections/Test%20Collection"');
  });
});
