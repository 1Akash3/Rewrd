import type { Config } from 'tailwindcss';

// Tokens are driven by CSS variables (see src/app/globals.css) so the whole
// app can be re-themed by overriding variables. Palette = Rewrd design system.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
          fg: 'rgb(var(--brand-fg) / <alpha-value>)',
          soft: 'rgb(var(--brand-soft) / <alpha-value>)',
        },
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        warn: 'rgb(var(--warn) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        // accent palette
        red: 'rgb(var(--red) / <alpha-value>)',
        lime: 'rgb(var(--lime) / <alpha-value>)',
        citrine: 'rgb(var(--citrine) / <alpha-value>)',
        jade: 'rgb(var(--jade) / <alpha-value>)',
        orange: 'rgb(var(--orange) / <alpha-value>)',
        pink: 'rgb(var(--pink) / <alpha-value>)',
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
      boxShadow: {
        // signature hard offset shadows (ink #1A1A1B)
        hard: '4px 4px 0 #1A1A1B',
        'hard-sm': '3px 3px 0 #1A1A1B',
        'hard-lg': '6px 6px 0 #1A1A1B',
        'hard-brand': '3px 3px 0 #7C44BD',
        phone: '0 30px 70px rgba(60,20,90,0.35)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        head: ['var(--font-head)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
