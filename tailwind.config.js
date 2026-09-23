/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#080C15',
          card: '#0F172A',
          cardHover: '#131E35',
          border: '#1E293B',
          glowCyan: '#06B6D4',
          glowBlue: '#38BDF8',
          glowGreen: '#10B981',
          glowRed: '#F43F5E',
          glowAmber: '#F59E0B',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar': 'radar 2.5s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'scale(0.8)', opacity: '0.9' },
          '50%': { transform: 'scale(1.4)', opacity: '0.4' },
          '100%': { transform: 'scale(2.0)', opacity: '0' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 18px rgba(6, 182, 212, 0.85))' },
        }
      }
    },
  },
  plugins: [],
}
