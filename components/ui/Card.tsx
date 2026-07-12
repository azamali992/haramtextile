import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export interface ProductCardData {
  id: string;
  name: string;
  fabricType?: string | null;
  moq?: string | null;
  categoryName: string;
  image: { src: string; width: number; height: number };
}

interface ProductCardProps {
  product: ProductCardData;
}

/**
 * Editorial product card: full-bleed 4/5 photo with a hover zoom + a
 * two-layer info panel that slides up from the card bottom on hover.
 * The panel is aria-hidden — the accessible name/fabric/MOQ live in the
 * text block below the image, which is always visible on touch devices.
 */
export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-[var(--surface)]">
        <Image
          src={product.image.src}
          alt={`${product.name}, ${product.categoryName} apparel by Haram Textile`}
          width={product.image.width}
          height={product.image.height}
          className="h-full w-full object-cover transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:scale-[1.06]"
        />

        {/*
         * Hover info panel — sits at translateY(100%) at rest (hidden below
         * the card edge) and slides to translateY(0) on group-hover.
         * Restricted to hover-capable devices via [@media(hover:hover)] so
         * touch users always see the accessible text below instead.
         */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-scrim/90 via-scrim/55 to-transparent px-6 pb-7 pt-20 transition-transform duration-[280ms] ease-out [@media(hover:hover)]:group-hover:translate-y-0"
        >
          <p className="font-heading text-title-sm font-normal text-[var(--on-brand)]">
            {product.name}
          </p>
          {product.fabricType && (
            <p className="mt-1 font-body text-caption text-on-brand/80">
              {product.fabricType}
            </p>
          )}
          <span className="mt-4 inline-flex items-center gap-1.5 font-body text-xs uppercase tracking-[0.14em] text-on-brand/65">
            View details
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-heading text-title-sm font-normal text-[var(--ink)]">
            {product.name}
          </h3>
          {product.fabricType && (
            <p className="mt-1.5 font-body text-caption text-[var(--ink-soft)]">
              {product.fabricType}
            </p>
          )}
        </div>
        {product.moq && (
          <Badge variant="moq" className="shrink-0 whitespace-nowrap">
            MOQ {product.moq}
          </Badge>
        )}
      </div>
    </Link>
  );
}

export interface CertificationCardData {
  id: string;
  name: string;
  issuingBody?: string | null;
  description?: string | null;
  image: { src: string; width: number; height: number };
}

interface CertificationCardProps {
  certification: CertificationCardData;
}

/** Surface card with hairline border that warms to gold on hover. */
export function CertificationCard({ certification }: CertificationCardProps) {
  return (
    <Link
      href={`/certifications/${certification.id}`}
      className="block rounded-card border border-[var(--hairline)] bg-[var(--surface)] p-7 transition-colors duration-200 hover:border-[var(--brand)]"
    >
      <div className="relative h-16 w-full">
        <Image
          src={certification.image.src}
          alt={`${certification.name} certification badge`}
          width={certification.image.width}
          height={certification.image.height}
          className="h-16 w-auto object-contain"
        />
      </div>
      <h3 className="mt-5 font-heading text-title-sm font-normal text-[var(--ink)]">
        {certification.name}
      </h3>
      {certification.issuingBody && (
        <p className="mt-1.5 font-body text-caption font-medium text-[var(--ink-soft)]">
          {certification.issuingBody}
        </p>
      )}
      {certification.description && (
        <p className="mt-4 font-body text-caption leading-relaxed text-[var(--ink-soft)]">
          {certification.description}
        </p>
      )}
    </Link>
  );
}
