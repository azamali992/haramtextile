import { listSubmissions } from "@/lib/services/contact.service";
import { SubmissionsClient } from "./SubmissionsClient";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage() {
  const submissions = await listSubmissions();

  return (
    <div>
      <h1 className="mb-6 font-heading text-xl text-brown-deep">Contact submissions</h1>
      <SubmissionsClient initialSubmissions={submissions} />
    </div>
  );
}
