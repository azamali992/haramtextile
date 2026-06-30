import { created, validationError, internalError, tooManyRequests } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { contactSubmissionSchema } from "@/lib/validators/contact";
import { submitContactForm } from "@/lib/services/contact.service";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const CONTACT_RATE_LIMIT = 5;
const CONTACT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

/**
 * POST /api/contact
 * Public contact form submission. Validates input with Zod, persists it
 * (untrusted `name`/`company`/`message` are stored via Prisma's
 * parameterized queries — never concatenated into raw SQL — and are
 * HTML-escaped again at email-render time in `lib/email.ts`), and sends a
 * notification email. Safe to retry: duplicate submissions simply create
 * additional rows, there is no unique constraint to violate.
 *
 * Rate-limited to 5 submissions per 15 minutes per IP (see lib/rate-limit.ts)
 * to deter spam/abuse of the public form and its outbound email side effect.
 */
export async function POST(request: Request) {
  const requestId = newRequestId();
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(`contact:${ip}`, CONTACT_RATE_LIMIT, CONTACT_RATE_LIMIT_WINDOW_MS)) {
      return tooManyRequests("Too many contact form submissions. Please try again later.");
    }

    const body = await request.json().catch(() => null);

    if (body === null) {
      return validationError("Request body must be valid JSON.");
    }

    const parsed = contactSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid contact form submission.", parsed.error.flatten());
    }

    const submission = await submitContactForm(parsed.data);

    return created({
      id: submission.id,
      name: submission.name,
      email: submission.email,
      company: submission.company,
      createdAt: submission.createdAt,
    });
  } catch (error) {
    logger.error(requestId, "contact_submit_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
