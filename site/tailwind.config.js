/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#050505',
        'spotify-black': '#121212',
        'spotify-dark': '#181818',
        'spotify-grey': '#282828',
        'spotify-light': '#B3B3B3',
        gold: '#C79A55',
        cloud: '#FDF8F2',
        paper: '#F7F1E8',
        'paper-strong': '#FFF8F1',
        ink: '#2B241D',
        'ink-muted': '#6B5F54',
        sage: '#7C856E',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
