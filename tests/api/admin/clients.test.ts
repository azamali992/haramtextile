/**
 * Test strategy: integration tests for admin client-logo routes
 * (/api/admin/clients, /api/admin/clients/[id] — list/create/delete only,
 * no update route exists for this resource per the architecture).
 *
 * Covers: SECURITY 401 gating, happy-path create/list/delete, 422
 * validation, 404 on delete of an unknown id.
 *
 * Run with: npx vitest run tests/api/admin/clients.test.ts
 */
import { describe, it, expect, beforeEach, afterAll, afterEach, vi } from "vitest";
import { mockAuthenticated, mockUnauthenticated } from "../../helpers/mock-session";
import { resetDatabase, disconnect } from "../../helpers/db";
import { jsonRequest } from "../../helpers/request";
import { prisma } from "@/lib/prisma";

// Boundary mock: see tests/api/admin/products.test.ts for rationale — the
// client-logo service fire-and-forgets `deleteImage` on delete.
vi.mock("@/lib/storage", () => ({
  deleteImage: vi.fn().mockResolvedValue(undefined),
  uploadImage: vi.fn(),
}));

import { GET as listRoute, POST as createRoute } from "@/app/api/admin/clients/route";
import { DELETE as deleteRoute } from "@/app/api/admin/clients/[id]/route";
import { deleteImage } from "@/lib/storage";

async function seedClientLogo() {
  return prisma.clientLogo.create({
    data: {
      imageUrl: "https://res.cloudinary.com/test/image/upload/v1/logo.jpg",
      imagePublicId: "test/logo",
      altText: "Test Client",
      order: 0,
    },
  });
}

describe("admin clients routes — authentication gating", () => {
  beforeEach(async () => {
    await resetDatabase();
    await mockUnauthenticated();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("GET /api/admin/clients returns 401 with no session", async () => {
    const response = await listRoute();
    expect(response.status).toBe(401);
  });

  it("POST /api/admin/clients returns 401 with no session", async () => {
    const response = await createRoute(
      jsonRequest("POST", "http://localhost/api/admin/clients", { altText: "x" }),
    );
    expect(response.status).toBe(401);
  });

  it("DELETE /api/admin/clients/[id] returns 401 with no session", async () => {
    const response = await deleteRoute(jsonRequest("DELETE", "http://localhost/api/admin/clients/any"), {
      params: { id: "any" },
    });
    expect(response.status).toBe(401);
  });
});

describe("admin clients routes — authenticated CRUD", () => {
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

  it("GET /api/admin/clients returns 200 with the list envelope", async () => {
    await seedClientLogo();

    const response = await listRoute();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.meta.total).toBe(1);
  });

  it("POST /api/admin/clients creates and returns 201", async () => {
    const response = await createRoute(
      jsonRequest("POST", "http://localhost/api/admin/clients", {
        imageUrl: "https://res.cloudinary.com/test/image/upload/v1/new-logo.jpg",
        imagePublicId: "test/new-logo",
        altText: "New Client",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.altText).toBe("New Client");
  });

  it("POST /api/admin/clients returns 422 when altText is missing", async () => {
    const response = await createRoute(
      jsonRequest("POST", "http://localhost/api/admin/clients", {
        imageUrl: "https://res.cloudinary.com/test/image/upload/v1/new-logo.jpg",
        imagePublicId: "test/new-logo",
      }),
    );
    expect(response.status).toBe(422);
  });

  it("POST /api/admin/clients returns 422 when imageUrl is not a valid URL", async () => {
    const response = await createRoute(
      jsonRequest("POST", "http://localhost/api/admin/clients", {
        imageUrl: "not-a-url",
        imagePublicId: "test/new-logo",
        altText: "Bad URL",
      }),
    );
    expect(response.status).toBe(422);
  });

  it("DELETE /api/admin/clients/[id] deletes and returns 204", async () => {
    const logo = await seedClientLogo();

    const response = await deleteRoute(
      jsonRequest("DELETE", `http://localhost/api/admin/clients/${logo.id}`),
      { params: { id: logo.id } },
    );

    expect(response.status).toBe(204);
    const stillExists = await prisma.clientLogo.findUnique({ where: { id: logo.id } });
    expect(stillExists).toBeNull();
    await vi.waitFor(() => expect(deleteImage).toHaveBeenCalledWith("test/logo"));
  });

  it("DELETE /api/admin/clients/[id] returns 404 for unknown id", async () => {
    const response = await deleteRoute(
      jsonRequest("DELETE", "http://localhost/api/admin/clients/nonexistent"),
      { params: { id: "nonexistent" } },
    );
    expect(response.status).toBe(404);
  });
});
