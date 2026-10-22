/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A', // Deep Navy Blue
        secondary: '#475569', // Slate Gray
        accent: '#D4AF37', // Subtle Gold
      },
    },
  },
  plugins: [],
}
