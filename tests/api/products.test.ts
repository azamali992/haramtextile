/**
 * Test strategy: integration tests against a real Postgres test DB for the
 * public product endpoints (GET /api/products, GET /api/products/[id]).
 *
 * Covers:
 *  - happy path: envelope shape ({data, meta}), correct fields, 200 status
 *  - filtering by category/search query params
 *  - edge cases: empty result set, unknown id -> 404
 *  - error envelope shape on 404 ({error: {code, message}})
 *
 * Run with: npx vitest run tests/api/products.test.ts
 * (requires a Postgres test DB — see tests/helpers/db.ts and the project
 * README section this task added for Docker setup instructions)
 */
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { GET as listProductsRoute } from "@/app/api/products/route";
import { GET as getProductRoute } from "@/app/api/products/[id]/route";
import { resetDatabase, seedCategory, seedProduct, disconnect } from "../helpers/db";
import { toNextRequest } from "../helpers/request";

function makeRequest(url: string) {
  return toNextRequest(new Request(url));
}

describe("GET /api/products", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("returns 200 with an empty data array and total 0 when no products exist", async () => {
    const response = await listProductsRoute(makeRequest("http://localhost/api/products"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ data: [], meta: { total: 0 } });
  });

  it("returns the correct envelope shape with product fields on success", async () => {
    const category = await seedCategory({ name: "Gents", slug: "gents-test" });
    await seedProduct(category.id, { name: "Polo Shirt" });

    const response = await listProductsRoute(makeRequest("http://localhost/api/products"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.meta.total).toBe(1);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]).toMatchObject({
      name: "Polo Shirt",
      category: { slug: "gents-test" },
    });
    // imagePublicId is intentionally NOT exposed on the public listing.
    expect(body.data[0].imagePublicId).toBeUndefined();
  });

  it("filters products by category slug query param", async () => {
    const categoryA = await seedCategory({ name: "Gents", slug: "gents-filter" });
    const categoryB = await seedCategory({ name: "Ladies", slug: "ladies-filter" });
    await seedProduct(categoryA.id, { name: "Gents Shirt" });
    await seedProduct(categoryB.id, { name: "Ladies Dress" });

    const response = await listProductsRoute(
      makeRequest("http://localhost/api/products?category=gents-filter"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].name).toBe("Gents Shirt");
  });

  it("filters products by search query param matching name", async () => {
    const category = await seedCategory();
    await seedProduct(category.id, { name: "Unique Search Target" });
    await seedProduct(category.id, { name: "Something Else" });

    const response = await listProductsRoute(
      makeRequest("http://localhost/api/products?search=Unique"),
    );
    const body = await response.json();

    expect(body.data).toHaveLength(1);
    expect(body.data[0].name).toBe("Unique Search Target");
  });

  it("returns an empty array when category filter matches nothing", async () => {
    const category = await seedCategory();
    await seedProduct(category.id);

    const response = await listProductsRoute(
      makeRequest("http://localhost/api/products?category=does-not-exist"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });
});

describe("GET /api/products/[id]", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("returns 200 with the product envelope when the product exists", async () => {
    const category = await seedCategory();
    const product = await seedProduct(category.id, { name: "Specific Product" });

    const response = await getProductRoute(makeRequest(`http://localhost/api/products/${product.id}`), {
      params: { id: product.id },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.id).toBe(product.id);
    expect(body.data.name).toBe("Specific Product");
    // imagePublicId is intentionally NOT exposed on the public single-product lookup.
    expect(body.data.imagePublicId).toBeUndefined();
  });

  it("returns 404 with the standard error envelope when the product does not exist", async () => {
    const response = await getProductRoute(
      makeRequest("http://localhost/api/products/nonexistent-id"),
      { params: { id: "nonexistent-id" } },
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({
      error: { code: "NOT_FOUND", message: "Product not found." },
    });
  });

  it("returns 404 for an empty-string id rather than throwing", async () => {
    const response = await getProductRoute(makeRequest("http://localhost/api/products/"), {
      params: { id: "" },
    });

    expect(response.status).toBe(404);
  });
});
