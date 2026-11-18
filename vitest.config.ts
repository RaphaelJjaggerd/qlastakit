import { defineConfig } from "vitest/config";

// One Vitest run for the whole workspace. Each project owns its environment;
// the 0.3 core project and the API project (real Postgres, serial files) join here.
export default defineConfig({
  test: {
    projects: ["apps/web", "services/api"],
  },
});
