/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: "#FF9500",
        "gold-dark": "#FF6B35",
        "dark-bg": "#F5F5F5",
        "dark-secondary": "#FFFFFF",
        "pet-orange": "#FF9500",
        "pet-brown": "#8B4513",
        "pet-cream": "#FFF8DC",
      },
      screens: {
        xs: "475px",
        "3xl": "1920px",
        "4xl": "2560px",
      },
    },
  },
  plugins: [],
}
