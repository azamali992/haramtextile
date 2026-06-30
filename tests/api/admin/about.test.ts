/**
 * Test strategy: integration tests for the admin about-content singleton
 * route (PUT-as-upsert /api/admin/about, id is always 1). Mirrors the hero
 * singleton test pattern.
 *
 * Run with: npx vitest run tests/api/admin/about.test.ts
 */
import { describe, it, expect, beforeEach, afterAll, afterEach, vi } from "vitest";
import { mockAuthenticated, mockUnauthenticated } from "../../helpers/mock-session";
import { resetDatabase, disconnect } from "../../helpers/db";
import { jsonRequest as buildJsonRequest } from "../../helpers/request";
import { prisma } from "@/lib/prisma";

// Boundary mock: see tests/api/admin/products.test.ts for rationale — the
// about-content service fire-and-forgets `deleteImage` when the image is
// replaced.
vi.mock("@/lib/storage", () => ({
  deleteImage: vi.fn().mockResolvedValue(undefined),
  uploadImage: vi.fn(),
}));

import { GET as getRoute, PUT as putRoute } from "@/app/api/admin/about/route";
import { deleteImage } from "@/lib/storage";

function jsonRequest(body?: unknown) {
  return buildJsonRequest("PUT", "http://localhost/api/admin/about", body);
}

describe("admin about route — authentication gating", () => {
  beforeEach(async () => {
    await resetDatabase();
    await mockUnauthenticated();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("GET /api/admin/about returns 401 with no session", async () => {
    const response = await getRoute();
    expect(response.status).toBe(401);
  });

  it("PUT /api/admin/about returns 401 with no session", async () => {
    const response = await putRoute(jsonRequest({ storyText: "x" }));
    expect(response.status).toBe(401);
  });
});

describe("admin about route — authenticated", () => {
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

  it("GET /api/admin/about returns 404 when not yet configured", async () => {
    const response = await getRoute();
    expect(response.status).toBe(404);
  });

  it("PUT /api/admin/about creates the singleton row on first save and returns 200", async () => {
    const response = await putRoute(jsonRequest({ storyText: "Our story begins..." }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.storyText).toBe("Our story begins...");
    expect(body.data.id).toBe(1);
  });

  it("PUT /api/admin/about updates the existing row on subsequent saves", async () => {
    await putRoute(jsonRequest({ storyText: "First version" }));
    const response = await putRoute(jsonRequest({ storyText: "Second version" }));
    const body = await response.json();

    expect(body.data.storyText).toBe("Second version");
    expect(await prisma.aboutContent.count()).toBe(1);
  });

  it("PUT /api/admin/about returns 422 when storyText is missing", async () => {
    const response = await putRoute(jsonRequest({ missionText: "no story" }));
    expect(response.status).toBe(422);
  });

  it("cleans up the old Cloudinary image when the about image is replaced", async () => {
    await putRoute(
      jsonRequest({
        storyText: "First version",
        imageUrl: "https://res.cloudinary.com/test/image/upload/v1/old-about.jpg",
        imagePublicId: "old/about-public-id",
      }),
    );
    vi.mocked(deleteImage).mockClear();

    const response = await putRoute(
      jsonRequest({
        storyText: "Second version",
        imageUrl: "https://res.cloudinary.com/test/image/upload/v2/new-about.jpg",
        imagePublicId: "new/about-public-id",
      }),
    );

    expect(response.status).toBe(200);
    await vi.waitFor(() => expect(deleteImage).toHaveBeenCalledWith("old/about-public-id"));
  });

  it("does not call deleteImage when the about PUT omits imagePublicId entirely", async () => {
    const response = await putRoute(jsonRequest({ storyText: "No Image Touch" }));

    expect(response.status).toBe(200);
    expect(deleteImage).not.toHaveBeenCalled();
  });
});
