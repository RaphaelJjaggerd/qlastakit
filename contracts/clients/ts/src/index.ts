// Hand-written entry point. Everything under ./gen is generated: do not edit it.
// Regenerate with `just contract` after changing any API route.
import { client } from "./gen/client.gen";

export * from "./gen";

/** Call once at app start with the API base URL. */
export function configureApi(baseUrl: string) {
  client.setConfig({ baseUrl });
}
