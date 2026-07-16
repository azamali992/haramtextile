"use client";

import Image from "next/image";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealLines } from "@/components/motion/RevealLines";
import { Inview } from "@/components/motion/Inview";
import { useUI } from "@/components/layout/UIProvider";
import { siteContent } from "@/lib/site-content";

// ─── Nav columns ──────────────────────────────────────────────────────────────

const PRODUCT_LINKS = [
  { href: "/catalog?category=boys", label: "Boys Collection" },
  { href: "/catalog?category=girls", label: "Girls Collection" },
  { href: "/catalog?category=gents", label: "Gents Collection" },
  { href: "/catalog?category=ladies", label: "Ladies Collection" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/production", label: "Production" },
  { href: "/certifications", label: "Certifications" },
  { href: "/sustainability", label: "Sustainability" },
  { href: "/contact", label: "Contact" },
];

// ─── Footer ───────────────────────────────────────────────────────────────────

/**
 * Public site footer. Deep-green (`--brand-deep`) background with:
 * - CTA band with stacked-line headline and "Get a Quote" pill
 * - Columns grid: brand column + Products + Company nav columns
 * - Bottom bar with copyright and certification list
 */
export function SiteFooter() {
  const { openContact } = useUI();
  const year = new Date().getFullYear();
  const primaryEmail = siteContent.contact.emails[0]?.email;

  return (
    <footer
      className="mt-3 rounded-[var(--radius-card-lg)] bg-[var(--brand-deep)] px-6 py-14 text-[var(--on-brand)] sm:px-10 sm:py-16"
      id="footer"
    >
      {/* CTA band */}
      <div className="flex flex-col items-start justify-between gap-8 border-b border-white/15 pb-14 sm:flex-row sm:items-end">
        {/* Left */}
        <div>
          <Eyebrow tone="light">Get started</Eyebrow>
          <div className="mt-4 font-heading text-5xl font-normal leading-[0.92] tracking-tight sm:text-6xl">
            <RevealLines
              lines={["Ready to", "start your order?"]}
              stagger={120}
              duration={0.95}
              lineClassName="text-[var(--on-brand)]"
            />
          </div>
        </div>

        {/* CTA pill */}
        <Inview
          from={{ opacity: 0, y: 20 }}
          to={{ opacity: 1, y: 0 }}
          delayIn={150}
          stiffness={200}
          damping={24}
          className="flex-shrink-0"
        >
          <button
            type="button"
            onClick={openContact}
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--surface-card)] px-7 py-3.5 font-body text-sm font-medium uppercase tracking-wide text-[var(--brand-deep)] transition-colors duration-150 hover:bg-[var(--brand-light)] hover:text-[var(--on-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-light)]"
          >
            Get a Quote
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </Inview>
      </div>

      {/* Columns grid */}
      <div className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr]">
        {/* Brand column */}
        <div className="max-w-xs">
          <Link href="/" aria-label={siteContent.site.name}>
            <Image
              src="/images/brand/logo2.png"
              alt={siteContent.site.name}
              width={160}
              height={68}
              className="h-8 w-auto brightness-0 invert"
            />
          </Link>
          <p className="mt-4 font-body text-sm leading-relaxed text-[var(--on-brand)]/80">
            {siteContent.home.aboutShort}
          </p>
          {/* Address */}
          <address className="mt-6 font-body text-sm not-italic text-[var(--on-brand)]/80">
            {primaryEmail && (
              <a
                href={`mailto:${primaryEmail}`}
                className="block transition-opacity duration-150 hover:opacity-100 opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-light)] rounded"
              >
                {primaryEmail}
              </a>
            )}
            <a
              href={`tel:${siteContent.contact.phone.replace(/\s/g, "")}`}
              className="mt-1 block opacity-80 transition-opacity duration-150 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-light)] rounded"
            >
              {siteContent.contact.phone}
            </a>
            <span className="mt-1 block text-[var(--on-brand)]/55">
              {siteContent.contact.address}
            </span>
          </address>
        </div>

        {/* Catalog links */}
        <nav aria-label="Catalog">
          <p
            className="font-body text-xs font-medium uppercase tracking-[0.2em] text-[var(--on-brand)]/50"
          >
            Catalog
          </p>
          <ul className="mt-4 space-y-3">
            {PRODUCT_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-body text-sm text-[var(--on-brand)]/80 transition-opacity duration-150 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-light)] rounded"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Company links */}
        <nav aria-label="Company">
          <p
            className="font-body text-xs font-medium uppercase tracking-[0.2em] text-[var(--on-brand)]/50"
          >
            Company
          </p>
          <ul className="mt-4 space-y-3">
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-body text-sm text-[var(--on-brand)]/80 transition-opacity duration-150 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-light)] rounded"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/15 pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-sm text-[var(--on-brand)]/60">
            &copy; {year} {siteContent.site.name}. All rights reserved.
          </p>
          <p className="font-body text-sm text-[var(--on-brand)]/60">
            {siteContent.certifications.list.join(" · ")}
          </p>
        </div>

        {/* Powered by Azektra — centered, prominent */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <span className="font-body text-xs font-medium uppercase tracking-[0.28em] text-[var(--on-brand)]/70">
            Powered by
          </span>
          <a
            href="https://azektra.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg bg-white px-6 py-4 shadow-card transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-deep)]"
            aria-label="Azektra — visit azektra.com"
          >
            <Image
              src="/images/azektra.png"
              alt="Azektra"
              width={477}
              height={119}
              className="h-9 w-auto sm:h-10"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
