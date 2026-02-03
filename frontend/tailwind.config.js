/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nao-green': '#8CD867',
        'nao-navy': '#1B2B41',
        'nao-gray': '#4A4A4A',
        'nao-light': '#F8F9FA',
        'nao-star': '#FFC107',
      },
    },
  },
  plugins: [],
}
