import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const envDir = "../../";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, "");
  // The same rule the deploy proxy uses: /api/* goes to the API, no prefix stripping.
  const api = `http://localhost:${env.API_PORT ?? 8787}`;
  return {
    envDir,
    server: { proxy: { "/api": api } },
    plugins: [tailwindcss(), tanstackStart(), viteReact()],
  };
});
