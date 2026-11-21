"use client";

import { useEffect } from "react";

// Keeps the browser/app chrome colour (<meta name="theme-color">: the status bar, and the bar under the content in an
// installed app) equal to the page's own background, whatever theme is active. The server sets the first value; this
// follows later changes (picking a theme, "Match device" switching with the OS, a custom palette) without a reload.
export default function ThemeColorSync() {
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      const bg = getComputedStyle(root).getPropertyValue("--bg").trim();
      if (!bg) return;
      let metas = [...document.querySelectorAll('meta[name="theme-color"]')];
      if (!metas.length) {
        const m = document.createElement("meta");
        m.name = "theme-color";
        document.head.appendChild(m);
        metas = [m];
      }
      // data-theme is already resolved to light or dark, so the OS-specific variants must agree with it.
      for (const m of metas) { m.removeAttribute("media"); m.setAttribute("content", bg); }
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme", "style"] });
    return () => mo.disconnect();
  }, []);
  return null;
}
