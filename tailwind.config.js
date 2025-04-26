/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0FE0FF', // Neon blue
        secondary: '#FF36F5', // Neon pink
        accent: '#14F195', // Neon green
        background: {
          dark: '#0B0E15', // Very dark blue-gray
          card: '#1A1E2A', // Dark blue-gray
        },
        text: {
          light: '#F4F7FD', // Off-white
          muted: '#828BAA', // Muted blue-gray
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Chakra Petch', 'sans-serif'],
      },
      boxShadow: {
        'neon-blue': '0 0 10px 1px rgba(15, 224, 255, 0.7)',
        'neon-pink': '0 0 10px 1px rgba(255, 54, 245, 0.7)',
        'neon-green': '0 0 10px 1px rgba(20, 241, 149, 0.7)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 5px 1px rgba(15, 224, 255, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 15px 3px rgba(15, 224, 255, 0.7)',
          },
        },
      },
    },
  },
  plugins: [],
} 