// The nav tree has no `collapse` node yet, so the secondary panel never renders in the real
// shell. This test gives the nav a tree that has one and checks the panel's text (title,
// close button, item title and description) under the pseudo-locale.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, expect, test, vi } from "vitest";
import type { NavNode } from "../config/navigation.config";
import { expectOnlyMessages, member, usePseudoLocale } from "./pseudo-locale";

const leaf = (key: string, titleKey: NavNode["titleKey"], descriptionKey?: NavNode["titleKey"]) =>
  ({
    key,
    path: "/",
    titleKey,
    descriptionKey,
    icon: "overview",
    type: "item",
    authority: [],
    subMenu: [],
  }) satisfies NavNode;

vi.mock("../config/navigation.config", () => ({
  navigationConfig: [
    {
      key: "group",
      path: "",
      titleKey: "notes.title",
      icon: "overview",
      type: "collapse",
      authority: [],
      subMenu: [leaf("sub", "nav.home", "access.denied.body")],
    },
  ],
  findTopLevel: () => undefined,
}));

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  Link: ({ children, ...props }: { children?: React.ReactNode }) => (
    <a href="/" {...props}>
      {children}
    </a>
  ),
}));

beforeAll(usePseudoLocale);

async function openPanel() {
  const { StackedSideNav } = await import("./stacked-side-nav");
  const { SidebarProvider } = await import("@qlastakit/ui");
  const view = render(
    <SidebarProvider>
      <StackedSideNav session={member} routeKey={undefined} />
    </SidebarProvider>,
  );
  await userEvent.click(screen.getByLabelText("⟦Notes⟧"));
  return view;
}

test("the open secondary nav panel shows only message-file text", async () => {
  await openPanel();
  await screen.findByLabelText("⟦Close panel⟧");
  // The panel may render in a portal, so sweep the whole document body.
  expectOnlyMessages(document.body);
});

test("the open secondary nav panel has the group title, close button, item title and description", async () => {
  await openPanel();
  expect(screen.getByRole("heading", { name: "⟦Notes⟧" })).toBeInTheDocument();
  expect(screen.getByLabelText("⟦Close panel⟧")).toBeInTheDocument();
  expect(screen.getByText("⟦Home⟧")).toBeInTheDocument();
  expect(screen.getByText("⟦You have no permission to visit this page.⟧")).toBeInTheDocument();
});
