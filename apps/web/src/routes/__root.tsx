/// <reference types="vite/client" />
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { loadSession, type RouterContext } from "@/access";
import { i18n } from "@/i18n";
import { RootLayout } from "@/shell/root-layout";
import css from "../styles.css?url";

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: i18n.t("app.documentTitle") },
    ],
    links: [{ rel: "stylesheet", href: css }],
  }),
  beforeLoad: loadSession,
  component: Root,
  shellComponent: RootDocument,
});

function Root() {
  const { session } = Route.useRouteContext();
  return <RootLayout session={session} />;
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
