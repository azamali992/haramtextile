/**
 * Typed helpers for constructing fake `NextRequest`/`Request` objects to
 * pass directly into App Router route handlers under test.
 *
 * Route handlers are typed against `next/server`'s `NextRequest` (a
 * subclass of the standard `Request`), but every handler in this codebase
 * only ever calls plain `Request`-compatible methods on it (`.json()`,
 * `.formData()`, `new URL(request.url)`, etc.) — none of them touch
 * `NextRequest`-only members like `.cookies` or `.nextUrl`. Constructing a
 * real `NextRequest` in a Node test environment requires a real incoming
 * connection that doesn't exist here, so we build a standard `Request`
 * and cast it once, centrally, here — rather than scattering `as any`
 * across every test file (which the project's ESLint config forbids).
 */
import type { NextRequest } from "next/server";

export function toNextRequest(request: Request): NextRequest {
  return request as NextRequest;
}

export function jsonRequest(method: string, url: string, body?: unknown): NextRequest {
  return toNextRequest(
    new Request(url, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),
  );
}

export function rawRequest(method: string, url: string, rawBody: string): NextRequest {
  return toNextRequest(
    new Request(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: rawBody,
    }),
  );
}
