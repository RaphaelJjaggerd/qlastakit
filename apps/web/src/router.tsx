import { configureApi } from "@qlastakit/api-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { routeTree } from "./routeTree.gen";
import { createStubSession, type SessionSource } from "./session";
import { RouteError } from "./shell/access-denied";

// The browser always uses /api (the Vite dev proxy or the deploy's proxy rule). Server-side
// code has no origin, so it reaches the API through the internal URL (PRD 2.6).
function serverApiUrl(): string {
  const url = process.env.API_INTERNAL_URL;
  if (url) return url;
  // No quiet fallback outside dev: a deploy without the var must fail loudly.
  if (import.meta.env.DEV) return "http://localhost:8787/api";
  throw new Error("API_INTERNAL_URL is not set (the server-side URL of the API, ending in /api)");
}

configureApi(typeof window === "undefined" ? serverApiUrl() : "/api");

// Stub session until 2.4a; one per process is fine for a stub.
const stubSession = createStubSession();

export function getRouter(sessionSource: SessionSource = stubSession) {
  const queryClient = new QueryClient();
  return createRouter({
    routeTree,
    context: { sessionSource },
    defaultErrorComponent: RouteError,
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
