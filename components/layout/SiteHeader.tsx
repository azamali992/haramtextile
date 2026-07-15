"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUI } from "@/components/layout/UIProvider";
import { siteContent } from "@/lib/site-content";
import { CompanyDropdown } from "@/components/layout/CompanyDropdown";

const NAV_LINKS = [
  { href: "/catalog", label: "Catalog" },
  { href: "/production", label: "Production" },
];

interface SiteHeaderProps {
  /**
   * When true the header sits absolutely over a dark hero section —
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
 * Left: nav links + Company dropdown (hidden <lg). Center: logo + wordmark.
 * Right: "Get a Quote" text button (opens ContactModal) + burger (opens
 * MenuOverlay).
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

  return (
    <header className={wrapperClasses}>
      <div
        className="mx-auto flex h-20 max-w-[90rem] items-center justify-between px-6 sm:px-10"
      >
        {/* Left nav (hidden <lg) */}
        <nav
          aria-label="Primary"
          className={`hidden flex-1 items-center gap-8 lg:flex ${textColor}`}
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative font-body text-sm font-medium uppercase tracking-wide opacity-90 transition-opacity duration-150 hover:opacity-100 ${linkHover} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]`}
              >
                {link.label}
                {isActive && (
                  <span
                    className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--brand)]"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
          <CompanyDropdown textColorClass={textColor} hoverColorClass={linkHover} />
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

        {/* Right controls */}
        <div className={`flex flex-1 items-center justify-end gap-4 ${textColor}`}>
          {/* Get a Quote (text button, hidden <sm) */}
          <button
            type="button"
            onClick={openContact}
            className={`hidden font-body text-sm font-medium uppercase tracking-wide opacity-90 transition-opacity duration-150 hover:opacity-100 ${linkHover} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] sm:block`}
          >
            Get a Quote
          </button>

          {/* Burger */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={openMenu}
            className={`grid size-10 place-items-center rounded-[var(--radius-pill)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] ${
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
    </header>
  );
}
