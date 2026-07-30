"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useUI } from "@/components/layout/UIProvider";
import { siteContent } from "@/lib/site-content";
import { BusinessFunctionsDropdown } from "@/components/layout/BusinessFunctionsDropdown";

// Right-hand nav, ordered to mirror the reference layout. "Business Functions"
// is a dropdown rendered separately and slotted between Catalog and
// Certifications below.
const LEADING_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/catalog", label: "Catalog" },
];
const TRAILING_LINKS = [
  { href: "/certifications", label: "Certifications" },
  { href: "/sustainability", label: "Sustainability" },
  { href: "/contact", label: "Contact" },
];

/**
 * Public site header: a simple, sticky dark bar (deep green - the inverse of
 * the cream page background) with the logo on the left and the navigation on
 * the right. Stays pinned to the top on scroll. Collapses to a burger below
 * `lg`.
 */
export function SiteHeader() {
  const { openContact, openMenu } = useUI();
  const pathname = usePathname();

  // Large at the top of the page, shrinks to a compact bar once scrolled.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLink = (link: { href: string; label: string }) => {
    const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
    return (
      <Link
        key={link.href}
        href={link.href}
        aria-current={isActive ? "page" : undefined}
        className={`relative whitespace-nowrap rounded-full px-2.5 py-2 font-body text-sm font-bold uppercase tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] ${
          isActive
            ? "bg-white/12 text-[var(--brand-light)]"
            : "text-[var(--on-brand)]/80 hover:bg-white/8 hover:text-[var(--on-brand)]"
        }`}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-[var(--brand-deep)] text-[var(--on-brand)] transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.55)]"
          : "border-b border-transparent"
      }`}
    >
      {/* Thin gold accent line along the bottom edge */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--brand)]/50 to-transparent"
      />
      <div
        className={`flex w-full items-center justify-between gap-3 px-5 transition-all duration-300 sm:px-8 ${
          scrolled ? "h-20" : "h-32"
        }`}
      >
        {/* Logo - left. Large at the top of the page; on scroll it shrinks
            down to what used to be the "top" size (not smaller). */}
        <Link
          href="/"
          aria-label={siteContent.site.name}
          className="flex flex-shrink-0 items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
        >
          <Image
            src="/images/brand/logo2.png"
            alt={siteContent.site.name}
            width={220}
            height={93}
            className={`w-auto brightness-0 invert transition-all duration-300 ${
              scrolled ? "h-14 sm:h-16" : "h-20 sm:h-24"
            }`}
            priority
          />
        </Link>

        {/* Nav - right (hidden <lg) */}
        <nav aria-label="Primary" className="hidden items-center gap-0.5 xl:flex xl:gap-1.5">
          {LEADING_LINKS.map(navLink)}
          <BusinessFunctionsDropdown hoverColorClass="hover:text-[var(--on-brand)]" />
          {TRAILING_LINKS.map(navLink)}
          <button
            type="button"
            onClick={openContact}
            className="group ml-1.5 inline-flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[var(--brand)] px-4 py-2.5 font-body text-sm font-bold uppercase tracking-wide text-[var(--brand-deep)] shadow-[0_4px_14px_-2px_rgba(0,0,0,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--brand-light)] hover:shadow-[0_8px_22px_-4px_rgba(0,0,0,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-deep)]"
          >
            Get a Quote
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </nav>

        {/* Burger - mobile (<lg) */}
        <button
          type="button"
          aria-label="Open menu"
          onClick={openMenu}
          className="grid size-10 place-items-center rounded-[var(--radius-pill)] bg-white/10 text-[var(--on-brand)] backdrop-blur-sm transition-colors duration-150 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] xl:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect y="4" width="20" height="1.4" rx="0.7" fill="currentColor" />
            <rect y="10" width="20" height="1.4" rx="0.7" fill="currentColor" />
            <rect y="16" width="20" height="1.4" rx="0.7" fill="currentColor" />
          </svg>
        </button>
      </div>
    </header>
  );
}
