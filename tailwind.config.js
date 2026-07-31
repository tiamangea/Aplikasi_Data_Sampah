/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", /* Baris ini yang membuat Vite membaca file React Anda */
  ],
  theme: {
    extend: {
      colors: {
        undip: {
          dark: '#03045E',
          light: '#0077B6',
          bg: '#F3F4F6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}