import { Outlet, useMatches } from "@tanstack/react-router";
import { appConfig } from "@/config/app.config";
import type { Session } from "@/session";
import { layouts } from "./layouts";
import { PageContainer } from "./page-container";

/**
 * Picks the layout during render, from the matched route's static data, else the config
 * default. No store and no effect, so the first render already has the right layout.
 */
export function RootLayout({ session }: { session: Session | null }) {
  const matches = useMatches();
  const leaf = matches[matches.length - 1];
  const layout = layouts[leaf?.staticData?.layout ?? appConfig.defaultLayout];
  return layout({
    session,
    routeKey: leaf?.staticData?.key,
    children: (
      <PageContainer chrome={leaf?.staticData?.chrome}>
        <Outlet />
      </PageContainer>
    ),
  });
}
