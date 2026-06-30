/**
 * Test strategy: integration tests for the admin hero singleton route
 * (PUT-as-upsert /api/admin/hero, id is always 1).
 *
 * Covers: SECURITY 401 gating on GET/PUT, 404 GET when unconfigured, PUT
 * creates on first save then updates thereafter, 422 Zod validation.
 *
 * Run with: npx vitest run tests/api/admin/hero.test.ts
 */
import { describe, it, expect, beforeEach, afterAll, afterEach, vi } from "vitest";
import { mockAuthenticated, mockUnauthenticated } from "../../helpers/mock-session";
import { resetDatabase, disconnect } from "../../helpers/db";
import { jsonRequest as buildJsonRequest } from "../../helpers/request";
import { prisma } from "@/lib/prisma";

// Boundary mock: see tests/api/admin/products.test.ts for rationale — the
// hero service fire-and-forgets `deleteImage` when the image is replaced.
vi.mock("@/lib/storage", () => ({
  deleteImage: vi.fn().mockResolvedValue(undefined),
  uploadImage: vi.fn(),
}));

import { GET as getRoute, PUT as putRoute } from "@/app/api/admin/hero/route";
import { deleteImage } from "@/lib/storage";

function jsonRequest(body?: unknown) {
  return buildJsonRequest("PUT", "http://localhost/api/admin/hero", body);
}

describe("admin hero route — authentication gating", () => {
  beforeEach(async () => {
    await resetDatabase();
    await mockUnauthenticated();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("GET /api/admin/hero returns 401 with no session", async () => {
    const response = await getRoute();
    expect(response.status).toBe(401);
  });

  it("PUT /api/admin/hero returns 401 with no session", async () => {
    const response = await putRoute(jsonRequest({ headline: "x" }));
    expect(response.status).toBe(401);
  });

  it("does not create the row when unauthenticated", async () => {
    await putRoute(jsonRequest({ headline: "Should Not Save" }));
    const row = await prisma.heroConfig.findUnique({ where: { id: 1 } });
    expect(row).toBeNull();
  });
});

describe("admin hero route — authenticated", () => {
  beforeEach(async () => {
    await resetDatabase();
    await mockAuthenticated();
    vi.mocked(deleteImage).mockClear();
    vi.mocked(deleteImage).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("GET /api/admin/hero returns 404 when not yet configured", async () => {
    const response = await getRoute();
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("PUT /api/admin/hero creates the singleton row on first save and returns 200", async () => {
    const response = await putRoute(jsonRequest({ headline: "Quality You Can Trust" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.headline).toBe("Quality You Can Trust");
    expect(body.data.id).toBe(1);
  });

  it("PUT /api/admin/hero updates the existing row on subsequent saves (still id 1)", async () => {
    await putRoute(jsonRequest({ headline: "First Headline" }));
    const response = await putRoute(jsonRequest({ headline: "Second Headline" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.headline).toBe("Second Headline");

    const count = await prisma.heroConfig.count();
    expect(count).toBe(1);
  });

  it("PUT /api/admin/hero returns 422 when headline is missing", async () => {
    const response = await putRoute(jsonRequest({ subtext: "no headline" }));
    expect(response.status).toBe(422);
  });

  it("PUT /api/admin/hero returns 422 when imageUrl is provided but not a valid URL", async () => {
    const response = await putRoute(
      jsonRequest({ headline: "Valid Headline", imageUrl: "not-a-url" }),
    );
    expect(response.status).toBe(422);
  });

  it("GET /api/admin/hero returns 200 with the saved config after a PUT", async () => {
    await putRoute(jsonRequest({ headline: "Persisted Headline" }));

    const response = await getRoute();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.headline).toBe("Persisted Headline");
  });

  it("cleans up the old Cloudinary image when the hero image is replaced", async () => {
    await putRoute(
      jsonRequest({
        headline: "First Headline",
        imageUrl: "https://res.cloudinary.com/test/image/upload/v1/old-hero.jpg",
        imagePublicId: "old/hero-public-id",
      }),
    );
    vi.mocked(deleteImage).mockClear();

    const response = await putRoute(
      jsonRequest({
        headline: "Second Headline",
        imageUrl: "https://res.cloudinary.com/test/image/upload/v2/new-hero.jpg",
        imagePublicId: "new/hero-public-id",
      }),
    );

    expect(response.status).toBe(200);
    await vi.waitFor(() => expect(deleteImage).toHaveBeenCalledWith("old/hero-public-id"));
  });

  it("does not call deleteImage when the hero PUT omits imagePublicId entirely", async () => {
    const response = await putRoute(jsonRequest({ headline: "No Image Touch" }));

    expect(response.status).toBe(200);
    expect(deleteImage).not.toHaveBeenCalled();
  });
});
