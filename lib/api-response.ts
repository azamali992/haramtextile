/**
 * Consistent JSON response envelope helpers used by every route under
 * `app/api/**`.
 *
 * Success: { data: T, meta?: { total, page } }
 * Error:   { error: { code, message } }
 */
import { NextResponse } from "next/server";

export interface ApiMeta {
  total?: number;
  page?: number;
}

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "BAD_REQUEST"
  | "RATE_LIMITED";

export function ok<T>(data: T, meta?: ApiMeta, status = 200): NextResponse {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) }, { status });
}

export function created<T>(data: T): NextResponse {
  return ok(data, undefined, 201);
}

/** 204 No Content must not include a JSON body. */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function fail(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: unknown,
): NextResponse {
  return NextResponse.json(
    { error: { code, message, ...(details !== undefined ? { details } : {}) } },
    { status },
  );
}

export const unauthenticated = (message = "Authentication required.") =>
  fail("UNAUTHENTICATED", message, 401);

export const forbidden = (message = "You do not have access to this resource.") =>
  fail("FORBIDDEN", message, 403);

export const notFound = (message = "Resource not found.") =>
  fail("NOT_FOUND", message, 404);

export const validationError = (message: string, details?: unknown) =>
  fail("VALIDATION_ERROR", message, 422, details);

export const badRequest = (message: string) => fail("BAD_REQUEST", message, 400);

export const tooManyRequests = (message = "Too many requests. Please try again later.") =>
  fail("RATE_LIMITED", message, 429);

export const internalError = (message = "An unexpected error occurred.") =>
  fail("INTERNAL_ERROR", message, 500);
