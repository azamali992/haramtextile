"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/admin/products", label: "Products" },
  { href: "/admin/certifications", label: "Certifications" },
  { href: "/admin/production-steps", label: "Production" },
  { href: "/admin/hero", label: "Hero" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/stats", label: "Stats" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/seo", label: "SEO Settings" },
];

/** Deep-green sidebar navigation shared by every authenticated admin page. */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex w-56 flex-shrink-0 flex-col bg-green-primary px-4 py-6">
      <span className="mb-6 px-2 font-heading text-lg text-cream-off">Haram Admin</span>

      <ul className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded px-3 py-2 text-sm text-cream-off transition-colors ${
                  isActive ? "bg-green-light font-medium" : "hover:bg-green-light/60"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => {
          signOut({ callbackUrl: "/admin/login" }).catch(() => {
            window.location.href = "/admin/login";
          });
        }}
        className="mt-6 rounded border border-cream-off/30 px-3 py-2 text-left text-sm text-cream-off hover:bg-green-light/60"
      >
        Log out
      </button>
    </nav>
  );
}
