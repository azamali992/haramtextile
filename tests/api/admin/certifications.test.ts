/**
 * Test strategy: integration tests for admin certification CRUD routes
 * (/api/admin/certifications, /api/admin/certifications/[id]).
 * Same pattern as tests/api/admin/products.test.ts: mocked session,
 * real Postgres test DB.
 *
 * Covers: SECURITY 401 gating on every method, happy-path CRUD, 422 Zod
 * validation, 404 on unknown ids.
 *
 * Run with: npx vitest run tests/api/admin/certifications.test.ts
 */
import { describe, it, expect, beforeEach, afterAll, afterEach, vi } from "vitest";
import { mockAuthenticated, mockUnauthenticated } from "../../helpers/mock-session";
import { resetDatabase, seedCertification, disconnect } from "../../helpers/db";
import { jsonRequest } from "../../helpers/request";

// Boundary mock: see tests/api/admin/products.test.ts for rationale — the
// certification service also fire-and-forgets `deleteImage` on delete and
// on image replacement.
vi.mock("@/lib/storage", () => ({
  deleteImage: vi.fn().mockResolvedValue(undefined),
  uploadImage: vi.fn(),
}));

import { GET as listRoute, POST as createRoute } from "@/app/api/admin/certifications/route";
import {
  GET as getOneRoute,
  PUT as updateRoute,
  DELETE as deleteRoute,
} from "@/app/api/admin/certifications/[id]/route";
import { deleteImage } from "@/lib/storage";

describe("admin certifications routes — authentication gating", () => {
  beforeEach(async () => {
    await resetDatabase();
    await mockUnauthenticated();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("GET /api/admin/certifications returns 401 with no session", async () => {
    const response = await listRoute();
    expect(response.status).toBe(401);
  });

  it("POST /api/admin/certifications returns 401 with no session", async () => {
    const response = await createRoute(
      jsonRequest("POST", "http://localhost/api/admin/certifications", { name: "x" }),
    );
    expect(response.status).toBe(401);
  });

  it("GET /api/admin/certifications/[id] returns 401 with no session", async () => {
    const response = await getOneRoute(jsonRequest("GET", "http://localhost/api/admin/certifications/any"), {
      params: { id: "any" },
    });
    expect(response.status).toBe(401);
  });

  it("PUT /api/admin/certifications/[id] returns 401 with no session", async () => {
    const response = await updateRoute(
      jsonRequest("PUT", "http://localhost/api/admin/certifications/any", { name: "x" }),
      { params: { id: "any" } },
    );
    expect(response.status).toBe(401);
  });

  it("DELETE /api/admin/certifications/[id] returns 401 with no session", async () => {
    const response = await deleteRoute(
      jsonRequest("DELETE", "http://localhost/api/admin/certifications/any"),
      { params: { id: "any" } },
    );
    expect(response.status).toBe(401);
  });
});

describe("admin certifications routes — authenticated CRUD", () => {
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

  it("GET /api/admin/certifications returns 200 with the list envelope", async () => {
    await seedCertification({ name: "Admin Listed Cert" });

    const response = await listRoute();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.meta.total).toBe(1);
    expect(body.data[0].name).toBe("Admin Listed Cert");
  });

  it("POST /api/admin/certifications creates and returns 201", async () => {
    const response = await createRoute(
      jsonRequest("POST", "http://localhost/api/admin/certifications", {
        name: "New Cert",
        imageUrl: "https://res.cloudinary.com/test/image/upload/v1/cert.jpg",
        imagePublicId: "test/cert",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.name).toBe("New Cert");
  });

  it("POST /api/admin/certifications returns 422 when imagePublicId is missing", async () => {
    const response = await createRoute(
      jsonRequest("POST", "http://localhost/api/admin/certifications", {
        name: "No Public Id",
        imageUrl: "https://res.cloudinary.com/test/image/upload/v1/cert.jpg",
      }),
    );

    expect(response.status).toBe(422);
  });

  it("GET /api/admin/certifications/[id] returns 404 for unknown id", async () => {
    const response = await getOneRoute(
      jsonRequest("GET", "http://localhost/api/admin/certifications/nonexistent"),
      { params: { id: "nonexistent" } },
    );
    expect(response.status).toBe(404);
  });

  it("PUT /api/admin/certifications/[id] updates and returns 200", async () => {
    const cert = await seedCertification({ name: "Old Name" });

    const response = await updateRoute(
      jsonRequest("PUT", `http://localhost/api/admin/certifications/${cert.id}`, {
        name: "New Name",
      }),
      { params: { id: cert.id } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.name).toBe("New Name");
    expect(deleteImage).not.toHaveBeenCalled();
  });

  it("PUT /api/admin/certifications/[id] cleans up the old Cloudinary image when imagePublicId changes", async () => {
    const cert = await seedCertification();

    const response = await updateRoute(
      jsonRequest("PUT", `http://localhost/api/admin/certifications/${cert.id}`, {
        imageUrl: "https://res.cloudinary.com/test/image/upload/v2/new-cert.jpg",
        imagePublicId: "new/cert-public-id",
      }),
      { params: { id: cert.id } },
    );

    expect(response.status).toBe(200);
    await vi.waitFor(() => expect(deleteImage).toHaveBeenCalledWith("test/cert"));
  });

  it("DELETE /api/admin/certifications/[id] deletes and returns 204", async () => {
    const cert = await seedCertification();

    const response = await deleteRoute(
      jsonRequest("DELETE", `http://localhost/api/admin/certifications/${cert.id}`),
      { params: { id: cert.id } },
    );

    expect(response.status).toBe(204);
    await vi.waitFor(() => expect(deleteImage).toHaveBeenCalledWith("test/cert"));
  });

  it("DELETE /api/admin/certifications/[id] returns 404 for unknown id", async () => {
    const response = await deleteRoute(
      jsonRequest("DELETE", "http://localhost/api/admin/certifications/nonexistent"),
      { params: { id: "nonexistent" } },
    );
    expect(response.status).toBe(404);
  });
});
