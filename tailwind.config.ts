import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                war: {
                    bg: "#0a0e17",
                    panel: "#111827",
                    border: "#1e293b",
                    accent: "#3b82f6",
                    "accent-glow": "#60a5fa",
                    danger: "#ef4444",
                    warning: "#f59e0b",
                    success: "#22c55e",
                    muted: "#64748b",
                    text: "#e2e8f0",
                    "text-dim": "#94a3b8",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "Fira Code", "monospace"],
            },
            animation: {
                "pulse-glow": "pulse-glow 2s ease-in-out infinite",
                "slide-up": "slide-up 0.5s ease-out",
                "fade-in": "fade-in 0.3s ease-out",
                "spin-slow": "spin 3s linear infinite",
            },
            keyframes: {
                "pulse-glow": {
                    "0%, 100%": { boxShadow: "0 0 8px rgba(59, 130, 246, 0.3)" },
                    "50%": { boxShadow: "0 0 24px rgba(59, 130, 246, 0.6)" },
                },
                "slide-up": {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
            },
            backdropBlur: {
                xs: "2px",
            },
        },
    },
    plugins: [],
};
export default config;
