import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";

// The repo root, resolved from this file so it does not depend on the process cwd.
export const rootEnvDir = fileURLToPath(new URL("../../", import.meta.url));

// Reads the root env file for `mode`. Vite only exposes VITE_ vars, and TanStack Start
// loads .env from apps/web, not the root, so server-side code reads API_INTERNAL_URL from
// process.env: copy it there. A real env var wins.
export function loadRootEnv(mode: string): Record<string, string> {
  const env = loadEnv(mode, rootEnvDir, "");
  if (env.API_INTERNAL_URL) process.env.API_INTERNAL_URL ??= env.API_INTERNAL_URL;
  return env;
}
