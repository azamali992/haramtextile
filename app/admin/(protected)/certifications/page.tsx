import { listCertifications } from "@/lib/services/certification.service";
import { CertificationsClient } from "./CertificationsClient";

export const dynamic = "force-dynamic";

export default async function AdminCertificationsPage() {
  const certifications = await listCertifications();

  return (
    <div>
      <h1 className="mb-6 font-heading text-xl text-brown-deep">Certifications</h1>
      <CertificationsClient initialCertifications={certifications} />
    </div>
  );
}
