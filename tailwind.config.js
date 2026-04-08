/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF6B6B",
          50: "#FFF0F0",
          100: "#FFE0E0",
          500: "#FF6B6B",
          600: "#F05050",
          700: "#D43838",
        },
        secondary: {
          DEFAULT: "#F59E0B",
          500: "#F59E0B",
          600: "#D97706",
        },
      },
    },
  },
  plugins: [],
};
