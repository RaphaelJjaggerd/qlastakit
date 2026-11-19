import { defineConfig } from "@playwright/test";
import { testUrl } from "./services/api/test/urls.ts";

// The smoke test starts both dev servers itself (the API and the web app, so the Vite
// proxy applies) on their own ports, against the test database. The only pre-step,
// creating and migrating that database, is e2e/global-setup.mts.
const API_PORT = "8799";
const WEB_PORT = "3100";
const apiUrl = `http://localhost:${API_PORT}/api`;

export default defineConfig({
  testDir: "e2e",
  testMatch: "*.spec.mts",
  globalSetup: "./e2e/global-setup.mts",
  reporter: "list",
  use: { baseURL: `http://localhost:${WEB_PORT}` },
  webServer: [
    {
      command: "pnpm --filter @qlastakit/api start",
      url: `${apiUrl}/health`,
      env: { API_PORT, DATABASE_URL: testUrl },
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: `pnpm --filter @qlastakit/web exec vite dev --port ${WEB_PORT} --strictPort`,
      url: `http://localhost:${WEB_PORT}`,
      env: { API_PORT, API_INTERNAL_URL: apiUrl },
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
