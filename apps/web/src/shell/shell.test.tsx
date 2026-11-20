// The guard and layout tests the PRD (3.5) names, run against the stub session. The guard
// tests use the real route tree (the denied one a small tree of its own, since no real route
// needs an authority yet). The layout tests render with `renderToString`, which runs no
// effects, so the markup is the first render; RTL `render()` flushes effects before it returns
// and could not tell a derived layout from one an effect writes.
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
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

async function loaded(path: string, session: Session | null) {
  const router = getRouter(createStubSession(session));
  router.update({
    context: router.options.context,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();
  return router;
}

async function open(path: string, session: Session | null) {
  const router = await loaded(path, session);
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
  const pageRendered = vi.fn();
  const secret = createRoute({
    getParentRoute: () => root,
    path: "/admin",
    ...protect("admin-only", ["admin"]),
    component: () => {
      pageRendered();
      return <p>secret admin page</p>;
    },
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
  expect(pageRendered).not.toHaveBeenCalled();
});

test("the first render of a signed-in route has the stacked-side layout and the nav", async () => {
  const router = await loaded("/", member);
  const html = renderToString(<RouterProvider router={router} />);
  expect(html).toContain('data-layout="stacked-side"');
  expect(html).toContain('aria-label="Home"');
});

test("the first render of the sign-in route is already auth-side, with no nav", async () => {
  // The default layout is stacked-side, so this only passes if the route's own layout is
  // picked during render.
  const router = await loaded("/sign-in", null);
  const html = renderToString(<RouterProvider router={router} />);
  expect(html).toContain('data-layout="auth-side"');
  expect(html).not.toContain('data-layout="stacked-side"');
  expect(html).not.toContain('aria-label="Home"');
});
