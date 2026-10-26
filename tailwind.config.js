/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Identidade "Sala escura": preto de cinema + âmbar de luz de projetor.
        app: {
          bg: "#070707",
          surface: "#111113",
          surfaceSoft: "#18181b",
          border: "#26262b",
          text: "#f4f4f5",
          muted: "#a1a1aa",
          brand: "#fbbf24",
          brandHover: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ['"Bebas Neue"', "Impact", "sans-serif"],
      },
    },
  },
  plugins: [],
};
