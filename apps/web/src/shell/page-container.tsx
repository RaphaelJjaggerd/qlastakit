import { cn } from "@qlastakit/ui";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { PageChrome } from "@/config/app.config";

/**
 * The one page container. A route declares its chrome (header, footer, container type,
 * background) in static data; this renders it around the page. Pages draw none of it.
 */
export function PageContainer({
  chrome = {},
  children,
}: {
  chrome?: PageChrome;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const { headerKey, footer = false, container = "default", background = "default" } = chrome;
  return (
    <div
      data-container={container}
      className={cn(
        "flex h-full flex-auto flex-col justify-between",
        background === "plain" && "bg-background",
      )}
    >
      <main
        className={cn(
          "flex flex-auto flex-col",
          container !== "gutterless" && "px-4 py-6 md:px-6",
          container === "default" && "mx-auto w-full max-w-6xl",
          container === "contained" && "mx-auto w-full max-w-xl",
        )}
      >
        {headerKey && (
          <header className="mb-4">
            <h1 className="title-page">{t(headerKey)}</h1>
          </header>
        )}
        {children}
      </main>
      {footer && (
        <footer className="px-4 py-4 text-sm text-muted-foreground md:px-6">
          {t("app.footer")}
        </footer>
      )}
    </div>
  );
}
