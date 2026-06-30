/**
 * Test strategy: integration tests for the admin product CRUD routes
 * (/api/admin/products, /api/admin/products/[id]).
 *
 * `requireAdminSession` is mocked per-test (see tests/helpers/mock-session.ts)
 * so we can deterministically simulate both the unauthenticated (401) and
 * authenticated paths without needing a real NextAuth cookie here — the
 * Playwright E2E suite separately proves the real cookie-based login flow
 * works end-to-end.
 *
 * Covers:
 *  - SECURITY: every method (GET/POST/PUT/DELETE) returns 401 with no session
 *  - happy path CRUD with a mocked session against the real test DB
 *  - 422 on invalid create/update payloads (Zod)
 *  - 404 on operations against a nonexistent id
 *
 * Run with: npx vitest run tests/api/admin/products.test.ts
 */
import { describe, it, expect, beforeEach, afterAll, afterEach, vi } from "vitest";
import { mockAuthenticated, mockUnauthenticated } from "../../helpers/mock-session";
import { resetDatabase, seedCategory, seedProduct, disconnect } from "../../helpers/db";
import { jsonRequest, toNextRequest } from "../../helpers/request";

// Boundary mock: `lib/storage.ts` talks to the real Cloudinary SDK, which
// has no real credentials in this environment. The product service calls
// `deleteImage` (fire-and-forget) on delete and on image replacement —
// mocked here so those tests are fast/deterministic and don't make real
// network calls, per the "mock at the boundary" rule used elsewhere (see
// tests/api/admin/upload.test.ts, tests/api/contact.test.ts).
vi.mock("@/lib/storage", () => ({
  deleteImage: vi.fn().mockResolvedValue(undefined),
  uploadImage: vi.fn(),
}));

import { GET as listRoute, POST as createRoute } from "@/app/api/admin/products/route";
import {
  GET as getOneRoute,
  PUT as updateRoute,
  DELETE as deleteRoute,
} from "@/app/api/admin/products/[id]/route";
import { deleteImage } from "@/lib/storage";

