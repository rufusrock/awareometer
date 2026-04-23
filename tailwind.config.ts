import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        card: "0 18px 45px -24px rgba(15, 23, 42, 0.28)"
      },
      fontFamily: {
        display: ["ui-sans-serif", "system-ui", "sans-serif"]
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.985)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        }
      },
      animation: {
        rise: "rise 280ms ease-out"
      }
    }
  },
  plugins: []
};

export default config;
