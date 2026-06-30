/**
 * Test strategy: Playwright E2E for the public contact form
 * (components/ui/ContactForm.tsx posting to POST /api/contact), exercised
 * through a real browser against the real Next dev server + test
 * Postgres DB (no mocking — this is the one path where end-to-end DB
 * persistence + email side-effect swallowing actually matters).
 *
 * Covers:
 *  - happy path: fill the form, submit, see the success message
 *  - validation-error path: submit with an invalid email, see the
 *    server-side Zod validation error surfaced in the UI
 *
 * Run with: npx playwright test tests/e2e/contact-form.spec.ts
 * (requires the dev server + test DB — Playwright's webServer boots this
 * automatically per playwright.config.ts)
 */
import { test, expect } from "@playwright/test";

test.describe("Contact form", () => {
  test("shows the success message after a valid submission", async ({ page }) => {
    await page.goto("/contact");

    await page.getByLabel("Name").fill("Jane E2E Buyer");
    await page.getByLabel("Email").fill(`jane-e2e-${Date.now()}@example.com`);
    await page.getByLabel("Company (optional)").fill("Acme E2E Imports");
    await page.getByLabel("Message").fill("Interested in a bulk order of polo shirts for our retail chain.");

    await page.getByRole("button", { name: "Send Inquiry" }).click();

    await expect(page.getByText(/thank you\. your inquiry has been received/i)).toBeVisible();
  });

  test("clears the form fields after a successful submission", async ({ page }) => {
    await page.goto("/contact");

    await page.getByLabel("Name").fill("Form Reset Test");
    await page.getByLabel("Email").fill(`reset-e2e-${Date.now()}@example.com`);
    await page.getByLabel("Message").fill("Testing that the form resets.");
    await page.getByRole("button", { name: "Send Inquiry" }).click();

    await expect(page.getByText(/thank you/i)).toBeVisible();
    await expect(page.getByLabel("Name")).toHaveValue("");
    await expect(page.getByLabel("Message")).toHaveValue("");
  });

  test("shows a validation error and no success message when the server rejects the payload", async ({
    page,
  }) => {
    await page.goto("/contact");

    // The form's `type="email"` input plus `required` would normally
    // trigger native browser validation before submit, but the form
    // declares `noValidate`, so an invalid value DOES reach our handler
    // and the server's Zod validation, exactly as intended — confirming
    // the server-side validation error path actually renders in the UI.
    await page.getByLabel("Name").fill("Bad Email Tester");
    await page.getByLabel("Email").fill("not-a-valid-email");
    await page.getByLabel("Message").fill("This should fail server validation.");

    await page.getByRole("button", { name: "Send Inquiry" }).click();

    await expect(page.getByRole("status")).toContainText(/invalid contact form submission/i);
    await expect(page.getByText(/thank you/i)).not.toBeVisible();
  });

  test("shows a validation error when the message is left empty (Zod min length)", async ({ page }) => {
    await page.goto("/contact");

    await page.getByLabel("Name").fill("Empty Message Tester");
    await page.getByLabel("Email").fill(`empty-msg-${Date.now()}@example.com`);
    // Leave Message blank, but bypass the native `required` attribute by
    // submitting via form.requestSubmit() equivalent: click submit anyway —
    // since the form has noValidate, the browser will NOT block this.
    await page.getByRole("button", { name: "Send Inquiry" }).click();

    await expect(page.getByRole("status")).toContainText(/invalid contact form submission/i);
  });
});
