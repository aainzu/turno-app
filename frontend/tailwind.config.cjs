/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.tsx",
    "./src/**/*.ts",
  ],
  theme: {
    extend: {
      colors: {
        turno: {
          manana: '#10b981', // emerald-500
          tarde: '#f59e0b',  // amber-500
          noche: '#3b82f6',  // blue-500
          vacaciones: '#ef4444', // red-500
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}