/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          background: '#020617',
          surface: '#0f172a',
          border: '#1e293b',
          primary: '#2563eb',
          accent: '#3b82f6',
          success: '#10b981',
          danger: '#ef4444',
          warning: '#f59e0b',
          'text-primary': '#ffffff',
          'text-secondary': '#94a3b8',
          'text-muted': '#64748b',
        },
        primary: {
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        secondary: {
          500: '#3b82f6',
          600: '#2563eb',
        },
        slate: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        }
      },
      animation: {
        shake: 'shake 0.4s ease-in-out',
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
