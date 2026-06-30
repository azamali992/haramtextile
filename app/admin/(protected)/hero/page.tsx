import { getHeroConfig } from "@/lib/services/hero.service";
import { HeroFormClient } from "./HeroFormClient";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const hero = await getHeroConfig();

  return (
    <div>
      <h1 className="mb-6 font-heading text-xl text-brown-deep">Hero section</h1>
      <HeroFormClient initialHero={hero} />
    </div>
  );
}
