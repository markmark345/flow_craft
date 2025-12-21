/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        surface: "var(--surface)",
        surface2: "var(--surface-2)",
        border: "var(--border)",
        accent: "var(--accent)",
        accentStrong: "var(--accent-strong)",
        trigger: "var(--trigger)",
        slack: "var(--slack)",
        green: "var(--success)",
        amber: "var(--warning)",
        red: "var(--error)",
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        text: "var(--text)",
        muted: "var(--muted)",
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        pill: "var(--radius-pill)"
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        lift: "var(--shadow-lift)",
        focus: "var(--shadow-focus)",
        glowAccent: "var(--glow-accent)",
        glowError: "var(--glow-error)",
        glowSuccess: "var(--glow-success)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "monospace"],
      }
    }
  },
  plugins: [],
};
