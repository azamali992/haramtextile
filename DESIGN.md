---
name: Haram Textile
description: Editorial-trust rebuild of a Faisalabad knitwear manufacturer's B2B site
colors:
  green-primary: "#2D5016"
  green-light: "#4A7C2F"
  cream: "#F5F0E8"
  cream-dark: "#E8DDD0"
  cream-off: "#FDFAF6"
  brown-deep: "#1A0F00"
  gold-muted: "#B8963E"
  gray-warm: "#8C8279"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "64px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "normal"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "48px"
    fontWeight: 600
    lineHeight: 1.15
  title:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    letterSpacing: "0.02em"
spacing:
  xs: "8px"
  sm: "16px"
  md: "32px"
  lg: "64px"
  xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.gold-muted}"
    textColor: "{colors.brown-deep}"
    rounded: "6px"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.gold-muted}"
    textColor: "{colors.brown-deep}"
  button-secondary:
    backgroundColor: "{colors.green-primary}"
    textColor: "{colors.cream-off}"
    rounded: "6px"
    padding: "12px 24px"
  button-secondary-hover:
    backgroundColor: "{colors.green-light}"
    textColor: "{colors.cream-off}"
  badge-moq:
    backgroundColor: "{colors.gold-muted}"
    textColor: "{colors.brown-deep}"
    rounded: "9999px"
    padding: "4px 12px"
  badge-category:
    backgroundColor: "{colors.green-primary}"
    textColor: "{colors.cream-off}"
    rounded: "9999px"
    padding: "4px 12px"
  card-certification:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.brown-deep}"
    rounded: "6px"
---

# Design System: Haram Textile

## 1. Overview

**Creative North Star: "The Certified Atelier"**

The system reads as a working mill that keeps its own ledger — certifications, capacity, and compliance presented with the typographic confidence of an editorial fashion house, not the icon-tile flatness of the legacy corporate site it replaces. Every surface is doing one of two jobs: carrying real photographic evidence of the factory and product, or carrying a fact (a certification, a stat, a credential) in type heavy enough to be believed at a glance. Density is generous — full-bleed imagery, 96px section breathing room, asymmetric grids — because trust here is built through space and craft, not through cramming proof points into stat-box icons.

This system explicitly rejects: purple/blue gradients, card-in-card nesting, rounded-square icon tiles, floating shadows, glassmorphism, dashboard-style stat cards, Inter font, generic centered-hero SaaS layouts, and the legacy site's own black/gray/white corporate-industrial flatness with its icon stat-boxes and bare "View More" links.

**Key Characteristics:**
- Asymmetric, full-bleed, photography-led — never a centered hero with two buttons
- One accent color (muted gold) used sparingly and only where it means something: CTAs, certifications, MOQ
- Flat by default — no shadows anywhere; depth comes from color blocking and borders, not elevation
- Subtle 6px corner rounding sitewide, plus pill-shaped badges — soft enough to avoid feeling app-generic, sharp enough to still read as precise/industrial rather than soft/consumer
- Serif display type carries authority; sans body type carries clarity

## 2. Colors: The Mill & Ledger Palette

The palette pairs an institutional forest green (the "mill") with a warm paper cream (the "ledger") and reserves a single burnished gold for anything that has been earned — a certification, a call to action, a minimum-order commitment.

