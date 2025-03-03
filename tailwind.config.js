/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      height: {
        '0.75': '3px',
      }
    },
    fontFamily: {
      'varela': ['Varela', 'sans']
    }
  },
  plugins: [],
  darkMode: 'selector',
}