import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const envDir = "../../";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, "");
  // The same rule the deploy proxy uses: /api/* goes to the API, no prefix stripping.
  const api = `http://localhost:${env.API_PORT ?? 8787}`;
  // Vite only exposes VITE_ vars; server-side code reads API_INTERNAL_URL from process.env,
  // and TanStack Start loads .env from apps/web, not the root. A real env var wins.
  if (env.API_INTERNAL_URL) process.env.API_INTERNAL_URL ??= env.API_INTERNAL_URL;
  return {
    envDir,
    resolve: { tsconfigPaths: true },
    server: { proxy: { "/api": api } },
    plugins: [tailwindcss(), tanstackStart(), viteReact()],
  };
});