describe("admin products routes — authentication gating", () => {
  beforeEach(async () => {
    await resetDatabase();
    await mockUnauthenticated();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("GET /api/admin/products returns 401 UNAUTHENTICATED with no session", async () => {
    const response = await listRoute(jsonRequest("GET", "http://localhost/api/admin/products"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHENTICATED");
  });

  it("POST /api/admin/products returns 401 with no session", async () => {
    const response = await createRoute(
      jsonRequest("POST", "http://localhost/api/admin/products", { name: "x" }),
    );
    expect(response.status).toBe(401);
  });

  it("GET /api/admin/products/[id] returns 401 with no session", async () => {
    const response = await getOneRoute(
      jsonRequest("GET", "http://localhost/api/admin/products/any-id"),
      { params: { id: "any-id" } },
    );
    expect(response.status).toBe(401);
  });

  it("PUT /api/admin/products/[id] returns 401 with no session", async () => {
    const response = await updateRoute(
      jsonRequest("PUT", "http://localhost/api/admin/products/any-id", { name: "x" }),
      { params: { id: "any-id" } },
    );
    expect(response.status).toBe(401);
  });

  it("DELETE /api/admin/products/[id] returns 401 with no session", async () => {
    const response = await deleteRoute(
      jsonRequest("DELETE", "http://localhost/api/admin/products/any-id"),
      { params: { id: "any-id" } },
    );
    expect(response.status).toBe(401);
  });

  it("does not touch the database when unauthenticated (no row created on POST attempt)", async () => {
    await createRoute(
      jsonRequest("POST", "http://localhost/api/admin/products", {
        name: "Should Not Be Created",
        imageUrl: "https://res.cloudinary.com/test/image/upload/v1/x.jpg",
        imagePublicId: "x",
        categoryId: "whatever",
      }),
    );

    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.product.findMany({ where: { name: "Should Not Be Created" } });
    expect(rows).toHaveLength(0);
  });
});

describe("admin products routes — authenticated CRUD", () => {
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

  it("GET /api/admin/products returns 200 with the list envelope", async () => {
    const category = await seedCategory();
    await seedProduct(category.id, { name: "Admin Listed Product" });

    const response = await listRoute(jsonRequest("GET", "http://localhost/api/admin/products"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.meta.total).toBe(1);
    expect(body.data[0].name).toBe("Admin Listed Product");
  });

  it("POST /api/admin/products creates a product and returns 201", async () => {
    const category = await seedCategory();

    const response = await createRoute(
      jsonRequest("POST", "http://localhost/api/admin/products", {
        name: "New Product",
        imageUrl: "https://res.cloudinary.com/test/image/upload/v1/new.jpg",
        imagePublicId: "test/new",
        categoryId: category.id,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.name).toBe("New Product");
    expect(body.data.id).toBeTruthy();
  });

  it("POST /api/admin/products returns 422 VALIDATION_ERROR when name is missing", async () => {
    const category = await seedCategory();

    const response = await createRoute(
      jsonRequest("POST", "http://localhost/api/admin/products", {
        imageUrl: "https://res.cloudinary.com/test/image/upload/v1/new.jpg",
        imagePublicId: "test/new",
        categoryId: category.id,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /api/admin/products returns 422 when imageUrl is not a valid URL", async () => {
    const category = await seedCategory();

    const response = await createRoute(
      jsonRequest("POST", "http://localhost/api/admin/products", {
        name: "Bad Image URL",
        imageUrl: "not-a-url",
        imagePublicId: "test/new",
        categoryId: category.id,
      }),
    );

    expect(response.status).toBe(422);
  });

  it("POST /api/admin/products returns 422 when the JSON body is malformed", async () => {
    const response = await createRoute(
      toNextRequest(
        new Request("http://localhost/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{not json",
        }),
      ),
    );

    expect(response.status).toBe(422);
  });

  it("GET /api/admin/products/[id] returns 200 with the product when it exists", async () => {
    const category = await seedCategory();
    const product = await seedProduct(category.id, { name: "Lookup Me" });

    const response = await getOneRoute(
      jsonRequest("GET", `http://localhost/api/admin/products/${product.id}`),
      { params: { id: product.id } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.name).toBe("Lookup Me");
  });

  it("GET /api/admin/products/[id] returns 404 for a nonexistent id", async () => {
    const response = await getOneRoute(
      jsonRequest("GET", "http://localhost/api/admin/products/nonexistent"),
      { params: { id: "nonexistent" } },
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("PUT /api/admin/products/[id] updates the product and returns 200", async () => {
    const category = await seedCategory();
    const product = await seedProduct(category.id, { name: "Original Name" });

    const response = await updateRoute(
      jsonRequest("PUT", `http://localhost/api/admin/products/${product.id}`, {
        name: "Updated Name",
      }),
      { params: { id: product.id } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.name).toBe("Updated Name");
    // Image was untouched, so no Cloudinary cleanup should fire.
    expect(deleteImage).not.toHaveBeenCalled();
  });

  it("PUT /api/admin/products/[id] cleans up the old Cloudinary image when imagePublicId changes", async () => {
    const category = await seedCategory();
    const product = await seedProduct(category.id, { imagePublicId: "old/public-id" });

    const response = await updateRoute(
      jsonRequest("PUT", `http://localhost/api/admin/products/${product.id}`, {
        imageUrl: "https://res.cloudinary.com/test/image/upload/v2/new.jpg",
        imagePublicId: "new/public-id",
      }),
      { params: { id: product.id } },
    );

    expect(response.status).toBe(200);
    await vi.waitFor(() => expect(deleteImage).toHaveBeenCalledWith("old/public-id"));
  });

  it("PUT /api/admin/products/[id] does not clean up the image when imagePublicId is unchanged", async () => {
    const category = await seedCategory();
    const product = await seedProduct(category.id, { imagePublicId: "same/public-id" });

    const response = await updateRoute(
      jsonRequest("PUT", `http://localhost/api/admin/products/${product.id}`, {
        imageUrl: product.imageUrl,
        imagePublicId: "same/public-id",
      }),
      { params: { id: product.id } },
    );

    expect(response.status).toBe(200);
    expect(deleteImage).not.toHaveBeenCalled();
  });

  it("PUT /api/admin/products/[id] returns 404 when updating a nonexistent product", async () => {
    const response = await updateRoute(
      jsonRequest("PUT", "http://localhost/api/admin/products/nonexistent", { name: "x" }),
      { params: { id: "nonexistent" } },
    );

    expect(response.status).toBe(404);
  });

  it("PUT /api/admin/products/[id] returns 422 when the payload fails validation", async () => {
    const category = await seedCategory();
    const product = await seedProduct(category.id);

    const response = await updateRoute(
      jsonRequest("PUT", `http://localhost/api/admin/products/${product.id}`, {
        imageUrl: "not-a-url",
      }),
      { params: { id: product.id } },
    );

    expect(response.status).toBe(422);
  });

  it("DELETE /api/admin/products/[id] deletes the product and returns 204 with no body", async () => {
    const category = await seedCategory();
    const product = await seedProduct(category.id, { imagePublicId: "deleted/public-id" });

    const response = await deleteRoute(
      jsonRequest("DELETE", `http://localhost/api/admin/products/${product.id}`),
      { params: { id: product.id } },
    );

    expect(response.status).toBe(204);
    const text = await response.text();
    expect(text).toBe("");

    const { prisma } = await import("@/lib/prisma");
    const stillExists = await prisma.product.findUnique({ where: { id: product.id } });
    expect(stillExists).toBeNull();

    // Cloudinary cleanup is fire-and-forget — give the microtask queue a
    // tick to run before asserting it was called.
    await vi.waitFor(() => expect(deleteImage).toHaveBeenCalledWith("deleted/public-id"));
  });

  it("DELETE /api/admin/products/[id] returns 404 for a nonexistent id", async () => {
    const response = await deleteRoute(
      jsonRequest("DELETE", "http://localhost/api/admin/products/nonexistent"),
      { params: { id: "nonexistent" } },
    );

    expect(response.status).toBe(404);
  });
});
