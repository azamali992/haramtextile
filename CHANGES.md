# CHANGES.md — Front-End Visual & Motion Redesign

Running log of the full public-facing redesign that transplants the **"Baseline"
reference design system** (motion language, layout patterns, component library)
onto Haram Textile's existing Next.js 14 / Prisma / Cloudinary stack. The
backend, admin panel, database, API routes, and Prisma models are **unchanged** —
only the public rendering and motion layer change. All content stays live from
the existing data layer.

---

## Phase 1 — Audit & Mapping

### Stack confirmed

Next.js 14.2.35 (App Router) · TypeScript · Tailwind CSS 3.4 · Prisma 7 (Postgres)
· NextAuth · Cloudinary · React 18. Added `framer-motion` + `lenis` (installed
with `--legacy-peer-deps` to match the project's pre-existing nodemailer/next-auth
peer resolution — that conflict predates this work).

### Reference-pattern → real-content mapping

| Reference (Baseline) pattern | Haram Textile target | Data source |
| --- | --- | --- |
| Navy intro loader (wordmark + progress bar) | Same, reskinned to green; Haram wordmark/logo | static |
| Hero: parallax photo plate + word-by-word title reveal + tagline | Hero section | `HeroConfig` (headline, subtext→tagline, ctaText, ctaLink, imageUrl); fallback `/images/hero/hero-factory.jpg` |
| Hero glass "collection slider" + "membership" stat card | Featured product collections slider + a headline stat card | `Product` (deduped by category) + `siteContent.stats` |
| "Trust" coach carousel + oversized ghost words | Clients/certifications carousel with ghost headline | `ClientLogo` + `Certification` |
| "Programs" numbered list (4 rows, hover arrow) | Product **categories** numbered list → `/products?category=` | `siteContent.productCategories` + `Product` counts |
| "Facilities" tilted photo pair + word-fade body | Factory/production process photo pair | `ProductionStep` images |
| Stats band (4-up on navy) | Manufacturing capacity stats | `siteContent.stats` (220 specialized machines · 350 staff · 30,000 sq ft · 600,000 pcs/mo · 160 sewing machines) |
| Testimonials grid (3-up) | **Repurposed** — see decision below | `siteContent.site.quote` + `ClientLogo` |
| Footer (CTA band + columns + bottom bar) | Same | `siteContent.contact` (phone/emails/address/hours), nav links |
| Contact modal (portaled, scroll-locked) | Wired to the **real** `/api/contact` route | `ContactSubmission` via Zod + Prisma + nodemailer |
| Fullscreen menu overlay (burger) | Same nav set (Products/Production/About/Certifications/Contact) | static nav |

### Pages in scope

Home `/` · About `/about` · Products `/products` + `/products/[id]` ·
Certifications `/certifications` + `/certifications/[id]` · Contact `/contact` ·
Production `/production`.

### Admin-editable fields (must all remain visible on the front end)

- **HeroConfig:** headline, subtext, ctaText, ctaLink, imageUrl → Hero section
- **AboutContent:** storyText, missionText, imageUrl → About page
- **Product:** name, description, imageUrl, moq, fabricType, tags, category, seo* → Products grid + detail
- **Certification:** name, description, issuingBody, imageUrl, seo* → Certifications grid + detail
- **ClientLogo:** imageUrl, altText, order → Trust carousel
- **ProductionStep:** title, slug, description, statLabel, statValue, imageUrl, order → Production + Facilities pattern
- **SeoSettings / ContactSubmission:** unchanged (SEO metadata + admin inbox)

---

## Decisions & judgment calls (confirmed with stakeholder)

1. **Surface treatment — follow the reference literally.** The reference's
   glassmorphism (`backdrop-blur`, translucent cards), soft drop shadows, and
   uppercase "eyebrow" kickers directly conflict with the existing `DESIGN.md`
   ("Flat-By-Default", "No glassmorphism", "No-Eyebrow" rules). **Decision:**
   adopt the reference surface treatment, overriding those `DESIGN.md`
   prohibitions where they conflict. *Why:* the brief is an intentional visual
   refresh toward the Baseline language; the stakeholder chose fidelity to the
   reference over the legacy brand bible. The brand **palette** (green/gold/cream)
   and **typography** (Playfair Display + DM Sans) are retained — only the
   surface/motion vocabulary changes.

2. **Color mapping (no navy/blue).** `--brand-deep` (navy hero/stats/footer base)
   → Primary Green `#2D5016`, deepened to `#1F3A0F` where large dark sections
   need more weight. `--brand` / `--brand-light` (royal/light blue accent) →
   Muted Gold `#B8963E` + a lightened gold tint. `--surface`/`--background`
   off-white → Cream `#F5F0E8` + white `#FDFAF6`. `--ink`/`--ink-soft`/
   `--hairline`/`--ghost` kept as near-neutral grays per the reference (structure
   colors, not brand colors).

