/**
 * Test strategy: integration tests for app/sitemap.ts and app/robots.ts —
 * Next.js's MetadataRoute generators, run directly as functions (no HTTP
 * layer needed) against the real test DB so dynamic product/certification
 * entries are exercised too.
 *
 * Covers:
 *  - sitemap includes all 5 static public pages (/, /about, /products,
 *    /certifications, /contact) with valid url/lastModified/priority
 *  - sitemap includes a dynamic entry per product and per certification
 *    (covering /products/[id] and /certifications/[id])
 *  - sitemap excludes everything under /admin
 *  - every sitemap URL is well-formed (parses as a valid absolute URL,
 *    starts with the configured base URL)
 *  - robots.txt disallows /admin and /api, and points at the sitemap
 *
 * Run with: npx vitest run tests/sitemap/sitemap-robots.test.ts
 */
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { resetDatabase, seedCategory, seedProduct, seedCertification, disconnect } from "../helpers/db";

const EXPECTED_STATIC_PATHS = ["/", "/about", "/products", "/certifications", "/contact"];

describe("app/sitemap.ts", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("includes all 5 static public pages when there is no DB-backed content", async () => {
    const entries = await sitemap();
    const paths = entries.map((entry) => new URL(entry.url).pathname);

    for (const expectedPath of EXPECTED_STATIC_PATHS) {
      expect(paths).toContain(expectedPath);
    }
  });

  it("every entry has a well-formed absolute URL using the configured base URL", async () => {
    const entries = await sitemap();
    const { config } = await import("@/lib/config");
    const baseUrl = config.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(() => new URL(entry.url)).not.toThrow();
      expect(entry.url.startsWith(baseUrl)).toBe(true);
    }
  });

  it("every entry has a valid priority between 0 and 1 and a recognized changeFrequency", async () => {
    const entries = await sitemap();
    const validFrequencies = new Set([
      "always",
      "hourly",
      "daily",
      "weekly",
      "monthly",
      "yearly",
      "never",
    ]);

    for (const entry of entries) {
      if (entry.priority !== undefined) {
        expect(entry.priority).toBeGreaterThanOrEqual(0);
        expect(entry.priority).toBeLessThanOrEqual(1);
      }
      if (entry.changeFrequency !== undefined) {
        expect(validFrequencies.has(entry.changeFrequency)).toBe(true);
      }
    }
  });

  it("includes a dynamic entry for each product, covering /products/[id]", async () => {
    const category = await seedCategory();
    const product = await seedProduct(category.id, { name: "Sitemap Product" });

    const entries = await sitemap();
    const productEntry = entries.find((entry) => entry.url.endsWith(`/products/${product.id}`));

    expect(productEntry).toBeDefined();
  });

  it("includes a dynamic entry for each certification, covering /certifications/[id]", async () => {
    const certification = await seedCertification({ name: "Sitemap Cert" });

    const entries = await sitemap();
    const certEntry = entries.find((entry) =>
      entry.url.endsWith(`/certifications/${certification.id}`),
    );

    expect(certEntry).toBeDefined();
  });

  it("excludes everything under /admin", async () => {
    const entries = await sitemap();

    for (const entry of entries) {
      expect(new URL(entry.url).pathname.startsWith("/admin")).toBe(false);
    }
  });

  it("does not duplicate the same URL twice", async () => {
    const category = await seedCategory();
    await seedProduct(category.id);
    await seedCertification();

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);
    const uniqueUrls = new Set(urls);

    expect(uniqueUrls.size).toBe(urls.length);
  });
});

describe("app/robots.ts", () => {
  it("disallows /admin", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];

    const disallowsAdmin = rules.some((rule) => {
      const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
      return disallow.includes("/admin");
    });
    expect(disallowsAdmin).toBe(true);
  });

  it("disallows /api", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];

    const disallowsApi = rules.some((rule) => {
      const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
      return disallow.includes("/api");
    });
    expect(disallowsApi).toBe(true);
  });

  it("allows the root path for at least one rule (site is otherwise crawlable)", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];

    const allowsRoot = rules.some((rule) => {
      const allow = Array.isArray(rule.allow) ? rule.allow : [rule.allow];
      return allow.includes("/");
    });
    expect(allowsRoot).toBe(true);
  });

  it("points the sitemap field at a well-formed /sitemap.xml URL", () => {
    const result = robots();

    expect(result.sitemap).toBeDefined();
    expect(() => new URL(result.sitemap as string)).not.toThrow();
    expect(result.sitemap).toMatch(/\/sitemap\.xml$/);
  });
});
