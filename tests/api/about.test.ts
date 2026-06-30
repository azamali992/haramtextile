/**
 * Test strategy: integration tests for the public singleton GET /api/about
 * endpoint. Covers the "not configured yet" 404 edge case (no row at id=1)
 * and the happy path once a row exists.
 *
 * Run with: npx vitest run tests/api/about.test.ts
 */
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { GET as getAboutRoute } from "@/app/api/about/route";
import { prisma } from "@/lib/prisma";
import { resetDatabase, disconnect } from "../helpers/db";

describe("GET /api/about", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("returns 404 with the standard error envelope when about content has not been configured", async () => {
    const response = await getAboutRoute();
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({
      error: { code: "NOT_FOUND", message: "About content has not been set up yet." },
    });
  });

  it("returns 200 with the about content envelope once configured", async () => {
    await prisma.aboutContent.create({
      data: {
        id: 1,
        storyText: "Our story.",
        missionText: "Our mission.",
        imagePublicId: "test/about",
      },
    });

    const response = await getAboutRoute();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({ storyText: "Our story.", missionText: "Our mission." });
    // imagePublicId is intentionally NOT exposed on the public lookup.
    expect(body.data.imagePublicId).toBeUndefined();
  });
});
