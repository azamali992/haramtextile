import { listTeamMembers } from "@/lib/services/team-member.service";
import { TeamClient } from "./TeamClient";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const members = await listTeamMembers();

  return (
    <div>
      <h1 className="mb-6 font-heading text-xl text-brown-deep">Team</h1>
      <p className="mb-6 max-w-2xl text-sm text-gray-warm">
        The leadership team shown on the About page. Edits here update the live
        site.
      </p>
      <TeamClient initialMembers={members} />
    </div>
  );
}
