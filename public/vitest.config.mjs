import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Mirrors the "@/*" -> "src/*" alias in jsconfig.json so route handlers and
// libs import exactly as they do in the app.
export default defineConfig({
  // Next compiles JSX with the automatic runtime; match it so components can be
  // rendered in tests without importing React.
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
  },
});
