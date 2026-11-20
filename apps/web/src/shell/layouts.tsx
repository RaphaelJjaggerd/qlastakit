import { SidebarInset, SidebarProvider } from "@qlastakit/ui";
import type { ReactNode } from "react";
import type { LayoutKey } from "@/config/app.config";
import type { Session } from "@/session";
import { StackedSideNav } from "./stacked-side-nav";

interface LayoutProps {
  session: Session | null;
  /** Key of the matched route, read from its static data. */
  routeKey: string | undefined;
  children: ReactNode;
}

function StackedSide({ session, routeKey, children }: LayoutProps) {
  return (
    <div data-layout="stacked-side" className="h-screen overflow-hidden bg-sidebar">
      <SidebarProvider className="h-full min-h-0">
        <StackedSideNav session={session} routeKey={routeKey} />
        <SidebarInset className="min-h-0 bg-transparent">
          <div className="surface-panel flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto rounded-s-2xl">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

function AuthSide({ children }: LayoutProps) {
  return (
    <div data-layout="auth-side" className="flex h-full min-h-screen bg-background p-6">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-[380px] px-8 xl:max-w-[450px]">{children}</div>
      </div>
      <div className="relative hidden flex-1 flex-col items-end justify-between rounded-3xl bg-muted px-10 py-6 lg:flex xl:max-w-[520px] 2xl:max-w-[720px]" />
    </div>
  );
}

function Blank({ children }: LayoutProps) {
  return <div data-layout="blank">{children}</div>;
}

/** One map from layout key to layout. Adding a layout: add a key to `LayoutKey`, then here. */
export const layouts: Record<LayoutKey, (props: LayoutProps) => ReactNode> = {
  "stacked-side": StackedSide,
  "auth-side": AuthSide,
  blank: Blank,
};
