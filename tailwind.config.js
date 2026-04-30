/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Body stays Inter — proven for dense data UI
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        // Distinctive headings — geometric, slightly architectural
        display: [
          "Space Grotesk",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      colors: {
        // Slightly cooler, more "operations" gray than the sales app's neutral
        ink: {
          50: "#f5f7fa",
          100: "#eaeef4",
          200: "#d6dde8",
          300: "#b3becf",
          400: "#7d8ba3",
          500: "#536179",
          600: "#3b475c",
          700: "#283346",
          800: "#16202f",
          900: "#0b1424",
        },
        // Deep teal brand — saturated and confident
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        // Warm orange accent — used sparingly for "waiting on client" energy
        accent: {
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(11, 20, 36, 0.04), 0 1px 3px 0 rgba(11, 20, 36, 0.05)",
        pop: "0 12px 28px -10px rgba(11, 20, 36, 0.18), 0 2px 6px -1px rgba(11, 20, 36, 0.08)",
        drawer:
          "-12px 0 32px -12px rgba(11, 20, 36, 0.22), -2px 0 8px -2px rgba(11, 20, 36, 0.10)",
        // Sidebar gets its own deep shadow to make it feel "lifted" from page
        rail: "2px 0 14px -4px rgba(11, 20, 36, 0.4)",
      },
      borderRadius: {
        // Slightly less rounded than the sales app — more "operational/serious"
        xl: "0.75rem",
      },
      backgroundImage: {
        // Subtle dot pattern for the page background — operational, not flat
        "ops-dots":
          "radial-gradient(circle at 1px 1px, rgba(83, 97, 121, 0.10) 1px, transparent 0)",
      },
      backgroundSize: {
        "ops-dots": "20px 20px",
      },
    },
  },
  plugins: [],
};
