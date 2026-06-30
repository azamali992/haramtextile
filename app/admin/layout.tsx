import type { Metadata } from "next";

/**
 * The admin panel must never be indexed by search engines, regardless of
 * the root layout's own metadata defaults. Declaring it here cascades to
 * every nested `/admin/**` route, including `/admin/login`.
 *
 * This layout intentionally contains no session check and no visual shell:
 * `/admin/login` must render outside the authenticated sidebar chrome, so
 * the actual guard + sidebar shell live in `app/admin/(protected)/layout.tsx`,
 * which every other admin route sits under. Route groups let both share
 * this metadata-only parent without the login page inheriting a redirect
 * loop.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // `admin-root` is a styling hook only (display:contents = no box of its own).
  // globals.css uses `html:has(.admin-root)` to pin the root font-size back to
  // 16px so the public-site adaptive rem grid never rescales the admin panel.
  return (
    <div className="admin-root contents">{children}</div>
  );
}
