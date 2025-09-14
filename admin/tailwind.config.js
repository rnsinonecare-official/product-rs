/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          primary: '#667eea',
          secondary: '#764ba2',
          accent: '#f093fb',
          dark: '#2d3748',
          light: '#f7fafc'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
        'bounce-in': 'bounceIn 0.5s ease-in-out',
      }
    },
  },
  plugins: [],
}