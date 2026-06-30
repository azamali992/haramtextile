/**
 * Test strategy: integration tests for POST /api/admin/upload (multipart
 * image upload, proxied to lib/storage.ts's Cloudinary wrapper).
 *
 * Boundary mock: `lib/storage.ts`'s `uploadImage` talks to the real
 * Cloudinary SDK, which has no real credentials in this environment —
 * mocked here per the "mock at the boundary" rule, so we test the route's
 * own request-parsing/error-mapping logic in isolation.
 *
 * Covers:
 *  - SECURITY: 401 with no session
 *  - SECURITY: 400 when the CSRF-defense `X-Requested-With` header is
 *    missing, rejected before the session is even checked
 *  - happy path: 201 with the upload result envelope ({ url, publicId })
 *  - error paths: missing file field -> 400, non-multipart body -> 400,
 *    storage-layer validation errors (bad type/size) mapped to 400 not 500
 *  - a genuine storage-layer failure (e.g. Cloudinary outage) maps to 500
 *
 * Run with: npx vitest run tests/api/admin/upload.test.ts
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mockAuthenticated, mockUnauthenticated } from "../../helpers/mock-session";
import { toNextRequest } from "../../helpers/request";

vi.mock("@/lib/services/upload.service", () => ({
  handleImageUpload: vi.fn(),
}));

import { POST as uploadRoute } from "@/app/api/admin/upload/route";
import { handleImageUpload } from "@/lib/services/upload.service";

function makeFile(name = "photo.jpg", type = "image/jpeg", content = "fake-image-bytes"): File {
  return new File([content], name, { type });
}

function multipartRequest(file?: File, headers: HeadersInit = { "X-Requested-With": "haram-admin" }) {
  const formData = new FormData();
  if (file) {
    formData.append("file", file);
  }
  return toNextRequest(
    new Request("http://localhost/api/admin/upload", {
      method: "POST",
      headers,
      body: formData,
    }),
  );
}

describe("admin upload route — CSRF header gating", () => {
  beforeEach(async () => {
    await mockAuthenticated();
  });

  it("returns 400 when the X-Requested-With header is missing, even with a valid session", async () => {
    const response = await uploadRoute(multipartRequest(makeFile(), {}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("BAD_REQUEST");
    expect(handleImageUpload).not.toHaveBeenCalled();
  });

  it("returns 400 when X-Requested-With has the wrong value", async () => {
    const response = await uploadRoute(
      multipartRequest(makeFile(), { "X-Requested-With": "XMLHttpRequest" }),
    );
    expect(response.status).toBe(400);
  });
});

describe("admin upload route — authentication gating", () => {
  beforeEach(async () => {
    await mockUnauthenticated();
  });

  it("returns 401 with no session, before even parsing the body", async () => {
    const response = await uploadRoute(multipartRequest(makeFile()));
    expect(response.status).toBe(401);
    expect(handleImageUpload).not.toHaveBeenCalled();
  });
});

describe("admin upload route — authenticated", () => {
  beforeEach(async () => {
    await mockAuthenticated();
    vi.mocked(handleImageUpload).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 201 with the upload result (url + publicId) on success", async () => {
    vi.mocked(handleImageUpload).mockResolvedValue({
      url: "https://res.cloudinary.com/test/image/upload/f_auto,q_auto,w_auto/v1/haram-textile/photo.jpg",
      publicId: "haram-textile/photo",
    });

    const response = await uploadRoute(multipartRequest(makeFile()));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.url).toContain("res.cloudinary.com");
    expect(body.data.publicId).toBe("haram-textile/photo");
  });

  it("returns 400 BAD_REQUEST when no file field is present", async () => {
    const response = await uploadRoute(multipartRequest(undefined));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("BAD_REQUEST");
    expect(handleImageUpload).not.toHaveBeenCalled();
  });

  it("returns 400 when the body is not multipart/form-data", async () => {
    const response = await uploadRoute(
      toNextRequest(
        new Request("http://localhost/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Requested-With": "haram-admin" },
          body: JSON.stringify({ not: "multipart" }),
        }),
      ),
    );

    expect(response.status).toBe(400);
  });

  it("maps an 'unsupported file type' storage error to 400, not 500", async () => {
    vi.mocked(handleImageUpload).mockRejectedValue(
      new Error('Unsupported file type "image/gif". Only JPG, PNG, and WebP images are allowed.'),
    );

    const response = await uploadRoute(multipartRequest(makeFile("a.gif", "image/gif")));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("BAD_REQUEST");
  });

  it("maps a 'too large' storage error to 400, not 500", async () => {
    vi.mocked(handleImageUpload).mockRejectedValue(new Error("File is too large (999) bytes."));

    const response = await uploadRoute(multipartRequest(makeFile()));
    expect(response.status).toBe(400);
  });

  it("maps an unexpected storage failure (e.g. Cloudinary outage) to 500", async () => {
    vi.mocked(handleImageUpload).mockRejectedValue(new Error("connect ETIMEDOUT"));

    const response = await uploadRoute(multipartRequest(makeFile()));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error.code).toBe("INTERNAL_ERROR");
  });
});
