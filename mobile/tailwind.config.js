/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    '../shared/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      colors: {
        deepBlue: '#0A1128',
        navy: '#0A1128',
        electricBlue: '#3B82F6',
        gold: '#C5A059',
        goldLight: '#D4B87A',
        emerald: '#10B981',
        forest: '#1B4332',
        surface: '#F8F9FB',
        surfaceAlt: '#F3F6FA',
        premiumBorder: '#EDEDED',
        summus: {
          950: '#0A1128',
          900: '#0F1A35',
          800: '#152040',
          700: '#1E2A4A',
          600: '#2A3656',
        },
      },
      borderRadius: {
        card: '12px',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.05)',
        'card-md': '0 8px 32px rgba(10, 17, 40, 0.08)',
        'card-gold': '0 4px 20px rgba(197, 160, 89, 0.15)',
        premium: '0 4px 20px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
