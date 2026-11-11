import { describe, it, expect } from "vitest";
import { safeJsonLd } from "@/lib/jsonLd";

describe("safeJsonLd", () => {
  it("cannot be broken out of a <script> element", () => {
    const evil = { name: "x</script><script>alert(1)</script>", description: "<!-- <b> -->" };
    const out = safeJsonLd(evil);
    expect(out).not.toContain("<");
    expect(out.toLowerCase()).not.toContain("</script");
  });

  it("round-trips to the original data", () => {
    const data = { name: "x</script>y", n: 3, nested: { a: ["<", " ", " "] } };
    expect(JSON.parse(safeJsonLd(data))).toEqual(data);
  });

  it("leaves ordinary data readable", () => {
    expect(safeJsonLd({ "@type": "Book", name: "Dune" })).toBe('{"@type":"Book","name":"Dune"}');
  });
});
