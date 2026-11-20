// The guard and layout tests the PRD (3.5) names, run against the stub session and the real
// route tree. Each render is the first one: `RouterProvider` awaits the route's before-load
// first, so a protected page that renders anyway would show up in the first DOM.
import { render, screen } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { expect, test, vi } from "vitest";
import { loadSession, protect, type RouterContext } from "../access";
import { getRouter } from "../router";
import { RouteError } from "./access-denied";
import { createStubSession, type Session } from "../session";

// The notes page talks to the API; the shell tests do not need it.
vi.mock("@qlastakit/api-client", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  configureApi: () => {},
}));

const member: Session = {
  user: { name: "Mia Member", email: "mia@example.com" },
  authority: ["member"],
};

async function open(path: string, session: Session | null) {
  const router = getRouter(createStubSession(session));
  router.update({
    context: router.options.context,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
  return router;
}

test("a protected route never renders without a session and redirects to sign-in", async () => {
  const router = await open("/", null);
  expect(router.state.location.pathname).toBe("/sign-in");
  expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  expect(screen.queryByPlaceholderText("New note")).not.toBeInTheDocument();
});

test("a session without the authority sees access denied, not the page", async () => {
  const root = createRootRouteWithContext<RouterContext>()({
    beforeLoad: loadSession,
    component: Outlet,
  });
  const secret = createRoute({
    getParentRoute: () => root,
    path: "/admin",
    ...protect("admin-only", ["admin"]),
    component: () => <p>secret admin page</p>,
  });
  const router = createRouter({
    routeTree: root.addChildren([secret]),
    history: createMemoryHistory({ initialEntries: ["/admin"] }),
    context: { sessionSource: createStubSession(member) },
    defaultErrorComponent: RouteError,
  });
  render(<RouterProvider router={router} />);
  expect(await screen.findByText("Access denied")).toBeInTheDocument();
  expect(screen.queryByText("secret admin page")).not.toBeInTheDocument();
});

test("the first render of a signed-in route has the stacked-side layout and the nav", async () => {
  const router = await open("/", member);
  expect(router.state.location.pathname).toBe("/");
  const layout = document.querySelector("[data-layout]");
  expect(layout?.getAttribute("data-layout")).toBe("stacked-side");
  expect(await screen.findByRole("link", { name: "Home" })).toBeInTheDocument();
});

test("the sign-in route has the auth-side layout and no nav", async () => {
  await open("/sign-in", null);
  expect(document.querySelector("[data-layout]")?.getAttribute("data-layout")).toBe("auth-side");
  expect(screen.queryByRole("link", { name: "Home" })).not.toBeInTheDocument();
});
