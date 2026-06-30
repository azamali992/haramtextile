/**
 * Test strategy: integration test for the public GET /api/clients listing
 * endpoint (client logos for the homepage carousel). Covers empty-list and
 * happy-path envelope shape.
 *
 * Run with: npx vitest run tests/api/clients.test.ts
 */
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { GET as listClientsRoute } from "@/app/api/clients/route";
import { prisma } from "@/lib/prisma";
import { resetDatabase, disconnect } from "../helpers/db";

describe("GET /api/clients", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("returns 200 with an empty array and total 0 when no client logos exist", async () => {
    const response = await listClientsRoute();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ data: [], meta: { total: 0 } });
  });

  it("returns the correct envelope shape with client logo fields on success", async () => {
    await prisma.clientLogo.create({
      data: {
        imageUrl: "https://res.cloudinary.com/test/image/upload/v1/test/logo.jpg",
        imagePublicId: "test/logo",
        altText: "Acme Corp",
        order: 1,
      },
    });

    const response = await listClientsRoute();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.meta.total).toBe(1);
    expect(body.data[0]).toMatchObject({ altText: "Acme Corp", order: 1 });
    // imagePublicId is intentionally NOT exposed on the public listing.
    expect(body.data[0].imagePublicId).toBeUndefined();
  });
});
