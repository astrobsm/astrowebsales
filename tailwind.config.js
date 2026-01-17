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
          50: '#f0f9f4',
          100: '#dcf2e4',
          200: '#bbe5cc',
          300: '#8dd1a9',
          400: '#5ab680',
          500: '#389b62',
          600: '#287d4d',
          700: '#226440',
          800: '#1e5035',
          900: '#1a422d',
          950: '#0d2519',
        },
        secondary: {
          50: '#f4f7fb',
          100: '#e9eff5',
          200: '#cedce9',
          300: '#a3bfd6',
          400: '#719dbe',
          500: '#4f80a6',
          600: '#3d678b',
          700: '#325371',
          800: '#2d475f',
          900: '#293d50',
          950: '#1b2735',
        },
        accent: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#ffdba8',
          300: '#ffc170',
          400: '#ff9c37',
          500: '#ff7f10',
          600: '#f06306',
          700: '#c74907',
          800: '#9e3a0e',
          900: '#7f320f',
          950: '#451705',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
