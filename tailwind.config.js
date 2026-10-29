/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cricket: {
          green: '#198754',
          lightGreen: '#28a745',
          darkGreen: '#157347',
          forest: '#0f5132',
        }
      }
    },
  },
  plugins: [],
}