### Primary
- **Deep Forest Green** (#2D5016): The mill's color. Sidebar/admin chrome, the full-width contact CTA band, secondary buttons, category badges, footer. Used as a deliberate ~20-25% surface, never a tint.
- **Vine Green** (#4A7C2F): Hover/active state for anything in Deep Forest Green — never appears at rest.

### Neutral
- **Warm Cream** (#F5F0E8): Default page background — the "paper" the ledger is written on.
- **Dark Cream** (#E8DDD0): Section dividers, card borders, table row dividers. Never a shadow substitute — always a real 1px border.
- **Off-White Linen** (#FDFAF6): Hero overlay panels, text-on-green/text-on-red (button labels), the cream-toned card background behind product imagery.
- **Deep Brown Ink** (#1A0F00): Primary text. Warmer than pure black on purpose — pure black on cream reads cold and corporate, which is the legacy site's failure mode.
- **Warm Gray** (#8C8279): Secondary text, captions, fabric-type labels — never used for anything load-bearing (no warm-gray body copy under 14px).

### Named Rules
**The Earned Gold Rule.** Muted Gold (#B8963E) appears only on: the primary CTA button, the MOQ badge, certification-section underline accents, and certification issuing-body labels. It never becomes a background tint, a hover color for unrelated elements, or decoration. If gold shows up somewhere and you can't say what was "earned" there, remove it.

## 3. Typography

**Display Font:** Playfair Display (with Georgia, serif fallback)
**Body Font:** DM Sans (with system-ui, sans-serif fallback)

**Character:** A high-contrast serif/grotesque-sans pairing — Playfair's sharp, editorial contrast against DM Sans's clean geometric clarity. The pairing is the entire "fashion-house meets manufacturing-spec-sheet" brief in two typefaces.

### Hierarchy
- **Display** (600, 64px, 1.1 line-height): Hero headlines only. One per page, left-aligned, never centered.
- **Headline** (600, 48px, 1.15): Section headers (About story, Contact CTA band, page H1s below the hero).
- **Title** (500, 24px, 1.3): Product/certification card names, sub-section headers.
- **Body** (400, 16px, 1.6, max 70ch): Paragraph copy, FAQ answers.
- **Label** (500, 14px, letter-spacing 0.02em): Badges, form labels, nav links, captions.

### Named Rules
**The No-Eyebrow Rule.** No tiny uppercase tracked kicker text above section headings ("ABOUT" / "PROCESS" / "CERTIFICATIONS"). Section identity comes from the Headline weight and the photography beneath it, not from a kicker label.

## 4. Elevation

Flat by default — zero box-shadow usage anywhere in the system. Depth and separation are conveyed entirely through color blocking (cream vs. dark-cream vs. green panels) and 1px borders (Dark Cream on cards), never through shadow, blur, or glass. The legacy site already proved this brand doesn't need lift effects to feel substantial; substance comes from full-bleed photography and typographic weight instead.

### Named Rules
**The Flat-By-Default Rule.** If a component needs to feel "raised," reach for a Dark Cream border or a Deep Forest Green color block before reaching for a shadow. Shadows are prohibited outright, not just minimized.

## 5. Components

### Buttons
- **Shape:** Subtle 6px corner radius (`rounded-md`) — soft enough to avoid feeling stamped-flat, still tight enough to read as precise/industrial rather than app-soft.
- **Primary:** Muted Gold background, Deep Brown Ink text, 12px/24px padding. Reserved for the single most important action per screen (hero CTA, contact-form submit).
- **Secondary:** Deep Forest Green background, Off-White Linen text; hover shifts to Vine Green. Used for everything that isn't THE primary action.
- **Danger:** Deep red (#b91c1c-range) background, Off-White Linen text — admin-only (delete actions).
- **Hover/Focus:** Color shift only (no transform, no shadow-gain). Focus-visible gets a 2px Deep Forest Green outline, 2px offset, per the accessibility requirement.

### Badges
- **Style:** Pill-shaped (9999px radius) — noticeably rounder than the system's 6px default, since a small label pill is the conventional, unambiguous "this is metadata" shape.
- **MOQ badge:** Muted Gold background, Deep Brown Ink text.
- **Category badge:** Deep Forest Green background, Off-White Linen text.

### Cards
- **Corner Style:** 6px radius (`rounded-md`) throughout — a deliberate, subtle softening from the system's original 0px-everywhere rule, applied consistently to every card/box/input/button across both the public site and the admin panel.
- **Background:** Off-White Linen (product cards) or Warm Cream (certification cards).
- **Shadow Strategy:** None — see Elevation. Separation comes from the Dark Cream border.
- **Border:** 1px Dark Cream at rest; shifts to Muted Gold on hover (certification cards) as the only hover affordance.
- **Internal Padding:** 16-24px (matches the 8px spacing grid: `p-4`/`p-6`).

### Inputs / Fields
- **Style:** White background, Dark Cream border, 6px corner radius (`rounded-md`).
- **Focus:** Border/ring shifts to Deep Forest Green — no glow, no shadow.

### Navigation
- **Public site:** Understated, body-weight DM Sans links; descriptive text, never "click here."
- **Admin sidebar:** Deep Forest Green background, Off-White Linen/Cream text links, active state via a Vine Green or Muted Gold left-edge state change (not a colored stripe border — use a filled background block for the active item instead).

## 6. Do's and Don'ts

### Do:
- **Do** use asymmetric, full-bleed photography-led layouts for every section — Home about-snippet, product grid, certifications strip.
- **Do** reserve Muted Gold for things that were earned: CTAs, MOQ, certifications.
- **Do** use Deep Brown Ink (#1A0F00) for body text instead of pure black — it's warmer and matches the editorial, not corporate, register.
- **Do** keep all spacing on the 8px grid (96px desktop / 64px mobile section padding).
- **Do** give every interactive element a visible 2px Deep Forest Green focus outline, 2px offset.

### Don't:
- **Don't** use purple/blue gradients, glassmorphism, or dashboard-style stat cards anywhere on the public site.
- **Don't** nest cards inside cards, or use rounded-square icon tiles.
- **Don't** add box-shadows — Flat-By-Default is absolute, not a guideline.
- **Don't** default any section to centered-text-plus-two-buttons; that's the generic-SaaS hero this brand is explicitly rebuilding away from.
- **Don't** use Inter or any generic sans-serif stack — Playfair Display + DM Sans only.
- **Don't** revert to the legacy site's icon stat-boxes or bare "View More" link pattern for presenting capacity/certification facts.
