import { listClientLogos } from "@/lib/services/client-logo.service";
import { ClientsClient } from "./ClientsClient";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const logos = await listClientLogos();

  return (
    <div>
      <h1 className="mb-6 font-heading text-xl text-brown-deep">Client logos</h1>
      <ClientsClient initialLogos={logos} />
    </div>
  );
}
