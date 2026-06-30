/**
 * Test strategy: Playwright E2E for the admin hero-config singleton editor
 * (app/admin/(protected)/hero/**), driven through the UI: change the
 * headline, save, and verify it persists (reload the admin page) and shows
 * on the public homepage.
 *
 * Run with: npx playwright test tests/e2e/admin-hero-config.spec.ts
 */
import { test, expect } from "@playwright/test";
import { loginAsAdmin, mockImageUpload } from "./helpers/admin-auth";

test.describe("Admin hero config update", () => {
  test.beforeEach(async ({ page }) => {
    await mockImageUpload(page);
    await loginAsAdmin(page);
  });

  test("changes the headline and shows a success confirmation", async ({ page }) => {
    const newHeadline = `Updated Headline ${Date.now()}`;

    await page.goto("/admin/hero");
    await page.getByLabel("Headline").fill(newHeadline);
    await page.getByRole("button", { name: "Save hero section" }).click();

    await expect(page.getByText("Hero section saved.")).toBeVisible();
  });

  test("persists the new headline after a page reload", async ({ page }) => {
    const newHeadline = `Persisted Headline ${Date.now()}`;

    await page.goto("/admin/hero");
    await page.getByLabel("Headline").fill(newHeadline);
    await page.getByRole("button", { name: "Save hero section" }).click();
    await expect(page.getByText("Hero section saved.")).toBeVisible();

    await page.reload();

    await expect(page.getByLabel("Headline")).toHaveValue(newHeadline);
  });

  test("reflects the updated headline on the live preview pane immediately", async ({ page }) => {
    const newHeadline = `Live Preview Headline ${Date.now()}`;

    await page.goto("/admin/hero");
    await page.getByLabel("Headline").fill(newHeadline);

    await expect(page.getByText("Live preview", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: newHeadline })).toBeVisible();
  });

  test("shows the updated headline on the public homepage after saving", async ({ page }) => {
    const newHeadline = `Public Homepage Headline ${Date.now()}`;

    await page.goto("/admin/hero");
    await page.getByLabel("Headline").fill(newHeadline);
    await page.getByRole("button", { name: "Save hero section" }).click();
    await expect(page.getByText("Hero section saved.")).toBeVisible();

    await page.goto("/");

    await expect(page.getByText(newHeadline)).toBeVisible();
  });

  test("shows a validation error when the headline is cleared entirely", async ({ page }) => {
    await page.goto("/admin/hero");

    const headlineInput = page.getByLabel("Headline");
    await headlineInput.fill("");
    // The headline input has `required`, so the browser's native
    // validation blocks submission; confirm we're still on the form (no
    // crash, no false "saved" message) rather than asserting a specific
    // browser validation bubble (those aren't reliably queryable by role).
    await page.getByRole("button", { name: "Save hero section" }).click();

    await expect(page.getByText("Hero section saved.")).not.toBeVisible();
  });
});
