"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { TiltCard } from "@/components/motion/TiltCard";

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
 * The panel is aria-hidden; the accessible name/fabric/MOQ live in the
 * text block below the image, which is always visible on touch devices.
 */
export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/catalog/${product.id}`} className="group block">
      <TiltCard className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-[var(--surface)]">
        <Image
          src={product.image.src}
          alt={`${product.name}, ${product.categoryName} apparel by Haram Textile`}
          width={product.image.width}
          height={product.image.height}
          className="h-full w-full object-cover transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:scale-[1.06]"
        />

        {/*
         * Hover info panel: sits at translateY(100%) at rest (hidden below
         * the card edge) and slides to translateY(0) on group-hover.
         * Restricted to hover-capable devices via [@media(hover:hover)] so
         * touch users always see the accessible text below instead.
         */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 z-20 translate-y-full bg-gradient-to-t from-scrim/90 via-scrim/55 to-transparent px-6 pb-7 pt-20 transition-transform duration-[280ms] ease-out [@media(hover:hover)]:group-hover:translate-y-0"
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
      </TiltCard>
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
  /** Direct link to the certificate PDF, if uploaded. */
  pdfUrl?: string | null;
}

interface CertificationCardProps {
  certification: CertificationCardData;
}

/**
 * Portrait certification card: the full certificate scan shown in a tall
 * frame, with the name/issuer/description below and a "View certificate"
 * action that opens the PDF in a new tab (falls back to the detail page
 * when no PDF is attached).
 */
export function CertificationCard({ certification }: CertificationCardProps) {
  const hasPdf = Boolean(certification.pdfUrl);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-card border border-[var(--hairline)] bg-[var(--surface-card)] transition-colors duration-200 hover:border-[var(--brand)]">
      {/* Portrait certificate image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden border-b border-[var(--hairline)] bg-white">
        <Image
          src={certification.image.src}
          alt={`${certification.name} certificate`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain p-6 transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:scale-[1.03]"
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-7">
        <h3 className="font-heading text-title-sm font-normal text-[var(--ink)]">
          {certification.name}
        </h3>
        {certification.issuingBody && (
          <p className="mt-1.5 font-body text-caption font-medium text-[var(--brand-strong)]">
            {certification.issuingBody}
          </p>
        )}
        {certification.description && (
          <p className="mt-4 font-body text-caption leading-relaxed text-[var(--ink-soft)]">
            {certification.description}
          </p>
        )}

        {/* Action pinned to the bottom */}
        <div className="mt-6 pt-2">
          {hasPdf ? (
            <a
              href={certification.pdfUrl as string}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-pill border border-[var(--brand-deep)] px-5 py-2.5 font-body text-xs font-medium uppercase tracking-wide text-[var(--brand-deep)] transition-colors duration-150 hover:bg-[var(--brand-deep)] hover:text-[var(--on-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
              aria-label={`View ${certification.name} certificate (PDF)`}
            >
              View certificate
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            </a>
          ) : (
            <Link
              href={`/certifications/${certification.id}`}
              className="inline-flex items-center gap-2 border-b border-[var(--brand)] pb-0.5 font-body text-xs font-medium uppercase tracking-wide text-[var(--ink)] transition-colors duration-150 hover:text-[var(--brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
            >
              View details
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
