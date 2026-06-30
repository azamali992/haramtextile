import { getAboutContent } from "@/lib/services/about-content.service";
import { AboutFormClient } from "./AboutFormClient";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const about = await getAboutContent();

  return (
    <div>
      <h1 className="mb-6 font-heading text-xl text-brown-deep">About content</h1>
      <AboutFormClient initialAbout={about} />
    </div>
  );
}
