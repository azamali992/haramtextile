/**
 * Design tokens — single source of truth for brand colors, fonts, and type
 * scale. Components should import from here instead of hardcoding hex
 * codes or font names. These values mirror the `theme.extend` block in
 * `tailwind.config.ts` — keep both in sync if either changes.
 */

export const colors = {
  green: {
    primary: "#2D5016",
    light: "#4A7C2F",
  },
  cream: {
    DEFAULT: "#F5F0E8",
    dark: "#E8DDD0",
    off: "#FDFAF6",
  },
  brown: {
    deep: "#1A0F00",
  },
  gold: {
    muted: "#B8963E",
  },
  gray: {
    warm: "#6B6259",
  },
} as const;

export const fonts = {
  heading: ["Playfair Display", "Georgia", "serif"],
  body: ["DM Sans", "system-ui", "sans-serif"],
} as const;

export const typeScale = {
  xs: "12px",
  sm: "14px",
  base: "16px",
  lg: "20px",
  xl: "24px",
  "2xl": "32px",
  "3xl": "48px",
  "4xl": "64px",
} as const;

export type ColorTokens = typeof colors;
export type FontTokens = typeof fonts;
export type TypeScaleTokens = typeof typeScale;
