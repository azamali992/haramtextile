# Haram Textile

Public website and admin CMS for Haram Textile, a Faisalabad-based knitwear manufacturer and exporter. Next.js 14 (App Router) + TypeScript + Tailwind CSS, PostgreSQL via Prisma, NextAuth.js credentials auth, Cloudinary-backed image storage.

## Stack

- **Framework:** Next.js 14 (App Router), TypeScript (strict), Tailwind CSS
- **Database:** PostgreSQL via Prisma ORM 7 (driver adapter `@prisma/adapter-pg`)
- **Auth:** NextAuth.js v4, single credentials-based admin user, bcrypt-hashed password, JWT sessions
- **Images:** Cloudinary, isolated entirely behind `lib/storage.ts` (see [Swapping the image provider](#swapping-the-image-provider))
- **Email:** Nodemailer (SMTP) for contact-form notifications
- **Tests:** Vitest (API/unit, 162 tests) + Playwright (E2E, 19 tests)

## Project structure

```text
app/
  (public)/              Public site — route group, shares SiteHeader/SiteFooter via layout.tsx
    page.tsx              Home
    about/page.tsx
    products/page.tsx
    products/[id]/page.tsx
    certifications/page.tsx
    certifications/[id]/page.tsx
    contact/page.tsx
    products/loading.tsx  Skeleton shown while the category filter re-fetches
  admin/                  Admin CMS — NOT in the (public) group, own chrome/layout
    login/page.tsx
    (protected)/          Gated by middleware.ts + a server-side session check
      products/ certifications/ clients/ hero/ about/ seo/ submissions/
    _components/          AdminSidebar, Modal, ImageUploadField, ConfirmDeleteButton, FormFeedback
  api/
    products/ certifications/ hero/ about/ clients/ contact/    Public read routes
    admin/**                                                     Admin CRUD routes, all session-gated
    auth/[...nextauth]/                                          NextAuth handler
  layout.tsx              Root layout — fonts, Organization/WebSite JSON-LD, GA
  sitemap.ts / robots.ts   SEO technical files
components/
  ui/        Button, Card, Badge, Breadcrumb, FaqAccordion, FilterBar, ContactForm, Reveal, Modal
  layout/    SiteHeader, SiteFooter
  seo/       JsonLd (renders any schema.org object as a sanitized <script> tag)
lib/
  storage.ts             Sole Cloudinary import — see image-provider section below
  auth.ts / require-admin.ts / rate-limit.ts
  api-response.ts         Uniform {data,meta?} / {error:{code,message}} envelope
  seo.ts                  JSON-LD builders + sanitizeForJsonLd/sanitizeDeep
  repositories/ services/ validators/   Layered backend (routes -> services -> repositories)
  site-content.ts          Typed accessor for extracted-data/site-content.json (real company content)
prisma/
  schema.prisma, migrations/, seed.ts
tests/
  api/ (Vitest), e2e/ (Playwright), unit/ (admin-route-auth-sweep — statically locks in auth gating)
extracted-data/
  site-content.json + assets/images/   Scraped legacy-site content and real product photos
public/
  images/products/<category>/*.jpg     Curated real-photo fallbacks (used until real per-product photos are uploaded)
  llms.txt, llms-full.txt              AI answer-engine crawler files
```

## Setup

```bash
npm install
cp .env.example .env   # then fill in real values, see below
npx prisma migrate deploy   # applies existing migrations (use `migrate dev` only if you change schema.prisma)
npm run db:seed
npm run dev
```

Visit `http://localhost:3000` for the public site, `http://localhost:3000/admin/login` for the CMS.

### Environment variables

Every variable in `.env.example` is documented inline there. Summary:

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres connection string |
| `NEXTAUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` in dev, real domain in production |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | Yes | See [Cloudinary setup](#cloudinary-setup) |
| `EMAIL_HOST` / `_PORT` / `_USER` / `_PASS` / `EMAIL_TO` | Yes | SMTP for contact-form notifications |
| `NEXT_PUBLIC_SITE_URL` | Yes | No trailing slash; used in metadata, sitemap, JSON-LD |
| `NEXT_PUBLIC_GA_ID` | No | Leave blank to disable Google Analytics |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` | Recommended | Seed falls back to a placeholder password and warns loudly if unset — **change it before deploying** |
| `ADMIN_SEED_FORCE_RESET` | No | Set to `"true"` only when you deliberately want re-running the seed to reset the admin password |

`lib/config.ts` validates all required variables at startup and throws a combined error listing everything missing — you'll know immediately if something's not set.

## Cloudinary setup

1. Create a free account at cloudinary.com.
2. From the dashboard, copy **Cloud name**, **API Key**, and **API Secret** into `.env`.
3. No upload preset or folder needs to be created manually — `lib/storage.ts` uploads into a fixed `haram-textile/` folder automatically and applies `f_auto,q_auto,w_auto` to every delivery URL for responsive, auto-optimized images.
4. Nothing else to configure. The first image uploaded via the admin panel will create the folder.

## Swapping the image provider

`lib/storage.ts` is the **only** file in the codebase allowed to import the Cloudinary SDK — every route/service/component calls its two exports instead:

```ts
uploadImage(file: File): Promise<{ url: string; publicId: string }>
deleteImage(publicId: string): Promise<void>
```

To move to S3, Vercel Blob, UploadThing, or anything else: reimplement those two functions inside `lib/storage.ts` against the new provider, keep the exact same signatures, and nothing else in the app needs to change. Keep both fields in `uploadImage`'s return value if you swap providers — `publicId` is what `deleteImage` uses to clean up replaced/removed images.

## SEO / AEO checklist

- [x] `app/sitemap.ts` — generates a valid sitemap covering all 7 public routes, excludes `/admin/**`
- [x] `app/robots.ts` — disallows `/admin/`, points to the sitemap
- [x] `public/llms.txt` / `public/llms-full.txt` — AI-crawler-readable company summary (real content, not placeholder)
- [x] JSON-LD on every page: Organization + WebSite (root layout), LocalBusiness/ClothingStore (home), Product (product detail), ItemList (product/certification listings), FAQPage (every page's FAQ section), BreadcrumbList (every inner page), AboutPage, ContactPage — all run through `sanitizeForJsonLd`/`sanitizeDeep` before rendering
- [x] Per-page `generateMetadata()` with title/description/canonical, falling back to admin-configurable `SeoSettings` defaults
- [x] FAQ sections sourced from real company data on Home/About/Products/Certifications/Contact
- [x] Semantic HTML, descriptive alt text, no `<link>`-tag font loading (fonts via `next/font/google` only)
- [ ] **Verify in production**: open page source on each route and confirm the JSON-LD `<script>` blocks are present (they're server-rendered, so they should be, but verify after your first real deploy), and submit the sitemap to Google Search Console.

## Testing

```bash
npm test              # Vitest — API routes, auth gating, sitemap/robots validation
npm run test:coverage
npm run test:e2e      # Playwright — contact form, admin login, product CRUD, hero config
```

Both suites need a real Postgres instance — see `tests/helpers/setup-env.ts` and `tests/e2e/global-setup.ts` for how they provision one. A local Docker Postgres container is the simplest option:

```bash
docker run --name haram-test-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=haram -p 5432:5432 -d postgres:16
```

`tests/unit/admin-route-auth-sweep.test.ts` is worth knowing about specifically: it statically scans every `app/api/admin/**/route.ts` file and fails if any exported handler doesn't call `requireAdminSession()` before anything else — it's a tripwire against ever shipping an unprotected admin route in the future.

## Security posture

A full review (cyber-analyst pass) found **zero critical issues** — every admin route correctly gates on `requireAdminSession()`. All identified High/Medium findings were fixed and verified:

- Public API responses no longer leak internal fields (`imagePublicId`)
- Rate limiting on `/api/contact` (5/15min/IP) and admin login (20/15min/email+IP)
- JSON-LD sanitization closed on the one field that bypassed it (`material`)
- Timing side-channel in login closed (constant-time-equivalent bcrypt compare)
- Image upload validates actual file signature ("magic bytes"), not just the client-declared MIME type
- CSRF defense-in-depth header on the multipart upload route
- Security headers added (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`)
- Seed script no longer resets the admin password on every re-run (only on first creation, or with explicit `ADMIN_SEED_FORCE_RESET=true`)
- Cloudinary's real `public_id` is now stored and used (was previously guessed from the URL); deleting/replacing a Product, Certification, or ClientLogo now actually cleans up the old Cloudinary asset

**Deliberately not done** (see code comments for why): no Content-Security-Policy header yet (the inline GA `<Script>` would need nonce wiring first — shipping a half-correct CSP was judged worse than none), no Next.js major-version upgrade (14→15 changes `params` from sync to async across every dynamic route — out of scope for a patch pass), no in-app admin "change password" UI (beyond the original spec; rotate the password by re-running the seed script with `ADMIN_SEED_FORCE_RESET=true` and a new `ADMIN_SEED_PASSWORD` for now).

## Known TODOs / placeholders that need real values before launch

1. **Google Maps embed** (`app/(public)/contact/page.tsx`) — the scraped legacy data only had a `goo.gl` short link, not directly embeddable. Currently a styled link-out card. Swap for a real Google Maps Embed API iframe once an API key is provisioned.
2. **`NEXT_PUBLIC_SITE_URL`** — defaults to `http://localhost:3000` in `.env.example`; must be set to the real production domain before deploy (it feeds canonical URLs, sitemap, and JSON-LD `url` fields).
3. **`NEXT_PUBLIC_GA_ID`** — optional, blank by default; set it if/when a GA4 property exists.
4. **Admin password** — `prisma/seed.ts` warns loudly and uses a placeholder if `ADMIN_SEED_PASSWORD` isn't set. Set real `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD` in production `.env` before the first seed run.
5. **Real per-product photography** — products currently show one cover image per legacy category (the scrape had no per-product names/prices/MOQs, only category photo galleries). Upload real per-product photos via the admin panel as they become available; until then, pages fall back to the curated real legacy photos in `public/images/products/<category>/`, never generic stock placeholders.
6. **Cloudinary credentials** — `.env.example` has placeholders; see [Cloudinary setup](#cloudinary-setup).
7. **SMTP credentials** (`EMAIL_HOST`/`EMAIL_USER`/`EMAIL_PASS`) — needed for contact-form notification emails to actually send.
