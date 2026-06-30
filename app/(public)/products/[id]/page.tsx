import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/services/product.service";
import { getSeoSettings } from "@/lib/services/seo-settings.service";
import { config } from "@/lib/config";
import { siteContent } from "@/lib/site-content";
import { buildMetadata, buildProductSchema, sanitizeForJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  isPlaceholderImageUrl,
  getFallbackImageForCategory,
  getFallbackGalleryForCategory,
} from "@/lib/product-image-fallback";
import { ProductDetailClient } from "@/components/sections/ProductDetailClient";

export const dynamic = "force-dynamic";

interface ProductDetailPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const product = await getProductById(params.id).catch(() => null);
  if (!product) {
    return buildMetadata({ noIndex: true }, { siteUrl: config.NEXT_PUBLIC_SITE_URL });
  }

  const seoSettings = await getSeoSettings().catch(() => null);

  return buildMetadata(
    {
      title: product.seoTitle ?? product.name,
      description: product.seoDescription ?? product.description ?? undefined,
      path: `/products/${product.id}`,
    },
    {
      siteTitleSuffix: seoSettings?.siteTitleSuffix,
      siteUrl: config.NEXT_PUBLIC_SITE_URL,
    },
  );
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  const baseUrl = config.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const usableImage = !isPlaceholderImageUrl(product.imageUrl);
  const coverFallback = getFallbackImageForCategory(product.category.slug, product.id);
  const coverImage = usableImage
    ? { src: product.imageUrl, width: 530, height: 600 }
    : coverFallback ?? { src: "https://picsum.photos/seed/haram-detail/530/600", width: 530, height: 600 };

  const gallery = usableImage ? [] : getFallbackGalleryForCategory(product.category.slug).slice(0, 6);

  const productSchema = buildProductSchema({
    name: product.name,
    description: product.description,
    imageUrl: usableImage ? product.imageUrl : `${baseUrl}${coverImage.src}`,
    url: `${baseUrl}/products/${product.id}`,
    categoryName: product.category.name,
    brandName: siteContent.site.name,
  });

  // sku/manufacturer/offers are appended directly since buildProductSchema doesn't model them.
  const productSchemaWithExtras = {
    ...productSchema,
    sku: product.id,
    manufacturer: { "@type": "Organization", name: siteContent.site.name },
    material: product.fabricType ? sanitizeForJsonLd(product.fabricType) : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
      url: `${baseUrl}/products/${product.id}`,
    },
  };

  return (
    <main>
      <Breadcrumb
        items={[
          { name: "Home", url: baseUrl, href: "/" },
          { name: "Products", url: `${baseUrl}/products`, href: "/products" },
          { name: product.name, url: `${baseUrl}/products/${product.id}` },
        ]}
      />

      <ProductDetailClient
        product={{
          id: product.id,
          name: product.name,
          description: product.description ?? null,
          fabricType: product.fabricType ?? null,
          moq: product.moq ?? null,
          tags: product.tags,
          categoryName: product.category.name,
          coverImage,
          gallery,
        }}
      />

      <JsonLd data={productSchemaWithExtras} />
    </main>
  );
}
