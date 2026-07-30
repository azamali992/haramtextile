import { listTeamMembers } from "@/lib/services/team-member.service";
import { listDepartments } from "@/lib/services/department.service";
import { TeamClient } from "./TeamClient";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const [members, departments] = await Promise.all([
    listTeamMembers(),
    listDepartments(),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-heading text-xl text-brown-deep">Team</h1>
      <p className="mb-6 max-w-2xl text-sm text-gray-warm">
        The team shown on the About page. Assign each person to a department
        (managed on the <span className="font-medium">Departments</span> page).
        Edits here update the live site.
      </p>
      <TeamClient
        initialMembers={members}
        departments={departments.map((d) => ({ id: d.id, name: d.name }))}
      />
    </div>
  );
}
