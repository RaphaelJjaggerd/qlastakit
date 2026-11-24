// Shared by every pseudo-locale test (PRD 6): every message becomes "⟦…⟧" in a locale that
// exists only in tests. Any visible text, aria-label, placeholder or title that is not wrapped
// came from somewhere other than the message files. Data (the user's name and email) is not
// shell text and is allowed through.
import { expect } from "vitest";
import { i18n, resources } from "../i18n";
import type { Session } from "../session";

export const member: Session = {
  user: { name: "Mia Member", email: "mia@example.com" },
  authority: ["member"],
};
const data = new Set([member.user.name, member.user.email, "MM"]);

/** Adds the pseudo locale and switches to it. Call from `beforeAll`. */
export async function usePseudoLocale() {
  const pseudo = Object.fromEntries(
    Object.entries(resources.en.translation).map(([key, value]) => [key, `⟦${value}⟧`]),
  );
  i18n.addResourceBundle("pseudo", "translation", pseudo);
  await i18n.changeLanguage("pseudo");
}

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

/** The sweep: fails on any text node, aria-label, placeholder or title that is not pseudo-wrapped. */
export function expectOnlyMessages(root: HTMLElement) {
  const strings = shellStrings(root);
  expect(strings.length).toBeGreaterThan(0);
  const loose = strings.filter((text) => !(text.startsWith("⟦") && text.endsWith("⟧")));
  expect(loose).toEqual([]);
}
