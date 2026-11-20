// Hand-written entry point. Everything under ./gen is generated: do not edit it.
// Regenerate with `mise run contract` after changing any API route.
import { client } from "./gen/client.gen";

export * from "./gen";
// TanStack Query options and mutations generated from the same spec.
export * from "./gen/@tanstack/react-query.gen";

/** Call once at app start with the API base URL. */
export function configureApi(baseUrl: string) {
  client.setConfig({ baseUrl });
}
