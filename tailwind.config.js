/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // enable class-based dark mode
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          500: 'var(--color-saffron-500)',
          600: 'var(--color-saffron-600)',
        },
        gold: {
          400: 'var(--color-gold-400)',
          500: 'var(--color-gold-500)',
        },
        maroon: {
          800: 'var(--color-maroon-800)',
          900: 'var(--color-maroon-900)',
        },
        festiveRed: 'var(--color-festive-red)',
      },
    },
  },
  plugins: [],
};
