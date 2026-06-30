/**
 * Test strategy: Playwright E2E for the full admin product CRUD flow
 * (app/admin/(protected)/products/**), driven entirely through the UI:
 * create a product, see it listed, edit it, delete it.
 *
 * Boundary mock: `/api/admin/upload` is mocked at the network layer (see
 * tests/e2e/helpers/admin-auth.ts) since there are no real Cloudinary
 * credentials in this environment. Every other call (the product
 * create/update/delete itself) goes through the real Next server and
 * real test Postgres DB — this is the one place we want full-stack
 * confidence, not mocks.
 *
 * Run with: npx playwright test tests/e2e/admin-product-crud.spec.ts
 */
import { test, expect } from "@playwright/test";
import { loginAsAdmin, mockImageUpload } from "./helpers/admin-auth";

test.describe("Admin product CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await mockImageUpload(page);
    await loginAsAdmin(page);
  });

  test("creates a product through the UI and sees it listed", async ({ page }) => {
    const productName = `E2E Product ${Date.now()}`;

    await page.goto("/admin/products");
    await page.getByRole("button", { name: "Add product" }).click();

    await page.getByLabel(/^Name/).fill(productName);
    await page.getByLabel(/^Category/).selectOption({ label: "Gents" });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "product.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-jpeg-bytes"),
    });
    // Wait for the mocked upload to resolve and populate the preview image.
    await expect(page.getByAltText("Current upload preview")).toBeVisible();

    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page.getByText(productName)).toBeVisible();
  });

  test("edits an existing product and sees the change reflected in the list", async ({ page }) => {
    const originalName = `E2E Editable ${Date.now()}`;
    const updatedName = `${originalName} (edited)`;

    await page.goto("/admin/products");
    await page.getByRole("button", { name: "Add product" }).click();
    await page.getByLabel(/^Name/).fill(originalName);
    await page.getByLabel(/^Category/).selectOption({ label: "Gents" });
    await page.locator('input[type="file"]').setInputFiles({
      name: "product.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-jpeg-bytes"),
    });
    await expect(page.getByAltText("Current upload preview")).toBeVisible();
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(originalName)).toBeVisible();

    const row = page.locator("tr", { hasText: originalName });
    await row.getByRole("button", { name: "Edit" }).click();

    const nameInput = page.getByLabel(/^Name/);
    await nameInput.fill(updatedName);
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText(updatedName)).toBeVisible();
    await expect(page.getByText(originalName, { exact: true })).not.toBeVisible();
  });

  test("deletes a product after confirming, and it disappears from the list", async ({ page }) => {
    const productName = `E2E Deletable ${Date.now()}`;

    await page.goto("/admin/products");
    await page.getByRole("button", { name: "Add product" }).click();
    await page.getByLabel(/^Name/).fill(productName);
    await page.getByLabel(/^Category/).selectOption({ label: "Gents" });
    await page.locator('input[type="file"]').setInputFiles({
      name: "product.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-jpeg-bytes"),
    });
    await expect(page.getByAltText("Current upload preview")).toBeVisible();
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(productName)).toBeVisible();

    const row = page.locator("tr", { hasText: productName });
    await row.getByRole("button", { name: "Delete" }).click();
    // ConfirmDeleteButton requires a second confirming click ("Confirm?")
    // before the destructive action actually fires.
    await row.getByRole("button", { name: "Confirm?" }).click();

    await expect(page.getByText(productName)).not.toBeVisible();
  });

  test("shows a validation error in the modal when required fields are missing", async ({ page }) => {
    await page.goto("/admin/products");
    await page.getByRole("button", { name: "Add product" }).click();

    // Leave name/category/image empty and attempt to save. The category
    // <select required> and name <input required> use native HTML
    // validation (no noValidate on this form), so the browser blocks
    // submission client-side — assert the modal stays open rather than
    // asserting a specific server error message.
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
