/**
 * Test strategy: Playwright E2E for admin authentication
 * (app/admin/login/page.tsx using next-auth's credentials provider, gated
 * by middleware.ts + app/admin/(protected)/layout.tsx).
 *
 * Covers:
 *  - unauthenticated visit to a protected admin page redirects to /admin/login
 *    (proves middleware.ts is actually wired up, not just present in the repo)
 *  - correct credentials succeed and land on /admin/products with the
 *    sidebar chrome visible
 *  - wrong password fails with a visible, generic error message (and stays
 *    on the login page / does not leak whether the email exists)
 *  - after a successful login, the session persists across a reload
 *
 * Uses the admin user seeded by tests/e2e/global-setup.ts (env-overridable
 * email/password, not a hardcoded production secret).
 *
 * Run with: npx playwright test tests/e2e/admin-login.spec.ts
 */
import { test, expect } from "@playwright/test";
import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from "./global-setup";

test.describe("Admin login", () => {
  test("redirects an unauthenticated visitor from a protected admin page to /admin/login", async ({
    page,
  }) => {
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("logs in successfully with correct credentials and reaches the products page", async ({
    page,
  }) => {
    await page.goto("/admin/login");

    await page.getByLabel("Email").fill(E2E_ADMIN_EMAIL);
    await page.getByLabel("Password").fill(E2E_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/admin\/products$/);
    await expect(page.getByText("Haram Admin")).toBeVisible();
  });

  test("shows a visible generic error on an incorrect password and stays on the login page", async ({
    page,
  }) => {
    await page.goto("/admin/login");

    await page.getByLabel("Email").fill(E2E_ADMIN_EMAIL);
    await page.getByLabel("Password").fill("definitely-the-wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Invalid email or password.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("shows the same generic error for a nonexistent email (no user-enumeration leak)", async ({
    page,
  }) => {
    await page.goto("/admin/login");

    await page.getByLabel("Email").fill("does-not-exist@haramtextile.com");
    await page.getByLabel("Password").fill("whatever-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Invalid email or password.")).toBeVisible();
  });

  test("persists the session across a page reload after login", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(E2E_ADMIN_EMAIL);
    await page.getByLabel("Password").fill(E2E_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin\/products$/);

    await page.reload();

    await expect(page).toHaveURL(/\/admin\/products$/);
    await expect(page.getByText("Haram Admin")).toBeVisible();
  });

  test("logging out redirects to /admin/login and re-protects admin pages", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(E2E_ADMIN_EMAIL);
    await page.getByLabel("Password").fill(E2E_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin\/products$/);

    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);

    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});
