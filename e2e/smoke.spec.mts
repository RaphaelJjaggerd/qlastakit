import { expect, test } from "@playwright/test";

// The whole kit in a browser: web app, Vite /api proxy, API, Postgres.
test("creates a note and sees it listed", async ({ page }) => {
  const title = `smoke ${Date.now()}`;
  await page.goto("/");
  // The page is server-rendered; a click before hydration would submit the form natively.
  await page.waitForLoadState("networkidle");
  await page.getByPlaceholder("New note").fill(title);
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: title })).toBeVisible();
});
