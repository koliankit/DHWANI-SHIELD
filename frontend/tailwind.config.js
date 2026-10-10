/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: '#080c16',
          primary: '#0b1120',
          card: '#101a2e',
          cardHover: '#14213d',
          surface: '#162340',
        },
        border: {
          subtle: '#1b2842',
          active: '#273c64',
          accent: '#2563eb',
        },
        accent: {
          blue: '#2563eb',
          electric: '#3b82f6',
          cyan: '#06b6d4',
        },
        risk: {
          safe: '#10b981',
          safeBg: 'rgba(16, 185, 129, 0.12)',
          safeBorder: 'rgba(16, 185, 129, 0.3)',
          warning: '#f59e0b',
          warningBg: 'rgba(245, 158, 11, 0.12)',
          warningBorder: 'rgba(245, 158, 11, 0.3)',
          danger: '#ef4444',
          dangerBg: 'rgba(239, 68, 68, 0.12)',
          dangerBorder: 'rgba(239, 68, 68, 0.35)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'glow-blue': '0 0 20px -3px rgba(37, 99, 235, 0.25)',
        'glow-red': '0 0 20px -3px rgba(239, 68, 68, 0.25)',
        'glow-amber': '0 0 20px -3px rgba(245, 158, 11, 0.25)',
        'glow-green': '0 0 20px -3px rgba(16, 185, 129, 0.25)',
      }
    },
  },
  plugins: [],
}
