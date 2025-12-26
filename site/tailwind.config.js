/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#050505', // Deeper black
        'spotify-black': '#121212',
        'spotify-dark': '#181818',
        'spotify-grey': '#282828',
        'spotify-light': '#B3B3B3',
        gold: '#F59E0B',
        cloud: '#F8FAFC',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
