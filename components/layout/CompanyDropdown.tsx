"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/certifications", label: "Certifications" },
  { href: "/contact", label: "Contact" },
];

interface CompanyDropdownProps {
  /** Text color class matching the header's current state (over-hero vs solid). */
  textColorClass: string;
  /** Hover color class matching the header's current state. */
  hoverColorClass: string;
}

/**
 * Desktop-nav "Company ▾" dropdown — groups About/Certifications/Contact
 * under a single hover/click-triggered panel. Opens on hover (desktop mouse)
 * or click (keyboard/touch), closes on outside-click, Esc, or link select.
 */
export function CompanyDropdown({ textColorClass, hoverColorClass }: CompanyDropdownProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isActive = COMPANY_LINKS.some(
    (link) => pathname === link.href || pathname.startsWith(`${link.href}/`),
  );

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
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`relative flex items-center gap-1.5 font-body text-sm font-medium uppercase tracking-wide opacity-90 transition-opacity duration-150 hover:opacity-100 ${textColorClass} ${hoverColorClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]`}
      >
        Company
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
            transition: "transform 150ms",
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        {isActive && (
          <span
            className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--brand)]"
            aria-hidden="true"
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="absolute left-0 top-full z-40 mt-3 min-w-[12rem] rounded-card border border-[var(--hairline)] bg-[var(--surface-card)] py-2 shadow-card"
          >
            {COMPANY_LINKS.map((link) => (
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
