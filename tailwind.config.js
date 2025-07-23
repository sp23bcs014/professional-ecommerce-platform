/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB', // blue-600
        secondary: '#F59E42', // amber-400
        accent: '#10B981', // emerald-500
        background: '#F9FAFB', // gray-50
        text: '#111827', // gray-900
      },
    },
  },
  plugins: [],
}

