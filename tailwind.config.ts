import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#140A1B",
          2: "#1C0F25",
          3: "#261634",
        },
        silk: {
          DEFAULT: "#FBF0F5",
          dim: "#B8A4C0",
          faint: "#7E6C8C",
        },
        rose: "#FF4D9D",
        powder: "#8FC2FF",
        violet: "#C79BFF",
        amber: "#FFB020",
        stop: "#FF3B5C",
        accent: "var(--accent)",
        hairline: "var(--hairline)",
      },
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        ui: ["'Inter Tight'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "26px",
        ctl: "14px",
      },
      transitionTimingFunction: {
        lace: "cubic-bezier(.22,.61,.36,1)",
        spring: "cubic-bezier(.34,1.42,.64,1)",
      },
      keyframes: {
        "sheet-up": {
          from: { transform: "translateY(102%)" },
          to: { transform: "translateY(0)" },
        },
        "sheet-down": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(102%)" },
        },
      },
      animation: {
        "sheet-up": "sheet-up .4s cubic-bezier(.22,.61,.36,1)",
        "sheet-down": "sheet-down .3s cubic-bezier(.22,.61,.36,1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