3. **Typography retained.** Playfair Display for display/headline moments (the
   reference's large `font-medium` headline type), DM Sans for body/label —
   preserving the reference's size scale, tracking, and line-heights. Onest is
   **not** adopted.

4. **Testimonials — skip/repurpose (no backend change).** The reference has a
   3-up testimonials grid and the spec suggests adding a Testimonial model if
   none exists. The master prompt's overriding rule is "this is NOT a backend
   task — schema/admin stay exactly as they are." **Decision:** honor the
   no-backend rule; repurpose the testimonials slot using existing data (the
   founder quote in `siteContent.site.quote` + client logos / certifications as
   social proof) rather than adding a Prisma model + admin CRUD. *Why:* avoids a
   schema/admin change the brief forbids; keeps the section genuinely data-driven
   from content that already exists.

5. **Contact form — real submission, not a stub.** The reference modal stubs its
   form. This project has a live `/api/contact` route (Zod-validated, Prisma-
   persisted, email-notified, rate-limited). **Decision:** wire the redesigned
   contact modal + contact page form to that real endpoint, per the master
   prompt's instruction to use the live endpoint when one exists.

6. **Assets — existing storage only.** No `baseline-*` reference asset URLs are
   used. Images come from existing `/public/images/**` and Cloudinary uploads
   (`lib/storage.ts`) exactly as today, with the existing `product-image-fallback`
   strategy preserved.

---

## Phase 2 — Shared motion/UI system

All files created/modified in this phase. Zero backend/admin/API changes.
TypeScript strict-mode passes (`npx tsc --noEmit`) and ESLint passes
(`npx next lint`) with no errors or warnings.

### Files created

| File | What it is |
| --- | --- |
| `components/motion/LenisProvider.tsx` | Lenis smooth-scroll init + rAF loop; context exposes `start()`/`stop()`; `useLenis()` hook |
| `components/motion/RevealText.tsx` | Word-by-word clip-mask reveal (Framer Motion); stagger, duration, gating, re-fire key props |
| `components/motion/RevealLines.tsx` | Line-by-line clip-mask reveal; stagger, baseDelay, re-fire key props |
| `components/motion/Inview.tsx` | Viewport-triggered spring entrance (once); maps reference `{tension,friction}` → `{stiffness,damping}` |
| `components/motion/HoverSpring.tsx` | `whileHover` spring wrapper; auto-disabled on ≤768px and `prefers-reduced-motion` |
| `components/motion/useScrollParallax.ts` | `useScroll` + `useTransform` helper; returns `ref` + `value` MotionValue for parallax |
| `components/ui/Eyebrow.tsx` | Uppercase dot-kicker label; `dark`/`light` tone variants |
| `components/ui/PillButton.tsx` | Pill CTA with trailing spring-arrow; `light`/`solid`/`outline` variants; Link or button |
| `components/ui/ArrowButton.tsx` | Carousel arrow circle button; `outline`/`solid`; `prev` flips scaleX |
| `components/ui/CarouselDots.tsx` | Animated dot row; active pill expands to 1.25rem; `dark`/`light` tone |
| `components/layout/UIProvider.tsx` | Shared open/close booleans for contact modal + menu; `useUI()` hook |
| `components/layout/Loader.tsx` | Intro curtain (green, wordmark + progress bar); `LoaderProvider` + `useLoader()` hook; sessionStorage guard |
| `components/layout/ContactModal.tsx` | Portaled contact modal; POSTs to real `/api/contact`; success panel; Esc/scroll-lock |
| `components/layout/MenuOverlay.tsx` | Portaled fullscreen menu; big Playfair nav links; Get a Quote → opens ContactModal |

### Files modified

| File | What changed |
| --- | --- |
| `components/layout/SiteHeader.tsx` | Full rewrite — "use client", adaptive `overHero` prop, burger + Get a Quote; wires `useUI()` |
| `components/layout/SiteFooter.tsx` | Full rewrite — "use client", deep-green bg, CTA band with RevealLines + Inview pill, columns grid, bottom bar with cert list; wires `useUI()` |
| `app/globals.css` | Added all Phase 2 CSS variables (`--brand-deep`, `--brand-deeper`, `--brand`, `--brand-light`, `--surface`, `--surface-card`, `--ink`, `--ink-soft`, `--on-brand`, `--hairline`, `--ghost`, `--radius-*`); added adaptive rem-grid media queries (1920/1440/1024/640 breakpoints) |
| `app/layout.tsx` | Added static `<script dangerouslySetInnerHTML>` in `<head>` for rem-grid scale-UP above 1920px (FONT_BASE=16, BASE_W=1920, COEF=0.6666) |
| `app/(public)/layout.tsx` | Wrapped children with `LenisProvider → UIProvider → LoaderProvider`; added `ContactModal` + `MenuOverlay` render at layout level |

### Public API — Phase 3 consumption guide

#### Motion primitives

```tsx
// Word-by-word clip reveal. Gated version for hero (waits for loader ready):
import { useLoader } from "@/components/layout/Loader";
const { ready } = useLoader();
<RevealText as="h1" stagger={140} duration={1.1} gated ready={ready}>
  Crafted for Global Markets
</RevealText>

// Re-fire on slide change (carousel):
<RevealText animationKey={slideIndex} stagger={60}>
  {slides[slideIndex].title}
</RevealText>

// Stacked-line reveal:
<RevealLines lines={["Built for", "every level"]} stagger={120} duration={0.95} />

// Viewport entrance:
<Inview delayIn={120} stiffness={200} damping={26}>
  <MyCard />
</Inview>

// Hover spring (auto-disabled on touch):
<HoverSpring to={{ x: 5 }} stiffness={320} damping={20}>
  <ArrowIcon />
</HoverSpring>

// Scroll parallax:
const { ref, value: y } = useScrollParallax<HTMLDivElement>({ outputRange: ["0%", "12%"] });
<motion.div ref={ref} style={{ y }}>…</motion.div>
```

#### Shared UI

```tsx
import { Eyebrow } from "@/components/ui/Eyebrow";
<Eyebrow tone="dark">Training programs</Eyebrow>  // dark | light

import { PillButton } from "@/components/ui/PillButton";
<PillButton variant="light" href="/contact">Get a Quote</PillButton>  // light | solid | outline
<PillButton variant="solid" onClick={openContact}>Get a Quote</PillButton>

import { ArrowButton } from "@/components/ui/ArrowButton";
<ArrowButton prev variant="outline" aria-label="Previous" onClick={prev} />
<ArrowButton variant="solid" aria-label="Next" onClick={next} />

import { CarouselDots } from "@/components/ui/CarouselDots";
<CarouselDots count={3} activeIndex={slide} onChange={setSlide} tone="light" />
```

#### Opening the contact modal / menu from any page

```tsx
"use client";
import { useUI } from "@/components/layout/UIProvider";

export function MyPageCTA() {
  const { openContact, openMenu } = useUI();
  return (
    <>
      <button onClick={openContact}>Get a Quote</button>
      <button onClick={openMenu}>Menu</button>
    </>
  );
}
```

#### Loader ready gating (hero entrance animations)

```tsx
"use client";
import { useLoader } from "@/components/layout/Loader";
import { RevealText } from "@/components/motion/RevealText";

export function HeroTitle({ text }: { text: string }) {
  const { ready } = useLoader();
  return (
    <RevealText as="h1" stagger={140} gated ready={ready}>
      {text}
    </RevealText>
  );
}
```

### Judgment calls & deviations

1. **Loader logo on green.** `logo2.png` is applied with `brightness-0 invert` CSS filter on the dark-green curtain so it renders as pure white. This avoids needing a separate SVG/white variant and handles any logo shape correctly. Note: if the logo ever has multi-colour detail that must show on the curtain, a separate white-variant PNG should be added as `/images/brand/logo2-white.png` and swapped in.

2. **`SiteHeader` is now a client component.** The previous version was a server component (no interactivity). It now imports `useUI()` to wire the burger and "Get a Quote" button. This is the minimal promotion required — the header still has no data fetching, so there is no server-rendering regression for the page shell.

3. **`SiteFooter` is now a client component** for the same reason (Get a Quote button calls `useUI().openContact()`). Static data (`siteContent.*`) is imported as a module so no fetch is added.

4. **Adaptive rem-grid and Tailwind.** The adaptive `font-size` grid means Tailwind's pixel-locked font sizes (`text-xs: 12px` etc. in the existing config) won't scale with the grid. The existing `tailwind.config.ts` uses fixed `px` values for `fontSize` — those values continue to work for existing components. Phase 2 components reference CSS variables and inline `rem` values directly to stay grid-aware. This dual approach avoids breaking existing pages while new components scale correctly. A follow-up recommendation for Phase 3/4 is to migrate the Tailwind fontSize config to `rem` units to make the full site grid-aware.

5. **No `overHero` wired to existing pages yet.** `SiteHeader` accepts `overHero` but the public layout passes the default (`false`). Phase 3 home-page rebuild will conditionally render the hero-aware layout (either via a separate layout file for the home route, or by rendering the header *inside* the hero section on that page). Keeping `overHero=false` as the default means all current pages remain visually consistent — a solid cream header — during Phase 3 build-out.

6. **`RevealText` `as` prop type narrowing.** Framer Motion's `motion[tag]` factory covers the common HTML element tags. The `as` prop is typed as `ElementType` and cast at runtime; this is safe for the h1/h2/p/span/div tags that the spec uses, but will produce a runtime warning if a non-HTML tag is passed. Added a JSDoc note.

7. **Footer product category links.** The footer uses the four categories known from `siteContent.productCategories` (boys/girls/gents/ladies) as static links to `/products?category=slug`. These match what the DB drives via the category filter on the products page, so they remain data-accurate without a server fetch in the footer.

8. **`useScrollParallax` ref typing.** The hook returns `ref: RefObject<T>` typed to the caller's generic. Framer Motion's `useScroll` accepts `{ target: ref }` and handles null refs gracefully, so this is safe even before the element mounts.

---

### Next up

Phase 3 — page-by-page rebuild (Home, About, Products, Certifications, Contact, Production).

---

## Phase 3a — Home page rebuild + section component library

All files created/modified in this phase. Zero backend/admin/API changes.
`npx tsc --noEmit` passes clean. `npx next lint` passes with no errors or
warnings.

### New files — Phase 3a

| File | What it is |
| --- | --- |
| `components/sections/SectionHeader.tsx` | Eyebrow + RevealLines title + optional body — the recurring section-header pattern extracted as a reusable component |
| `components/sections/StatBand.tsx` | Full-bleed stats band: eyebrow + RevealLines title + responsive `<dl>` grid of value/label cells with Inview stagger; `tone` prop (green/cream) |
| `components/sections/NumberedList.tsx` | Reference "Programs" numbered-list: bordered rows, Playfair name, description, trailing HoverSpring circle arrow; `items` prop-driven |
| `components/sections/TiltedPhotoPair.tsx` | Reference "Facilities" two-tile layout: intro column (eyebrow + RevealLines + body + icon) + two 3/4-aspect-ratio photo cards with Inview stagger, hover-scale spring, and glass captions |
| `components/sections/PullQuote.tsx` | Repurposed testimonials slot: large brand blockquote card + certification trust-marker cards in a 2/3-col grid; `HoverSpring` lift on each card |
| `components/sections/TrustSection.tsx` | Client-logo marquee with oversized ghost headline + certification pill badges; uses existing `.logo-marquee-viewport` CSS animation from Phase 2 |
| `components/sections/HeroSection.tsx` | Full hero client component: parallax plate, RevealText headline gated on `useLoader().ready`, RevealLines tagline, glass collection carousel with `CarouselDots`, headline stat card, PillButton CTA |
| `components/sections/ContactCTABand.tsx` | Deep-green CTA band with Eyebrow + RevealLines + Inview PillButton that opens the contact modal via `useUI().openContact()` |

### Modified files — Phase 3a

| File | What changed |
| --- | --- |
| `app/(public)/page.tsx` | Full rebuild of rendered JSX using the new section components. All data fetching (Promise.all, generateMetadata, HOME_FAQS, JSON-LD, `force-dynamic`) kept exactly. Added `listProductionSteps()` to the Promise.all for the Facilities section. |
| `components/layout/SiteHeader.tsx` | Added `usePathname()` import and `isOverHero` local variable: auto-enables `overHero` styling when `pathname === "/"`. All existing style logic updated to use `isOverHero` instead of the prop directly. The `overHero` prop is kept for explicit override by Phase 3b pages. |

### Per-section mapping (reference pattern → real data → improvement)

#### Section 1 — Hero

- Reference pattern: Deep-navy full-bleed, parallax photo plate, word-by-word clip reveal, glass collection slider, membership stat card, tagline.
- Real data: `HeroConfig` (headline/subtext/ctaText/ctaLink/imageUrl), `Product` deduped by category for slider slides, `siteContent.stats` for stat card. Fallback to `/images/hero/hero-factory.jpg` via existing `isPlaceholderImageUrl`.
- Improvement: Hero is no longer a static `<section>` with a cream overlay panel. The full viewport is now a deep-green immersive card with a parallax factory photo, cinematic word-by-word title reveal gated on the loader, and a live category slider auto-advancing every 3800ms. CTA opens the real contact modal.

#### Section 2 — Trust / social proof

- Reference pattern: Coach carousel with oversized ghost headline that re-fires on slide change.
- Real data: `ClientLogo` (marquee) + `Certification` (pill badges). No carousel was necessary — a CSS marquee handles continuous motion without state.
- Improvement: Ghost headline "Trusted By Global Brands" uses RevealText at `8.2vw` with the word "Global" in brand ink color (matching reference's ink-word pattern). Certification badges are interactive links to their detail pages.

#### Section 3 — Product categories numbered list

- Reference pattern: 4 rows, index number, name, description, trailing spring arrow on hover.
- Real data: `siteContent.productCategories` (4 entries: boys/girls/ladies/gents), linked to `/products?category=slug`.
- Improvement: Replaces the previous asymmetric category grid with a more editorial numbered-list format. Each row Inview-springs in with a 90ms stagger.

#### Section 4 — Facilities / production photo pair

- Reference pattern: Two tilted `<figure>` tiles, intro column, hover-scale spring, glass captions.
- Real data: `listProductionSteps()` — first two production steps by `order`. Fallback to `/images/hero/hero-factory.jpg` and `/images/about/about-factory.jpg` via `isPlaceholderImageUrl`.
- Judgment call: `listProductionSteps()` added to the home page's `Promise.all`. This was specified in the Phase 3a brief and involves no schema/admin change. If no steps have been uploaded, the two local fallback images are used.

#### Section 5 — Stats band

- Reference pattern: 4-up `<dl>` grid on navy, big Playfair values, Inview stagger i×110ms.
- Real data: `siteContent.stats` (5 entries: machines/workers/area/packing/sewing). Values ≥1000 are abbreviated (600000 → 600K+).
- Improvement: Entirely new section on the home page. Uses `<dt>` as `sr-only` semantics per reference spec.

#### Section 6 — Testimonials → Pull-quote (repurposed)

- Reference pattern: 3-up testimonial grid, blockquote + figcaption.
- Real data: `siteContent.site.quote` (founder quote) + `Certification` records as trust-marker cards. No testimonial model exists — per Phase 2 decision this is not a backend task.
- Improvement: A genuine company statement rendered at editorial scale alongside certification badges.

#### Section 7 — Contact CTA + FAQ

- Reference pattern: Deep-navy CTA band, Eyebrow + stacked lines + Inview pill button.
- Real data: `HOME_FAQS` (unchanged static array) + `useUI().openContact()`.
- Improvement: The previously flat `bg-green-primary` CTA band is now a fully rounded section card with RevealLines title. The PillButton opens the real contact modal.

#### SiteHeader auto-detection

- Reference pattern: Header sits transparent over the hero on the home page.
- Implementation: `usePathname()` is used to derive `isOverHero = overHero || pathname === "/"`. The header auto-switches to absolute/transparent on the home route without any change to the public layout or home page. The `overHero` prop is retained for Phase 3b pages that have their own dark hero.

### Prop API — `components/sections/*` (for Phase 3b)

#### `SectionHeader` props

```tsx
eyebrow?:        string            // kicker text
eyebrowTone?:    "dark" | "light"  // default "dark"
title:           string[]          // RevealLines stacked headline
body?:           string            // optional paragraph
className?:      string
titleClassName?: string
bodyClassName?:  string
```

#### `StatBand` props

```tsx
eyebrow?:   string
title:      string[]                           // RevealLines
stats:      { value: string; label: string }[] // 4–5 cells
tone?:      "green" | "cream"                  // default "green"
className?: string
```

#### `NumberedList` props

```tsx
eyebrow?: string
title:    string[]
items:    {
  index:       string  // e.g. "01"
  name:        string  // Playfair heading
  description: string
  href:        string  // link target
}[]
className?: string
```

#### `TiltedPhotoPair` props

```tsx
intro: {
  eyebrow?:   string
  title:      string[]
  body:       string
  iconImage?: { src: string; alt: string }
}
tiles: [TileData, TileData]  // exactly two

// TileData:
// { src, alt, name, description, tone?: "green" | "gold" }

className?: string
```

#### `PullQuote` props

```tsx
eyebrow?:      string
title?:        string[]
quote:         string           // blockquote body (no surrounding marks)
attribution?:  string           // "Name, Role"
certBadges?:   { name: string; issuingBody?: string | null }[]
className?:    string
```

#### `ContactCTABand` props

```tsx
eyebrow?:   string   // default "Get started"
title?:     string[] // default ["Ready to", "start your order?"]
ctaLabel?:  string   // default "Get a Quote"
className?: string
```

#### `TrustSection` props

```tsx
clientLogos:    { id: string; imageUrl: string; altText: string }[]
certifications: { id: string; name: string; issuingBody?: string | null; imageUrl?: string }[]
// Renders nothing if both arrays are empty.
```

#### `HeroSection` props

```tsx
headline:  string
subtext:   string
ctaText:   string
ctaLink:   string | null       // null → opens contact modal
heroImage: string              // resolved URL (fallback applied server-side)
slides:    {
  slug:  string
  name:  string
  intro: string
  image: { src: string; width: number; height: number }
}[]
stats: SiteContentStat[]       // from lib/site-content
```

### Data-shape gaps and judgment calls — Phase 3a

1. **Production step images.** No production step images have been uploaded via
   the admin yet (Cloudinary upload). `isPlaceholderImageUrl` catches the
   haramtextile.com legacy URLs and the fallback pair is used. Once images are
   uploaded via the admin panel, they will appear automatically without any
   code change.

2. **HeroConfig `ctaLink`.** When the admin leaves the CTA link blank/null, the
   PillButton falls back to `openContact()` (opens the real contact modal). If
   it is set to a path (e.g. `/contact`), it renders as a `<Link>`. This is
   consistent with the previous implementation.

3. **Tagline line-splitting.** `heroConfig.subtext` is a single string. The
   `HeroSection` auto-splits it at the first comma (if present) or at the
   midpoint word boundary to produce two RevealLines. This preserves the
   visual two-line tagline pattern without requiring a DB schema change.

4. **Stat abbreviation.** Values ≥1,000,000 are formatted as "XM+",
   values ≥1,000 as "XK+". The packing-capacity stat (600,000 → 600K+) is
   used for the hero stat card; the full set is displayed in the stats band.

5. **`about-factory.jpg` dependency.** The Facilities section fallback uses
   `/images/about/about-factory.jpg`. This image was already present from the
   scraped legacy content. If it is missing, Next.js `<Image>` will return a
   404 for that tile; the fix is to upload a production step image via the
   admin panel.

6. **`NumberedList` intro text truncation.** The `siteContent.productCategories`
   `intro` strings are ~80 chars. On the numbered-list rows the description
   renders in `text-sm text-ink-soft` and wraps naturally. Phase 3b may want
   to add `line-clamp-2` to the description span for tighter rows on very wide
   viewports.

---

## Phase 3b — Remaining public pages rebuild

All files created/modified in this phase. Zero backend/admin/API changes.
`npx tsc --noEmit` passes clean. `npx next lint` passes with no errors or
warnings.

### New section components

| File | What it is | Props |
| --- | --- | --- |
| `components/sections/AboutHero.tsx` | Deep-green editorial hero for the About page: parallax factory photo, RevealText h1, Inview body text, glassy tilted image card with rotate hover spring | `storyText`, `imageUrl`, `missionText` |
| `components/sections/AboutSections.tsx` | Client section block rendering Why Pakistan grid, Mission/Vision/Values trio, and Leadership Team grid — all with Inview rise-ins and HoverSpring lift | `whyPakistan`, `mission`, `vision`, `values`, `aboutShort`, `team` |
| `components/sections/ProductsGrid.tsx` | Motion-wrapped product card grid: each `ProductCard` in Inview rise-in (stagger i × 60ms, capped at 420ms) | `products: ProductCardData[]` |
| `components/sections/ProductDetailClient.tsx` | Product detail visual+motion layer: clip-mask RevealText h1, glassy hover main image, Inview spec list, motion gallery grid (Inview + HoverSpring scale), PillButton CTA → openContact() | `product: { id, name, description, fabricType, moq, tags, categoryName, coverImage, gallery }` |
| `components/sections/CertificationsGrid.tsx` | Motion-wrapped certifications card grid: each `CertificationCard` in Inview rise-in (stagger i × 80ms) + HoverSpring lift | `certifications: CertificationCardData[]` |
| `components/sections/CertificationDetailClient.tsx` | Certification detail visual+motion layer: RevealText h1, Inview badge/issuingBody/description, deep-green info card, PillButton → openContact() | `certification: { id, name, issuingBody, description, image, siteName }` |
| `components/sections/ContactPageClient.tsx` | Contact page visual+motion layer: RevealText h1, Inview contact detail cards, deep-green map link block, form wrapper; keeps real ContactForm intact | `contact: SiteContentContact`, `siteName` |
| `components/sections/ProductionStepsClient.tsx` | Production steps alternating layout: each step gets a hover-scale glassy image card, Eyebrow step counter, RevealLines title, Inview text+stat; statLabel/statValue shown when present | `steps: ProductionStep[]`, `totalSteps` |

### Modified page files

| File | What changed |
| --- | --- |
| `app/(public)/about/page.tsx` | Full JSX rewrite using `AboutHero` + `AboutSections` + `PullQuote` + `StatBand` + `ContactCTABand`. All data fetching (`getAboutContent`, `getSeoSettings`), `force-dynamic`, `generateMetadata`, `ABOUT_FAQS`, `buildAboutPageSchema`, `JsonLd`, `Breadcrumb` preserved exactly. |
| `app/(public)/products/page.tsx` | Full JSX rewrite using `SectionHeader` + `FilterBar` + `ProductsGrid`. All data fetching (`listProducts`, `getSeoSettings`), `force-dynamic`, `generateMetadata`, `PRODUCTS_FAQS`, `buildItemListSchema`, `JsonLd`, `Breadcrumb`, image fallback logic, empty-state preserved exactly. |
| `app/(public)/products/[id]/page.tsx` | Full JSX rewrite delegating to `ProductDetailClient`. All data fetching (`getProductById`, `getSeoSettings`), `force-dynamic`, `generateMetadata`, `buildProductSchema`/`productSchemaWithExtras`, `JsonLd`, `Breadcrumb`, `notFound()`, image fallback logic preserved exactly. |
| `app/(public)/certifications/page.tsx` | Full JSX rewrite using `SectionHeader` + `CertificationsGrid`. All data fetching, `force-dynamic`, `generateMetadata`, `CERTIFICATIONS_FAQS`, `buildItemListSchema`, `JsonLd`, `Breadcrumb`, empty-state preserved exactly. |
| `app/(public)/certifications/[id]/page.tsx` | Full JSX rewrite delegating to `CertificationDetailClient`. All data fetching, `force-dynamic`, `generateMetadata`, `Breadcrumb`, `notFound()`, image fallback preserved exactly. |
| `app/(public)/contact/page.tsx` | Full JSX rewrite delegating to `ContactPageClient`. All `CONTACT_FAQS`, `buildContactPageSchema`, `JsonLd`, `Breadcrumb`, `contactPageSchema` preserved exactly. Real `ContactForm` (posts to `/api/contact`) kept fully intact. |
| `app/(public)/production/page.tsx` | Full JSX rewrite using `StatBand` as header + `ProductionStepsClient` + `ContactCTABand`. All data fetching (`listProductionSteps`, `getSeoSettings`), `force-dynamic`, `generateMetadata`, `PRODUCTION_FAQS`, `buildHowToSchema`, `JsonLd`, `Breadcrumb`, stat constants, empty-state preserved exactly. |

### Per-page mapping (reference pattern → real data → improvement)

#### About page

- **Reference pattern**: Dark hero (parallax photo, clip-mask word reveal), numbered/card sections for key attributes, pull quote, stats band.
- **Real data**: `AboutContent` (storyText, missionText, imageUrl — admin-editable), `siteContent.about` (whyPakistan, mission, vision, values), `siteContent.team` (4 members), `siteContent.stats`, `siteContent.site.quote`.
- **Improvement**: The previous plain `<article>` with no motion is replaced by a deep-green editorial hero with parallax factory photo and glassy tilted image card (hover spring de-rotates to flat). Why Pakistan items spring in as a hover-lift card grid. Mission/Vision/Values are now a trio of branded cards (Vision in deep-green, others in surface cream). Leadership team cards show initial avatars with email links. StatBand at the bottom carries all 5 manufacturing stats. All admin-editable fields (storyText, missionText, imageUrl) remain visible.

#### Products listing page

- **Reference pattern**: Eyebrow + RevealLines section header, grid with Inview rise-ins (staggered).
- **Real data**: `listProducts()` (with `?category=` filter), `siteContent.home.productLine`, `siteContent.productCategories` (for FilterBar), `ProductCard`, image fallback strategy.
- **Improvement**: The plain `<header>` replaced by `SectionHeader` with RevealLines clip-mask title. Product cards now rise in with staggered Inview (capped at 420ms stagger). FilterBar and empty-state preserved unchanged.

#### Product detail page

- **Reference pattern**: Clip-mask title reveal, glassy hover image, Inview spec list, motion gallery.
- **Real data**: `getProductById()` (name, description, imageUrl, moq, fabricType, tags, category), fallback gallery from `getFallbackGalleryForCategory`, MOQ badge, category badge.
- **Improvement**: Product name gets full clip-mask word-by-word RevealText (h1). Main image is a hover-scale spring card with glass caption. Spec list (`fabricType`, `moq`, `tags`) springs in with Inview stagger. Gallery grid cards each get Inview + HoverSpring scale hover. "Request a Quote" button is now a PillButton that opens the real contact modal via `openContact()`.

#### Certifications listing page

- **Reference pattern**: Eyebrow + RevealLines section header, card grid with Inview rise-ins + hover lift.
- **Real data**: `listCertifications()`, `siteContent.certifications.intro`, image fallback.
- **Improvement**: Plain header replaced by `SectionHeader` with RevealLines. Each cert card now has Inview rise-in stagger + HoverSpring lift (-6px). Empty-state preserved.

#### Certification detail page

- **Reference pattern**: Clip-mask name reveal, Inview badge/body, info card on the right.
- **Real data**: `getCertificationById()` (name, issuingBody, description, imageUrl), `siteContent.site.name` for context text.
- **Improvement**: Certificate name gets RevealText clip-mask (h1). Badge image rises in with Inview scale reveal. A deep-green info card on the right provides editorial framing with a "Request Documentation" PillButton → openContact(). The "certifications overview" link back is preserved.

#### Contact page

- **Reference pattern**: Eyebrow + RevealText header, contact detail cards, map link block, form section.
- **Real data**: `siteContent.contact` (address, phone, emails, hours, mapLink), real `ContactForm` posts to `/api/contact`.
- **Improvement**: Plain h1 replaced by RevealText clip-mask h1. Contact details now sit in individual cream surface cards with Inview reveal. Map link block is restyled as a deep-green card with a pin SVG icon and clear CTA. ContactForm is unchanged (full submit logic, fields, error/success states intact).

#### Production page

- **Reference pattern**: Stats band as page header, alternating image/text pairs (Facilities pattern), CTA band.
- **Real data**: `listProductionSteps()` (title, description, statLabel, statValue, imageUrl, slug), `siteContent.stats`, image fallbacks (hero-factory.jpg / about-factory.jpg cycling).
- **Improvement**: The cramped stat grid in a text header is replaced by the full `StatBand` component (deep-green, RevealLines title, Inview stagger cells). Production steps use the reference Facilities card motion pattern: hover-scale glassy image with glass caption, Eyebrow step counter, RevealLines title, Inview text. StatLabel/StatValue rendered as a large value+label callout. CTA band added at the bottom. Empty-state preserved.

### Data-shape gaps and judgment calls — Phase 3b

1. **`AboutContent.imageUrl` null guard.** The DB column is nullable. The About page applies the `isPlaceholderImageUrl`-equivalent guard inline: if `imageUrl` is null or contains `haramtextile.com`, it falls back to `/images/about/about-factory.jpg`. This matches the strategy used elsewhere.

2. **About `missionText` display.** When the admin has set `missionText`, it renders as a glassmorphic inset card inside the hero dark-green section. When null, the card is hidden. No layout shift occurs.

3. **Product detail "Request a Quote" behavior.** The original used a `<Button href="/contact">`. Spec says to convert to a PillButton that calls `openContact()` (opens the modal) OR links to /contact. Decision: use `openContact()` (modal) for maximum UX efficiency — the user stays on the product page while the quote request is sent. Matches Phase 2 intention.

4. **Certification detail — no JSON-LD schema.** The original certification detail page had no `JsonLd` block (unlike the listing page). This is preserved — no schema was added or removed.

5. **Production step image fallbacks cycle.** Two fallback images alternate (`hero-factory.jpg`, `about-factory.jpg`) cycling by `index % 2`. If more than two steps exist without uploaded images, the pair repeats. This is intentional — it's a temporary state until admin uploads images.

6. **`SiteContentTeamMember` import in `AboutSections`.** The type is imported from `@/lib/site-content` (already exported). No new types were created.

7. **`ProductionStepsClient` title splitting.** Production step titles (Knitting, Dyeing, Cutting, etc.) are single words or two-word phrases. The component splits on whitespace up to 2 lines: single-word titles render as `[title]`, two-word as `[word1, word2]`, longer as `[word1, word2, rest...]`. This keeps RevealLines lines short as the reference pattern intends.

---

## Phase 4 — QA pass

Static/code-level QA performed against the 9-point checklist. `npx tsc --noEmit` and
`npx next lint` both pass clean after all fixes. `npm run build` produces 21 pages
successfully; only the pre-existing `/sitemap.xml` Prisma/DB error occurs (out of
scope, environmental, per brief).

### Checklist results

#### 1 — Admin-editable field coverage

PASS. Every field in the CHANGES.md Phase 1 table renders on its target page:

- **HeroConfig** (headline, subtext, ctaText, ctaLink, imageUrl) → `HeroSection`
- **AboutContent** (storyText → hero body paragraph; missionText → glassmorphic inset card when non-null; imageUrl → hero parallax + tilted card) → `AboutHero`
- **Product** (name → h1; description; fabricType; moq; tags; category) → `ProductDetailClient`
- **Certification** (name → h1; issuingBody → "Issued by" line; description; imageUrl) → `CertificationDetailClient`
- **ClientLogo** (imageUrl, altText) → `TrustSection` marquee
- **ProductionStep** (title → RevealLines; description; statLabel + statValue → stat callout; imageUrl) → `ProductionStepsClient`

No admin-editable field was silently dropped.

#### 2 — Reduced-motion

PASS. Every motion primitive calls `useReducedMotion()`:

- `RevealText` — reduced-motion path renders children immediately visible (no clip mask, no initial opacity 0).
- `RevealLines` — reduced-motion path renders a plain `<div>` with lines immediately visible.
- `Inview` — reduced-motion path renders a plain `<div>` with children immediately visible.
- `HoverSpring` — reduced-motion path renders a plain `<div>` with no whileHover.
- `ArrowButton` — `whileHover` disabled when reduced-motion.
- `PillButton` — arrow `whileHover` disabled when reduced-motion.
- `Loader (Curtain)` — reduced-motion shortens visible time to 200–300 ms, exits with `setVisible(false)` immediately (no slide animation), `onReady()` fires immediately.
- `MenuOverlay` / `ContactModal` — all `initial`/`exit` animations guarded by `prefersReducedMotion ? false : {...}`.
- CSS `@media (prefers-reduced-motion: reduce)` disables the `.logo-marquee-track` animation and `.reveal`/`.reveal-3d`/`.step-card-3d` legacy transitions.

#### 3 — No-JS / SSR safety

FIXED. Added `@media (scripting: none)` CSS block in `app/globals.css` that forces
`opacity: 1 !important` on any element with `opacity: 0` inline style and clears
`translateY` transforms. This ensures `Inview` / `RevealText` / `RevealLines` content
is always visible when JavaScript is disabled, preventing permanently hidden page
content for no-JS crawlers and browsers.

All browser API accesses (`window`, `document`, `sessionStorage`, `matchMedia`,
`createPortal`) are already correctly gated:

- `LoaderProvider` reads `sessionStorage` only inside `useEffect`.
- `ContactModal` and `MenuOverlay` gate `createPortal` behind `if (!mounted) return null` (mounted via `useEffect`).
- `HoverSpring` accesses `window.matchMedia` only inside `useEffect`.
- `LenisProvider` accesses `window`/`document` only inside `useEffect`.

SSR output: all pages render correct HTML content. Loader context defaults to
`ready: true` server-side, so page content (including gated hero animations) is
present in the SSR HTML.

#### 4 — Keyboard and focus

FIXED (ContactModal) + FIXED (MenuOverlay).

**ContactModal:**

- `role="dialog"` and `aria-modal="true"` on the Panel — present.
- `aria-label="Get a quote"` on the Panel — present.
- Esc closes — present.
- Focus moves to name field on open (120ms delay) — present.
- **Focus trap (Tab/Shift+Tab cycling):** ADDED — `handlePanelKeyDown` queries all focusable elements within `panelRef` and wraps Tab/Shift+Tab at the boundaries.
- **Focus restoration on close:** ADDED — `triggerRef` captures `document.activeElement` on open and restores it (50ms delay for exit animation) on close.
- Removed incorrect `aria-live="assertive"` from the outer wrapper div — the `role="dialog"` already announces itself to screen readers without the live region.

**MenuOverlay:**

- `role="dialog"` and `aria-modal="true"` — present.
- `aria-label="Site menu"` — present.
- Esc closes — present.
- **Focus trap:** ADDED — same `handlePanelKeyDown` pattern attached to the panel `motion.div`.
- **Focus restoration on close:** ADDED — `triggerRef` saves/restores the burger button.

**CarouselDots / ArrowButton:**

- `CarouselDots` — each dot is a `<button type="button">` with `role="tab"`, `aria-label="Go to slide N"`, `aria-current` on the active dot. `role="tablist"` on wrapper. Focus ring via `focus-visible:ring-2`.
- `ArrowButton` — native `<button>` requiring `aria-label` prop (enforced by type). Focus ring via `focus-visible:ring-2 ring-offset-2`.
- `FilterBar` — pre-existing component, not modified.

#### 5 — Responsive / overflow

FIXED (hero headline overlap with header).

**Hero header overlap:** The home hero uses an `absolute`-positioned header (`h-20` = 5rem).
The headline div previously had `pt-8 sm:pt-10` (2–2.5 rem), which placed the headline
well within the 5rem header's overlap zone. Changed to `pt-24 sm:pt-28` (6–7 rem) in
`HeroSection.tsx` to clear the header with a comfortable buffer.

All other responsive concerns:

- `HeroSection` giant headline uses `fontSize: clamp(3rem, 12.5vw, 14rem)` without
  `white-space: nowrap`, so it wraps naturally at smaller viewports — no horizontal overflow.
- `TrustSection` ghost headline uses `clamp(2rem, 8.2vw, 10rem)` — "Trusted By",
  "Global", "Brands" are short single-phrase words that don't overflow their containers.
- Carousels and grids all reflow correctly via responsive Tailwind classes.
- `HoverSpring` auto-disables on `≤768px` via `matchMedia`.
- The adaptive rem grid (0.833vw at 1920px down to 4.44vw at 640px) keeps all
  rem-based sizing proportional across breakpoints.

#### 6 — Layout shift / CLS

PASS. No significant CLS sources identified:

- Loader curtain is `position: fixed` — unmounting it causes zero layout shift.
- Images with `fill` use aspect-ratio containers that pre-size the space.
- `next/image` with explicit `width`/`height` props reserves space correctly.
- Clip-mask reveals animate the inner `overflow: hidden` span content, not the
  container — the container size is stable throughout the animation.

#### 7 — Heading hierarchy and alt text

FIXED (three pages missing h1).

Pages with `RevealText as="h1"`: Home (HeroSection), About (AboutHero), Product detail
(ProductDetailClient), Certification detail (CertificationDetailClient), Contact
(ContactPageClient). All correct.

Pages fixed:

- **Products listing** (`app/(public)/products/page.tsx`): Added `<h1 className="sr-only">Our Products</h1>` before the visual `SectionHeader`.
- **Certifications listing** (`app/(public)/certifications/page.tsx`): Added `<h1 className="sr-only">Our Certifications</h1>`.
- **Production** (`app/(public)/production/page.tsx`): Added `<h1 className="sr-only">Our Production Process</h1>` before the visual `StatBand`.

Alt text: All `<Image>` components have meaningful alt text. Decorative divs/spans use
`aria-hidden="true"`. One HTML-entity bug in alt text was fixed (see item below).

**FLAGGED — minor:** In `AboutSections.tsx`, sections use `aria-labelledby` pointing
to sr-only `<h2>` elements that appear in DOM order after the visual `RevealLines`
heading. Semantics are correct (section labels work) but DOM order is not ideal for
screen reader linear reading. Not fixed — would require restructuring the section
header pattern (outside critical path).

#### 8 — Hero overlap / header

FIXED. See item 5 above (responsive section). The `SiteHeader` auto-detects `pathname === "/"` to apply absolute/transparent styling. Non-home pages use the `sticky` solid header which doesn't overlap content. The fix to `HeroSection.tsx` resolves the headline collision.

#### 9 — Lazy-loading discipline

PASS.

- Hero/above-fold images: `priority` — `HeroSection` background, `AboutHero` background, `ProductDetailClient` cover image, `CertificationDetailClient` badge.
- Below-fold: `loading="lazy"` — TiltedPhotoPair tiles, TrustSection logos, HeroSection carousel thumbnails, AboutHero tilted card, gallery images.
- `ProductionStepsClient`: first two steps use `priority={true}` and `loading="eager"` (redundant but not harmful); remaining steps use `loading="lazy"`.

### Additional bugs fixed

**`ProductionStepsClient.tsx` — HTML entity in `alt` text:**
`alt={\`...Haram Textile&apos;s...\`}` — the `&apos;` entity is an HTML entity
string and is not decoded in a JavaScript template literal. It would render literally
as `&apos;` in the alt attribute. Fixed to `'` (plain apostrophe).

### Files modified in Phase 4

| File | Fix |
| --- | --- |
| `components/sections/HeroSection.tsx` | Hero headline top padding: `pt-8 sm:pt-10` → `pt-24 sm:pt-28` to clear the 5rem absolute header |
| `components/sections/ProductionStepsClient.tsx` | Fix HTML entity `&apos;` in alt text → plain apostrophe |
| `components/layout/ContactModal.tsx` | Add focus trap (Tab/Shift+Tab), add focus restoration to trigger, remove incorrect `aria-live="assertive"`, import `useCallback` |
| `components/layout/MenuOverlay.tsx` | Add focus trap (Tab/Shift+Tab), add focus restoration to trigger button, import `useCallback`/`useRef` |
| `app/(public)/products/page.tsx` | Add `<h1 className="sr-only">Our Products</h1>` |
| `app/(public)/certifications/page.tsx` | Add `<h1 className="sr-only">Our Certifications</h1>` |
| `app/(public)/production/page.tsx` | Add `<h1 className="sr-only">Our Production Process</h1>` |
| `app/globals.css` | Add `@media (scripting: none)` block to force visibility of Framer Motion initial-hidden elements when JS is disabled |

---

## Phase 5 — Security pass: SKIPPED

The cyber-analyst security review (contact-form path, `dangerouslySetInnerHTML`
audit on the adaptive-grid bootstrap + JsonLd, client-side XSS / secret-leak
checks) was **skipped at the stakeholder's request**. No security review was
performed on the redesign in this pass. If/when desired, it can be run later
against the existing pre-frozen backend posture (Zod-validated + rate-limited
`/api/contact`, magic-byte upload sniffing, `sanitizeForJsonLd`) plus the new
client/motion layer.

---

## Deployment prep (Vercel + GitHub + Neon)

Code-side changes to make the project deployable on Vercel (no app/data-model
changes):

- **`.npmrc`** — `legacy-peer-deps=true` so Vercel's `npm install` resolves the
  pre-existing nodemailer/next-auth peer conflict (same flag used locally).
- **`app/sitemap.ts`** — added `export const dynamic = "force-dynamic"`. It
  queries products/certifications from the DB and had no error fallback, so it
  failed `next build` when no DB was reachable at build time. Deferring it to
  request time makes the build self-contained and serves a fresh sitemap.
- **`package.json`** — build script is now `prisma generate && next build`
  (`lib/generated/prisma` is gitignored, so the client must be generated during
  every Vercel build).
- **git** — initialized repo, `main` branch, initial commit. `.gitignore`
  already excludes `.env`/`.env*.local`/`node_modules`/`.next`/`.vercel`/the
  generated Prisma client; verified no secrets are staged.
- **`DEPLOYMENT.md`** — full runbook: create Neon Postgres, run
  `prisma migrate deploy` + seed against it, push to GitHub, import in Vercel,
  set the 12 required env vars (`lib/config.ts` validates them at build), deploy,
  and post-deploy checks.

Verified: `npm run build` completes cleanly with these changes (all routes
compile; `/sitemap.xml` is now dynamic).

---

## Phase 5 — "Editorial Luxury Atelier" revamp (2026-07-06)

Full-site UI revamp of the public pages (admin untouched). Direction approved
by the client: editorial luxury — photography-led, sentence-case Playfair
headlines with one italic gold accent word, generous whitespace, refined
green/cream/gold, rich-but-tasteful motion. Supersedes the Phase 2 glass/
eyebrow-heavy surface language where they conflict.

### Token consolidation (single source of truth)
- `app/globals.css` `:root` now holds a raw scale (`--green-950…600`,
  `--gold-700/500/300/100`, `--cream-50…300`, `--ink-900/600`) plus the
  existing semantic aliases re-pointed to it. New: `--brand-strong` (gold that
  passes contrast on cream), `--scrim`, RGB triplets for alpha utilities,
  `--radius-tile`, `--shadow-card`/`--shadow-float` (the only two shadows).
- `tailwind.config.ts` exposes semantic utilities (`bg-brand-deep/40`,
  `text-on-brand/70`, `rounded-card-lg`, `shadow-float`) and an editorial type
  scale (`display-xl/lg`, `display`, `title`, `title-sm`, `body-lg`, `caption`,
  `eyebrow`). Legacy color/fontSize keys are frozen as ADMIN-ONLY.
- Deleted `styles/tokens.ts` (unreferenced). No raw hex/rgba left in
  `components/` (verified by grep).

### New primitives
- `components/ui/HorizontalScroller.tsx` — native overflow-x carousel
  (drag + inertia, snap, arrows, gold progress hairline, `01 / 07` counter,
  `data-lenis-prevent`, no vertical-wheel hijack, reduced-motion aware).
- `components/motion/Parallax.tsx` (shared oversized-plate parallax),
  `components/motion/CountUp.tsx` (stat count-up), `components/ui/FormField.tsx`
  (shared Field + inputClass used by ContactModal AND ContactForm),
  `components/sections/PhotoHero.tsx` (inner-page photo hero),
  `lib/production-image-fallback.ts` (per-step slug→photo map).

### Home
Hero (sentence-case display-xl, italic gold last word, fake avatar dots/glass
stat card/mini slider removed, computed years line + scroll cue) → Trust
(ghost headline, computed years, marquee, cert chips; fake "15+ Years" and
"#01" boxes removed) → **ProductShowcaseCarousel** (portrait category cards,
edge-bleed) → **ProcessCarousel** (green band, 7 steps, ghost numerals, real
per-step photos) → StatBand (cream, CountUp, gold hairlines) → PullQuote
(de-carded centered blockquote) → FAQ. ContactCTABand removed everywhere —
the footer CTA owns conversion.

### Inner pages
- /about: light editorial hero (cream, italic gold accent, mission aside,
  21:9 parallax photo with caption BELOW), Why-Pakistan numbered hairline
  rows, asymmetric Mission/Vision/Values (one dark card), team ledger rows.
- /production: PhotoHero opener, steps keep `id={slug}` anchors, glass
  figcaptions → captions below, per-step photos via slug map, ghost numerals,
  StatBand moved below steps (cream).
- /products (+ detail, loading): display-lg header, pill FilterBar, editorial
  ProductCard (text below media, MOQ gold-wash chip), no glass caption on
  detail cover, gallery `rounded-tile`, skeleton mirrors new layout.
- /certifications (+ detail): new CertificationCard, retokened detail.
- /contact: single hairline-divided details panel, real "Open in Google Maps"
  link row (fake map block removed), ContactForm now visually identical to the
  modal via FormField.

### Component unification & deletions
One button system (PillButton + shared pill classes); Badge/FilterBar/
FaqAccordion/Breadcrumb retokened. Deleted: `ui/Button|Reveal|Reveal3D|
Modal|CarouselDots|ClientLogoCarousel`, `sections/ContactCTABand|
NumberedList|TiltedPhotoPair`, legacy `.reveal*`/`.step-card-3d` CSS.

### Bug fixes shipped with the revamp
- Hydration crash for `prefers-reduced-motion` users: RevealText/RevealLines/
  Inview/Parallax rendered different DOM than the server. All now keep
  identical DOM and collapse to zero-duration transitions instead.
- `next/image` fill-parent position warning in the hero.

DESIGN.md remains superseded; this log is authoritative.

---

## Phase 6 — Brand content update from client questionnaire (2026-07-06)

Updated site copy from the client's filled-in "Website Content & Brand Questionnaire" (.docx). Also addressed a text-legibility complaint (body/caption text read as too light/faded).

### Content changes (`extracted-data/site-content.json`)
- `about.mission` / `about.vision` — replaced short taglines with the client's full mission/vision statements.
- `about.values` — changed from 3 one-word strings to 6 `{ name, description }` objects (Quality Excellence, Integrity, Customer Partnership, Innovation, Sustainability, Reliability). `SiteContentValue` type added to `lib/site-content.ts`.
- `about.usp` (new field) — "what makes us different" paragraph from the questionnaire.
- `about.intro` — replaced with the client's new company summary paragraph (flagship placement: About hero).
- `home.aboutShort` — condensed derivative of the same summary, used for footer/meta only (kept distinct from `about.intro` to avoid literal duplication on the About page).
- **Packing capacity corrected 600,000 → 70,000 pcs/month** (confirmed with the client — a ~9x difference from the previous placeholder figure) across the stats array and the packing production-step description.

### New shared section
- `components/sections/MissionVisionValues.tsx` — Mission (large serif) + Vision (dark card) + the 6 Values (hairline grid, dot + name + description). Rendered on **both** Home (after Trust, before the product carousel) and About (after the hero) — this is genuinely new content on Home, not previously present.
- `components/sections/AboutSections.tsx` simplified to USP + Why Pakistan + Team (Mission/Vision/Values extracted out); its old "story short" section now shows the USP paragraph under "What sets us apart" instead of duplicating `aboutShort`.
- `components/sections/AboutHero.tsx` — dropped the `missionText` aside (it displayed a stale, auto-composed "Mission: X. Vision: Y. Values: Z." string from the original DB seed, now superseded by the dedicated Mission/Vision/Values section).

### Text-legibility pass
- `--ink-600` (the shared secondary/body-text color, aliased as `--ink-soft`) darkened `#5d554c` → `#453e35` — affects every ink-soft usage sitewide (descriptions, captions, stat labels, FAQ answers).
- Several translucent `on-brand/NN` body-copy instances on dark-green sections bumped from the 60–75% range to 80–85% (footer blurb, PhotoHero subtitle, certification detail description, process-carousel description/body, stat labels, product-showcase intro).

### Database
`prisma/seed.ts` updated to match (fresh environments now seed correctly), plus a new one-off, idempotent `prisma/update-content.ts` script for environments seeded before this change (their rows aren't touched by re-running `db:seed`, which only creates — never updates — existing rows). Applied to the local dev database; **production/Neon still needs this run** — see the run instructions in the script's header comment.
