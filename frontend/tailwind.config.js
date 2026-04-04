/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#001F3F",
        brandyellow: "#FFD700",
        brandgray: "#6B7280",
        surface: {
          DEFAULT: "#0a0a0f",
          raised: "rgba(255,255,255,0.05)",
          overlay: "rgba(255,255,255,0.08)",
          border: "rgba(255,255,255,0.10)",
        },
        danger: { DEFAULT: "#EF4444", soft: "rgba(239,68,68,0.10)", muted: "rgba(239,68,68,0.20)" },
        success: { DEFAULT: "#22C55E", soft: "rgba(34,197,94,0.10)", muted: "rgba(34,197,94,0.20)" },
        warning: { DEFAULT: "#F59E0B", soft: "rgba(245,158,11,0.10)", muted: "rgba(245,158,11,0.20)" },
        info: { DEFAULT: "#3B82F6", soft: "rgba(59,130,246,0.10)", muted: "rgba(59,130,246,0.20)" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        display: ["3.5rem", { lineHeight: "1.1", fontWeight: "800", letterSpacing: "-0.02em" }],
        heading: ["2rem", { lineHeight: "1.2", fontWeight: "700", letterSpacing: "-0.01em" }],
        subheading: ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["0.8125rem", { lineHeight: "1.4", fontWeight: "500" }],
        micro: ["0.6875rem", { lineHeight: "1.3", fontWeight: "500" }],
      },
      spacing: {
        section: "5rem",
        "card-pad": "1.5rem",
        "card-pad-lg": "2rem",
      },
      borderRadius: {
        card: "1rem",
        button: "0.75rem",
        input: "0.75rem",
        badge: "9999px",
      },
      boxShadow: {
        glow: "0 0 30px rgba(255,215,0,0.15)",
        "glow-lg": "0 0 60px rgba(255,215,0,0.20)",
        card: "0 4px 24px rgba(0,0,0,0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-up": "fadeUp 0.6s ease-out",
        "slide-in": "slideIn 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "count-up": "countUp 1.5s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "slide-up": "slideUp 0.6s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSoft: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.7" } },
        countUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
