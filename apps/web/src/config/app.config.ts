import type { MessageKey } from "@/i18n";

// App config: only flags the kit implements (PRD 3.4). The route's static data can override
// the layout for one route.
export type LayoutKey = "stacked-side" | "auth-side" | "blank";

export type ContainerType = "default" | "gutterless" | "contained";

/** What a route declares about its page chrome; the one page container renders it. */
export interface PageChrome {
  /** Message key of the page header title. No key, no header. */
  headerKey?: MessageKey;
  /** Show the footer. Default true, as in the reference. */
  footer?: boolean;
  /** `default`: padded, centred, max width; `contained`: padded in the responsive
   *  `container`; `gutterless`: no padding. */
  container?: ContainerType;
  /** `plain` paints the page on the base background colour. */
  background?: "default" | "plain";
}

export const appConfig = {
  nameKey: "app.name",
  /** Where a signed-in user lands, and where the logo links. */
  authenticatedEntryPath: "/",
  signInPath: "/sign-in",
  /** Layout for any route whose static data does not name one. */
  defaultLayout: "stacked-side" as LayoutKey,
} as const;
