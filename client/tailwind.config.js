/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f172a',
        card: '#111827',
        accent: { DEFAULT: '#f59e0b', light: '#fde68a', dark: '#d97706' },
        muted: '#94a3b8',
        success: '#22c55e',
        danger: '#ef4444',
        info: '#3b82f6',
        purple: '#a855f7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

