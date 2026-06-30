/**
 * Test strategy: integration tests for POST /api/contact (public contact
 * form submission).
 *
 * Boundary mock: `lib/email.ts`'s `sendContactNotification` talks to a real
 * SMTP server, which isn't available in this environment — mocked here so
 * tests are fast/deterministic/isolated, per the "mock at the boundary"
 * rule. The DB write itself goes through the real Postgres test DB so we
 * can assert the submission was actually persisted.
 *
 * Covers:
 *  - happy path: 201 + created envelope, row persisted in DB
 *  - validation: missing/invalid fields each produce 422 via Zod
 *  - malformed JSON body -> 422 (not a 500)
 *  - edge case: optional `company` field can be omitted
 *  - the request still succeeds (201) even if the notification email
 *    throws, since contact.service.ts intentionally swallows email errors
 *
 * Run with: npx vitest run tests/api/contact.test.ts
 */
import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";

vi.mock("@/lib/email", () => ({
  sendContactNotification: vi.fn().mockResolvedValue(undefined),
}));

import { POST as postContactRoute } from "@/app/api/contact/route";
import { sendContactNotification } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { _resetRateLimitsForTests } from "@/lib/rate-limit";
import { resetDatabase, disconnect } from "../helpers/db";

function makeJsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeRawRequest(rawBody: string): Request {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: rawBody,
  });
}

describe("POST /api/contact", () => {
  beforeEach(async () => {
    await resetDatabase();
    _resetRateLimitsForTests();
    vi.mocked(sendContactNotification).mockClear();
    vi.mocked(sendContactNotification).mockResolvedValue(undefined);
  });

  afterAll(async () => {
    await disconnect();
  });

  it("returns 201 with the created envelope on a valid submission", async () => {
    const response = await postContactRoute(
      makeJsonRequest({
        name: "Jane Buyer",
        email: "jane@example.com",
        company: "Acme Imports",
        message: "Interested in a bulk order of polo shirts.",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data).toMatchObject({ name: "Jane Buyer", email: "jane@example.com", company: "Acme Imports" });
    expect(body.data.id).toBeTruthy();
  });

  it("persists the submission to the database", async () => {
    await postContactRoute(
      makeJsonRequest({
        name: "Persisted User",
        email: "persisted@example.com",
        message: "Please contact me.",
      }),
    );

    const rows = await prisma.contactSubmission.findMany({ where: { email: "persisted@example.com" } });
    expect(rows).toHaveLength(1);
    expect(rows[0].isRead).toBe(false);
  });

  it("accepts a submission without the optional company field", async () => {
    const response = await postContactRoute(
      makeJsonRequest({
        name: "No Company",
        email: "nocompany@example.com",
        message: "No company provided.",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.company).toBeFalsy();
  });

  it("calls the email notification side effect on success", async () => {
    await postContactRoute(
      makeJsonRequest({ name: "Email Check", email: "emailcheck@example.com", message: "hi" }),
    );

    expect(sendContactNotification).toHaveBeenCalledTimes(1);
  });

  it("still returns 201 and persists the submission even if the notification email throws", async () => {
    vi.mocked(sendContactNotification).mockRejectedValueOnce(new Error("SMTP connection refused"));

    const response = await postContactRoute(
      makeJsonRequest({ name: "Email Fails", email: "emailfails@example.com", message: "hi" }),
    );

    expect(response.status).toBe(201);
    const rows = await prisma.contactSubmission.findMany({ where: { email: "emailfails@example.com" } });
    expect(rows).toHaveLength(1);
  });

  it("returns 422 with VALIDATION_ERROR when name is missing", async () => {
    const response = await postContactRoute(
      makeJsonRequest({ email: "missing-name@example.com", message: "hello" }),
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details).toBeDefined();
  });

  it("returns 422 when email is not a valid email address", async () => {
    const response = await postContactRoute(
      makeJsonRequest({ name: "Bad Email", email: "not-an-email", message: "hello" }),
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 when message is empty", async () => {
    const response = await postContactRoute(
      makeJsonRequest({ name: "No Message", email: "nomessage@example.com", message: "" }),
    );

    expect(response.status).toBe(422);
  });

  it("returns 422 when message exceeds the 5000 character maximum", async () => {
    const response = await postContactRoute(
      makeJsonRequest({
        name: "Too Long",
        email: "toolong@example.com",
        message: "a".repeat(5001),
      }),
    );

    expect(response.status).toBe(422);
  });

  it("returns 422 (not 500) when the request body is malformed JSON", async () => {
    const response = await postContactRoute(makeRawRequest("{not valid json"));
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects a basic XSS payload from being reflected unescaped (stored as-is, escaped at render time)", async () => {
    const xssPayload = '<script>alert("xss")</script>';
    const response = await postContactRoute(
      makeJsonRequest({ name: xssPayload, email: "xss@example.com", message: "test" }),
    );
    const body = await response.json();

    // The API itself doesn't strip HTML (escaping happens at email-render
    // time per lib/email.ts) but it must not execute or break the JSON
    // response — confirm it round-trips safely as a plain string.
    expect(response.status).toBe(201);
    expect(body.data.name).toBe(xssPayload);
  });

  it("rate-limits repeated submissions from the same IP, returning 429 after 5 within the window", async () => {
    function requestFromIp(ip: string, email: string) {
      return new Request("http://localhost/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
        body: JSON.stringify({ name: "Rate Limited", email, message: "hi" }),
      });
    }

    for (let i = 0; i < 5; i += 1) {
      const response = await postContactRoute(requestFromIp("203.0.113.5", `rl-${i}@example.com`));
      expect(response.status).toBe(201);
    }

    const sixthResponse = await postContactRoute(
      requestFromIp("203.0.113.5", "rl-6@example.com"),
    );
    const body = await sixthResponse.json();

    expect(sixthResponse.status).toBe(429);
    expect(body.error.code).toBe("RATE_LIMITED");
  });

  it("does not rate-limit a different IP after another IP exhausts its quota", async () => {
    function requestFromIp(ip: string, email: string) {
      return new Request("http://localhost/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
        body: JSON.stringify({ name: "Other IP", email, message: "hi" }),
      });
    }

    for (let i = 0; i < 5; i += 1) {
      await postContactRoute(requestFromIp("198.51.100.9", `exhausted-${i}@example.com`));
    }

    const otherIpResponse = await postContactRoute(
      requestFromIp("198.51.100.10", "fresh-ip@example.com"),
    );

    expect(otherIpResponse.status).toBe(201);
  });
});
