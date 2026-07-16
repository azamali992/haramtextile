import { NextRequest } from "next/server";
import { ok, created, validationError, unauthenticated, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { teamMemberCreateSchema } from "@/lib/validators/team-member";
import { listTeamMembers, createTeamMember } from "@/lib/services/team-member.service";

export const dynamic = "force-dynamic";

/** GET /api/admin/team-members */
export async function GET() {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const members = await listTeamMembers();
    return ok(members, { total: members.length });
  } catch (error) {
    logger.error(requestId, "admin_team_members_list_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** POST /api/admin/team-members */
export async function POST(request: NextRequest) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const body = await request.json().catch(() => null);
    if (body === null) {
      return validationError("Request body must be valid JSON.");
    }

    const parsed = teamMemberCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid team member payload.", parsed.error.flatten());
    }

    const member = await createTeamMember(parsed.data);
    return created(member);
  } catch (error) {
    logger.error(requestId, "admin_team_member_create_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
