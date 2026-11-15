import { configureApi } from "@qlastakit/api-client";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

configureApi(import.meta.env.VITE_API_URL ?? "http://localhost:8787");

export function getRouter() {
  return createRouter({ routeTree, scrollRestoration: true });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
