/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        slate: '#1E293B',
        conext: {
          blue: '#1652F0',
          'blue-soft': '#DCE5FE',
          mist: '#F8FAFC',
          hairline: '#E5E7EB',
          'hairline-2': '#D1D5DB',
          muted: '#6B7280',
          'muted-2': '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '20px',
      },
      boxShadow: {
        card: '0 16px 50px -20px rgba(10, 10, 10, 0.12)',
        frame: '0 30px 80px -30px rgba(10, 10, 10, 0.18)',
      },
    },
  },
  plugins: [],
}
