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
        theme: {
          bg: '#0d1113',          // Page background
          panel: '#141a1d',       // Panels and cards
          surface: '#1a2327',     // Raised surface (inputs, hover)
          border: '#25323a',      // Borders and dividers
          text: '#d6e1e5',        // Main text
          muted: '#86989f',       // Muted text
          teal: '#2ec4b6',        // Primary accent
          tealTint: '#12312f',    // Teal background tint
          amber: '#f0a73a',       // REVIEW REQUIRED
          red: '#e5534b',         // HIGH RISK
          sample: '#8fb3c9',      // Sample location badge
          btnDark: '#0d1113',     // Dark text on accent buttons
        },
        bg: {
          deep: '#0d1113',
          primary: '#0d1113',
          card: '#141a1d',
          cardHover: '#1a2327',
          surface: '#1a2327',
        },
        border: {
          subtle: '#25323a',
          active: '#2ec4b6',
          accent: '#2ec4b6',
        },
        accent: {
          blue: '#2ec4b6',
          electric: '#2ec4b6',
          cyan: '#2ec4b6',
          teal: '#2ec4b6',
        },
        risk: {
          safe: '#2ec4b6',
          safeBg: '#12312f',
          safeBorder: '#2ec4b6',
          warning: '#f0a73a',
          warningBg: 'rgba(240, 167, 58, 0.15)',
          warningBorder: '#f0a73a',
          danger: '#e5534b',
          dangerBg: 'rgba(229, 83, 75, 0.15)',
          dangerBorder: '#e5534b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'glow-teal': '0 0 20px -3px rgba(46, 196, 182, 0.3)',
        'glow-red': '0 0 20px -3px rgba(229, 83, 75, 0.3)',
        'glow-amber': '0 0 20px -3px rgba(240, 167, 58, 0.3)',
      }
    },
  },
  plugins: [],
}
