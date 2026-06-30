/**
 * Shared client-side helpers for the admin panel.
 *
 * All `/api/admin/**` routes return the standard envelope from
 * `lib/api-response.ts`: `{ data, meta? }` on success or
 * `{ error: { code, message, details? } }` on failure. These helpers
 * centralize that parsing so individual forms don't repeat it.
 */

export interface ApiErrorShape {
  code: string;
  message: string;
  details?: unknown;
}

export class AdminApiError extends Error {
  code: string;
  details?: unknown;
  status: number;

  constructor(error: ApiErrorShape, status: number) {
    super(error.message);
    this.name = "AdminApiError";
    this.code = error.code;
    this.details = error.details;
    this.status = status;
  }
}

/**
 * Flattened Zod error shape produced by `error.flatten()` on the server,
 * e.g. `{ fieldErrors: { name: ["name is required"] }, formErrors: [] }`.
 */
export interface ZodFlattenedDetails {
  fieldErrors?: Record<string, string[] | undefined>;
  formErrors?: string[];
}

/** Type guard narrowing unknown `details` payloads to the Zod flatten shape. */
export function isZodFlattenedDetails(
  details: unknown,
): details is ZodFlattenedDetails {
  return (
    typeof details === "object" &&
    details !== null &&
    ("fieldErrors" in details || "formErrors" in details)
  );
}

/**
 * Calls an `/api/admin/**` endpoint and returns the parsed `data` payload.
 * Throws `AdminApiError` on any non-2xx response. Returns `undefined` for
 * 204 No Content responses.
 */
export async function adminFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        ...(init?.body && !(init.body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new AdminApiError(
      { code: "NETWORK_ERROR", message: "Could not reach the server. Check your connection and try again." },
      0,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const error: ApiErrorShape = json?.error ?? {
      code: "UNKNOWN_ERROR",
      message: "Something went wrong. Please try again.",
    };
    throw new AdminApiError(error, response.status);
  }

  return json?.data as T;
}

/**
 * Uploads a single image file via `/api/admin/upload` and returns both the
 * resulting URL and Cloudinary's real `public_id`, as returned directly by
 * the upload endpoint (`lib/services/upload.service.ts` -> `lib/storage.ts`
 * `uploadImage`).
 *
 * Sends a custom `X-Requested-With` header as defense-in-depth against
 * CSRF on this mutating multipart endpoint: a plain cross-site HTML form
 * cannot set custom headers (only CORS-safelisted ones), so the server can
 * cheaply reject any request missing it before even checking the session.
 * This is in addition to, not a replacement for, the `sameSite=lax` session
 * cookie and `requireAdminSession()` check already in place.
 */
export async function uploadAdminImage(
  file: File,
): Promise<{ url: string; imagePublicId: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const { url, publicId } = await adminFetch<{ url: string; publicId: string }>(
    "/api/admin/upload",
    {
      method: "POST",
      body: formData,
      headers: { "X-Requested-With": "haram-admin" },
    },
  );

  return { url, imagePublicId: publicId };
}
