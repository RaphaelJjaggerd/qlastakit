import { redirect } from "@tanstack/react-router";
import { appConfig, type LayoutKey } from "./config/app.config";
import type { Role, Session, SessionSource } from "./session";

/** What a route declares in its static data (PRD 3.1: key, authority, layout). */
export interface RouteStaticData {
  key?: string;
  authority?: Role[];
  layout?: LayoutKey;
}

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption extends RouteStaticData {}
}

export interface RouterContext {
  sessionSource: SessionSource;
}

export class AccessDeniedError extends Error {
  constructor() {
    super("access_denied");
  }
}

/** Empty authority means any signed-in user. */
export function hasAuthority(session: Session, authority: Role[] = []): boolean {
  return authority.length === 0 || authority.some((role) => session.authority.includes(role));
}

/** Root before-load: puts the session on the route context for every child. */
export async function loadSession({ context }: { context: RouterContext }) {
  return { session: await context.sessionSource.get() };
}

/**
 * Access check for a route, spread into its options. Runs in before-load, so on the server
 * too and before anything renders: no session redirects to sign-in, a session without the
 * authority throws `AccessDeniedError`, which the router's error component shows.
 */
export function protect(key: string, authority: Role[] = []) {
  return {
    staticData: { key, authority } satisfies RouteStaticData,
    beforeLoad: ({ context }: { context: { session: Session | null } }) => {
      if (!context.session) throw redirect({ to: appConfig.signInPath });
      if (!hasAuthority(context.session, authority)) throw new AccessDeniedError();
    },
  };
}
