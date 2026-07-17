"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { siteContent } from "@/lib/site-content";

/**
 * The seven in-house manufacturing stages, deep-linked to their anchors on the
 * Business Functions page (`ProductionStepsClient` renders `id={step.slug}`
 * on each row).
 */
const STEP_LINKS = siteContent.manufacturing.map((step) => ({
  href: `/production#${step.slug}`,
  label: step.name,
}));

interface BusinessFunctionsDropdownProps {
  /** Hover color class matching the header's current state (over-hero vs solid). */
  hoverColorClass: string;
}

/**
 * Desktop-nav "Business Functions" item: a link to the page itself, plus a
 * hover/focus panel deep-linking every manufacturing stage. Opens on hover or
 * keyboard focus, closes on mouse-leave, Esc, outside-click, or link select.
 */
export function BusinessFunctionsDropdown({
  hoverColorClass,
}: BusinessFunctionsDropdownProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isActive = pathname === "/production" || pathname.startsWith("/production/");

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        // Close only when focus leaves the trigger *and* the panel.
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <Link
        href="/production"
        aria-current={isActive ? "page" : undefined}
        aria-haspopup="true"
        aria-expanded={open}
        className={`group relative flex items-center gap-1.5 font-body text-sm font-medium uppercase tracking-wide transition-colors duration-200 ${hoverColorClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] rounded-sm`}
      >
        Business Functions
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{
            transform: open ? "rotate(180deg)" : undefined,
            transition: "transform 200ms",
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        <span
          className={`pointer-events-none absolute -bottom-1.5 left-0 h-[1.5px] w-full origin-left rounded-full bg-[var(--brand)] transition-transform duration-300 ease-out ${
            isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
          }`}
          aria-hidden="true"
        />
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="absolute left-0 top-full z-40 mt-3 min-w-[13rem] rounded-card border border-[var(--hairline)] bg-[var(--surface-card)] py-2 shadow-card"
          >
            {STEP_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-5 py-2.5 font-body text-sm text-[var(--ink)] transition-colors duration-150 hover:bg-[var(--surface)] hover:text-[var(--brand-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
