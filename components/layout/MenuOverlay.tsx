"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "@/components/motion/LenisProvider";
import { useUI } from "@/components/layout/UIProvider";
import { siteContent } from "@/lib/site-content";

// ─── Nav links ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/catalog", label: "Catalog" },
  { href: "/production", label: "Business Functions" },
  { href: "/about", label: "About" },
  { href: "/certifications", label: "Certifications" },
  { href: "/sustainability", label: "Sustainability" },
  { href: "/contact", label: "Contact" },
];

// ─── MenuOverlay (exported) ───────────────────────────────────────────────────

/**
 * Full-screen menu overlay portaled to `document.body`.
 * Open/close state is managed by `UIProvider` (`useUI().openMenu()` /
 * `useUI().closeMenu()`).
 *
 * Clicking a nav link navigates and closes the overlay. "Get a Quote" closes
 * the menu then opens the contact modal. Esc closes.
 *
 * Scroll is locked via `useLenis()` while the overlay is open.
 */
// Selector for all naturally focusable elements within a container.
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MenuOverlay() {
  const { isMenuOpen, closeMenu, openContact } = useUI();
  const { stop, start } = useLenis();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  // Remember which element opened the menu so we can restore focus on close.
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll lock / unlock.
  useEffect(() => {
    if (isMenuOpen) {
      // Save the element that triggered the menu open so we can restore later.
      triggerRef.current = document.activeElement;
      stop();
    } else {
      start();
      // Restore focus to the trigger element after the overlay closes.
      if (triggerRef.current && triggerRef.current instanceof HTMLElement) {
        // Small delay to allow exit animation to begin before focus shift.
        setTimeout(() => {
          (triggerRef.current as HTMLElement).focus();
        }, 50);
      }
    }
  }, [isMenuOpen, stop, start]);

  // Esc closes.
  useEffect(() => {
    if (!isMenuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMenuOpen, closeMenu]);

  // Focus trap: Tab and Shift+Tab cycle within the overlay panel.
  const handlePanelKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (el) => !el.closest("[inert]") && el.offsetParent !== null,
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  function handleNavClick(href: string) {
    closeMenu();
    // Small delay to let the overlay animate out before navigation.
    setTimeout(() => router.push(href), 150);
  }

  function handleGetQuote() {
    closeMenu();
    setTimeout(openContact, 150);
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[70] flex flex-col"
          aria-label="Site menu"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-[var(--brand-deep)]"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            className="relative flex h-full flex-col overflow-y-auto px-2 sm:px-3"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -24 }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
            onKeyDown={handlePanelKeyDown}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-6 sm:px-8 sm:py-8">
              {/* Wordmark */}
              <Link href="/" onClick={closeMenu} aria-label={siteContent.site.name} className="flex-shrink-0">
                <Image
                  src="/images/brand/logo2.png"
                  alt={siteContent.site.name}
                  width={160}
                  height={68}
                  className="h-10 w-auto brightness-0 invert"
                  priority
                />
              </Link>

              {/* Close button */}
              <motion.button
                type="button"
                aria-label="Close menu"
                onClick={closeMenu}
                className="grid size-10 place-items-center rounded-[var(--radius-pill)] bg-white/15 text-[var(--on-brand)] transition-colors duration-150 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-deep)]"
                whileHover={prefersReducedMotion ? undefined : { rotate: 90 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </motion.button>
            </div>

            {/* Nav links - centered */}
            <nav
              aria-label="Main menu"
              className="flex flex-1 flex-col justify-center gap-2 px-4 sm:px-8"
            >
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 26,
                    delay: (120 + i * 70) / 1000,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleNavClick(link.href)}
                    className="block w-full text-left font-heading text-5xl font-medium leading-tight tracking-tight text-[var(--on-brand)] transition-colors duration-150 hover:text-[var(--brand-light)] focus-visible:outline-none focus-visible:underline sm:text-7xl"
                  >
                    {link.label}
                  </button>
                </motion.div>
              ))}
            </nav>

            {/* Bottom bar */}
            <div
              className="flex flex-col gap-4 border-t border-white/15 px-4 py-6 sm:flex-row sm:items-center sm:px-8 sm:py-8"
            >
              <button
                type="button"
                onClick={handleGetQuote}
                className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--surface-card)] px-7 py-3.5 font-body text-sm font-medium uppercase tracking-wide text-[var(--brand-deep)] transition-colors duration-150 hover:bg-[var(--brand-light)] hover:text-[var(--on-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-light)]"
              >
                Get a Quote
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
