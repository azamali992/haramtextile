/**
 * Test strategy: integration tests against a real Postgres test DB for the
 * public certification endpoints (GET /api/certifications, GET
 * /api/certifications/[id]).
 *
 * Covers happy path envelope shape, empty-list edge case, and 404 error
 * envelope for an unknown id.
 *
 * Run with: npx vitest run tests/api/certifications.test.ts
 */
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { GET as listCertificationsRoute } from "@/app/api/certifications/route";
import { GET as getCertificationRoute } from "@/app/api/certifications/[id]/route";
import { resetDatabase, seedCertification, disconnect } from "../helpers/db";

describe("GET /api/certifications", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("returns 200 with an empty array and total 0 when none exist", async () => {
    const response = await listCertificationsRoute();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ data: [], meta: { total: 0 } });
  });

  it("returns the correct envelope shape with certification fields on success", async () => {
    await seedCertification({ name: "ISO 9001" });

    const response = await listCertificationsRoute();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.meta.total).toBe(1);
    expect(body.data[0]).toMatchObject({ name: "ISO 9001", issuingBody: "Test Issuing Body" });
    // imagePublicId is intentionally NOT exposed on the public listing.
    expect(body.data[0].imagePublicId).toBeUndefined();
  });
});

describe("GET /api/certifications/[id]", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("returns 200 with the certification envelope when it exists", async () => {
    const certification = await seedCertification({ name: "BSCI" });

    const response = await getCertificationRoute(
      new Request(`http://localhost/api/certifications/${certification.id}`),
      { params: { id: certification.id } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.name).toBe("BSCI");
    // imagePublicId is intentionally NOT exposed on the public single lookup.
    expect(body.data.imagePublicId).toBeUndefined();
  });

  it("returns 404 with the standard error envelope when the certification does not exist", async () => {
    const response = await getCertificationRoute(
      new Request("http://localhost/api/certifications/nonexistent-id"),
      { params: { id: "nonexistent-id" } },
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({
      error: { code: "NOT_FOUND", message: "Certification not found." },
    });
  });
});
