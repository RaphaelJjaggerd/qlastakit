import { readdirSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import ComponentPreview from "./component-preview";

const componentsDir = join(import.meta.dirname, "../../../../packages/ts/ui/src/components");

test("the preview has one section per UI component file", () => {
  const files = readdirSync(componentsDir).filter((f) => f.endsWith(".tsx"));
  const { container } = render(<ComponentPreview />);
  expect(container.querySelectorAll("[data-preview]")).toHaveLength(files.length);
});

// Overlay content mounts only on interaction, so open each one: a broken part throws then.
test("every overlay and toggle opens without crashing the page", async () => {
  const user = userEvent.setup();
  const { container } = render(<ComponentPreview />);
  const sections = () => container.querySelectorAll("[data-preview]").length;
  const before = sections();

  await user.click(screen.getByRole("button", { name: "Open menu" }));
  expect(await screen.findByText("Account")).toBeInTheDocument();
  expect(screen.getByRole("menuitem", { name: "Profile" })).toBeInTheDocument();
  await user.keyboard("{Escape}");

  await user.click(screen.getByRole("button", { name: "Open sheet" }));
  expect(await screen.findByText("Sheet description")).toBeInTheDocument();
  await user.keyboard("{Escape}");

  await user.click(screen.getByRole("combobox"));
  expect(await screen.findByRole("option", { name: "Two" })).toBeInTheDocument();
  await user.keyboard("{Escape}");

  await user.hover(screen.getByRole("button", { name: "Hover me" }));
  expect(await screen.findByText("Tooltip", { selector: "[data-slot]" })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Toggle" }));
  expect(await screen.findByText("Hidden content")).toBeInTheDocument();

  await user.click(screen.getByRole("tab", { name: "Tab B" }));
  expect(await screen.findByText("Panel B")).toBeInTheDocument();

  expect(sections()).toBe(before);
});
