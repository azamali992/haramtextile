/**
 * Test strategy: integration tests for admin contact-submission routes
 * (GET /api/admin/submissions, PUT /api/admin/submissions/[id] to toggle
 * read state).
 *
 * Run with: npx vitest run tests/api/admin/submissions.test.ts
 */
import { describe, it, expect, beforeEach, afterAll, afterEach, vi } from "vitest";
import { mockAuthenticated, mockUnauthenticated } from "../../helpers/mock-session";
import { resetDatabase, disconnect } from "../../helpers/db";
import { jsonRequest as buildJsonRequest } from "../../helpers/request";
import { prisma } from "@/lib/prisma";

import { GET as listRoute } from "@/app/api/admin/submissions/route";
import { PUT as updateRoute } from "@/app/api/admin/submissions/[id]/route";

function jsonRequest(url: string, body?: unknown) {
  return buildJsonRequest("PUT", url, body);
}

async function seedSubmission(overrides: Partial<{ isRead: boolean }> = {}) {
  return prisma.contactSubmission.create({
    data: {
      name: "Test Submitter",
      email: "submitter@example.com",
      message: "A test inquiry.",
      isRead: overrides.isRead ?? false,
    },
  });
}

describe("admin submissions routes — authentication gating", () => {
  beforeEach(async () => {
    await resetDatabase();
    await mockUnauthenticated();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("GET /api/admin/submissions returns 401 with no session", async () => {
    const response = await listRoute();
    expect(response.status).toBe(401);
  });

  it("PUT /api/admin/submissions/[id] returns 401 with no session", async () => {
    const response = await updateRoute(
      jsonRequest("http://localhost/api/admin/submissions/any", { isRead: true }),
      { params: { id: "any" } },
    );
    expect(response.status).toBe(401);
  });
});

describe("admin submissions routes — authenticated", () => {
  beforeEach(async () => {
    await resetDatabase();
    await mockAuthenticated();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("GET /api/admin/submissions returns 200 with all submissions, newest first", async () => {
    await seedSubmission();

    const response = await listRoute();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.meta.total).toBe(1);
    expect(body.data[0].email).toBe("submitter@example.com");
  });

  it("GET /api/admin/submissions returns 200 with an empty array when none exist", async () => {
    const response = await listRoute();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("PUT /api/admin/submissions/[id] toggles isRead to true and returns 200", async () => {
    const submission = await seedSubmission({ isRead: false });

    const response = await updateRoute(
      jsonRequest(`http://localhost/api/admin/submissions/${submission.id}`, { isRead: true }),
      { params: { id: submission.id } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.isRead).toBe(true);
  });

  it("PUT /api/admin/submissions/[id] returns 404 for a nonexistent id", async () => {
    const response = await updateRoute(
      jsonRequest("http://localhost/api/admin/submissions/nonexistent", { isRead: true }),
      { params: { id: "nonexistent" } },
    );
    expect(response.status).toBe(404);
  });

  it("PUT /api/admin/submissions/[id] returns 422 when isRead is not a boolean", async () => {
    const submission = await seedSubmission();

    const response = await updateRoute(
      jsonRequest(`http://localhost/api/admin/submissions/${submission.id}`, { isRead: "yes" }),
      { params: { id: submission.id } },
    );
    expect(response.status).toBe(422);
  });
});
