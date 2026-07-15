import type { Metadata } from "next";
import Image from "next/image";
import { listProducts } from "@/lib/services/product.service";
import { Parallax } from "@/components/motion/Parallax";
import { getSeoSettings } from "@/lib/services/seo-settings.service";
import { config } from "@/lib/config";
import { siteContent } from "@/lib/site-content";
import { buildMetadata, buildItemListSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { isPlaceholderImageUrl, getFallbackImageForCategory } from "@/lib/product-image-fallback";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { ProductsBrowser } from "@/components/sections/ProductsBrowser";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await getSeoSettings().catch(() => null);

  return buildMetadata(
    {
      title: "Our Catalog",
      description: siteContent.home.productLine,
      path: "/catalog",
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
  const activeCategory = searchParams.category ?? "";
  // Fetch ALL products; category filtering happens client-side in
  // ProductsBrowser so switching filters animates in place rather than
  // re-navigating. Deep links still render the correct subset (below).
  const { products } = await listProducts({});

  const baseUrl = config.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  // Schema reflects the initially-visible subset so a deep-linked category
  // view describes what's actually on screen.
  const schemaProducts = activeCategory
    ? products.filter((product) => product.category.slug === activeCategory)
    : products;

  const itemListSchema = buildItemListSchema(
    schemaProducts.map((product) => ({
      name: product.name,
      url: `${baseUrl}/catalog/${product.id}`,
      imageUrl: isPlaceholderImageUrl(product.imageUrl) ? undefined : product.imageUrl,
    })),
  );

  const categories = siteContent.productCategories.map((category) => ({
    slug: category.slug,
    name: category.name,
  }));

  /** Resolve image + fallback server-side so ProductsBrowser stays presentational. */
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
      categorySlug: product.category.slug,
      image,
    };
  });

  // Editorial header image: an atmospheric fabric photograph, not a
  // product-on-white studio shot (those read as cut-outs and dissolve muddily
  // into the cream page). The signature fabric-stack image carries the
  // editorial register the catalog opener needs.
  const headerImage = "/images/hero/hero-factory.jpg";

  return (
    <main>
      <Breadcrumb
        items={[
          { name: "Home", url: baseUrl, href: "/" },
          { name: "Catalog", url: `${baseUrl}/catalog` },
        ]}
      />

      {/* Editorial page header - image panel (sm+) dissolving into the cream
          page, with the title anchored in the faded zone so it stays legible.
          Mobile keeps the plain text header (no image). */}
      <div className="relative">
        {/* Image plate - sm+ only, decorative */}
        <div
          className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block"
          aria-hidden="true"
        >
          <Parallax range={["0%", "12%"]}>
            <Image
              src={headerImage}
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-[center_25%]"
              priority
            />
            {/* Dissolve to the cream page background: fabric reads across the
                top half, then resolves to solid --background by the midpoint so
                the eyebrow/title/body below sit on clean cream and stay legible
                regardless of what colors fall behind them. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 0%, var(--background) 52%, var(--background) 100%)",
              }}
            />
          </Parallax>
        </div>

        <div className="relative px-6 pb-14 pt-12 sm:px-10 sm:pt-[26vh]">
          <div className="mx-auto max-w-[90rem]">
            <h1 className="sr-only">Our Catalog</h1>
            <SectionHeader
              eyebrow="What we make"
              eyebrowTone="dark"
              title={["Our catalog"]}
              body={siteContent.home.productLine}
              titleClassName="font-normal text-[3rem] sm:text-display-lg text-[var(--ink)]"
              bodyClassName="text-[var(--ink-soft)] max-w-2xl text-body"
            />
          </div>
        </div>
      </div>

      {/* Category filter + animated products grid (client-side) */}
      <ProductsBrowser
        products={productItems}
        categories={categories}
        initialCategory={activeCategory}
      />

      <FaqAccordion faqs={PRODUCTS_FAQS} title="Ordering, MOQ & Customization FAQs" />

      <JsonLd data={itemListSchema} />
    </main>
  );
}
