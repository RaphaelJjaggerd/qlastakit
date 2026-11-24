import { cn } from "@qlastakit/ui";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { PageChrome } from "@/config/app.config";

// Ported unchanged from the ui-kit reference (`theme.constant.ts`).
const PAGE_CONTAINER_GUTTER_X = "px-4 sm:px-6 md:px-8";
const PAGE_CONTAINER_GUTTER_Y = "py-4 sm:py-6 md:py-8";
const PAGE_CONTENT_MAX_WIDTH = "max-w-[90rem]";

/**
 * The one page container. A route declares its chrome (header, footer, container type,
 * background) in static data; this renders it around the page. Pages draw none of it.
 * Markup and classes follow the reference `page-container.tsx` and `footer.tsx`; the
 * differences are listed in the 1.10 log (h1, div for main, footer content).
 */
export function PageContainer({
  chrome = {},
  children,
}: {
  chrome?: PageChrome;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const { headerKey, footer = true, container = "default", background = "default" } = chrome;
  return (
    <div
      data-container={container}
      className={cn(
        "flex h-full flex-auto flex-col justify-between",
        background === "plain" && "bg-background",
      )}
    >
      {/* A div, not main: the stacked-side layout's SidebarInset is already the main landmark. */}
      <div className="h-full">
        <div
          className={cn(
            "relative flex h-full flex-auto flex-col",
            container !== "gutterless" && `${PAGE_CONTAINER_GUTTER_X} ${PAGE_CONTAINER_GUTTER_Y}`,
            container === "contained" && "container mx-auto",
            container === "default" && cn("mx-auto w-full", PAGE_CONTENT_MAX_WIDTH),
            !footer && "pb-0 sm:pb-0 md:pb-0",
          )}
        >
          {headerKey && (
            <div
              className={cn(
                "mb-4 flex items-center justify-between",
                container === "gutterless" && "mt-4",
              )}
            >
              <header>
                <h1 className="title-page">{t(headerKey)}</h1>
              </header>
            </div>
          )}
          {container === "contained" ? (
            <div className="container mx-auto h-full">{children}</div>
          ) : (
            children
          )}
        </div>
      </div>
      {footer && (
        <footer className={cn("flex h-16 flex-auto items-center", PAGE_CONTAINER_GUTTER_X)}>
          {container === "contained" ? (
            <div className="container mx-auto">
              <FooterContent />
            </div>
          ) : (
            <FooterContent />
          )}
        </footer>
      )}
    </div>
  );
}

function FooterContent() {
  const { t } = useTranslation();
  return (
    <span className="text-sm text-muted-foreground">
      <span className="font-semibold">{t("app.name")}</span>
    </span>
  );
}
