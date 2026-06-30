/**
 * Test strategy: integration tests for the public singleton GET /api/hero
 * endpoint. Mirrors the about-content singleton pattern: 404 when
 * unconfigured, 200 envelope once a row exists.
 *
 * Run with: npx vitest run tests/api/hero.test.ts
 */
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { GET as getHeroRoute } from "@/app/api/hero/route";
import { prisma } from "@/lib/prisma";
import { resetDatabase, disconnect } from "../helpers/db";

describe("GET /api/hero", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("returns 404 with the standard error envelope when hero config has not been set up", async () => {
    const response = await getHeroRoute();
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({
      error: { code: "NOT_FOUND", message: "Hero configuration has not been set up yet." },
    });
  });

  it("returns 200 with the hero config envelope once configured", async () => {
    await prisma.heroConfig.create({
      data: {
        id: 1,
        headline: "Quality You Can Trust",
        ctaText: "Contact Us",
        imagePublicId: "test/hero",
      },
    });

    const response = await getHeroRoute();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({ headline: "Quality You Can Trust", ctaText: "Contact Us" });
    // imagePublicId is intentionally NOT exposed on the public lookup.
    expect(body.data.imagePublicId).toBeUndefined();
  });
});
