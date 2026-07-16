"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUI } from "@/components/layout/UIProvider";
import { siteContent } from "@/lib/site-content";

const NAV_LINKS = [
  { href: "/catalog", label: "Catalog" },
  { href: "/production", label: "Production" },
  { href: "/about", label: "About" },
  { href: "/certifications", label: "Certifications" },
  { href: "/sustainability", label: "Sustainability" },
  { href: "/contact", label: "Contact" },
];

// Links are split symmetrically around the centered logo.
const LEFT_LINKS = NAV_LINKS.slice(0, 3);
const RIGHT_LINKS = NAV_LINKS.slice(3);

interface SiteHeaderProps {
  /**
   * When true the header sits absolutely over a dark hero section -
   * transparent bg, light text. When false (default) it renders as a solid
   * cream-off bordered bar.
   */
  overHero?: boolean;
}

/**
 * Public site header. Adaptive: transparent/light-text when on the home
 * route "/" (auto-detected via `usePathname()`) or when `overHero={true}`
 * is explicitly passed, solid cream bar on all other routes.
 *
 * Center: logo + wordmark. Nav links (all pages, no dropdown) are split
 * symmetrically on either side of the logo, each with an animated
 * underline-on-hover. Far right: a green "Get a Quote" pill (opens
 * ContactModal). Nav collapses to the burger (opens MenuOverlay) below `lg`.
 *
 * The `overHero` prop is kept for backwards-compat and explicit override
 * (Phase 3b pages that have their own hero can pass it). The home-route
 * auto-detection means Phase 3a does not need to pass it from the layout.
 */
export function SiteHeader({ overHero = false }: SiteHeaderProps) {
  const { openContact, openMenu } = useUI();
  const pathname = usePathname();

  // Auto-enable over-hero styling on the home route.
  const isOverHero = overHero || pathname === "/";

  const wrapperClasses = isOverHero
    ? "absolute inset-x-0 top-0 z-30"
    : "sticky top-0 z-30 border-b border-[var(--hairline)] bg-[var(--surface-card)]/95 backdrop-blur-sm";

  const textColor = isOverHero ? "text-[var(--on-brand)]" : "text-[var(--ink)]";
  const linkHover = isOverHero ? "hover:text-[var(--brand-light)]" : "hover:text-[var(--brand-deep)]";
  const logoFilter = isOverHero ? "brightness-0 invert" : "";

  /** A single nav link with the gold underline that wipes in on hover and
   *  stays lit for the active route. */
  const navLink = (link: { href: string; label: string }) => {
    const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
    return (
      <Link
        key={link.href}
        href={link.href}
        aria-current={isActive ? "page" : undefined}
        className={`group relative font-body text-sm font-medium uppercase tracking-wide transition-colors duration-200 ${linkHover} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] rounded-sm`}
      >
        {link.label}
        <span
          className={`pointer-events-none absolute -bottom-1.5 left-0 h-[1.5px] w-full origin-left rounded-full bg-[var(--brand)] transition-transform duration-300 ease-out ${
            isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
          }`}
          aria-hidden="true"
        />
      </Link>
    );
  };

  return (
    <header className={wrapperClasses}>
      <div
        className="mx-auto flex h-20 max-w-[90rem] items-center justify-between gap-4 px-6 sm:px-10"
      >
        {/* Left nav — hugs the logo from the left (hidden <lg) */}
        <nav
          aria-label="Primary"
          className={`hidden flex-1 items-center justify-end gap-7 lg:flex ${textColor}`}
        >
          {LEFT_LINKS.map(navLink)}
        </nav>

        {/* Center brand */}
        <div className="flex flex-1 justify-center lg:flex-none">
          <Link
            href="/"
            aria-label={siteContent.site.name}
            className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] rounded"
          >
            <Image
              src="/images/brand/logo2.png"
              alt={siteContent.site.name}
              width={220}
              height={93}
              className={`h-14 w-auto transition-[filter] duration-150 ${logoFilter}`}
              priority
            />
          </Link>
        </div>

        {/* Right: nav hugs the logo; green pill + burger pushed to the edge */}
        <div className={`flex flex-1 items-center gap-7 ${textColor}`}>
          {/* Right nav links (hidden <lg) */}
          <nav aria-label="Company" className="hidden items-center justify-start gap-7 lg:flex">
            {RIGHT_LINKS.map(navLink)}
          </nav>

          {/* Trailing controls — pinned to the far right edge */}
          <div className="ml-auto flex items-center gap-4">
            {/* Get a Quote — green pill */}
            <button
              type="button"
              onClick={openContact}
              className={`hidden items-center rounded-[var(--radius-pill)] bg-[var(--brand-deep)] px-5 py-2.5 font-body text-sm font-medium uppercase tracking-wide text-[var(--on-brand)] transition-colors duration-200 hover:bg-[var(--brand-deeper)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 sm:inline-flex ${
                isOverHero ? "ring-1 ring-white/25" : ""
              }`}
            >
              Get a Quote
            </button>

            {/* Burger (mobile nav; hidden ≥lg where the full nav shows) */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={openMenu}
            className={`grid size-10 place-items-center rounded-[var(--radius-pill)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] lg:hidden ${
              isOverHero
                ? "bg-white/15 text-[var(--on-brand)] hover:bg-white/25 backdrop-blur-sm"
                : "bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--hairline)]"
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <rect y="4" width="20" height="1" rx="0.5" fill="currentColor" />
              <rect y="10" width="20" height="1" rx="0.5" fill="currentColor" />
            </svg>
          </button>
          </div>
        </div>
      </div>
    </header>
  );
}
