/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D81B60',
          dark: '#B0004A',
          light: '#FDF2F7',
        },
        surface: '#F9F9F9',
        carbon: '#1A1C1C',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        serif: ['Manrope', 'serif'],
      },
      boxShadow: {
        'premium': '0px 4px 20px rgba(0,0,0,0.04)',
        'premium-hover': '0px 12px 30px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
