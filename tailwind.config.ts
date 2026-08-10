import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",   // Màu chủ đạo Indigo
          700: "#4338ca",   // Hover primary
          800: "#3730a3",
          900: "#312e81",
        },
        dark: "#0f172a",    // Text tiêu đề Deep Slate
        muted: "#64748b",   // Text phụ Slate 500
        surface: "#f8fafc", // Background surface
        brand: {
          50: "#f0f4ff",
          100: "#e0e7ff",
          300: "#a5b4fc",
          500: "#4f46e5",
          600: "#4338ca",
          700: "#3730a3",
          800: "#312e81",
          900: "#1e1b4b",
        },
        sand: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          400: "#94a3b8",
        },
      },
      boxShadow: {
        glass: "0 8px 30px rgba(0, 0, 0, 0.04)",
        glow: "0 10px 25px -5px rgba(79, 70, 229, 0.3)",
        card: "0 4px 20px rgba(15, 23, 42, 0.05)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      maxWidth: {
        "1440": "1440px",
      },
    },
  },
  plugins: [],
};
export default config;
