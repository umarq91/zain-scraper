import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        accent: "#F26B1F",
        "accent-deep": "#D9551A",
        "accent-soft": "#FFE6D4",
        ink: "#0A0A0A",
        "ink-soft": "#2A2A2A",
        paper: "#FAFAF7",
        "paper-pure": "#FFFFFF",
        "grid-line": "#E4E4E0",
      },
      fontFamily: {
        display: ["var(--font-display)", "Times New Roman", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        hard: "4px 4px 0 #0A0A0A",
        "hard-sm": "2px 2px 0 #0A0A0A",
        "hard-lg": "6px 6px 0 #0A0A0A",
        "hard-accent": "4px 4px 0 #F26B1F",
      },
    },
  },
  plugins: [],
};

export default config;
