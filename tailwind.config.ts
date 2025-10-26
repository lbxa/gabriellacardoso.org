import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      backgroundImage: {
        "abstract-1": "url('/src/assets/images/abstract-1.jpg')",
        "abstract-2": "url('/src/assets/images/abstract-2.jpg')",
        "abstract-3": "url('/src/assets/images/abstract-3.jpg')",
        "art-1": "url('/src/assets/images/art-1.png')",
        "art-2": "url('/src/assets/images/art-2.png')",
        "art-3": "url('/src/assets/images/art-3.png')",
        "art-4": "url('/src/assets/images/art-4.png')",
      },
      colors: {
        shark: {
          "50": "#f6f6f6",
          "100": "#e7e7e7",
          "200": "#d1d1d1",
          "300": "#b0b0b0",
          "400": "#888888",
          "500": "#6d6d6d",
          "600": "#5d5d5d",
          "700": "#4f4f4f",
          "800": "#454545",
          "900": "#3d3d3d",
          "950": "#121212",
        },
        ivory: "#f5f5f5",
        theme: "var(--bg-theme)",
      },
      fontFamily: {
        serif: ["Times New Roman", ...defaultTheme.fontFamily.serif],
        sans: ["Neue Montreal", ...defaultTheme.fontFamily.sans],
      },
      spacing: {
        xs: "0.25rem", // 4px / 16 = 0.25rem
        sm: "0.75rem", // 12px / 16 = 0.75rem
        md: "1rem", // 16px / 16 = 1rem
        lg: "1.5rem", // 24px / 16 = 1.5rem
        xl: "2rem", // 32px / 16 = 2rem
        "2xl": "3rem", // 48px / 16 = 3rem
        "3xl": "4rem", // 64px / 16 = 4rem
        "4xl": "5rem", // 80px / 16 = 5rem
        "5xl": "6rem", // 96px / 16 = 6rem
        "6xl": "8rem", // 128px / 16 = 8rem
      },
    },
  },
  darkMode: "selector",
  plugins: [],
} satisfies Config;
