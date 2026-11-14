// `npm run dev:local` — next dev with the Node-SQLite stand-in for D1.
// A tiny wrapper only so the env var works on Windows and POSIX alike.
import { spawn } from "node:child_process";

const child = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "dev", ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, BQ_LOCAL_D1: "1" },
});
child.on("exit", (code) => process.exit(code ?? 0));
