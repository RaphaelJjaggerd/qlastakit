// The pseudo-locale test (PRD 6): the shell screens render in the pseudo locale and the shared
// sweep (`pseudo-locale.ts`) fails on any text that did not come from the message files.
import { render, screen } from "@testing-library/react";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import userEvent from "@testing-library/user-event";
import { SidebarProvider } from "@qlastakit/ui";
import { beforeAll, expect, test, vi } from "vitest";
import { getRouter } from "../router";
import { Route } from "../routes/__root";
import { createStubSession, type Session } from "../session";
import { AccessDenied, RouteError } from "./access-denied";
import { NavUser } from "./nav-user";
import { expectOnlyMessages, member, usePseudoLocale } from "./pseudo-locale";

vi.mock("@qlastakit/api-client", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  configureApi: () => {},
}));

beforeAll(usePseudoLocale);

async function renderAt(path: string, session: Session | null) {
  const router = getRouter(createStubSession(session));
  router.update({
    context: router.options.context,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();
  return render(<RouterProvider router={router} />);
}

test("the signed-in shell and the notes page show only message-file text", async () => {
  const { container } = await renderAt("/", member);
  await screen.findByRole("heading", { name: "⟦Notes⟧" });
  expect(screen.getByRole("link", { name: "⟦Home⟧" })).toBeInTheDocument();
  expect(screen.getByPlaceholderText("⟦New note⟧")).toBeInTheDocument();
  expectOnlyMessages(container);
});

// NavUser is rendered alone: opening its menu inside the full routed shell hangs jsdom.
test("the open user menu shows only message-file text", async () => {
  render(
    <SidebarProvider>
      <NavUser user={member.user} />
    </SidebarProvider>,
  );
  await userEvent.click(screen.getByLabelText(member.user.name));
  await screen.findByText("⟦Log out⟧");
  // The menu renders in a portal, so look at the whole document body.
  expectOnlyMessages(document.body);
});

test("the sign-in screen shows only message-file text", async () => {
  const { container } = await renderAt("/sign-in", null);
  await screen.findByRole("heading", { name: "⟦Sign in⟧" });
  expectOnlyMessages(container);
});

test("the access-denied screen shows only message-file text", () => {
  const { container } = render(<AccessDenied />);
  expect(screen.getByText("⟦Access denied⟧")).toBeInTheDocument();
  expectOnlyMessages(container);
});

test("the route error screen shows only message-file text", () => {
  const { container } = render(
    <RouteError error={new Error("boom")} reset={() => {}} info={undefined} />,
  );
  expect(screen.getByText("⟦Something went wrong⟧")).toBeInTheDocument();
  expectOnlyMessages(container);
});

test("the root route's head() sets the document title from the message file", async () => {
  const head = await Route.options.head?.({} as never);
  expect(head?.meta).toContainEqual({ title: "⟦App⟧" });
});
