/**
 * Test strategy: integration tests for the admin SEO settings singleton
 * route (PUT-as-upsert /api/admin/seo-settings, id is always 1).
 *
 * Run with: npx vitest run tests/api/admin/seo-settings.test.ts
 */
import { describe, it, expect, beforeEach, afterAll, afterEach, vi } from "vitest";
import { mockAuthenticated, mockUnauthenticated } from "../../helpers/mock-session";
import { resetDatabase, disconnect } from "../../helpers/db";
import { jsonRequest as buildJsonRequest } from "../../helpers/request";
import { prisma } from "@/lib/prisma";

import { GET as getRoute, PUT as putRoute } from "@/app/api/admin/seo-settings/route";

function jsonRequest(body?: unknown) {
  return buildJsonRequest("PUT", "http://localhost/api/admin/seo-settings", body);
}

describe("admin seo-settings route — authentication gating", () => {
  beforeEach(async () => {
    await resetDatabase();
    await mockUnauthenticated();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("GET /api/admin/seo-settings returns 401 with no session", async () => {
    const response = await getRoute();
    expect(response.status).toBe(401);
  });

  it("PUT /api/admin/seo-settings returns 401 with no session", async () => {
    const response = await putRoute(jsonRequest({ siteTitleSuffix: "x" }));
    expect(response.status).toBe(401);
  });
});

describe("admin seo-settings route — authenticated", () => {
  beforeEach(async () => {
    await resetDatabase();
    await mockAuthenticated();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("GET /api/admin/seo-settings returns 404 when not yet configured", async () => {
    const response = await getRoute();
    expect(response.status).toBe(404);
  });

  it("PUT /api/admin/seo-settings creates the singleton row on first save", async () => {
    const response = await putRoute(
      jsonRequest({
        siteTitleSuffix: "Haram Textile — Apparel Manufacturer",
        defaultMetaDescription: "Premium apparel manufacturing from Pakistan.",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.siteTitleSuffix).toBe("Haram Textile — Apparel Manufacturer");
  });

  it("PUT /api/admin/seo-settings updates the existing row on subsequent saves", async () => {
    await putRoute(
      jsonRequest({ siteTitleSuffix: "First", defaultMetaDescription: "First description." }),
    );
    const response = await putRoute(
      jsonRequest({ siteTitleSuffix: "Second", defaultMetaDescription: "Second description." }),
    );
    const body = await response.json();

    expect(body.data.siteTitleSuffix).toBe("Second");
    expect(await prisma.seoSettings.count()).toBe(1);
  });

  it("PUT /api/admin/seo-settings returns 422 when siteTitleSuffix is missing", async () => {
    const response = await putRoute(
      jsonRequest({ defaultMetaDescription: "Missing title suffix." }),
    );
    expect(response.status).toBe(422);
  });

  it("PUT /api/admin/seo-settings returns 422 when organizationSameAs contains a non-URL", async () => {
    const response = await putRoute(
      jsonRequest({
        siteTitleSuffix: "Title",
        defaultMetaDescription: "Description.",
        organizationSameAs: ["not-a-url"],
      }),
    );
    expect(response.status).toBe(422);
  });
});
