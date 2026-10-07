/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E11D48',
          redHover: '#BE123C',
          redLight: '#FFE4E6',
          redDark: '#881337',
          yellow: '#F59E0B',
          yellowLight: '#FEF08A',
          green: '#16A34A',
          greenHover: '#15803D',
          greenLight: '#DCFCE7',
          neonGreen: '#22C55E'
        }
      }
    },
  },
  plugins: [],
}
