import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCertificationById } from "@/lib/services/certification.service";
import { getSeoSettings } from "@/lib/services/seo-settings.service";
import { config } from "@/lib/config";
import { siteContent } from "@/lib/site-content";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { isPlaceholderImageUrl } from "@/lib/product-image-fallback";
import { CertificationDetailClient } from "@/components/sections/CertificationDetailClient";

export const dynamic = "force-dynamic";

interface CertificationDetailPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: CertificationDetailPageProps): Promise<Metadata> {
  const certification = await getCertificationById(params.id).catch(() => null);
  if (!certification) {
    return buildMetadata({ noIndex: true }, { siteUrl: config.NEXT_PUBLIC_SITE_URL });
  }

  const seoSettings = await getSeoSettings().catch(() => null);

  return buildMetadata(
    {
      title: certification.seoTitle ?? certification.name,
      description: certification.seoDescription ?? certification.description ?? undefined,
      path: `/certifications/${certification.id}`,
    },
    {
      siteTitleSuffix: seoSettings?.siteTitleSuffix,
      siteUrl: config.NEXT_PUBLIC_SITE_URL,
    },
  );
}

export default async function CertificationDetailPage({
  params,
}: CertificationDetailPageProps) {
  const certification = await getCertificationById(params.id);

  if (!certification) {
    notFound();
  }

  const baseUrl = config.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const usableImage = !isPlaceholderImageUrl(certification.imageUrl);
  const image = usableImage
    ? { src: certification.imageUrl, width: 400, height: 200 }
    : { src: "/images/certifications/certification-badge.jpg", width: 400, height: 200 };

  return (
    <main>
      <Breadcrumb
        items={[
          { name: "Home", url: baseUrl, href: "/" },
          { name: "Certifications", url: `${baseUrl}/certifications`, href: "/certifications" },
          { name: certification.name, url: `${baseUrl}/certifications/${certification.id}` },
        ]}
      />

      <CertificationDetailClient
        certification={{
          id: certification.id,
          name: certification.name,
          issuingBody: certification.issuingBody ?? null,
          description: certification.description ?? null,
          image,
          siteName: siteContent.site.name,
        }}
      />
    </main>
  );
}
