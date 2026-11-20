import { IconX } from "@tabler/icons-react";
import {
  Button,
  cn,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@qlastakit/ui";
import { Link } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { hasAuthority } from "@/access";
import { appConfig } from "@/config/app.config";
import { findTopLevel, type NavNode, navigationConfig } from "@/config/navigation.config";
import { t } from "@/i18n";
import type { Session } from "@/session";
import { Logo } from "./logo";
import { NavIcon } from "./nav-icons";
import { NavUser } from "./nav-user";

// Config paths are plain strings, the router's `to` is a union of real routes.
type To = "/";

/** The stacked-side nav: a dark icon rail, plus a secondary panel for `collapse` nodes. */
export function StackedSideNav({
  session,
  routeKey,
}: {
  session: Session | null;
  routeKey: string | undefined;
}) {
  // undefined: follow the route (a collapse node's panel is open while the route is under it,
  // derived during render, no effect). A click sets a key, or null for closed.
  const [picked, setOpenKey] = useState<string | null | undefined>(undefined);
  const allowed = (node: NavNode) => (session ? hasAuthority(session, node.authority) : false);
  const current = findTopLevel(navigationConfig, routeKey);
  const openKey =
    picked === undefined ? (current?.type === "collapse" ? current.key : null) : picked;
  const openItem = navigationConfig.find((n) => n.key === openKey);
  const secondary = openItem?.subMenu.filter(allowed) ?? [];

  function slot(node: NavNode) {
    if (!allowed(node)) return null;
    const isActive = openKey === node.key || current?.key === node.key;
    const className = cn(
      "size-12! rounded-xl text-rail-foreground/80 hover:bg-rail-foreground/10 hover:text-rail-foreground [&_svg]:size-6!",
      isActive && "surface-rail-active text-rail-foreground shadow-rail-active",
    );
    const label = t(node.titleKey);
    const button =
      node.type === "collapse" ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className={className}
          aria-label={label}
          onClick={() => setOpenKey(openKey === node.key ? null : node.key)}
        >
          <NavIcon icon={node.icon} />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon-lg"
          className={className}
          aria-label={label}
          render={<Link to={node.path as To} onClick={() => setOpenKey(null)} />}
        >
          <NavIcon icon={node.icon} />
        </Button>
      );
    return (
      <Tooltip key={node.key}>
        <TooltipTrigger render={button} />
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <>
      <Sidebar
        side="left"
        variant="sidebar"
        collapsible="none"
        className="h-screen w-[4.5rem] shrink-0 overflow-hidden bg-rail text-rail-foreground"
      >
        <SidebarHeader className="items-center py-4">
          <Link
            to={appConfig.authenticatedEntryPath}
            aria-label={t(appConfig.nameKey)}
            className="flex items-center justify-center"
          >
            <Logo tone="rail" name={t(appConfig.nameKey)} />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="items-center gap-3">
                {navigationConfig.map((node, idx) =>
                  node.type === "title" ? (
                    <Fragment key={node.key}>
                      {idx > 0 && <div className="my-1 h-px w-8 bg-rail-foreground/15" />}
                      {node.subMenu.map(slot)}
                    </Fragment>
                  ) : (
                    slot(node)
                  ),
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="items-center pb-3">
          {session && <NavUser user={session.user} />}
        </SidebarFooter>
      </Sidebar>

      {openItem && secondary.length > 0 && (
        <Sidebar
          side="left"
          variant="sidebar"
          collapsible="none"
          className="h-screen w-72 shrink-0 animate-in bg-transparent duration-slow slide-in-from-left-5"
        >
          <SidebarHeader className="flex flex-row items-center justify-between border-b border-etched-line px-4 py-3 shadow-etched-h">
            <h3 className="text-sm font-medium">{t(openItem.titleKey)}</h3>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpenKey(null)}
              aria-label={t("nav.closePanel")}
            >
              <IconX />
            </Button>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {secondary
                    .filter((sub) => sub.type !== "title")
                    .map((sub) => (
                      <SidebarMenuItem key={sub.key}>
                        <SidebarMenuButton
                          isActive={routeKey === sub.key}
                          className="h-auto py-2 data-active:bg-panel data-active:text-foreground data-active:shadow-raised"
                          render={
                            <Link to={sub.path as To}>
                              <NavIcon icon={sub.icon} />
                              <div className="flex flex-1 flex-col text-left">
                                <span className="font-medium">{t(sub.titleKey)}</span>
                                {sub.descriptionKey && (
                                  <span className="mt-0.5 text-xs text-muted-foreground">
                                    {t(sub.descriptionKey)}
                                  </span>
                                )}
                              </div>
                            </Link>
                          }
                        />
                      </SidebarMenuItem>
                    ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      )}
    </>
  );
}
