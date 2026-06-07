import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./store/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rwanda: {
          // ── Vert (couleur principale du drapeau rwandais) ──
          green: {
            50:  "#f0faf4",
            100: "#d9f2e3",
            200: "#b3e5c7",
            300: "#7dd0a4",
            400: "#44b47c",
            500: "#1f9659",
            600: "#147a46",
            700: "#0f6138",  // ← token principal `rwanda-green`
            800: "#0d4f2f",
            900: "#0b3f26",
            950: "#062518",
          },
          // ── Rouge (couleur du drapeau rwandais) ──
          red: {
            50:  "#fff4f2",
            100: "#ffe4df",
            200: "#ffccc4",
            300: "#ffa599",
            400: "#ff6e5e",
            500: "#f74530",
            600: "#e42a18",
            700: "#c0200f",  // ← token principal `rwanda-red`
            800: "#9e1f10",
            900: "#82200f",
            950: "#470d04",
          },
          // ── Beige / Crème (artisanat, neutralité chaude) ──
          beige: {
            50:  "#fdfaf5",
            100: "#faf3e7",
            200: "#f4e4c8",
            300: "#ecd0a0",
            400: "#e0b472",
            500: "#d49a4e",
            600: "#c07e35",
            700: "#a0632a",  // ← token principal `rwanda-beige`
            800: "#824f25",
            900: "#6b4121",
            950: "#3a200e",
          },
          // ── Or / Ambre (artisanat, mise en valeur) ──
          gold: {
            50:  "#fffbeb",
            100: "#fef3c7",
            200: "#fde68a",
            300: "#fcd34d",
            400: "#fbbf24",
            500: "#f59e0b",  // ← token principal `rwanda-gold`
            600: "#d97706",
            700: "#b45309",
            800: "#92400e",
            900: "#78350f",
            950: "#451a03",
          },
          // ── Bleu ciel (drapeau — bande supérieure) ──
          sky: {
            50:  "#f0f9ff",
            100: "#e0f2fe",
            200: "#bae6fd",
            300: "#7dd3fc",
            400: "#38bdf8",
            500: "#0ea5e9",
            600: "#0284c7",
            700: "#0b57a4",  // ← token principal `rwanda-sky`
            800: "#075985",
            900: "#0c4a6e",
            950: "#082f49",
          },
        },
      },

      fontFamily: {
        sans:  ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        mono:  ["var(--font-jetbrains)", "monospace"],
      },

      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      boxShadow: {
        card:  "0 1px 3px 0 rgb(0 0 0 / .06), 0 1px 2px -1px rgb(0 0 0 / .04)",
        "card-hover": "0 4px 12px 0 rgb(0 0 0 / .10), 0 2px 4px -2px rgb(0 0 0 / .06)",
        "inner-sm": "inset 0 1px 2px 0 rgb(0 0 0 / .05)",
      },

      backgroundImage: {
        "gradient-rwanda":
          "linear-gradient(135deg, #0f6138 0%, #147a46 50%, #0b57a4 100%)",
        "gradient-gold":
          "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        "pattern-kente":
          "repeating-linear-gradient(45deg, transparent, transparent 4px, rgb(15 97 56 / .04) 4px, rgb(15 97 56 / .04) 8px)",
      },

      animation: {
        "fade-in":       "fadeIn .25s ease-out",
        "slide-up":      "slideUp .3s cubic-bezier(.16,1,.3,1)",
        "slide-in-right":"slideInRight .3s cubic-bezier(.16,1,.3,1)",
        "scale-in":      "scaleIn .2s ease-out",
        shimmer:         "shimmer 1.6s linear infinite",
      },

      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(.95)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to:   { backgroundPosition: "200% 0" },
        },
      },

      screens: {
        xs: "475px",
      },

      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
    },
  },
  plugins: [],
};

export default config;
