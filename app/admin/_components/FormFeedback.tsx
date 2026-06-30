import { isZodFlattenedDetails, type ZodFlattenedDetails } from "@/lib/admin/api-client";

interface FormFeedbackProps {
  /** Top-level error message to display, if any. */
  message: string | null;
  /** Optional Zod `flatten()` details for per-field error display. */
  details?: unknown;
}

/**
 * Renders a server/client validation error banner. When `details` is the
 * flattened Zod shape (`{ fieldErrors, formErrors }`), every field error is
 * listed individually so users can see exactly what to fix.
 */
export function FormFeedback({ message, details }: FormFeedbackProps) {
  if (!message) {
    return null;
  }

  const fieldErrors: ZodFlattenedDetails["fieldErrors"] = isZodFlattenedDetails(details)
    ? details.fieldErrors
    : undefined;

  return (
    <div
      role="alert"
      className="rounded border border-red-700 bg-red-50 px-3 py-2 text-sm text-red-800"
    >
      <p className="font-medium">{message}</p>
      {fieldErrors && (
        <ul className="mt-1 list-inside list-disc">
          {Object.entries(fieldErrors).map(([field, errors]) =>
            errors && errors.length > 0 ? (
              <li key={field}>
                <span className="font-medium">{field}:</span> {errors.join(", ")}
              </li>
            ) : null,
          )}
        </ul>
      )}
    </div>
  );
}

interface SuccessBannerProps {
  message: string | null;
}

/** Small green success banner shown briefly after a successful save. */
export function SuccessBanner({ message }: SuccessBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="status"
      className="rounded border border-green-primary bg-green-primary/10 px-3 py-2 text-sm text-green-primary"
    >
      {message}
    </div>
  );
}
