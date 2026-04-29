import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#721016',
          container: '#4f0007',
        },
        secondary: {
          DEFAULT: '#D95D2B',
          container: '#a73a05',
        },
        background: '#fef9ef',
        surface: '#f2ede3',
        tertiary: '#4A3728',
      },
      fontFamily: {
        headline: ['"Noto Serif"', 'serif'],
        body: ['"Be Vietnam Pro"', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
