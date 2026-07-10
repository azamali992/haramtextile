import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // ── Semantic tokens (public site) — bound to CSS vars in globals.css ──
        brand: {
          DEFAULT: "var(--brand)",
          light: "var(--brand-light)",
          strong: "var(--brand-strong)",
          deep: "rgb(var(--brand-deep-rgb) / <alpha-value>)",
          deeper: "var(--brand-deeper)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          card: "var(--surface-card)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          soft: "var(--ink-soft)",
        },
        "on-brand": "rgb(var(--on-brand-rgb) / <alpha-value>)",
        scrim: "rgb(var(--scrim-rgb) / <alpha-value>)",
        hairline: "var(--hairline)",
        ghost: "var(--ghost)",
        // ── ADMIN-ONLY LEGACY TOKENS — frozen; do not use in public components ──
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
      },
      borderRadius: {
        card: "var(--radius-card)",
        "card-lg": "var(--radius-card-lg)",
        tile: "var(--radius-tile)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        float: "var(--shadow-float)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // ── Editorial type scale (public site) ──
        "display-xl": [
          "clamp(2.5rem, 6.5vw, 7.5rem)",
          { lineHeight: "0.9", letterSpacing: "-0.01em" },
        ],
        "display-lg": [
          "4.5rem",
          { lineHeight: "0.95", letterSpacing: "-0.01em" },
        ],
        display: [
          "3.25rem",
          { lineHeight: "0.98", letterSpacing: "-0.005em" },
        ],
        title: ["2rem", { lineHeight: "1.15" }],
        "title-sm": ["1.375rem", { lineHeight: "1.25" }],
        "body-lg": ["1.125rem", { lineHeight: "1.7" }],
        body: ["1rem", { lineHeight: "1.65" }],
        caption: ["0.8125rem", { lineHeight: "1.5" }],
        eyebrow: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.25em" }],
        // ── ADMIN-ONLY LEGACY SCALE — frozen ──
        xs: "12px",
        sm: "14px",
        base: "16px",
        lg: "20px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "48px",
        "4xl": "64px",
      },
    },
  },
  plugins: [],
};
export default config;
