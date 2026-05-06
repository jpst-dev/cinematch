/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "#09090b",
          surface: "#18181b",
          surfaceSoft: "#27272a",
          border: "#3f3f46",
          text: "#fafafa",
          muted: "#a1a1aa",
          brand: "#6366f1",
          brandHover: "#4f46e5",
        },
      },
      boxShadow: {
        panel: "0 10px 35px rgba(0, 0, 0, 0.35)",
      },
      borderRadius: {
        panel: "1rem",
      },
    },
  },
  plugins: [],
};
  