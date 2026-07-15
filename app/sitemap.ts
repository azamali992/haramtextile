import type { MetadataRoute } from "next";
import { config } from "@/lib/config";
import { listProducts } from "@/lib/services/product.service";
import { listCertifications } from "@/lib/services/certification.service";

/**
 * Generate the sitemap at request time, not at build time. It reads
 * product/certification rows from the database, so building it statically
 * would require a reachable DB during `next build` (and would also serve a
 * stale snapshot). `force-dynamic` defers the DB query to each request,
 * which is what lets the Vercel build succeed before the DB is reachable.
 */
export const dynamic = "force-dynamic";

/**
 * Dynamic sitemap covering all public pages plus DB-backed product and
 * certification detail pages. `/admin/*` is intentionally excluded.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = config.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  const [{ products }, certifications] = await Promise.all([
    listProducts({}),
    listCertifications(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/certifications`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/sustainability`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/catalog/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const certificationPages: MetadataRoute.Sitemap = certifications.map((certification) => ({
    url: `${baseUrl}/certifications/${certification.id}`,
    lastModified: certification.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...certificationPages];
}
