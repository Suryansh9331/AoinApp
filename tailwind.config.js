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
        primary: '#F2631F',
        'primary-dark': '#D9541A',
        'primary-light': '#FF7A3D',
      },
    },
  },
  plugins: [],
}

