/**
 * Shared Playwright helper: logs in as the seeded QA admin user via the
 * real UI (not by injecting a cookie) so every E2E test that needs an
 * authenticated session also incidentally re-verifies the login flow
 * works, while keeping each spec file focused on its own feature area.
 */
import type { Page } from "@playwright/test";
import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from "../global-setup";

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(E2E_ADMIN_EMAIL);
  await page.getByLabel("Password").fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/admin\/products$/);
}

/**
 * Mocks `POST /api/admin/upload` at the network layer so image-upload UI
 * flows (ImageUploadField) can be exercised without real Cloudinary
 * credentials. Returns a fixed, well-formed Cloudinary-shaped URL plus a
 * `publicId`, matching the real endpoint's `{ url, publicId }` response
 * shape (see lib/storage.ts's `uploadImage` / lib/admin/api-client.ts's
 * `uploadAdminImage`).
 */
export async function mockImageUpload(page: Page): Promise<void> {
  await page.route("**/api/admin/upload", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          url: "https://res.cloudinary.com/test-cloud/image/upload/f_auto,q_auto,w_auto/v1700000000/haram-textile/mock-upload.jpg",
          publicId: "haram-textile/mock-upload",
        },
      }),
    });
  });
}
