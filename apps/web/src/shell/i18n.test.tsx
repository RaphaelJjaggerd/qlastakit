// The pseudo-locale test (PRD 6): every message becomes "⟦…⟧" in a locale that exists only
// here, then the shell screens render in it. Any visible text, aria-label or placeholder that
// is not wrapped came from somewhere other than the message files. Data (the user's name and
// email) is not shell text and is allowed through.
import { render, screen } from "@testing-library/react";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { afterEach, beforeAll, expect, test, vi } from "vitest";
import { i18n, resources } from "../i18n";
import { getRouter } from "../router";
import { createStubSession, type Session } from "../session";
import { AccessDenied } from "./access-denied";

vi.mock("@qlastakit/api-client", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  configureApi: () => {},
}));

const member: Session = {
  user: { name: "Mia Member", email: "mia@example.com" },
  authority: ["member"],
};
const data = new Set([member.user.name, member.user.email, "MM"]);

beforeAll(async () => {
  const pseudo = Object.fromEntries(
    Object.entries(resources.en.translation).map(([key, value]) => [key, `⟦${value}⟧`]),
  );
  i18n.addResourceBundle("pseudo", "translation", pseudo);
  await i18n.changeLanguage("pseudo");
});

afterEach(() => i18n.changeLanguage("pseudo"));

/** Every piece of text a user can see or hear in the rendered page. */
function shellStrings(root: HTMLElement) {
  const found: string[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent?.trim();
    if (text) found.push(text);
  }
  for (const el of root.querySelectorAll("[aria-label],[placeholder],[title]")) {
    for (const attr of ["aria-label", "placeholder", "title"]) {
      const value = el.getAttribute(attr)?.trim();
      if (value) found.push(value);
    }
  }
  return found.filter((text) => !data.has(text));
}

function expectOnlyMessages(root: HTMLElement) {
  const strings = shellStrings(root);
  expect(strings.length).toBeGreaterThan(0);
  const loose = strings.filter((text) => !(text.startsWith("⟦") && text.endsWith("⟧")));
  expect(loose).toEqual([]);
}

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

test("the document title comes from the message file", () => {
  expect(i18n.t("app.documentTitle")).toBe("⟦App⟧");
});
