import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        schwarz: "var(--schwarz)",
        weiss: "var(--weiss)",
        "grau-900": "var(--grau-900)",
        "grau-500": "var(--grau-500)",
        "grau-200": "var(--grau-200)",
        plus: "var(--plus)",
        minus: "var(--minus)",
        akzent: "var(--akzent)",
      },
      fontFamily: {
        display: ["var(--font-archivo)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        brand: [
          "var(--font-fritz)",
          "var(--font-archivo)",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        DEFAULT: "2px",
        sm: "2px",
        md: "2px",
        lg: "2px",
      },
      letterSpacing: {
        display: "-0.02em",
      },
    },
  },
  plugins: [],
};

export default config;
