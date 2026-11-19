// Starts the real app in this process on a free port; tests call it with fetch.
import { serve } from "@hono/node-server";
import type { AddressInfo } from "node:net";
import { createApp } from "../src/app";

export async function startApp() {
  const server = serve({ fetch: createApp().fetch, port: 0 });
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  const address = server.address() as AddressInfo;
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => server.close((e) => (e ? reject(e) : resolve()))),
  };
}
