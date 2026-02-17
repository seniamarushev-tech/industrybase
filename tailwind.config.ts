import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#090b10",
        card: "#10131b",
        muted: "#7f8899",
        accent: "#8b5cf6",
        border: "#232735"
      }
    }
  },
  plugins: []
};

export default config;
