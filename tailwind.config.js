/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Segoe UI', 'sans-serif'],
        display: ['Space Grotesk', 'Manrope', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bbdbff',
          300: '#8cc4ff',
          400: '#57a5ff',
          500: '#2f84f6',
          600: '#1667d9',
          700: '#1453b0',
          800: '#16478e',
          900: '#183d73',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd4',
          200: '#ffd6a9',
          300: '#ffb86f',
          400: '#ff9038',
          500: '#ff6f14',
          600: '#f0560a',
          700: '#c7420b',
          800: '#9d3511',
          900: '#7e2e12',
        },
      },
      boxShadow: {
        panel: '0 24px 70px -34px rgba(15, 23, 42, 0.45)',
        soft: '0 20px 45px -28px rgba(15, 23, 42, 0.28)',
      },
      backgroundImage: {
        'garage-grid':
          'linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.08) 1px, transparent 1px)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shine: 'shine 2.2s linear infinite',
      },
    },
  },
  plugins: [],
};

