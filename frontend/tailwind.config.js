/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "Segoe UI", "Helvetica Neue", "sans-serif"],
        display: ["Outfit", "Manrope", "Segoe UI", "sans-serif"],
      },
      colors: {
        campusOrange: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        neon: {
          pink: '#FF006E',
          purple: '#9D4EDD',
          blue: '#3A86FF',
          cyan: '#00D9FF',
          green: '#00FF88',
        },
      },
      boxShadow: {
        neon: '0 0 20px rgba(255, 0, 110, 0.3)',
        'neon-lg': '0 0 40px rgba(157, 78, 221, 0.4)',
        'neon-cyan': '0 0 30px rgba(0, 217, 255, 0.5)',
      },
      textShadow: {
        'neon-pink': '0 0 30px rgba(255, 0, 110, 0.5)',
        'neon-cyan': '0 0 30px rgba(0, 217, 255, 0.5)',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
      },
      animation: {
        blob: 'blob 7s infinite',
      },
    },
  },
  plugins: [],
}

