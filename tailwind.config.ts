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
      fontFamily: {
        heading: ["var(--font-heading)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      fontSize: {
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
