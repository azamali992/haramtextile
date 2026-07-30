import { listDepartments } from "@/lib/services/department.service";
import { DepartmentsClient } from "./DepartmentsClient";

export const dynamic = "force-dynamic";

export default async function AdminDepartmentsPage() {
  const departments = await listDepartments();

  return (
    <div>
      <h1 className="mb-2 font-heading text-xl text-brown-deep">Departments</h1>
      <p className="mb-6 max-w-2xl text-sm text-gray-warm">
        Departments group the team members shown on the About page. Add, rename,
        and reorder them here, then assign people to a department on the{" "}
        <span className="font-medium">Team</span> page.
      </p>
      <DepartmentsClient initialDepartments={departments} />
    </div>
  );
}
