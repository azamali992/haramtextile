import { listStats } from "@/lib/services/stat.service";
import { StatsClient } from "./StatsClient";

export const dynamic = "force-dynamic";

export default async function AdminStatsPage() {
  const stats = await listStats();

  return (
    <div>
      <h1 className="mb-6 font-heading text-xl text-brown-deep">Stats</h1>
      <p className="mb-6 max-w-2xl text-sm text-gray-warm">
        These figures power the numbered stat rows across the site (home, about,
        production). Edits here update the live site.
      </p>
      <StatsClient initialStats={stats} />
    </div>
  );
}
