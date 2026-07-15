import { NextRequest } from "next/server";
import { ok, notFound, validationError, unauthenticated, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { submissionUpdateSchema } from "@/lib/validators/contact";
import { getSubmissionById, setSubmissionReadState } from "@/lib/services/contact.service";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/** PUT /api/admin/submissions/[id] - toggles the read/unread state of a submission. */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const existing = await getSubmissionById(params.id);
    if (!existing) {
      return notFound("Submission not found.");
    }

    const body = await request.json().catch(() => null);
    if (body === null) {
      return validationError("Request body must be valid JSON.");
    }

    const parsed = submissionUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid submission payload.", parsed.error.flatten());
    }

    const submission = await setSubmissionReadState(params.id, parsed.data.isRead);
    return ok(submission);
  } catch (error) {
    logger.error(requestId, "admin_submission_update_failed", {
      submissionId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
