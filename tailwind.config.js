/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        teal: {
          DEFAULT: '#49c5b6',
          light: '#6fd9cc',
          dark: '#2faa9b',
        },
        coral: {
          DEFAULT: '#ff3d6e',
          light: '#ff6b8a',
          dark: '#d92850',
        },
      },
    },
  },
  plugins: [],
};
