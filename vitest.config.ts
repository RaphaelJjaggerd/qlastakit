import { defineConfig } from "vitest/config";

// One Vitest run for the whole workspace. Each project owns its environment;
// the API project gets real Postgres and serial files in 0.4a.
export default defineConfig({
  test: {
    projects: ["apps/web", "packages/ts/core", "services/api"],
  },
});
