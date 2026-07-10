import type { Metadata } from "next";
import { listProducts } from "@/lib/services/product.service";
import { getSeoSettings } from "@/lib/services/seo-settings.service";
import { config } from "@/lib/config";
import { siteContent } from "@/lib/site-content";
import { buildMetadata, buildItemListSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FilterBar } from "@/components/ui/FilterBar";
import { isPlaceholderImageUrl, getFallbackImageForCategory } from "@/lib/product-image-fallback";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { ProductsGrid } from "@/components/sections/ProductsGrid";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await getSeoSettings().catch(() => null);

  return buildMetadata(
    {
      title: "Our Products",
      description: siteContent.home.productLine,
      path: "/products",
    },
    {
      siteTitleSuffix: seoSettings?.siteTitleSuffix,
      siteUrl: config.NEXT_PUBLIC_SITE_URL,
    },
  );
}

const PRODUCTS_FAQS = [
  {
    question: "Is there a minimum order quantity (MOQ)?",
    answer:
      "MOQ varies by style and fabric. Contact our export team with your target quantity and we will confirm pricing and lead time for your order.",
  },
  {
    question: "Can products be customized?",
    answer:
      "Yes. " +
      siteContent.home.fashionConcepts,
  },
  {
    question: "What fabrics does Haram Textile work with?",
    answer: siteContent.home.products,
  },
  {
    question: "What product categories are available?",
    answer: `We manufacture ${siteContent.productCategories.map((c) => c.name).join(", ")}, covering knitwear, T-shirts, polo shirts, sweatshirts, and more.`,
  },
];

interface ProductsPageProps {
  searchParams: { category?: string };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const activeCategory = searchParams.category;
  const { products } = await listProducts({ category: activeCategory });

  const baseUrl = config.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  const itemListSchema = buildItemListSchema(
    products.map((product) => ({
      name: product.name,
      url: `${baseUrl}/products/${product.id}`,
      imageUrl: isPlaceholderImageUrl(product.imageUrl) ? undefined : product.imageUrl,
    })),
  );

  const categories = siteContent.productCategories.map((category) => ({
    slug: category.slug,
    name: category.name,
  }));

  /** Resolve image + fallback server-side so ProductsGrid stays a client component */
  const productItems = products.map((product) => {
    const usableImage = !isPlaceholderImageUrl(product.imageUrl);
    const fallback = getFallbackImageForCategory(product.category.slug, product.id);
    const image = usableImage
      ? { src: product.imageUrl, width: 530, height: 600 }
      : fallback ?? {
          src: "https://picsum.photos/seed/haram-product/530/600",
          width: 530,
          height: 600,
        };
    return {
      id: product.id,
      name: product.name,
      fabricType: product.fabricType,
      moq: product.moq,
      categoryName: product.category.name,
      image,
    };
  });

  return (
    <main>
      <Breadcrumb
        items={[
          { name: "Home", url: baseUrl, href: "/" },
          { name: "Products", url: `${baseUrl}/products` },
        ]}
      />

      {/* Editorial page header */}
      <div className="px-6 pb-14 pt-12 sm:px-10 sm:pt-16">
        <div className="mx-auto max-w-[90rem]">
          <h1 className="sr-only">Our Products</h1>
          <SectionHeader
            eyebrow="What we make"
            eyebrowTone="dark"
            title={["Our products"]}
            body={siteContent.home.productLine}
            titleClassName="font-normal text-[3rem] sm:text-display-lg text-[var(--ink)]"
            bodyClassName="text-[var(--ink-soft)] max-w-2xl text-body"
          />
        </div>
      </div>

      {/* Category filter tabs */}
      <FilterBar categories={categories} />

      {/* Products grid or empty state */}
      <section
        aria-labelledby="product-grid-heading"
        className="px-6 py-14 sm:px-10 sm:py-16"
      >
        <h2 id="product-grid-heading" className="sr-only">
          All Products
        </h2>

        {products.length === 0 ? (
          <div className="mx-auto max-w-[90rem] py-16">
            <p className="font-heading text-title font-normal text-[var(--ghost)]">
              Nothing here yet.
            </p>
            <p className="mt-4 max-w-xl font-body text-body text-[var(--ink-soft)]">
              No products found in this category yet. Please check back soon or{" "}
              <a
                href="/contact"
                className="text-[var(--brand-strong)] underline underline-offset-4 hover:text-[var(--brand-deep)]"
              >
                contact our export team
              </a>{" "}
              for current availability.
            </p>
          </div>
        ) : (
          <ProductsGrid products={productItems} />
        )}
      </section>

      <FaqAccordion faqs={PRODUCTS_FAQS} title="Ordering, MOQ & Customization FAQs" />

      <JsonLd data={itemListSchema} />
    </main>
  );
}
