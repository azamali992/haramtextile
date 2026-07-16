import { NextRequest } from "next/server";
import {
  ok,
  noContent,
  notFound,
  validationError,
  unauthenticated,
  internalError,
} from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { teamMemberUpdateSchema } from "@/lib/validators/team-member";

export const dynamic = "force-dynamic";
import {
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
} from "@/lib/services/team-member.service";

interface RouteParams {
  params: { id: string };
}

/** GET /api/admin/team-members/[id] */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const member = await getTeamMemberById(params.id);
    if (!member) {
      return notFound("Team member not found.");
    }
    return ok(member);
  } catch (error) {
    logger.error(requestId, "admin_team_member_get_failed", {
      teamMemberId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** PUT /api/admin/team-members/[id] */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const existing = await getTeamMemberById(params.id);
    if (!existing) {
      return notFound("Team member not found.");
    }

    const body = await request.json().catch(() => null);
    if (body === null) {
      return validationError("Request body must be valid JSON.");
    }

    const parsed = teamMemberUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid team member payload.", parsed.error.flatten());
    }

    const member = await updateTeamMember(params.id, parsed.data);
    return ok(member);
  } catch (error) {
    logger.error(requestId, "admin_team_member_update_failed", {
      teamMemberId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** DELETE /api/admin/team-members/[id] */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const existing = await getTeamMemberById(params.id);
    if (!existing) {
      return notFound("Team member not found.");
    }

    await deleteTeamMember(params.id);
    return noContent();
  } catch (error) {
    logger.error(requestId, "admin_team_member_delete_failed", {
      teamMemberId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
