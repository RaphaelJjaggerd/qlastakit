// App config: only flags the kit implements (PRD 3.4). The route's static data can override
// the layout for one route.
export type LayoutKey = "stacked-side" | "auth-side" | "blank";

export const appConfig = {
  nameKey: "app.name",
  /** Where a signed-in user lands, and where the logo links. */
  authenticatedEntryPath: "/",
  signInPath: "/sign-in",
  /** Layout for any route whose static data does not name one. */
  defaultLayout: "stacked-side" as LayoutKey,
} as const;
