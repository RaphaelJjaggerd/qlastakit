// Starts the real app in this process on a free port; tests call it with fetch.
import type { AddressInfo } from "node:net";
import { createApp } from "../src/app";

export async function startApp(options: Parameters<typeof createApp>[0] = {}) {
  const app = await createApp(options);
  await app.listen(0, "127.0.0.1");
  const { port } = app.getHttpServer().address() as AddressInfo;
  return {
    // Everything is served under /api (PRD 2.6).
    baseUrl: `http://127.0.0.1:${port}/api`,
    close: () => app.close(),
  };
}
