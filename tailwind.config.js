/** @type {import('tailwindcss').Config} */

// Tailwind's opacity modifiers (bg-teal/30, text-teal/70, ...) need a color
// defined as a function that receives { opacityValue } and returns
// rgb(r g b / alpha) — see https://tailwindcss.com/docs/customizing-colors#using-css-variables.
// varName must point at a "r g b" triplet custom property, not a hex string.
function withOpacity(varName) {
  return ({ opacityValue }) =>
    opacityValue !== undefined ? `rgb(var(${varName}) / ${opacityValue})` : `rgb(var(${varName}))`;
}

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Reads from the --color-*-rgb custom properties in index.css so
        // Tailwind classes and raw CSS never drift out of sync, and so
        // opacity modifiers (bg-teal/30, border-teal/50, ...) work — that
        // syntax requires this rgb(var(--x) / <alpha-value>) function form;
        // a plain var(--hex) reference can't be split into channels, so it
        // silently produces no opacity-variant utilities at all.
        bg: withOpacity('--color-bg-rgb'),
        ink: withOpacity('--color-text-rgb'),
        muted: withOpacity('--color-muted-rgb'),
        teal: {
          DEFAULT: withOpacity('--color-teal-rgb'),
          light: withOpacity('--color-teal-light-rgb'),
          dark: withOpacity('--color-teal-dark-rgb'),
        },
        coral: {
          DEFAULT: withOpacity('--color-pink-rgb'),
          light: withOpacity('--color-pink-light-rgb'),
          dark: withOpacity('--color-pink-dark-rgb'),
        },
        amber: {
          DEFAULT: withOpacity('--color-amber-rgb'),
        },
        'blue-glow': {
          DEFAULT: withOpacity('--color-blue-glow-rgb'),
        },
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        12: 'var(--space-12)',
        16: 'var(--space-16)',
        24: 'var(--space-24)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      transitionTimingFunction: {
        'out-expo': 'var(--ease-out-expo)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
      },
      backdropBlur: {
        glass: 'var(--glass-blur)',
      },
    },
  },
  plugins: [],
};
