/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#EF233C',
          hover: '#D90429',
          light: '#FF4D6D',
          dark: '#8D0801',
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#EF233C',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        secondary: '#000000',
        accent: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          dark: '#1D4ED8',
        },
        background: '#000000',
        surface: {
          DEFAULT: '#1A1A1A',
          elevated: '#242424',
          subtle: '#141414',
          border: '#2E2E2E',
          hover: '#2A2A2A'
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
          muted: '#71717A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
