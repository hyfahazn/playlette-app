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
        mono: {
          void: "#000000",
          950: "#050505",
          900: "#09090b",
          850: "#121215",
          800: "#18181b",
          700: "#27272a",
          600: "#3f3f46",
          500: "#52525b",
          400: "#71717a",
          300: "#a1a1aa",
          200: "#d4d4d8",
          100: "#e4e4e7",
          50: "#f4f4f5",
          white: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        display: ["var(--font-display)", "Space Grotesk", "Syne", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Courier New", "monospace"],
      },
      animation: {
        "spin-slow": "spin-vinyl 14s linear infinite",
        "spin-med": "spin-vinyl 6s linear infinite",
        "spin-fast": "spin-vinyl 2.5s linear infinite",
        "pulse-subtle": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "dither-blink": "dither-blink 1s steps(2, start) infinite",
        "specular-rotate": "spin-vinyl 10s linear infinite",
        "flare-shimmer": "flare-shimmer 4s ease-in-out infinite alternate",
      },
      keyframes: {
        "spin-vinyl": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "dither-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
        "flare-shimmer": {
          "0%": { opacity: "0.65", transform: "scale(0.98)" },
          "100%": { opacity: "0.95", transform: "scale(1.02)" },
        },
      },
      boxShadow: {
        "mono-card": "0 20px 50px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.15)",
        "mono-glow": "0 0 25px rgba(255, 255, 255, 0.6)",
        "mono-intense": "0 0 35px rgba(255, 255, 255, 0.8), 0 0 70px rgba(255, 255, 255, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
