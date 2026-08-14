import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import sirv from "sirv";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const dist = resolve(root, "dist");
const port = Number(process.env.E2E_PORT ?? 4330);
const host = process.env.E2E_HOST ?? "127.0.0.1";

if (!existsSync(resolve(dist, "index.html"))) {
  execFileSync("pnpm", ["exec", "expo", "export", "--platform", "web"], {
    cwd: root,
    stdio: "inherit"
  });
}

const assets = sirv(dist, { single: true, dev: false, etag: true });

createServer((req, res) => assets(req, res)).listen(port, host, () => {
  console.log(`SPA server (index.html fallback) on http://${host}:${port}`);
});
