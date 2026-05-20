/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        accent: {
          gold: '#d4af37',
          blue: '#2563eb'
        }
      },
      fontFamily: {
        sans: ['system-ui', 'ui-sans-serif', 'Inter', 'sans-serif']
      },
      boxShadow: {
        'soft-gold':
          '0 18px 45px rgba(212, 175, 55, 0.20)',
        glass:
          '0 20px 40px rgba(15, 23, 42, 0.75)'
      },
      backgroundImage: {
        'glass-gradient':
          'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,64,175,0.65))'
      }
    }
  },
  plugins: []
};

