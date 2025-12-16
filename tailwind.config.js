/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kraken': {
          red: '#FF6B6B',
          pink: '#FF5E9D',
          purple: '#C77DFF',
          blue: '#7B9EF4',
        },
        'dark': {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a24',
          600: '#22222e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-kraken': 'linear-gradient(135deg, #FF6B6B, #FF5E9D, #C77DFF, #7B9EF4)',
      },
    },
  },
  plugins: [],
}
