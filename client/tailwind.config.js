/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        arena: {
          bg: '#0f172a',
          card: '#1e293b',
          boardLight: '#f0d9b5',
          boardDark: '#b58863',
          woodLight: '#e0c7a8',
          woodDark: '#8a5a36',
          oceanLight: '#d2e7ee',
          oceanDark: '#4d7c8a',
          emeraldLight: '#e3ecda',
          emeraldDark: '#628a50',
          midnightLight: '#94a3b8',
          midnightDark: '#334155',
          gold: '#f59e0b',
          accent: '#3b82f6',
          danger: '#ef4444',
          success: '#10b981'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
