import { configureApi } from "@qlastakit/api-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { routeTree } from "./routeTree.gen";

// The browser always uses /api (the Vite dev proxy or the deploy's proxy rule). Server-side
// code has no origin, so it reaches the API through the internal URL (PRD 2.6).
configureApi(
  typeof window === "undefined"
    ? (process.env.API_INTERNAL_URL ?? "http://localhost:8787/api")
    : "/api",
);

export function getRouter() {
  const queryClient = new QueryClient();
  return createRouter({
    routeTree,
    scrollRestoration: true,
    Wrap: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
